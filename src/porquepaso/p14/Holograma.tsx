import React, {useLayoutEffect, useMemo} from 'react';
import * as THREE from 'three';
import {ThreeCanvas} from '@remotion/three';
import {useThree} from '@react-three/fiber';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';
import {Holo, Linea, caja, proyectar} from '../three/holo';
import {C, MONO, TITULAR} from '../estilo';
import {Pastilla} from '../hud';
import {H} from './tiempos';
export {H};

// =====================================================================
// Holograma del video 14: el bamboleo de velocidad.
// Arrancón a fondo → el peso se va atrás y la rueda delantera queda casi flotando →
// un bache tuerce el manubrio → la rueda vuelve al centro y se pasa, cada vez más fuerte → la moto se cae.
// Después pasa otra moto con amortiguador de dirección: el mismo bache y el vaivén se apaga solo.
// Ejes (metros): las motos avanzan hacia +x por la carretera (z = 0 la primera, z = -CARRIL la segunda).
// El vaivén se muestra en cámara lenta (en la realidad son 5–10 sacudidas por segundo).
// =====================================================================
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const suave = Easing.inOut(Easing.cubic);
const BLANCO = '#E0F2FE';
const MOTO = '#7DD3FC';
const PILOTO = '#FB923C';
const CARRIL = 3.4;
const VMAX = 0.75; // m por cuadro ≈ 80 km/h
const RAKE = 0.45; // inclinación de la horquilla (rad)
const HD = new THREE.Vector3(1.1, 0.95, 0); // cabeza de dirección
const LH = 0.7; // largo de la horquilla
const W = (2 * Math.PI) / 20; // vaivén en cámara lenta: un ciclo cada 20 cuadros

const mezcla = (a: string, b: string, k: number) => '#' + new THREE.Color(a).lerp(new THREE.Color(b), Math.max(0, Math.min(1, k))).getHexString();

// ---------- Moto 1: arranca, el vaivén crece y se cae ----------
const T0 = H.CARRERA - 10; // arranque
const xAcel = (f: number) => {
  const t = Math.max(0, f - T0);
  const tA = 70; // cuadros hasta la velocidad máxima
  const a = VMAX / tA;
  return t < tA ? 0.5 * a * t * t : 0.5 * a * tA * tA + VMAX * (t - tA);
};
const CAIDA = H.CAE - 14; // empieza a tumbarse
const TAU = 16;
const x1 = (f: number) => {
  if (f < CAIDA) return xAcel(f);
  const t = f - CAIDA;
  return xAcel(CAIDA) + VMAX * TAU * (1 - Math.exp(-t / TAU));
};
// amplitud del vaivén
const amp = (f: number) => {
  if (f < H.TUERCE - 6) return 0;
  const base = interpolate(f, [H.TUERCE - 6, H.TUERCE + 4, H.CRECE], [0, 0.1, 0.16], clamp);
  const crece = f > H.CRECE ? 0.16 * (Math.exp((f - H.CRECE) / 105) - 1) : 0;
  return Math.min(0.75, base + crece);
};
const giro1 = (f: number) => {
  const g = Math.min(f, CAIDA);
  return amp(g) * Math.sin(W * (g - H.TUERCE + 5));
};
// cuánto se levanta la rueda delantera (0 normal, 1 casi flotando)
const flota = (f: number) => interpolate(f, [H.ATRAS - 10, H.DELANTERA + 8, CAIDA, CAIDA + 10], [0, 1, 1, 0], {...clamp, easing: suave});
const caida = (f: number) => interpolate(f, [CAIDA, CAIDA + 14], [0, 1], {...clamp, easing: Easing.in(Easing.quad)});
const z1 = (f: number) => {
  const g = Math.min(f, CAIDA);
  return -0.35 * amp(g) * Math.sin(W * (g - H.TUERCE + 1)) + caida(f) * 0.6;
};
// piloto separado de la moto
const separa = (f: number) => interpolate(f, [CAIDA + 6, CAIDA + 40], [0, 1], {...clamp, easing: Easing.out(Easing.quad)});

