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

# Transición suave y limpia (reemplaza al whoosh): barrido tonal + aire filtrado + cola corta
t = t_(0.9)
dur_n = int(0.5 * SR)
tt = t[:dur_n]
forma = np.sin(np.pi * tt / tt[-1]) ** 2
tono = np.sin(2 * np.pi * np.cumsum(np.linspace(380, 760, dur_n)) / SR) * forma
tono += 0.3 * np.sin(2 * np.pi * np.cumsum(np.linspace(760, 1520, dur_n)) / SR) * forma
espectro = np.fft.rfft(rng.normal(0, 1, dur_n))
frecs = np.fft.rfftfreq(dur_n, 1 / SR)
espectro[(frecs < 2500) | (frecs > 7000)] = 0
aire = np.fft.irfft(espectro, dur_n) * forma
aire = aire / (np.max(np.abs(aire)) or 1) * 0.18
seco = np.zeros(len(t))
seco[:dur_n] = 0.6 * tono / np.max(np.abs(tono)) + aire
ir = rng.normal(0, 1, int(0.35 * SR)) * np.exp(-np.linspace(0, 8, int(0.35 * SR)))
cola = np.convolve(seco, ir)[: len(t)]
transicion = seco + 0.18 * cola / (np.max(np.abs(cola)) or 1)
transicion *= env(len(t), 0.01, 0.3)
guardar('transicion.wav', transicion, pico=0.7)

# Riser: tensión que sube ~1 s y corta en seco (antes de "¿SABOTAJE?" y del clic)
t = t_(1.1)
f_r = np.linspace(200, 1400, len(t)) ** 1.0
riser = 0.5 * np.sin(2 * np.pi * np.cumsum(f_r) / SR) * np.linspace(0, 1, len(t)) ** 2.2
esp = np.fft.rfft(rng.normal(0, 1, len(t)))
fr_ = np.fft.rfftfreq(len(t), 1 / SR)
esp[(fr_ < 1500) | (fr_ > 9000)] = 0
ruido = np.fft.irfft(esp, len(t))
riser += 0.35 * ruido / (np.max(np.abs(ruido)) or 1) * np.linspace(0, 1, len(t)) ** 3
riser[-int(0.02 * SR):] *= np.linspace(1, 0, int(0.02 * SR))
guardar('riser.wav', riser, pico=0.6)

# ---------------------------------------------------------------------
# Música v2 "curiosidad": La menor, Am–F–C–G a 100 bpm, piano eléctrico (FM)
# + arpegio con eco + bajo suave + pulso ligero. Pensada para ir muy baja bajo la voz.
# ---------------------------------------------------------------------
def nota(n):  # número MIDI → Hz
    return 440 * 2 ** ((n - 69) / 12)


def epiano(fr, d, vel=1.0):
    t = t_(d)
    mod = 1.8 * np.exp(-t * 6) * np.sin(2 * np.pi * fr * 1.0 * t)
    x = np.sin(2 * np.pi * fr * t + mod) * np.exp(-t * 1.6) + 0.25 * np.sin(2 * np.pi * fr * 2 * t) * np.exp(-t * 4)
    return vel * x * env(len(t), 0.004, min(0.3, d * 0.4))


def pulsar(fr, d):
    t = t_(d)
    x = np.sin(2 * np.pi * fr * t) * np.exp(-t * 9) + 0.3 * np.sin(2 * np.pi * fr * 3 * t) * np.exp(-t * 16)
    return x * env(len(t), 0.002, 0.05)


def poner(pista, x, seg, ganancia=1.0):
    i = int(seg * SR)
    if i >= len(pista):
        return
    n = min(len(x), len(pista) - i)
    pista[i : i + n] += ganancia * x[:n]


DUR_M = 46
BPM = 100
TIEMPO = 60 / BPM
COMPAS = 4 * TIEMPO
N = int(DUR_M * SR)
L = np.zeros(N)
R = np.zeros(N)
acordes = [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]]  # Am F C G
bajos = [45, 41, 48, 43]
arpe_pat = [0, 1, 2, 1, 2, 0, 1, 2]
k = 0
c = 0
while c * COMPAS < DUR_M:
    ac = acordes[c % 4]
    base = c * COMPAS
    # Piano eléctrico: acorde en el 1 y empuje suave en el "y" del 3
    for i, n in enumerate(ac):
        s = epiano(nota(n), COMPAS * 0.95, 0.35)
        poner(L, s, base + 0.006 * i, 1.0 - 0.15 * i)
        poner(R, s, base + 0.006 * i, 0.7 + 0.15 * i)
        poner(L, epiano(nota(n), TIEMPO * 1.4, 0.15), base + 2.5 * TIEMPO)
        poner(R, epiano(nota(n), TIEMPO * 1.4, 0.15), base + 2.5 * TIEMPO)
    # Bajo redondo
    tb = t_(COMPAS)
    bajo = np.sin(2 * np.pi * nota(bajos[c % 4] - 12) * tb) * env(len(tb), 0.02, 0.3) * 0.5
    poner(L, bajo, base)
    poner(R, bajo, base)
    # Arpegio en corcheas (desde el compás 2) con eco estéreo
    if c >= 1:
        for j in range(8):
            fr = nota(ac[arpe_pat[j]] + 12)
            p = pulsar(fr, TIEMPO * 0.9) * 0.12
            seg = base + j * TIEMPO / 2
            poner(L, p, seg)
            poner(R, p, seg, 0.6)
            poner(R, p, seg + TIEMPO * 0.75, 0.35)
            poner(L, p, seg + TIEMPO * 1.5, 0.18)
    # Pulso: bombo suave en 1 y 3, hat ligero en contratiempos (desde el compás 2)
    if c >= 1:
        for b in (0, 2):
            tk = t_(0.35)
            bombo = np.sin(2 * np.pi * np.cumsum(np.linspace(110, 45, len(tk))) / SR) * np.exp(-tk * 12) * 0.5
            poner(L, bombo, base + b * TIEMPO)
            poner(R, bombo, base + b * TIEMPO)
        for b in range(4):
            th = t_(0.06)
            hat = np.diff(rng.normal(0, 1, len(th) + 1)) * np.exp(-th * 70) * 0.05
            poner(L, hat, base + (b + 0.5) * TIEMPO, 0.7)
            poner(R, hat, base + (b + 0.5) * TIEMPO)
    c += 1
mus = np.stack([L, R], 1) * env(N, 0.8, 2.0)[:, None]
guardar('fondo_curiosidad.wav', mus, pico=0.8)
