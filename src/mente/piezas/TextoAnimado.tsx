import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {C, SERIF, rango} from '../estilo';

// Tipografía cinética del canal: ningún texto aparece "de golpe".
// Cada palabra entra sílaba a sílaba (desenfoque → nítido, subiendo un poco), y si hay tiempos de la voz,
// cada palabra aparece justo cuando el narrador la dice.
// Marcado en el texto:  *palabra*  → acento dorado en negrita con brillo
//                       !palabra!  → acento azul luna (lo inquietante)
// Los acentos pueden abarcar varias palabras: *the last summer*.

type Estilo = 'normal' | 'oro' | 'rojo';
type Palabra = {txt: string; estilo: Estilo};

export const parseMarcado = (texto: string): Palabra[] => {
  const out: Palabra[] = [];
  let estilo: Estilo = 'normal';
  for (const crudo of texto.split(/\s+/).filter(Boolean)) {
    let w = crudo;
    let abre: Estilo | null = null;
    if (w.startsWith('*')) (abre = 'oro'), (w = w.slice(1));
    else if (w.startsWith('!')) (abre = 'rojo'), (w = w.slice(1));
    if (abre) estilo = abre;
    let cierra = false;
    // el cierre puede ir antes de la puntuación final: *time*. → "time."
    const m = w.match(/^(.*?)[*!]([.,;:?!…"”’)]*)$/);
    if (m && estilo !== 'normal') (w = m[1] + m[2]), (cierra = true);
    out.push({txt: w, estilo});
    if (cierra) estilo = 'normal';
  }
  return out;
};

/** Palabras sin marcado (para buscarlas en la narración). */
export const palabrasLimpias = (texto: string) => parseMarcado(texto).map((p) => p.txt);

// Trocea una palabra en "sílabas" visuales (heurística: grupos consonante+vocal).
export const silabas = (w: string): string[] => {
  const s = w.match(/[^aeiouyAEIOUY]*[aeiouyAEIOUY]+(?:[^aeiouyAEIOUY]*$|[^aeiouyAEIOUY](?=[^aeiouyAEIOUY]))?/g);
  if (!s || s.join('') !== w) return w.length > 4 ? [w.slice(0, Math.ceil(w.length / 2)), w.slice(Math.ceil(w.length / 2))] : [w];
  return s;
};

// contorno oscuro fino + sombra suave: el texto se lee sobre cualquier imagen
const CONTORNO = '0 0 2px rgba(5,7,15,0.95), 0 0 1px rgba(5,7,15,0.95), 0 2px 14px rgba(5,7,15,0.85)';

const PASO_SILABA = 2.5; // fotogramas entre sílabas
const ENTRADA = 11; // duración de la entrada de cada sílaba

type Props = {
  texto: string;
  /** fotograma (relativo) en que empieza a escribirse */
  desde?: number;
  /** fotograma (relativo) de cada palabra; si existe, manda sobre `ritmo` */
  tiempos?: number[];
  /** fotogramas entre palabras cuando no hay tiempos */
  ritmo?: number;
  /** fotograma (relativo) en que empieza la salida */
  salida?: number;
  estilo?: React.CSSProperties;
  colorBase?: string;
};

export const Escribe: React.FC<Props> = ({texto, desde = 0, tiempos, ritmo = 4, salida, estilo, colorBase = C.luz}) => {
  const f = useCurrentFrame();
  const palabras = parseMarcado(texto);
  return (
    <span style={{...estilo}}>
      {palabras.map((p, i) => {
        const inicio = tiempos?.[i] ?? desde + i * ritmo;
        const sil = silabas(p.txt);
        const finEntrada = inicio + (sil.length - 1) * PASO_SILABA + ENTRADA;
        const acento = p.estilo !== 'normal';
        const color = p.estilo === 'oro' ? C.oro : p.estilo === 'rojo' ? C.luna : colorBase;
        // golpe de luz del acento justo cuando termina de escribirse
        const brillo = acento ? rango(f, finEntrada - 4, finEntrada + 4) * (1 - rango(f, finEntrada + 6, finEntrada + 30)) : 0;
        const escala = acento ? 1 + 0.04 * brillo : 1;
                const salidaP = salida !== undefined ? rango(f, salida + i * 0.8, salida + i * 0.8 + 12) : 0;
        return (
          <React.Fragment key={i}>
            <span
              style={{
                display: 'inline-block',
                position: 'relative',
                whiteSpace: 'nowrap',
                lineHeight: 1,
                margin: acento ? '0 0.06em' : undefined,
                color,
                fontWeight: acento ? 700 : undefined,
                transform: `scale(${escala})`,
                textShadow: acento ? `0 0 ${18 + 30 * brillo}px ${p.estilo === 'oro' ? 'rgba(233,194,123,' : 'rgba(169,196,255,'}${0.3 + 0.5 * brillo}), ${CONTORNO}` : CONTORNO,
                opacity: 1 - salidaP,
                filter: salidaP > 0 ? `blur(${salidaP * 8}px)` : undefined,
              }}
            >
              {sil.map((s, j) => {
                const t = rango(f, inicio + j * PASO_SILABA, inicio + j * PASO_SILABA + ENTRADA);
                return (
                  <span
                    key={j}
                    style={{
                      display: 'inline-block',
                      opacity: t,
                      filter: t < 1 ? `blur(${(1 - t) * 9}px)` : undefined,
                      transform: `translateY(${(1 - t) * 0.32}em)`,
                    }}
                  >
                    {s}
                  </span>
                );
              })}
            </span>
            {i < palabras.length - 1 ? <span style={{whiteSpace: 'pre'}}> </span> : null}
          </React.Fragment>
        );
      })}
    </span>
  );
};

/** Fotograma (relativo) en que termina de escribirse el texto. */
export const finEscritura = (texto: string, desde = 0, tiempos?: number[], ritmo = 4) => {
  const ps = parseMarcado(texto);
  const i = ps.length - 1;
  const inicio = tiempos?.[i] ?? desde + i * ritmo;
  return inicio + (silabas(ps[i].txt).length - 1) * PASO_SILABA + ENTRADA;
};

// Frase clave a pantalla completa: la frase épica del narrador escrita al ritmo de su voz.
// `sobreImagen`: se pinta sobre el plano anterior con un velo oscuro en vez de sobre el fondo del canal.
export const FraseClave: React.FC<{texto: string; tiempos?: number[]; dur: number; tamano?: number; sobreImagen?: boolean}> = ({
  texto,
  tiempos,
  dur,
  tamano = 104,
  sobreImagen,
}) => {
  const f = useCurrentFrame();
  const t0 = tiempos?.[0] ?? 6;
  const linea = rango(f, t0 - 6, t0 + 20);
  const salida = dur - 16;
  return (
    <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
      {sobreImagen && <AbsoluteFill style={{background: 'radial-gradient(ellipse at center, rgba(5,7,15,0.42) 0%, rgba(5,7,15,0.72) 80%)', opacity: rango(f, 0, 10) * (1 - rango(f, salida, dur))}} />}
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', maxWidth: 1560}}>
        <div style={{width: 140 * linea, height: 2, background: C.oro, opacity: 0.8 * (1 - rango(f, salida, salida + 12)), marginBottom: 44}} />
        <div style={{fontFamily: SERIF, fontSize: tamano, lineHeight: 1.16, textAlign: 'center', letterSpacing: 1}}>
          <Escribe texto={texto} tiempos={tiempos} desde={6} salida={salida} />
        </div>
      </div>
    </AbsoluteFill>
  );
};

// Rótulos en mayúsculas (fuente mono): se teclean letra a letra con un cursor dorado que se apaga al terminar.
export const Teclea: React.FC<{texto: string; desde?: number; cps?: number; estilo?: React.CSSProperties; cursor?: string}> = ({
  texto,
  desde = 0,
  cps = 38,
  estilo,
  cursor = C.oro,
}) => {
  const f = useCurrentFrame();
  const porFot = cps / 30;
  const n = Math.max(0, Math.min(texto.length, Math.floor((f - desde) * porFot)));
  const fin = desde + texto.length / porFot;
  const vCursor = f < desde ? 0 : f < fin + 8 ? 1 : 1 - rango(f, fin + 8, fin + 20);
  return (
    <span style={{whiteSpace: 'pre', textShadow: CONTORNO, ...estilo}}>
      {texto.split('').map((ch, i) => {
        const t = rango(f, desde + i / porFot, desde + i / porFot + 5);
        return (
          <span key={i} style={{opacity: i < n ? 0.35 + 0.65 * t : 0, filter: i < n && t < 1 ? `blur(${(1 - t) * 3}px)` : undefined}}>
            {ch}
          </span>
        );
      })}
      <span style={{display: 'inline-block', width: '0.55em', height: '0.95em', marginLeft: 4, verticalAlign: '-0.12em', background: cursor, opacity: vCursor * 0.85}} />
    </span>
  );
};

/** Versión para <text> de SVG: devuelve el trozo ya tecleado. */
export const tecla = (texto: string, f: number, desde = 0, cps = 38) =>
  texto.slice(0, Math.max(0, Math.min(texto.length, Math.floor(((f - desde) * cps) / 30))));