// ---------- Moto 2 (con amortiguador) ----------
const X_FIN1 = x1(H.CAE + 200);
const T2 = H.CONSEJO - 4; // aparece por detrás y alcanza a la moto caída
const x2 = (f: number) => X_FIN1 - 1 + 0.7 * (f - (H.CONSEJO + 34));
const BACHE2 = H.FRENA - 6;
const giro2 = (f: number) => (f < BACHE2 ? 0 : 0.14 * Math.exp(-(f - BACHE2) / 9) * Math.sin(W * (f - BACHE2)));
const moto2 = (f: number) => interpolate(f, [T2 - 5, T2 + 15], [0, 1], clamp);

// baches en la carretera
const X_BACHE1 = xAcel(H.TUERCE - 5) + 1.4;
const X_BACHE2 = x2(BACHE2) + 1.4;

// ---------- Cámara (relativa a la moto que se sigue) ----------
type ClaveCam = [number, [number, number, number], [number, number, number]];
const VC = (x: number, y: number, z: number): [number, number, number] => [x, y, z];
const CAM: ClaveCam[] = [
  [0, VC(5, 2.6, 7), VC(0.7, 0.7, 0)],
  [H.CARRERA, VC(-3.5, 2.2, 6), VC(0.9, 0.7, 0)],
  [H.FONDO, VC(3.5, 1.6, 5.5), VC(0.7, 0.7, 0)],
  [H.PESO_W, VC(0.7, 1.1, 5.2), VC(0.7, 0.75, 0)],
  [H.FLOTANDO + 10, VC(0.7, 1.1, 5.2), VC(0.7, 0.75, 0)],
  [H.BACHE, VC(5.5, 2.4, 3.8), VC(1.2, 0.5, 0)],
  [H.TUERCE, VC(4.2, 4.6, 2.4), VC(1.0, 0.5, 0)],
  [H.VUELVE, VC(4.2, 4.6, 2.4), VC(1.0, 0.5, 0)],
  [H.DIEZ, VC(4.8, 5.2, 3.2), VC(1.0, 0.5, 0)],
  [H.GOLPEA + 10, VC(4.5, 3.0, 4.5), VC(1.0, 0.6, 0)],
  [H.CAE + 10, VC(6, 4, 8.5), VC(0.5, 0.4, 0)],
  [H.CONSEJO + 15, VC(5, 3.5, 7), VC(0.8, 0.7, 0)],
  [H.AMORT + 8, VC(2.4, 2.2, 2.7), VC(1.0, 0.95, 0)],
  [H.FRENA + 20, VC(4.2, 4.4, 2.6), VC(1.0, 0.6, 0)],
  [H.MANOS + 20, VC(5, 3, 7.5), VC(0.8, 0.7, 0)],
  [H.DUR, VC(-6, 3.2, 7), VC(0.8, 0.7, 0)],
];
export const FOV = 40;
// a quién sigue la cámara: moto 1 → moto 2
const sigue2 = (f: number) => interpolate(f, [H.CONSEJO + 12, H.AMORT - 6], [0, 1], {...clamp, easing: suave});
export function camaraEn(f: number) {
  const fr = CAM.map((k) => k[0]);
  const p = new THREE.Vector3(...([0, 1, 2].map((i) => interpolate(f, fr, CAM.map((k) => k[1][i]), {...clamp, easing: suave})) as [number, number, number]));
  const t = new THREE.Vector3(...([0, 1, 2].map((i) => interpolate(f, fr, CAM.map((k) => k[2][i]), {...clamp, easing: suave})) as [number, number, number]));
  // la cámara se aleja un poco más para que la moto entre completa en el vertical
  p.sub(t).multiplyScalar(1.55).add(t);
  const s = sigue2(f);
  const d = new THREE.Vector3((1 - s) * x1(f) + s * x2(f), 0, -CARRIL * s);
  p.add(d);
  t.add(d);
  return {p, t};
}
const Camara: React.FC<{f: number}> = ({f}) => {
  const {camera} = useThree();
  useLayoutEffect(() => {
    const {p, t} = camaraEn(f);
    camera.position.copy(p);
    camera.lookAt(t);
    (camera as THREE.PerspectiveCamera).fov = FOV;
    camera.updateProjectionMatrix();
  }, [camera, f]);
  return null;
};

