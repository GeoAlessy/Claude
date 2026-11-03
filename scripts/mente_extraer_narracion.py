"""Extrae la NARRACIÓN (inglés) de un guion del canal mente a una lista de líneas para narrar.py.
Uso: python3 scripts/mente_extraer_narracion.py canal-mente/guion-01-....md canal-mente/v01/lineas.json
Cada párrafo de narración = una línea con id <tramo>_<nn>. Quita la dirección visual, las marcas de
bucle (🔓 ✅ y su nota en cursiva) y el formato markdown."""
import json, re, sys

texto = open(sys.argv[1], encoding='utf-8').read()
secciones = re.split(r'\n## ', texto)
lineas = []
for sec in secciones:
    cab = sec.split('\n', 1)[0]
    m = re.search(r'(GANCHO|CAPÍTULO (\d+)|CIERRE)', cab)
    if not m:
        continue
    tramo = 'gancho' if m.group(1) == 'GANCHO' else ('cierre' if m.group(1) == 'CIERRE' else f'cap{int(m.group(2)):02d}')
    cuerpo = sec.split('**NARRACIÓN:**', 1)[1] if '**NARRACIÓN:**' in sec else ''
    n = 0
    for par in re.split(r'\n\s*\n', cuerpo):
        par = par.strip()
        if not par or par.startswith(('`[', '---', '>', '|', '#', '**')):
            continue
        par = re.sub(r'`\[.*?\]`', '', par, flags=re.S)           # visual en línea
        par = re.sub(r'[🔓✅]\s*(\*[^*]*\*)?', '', par)             # marcas de bucle + nota
        par = re.sub(r'\*\(.*?\)\*', '', par)                      # notas *(…)*
        par = par.replace('**', '').replace('*', '')
        par = re.sub(r'\s+', ' ', par).strip()
        if par:
            n += 1
            lineas.append([f'{tramo}_{n:02d}', par])
json.dump(lineas, open(sys.argv[2], 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
palabras = sum(len(t.split()) for _, t in lineas)
print(f'{len(lineas)} líneas · {palabras} palabras · {sum(len(t) for _, t in lineas)} caracteres')
