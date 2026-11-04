"""Recorta a Homero de un cuadro de los Simpsons usando los colores planos de la caricatura.

Idea: la animación está hecha de zonas de color separadas por líneas negras.
1. Se separan las zonas (todo lo que no es línea oscura) y se etiquetan.
2. Cada zona se clasifica por su color medio: piel, camisa, pantalón, zapato…
3. Desde uno o más puntos semilla (sobre Homero) se van sumando las zonas vecinas
   que tienen colores de Homero. El cielo (enorme y tocando el borde) nunca entra.
4. Se agregan las líneas negras que quedan entre esas zonas y se suaviza el borde.

Uso como módulo: mascara(img_rgb_uint8, semillas=[(x, y), ...]) -> máscara bool
Uso por consola: python3 scripts/recortar_homero.py ENTRADA.png SALIDA.png x,y [x,y ...]
"""
import sys

import numpy as np
from scipy import ndimage as ndi


def clase(c):
    r, g, b = c
    if r < 25 and 70 < g < 110 and 145 < b < 195:
        return 'cielo'
    if 15 <= r < 95 and 60 < g < 130 and b > 180 and b - r > 110:
        return 'pantalon'
    if r > 140 and g > 190 and b > 185:
        return 'camisa'
    if r > 195 and g > 150 and b < 140 and g / r > 0.72:
        return 'piel'
    if 120 < r < 200 and 115 < g < 185 and 40 < b < 125 and g / r > 0.82:
        return 'barba'
    if r < 70 and g < 80 and b < 95:
        return 'oscuro'
    return 'otro'


DE_HOMERO = {'pantalon', 'camisa', 'piel', 'barba', 'oscuro'}


def mascara(img, semillas, max_pasos=12):
    h, w = img.shape[:2]
    lum = img.astype(np.float32) @ np.array([0.299, 0.587, 0.114], np.float32)
    linea = lum < 45
    etiquetas, n = ndi.label(~linea)
    idx = np.arange(1, n + 1)
    area = ndi.sum(np.ones((h, w)), etiquetas, idx)
    medias = np.stack([ndi.mean(img[..., k], etiquetas, idx) for k in range(3)], 1)
    borde = np.zeros(n + 1, bool)
    for fila in (etiquetas[0], etiquetas[-1], etiquetas[:, 0], etiquetas[:, -1]):
        borde[np.unique(fila)] = True
    valido = np.zeros(n + 1, bool)
    for i in range(1, n + 1):
        c = clase(medias[i - 1])
        a = area[i - 1]
        if c in DE_HOMERO and not (borde[i] and a > 0.12 * h * w):
            valido[i] = True
    # zonas semilla
    dentro = np.zeros(n + 1, bool)
    for x, y in semillas:
        lab = etiquetas[min(h - 1, int(y)), min(w - 1, int(x))]
        if lab:
            dentro[lab] = True
    # crecer: zonas válidas que tocan (a través de una línea negra) a las de dentro
    grosor = np.ones((9, 9), bool)
    for _ in range(max_pasos):
        actual = dentro[etiquetas]
        vecinos = ndi.binary_dilation(actual, grosor)
        nuevos = np.unique(etiquetas[vecinos & ~actual])
        nuevos = nuevos[(nuevos > 0) & valido[nuevos] & ~dentro[nuevos]]
        if len(nuevos) == 0:
            break
        dentro[nuevos] = True
    m = dentro[etiquetas]
    # cerrar: incluye las líneas negras entre las zonas y los huecos internos
    m = ndi.binary_closing(m, np.ones((11, 11), bool))
    m = ndi.binary_fill_holes(m)
    m = m | (ndi.binary_dilation(m, np.ones((7, 7), bool)) & linea)
    return m


if __name__ == '__main__':
    from PIL import Image

    img = np.asarray(Image.open(sys.argv[1]).convert('RGB'))
    sem = [tuple(map(float, s.split(','))) for s in sys.argv[3:]]
    m = mascara(img, sem)
    Image.fromarray((m * 255).astype(np.uint8)).save(sys.argv[2])