// =====================================================================
// Piezas
// =====================================================================
const RUEDA = new THREE.TorusGeometry(0.3, 0.05, 6, 22);
const RAYOS = (() => {
  const g = new THREE.CylinderGeometry(0.3, 0.3, 0.04, 8, 1, true);
  g.rotateX(Math.PI / 2);
  return g;
})();
const CUERPO = new THREE.CapsuleGeometry(0.2, 0.55, 4, 8);
const CABEZA = new THREE.SphereGeometry(0.15, 10, 8);
const AMORT = (() => {
  const g = new THREE.CylinderGeometry(0.05, 0.05, 0.45, 10);
  g.rotateX(Math.PI / 2);
  return g;
})();

const Rueda: React.FC<{color: string; op: number; position: [number, number, number]; vuelta: number}> = ({color, op, position, vuelta}) => (
  <group position={position} rotation={[0, 0, -vuelta]}>
    <Holo geom={RUEDA} color={color} relleno={0.25 * op} linea={0.9 * op} angulo={40} />
    <Holo geom={RAYOS} color={color} relleno={0.06 * op} linea={0.35 * op} angulo={10} />
  </group>
);

// Moto: origen en el contacto de la rueda trasera. giro = ángulo del manubrio; cabeceo = nariz arriba.
const Moto: React.FC<{color: string; op: number; giro: number; cabeceo: number; vuelta: number; amortiguador?: number}> = ({color, op, giro, cabeceo, vuelta, amortiguador = 0}) => (
  <group rotation={[0, 0, cabeceo]}>
    <Rueda color={color} op={op} position={[0, 0.32, 0]} vuelta={vuelta} />
    {/* chasis */}
    <Holo geom={caja(0.62, 0.24, 0.32)} color={color} relleno={0.12 * op} linea={0.85 * op} position={[0.78, 0.86, 0]} rotation={[0, 0, -0.12]} />
    <Holo geom={caja(0.6, 0.09, 0.28)} color={color} relleno={0.1 * op} linea={0.8 * op} position={[0.28, 0.8, 0]} />
    <Holo geom={caja(0.46, 0.36, 0.3)} color={color} relleno={0.1 * op} linea={0.7 * op} position={[0.68, 0.5, 0]} />
    <Holo geom={caja(0.62, 0.06, 0.2)} color={color} relleno={0.15 * op} linea={0.7 * op} position={[0.3, 0.38, 0]} rotation={[0, 0, 0.12]} />
    <Holo geom={caja(0.7, 0.07, 0.07)} color={color} relleno={0.2 * op} linea={0.6 * op} position={[0.2, 0.5, 0.2]} rotation={[0, 0, 0.25]} />
    {/* dirección: gira sobre el eje inclinado de la horquilla */}
    <group position={[HD.x, HD.y, 0]} rotation={[0, 0, RAKE]}>
      <group rotation={[0, giro, 0]}>
        {[-0.11, 0.11].map((z) => (
          <Holo key={z} geom={caja(0.05, LH, 0.05)} color={color} relleno={0.3 * op} linea={0.9 * op} position={[0, -LH / 2, z]} />
        ))}
        <group position={[0, -LH, 0]} rotation={[0, 0, -RAKE]}>
          <Rueda color={color} op={op} position={[0, 0, 0]} vuelta={vuelta} />
        </group>
        <Holo geom={caja(0.06, 0.06, 0.82)} color={BLANCO} relleno={0.4 * op} linea={op} position={[-0.08, 0.14, 0]} />
        <Holo geom={caja(0.05, 0.16, 0.05)} color={color} relleno={0.3 * op} linea={0.8 * op} position={[-0.04, 0.06, 0]} />
      </group>
    </group>
    {/* amortiguador de dirección (verde): une el chasis con la dirección */}
    {amortiguador > 0 && (
      <group position={[HD.x - 0.12, HD.y + 0.02, 0.05]}>
        <mesh geometry={AMORT}>
          <meshBasicMaterial color={C.verde} transparent opacity={0.7 * amortiguador} depthWrite={false} blending={THREE.AdditiveBlending} />
        </mesh>
        <Holo geom={AMORT} color={C.verde} relleno={0} linea={amortiguador} angulo={10} />
      </group>
    )}
  </group>
);

