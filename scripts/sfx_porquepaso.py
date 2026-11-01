"""Efectos de sonido y fondo musical de "¿Por qué pasó?", sintetizados con código (sin licencias).
Uso:  python3 scripts/sfx_porquepaso.py
Salida: public/porquepaso/sfx/*.wav
"""
import os
import wave

import numpy as np

SR = 44100
rng = np.random.default_rng(11)
DIR = os.path.join(os.path.dirname(__file__), '..', 'public', 'porquepaso', 'sfx')
os.makedirs(DIR, exist_ok=True)


def t_(d):
    return np.arange(int(d * SR)) / SR


def env(n, a=0.005, r=0.2):
    e = np.ones(n)
    na, nr = int(a * SR), int(r * SR)
    if na:
        e[:na] = np.linspace(0, 1, na)
    if nr:
        e[-nr:] *= np.linspace(1, 0, nr) ** 2
    return e


def lp(x, k=8):
    return np.convolve(x, np.ones(k) / k, mode='same')


def guardar(nombre, x, pico=0.89):
    x = np.asarray(x, float)
    x = x / (np.max(np.abs(x)) or 1) * pico
    if x.ndim == 1:
        x = np.stack([x, x], 1)
    with wave.open(os.path.join(DIR, nombre), 'wb') as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((x * 32767).astype(np.int16).tobytes())
    print('ok', nombre, f'{len(x) / SR:.2f}s')


# Escaneo: barrido de frecuencia + ruido filtrado (transición al holograma)
t = t_(0.9)
f = np.linspace(300, 2400, len(t))
escaneo = 0.5 * np.sin(2 * np.pi * np.cumsum(f) / SR) * env(len(t), 0.02, 0.35)
escaneo += 0.35 * lp(rng.normal(0, 1, len(t)), 6) * np.linspace(0.2, 1, len(t)) * env(len(t), 0.05, 0.3)
guardar('escaneo.wav', escaneo)

# Whoosh grave para movimientos de cámara
t = t_(0.7)
w = lp(rng.normal(0, 1, len(t)), 30) * np.sin(np.pi * t / t[-1]) ** 2
guardar('whoosh.wav', w)

# Clic mecánico del sensor (dos transitorios + resonancia metálica)
t = t_(0.25)
clic = np.zeros(len(t))
for off, amp in [(0.0, 1.0), (0.012, 0.6)]:
    i = int(off * SR)
    n = len(t) - i
    clic[i:] += amp * rng.normal(0, 1, n) * np.exp(-t[:n] * 900)
clic += 0.4 * np.sin(2 * np.pi * 3100 * t) * np.exp(-t * 60) + 0.3 * np.sin(2 * np.pi * 5200 * t) * np.exp(-t * 90)
guardar('clic.wav', clic)

# Alarma / señal eléctrica: pitido pulsado que sube
t = t_(1.4)
pulsos = (np.sin(2 * np.pi * 9 * t) > 0).astype(float)
senal = 0.5 * np.sin(2 * np.pi * (880 + 300 * t) * t) * pulsos * env(len(t), 0.01, 0.2)
guardar('senal.wav', senal)

# Freno: golpe grave + chirrido corto
t = t_(0.9)
freno = np.sin(2 * np.pi * 55 * t) * np.exp(-t * 6) + 0.5 * lp(rng.normal(0, 1, len(t)), 3) * np.exp(-t * 18)
freno += 0.15 * np.sin(2 * np.pi * (1800 - 900 * t) * t) * np.exp(-t * 8)
guardar('freno.wav', freno)

# Motor que se apaga (zumbido que baja)
t = t_(1.2)
fm = np.linspace(120, 30, len(t))
motor = (np.sin(2 * np.pi * np.cumsum(fm) / SR) + 0.4 * np.sin(4 * np.pi * np.cumsum(fm) / SR)) * np.linspace(1, 0, len(t)) ** 1.5
guardar('motor_apagado.wav', motor)

# Confirmación positiva (verde)
t = t_(0.6)
ok = sum(np.sin(2 * np.pi * fr * t) * np.exp(-t * 7) for fr in (1046.5, 1568))
ok[int(0.09 * SR):] += 0.8 * np.sin(2 * np.pi * 2093 * t[: len(t) - int(0.09 * SR)]) * np.exp(-t[: len(t) - int(0.09 * SR)] * 7)
guardar('confirmacion.wav', ok)

# Golpe de impacto para el congelado ("¿Sabotaje?")
t = t_(1.6)
impacto = np.sin(2 * np.pi * 45 * t) * np.exp(-t * 3) + 0.6 * lp(rng.normal(0, 1, len(t)), 40) * np.exp(-t * 4)
guardar('impacto.wav', impacto)

# Fondo musical: pad oscuro + pulso suave (45 s), tono de investigación
dur = 45
t = t_(dur)
base = 0
for fr, a in [(55, 0.5), (82.4, 0.35), (110, 0.25), (164.8, 0.12), (220, 0.08)]:
    base = base + a * np.sin(2 * np.pi * fr * t + 2 * np.sin(2 * np.pi * 0.07 * t))
latido = np.zeros(len(t))
bpm = 96
for k in np.arange(0, dur, 60 / bpm):
    i = int(k * SR)
    n = min(int(0.35 * SR), len(t) - i)
    latido[i : i + n] += np.sin(2 * np.pi * 60 * t[:n]) * np.exp(-t[:n] * 14)
arpegio = np.zeros(len(t))
notas = [440, 523.25, 659.25, 587.33]
paso = 60 / bpm / 2
for j, k in enumerate(np.arange(0, dur, paso)):
    i = int(k * SR)
    n = min(int(paso * SR), len(t) - i)
    arpegio[i : i + n] += 0.08 * np.sin(2 * np.pi * notas[j % 4] * t[:n]) * np.exp(-t[:n] * 9)
musica = (0.5 * base + 0.6 * latido + arpegio) * env(len(t), 1.5, 2.5)
izq = musica + 0.02 * lp(rng.normal(0, 1, len(t)), 50)
der = np.roll(musica, int(0.012 * SR)) + 0.02 * lp(rng.normal(0, 1, len(t)), 50)
guardar('fondo_investigacion.wav', np.stack([izq, der], 1), pico=0.7)
