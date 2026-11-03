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