// Piloto sentado (inclinado hacia adelante)
const Piloto: React.FC<{op: number; color?: string}> = ({op, color = PILOTO}) => (
  <group>
    <Holo geom={CUERPO} color={color} relleno={0.2 * op} linea={0.85 * op} angulo={40} position={[0.45, 1.22, 0]} rotation={[0, 0, -0.55]} />
    <Holo geom={CABEZA} color={color} relleno={0.25 * op} linea={0.8 * op} angulo={40} position={[0.78, 1.66, 0]} />
    {[-0.2, 0.2].map((z) => (
      <Holo key={z} geom={caja(0.55, 0.08, 0.08)} color={color} relleno={0.3 * op} linea={0.7 * op} position={[0.86, 1.28, z]} rotation={[0, 0, -0.45]} />
    ))}
    {[-0.17, 0.17].map((z) => (
      <Holo key={'p' + z} geom={caja(0.08, 0.5, 0.1)} color={color} relleno={0.25 * op} linea={0.7 * op} position={[0.42, 0.72, z]} rotation={[0, 0, 0.6]} />
    ))}
  </group>
);

// Carretera "infinita": las rayas y los postes se repiten alrededor de la cámara
const Carretera: React.FC<{cx: number}> = ({cx}) => {
  const base = Math.floor(cx / 5) * 5;
  const baseP = Math.floor(cx / 24) * 24;
  return (
    <group>
      <Holo geom={caja(240, 0.04, 9)} color={MOTO} relleno={0.025} linea={0} position={[cx, -0.02, -CARRIL / 2]} />
      {[-CARRIL / 2, 2.5, -CARRIL - 2.5].map((z, i) =>
        Array.from({length: 26}, (_, k) => (
          <Holo key={`${i}-${k}`} geom={caja(i === 0 ? 2 : 4.6, 0.03, 0.1)} color={BLANCO} relleno={i === 0 ? 0.6 : 0.25} linea={i === 0 ? 0.5 : 0.2} position={[base - 40 + k * 5, 0.02, z]} />
        ))
      )}
      {Array.from({length: 8}, (_, k) => (
        <group key={'p' + k} position={[baseP - 48 + k * 24, 0, -9]}>
          <Holo geom={caja(0.25, 8, 0.25)} color={C.cian} relleno={0.06} linea={0.3} position={[0, 4, 0]} />
          <Holo geom={caja(0.1, 0.1, 2)} color={C.cian} relleno={0.1} linea={0.3} position={[0, 7.6, 0]} />
        </group>
      ))}
      {Array.from({length: 7}, (_, k) => (
        <Holo key={'a' + k} geom={caja(3, 3 + (k % 3), 3)} color={C.verde} relleno={0.03} linea={0.16} position={[baseP - 40 + k * 24 + 9, 1.6, 7.5 + (k % 2) * 2]} />
      ))}
    </group>
  );
};

const Bache: React.FC<{x: number; z: number; op: number}> = ({x, z, op}) => (
  <Holo geom={caja(0.5, 0.06, 0.9)} color={C.ambar} relleno={0.35 * op} linea={op} position={[x, 0.03, z]} />
);

// Rastro de la rueda delantera en el suelo (muestra el zigzag)
const Rastro: React.FC<{f: number; desde: number; hasta: number; x: (f: number) => number; zc: number; giro: (f: number) => number; zz?: (f: number) => number; color: string; op: number}> = ({f, desde, hasta, x, zc, giro, zz, color, op}) => {
  const puntos = useMemo(() => {
    const out: THREE.Vector3[] = [];
    const ini = Math.max(desde, f - 70);
    const fin = Math.min(f, hasta);
    for (let g = ini; g <= fin; g += 0.5) out.push(new THREE.Vector3(x(g) + 1.4, 0.03, zc + (zz ? zz(g) : 0) - 0.55 * giro(g)));
    return out;
  }, [f, desde, hasta, x, zc, giro, zz]);
  if (puntos.length < 2 || op <= 0) return null;
  return <Linea puntos={puntos} color={color} opacidad={op} />;
};

