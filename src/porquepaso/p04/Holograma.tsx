import React, {useLayoutEffect} from 'react';
import * as THREE from 'three';
import {ThreeCanvas} from '@remotion/three';
import {useThree} from '@react-three/fiber';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';
import {Holo, Linea, caja, proyectar} from '../three/holo';
import {C} from '../estilo';
import {Pastilla} from '../hud';
import {H} from './tiempos';
export {H};

// =====================================================================
// Holograma del video 04: el cruce, el empujón de la camioneta, la barrera,
// el tren que no puede frenar y el conductor que corre en diagonal hacia el tren.
// Ejes (metros): la calle va en x (los autos avanzan hacia +x), las vías en z (el tren viene desde −z).
// =====================================================================
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const suave = Easing.inOut(Easing.cubic);
const BLANCO = '#E0F2FE';

// ---------- Estado de la escena ----------
// SUV: detenido antes del cruce; el empujón lo deja sobre las vías
export function xSuv(f: number) {
  const empujon = interpolate(f, [H.EMPUJA - 2, H.EMPUJA + 14], [-7.2, -0.3], {...clamp, easing: Easing.out(Easing.cubic)});
  const retro = interpolate(f, [H.RETRO, H.RETRO + 10, H.RETRO + 22], [0, -0.5, -0.35], clamp);
  return empujon + retro;
}
const xCamioneta = (f: number) =>
  interpolate(f, [H.CAMIONETA - 40, H.EMPUJA, H.EMPUJA + 14, H.EMPUJA + 30], [-30, -12.0, -6.8, -7.4], {...clamp, easing: Easing.inOut(Easing.quad)});
// Barrera del lado del SUV: baja justo después del empujón
const barrera = (f: number) => interpolate(f, [H.BARRERA - 30, H.BARRERA + 5], [Math.PI / 2 - 0.05, 0], {...clamp, easing: Easing.inOut(Easing.quad)});
const lucesOn = (f: number) => f >= H.EMPUJA - 40;
// Tren: llega al cruce en el impacto, ~70 km/h ≈ 0.65 m por fotograma
const V_TREN = 0.65;
function zTren(f: number) {
  if (f <= H.IMPACTO) return -V_TREN * (H.IMPACTO - f) + 1.5;
  let z = 1.5;
  for (let i = H.IMPACTO; i < f; i++) z += V_TREN * interpolate(i, [H.IMPACTO, H.IMPACTO + 120], [1, 0], clamp);
  return z;
}
// SUV arrastrado después del impacto
function suvTrasImpacto(f: number) {
  if (f < H.IMPACTO) return {z: 0, rot: 0, y: 0};
  const z = zTren(f) - 1.5;
  return {z, rot: interpolate(f, [H.IMPACTO, H.IMPACTO + 30], [0, 2.4], clamp), y: interpolate(f, [H.IMPACTO, H.IMPACTO + 12, H.IMPACTO + 30], [0, 0.8, 0], clamp)};
}
// Conductor: sale y corre en diagonal (hacia −x y −z: lejos de las vías y hacia donde viene el tren)
function conductor(f: number) {
  const t = interpolate(f, [H.CORRER, H.CORRER + 75], [0, 1], {...clamp, easing: Easing.out(Easing.quad)});
  const base = new THREE.Vector3(xSuv(Math.min(f, H.SALIR)) - 0.4, 0, -1.4);
  return base.add(new THREE.Vector3(-7.5 * t, 0, -7.5 * t));
}

