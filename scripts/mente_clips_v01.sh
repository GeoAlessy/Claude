#!/usr/bin/env bash
# Descarga (archive.org, dominio público) y corta los planos del vídeo 01 del canal "mente".
# Uso: bash scripts/mente_clips_v01.sh   → deja los clips en public/mente/clips/
set -euo pipefail
S=clips_fuente; D=public/mente/clips; mkdir -p "$S" "$D"
bajar(){ [ -f "$S/$1" ] || curl -sSL -o "$S/$1" "$2"; }
bajar safety_last.mp4 "https://archive.org/download/safety-last-1923-silent-film-noir-comedy-short/Safety%20Last%20%281923%20Silent%2C%20Film%20noir%2C%20Comedy%2C%20Short%29.mp4"
bajar sleep_for_health_1950.mp4 "https://archive.org/download/Sleepfor1950/Sleepfor1950.mp4"
bajar the_city_1939.mp4 "https://archive.org/download/CityTheP1939/CityTheP1939.mp4"
bajar american_look_1958.mp4 "https://archive.org/download/American1958/American1958.mp4"
cortar(){ ffmpeg -loglevel error -y -ss "$2" -i "$S/$1.mp4" -t "$3" -an -vf "scale=1440:1080:flags=lanczos,setsar=1,fps=30" -c:v libx264 -crf 18 -pix_fmt yuv420p "$D/$4.mp4"; }
cortar_ancho(){ ffmpeg -loglevel error -y -ss "$2" -i "$S/$1.mp4" -t "$3" -an -vf "crop=iw:ih*0.54:0:ih*0.215,scale=1920:-2:flags=lanczos,setsar=1,fps=30" -c:v libx264 -crf 18 -pix_fmt yuv420p "$D/$4.mp4"; }
cortar the_city_1939 13:13 4 c01_oficina_filas
cortar the_city_1939 13:03 3 c02_maquina_escribir
cortar_ancho american_look_1958 1:54 4 c03_ninos_juguetes
cortar_ancho american_look_1958 2:03 4 c04_nino_dibujando
cortar the_city_1939 12:53 3 c06_multitud
# Safety Last! en escaneo 1080p (archive.org/details/safety-last-1923): se lee por HTTP solo el tramo necesario
SL=$(curl -sS -o /dev/null -w '%{redirect_url}' "https://archive.org/download/safety-last-1923/safety%20last%201923.mp4")
PX=(); [ -n "${HTTPS_PROXY:-}" ] && PX=(-http_proxy "$HTTPS_PROXY" -ca_file /root/.ccr/ca-bundle.crt)
cortar_hd(){ ffmpeg -loglevel error -y "${PX[@]}" -ss "$2" -i "$1" -t "$3" -an -vf "crop=1440:1080:240:0,setsar=1,fps=30" -c:v libx264 -crf 14 -preset slow -pix_fmt yuv420p "$D/$4.mp4"; }
cortar_hd "$SL" 3972 5 c07_reloj
cortar_hd "$SL" 3893 4 c08_colgado
cortar sleep_for_health_1950 4:08 4 c09_dormir
cortar the_city_1939 12:19 4 c10_rascacielos
cortar sleep_for_health_1950 0:45 4 c11_ojos_cerrados
echo "Clips listos en $D"

# ---- Minuto 1 en HD: masters de Prelinger (por HTTP, solo el tramo) + stock 1080p de Mixkit ----
url(){ curl -sS -o /dev/null -w '%{redirect_url}' "https://archive.org/download/$1/$2"; }
hd169(){ ffmpeg -loglevel error -y "${PX[@]}" -ss "$2" -i "$1" -t "$3" -an -vf "crop=iw-${6:-0}*2:(iw-${6:-0}*2)*9/16:${6:-0}:(ih-(iw-${6:-0}*2)*9/16)*${5:-0.5},scale=1920:1080:flags=lanczos${7:+,$7},setsar=1,fps=30" -c:v libx264 -crf 16 -preset slow -pix_fmt yuv420p "$D/$4.mp4"; }
U1=$(url HMFamilyHolidayand97317 97317.mov); U2=$(url HomeMoviePA097836 HomeMovie_PA097836.mov); U3=$(url IA35000011001_201710 IA_35000011_001.mov)
hd169 "$U1" 30 3.8 h01_columpio 0.35 0 "eq=gamma=1.45:brightness=0.03:saturation=1.1"
hd169 "$U1" 214 3 h02_nina_corriendo 0.5
hd169 "$U2" 461 3.2 h03_tarta_cumple 0.5 240
hd169 "$U3" 17 4 h04_manhattan_cruce 0.55
hd169 "$U3" 238.5 4 h05_manhattan_multitud 0.55
mk(){ curl -sS -o "$S/mk_$1.mp4" "https://assets.mixkit.co/videos/$1/$1-1080.mp4"; ffmpeg -loglevel error -y -ss "$3" -i "$S/mk_$1.mp4" -t "$4" -an -vf "scale=1920:1080:flags=lanczos,setsar=1,fps=30" -c:v libx264 -crf 16 -preset slow -pix_fmt yuv420p "$D/$2.mp4"; sleep 2; }
mk 918 s01_oficina 2 4; mk 31414 s02_inquieto_cama 0 3; mk 4185 s04_festival 0 4
mk 1105 s05_cueva 5 3.5; mk 42981 s06_dormir_noche 1 3; mk 221 s07_pantalla_gafas 2 3.5
echo "Clips HD listos en $D"

# --- añadidos: rótulo de capítulo (relojes 4K, Pixabay) y ventana de la prueba (Mixkit) ---
[ -f "$S/px_68062.mp4" ] || curl -sS -o "$S/px_68062.mp4" "https://cdn.pixabay.com/video/2021/03/15/68062-524689341_large.mp4"
ffmpeg -loglevel error -y -i "$S/px_68062.mp4" -an -vf "scale=1920:1080:flags=lanczos,fps=30" -c:v libx264 -crf 16 -preset slow -pix_fmt yuv420p "$D/s08_relojes_antiguos.mp4"
curl -sS -o "$S/mk_32635.mp4" "https://assets.mixkit.co/videos/32635/32635-1080.mp4"   # vertical 1080×1920: recorte 16:9 de la cara
ffmpeg -loglevel error -y -i "$S/mk_32635.mp4" -an -vf "crop=1080:608:0:110,scale=760:428:flags=lanczos,fps=30" -c:v libx264 -crf 15 -pix_fmt yuv420p "$D/s09_ojos_mano_pecho_v.mp4"
curl -sS -o "$S/mk_42904.mp4" "https://assets.mixkit.co/videos/42904/42904-1080.mp4"
ffmpeg -loglevel error -y -ss 4.5 -i "$S/mk_42904.mp4" -an -vf "scale=760:428:flags=lanczos,fps=30" -c:v libx264 -crf 15 -pix_fmt yuv420p "$D/s10_ojos_respira_v.mp4"
echo "Clips listos en $D"