const Escena: React.FC<{f: number}> = ({f}) => {
  const aparicion = interpolate(f, [0, 20], [0, 1], clamp);
  const s = sigue2(f);
  const cx = (1 - s) * x1(f) + s * x2(f);
  // moto 1
  const a = amp(f);
  const peligro = interpolate(a, [0.15, 0.5], [0, 1], clamp);
  const color1 = mezcla(MOTO, C.rojo, peligro);
  const op1 = interpolate(f, [H.CONSEJO + 30, H.CONSEJO + 60], [1, 0.3], clamp);
  const g1 = giro1(f);
  const tumba = caida(f);
  const cabeceo = 0.085 * flota(f) + 0.015 * Math.sin(f * 0.9) * interpolate(f, [0, T0], [1, 0], clamp);
  const yaw1 = -0.35 * giro1(f - 3);
  const rodar1 = -0.6 * giro1(f - 5) * (1 - tumba);
  const vuelta1 = x1(f) / 0.32;
  const sp = separa(f);
  // moto 2
  const o2 = moto2(f);
  const g2 = giro2(f);
  const am = interpolate(f, [H.AMORT - 6, H.AMORT + 6], [0, 1], clamp);
  return (
    <group scale={[1, aparicion, 1]}>
      <gridHelper args={[400, 200, C.cian, C.cian]} position={[Math.floor(cx / 2) * 2, -0.05, 0]}>
        <lineBasicMaterial attach="material" color={C.cian} transparent opacity={0.03} />
      </gridHelper>
      <Carretera cx={cx} />
      <Bache x={X_BACHE1} z={0.3} op={interpolate(f, [H.TOQUE, H.BACHE], [0, 1], clamp)} />
      <Bache x={X_BACHE2} z={-CARRIL + 0.3} op={o2 * interpolate(f, [H.CONSEJO, H.FRENA - 30], [0, 1], clamp)} />
      <Rastro f={f} desde={H.TUERCE - 8} hasta={CAIDA} x={x1} zc={0} giro={giro1} zz={z1} color={C.rojo} op={0.8 * op1} />
      <Rastro f={f} desde={BACHE2 - 10} hasta={H.DUR} x={x2} zc={-CARRIL} giro={giro2} color={C.verde} op={0.8 * o2} />

      {/* moto 1 (cae y se queda tenue en su carril) */}
      <group position={[x1(f), 0, z1(f)]} rotation={[rodar1 + tumba * 1.45, yaw1 + tumba * 0.5, 0]}>
        <Moto color={color1} op={op1} giro={g1} cabeceo={cabeceo * (1 - tumba)} vuelta={vuelta1} />
        {sp <= 0 && <Piloto op={op1} />}
      </group>
      {sp > 0 && (
        <group position={[x1(f) + sp * 5.5, 0.9 * Math.sin(Math.PI * Math.min(1, sp * 1.3)) * 0.6 + (1 - sp) * 0.2, z1(f) + sp * 1.4]} rotation={[sp * 4, 0, sp * 1.4]}>
          <Piloto op={op1} />
        </group>
      )}

      {/* moto 2: con amortiguador de dirección */}
      {o2 > 0 && (
        <group position={[x2(f), 0, -CARRIL]} rotation={[-0.6 * giro2(f - 5), -0.35 * giro2(f - 3), 0]}>
          <Moto color={C.cian} op={o2} giro={g2} cabeceo={0.04} vuelta={x2(f) / 0.32} amortiguador={am} />
          <Piloto op={o2} color={C.verde} />
        </group>
      )}
    </group>
  );
};

