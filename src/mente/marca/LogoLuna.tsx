import React from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame} from 'remotion';
import {C, MONO, SANS, SERIF, rango, semilla, suave} from '../estilo';
import {Escribe, Teclea} from '../piezas/TextoAnimado';

// Logo del canal: QUIET CORTEX.
// Símbolo: una Luna real (foto de la NASA, dominio público) en cuarto creciente, con terminador suave,
// luz cenicienta en la parte oscura y una sola estrella dorada: la mente en la sombra.

const LUNA = 'mente/marca/luna_nasa.png'; // fondo transparente (recortada de la foto de la NASA)

/** La luna creciente fotográfica. `s` = diámetro en px. */
/** `revela` (0–1) anima la fase: 0 = luna en sombra total, 1 = cuarto creciente final. `brilloEstrella` 0–1. */
export const LunaReal: React.FC<{s: number; estrella?: boolean; halo?: boolean; revela?: number; brilloEstrella?: number}> = ({
  s,
  estrella = true,
  halo = true,
  revela = 1,
  brilloEstrella = 1,
}) => {
  const t = 45 + (1 - revela) * 62; // borde del terminador
  const mascara = `radial-gradient(circle at 70% 33%, transparent 0%, transparent ${t}%, rgba(0,0,0,0.55) ${t + 5.5}%, #000 ${t + 12}%)`;
  return (
  <div style={{position: 'relative', width: s, height: s}}>
    {/* halo de luz alrededor de la parte iluminada */}
    {halo && revela > 0 && (
      <div
        style={{
          position: 'absolute',
          inset: -s * 0.18,
          borderRadius: '50%',
          background: `radial-gradient(circle at 34% 60%, rgba(225, 228, 240, 0.16) 0%, rgba(225, 228, 240, 0.05) 38%, transparent 62%)`,
          filter: `blur(${s * 0.04}px)`,
          opacity: revela,
        }}
      />
    )}
    {/* luz cenicienta: la parte oscura apenas se intuye */}
    <Img src={staticFile(LUNA)} style={{position: 'absolute', inset: 0, width: s, height: s, opacity: 0.05 * revela, filter: 'grayscale(1) brightness(0.9)'}} />
    {/* parte iluminada: la sombra de la fase es una máscara con terminador suave */}
    <Img
      src={staticFile(LUNA)}
      style={{
        position: 'absolute',
        inset: 0,
        width: s,
        height: s,
        filter: 'grayscale(0.5) sepia(0.12) contrast(1.15) brightness(1.06)',
        WebkitMaskImage: mascara,
        maskImage: mascara,
      }}
    />
    {estrella && brilloEstrella > 0 && (
      <div style={{opacity: brilloEstrella}}>
        <Estrella x={s * 0.73} y={s * 0.36} s={s * 0.2 * (0.6 + 0.4 * brilloEstrella)} />
      </div>
    )}
  </div>
  );
};

/** Estrella dorada con destellos de difracción (cuatro puntas finas). */
export const Estrella: React.FC<{x: number; y: number; s: number}> = ({x, y, s}) => (
  <div style={{position: 'absolute', left: x - s / 2, top: y - s / 2, width: s, height: s}}>
    <div style={{position: 'absolute', inset: '30%', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,226,160,0.9) 0%, rgba(233,194,123,0.35) 35%, transparent 70%)'}} />
    <div style={{position: 'absolute', left: 0, right: 0, top: '49.3%', height: '1.4%', background: 'linear-gradient(90deg, transparent, rgba(255,226,160,0.85), transparent)'}} />
    <div style={{position: 'absolute', top: 0, bottom: 0, left: '49.3%', width: '1.4%', background: 'linear-gradient(180deg, transparent, rgba(255,226,160,0.85), transparent)'}} />
    <div style={{position: 'absolute', inset: '46%', borderRadius: '50%', background: '#FFF6E4', boxShadow: `0 0 ${s * 0.08}px ${s * 0.03}px rgba(255,214,140,0.9)`}} />
  </div>
);

/** Cielo de fondo: estrellas pequeñas y viñeta. */
export const Cielo: React.FC<{w: number; h: number; n?: number}> = ({w, h, n = 220}) => {
  const r = semilla(7);
  const est = Array.from({length: n}, () => [r() * w, r() * h, 0.4 + r() * 1.3, 0.15 + r() * 0.55]);
  return (
    <AbsoluteFill style={{background: `radial-gradient(ellipse at 45% 45%, #0C1230 0%, ${C.noche} 72%)`}}>
      <svg width={w} height={h} style={{position: 'absolute'}}>
        {est.map(([x, y, rr, o], i) => (
          <circle key={i} cx={x} cy={y} r={rr} fill="#DDE3F5" opacity={o} />
        ))}
      </svg>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.55) 100%)'}} />
    </AbsoluteFill>
  );
};

