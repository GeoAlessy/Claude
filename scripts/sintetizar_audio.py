"""Sintetiza con código todos los efectos y la música del Ep. 01 (sin audio de internet).
Uso:  python3 scripts/sintetizar_audio.py
Salida: public/audio/sfx/*.wav  y  public/audio/musica/base_ep01.wav
"""
import os, wave
import numpy as np

SR = 44100
rng = np.random.default_rng(7)
RAIZ = os.path.join(os.path.dirname(__file__), '..', 'public', 'audio')


def guardar(nombre, x, sub='sfx'):
    x = np.asarray(x, dtype=np.float64)
    pico = np.max(np.abs(x)) or 1
    x = x / pico * 0.89  # -1 dBFS, sin saturar
    if x.ndim == 1:
        x = np.stack([x, x], axis=1)
    d = (x * 32767).astype(np.int16)
    ruta = os.path.join(RAIZ, sub, nombre)
    with wave.open(ruta, 'wb') as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(d.tobytes())
    print('ok', ruta, f'{len(x)/SR:.2f}s')


def t_(dur):
    return np.arange(int(dur * SR)) / SR


def biquad_bp(x, f0, q):
    """Pasa-banda (f0 puede ser un arreglo para barridos)."""
    f0 = np.broadcast_to(np.asarray(f0, dtype=float), x.shape)
    y = np.zeros_like(x)
    x1 = x2 = y1 = y2 = 0.0
    for i in range(len(x)):
        w0 = 2 * np.pi * f0[i] / SR
        alpha = np.sin(w0) / (2 * q)
        b0, b2 = alpha, -alpha
        a0, a1, a2 = 1 + alpha, -2 * np.cos(w0), 1 - alpha
        yi = (b0 * x[i] + b2 * x2 - a1 * y1 - a2 * y2) / a0
        x2, x1 = x1, x[i]
        y2, y1 = y1, yi
        y[i] = yi
    return y


def env(t, a, d):
    return np.minimum(t / max(a, 1e-4), 1) * np.exp(-np.maximum(t - a, 0) / d)


# ---------- EFECTOS ----------
def poof():
    t = t_(0.55)
    n = rng.standard_normal(len(t))
    sweep = 2500 * np.exp(-t * 6) + 300
    x = biquad_bp(n, sweep, 1.2) * env(t, 0.01, 0.13)
    thump = np.sin(2 * np.pi * (120 * np.exp(-t * 8) + 50) * t) * env(t, 0.003, 0.08)
    return x * 1.0 + thump * 0.6


def sacudida():
    t = t_(0.35)
    x = np.sin(2 * np.pi * (70 * np.exp(-t * 5) + 35) * t) * env(t, 0.002, 0.1)
    x += biquad_bp(rng.standard_normal(len(t)), 200, 0.8) * env(t, 0.002, 0.05) * 0.5
    return x


def tictac(dur=7.2, bpm=105):
    t = t_(dur)
    x = np.zeros_like(t)
    beat = 60 / bpm
    k = 0
    for start in np.arange(0, dur, beat):
        i = int(start * SR)
        tc = t_(0.05)
        f = 2600 if k % 2 == 0 else 1900
        click = np.sin(2 * np.pi * f * tc) * np.exp(-tc / 0.008)
        click += rng.standard_normal(len(tc)) * np.exp(-tc / 0.003) * 0.4
        x[i:i + len(tc)] += click[: len(x) - i]
        k += 1
    return x


def olla():
    t = t_(1.6)
    parciales = [(523, 1.0, 0.7), (1187, 0.7, 0.5), (1960, 0.5, 0.35), (2893, 0.35, 0.25), (4120, 0.25, 0.15)]
    x = sum(a * np.sin(2 * np.pi * f * t + rng.random() * 6) * np.exp(-t / d) for f, a, d in parciales)
    x *= 1 + 0.15 * np.sin(2 * np.pi * 6 * t)  # bamboleo metálico
    x += rng.standard_normal(len(t)) * np.exp(-t / 0.01) * 0.8
    return x


def destello():
    t = t_(1.3)
    x = np.zeros_like(t)
    for k, f in enumerate([1568, 2093, 2637, 3136, 4186]):
        d = int(k * 0.06 * SR)
        tt = t[: len(t) - d]
        x[d:] += np.sin(2 * np.pi * f * tt) * np.exp(-tt / 0.35) * 0.6 + np.sin(2 * np.pi * f * 2.01 * tt) * np.exp(-tt / 0.15) * 0.2
    x *= 0.6 + 0.4 * np.sin(2 * np.pi * 9 * t) ** 2
    return x


def ding():
    t = t_(2.2)
    f = 1318.5
    x = np.sin(2 * np.pi * f * t) * np.exp(-t / 0.7)
    x += 0.5 * np.sin(2 * np.pi * f * 2.76 * t) * np.exp(-t / 0.25)
    x += 0.25 * np.sin(2 * np.pi * f * 5.4 * t) * np.exp(-t / 0.1)
    x += 0.4 * np.sin(2 * np.pi * f / 2 * t) * np.exp(-t / 0.9)
    return x * env(t, 0.002, 10)


