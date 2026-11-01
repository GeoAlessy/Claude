#!/usr/bin/env node
// Busca canales de YouTube Shorts que se volvieron virales con pocos videos.
//
// Uso:
//   YOUTUBE_API_KEY=xxxx node scripts/buscar_canales_virales.mjs [opciones]
//
// Opciones:
//   --max-videos 10        Máximo de videos públicos que puede tener el canal
//   --min-vistas 1000000   Mínimo de vistas totales del canal
//   --dias 90              Buscar Shorts publicados en los últimos N días
//   --paginas 2            Páginas de resultados por búsqueda (50 videos por página)
//   --consultas "a,b,c"    Reemplaza la lista de búsquedas por defecto
//
// Cuota: cada búsqueda cuesta 100 unidades (límite gratuito: 10.000 al día).
// Con los valores por defecto se usan ~5.000 unidades.
//
// Resultado: investigacion/canales_virales.json y investigacion/canales_virales.md

import { writeFile, mkdir } from "node:fs/promises";

const API = "https://www.googleapis.com/youtube/v3";
const KEY = process.env.YOUTUBE_API_KEY;

if (!KEY) {
  console.error(
    "Falta la variable de entorno YOUTUBE_API_KEY.\n" +
      "Agrégala en la configuración del entorno y abre una sesión nueva."
  );
  process.exit(1);
}

function opcion(nombre, porDefecto) {
  const i = process.argv.indexOf(`--${nombre}`);
  return i !== -1 && process.argv[i + 1] ? process.argv[i + 1] : porDefecto;
}

const MAX_VIDEOS = Number(opcion("max-videos", 10));
const MIN_VISTAS = Number(opcion("min-vistas", 1_000_000));
const DIAS = Number(opcion("dias", 90));
const PAGINAS = Number(opcion("paginas", 2));

// Búsquedas genéricas en varios idiomas + las del nicho "¿Por qué pasó?"
const CONSULTAS_POR_DEFECTO = [
  "#shorts", "#viral", "#fyp", "#shortsvideo",
  "#parati", "#viralvideo", "#humor", "#curiosidades",
  "#brasil #shorts", "#हिंदी #shorts", "#indonesia #shorts", "#français #shorts",
  "#deutsch #shorts", "#العربية #shorts", "#русский #shorts", "#日本 #shorts",
  "why it happened", "por qué pasó", "engineering failure explained",
  "3d animation explained", "what happens if",
];
const CONSULTAS = opcion("consultas", null)?.split(",").map((s) => s.trim()) ?? CONSULTAS_POR_DEFECTO;

let unidades = 0;

async function api(recurso, params, costo) {
  const url = new URL(`${API}/${recurso}`);
  for (const [k, v] of Object.entries({ ...params, key: KEY })) url.searchParams.set(k, v);
  const r = await fetch(url);
  unidades += costo;
  if (!r.ok) {
    const cuerpo = await r.text();
    throw new Error(`${recurso} ${r.status}: ${cuerpo.slice(0, 300)}`);
  }
  return r.json();
}

// "PT1M5S" -> 65
function segundos(iso) {
  const m = /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/.exec(iso ?? "") ?? [];
  return (+m[1] || 0) * 3600 + (+m[2] || 0) * 60 + (+m[3] || 0);
}

function enLotes(arr, n) {
  const out = [];
  for (let i = 0; i < arr.length; i += n) out.push(arr.slice(i, i + n));
  return out;
}