/** Nombre del canal compuesto tipográficamente. */
export const Nombre: React.FC<{escala?: number; alinear?: 'center' | 'left'}> = ({escala = 1, alinear = 'center'}) => (
  <div style={{display: 'flex', flexDirection: 'column', alignItems: alinear === 'center' ? 'center' : 'flex-start'}}>
    <div style={{fontFamily: SERIF, fontWeight: 500, fontSize: 150 * escala, letterSpacing: 30 * escala, color: C.luz, lineHeight: 1, marginRight: alinear === 'center' ? -30 * escala : 0}}>
      QUIET CORTEX
    </div>
    <div style={{display: 'flex', alignItems: 'center', gap: 22 * escala, marginTop: 30 * escala}}>
      <div style={{width: 70 * escala, height: 1.5 * escala, background: C.oro, opacity: 0.8}} />
      <div style={{fontFamily: SANS, fontWeight: 400, fontSize: 25 * escala, letterSpacing: 9 * escala, color: C.oro}}>THE UNSETTLING SCIENCE OF YOUR MIND</div>
      <div style={{width: 70 * escala, height: 1.5 * escala, background: C.oro, opacity: 0.8}} />
    </div>
  </div>
);

/** Foto de perfil (800×800; YouTube la recorta en círculo): luna + nombre dentro de la zona circular. */
export const AvatarLuna: React.FC = () => (
  <AbsoluteFill>
    <Cielo w={800} h={800} n={90} />
    <AbsoluteFill style={{alignItems: 'center'}}>
      <div style={{marginTop: 118}}>
        <LunaReal s={370} />
      </div>
      <div style={{fontFamily: SERIF, fontWeight: 700, fontSize: 64, letterSpacing: 9, marginRight: -9, color: C.luz, lineHeight: 1, marginTop: 44}}>QUIET CORTEX</div>
      <div style={{display: 'flex', alignItems: 'center', gap: 14, marginTop: 18}}>
        <div style={{width: 46, height: 1.5, background: C.oro, opacity: 0.85}} />
        <div style={{width: 7, height: 7, transform: 'rotate(45deg)', background: C.oro}} />
        <div style={{width: 46, height: 1.5, background: C.oro, opacity: 0.85}} />
      </div>
    </AbsoluteFill>
  </AbsoluteFill>
);

/** Lámina de presentación del logo completo. */
export const LaminaLuna: React.FC = () => (
  <AbsoluteFill>
    <Cielo w={2400} h={1350} />
    <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', flexDirection: 'column'}}>
      <LunaReal s={520} />
      <div style={{marginTop: 90}}>
        <Nombre />
      </div>
    </AbsoluteFill>
    <div style={{position: 'absolute', right: 70, bottom: 60, display: 'flex', alignItems: 'center', gap: 34}}>
      {[220, 110, 56].map((d) => (
        <div key={d} style={{width: d, height: d, borderRadius: '50%', overflow: 'hidden', border: `1px solid ${C.nieblaSuave}`}}>
          <div style={{position: 'relative', width: 800, height: 800, transform: `scale(${d / 800})`, transformOrigin: '0 0'}}>
            <AvatarLuna />
          </div>
        </div>
      ))}
    </div>
    <div style={{position: 'absolute', left: 70, bottom: 66, fontFamily: MONO, fontSize: 20, letterSpacing: 6, color: C.gris}}>Moon image: NASA / GSFC (public domain)</div>
  </AbsoluteFill>
);