def whoosh():
    t = t_(0.32)
    n = rng.standard_normal(len(t))
    sweep = 400 + 3000 * (t / t[-1])
    e = np.sin(np.pi * t / t[-1]) ** 2
    return biquad_bp(n, sweep, 1.5) * e


def pop():
    t = t_(0.15)
    return np.sin(2 * np.pi * (300 + 900 * (1 - np.exp(-t * 40))) * t) * env(t, 0.002, 0.03)


def bling():
    """Contador −1 AÑO: blip ascendente brillante."""
    t = t_(0.5)
    x = np.zeros_like(t)
    for k, f in enumerate([988, 1319]):
        d = int(k * 0.07 * SR)
        tt = t[: len(t) - d]
        x[d:] += np.sign(np.sin(2 * np.pi * f * tt)) * 0.25 * np.exp(-tt / 0.12) + np.sin(2 * np.pi * f * tt) * np.exp(-tt / 0.2)
    return x


# ---------- MÚSICA (marimba + pizzicato, 105 BPM) ----------
def nota_marimba(f, dur, vel=1.0):
    t = t_(dur)
    x = np.sin(2 * np.pi * f * t) * np.exp(-t / 0.35)
    x += 0.35 * np.sin(2 * np.pi * f * 3.93 * t) * np.exp(-t / 0.06)
    x += 0.12 * np.sin(2 * np.pi * f * 9.2 * t) * np.exp(-t / 0.02)
    return x * env(t, 0.003, 10) * vel


def nota_pizz(f, dur, vel=1.0):
    t = t_(dur)
    x = np.sin(2 * np.pi * f * t) + 0.4 * np.sin(2 * np.pi * 2 * f * t) + 0.15 * np.sin(2 * np.pi * 3 * f * t)
    return x * env(t, 0.005, 0.22) * vel


def midi(n):
    return 440 * 2 ** ((n - 69) / 12)


def musica(dur=38.5, bpm=105):
    beat = 60 / bpm
    x = np.zeros(int(dur * SR) + SR * 2)

    def poner(sig, seg):
        i = int(seg * SR)
        x[i:i + len(sig)] += sig[: len(x) - i]

    # progresión: C  Am  F  G (un compás cada acorde)
    acordes = [[60, 64, 67], [57, 60, 64], [53, 57, 60], [55, 59, 62]]
    bajos = [36, 33, 29, 31]
    melodia = [76, 74, 72, 74, 76, 79, 76, None, 72, 74, 76, 72, 69, None, 67, 69,
               72, 69, 65, 67, 69, 72, 69, None, 71, 72, 74, 71, 67, None, 74, 71]
    nbeats = int(dur / beat)
    for b in range(nbeats):
        seg = b * beat
        compas = (b // 4) % 4
        emotivo = 20.0 <= seg < 28.0  # parte emotiva: sin percusión, más suave
        # bajo pizzicato en 1 y 3
        if b % 2 == 0:
            poner(nota_pizz(midi(bajos[compas]), 0.9, 0.9 if not emotivo else 0.6), seg)
        # acorde de marimba en corcheas (arpegio)
        ac = acordes[compas]
        for k in range(2):
            n = ac[(b * 2 + k) % 3]
            v = 0.35 if not emotivo else 0.25
            poner(nota_marimba(midi(n), 0.8, v), seg + k * beat / 2)
        # melodía
        if not emotivo or b % 2 == 0:
            m = melodia[(b * 2) % len(melodia)]
            m2 = melodia[(b * 2 + 1) % len(melodia)]
            if m:
                poner(nota_marimba(midi(m), 0.9, 0.55), seg)
            if m2 and not emotivo:
                poner(nota_marimba(midi(m2), 0.9, 0.45), seg + beat / 2)
        # shaker suave a contratiempo
        if not emotivo:
            tc = t_(0.06)
            sh = rng.standard_normal(len(tc)) * np.exp(-tc / 0.015) * 0.12
            poner(sh, seg + beat / 2)
    x = x[: int(dur * SR)]
    # fade in/out
    fi = int(0.05 * SR)
    fo = int(1.0 * SR)
    x[:fi] *= np.linspace(0, 1, fi)
    x[-fo:] *= np.linspace(1, 0, fo)
    # leve estéreo: retardo de 12 ms en el canal derecho
    d = int(0.012 * SR)
    r = np.concatenate([np.zeros(d), x[:-d]])
    return np.stack([x, r * 0.95], axis=1)


if __name__ == '__main__':
    os.makedirs(os.path.join(RAIZ, 'sfx'), exist_ok=True)
    os.makedirs(os.path.join(RAIZ, 'musica'), exist_ok=True)
    guardar('poof.wav', poof())
    guardar('sacudida.wav', sacudida())
    guardar('tictac.wav', tictac())
    guardar('olla.wav', olla())
    guardar('destello.wav', destello())
    guardar('ding.wav', ding())
    guardar('whoosh.wav', whoosh())
    guardar('pop.wav', pop())
    guardar('bling.wav', bling())
    guardar('base_ep01.wav', musica(), sub='musica')
