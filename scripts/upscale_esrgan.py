"""Escala video con Real-ESRGAN (realesr-general-x4v3) sin PyTorch.

Lee los pesos .pth (formato zip de PyTorch) con un unpickler mínimo,
arma la red SRVGGNetCompact en ONNX y la ejecuta con ONNX Runtime en CPU.

Uso:
  python3 scripts/upscale_esrgan.py PESOS.pth ENTRADA_DIR SALIDA_DIR [--alto 1920]

ENTRADA_DIR: PNGs (p. ej. extraídos con ffmpeg). Cada uno se escala x4 y
luego se reduce con Lanczos hasta el alto pedido.
"""
import argparse
import os
import pickle
import subprocess
import sys
import zipfile

import numpy as np
import onnx
import onnxruntime as ort
from onnx import TensorProto, helper, numpy_helper


# ---------- lectura de .pth sin torch ----------
class _Storage:
    def __init__(self, key, dtype):
        self.key, self.dtype = key, dtype


_DTYPES = {"FloatStorage": np.float32, "HalfStorage": np.float16}


def _rebuild_tensor(storage, offset, size, stride, *args):
    return ("tensor", storage, offset, tuple(size), tuple(stride))


class _Unpickler(pickle.Unpickler):
    def find_class(self, module, name):
        if module == "torch._utils" and name in ("_rebuild_tensor_v2", "_rebuild_tensor"):
            return _rebuild_tensor
        if module == "torch" and name in _DTYPES:
            return name
        if module == "collections" and name == "OrderedDict":
            import collections
            return collections.OrderedDict
        raise pickle.UnpicklingError(f"Clase no permitida: {module}.{name}")

    def persistent_load(self, pid):
        _, storage_type, key, _location, _numel = pid
        return _Storage(key, _DTYPES[storage_type])


def cargar_pth(ruta):
    z = zipfile.ZipFile(ruta)
    raiz = z.namelist()[0].split("/")[0]
    obj = _Unpickler(z.open(f"{raiz}/data.pkl")).load()
    if isinstance(obj, dict):
        for k in ("params_ema", "params"):
            if k in obj:
                obj = obj[k]
                break
    pesos = {}
    for nombre, (_, st, off, size, stride) in obj.items():
        buf = np.frombuffer(z.read(f"{raiz}/data/{st.key}"), dtype=st.dtype)
        arr = np.lib.stride_tricks.as_strided(
            buf[off:], shape=size, strides=[s * buf.itemsize for s in stride]
        )
        pesos[nombre] = np.ascontiguousarray(arr, dtype=np.float32)
    return pesos


# ---------- red SRVGGNetCompact en ONNX ----------
def construir_onnx(pesos, escala=4):
    idx = sorted({int(k.split(".")[1]) for k in pesos})
    nodos, inits = [], []
    x = "entrada"
    for i in idx:
        w = pesos.get(f"body.{i}.weight")
        b = pesos.get(f"body.{i}.bias")
        if b is not None:  # convolución
            inits += [numpy_helper.from_array(w, f"w{i}"), numpy_helper.from_array(b, f"b{i}")]
            nodos.append(helper.make_node("Conv", [x, f"w{i}", f"b{i}"], [f"y{i}"], pads=[1, 1, 1, 1]))
        else:  # PReLU
            inits.append(numpy_helper.from_array(w.reshape(-1, 1, 1), f"a{i}"))
            nodos.append(helper.make_node("PRelu", [x, f"a{i}"], [f"y{i}"]))
        x = f"y{i}"
    nodos.append(helper.make_node("DepthToSpace", [x], ["ps"], blocksize=escala, mode="CRD"))
    inits.append(numpy_helper.from_array(np.array([1, 1, escala, escala], np.float32), "sc"))
    nodos.append(helper.make_node("Resize", ["entrada", "", "sc"], ["base"], mode="nearest"))
    nodos.append(helper.make_node("Add", ["ps", "base"], ["salida"]))
    g = helper.make_graph(
        nodos, "srvgg",
        [helper.make_tensor_value_info("entrada", TensorProto.FLOAT, [1, 3, None, None])],
        [helper.make_tensor_value_info("salida", TensorProto.FLOAT, [1, 3, None, None])],
        inits,
    )
    m = helper.make_model(g, opset_imports=[helper.make_opsetid("", 17)])
    m.ir_version = 8
    return m.SerializeToString()


def leer_png(ruta):
    out = subprocess.run(
        ["ffmpeg", "-v", "error", "-i", ruta, "-f", "rawvideo", "-pix_fmt", "rgb24", "-"],
        capture_output=True, check=True,
    ).stdout
    dims = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "stream=width,height", "-of", "csv=p=0", ruta],
        capture_output=True, text=True, check=True,
    ).stdout.strip().split(",")
    w, h = int(dims[0]), int(dims[1])
    return np.frombuffer(out, np.uint8).reshape(h, w, 3)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("pesos")
    ap.add_argument("entrada")
    ap.add_argument("salida")
    ap.add_argument("--alto", type=int, default=1920)
    a = ap.parse_args()

    sess = ort.InferenceSession(construir_onnx(cargar_pth(a.pesos)), providers=["CPUExecutionProvider"])
    os.makedirs(a.salida, exist_ok=True)
    archivos = sorted(f for f in os.listdir(a.entrada) if f.endswith(".png"))
    for n, f in enumerate(archivos, 1):
        img = leer_png(os.path.join(a.entrada, f)).astype(np.float32) / 255.0
        y = sess.run(None, {"entrada": img.transpose(2, 0, 1)[None]})[0][0]
        y = (np.clip(y.transpose(1, 2, 0), 0, 1) * 255 + 0.5).astype(np.uint8)
        h, w = y.shape[:2]
        subprocess.run(
            ["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{w}x{h}", "-i", "-",
             "-vf", f"scale=-2:{a.alto}:flags=lanczos", os.path.join(a.salida, f)],
            input=y.tobytes(), check=True,
        )
        print(f"{n}/{len(archivos)} {f}", file=sys.stderr, flush=True)


if __name__ == "__main__":
    main()