async function main() {
  const desde = new Date(Date.now() - DIAS * 864e5).toISOString();
  const canalesVistos = new Set();

  // 1. Buscar Shorts recientes ordenados por vistas
  for (const q of CONSULTAS) {
    let pageToken;
    for (let p = 0; p < PAGINAS; p++) {
      try {
        const res = await api("search", {
          part: "snippet", type: "video", videoDuration: "short",
          order: "viewCount", publishedAfter: desde, maxResults: 50, q,
          ...(pageToken ? { pageToken } : {}),
        }, 100);
        res.items.forEach((it) => canalesVistos.add(it.snippet.channelId));
        pageToken = res.nextPageToken;
        if (!pageToken) break;
      } catch (e) {
        console.error(`Búsqueda "${q}" falló: ${e.message}`);
        if (/quota/i.test(e.message)) return terminar([]);
        break;
      }
    }
    console.error(`"${q}" -> ${canalesVistos.size} canales acumulados`);
  }

  // 2. Filtrar canales con pocos videos y muchas vistas
  const candidatos = [];
  for (const lote of enLotes([...canalesVistos], 50)) {
    const res = await api("channels", {
      part: "snippet,statistics,contentDetails", id: lote.join(","), maxResults: 50,
    }, 1);
    for (const c of res.items ?? []) {
      const videos = Number(c.statistics.videoCount);
      const vistas = Number(c.statistics.viewCount);
      if (videos > 0 && videos <= MAX_VIDEOS && vistas >= MIN_VISTAS) {
        candidatos.push({
          id: c.id,
          nombre: c.snippet.title,
          pais: c.snippet.country ?? "?",
          creado: c.snippet.publishedAt.slice(0, 10),
          suscriptores: c.statistics.hiddenSubscriberCount ? null : Number(c.statistics.subscriberCount),
          vistas, videos,
          uploads: c.contentDetails.relatedPlaylists.uploads,
        });
      }
    }
  }

  // 3. Detalle de los videos de cada canal
  for (const c of candidatos) {
    try {
      const pl = await api("playlistItems", { part: "contentDetails", playlistId: c.uploads, maxResults: 50 }, 1);
      const ids = pl.items.map((i) => i.contentDetails.videoId);
      const vs = await api("videos", { part: "snippet,statistics,contentDetails", id: ids.join(",") }, 1);
      c.listaVideos = vs.items
        .map((v) => ({
          titulo: v.snippet.title,
          idioma: v.snippet.defaultAudioLanguage ?? v.snippet.defaultLanguage ?? "?",
          publicado: v.snippet.publishedAt.slice(0, 10),
          duracion: segundos(v.contentDetails.duration),
          vistas: Number(v.statistics.viewCount ?? 0),
          likes: Number(v.statistics.likeCount ?? 0),
          comentarios: Number(v.statistics.commentCount ?? 0),
          url: `https://youtube.com/shorts/${v.id}`,
        }))
        .sort((a, b) => b.vistas - a.vistas);
    } catch (e) {
      c.listaVideos = [];
      console.error(`No se pudieron leer los videos de ${c.nombre}: ${e.message}`);
    }
    delete c.uploads;
  }

  candidatos.sort((a, b) => b.vistas - a.vistas);
  await terminar(candidatos);
}

async function terminar(candidatos) {
  await mkdir("investigacion", { recursive: true });
  await writeFile("investigacion/canales_virales.json", JSON.stringify(candidatos, null, 2));

  const fmt = (n) => (n == null ? "oculto" : n.toLocaleString("es"));
  let md = `# Canales virales con ≤ ${MAX_VIDEOS} videos y ≥ ${fmt(MIN_VISTAS)} vistas\n\n`;
  md += `*Generado el ${new Date().toISOString().slice(0, 10)} · Shorts de los últimos ${DIAS} días · ${candidatos.length} canales*\n\n`;
  md += `| # | Canal | País | Creado | Videos | Vistas | Suscriptores | Video top | Duración |\n|---|---|---|---|---|---|---|---|---|\n`;
  candidatos.forEach((c, i) => {
    const top = c.listaVideos?.[0];
    md += `| ${i + 1} | [${c.nombre}](https://youtube.com/channel/${c.id}) | ${c.pais} | ${c.creado} | ${c.videos} | ${fmt(c.vistas)} | ${fmt(c.suscriptores)} | ${top ? `[${top.titulo.replace(/\|/g, "/")}](${top.url})` : "-"} | ${top ? top.duracion + " s" : "-"} |\n`;
  });
  await writeFile("investigacion/canales_virales.md", md);
  console.error(`\nListo: ${candidatos.length} canales. Cuota usada: ~${unidades} unidades.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