// =====================================================================
// Capa 2D
// =====================================================================
const Etiqueta3D: React.FC<{punto: THREE.Vector3; f: number; desde: number; hasta: number; color?: string; texto: string; dx?: number; dy?: number}> = ({
  punto,
  f,
  desde,
  hasta,
  color = C.cian,
  texto,
  dx = 40,
  dy = -90,
}) => {
  if (f < desde || f > hasta) return null;
  const {p, t} = camaraEn(f);
  const [x, y, delante] = proyectar(punto, p, t, FOV, 1080, 1920);
  if (!delante) return null;
  const op = interpolate(f, [desde, desde + 8, hasta - 6, hasta], [0, 1, 1, 0], clamp);
  const anchoEtiqueta = texto.length * 19 + 70;
  const lxBruto = x + dx;
  const lx = dx < 0 ? Math.min(Math.max(lxBruto, anchoEtiqueta + 30), 1050) : Math.min(Math.max(lxBruto, 30), 1050 - anchoEtiqueta);
  const ly = Math.min(Math.max(y + dy, 760), 1400);
  return (
    <>
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, opacity: op}}>
        <circle cx={x} cy={y} r={10} fill="none" stroke={color} strokeWidth={3} />
        <circle cx={x} cy={y} r={3} fill={color} />
        <line x1={x} y1={y} x2={lx} y2={ly + 28} stroke={color} strokeWidth={2.5} />
      </svg>
      <div style={{position: 'absolute', left: lx, top: ly, transform: dx < 0 ? 'translateX(-100%)' : undefined, opacity: op}}>
        <Pastilla color={color} tam={30}>
          {texto}
        </Pastilla>
      </div>
    </>
  );
};

const Panel: React.FC<{op: number; color: string; children: React.ReactNode}> = ({op, color, children}) => (
  <div style={{position: 'absolute', top: 300, left: 60, right: 60, padding: '24px 30px', background: 'rgba(4,14,24,0.82)', border: `2px solid ${color}`, borderRadius: 24, boxShadow: `0 0 30px ${color}44`, opacity: op}}>
    {children}
  </div>
);
const Titulo: React.FC<{color: string; children: React.ReactNode}> = ({color, children}) => (
  <div style={{fontFamily: MONO, fontWeight: 700, fontSize: 26, letterSpacing: 2, color}}>{children}</div>
);
const fila = (t: string, w: number, valor: string, color: string) => (
  <div style={{marginTop: 18}}>
    <div style={{display: 'flex', justifyContent: 'space-between', fontFamily: MONO, fontWeight: 700, fontSize: 28, color: C.blanco}}>
      <span>{t}</span>
      <span style={{color}}>{valor}</span>
    </div>
    <div style={{height: 22, marginTop: 8, borderRadius: 11, background: 'rgba(255,255,255,0.1)', overflow: 'hidden'}}>
      <div style={{width: `${Math.max(1, w * 100)}%`, height: '100%', background: color, boxShadow: `0 0 16px ${color}`}} />
    </div>
  </div>
);

// Reparto del peso entre las ruedas
const Peso: React.FC<{f: number}> = ({f}) => {
  const op = interpolate(f, [H.PESO + 4, H.PESO + 18, H.TOQUE + 10, H.TOQUE + 24], [0, 1, 1, 0], clamp);
  if (op <= 0) return null;
  const k = interpolate(f, [H.ATRAS - 12, H.DELANTERA + 6], [0, 1], {...clamp, easing: suave});
  const del = Math.round(interpolate(k, [0, 1], [45, 10]));
  return (
    <Panel op={op} color={C.ambar}>
      <Titulo color={C.ambar}>ACELERANDO A FONDO · PESO EN CADA RUEDA</Titulo>
      {fila('Rueda trasera', (100 - del) / 100, `${100 - del}%`, C.cian)}
      {fila('Rueda delantera', del / 100, `${del}%`, del < 20 ? C.rojo : C.ambar)}
    </Panel>
  );
};

