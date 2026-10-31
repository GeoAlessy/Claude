import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Chato} from '../characters/Chato';
import {Mama} from '../characters/Mama';
import {C} from '../estilo';
import {FUENTE} from '../fuentes';

const Etiqueta: React.FC<{x: number; y: number; t: string; s?: number; color?: string}> = ({x, y, t, s = 54, color = C.linea}) => (
  <text x={x} y={y} textAnchor="middle" fontFamily={FUENTE} fontWeight={800} fontSize={s} fill={color}>
    {t}
  </text>
);

/** Hoja de personajes: Chato en 4 edades + Mamá + primeros planos de expresiones. */
export const HojaPersonajes: React.FC = () => {
  return (
    <AbsoluteFill style={{backgroundColor: C.fondo}}>
      <svg viewBox="0 0 3000 2000" width={3000} height={2000}>
        <rect x={0} y={0} width={3000} height={2000} fill={C.fondo} />
        <rect x={0} y={1120} width={3000} height={920} fill="#FAD9AE" />
        <Etiqueta x={1500} y={66} t="EN ESTE MUNDO · HOJA DE PERSONAJES · EP. 01" s={60} />
        {/* fila 1: cuerpos completos */}
        <Chato x={330} y={1040} edad={19} brazos="celular" mirada="celular" quieto />
        <Chato x={880} y={1040} edad={34} brazos="relajado" mirada="frente" boca="sonrisa" quieto />
        <Chato x={1430} y={1040} edad={63} brazos="celular" mirada="celular" quieto />
        <Chato x={1930} y={1040} edad={78} brazos="baston" mirada="celular" quieto />
        <Mama x={2600} y={1040} brazos="cucharon" expresion="cansada" quieto />
        <Etiqueta x={330} y={1100} t="CHATO · 19" />
        <Etiqueta x={880} y={1100} t="CHATO · 34" />
        <Etiqueta x={1430} y={1100} t="CHATO · 63" />
        <Etiqueta x={1930} y={1100} t="CHATO · 78" />
        <Etiqueta x={2600} y={1100} t="LA MAMÁ" color={C.delantal} />
        {/* fila 2: expresiones (primeros planos) */}
        <Etiqueta x={1500} y={1190} t="EXPRESIONES" s={60} />
        {(
          [
            [250, <Chato key="a" edad={19} boca="grito" brazos="relajado" mirada="celular" quieto />, '¡YA VOY!'],
            [740, <Chato key="b" edad={21} boca="abierta" brazos="relajado" mirada="celular" quieto />, 'PRIMERA CANA'],
            [1230, <Chato key="c" edad={78} expresion="shock" brazos="relajado" quieto />, 'SHOCK'],
            [1720, <Chato key="d" edad={78} expresion="brilloso" brazos="relajado" mirada="izquierda" boca="triste" quieto />, 'OJOS BRILLOSOS'],
            [2210, <Mama key="e" expresion="grito" brazos="jarra" quieto />, '¡A ALMORZAR!'],
            [2700, <Mama key="f" expresion="guino" brazos="jarra" quieto />, 'GUIÑO'],
          ] as [number, React.ReactNode, string][]
        ).map(([cx, el, t], i) => (
          <g key={i}>
            <defs>
              <clipPath id={`cp${i}`}>
                <circle cx={cx} cy={1520} r={215} />
              </clipPath>
            </defs>
            <circle cx={cx} cy={1520} r={215} fill={C.pared} />
            <g clipPath={`url(#cp${i})`}>
              <g transform={`translate(${cx},${1520 + 740 * 1.45 - 20}) scale(1.45)`}>{el}</g>
            </g>
            <circle cx={cx} cy={1520} r={215} fill="none" stroke={C.linea} strokeWidth={8} />
            <Etiqueta x={cx} y={1800} t={t} s={46} />
          </g>
        ))}
        <Etiqueta x={1500} y={1940} t="Paleta: #F2B705 · #2E5EAA · #C68A5E · #D7263D · #FF3B30 · #FFD60A" s={38} color="#7A5A40" />
      </svg>
    </AbsoluteFill>
  );
};