// ---------- Cámara ----------
type ClaveCam = [number, [number, number, number], [number, number, number]];
const V = (x: number, y: number, z: number): [number, number, number] => [x, y, z];
const CAM: ClaveCam[] = [
  [0, V(-26, 18, 26), V(-4, 0, 0)],
  [H.DETENIDO + 20, V(-20, 9, 18), V(-4, 0, 0)],
  [H.CAMIONETA + 20, V(-26, 8, 16), V(-8, 0.5, 1)],
  [H.EMPUJA + 10, V(-17, 7, 14), V(-4, 0.5, 1)],
  [H.RETRO + 10, V(-14, 5.5, 12), V(-2.5, 0.8, 1)],
  [H.BAJADO + 10, V(-13, 6, 12), V(-2.5, 0.8, 1)],
  [H.FRENAR + 30, V(3.5, 3.5, 11), V(-0.5, 1.5, -60)],
  [H.KM + 50, V(3.2, 3.2, 9.5), V(-0.5, 1.5, -50)],
  [H.SALIR + 10, V(4, 6, 8), V(-2, 0.8, -2)],
  [H.CORRER + 40, V(3, 6.5, 5), V(-6.5, 0.8, -7)],
  [H.IMPACTO - 10, V(-24, 13, 18), V(-3, 0, -3)],
  [H.IMPACTO + 25, V(-24, 15, 24), V(-1, 0, 4)],
  [H.DIAGONAL, V(-28, 28, 6), V(-3, 0, -2)],
  [H.PEDAZOS + 20, V(-26, 30, 2), V(-2, 0, 2)],
  [H.FIN - 5, V(-20, 20, -18), V(-3, 0, 0)],
  [H.DUR, V(-32, 32, -32), V(0, 0, 0)],
];
export const FOV = 40;
export function camaraEn(f: number) {
  const fr = CAM.map((k) => k[0]);
  const p = new THREE.Vector3(...([0, 1, 2].map((i) => interpolate(f, fr, CAM.map((k) => k[1][i]), {...clamp, easing: suave})) as [number, number, number]));
  const t = new THREE.Vector3(...([0, 1, 2].map((i) => interpolate(f, fr, CAM.map((k) => k[2][i]), {...clamp, easing: suave})) as [number, number, number]));
  const temblor = interpolate(f, [H.IMPACTO - 2, H.IMPACTO, H.IMPACTO + 20], [0, 0.6, 0], clamp);
  p.add(new THREE.Vector3(Math.sin(f * 2.1) * temblor, Math.cos(f * 2.7) * temblor, 0));
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
const RUEDA = new THREE.CylinderGeometry(0.36, 0.36, 0.25, 14);
const Vehiculo: React.FC<{largo: number; alto: number; color: string; caja_?: boolean; op?: number}> = ({largo, alto, color, caja_ = false, op = 1}) => (
  <group>
    <Holo geom={caja(largo, alto * 0.5, 1.9)} color={color} relleno={0.1 * op} linea={0.85 * op} position={[0, 0.35 + alto * 0.25, 0]} />
    {caja_ ? (
      <Holo geom={caja(largo * 0.38, alto * 0.45, 1.8)} color={color} relleno={0.08 * op} linea={0.8 * op} position={[largo * 0.18, 0.35 + alto * 0.72, 0]} />
    ) : (
      <Holo geom={caja(largo * 0.62, alto * 0.45, 1.8)} color={color} relleno={0.08 * op} linea={0.8 * op} position={[-largo * 0.08, 0.35 + alto * 0.72, 0]} />
    )}
    {[-1, 1].map((sx) =>
      [-1, 1].map((sz) => (
        <Holo key={`${sx}${sz}`} geom={RUEDA} color={color} relleno={0.1 * op} linea={0.6 * op} angulo={30} position={[sx * largo * 0.33, 0.36, sz * 0.95]} rotation={[Math.PI / 2, 0, 0]} />
      ))
    )}
  </group>
);

const Vias: React.FC = () => {
  const out = [];
  for (const x of [-0.72, 0.72, 5.3, 6.74])
    out.push(<Holo key={'r' + x} geom={caja(0.07, 0.1, 400)} color={C.cian} relleno={0.12} linea={0.55} position={[x, 0.08, -150]} />);
  for (let z = -90; z <= 40; z += 1.2) {
    out.push(<Linea key={'d' + z} puntos={[new THREE.Vector3(-1.3, 0.03, z), new THREE.Vector3(1.3, 0.03, z)]} color={C.cian} opacidad={0.35} />);
    out.push(<Linea key={'e' + z} puntos={[new THREE.Vector3(4.7, 0.03, z), new THREE.Vector3(7.3, 0.03, z)]} color={C.cian} opacidad={0.35} />);
  }
  return <group>{out}</group>;
};

const Calle: React.FC = () => {
  const out = [];
  for (const z of [-4, 4]) out.push(<Holo key={z} geom={caja(100, 0.04, 0.12)} color={'#CBD5E1'} relleno={0.3} linea={0.5} position={[-10, 0.02, z]} />);
  for (let x = -60; x < 40; x += 4)
    if (Math.abs(x + 1) > 3) out.push(<Holo key={'c' + x} geom={caja(2, 0.03, 0.12)} color={C.ambar} relleno={0.4} linea={0.6} position={[x + 1, 0.02, 0]} />);
  // línea de detención antes del cruce
  out.push(<Holo key="stop" geom={caja(0.3, 0.03, 3.8)} color={C.blanco} relleno={0.5} linea={0.8} position={[-5.4, 0.02, 2.1]} />);
  return <group>{out}</group>;
};

const Barrera: React.FC<{f: number}> = ({f}) => {
  const ang = barrera(f);
  const parpadeo = lucesOn(f) && Math.floor(f / 8) % 2 === 0;
  const cerrada = ang < 0.2;
  return (
    <group position={[-3.4, 0, 4.6]}>
      <Holo geom={caja(0.25, 3.2, 0.25)} color={C.blanco} relleno={0.15} linea={0.8} position={[0, 1.6, 0]} />
      {[-0.35, 0.35].map((dz, i) => (
        <mesh key={i} position={[0, 2.9, dz]}>
          <sphereGeometry args={[0.18, 10, 8]} />
          <meshBasicMaterial color={C.rojo} transparent opacity={lucesOn(f) ? ((i === 0) === parpadeo ? 1 : 0.15) : 0.1} blending={THREE.AdditiveBlending} depthWrite={false} />
        </mesh>
      ))}
      <group position={[0, 1.1, 0]} rotation={[-ang, 0, 0]}>
        <Holo geom={caja(0.12, 0.12, 6.5)} color={cerrada ? C.rojo : C.blanco} relleno={0.3} linea={1} position={[0, 0, -3.25]} />
      </group>
    </group>
  );
};

const Tren: React.FC<{f: number}> = ({f}) => {
  const z = zTren(f);
  const out = [];
  for (let k = 0; k < 3; k++) {
    const zc = z - 13 - k * 26;
    out.push(
      <group key={k} position={[0, 0, zc]}>
        <Holo geom={caja(3.1, 4.6, 25)} color={k === 0 ? '#93C5FD' : BLANCO} relleno={0.06} linea={0.7} position={[0, 2.6, 0]} />
        <Holo geom={caja(3.12, 0.5, 25)} color={C.rojo} relleno={0.15} linea={0.6} position={[0, 2.1, 0]} />
        {[-1, 1].map((s) => (
          <Linea key={s} puntos={[new THREE.Vector3(s * 1.56, 3.6, -11), new THREE.Vector3(s * 1.56, 3.6, 11)]} color={BLANCO} opacidad={0.5} />
        ))}
      </group>
    );
  }
  return <group>{out}</group>;
};

// Distancia de frenado: barra desde el tren hacia adelante (más de 1 km)
const Frenado: React.FC<{f: number}> = ({f}) => {
  const op = interpolate(f, [H.FRENAR + 20, H.FRENAR + 40, H.SALIR - 20, H.SALIR], [0, 1, 1, 0], clamp);
  if (op <= 0) return null;
  const z0 = zTren(f);
  const largo = interpolate(f, [H.FRENAR + 30, H.KM + 10], [0, 1100], {...clamp, easing: Easing.out(Easing.cubic)});
  const marcas = [];
  for (let d = 100; d <= largo; d += 100)
    marcas.push(<Linea key={d} puntos={[new THREE.Vector3(-6, 0.3, z0 + d), new THREE.Vector3(6, 0.3, z0 + d)]} color={C.rojo} opacidad={0.7 * op} />);
  return (
    <group>
      <Holo geom={caja(8, 0.2, Math.max(0.1, largo))} color={C.rojo} relleno={0.12 * op} linea={0.9 * op} position={[0, 0.2, z0 + largo / 2]} />
      {marcas}
    </group>
  );
};

// Maniquí que corre
const GP = {
  torso: new THREE.CapsuleGeometry(0.17, 0.45, 3, 10),
  cabeza: new THREE.SphereGeometry(0.13, 12, 10),
  pierna: new THREE.CapsuleGeometry(0.08, 0.75, 3, 8),
  brazo: new THREE.CapsuleGeometry(0.06, 0.55, 3, 8),
};
const Persona: React.FC<{f: number; color: string; corre: boolean}> = ({f, color, corre}) => {
  const a = corre ? Math.sin(f * 0.6) * 0.7 : 0;
  const P = (g: THREE.BufferGeometry, extra: React.JSX.IntrinsicElements['group']) => <Holo geom={g} color={color} relleno={0.3} linea={1} angulo={28} {...extra} />;
  return (
    <group rotation={[0, corre ? Math.PI * 0.75 : 0, 0]}>
      {[-1, 1].map((s) => (
        <group key={s} position={[0, 0.95, s * 0.12]} rotation={[0, 0, s * a]}>
          {P(GP.pierna, {position: [0, -0.47, 0]})}
        </group>
      ))}
      <group rotation={[0, 0, corre ? -0.25 : 0]}>
        {P(GP.torso, {position: [0, 1.32, 0]})}
        {P(GP.cabeza, {position: [0, 1.82, 0]})}
        {[-1, 1].map((s) => (
          <group key={s} position={[0, 1.6, s * 0.26]} rotation={[0, 0, -s * a]}>
            {P(GP.brazo, {position: [0, -0.32, 0]})}
          </group>
        ))}
      </group>
    </group>
  );
};

// Pedazos que salen despedidos hacia adelante (en la dirección del tren)
const PEDAZO = new THREE.TetrahedronGeometry(0.25, 0);
const Pedazos: React.FC<{f: number}> = ({f}) => {
  if (f < H.IMPACTO) return null;
  const t = f - H.IMPACTO;
  const out = [];
  for (let k = 0; k < 40; k++) {
    const ang = ((k * 37) % 100) / 100 - 0.5; // abanico
    const v = 0.25 + ((k * 13) % 10) / 25;
    const dz = Math.min(t, 50) * v;
    const dx = dz * ang * 0.9;
    const y = Math.max(0.1, 0.2 + Math.min(t, 50) * 0.08 * (1 - Math.min(t, 50) / 50) * (1 + (k % 3)));
    out.push(<Holo key={k} geom={PEDAZO} color={C.rojo} relleno={0.3} linea={0.9} angulo={1} position={[dx, y, 1.5 + dz]} rotation={[k + t * 0.2, k * 2, t * 0.1]} />);
  }
  return <group>{out}</group>;
};

// Zonas: roja hacia donde salen los pedazos, verde hacia donde viene el tren
const Zonas: React.FC<{f: number}> = ({f}) => {
  const op = interpolate(f, [H.DIAGONAL - 10, H.DIAGONAL + 10], [0, 1], clamp);
  if (op <= 0) return null;
  const roja = interpolate(f, [H.PEDAZOS - 10, H.PEDAZOS + 10], [0, 1], clamp);
  return (
    <group>
      <Holo geom={caja(12, 0.05, 14)} color={C.verde} relleno={0.1 * op} linea={0.7 * op} position={[-7, 0.05, -8]} />
      <Holo geom={caja(16, 0.05, 22)} color={C.rojo} relleno={0.1 * roja} linea={0.7 * roja} position={[0, 0.05, 13]} />
    </group>
  );
};

const Escena: React.FC<{f: number}> = ({f}) => {
  const aparicion = interpolate(f, [0, 20], [0, 1], clamp);
  const s = suvTrasImpacto(f);
  const pc = conductor(f);
  const fueraSuv = f >= H.SALIR;
  return (
    <group scale={[1, aparicion, 1]}>
      <gridHelper args={[400, 200, C.cian, C.cian]} position={[0, -0.01, 0]}>
        <lineBasicMaterial attach="material" color={C.cian} transparent opacity={0.06} />
      </gridHelper>
      <Calle />
      <Vias />
      <Barrera f={f} />
      <group position={[xSuv(f), s.y, 2 + s.z]} rotation={[0, s.rot, 0]}>
        <Vehiculo largo={4.6} alto={1.7} color={'#F8FAFC'} />
      </group>
      <group position={[xCamioneta(f), 0, 2]}>
        <Vehiculo largo={5.6} alto={1.9} color={C.ambar} caja_ op={interpolate(f, [H.CAMIONETA - 30, H.CAMIONETA], [0.15, 1], clamp)} />
      </group>
      {fueraSuv && (
        <group position={pc.toArray()}>
          <Persona f={f} color={C.verde} corre={f >= H.CORRER} />
        </group>
      )}
      <Tren f={f} />
      <Pedazos f={f} />
      <Zonas f={f} />
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
  const ly = Math.min(Math.max(y + dy, 300), 1360);
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


// Comparación 2D: distancia para frenar de un auto contra la de un tren
const ComparaFrenado: React.FC<{f: number}> = ({f}) => {
  const op = interpolate(f, [H.FRENAR + 15, H.FRENAR + 30, H.SALIR - 20, H.SALIR - 5], [0, 1, 1, 0], clamp);
  if (op <= 0) return null;
  const auto = interpolate(f, [H.FRENAR + 30, H.FRENAR + 50], [0, 0.04], clamp);
  const tren = interpolate(f, [H.KM - 25, H.KM + 25], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  const fila = (t: string, w: number, valor: string, color: string) => (
    <div style={{marginTop: 18}}>
      <div style={{display: 'flex', justifyContent: 'space-between', fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, fontSize: 30, color: C.blanco}}>
        <span>{t}</span>
        <span style={{color}}>{valor}</span>
      </div>
      <div style={{height: 22, marginTop: 8, borderRadius: 11, background: 'rgba(255,255,255,0.1)', overflow: 'hidden'}}>
        <div style={{width: `${Math.max(2, w * 100)}%`, height: '100%', background: color, boxShadow: `0 0 16px ${color}`}} />
      </div>
    </div>
  );
  return (
    <div style={{position: 'absolute', top: 300, left: 60, right: 60, padding: '26px 30px', background: 'rgba(4,14,24,0.8)', border: `2px solid ${C.rojo}`, borderRadius: 24, boxShadow: `0 0 30px ${C.rojo}44`, opacity: op}}>
      <div style={{fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, fontSize: 26, letterSpacing: 2, color: C.rojo}}>DISTANCIA PARA FRENAR</div>
      {fila('Auto', auto, '~40 m', C.verde)}
      {fila('Tren', tren, '+1 km', C.rojo)}
    </div>
  );
};

export const Holograma: React.FC = () => {
  const f = useCurrentFrame();
  const entrada = interpolate(f, [0, 12], [0, 1], clamp);
  const salida = interpolate(f, [H.DUR - 25, H.DUR - 5], [1, 0], clamp);
  const barrido = interpolate(f, [0, 22], [-100, 2000], clamp);
  const flash = interpolate(f, [H.IMPACTO, H.IMPACTO + 2, H.IMPACTO + 12], [0, 0.4, 0], clamp);
  const suv = new THREE.Vector3(xSuv(f), 2.2, 2);
  const tren = new THREE.Vector3(0, 5, zTren(f) - 6);
  return (
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, #0b2234 0%, #040b14 60%, #01040a 100%)', opacity: Math.min(entrada, salida)}}>
      <ThreeCanvas width={1080} height={1920} camera={{fov: FOV, near: 0.1, far: 3000, position: [0, 10, 20]}}>
        <Camara f={f} />
        <Escena f={f} />
      </ThreeCanvas>

      <Etiqueta3D f={f} punto={suv} desde={H.DETENIDO + 10} hasta={H.CAMIONETA + 10} color={C.verde} texto="Detenido: bien" dx={40} dy={-200} />
      <Etiqueta3D f={f} punto={new THREE.Vector3(0, 0.2, -8)} desde={H.DETENIDO + 20} hasta={H.CAMIONETA + 10} texto="Vías" dx={60} dy={160} />
      <Etiqueta3D f={f} punto={new THREE.Vector3(xCamioneta(f), 2.4, 2)} desde={H.CAMIONETA + 10} hasta={H.BARRERA} color={C.ambar} texto="Camioneta" dx={-40} dy={-200} />
      <Etiqueta3D f={f} punto={new THREE.Vector3(-4.7, 1.2, 2)} desde={H.EMPUJA} hasta={H.BARRERA} color={C.rojo} texto="¡Impacto!" dx={60} dy={180} />
      <Etiqueta3D f={f} punto={new THREE.Vector3(-3.4, 1.1, 1.5)} desde={H.BARRERA + 5} hasta={H.FRENAR + 10} color={C.rojo} texto="Barrera abajo" dx={-60} dy={200} />
      <Etiqueta3D f={f} punto={suv} desde={H.BAJADO} hasta={H.FRENAR + 10} color={C.rojo} texto="Atrapado" dx={60} dy={-220} />
      <Etiqueta3D f={f} punto={tren} desde={H.FRENAR + 35} hasta={H.SALIR - 10} color={'#93C5FD'} texto="Tren" dx={60} dy={160} />
      <Etiqueta3D f={f} punto={conductor(f).add(new THREE.Vector3(0, 2, 0))} desde={H.CORRER} hasta={H.IMPACTO + 20} color={C.verde} texto="¡Corre!" dx={-60} dy={-180} />
      <Etiqueta3D f={f} punto={new THREE.Vector3(-7, 0.1, -8)} desde={H.DIAGONAL} hasta={H.FIN} color={C.verde} texto="Hacia el tren, en diagonal" dx={-30} dy={-220} />
      <Etiqueta3D f={f} punto={new THREE.Vector3(0, 0.1, 13)} desde={H.PEDAZOS} hasta={H.FIN} color={C.rojo} texto="Aquí caen los pedazos" dx={-30} dy={200} />

      <ComparaFrenado f={f} />
      <AbsoluteFill
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, rgba(34,211,238,0.05) 0px, rgba(34,211,238,0.05) 2px, transparent 2px, transparent 6px)',
          mixBlendMode: 'screen',
        }}
      />
      <div style={{position: 'absolute', left: 0, top: barrido, width: '100%', height: 6, background: C.cian, boxShadow: `0 0 40px 18px ${C.cian}88`}} />
      <AbsoluteFill style={{background: `rgba(255,255,255,${flash})`}} />
    </AbsoluteFill>
  );
};