// Gráfico del vaivén que crece
const Crece: React.FC<{f: number}> = ({f}) => {
  const op = interpolate(f, [H.CRECE + 2, H.CRECE + 16, H.MANUBRIO + 30, H.MANUBRIO + 44], [0, 1, 1, 0], clamp);
  if (op <= 0) return null;
  const dibujo = interpolate(f, [H.CRECE + 4, H.DIEZ], [0, 1], clamp);
  const n = 160;
  const pts: string[] = [];
  for (let i = 0; i <= n * dibujo; i++) {
    const u = i / n;
    const A = 6 + 54 * (Math.exp(2.6 * u) - 1) / (Math.exp(2.6) - 1);
    pts.push(`${20 + u * 860},${75 - A * Math.sin(u * 2 * Math.PI * 7)}`);
  }
  return (
    <Panel op={op} color={C.rojo}>
      <Titulo color={C.rojo}>ÁNGULO DEL MANUBRIO</Titulo>
      <svg width={900} height={150} style={{display: 'block', marginTop: 12}}>
        <line x1={20} y1={75} x2={880} y2={75} stroke="rgba(255,255,255,0.25)" strokeWidth={2} strokeDasharray="6 8" />
        <polyline points={pts.join(' ')} fill="none" stroke={C.rojo} strokeWidth={5} style={{filter: `drop-shadow(0 0 6px ${C.rojo})`}} />
      </svg>
      <div style={{fontFamily: TITULAR, fontWeight: 900, fontSize: 48, color: C.blanco, marginTop: 6, opacity: interpolate(f, [H.DIEZ - 14, H.DIEZ], [0, 1], clamp)}}>
        <span style={{color: C.rojo}}>5 a 10</span> sacudidas por segundo
      </div>
    </Panel>
  );
};

const Amortiguador: React.FC<{f: number}> = ({f}) => {
  const op = interpolate(f, [H.AMORT - 4, H.AMORT + 10, H.MANOS, H.MANOS + 14], [0, 1, 1, 0], clamp);
  if (op <= 0) return null;
  return (
    <Panel op={op} color={C.verde}>
      <Titulo color={C.verde}>AMORTIGUADOR DE DIRECCIÓN</Titulo>
      <div style={{fontFamily: TITULAR, fontWeight: 900, fontSize: 52, color: C.blanco, marginTop: 8, lineHeight: 1.12}}>
        Frena el vaivén
        <br />
        <span style={{color: C.verde, opacity: interpolate(f, [H.FRENA + 10, H.FRENA + 24], [0, 1], clamp)}}>antes de que crezca</span>
      </div>
    </Panel>
  );
};

const Manos: React.FC<{f: number}> = ({f}) => {
  const op = interpolate(f, [H.MANOS + 4, H.MANOS + 18, H.FIN, H.FIN + 14], [0, 1, 1, 0], clamp);
  if (op <= 0) return null;
  const item = (desde: number, icono: string, color: string, texto: string) => (
    <div style={{display: 'flex', alignItems: 'center', gap: 20, marginTop: 14, opacity: interpolate(f, [desde - 8, desde + 2], [0, 1], clamp)}}>
      <span style={{fontFamily: TITULAR, fontWeight: 900, fontSize: 50, color, width: 44, textAlign: 'center'}}>{icono}</span>
      <span style={{fontFamily: TITULAR, fontWeight: 900, fontSize: 46, color: C.blanco}}>{texto}</span>
    </div>
  );
  return (
    <Panel op={op} color={C.ambar}>
      <Titulo color={C.ambar}>SI TE PASA</Titulo>
      {item(H.APRIETES, '✕', C.rojo, 'No aprietes el manubrio')}
      {item(H.FRENES, '✕', C.rojo, 'No frenes de golpe')}
      {item(H.SUELTA, '✓', C.verde, 'Suelta el acelerador suave')}
    </Panel>
  );
};

