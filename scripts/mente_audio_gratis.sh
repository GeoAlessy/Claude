#!/usr/bin/env bash
# Música y efectos GRATIS del canal mente (sin créditos de ElevenLabs).
#  - Efectos: Mixkit Sound Effects (Mixkit License: uso comercial, sin atribución) + 2 hechos por código.
#  - Música: Mixkit Stock Music (Mixkit License) + Chopin, Nocturno op. 55 n.º 1 (archive.org, CC0).
# Los archivos no se suben al repositorio (la licencia de Mixkit no permite redistribuirlos sueltos).
set -euo pipefail
F=public/mente/sfx; M=public/mente/musica; T=$(mktemp -d); mkdir -p "$F" "$M"
sfx(){ curl -sS -o "$T/$1.wav" "https://assets.mixkit.co/active_storage/sfx/$1/$1.wav"; ffmpeg -loglevel error -y -i "$T/$1.wav" -ar 44100 -ac 2 -c:a libmp3lame -b:a 192k "$F/$2.mp3"; sleep 1; }
sfx 1060 tictac_reloj; sfx 2908 golpe_grave; sfx 1489 whoosh_suave; sfx 1089 rebobinar; sfx 494 latido
sfx 790 riser_tension; sfx 1061 tick_dato; sfx 1471 viento_caida; sfx 1104 pagina_papel; sfx 3109 campana_sueno
# proyector de 16 mm (código): traqueteo a 24 golpes/s + zumbido del motor
ffmpeg -loglevel error -y -f lavfi -i "anoisesrc=d=12:c=brown:a=0.6:r=44100" -f lavfi -i "sine=f=24:d=12:r=44100" -f lavfi -i "sine=f=118:d=12:r=44100" -filter_complex "[0]highpass=f=900,lowpass=f=5000[n];[1]volume=40,alimiter=limit=1,agate=threshold=0.5:attack=0.5:release=8[g];[n][g]sidechaingate=threshold=0.05:attack=0.3:release=12:range=0.02[clac];[2]volume=0.05,tremolo=f=6:d=0.3[motor];[clac][motor]amix=inputs=2:weights=1 0.6,aecho=0.6:0.4:20:0.25,volume=2.2,alimiter=limit=0.8" -ac 2 -c:a libmp3lame -b:a 192k "$F/proyector.mp3"
# cueva (código): gotas al azar con eco largo + rumor grave
python3 -I - "$F/cueva_goteo.mp3" <<'P'
import random,subprocess,sys
random.seed(7); gotas=[]; t=0.4
while t<11.5: gotas.append((t,random.choice([1300,1600,1900,2300,2700]),random.uniform(0.25,0.6))); t+=random.uniform(0.5,1.7)
ins=['-f','lavfi','-i','anoisesrc=d=12:c=brown:a=0.5:r=44100']; fc=['[0]lowpass=f=140,volume=0.6[rum]']
for i,(t,f,v) in enumerate(gotas):
    ins+=['-f','lavfi','-i',f'sine=f={f}:d=0.09:r=44100']; fc.append(f'[{i+1}]afade=t=out:st=0:d=0.09,volume={v:.2f},adelay={int(t*1000)}|{int(t*1000)}[g{i}]')
fc.append(''.join(f'[g{i}]' for i in range(len(gotas)))+f'amix=inputs={len(gotas)}:normalize=0,aecho=0.8:0.7:180|420|760:0.45|0.3|0.2[dr]')
fc.append('[rum][dr]amix=inputs=2:normalize=0,atrim=0:12,afade=t=in:d=0.5,alimiter=limit=0.8')
subprocess.run(['ffmpeg','-loglevel','error','-y',*ins,'-filter_complex',';'.join(fc),'-ac','2','-c:a','libmp3lame','-b:a','192k',sys.argv[1]],check=True)
P
mus(){ curl -sS -o "$M/$2.mp3" "https://assets.mixkit.co/music/$1/$1.mp3"; sleep 1.5; }
mus 184 m1_vastness; mus 614 m2_silent_descent; mus 188 m3_echoes; mus 588 m4_feedback_dreams; mus 587 m5_discover; mus 839 m6_tears_of_joy
curl -sSL -o "$M/m7_chopin_nocturno_op55.mp3" "https://archive.org/download/parso-2baabd827af86a852bb54f058dbceba9edc4ec00/000_Nocturne_Op_55_no_1_in_F_minor.mp3"
echo "Audio gratis listo en $F y $M"
