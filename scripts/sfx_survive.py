"""Efectos y música de fondo de "Could You Survive It?", sintetizados con código (sin licencias).
Uso:  python3 scripts/sfx_survive.py
Salida: public/survive/sfx/*.wav
"""
import os
import wave

import numpy as np

SR = 44100
rng = np.random.default_rng(7)
DIR = os.path.join(os.path.dirname(__file__), '..', 'public', 'survive', 'sfx')
os.makedirs(DIR, exist_ok=True)


def t_(d):
    return np.arange(int(d * SR)) / SR


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
    print('ok', nombre)


def banda(x, lo, hi):
    """Filtro pasa banda por FFT (suficiente para efectos)."""
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    X[(f < lo) | (f > hi)] = 0
    return np.fft.irfft(X, len(x))


# Plumón rayando: ruido con trazos rápidos
d = 0.45
t = t_(d)
trazos = np.clip(np.sin(2 * np.pi * 11 * t) * 1.4, 0, 1) ** 0.6
x = banda(rng.standard_normal(len(t)), 1800, 7000) * trazos * np.minimum(1, (d - t) * 12)
guardar('plumon.wav', x, 0.5)

# Sello de goma: golpe grave + chasquido
t = t_(0.5)
x = np.sin(2 * np.pi * (90 - 40 * t) * t) * np.exp(-t * 14)
x += banda(rng.standard_normal(len(t)), 300, 3000) * np.exp(-t * 60) * 0.8
guardar('sello.wav', x)

# Pop: burbuja que sube
t = t_(0.12)
x = np.sin(2 * np.pi * (500 + 2600 * t / 0.12) * t) * np.exp(-t * 30)
guardar('pop.wav', x, 0.6)

# Golpe seco de caricatura (bonk)
t = t_(0.35)
x = np.sin(2 * np.pi * 180 * t * np.exp(-t * 6)) * np.exp(-t * 18)
x += banda(rng.standard_normal(len(t)), 80, 900) * np.exp(-t * 40) * 1.2
guardar('bonk.wav', x)

# Whoosh corto para cortes
t = t_(0.28)
env = np.sin(np.pi * t / 0.28) ** 2
x = np.zeros(len(t))
ruido = rng.standard_normal(len(t))
for i, lo in enumerate(np.linspace(400, 3000, 8)):
    seg = slice(i * len(t) // 8, (i + 1) * len(t) // 8)
    x[seg] = banda(ruido, lo, lo * 2.2)[seg]
guardar('swish.wav', x * env, 0.5)

# Ding (dato clave)
t = t_(0.6)
x = (np.sin(2 * np.pi * 1318.5 * t) + 0.5 * np.sin(2 * np.pi * 2637 * t)) * np.exp(-t * 7)
guardar('ding.wav', x, 0.5)

# ---------- Música: base rítmica juguetona, 124 bpm, 40 s ----------
BPM = 124
beat = 60 / BPM
dur = 40.0
n = int(dur * SR)
mix = np.zeros(n)


def poner(x, seg, vol=1.0):
    i = int(seg * SR)
    if i >= n:
        return
    j = min(n, i + len(x))
    mix[i:j] += x[: j - i] * vol


tk = t_(0.35)
bombo = np.sin(2 * np.pi * (55 + 90 * np.exp(-tk * 30)) * tk) * np.exp(-tk * 9)
tc = t_(0.2)
palma = banda(rng.standard_normal(len(tc)), 900, 5000) * np.exp(-tc * 25)
th = t_(0.05)
hat = banda(rng.standard_normal(len(th)), 6000, 14000) * np.exp(-th * 90)
# bajo pizzicato (escala pentatónica en La menor)
notas = [45, 45, 52, 48, 45, 45, 55, 52]  # MIDI
tb = t_(beat * 0.9)


def pluck(midi, vol=1.0):
    f = 440 * 2 ** ((midi - 69) / 12)
    return (np.sin(2 * np.pi * f * tb) + 0.3 * np.sin(4 * np.pi * f * tb)) * np.exp(-tb * 7) * vol


tm = t_(beat * 0.45)


def marimba(midi):
    f = 440 * 2 ** ((midi - 69) / 12)
    return (np.sin(2 * np.pi * f * tm) + 0.15 * np.sin(2 * np.pi * 4 * f * tm)) * np.exp(-tm * 16)


melodia = [69, 72, 76, 74, 72, 69, 67, 69, 72, 74, 76, 79, 76, 74, 72, None]
compases = int(dur / (beat * 4))
for c in range(compases):
    base = c * beat * 4
    for b in range(4):
        tb0 = base + b * beat
        poner(bombo, tb0, 0.9)
        if b in (1, 3):
            poner(palma, tb0, 0.35)
        poner(hat, tb0 + beat / 2, 0.25)
        poner(hat, tb0, 0.12)
        poner(pluck(notas[(c * 4 + b) % len(notas)] - 12 + 12), tb0, 0.45)
    if c % 2 == 1:  # melodía cada dos compases, para no tapar la voz
        for k in range(8):
            m = melodia[(c * 8 + k) % len(melodia)]
            if m:
                poner(marimba(m), base + k * beat / 2, 0.18)
guardar('musica.wav', mix, 0.8)