// ---------------------------------------------------------------------------
// Entrada del logo en los vídeos (1920×1080): la luna sale de la sombra, la estrella destella,
// el nombre se escribe y el lema se teclea. Solo tres elementos: luna, nombre y lema.
export const LogoEntrada: React.FC<{dur: number}> = ({dur}) => {
  const f = useCurrentFrame();
  const entrada = rango(f, 0, 8);
  const salida = 1 - rango(f, dur - 10, dur);
  const revela = rango(f, 3, 34, 0, 1, suave);
  const est = rango(f, 24, 32) * (1 + 0.6 * (1 - rango(f, 32, 46)));
  const lema = rango(f, 30, 44);
  return (
    <AbsoluteFill style={{opacity: entrada * salida}}>
      <Cielo w={1920} h={1080} n={260} />
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column', transform: `scale(${1 + 0.035 * rango(f, 0, dur, 0, 1, (x) => x)})`}}>
        <LunaReal s={400} revela={revela} brilloEstrella={Math.min(1.6, est)} />
        <div style={{fontFamily: SERIF, fontWeight: 500, fontSize: 112, letterSpacing: 24, marginRight: -24, color: C.luz, lineHeight: 1, marginTop: 70}}>
          <Escribe texto="QUIET CORTEX" desde={14} ritmo={7} />
        </div>
        <div style={{display: 'flex', alignItems: 'center', gap: 18, marginTop: 26, opacity: lema}}>
          <div style={{width: 56 * lema, height: 1.5, background: C.oro, opacity: 0.8}} />
          <div style={{fontFamily: SANS, fontWeight: 400, fontSize: 20, letterSpacing: 8, color: C.oro}}>
            <Teclea texto="THE UNSETTLING SCIENCE OF YOUR MIND" desde={30} cps={80} cursor="transparent" />
          </div>
          <div style={{width: 56 * lema, height: 1.5, background: C.oro, opacity: 0.8}} />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export const DURACION_LOGO_ENTRADA = 75;

/** Fotograma final de la entrada (para exportarlo como imagen en 4K). */
export const PantallaLogo: React.FC = () => (
  <AbsoluteFill>
    <Cielo w={1920} h={1080} n={260} />
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column'}}>
      <LunaReal s={400} />
      <div style={{fontFamily: SERIF, fontWeight: 500, fontSize: 112, letterSpacing: 24, marginRight: -24, color: C.luz, lineHeight: 1, marginTop: 70}}>QUIET CORTEX</div>
      <div style={{display: 'flex', alignItems: 'center', gap: 18, marginTop: 26}}>
        <div style={{width: 56, height: 1.5, background: C.oro, opacity: 0.8}} />
        <div style={{fontFamily: SANS, fontWeight: 400, fontSize: 20, letterSpacing: 8, color: C.oro}}>THE UNSETTLING SCIENCE OF YOUR MIND</div>
        <div style={{width: 56, height: 1.5, background: C.oro, opacity: 0.8}} />
      </div>
    </AbsoluteFill>
  </AbsoluteFill>
);

// ---------------------------------------------------------------------------
// Banner de YouTube (2560×1440). Zona segura en todos los dispositivos: 1546×423 en el centro.
export const BannerLuna: React.FC<{guias?: boolean}> = ({guias}) => (
  <AbsoluteFill>
    <Cielo w={2560} h={1440} n={520} />
    {/* bruma de luz lunar muy suave que cruza el banner */}
    <AbsoluteFill style={{background: 'radial-gradient(ellipse 60% 22% at 50% 50%, rgba(150,170,230,0.10) 0%, transparent 70%)'}} />
    <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 56}}>
        <LunaReal s={290} />
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-start'}}>
          <div style={{fontFamily: SERIF, fontWeight: 500, fontSize: 110, letterSpacing: 18, color: C.luz, lineHeight: 1}}>QUIET CORTEX</div>
          <div style={{display: 'flex', alignItems: 'center', gap: 18, marginTop: 28}}>
            <div style={{width: 60, height: 1.5, background: C.oro, opacity: 0.8}} />
            <div style={{fontFamily: SANS, fontWeight: 400, fontSize: 21, letterSpacing: 7.4, color: C.oro}}>THE UNSETTLING SCIENCE OF YOUR MIND</div>
          </div>
          <div style={{fontFamily: SANS, fontWeight: 400, fontSize: 19, letterSpacing: 5, color: C.niebla, marginTop: 18}}>NEW VIDEOS EVERY WEEK</div>
        </div>
      </div>
    </AbsoluteFill>
    {guias && (
      <>
        <div style={{position: 'absolute', left: (2560 - 1546) / 2, top: (1440 - 423) / 2, width: 1546, height: 423, border: '2px dashed rgba(255,80,80,0.8)'}} />
        <div style={{position: 'absolute', left: 0, top: (1440 - 423) / 2, width: 2560, height: 423, border: '2px dashed rgba(80,200,255,0.6)'}} />
      </>
    )}
  </AbsoluteFill>
);
