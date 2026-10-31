// Genera GUION_PARA_GRABAR.md desde src/episodes/ep01/guion.ts
import fs from 'node:fs';
const src = fs.readFileSync('src/episodes/ep01/guion.ts', 'utf8');
const re = /\{id: (\d+), quien: '([^']+)', texto: (["'])(.*?)\3, desde: (\d+), hasta: (\d+), emocion: '([^']+)', velocidad: '([^']+)'\}/g;
const ts = (f) => { const s = f / 30; return `0:${s.toFixed(1).padStart(4, '0')}`; };
let md = `# Guion para grabar — Ep. 01 "Cada 'ya voy' te quita un año"\n\n`;
md += `El video final (\`out/EP01_ya_voy.mp4\`, 38 s) ya tiene música, efectos y subtítulos. Solo falta la voz.\n`;
md += `Graba cada línea para que **empiece en el segundo indicado** y dure lo que dice la columna "Duración".\n\n`;
md += `**Consejos:** graba en un cuarto con ropa o cortinas (menos eco), con el celular a un palmo de la boca, y deja 1 segundo de silencio entre líneas.\n`;
md += `La música ya baja sola al 15% en esos tramos, así que tu voz va a quedar clara encima.\n\n`;
md += `| # | Empieza | Termina | Duración | Personaje | Línea | Emoción | Velocidad |\n|---|---|---|---|---|---|---|---|\n`;
for (const m of src.matchAll(re)) {
  const [, id, quien, , texto, d, h, emo, vel] = m;
  md += `| ${id} | ${ts(+d)} | ${ts(+h)} | ${((h - d) / 30).toFixed(1)} s | ${quien} | ${texto.replace(/\|/g, '\\|')} | ${emo} | ${vel} |\n`;
}
md += `\n**Voces:** NARRADOR (tú, tono de tráiler y cómplice) · MAMÁ (firme, cariñosa, cansada) · CHATO (joven y flojo; desde la línea 12 más grave; en la 16 voz de anciano temblorosa) · AMIGO / JEFE / CHICA (puedes cambiar un poco tu voz).\n`;
md += `\n**Para montar la voz en tu app:** coloca el audio sobre el video empezando en 0:00. Si alguna línea te queda más larga, avísame y ajusto los tiempos del video.\n`;
md += `\n**Si prefieres que la integre yo:** guarda tu grabación como \`public/audio/voz_ep01.wav\` y descomenta la línea de la voz en \`src/episodes/ep01/Ep01.tsx\` (sección AUDIO). Si me la pasas, la integro yo.\n`;
fs.writeFileSync('GUION_PARA_GRABAR.md', md);
console.log(md.split('\n').length, 'líneas');
