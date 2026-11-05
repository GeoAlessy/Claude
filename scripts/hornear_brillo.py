"""Hornea el brillo del recorte (delineado blanco + halo amarillo) en PNGs, para no calcular
5 drop-shadow CSS por cuadro (≈3,5 s/cuadro en 1080p).
Uso: hornear_brillo.py recorte.png salida_base  [--escala 1.45]
Genera salida_base_linea.png (Homero + delineado blanco) y salida_base_halo.png (solo halo)."""
import argparse
import numpy as np
from PIL import Image
from scipy.ndimage import gaussian_filter

ap = argparse.ArgumentParser()
ap.add_argument('recorte'); ap.add_argument('salida')
ap.add_argument('--escala', type=float, default=1.45)  # px de imagen por px CSS
ap.add_argument('--ganancia', type=float, default=2.2)  # intensidad del halo (Chrome lo pinta más denso)
a = ap.parse_args()

img = np.asarray(Image.open(a.recorte).convert('RGBA')).astype(np.float32) / 255
rgb, al = img[..., :3] * img[..., 3:], img[..., 3]  # premultiplicado

def sombra(rgbp, alfa, r_css, color):
    s = gaussian_filter(alfa, sigma=r_css / 2 * a.escala)
    s = np.clip(s * (a.ganancia if color != (1, 1, 1) else 1), 0, 1)
    col = np.array(color, np.float32)
    # la sombra va DEBAJO: resultado = arriba + sombra*(1-alfa_arriba)
    return rgbp + (s[..., None] * col) * (1 - alfa[..., None]), alfa + s * (1 - alfa)

for _ in range(3):
    rgb, al = sombra(rgb, al, 3, (1, 1, 1))
linea_rgb, linea_al = rgb.copy(), al.copy()
AM = (0xFF / 255, 0xD9 / 255, 0x0F / 255)
glow = 38
rgb, al = sombra(rgb, al, glow, AM)
rgb, al = sombra(rgb, al, glow * 1.6, AM)
# halo = solo lo que añaden los dos amarillos (sin la línea)
halo_al = np.clip(al - linea_al, 0, 1)
halo_rgb = rgb - linea_rgb

def guardar(rgbp, alfa, ruta):
    c = np.where(alfa[..., None] > 1e-4, rgbp / np.maximum(alfa[..., None], 1e-4), 0)
    out = np.concatenate([np.clip(c, 0, 1), np.clip(alfa, 0, 1)[..., None]], -1)
    Image.fromarray((out * 255 + 0.5).astype(np.uint8)).save(ruta)

guardar(linea_rgb, linea_al, a.salida + '_linea.png')
guardar(halo_rgb, halo_al, a.salida + '_halo.png')
print('ok')