export const Holograma: React.FC = () => {
  const f = useCurrentFrame();
  const entrada = interpolate(f, [0, 12], [0, 1], clamp);
  const salida = interpolate(f, [H.DUR - 25, H.DUR - 5], [1, 0], clamp);
  const barrido = interpolate(f, [0, 22], [-100, 2000], clamp);
  const X = x1(f);
  const Z = z1(f);
  const X2 = x2(f);
  const lenta = interpolate(f, [H.TUERCE - 4, H.TUERCE + 8, CAIDA + 10, CAIDA + 22], [0, 1, 1, 0], clamp);
  const lenta2 = interpolate(f, [BACHE2 - 6, BACHE2 + 4, BACHE2 + 50, BACHE2 + 62], [0, 1, 1, 0], clamp);
  return (
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, #0b2234 0%, #040b14 60%, #01040a 100%)', opacity: Math.min(entrada, salida)}}>
      <ThreeCanvas width={1080} height={1920} camera={{fov: FOV, near: 0.1, far: 2000, position: [0, 10, 20]}}>
        <Camara f={f} />
        <Escena f={f} />
      </ThreeCanvas>

      <Etiqueta3D f={f} punto={new THREE.Vector3(X + 0.7, 1.4, 0)} desde={10} hasta={H.ARRANCON + 6} color={C.cian} texto="Bamboleo de velocidad" dx={40} dy={-260} />
      <Etiqueta3D f={f} punto={new THREE.Vector3(X, 0.32, 0)} desde={H.FONDO - 6} hasta={H.PESO + 8} color={C.ambar} texto="Acelerador a fondo" dx={-40} dy={240} />
      <Etiqueta3D f={f} punto={new THREE.Vector3(X + 0.3, 1.0, 0)} desde={H.ATRAS - 6} hasta={H.DELANTERA - 2} color={C.cian} texto="El peso se va atrás" dx={-40} dy={-240} />
      <Etiqueta3D f={f} punto={new THREE.Vector3(X + 1.42, 0.38, 0)} desde={H.DELANTERA - 2} hasta={H.TOQUE + 6} color={C.rojo} texto="Casi flotando" dx={40} dy={220} />
      <Etiqueta3D f={f} punto={new THREE.Vector3(X_BACHE1, 0.05, 0.3)} desde={H.BACHE - 4} hasta={H.TOQUE_W + 2} color={C.ambar} texto="Un bache" dx={40} dy={200} />
      <Etiqueta3D f={f} punto={new THREE.Vector3(X + 1.0, 1.1, Z)} desde={H.TOQUE_W - 2} hasta={H.PASA + 4} color={C.ambar} texto="Se tuerce un poco" dx={-40} dy={-260} />
      <Etiqueta3D f={f} punto={new THREE.Vector3(X + 1.4, 0.3, Z)} desde={H.CENTRO - 6} hasta={H.PASA_W} color={C.cian} texto="Vuelve al centro…" dx={-40} dy={240} />
      <Etiqueta3D f={f} punto={new THREE.Vector3(X + 1.4, 0.3, Z)} desde={H.PASA_W - 2} hasta={H.CRECE + 4} color={C.rojo} texto="…y se pasa" dx={-40} dy={240} />
      <Etiqueta3D f={f} punto={new THREE.Vector3(X + 1.0, 1.1, Z)} desde={H.GOLPEA - 6} hasta={H.CAE - 10} color={C.rojo} texto="Golpea de lado a lado" dx={-40} dy={-260} />
      <Etiqueta3D f={f} punto={new THREE.Vector3(X2 + HD.x - 0.12, HD.y, -CARRIL)} desde={H.AMORT - 4} hasta={H.FRENA + 4} color={C.verde} texto="Amortiguador" dx={-40} dy={240} />
      <Etiqueta3D f={f} punto={new THREE.Vector3(X_BACHE2, 0.05, -CARRIL + 0.3)} desde={H.FRENA + 4} hasta={H.MANOS + 4} color={C.verde} texto="El vaivén se apaga" dx={-40} dy={240} />

      {(lenta > 0 || lenta2 > 0) && (
        <div style={{position: 'absolute', right: 60, top: 1400, opacity: Math.max(lenta, lenta2)}}>
          <Pastilla color={C.ambar} punto tam={26}>
            Cámara lenta
          </Pastilla>
        </div>
      )}

      <Peso f={f} />
      <Crece f={f} />
      <Amortiguador f={f} />
      <Manos f={f} />
      <AbsoluteFill
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, rgba(34,211,238,0.05) 0px, rgba(34,211,238,0.05) 2px, transparent 2px, transparent 6px)',
          mixBlendMode: 'screen',
        }}
      />
      <div style={{position: 'absolute', left: 0, top: barrido, width: '100%', height: 6, background: C.cian, boxShadow: `0 0 40px 18px ${C.cian}88`}} />
    </AbsoluteFill>
  );
};
