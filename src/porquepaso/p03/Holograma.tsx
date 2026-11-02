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
// Holograma del video 03: tabla de pump foil, mástil, ala bajo el agua,
// la chica bombeando y el delfín. El equipo queda en el origen; el agua se desplaza.
// =====================================================================
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const suave = Easing.inOut(Easing.cubic);
const AGUA = '#38BDF8';
const DORADO = '#FDE68A';

// ---------- Movimiento del bombeo ----------
const PERIODO = 34; // fotogramas por bombeo
// En la demostración el bombeo va en cámara lenta
function fase(f: number) {
  // integra la "velocidad del tiempo" para que la cámara lenta sea continua
  let t = 0;
  for (let i = 0; i < f; i++) t += interpolate(i, [H.BOMBEO - 10, H.BOMBEO + 10, H.DELFIN - 5, H.DELFIN + 10], [1, 0.4, 0.4, 1], clamp);
  return (t / PERIODO) * Math.PI * 2;
}
// 0 → de pie, 1 → rodillas flexionadas (empuja)
const flexion = (f: number) => 0.5 + 0.5 * Math.sin(fase(f));
// La tabla sube y baja y cabecea con el bombeo
const altura = (f: number) => 0.32 + 0.06 * Math.sin(fase(f) + 1.2) + interpolate(f, [H.FUERA, H.FUERA + 25], [0, 0.08], clamp);
const cabeceo = (f: number) => 0.07 * Math.sin(fase(f) + 0.4); // rad
const avance = (f: number) => {
  let x = 0;
  for (let i = 0; i < f; i++) x += 0.06 * interpolate(i, [H.BOMBEO - 10, H.BOMBEO + 10, H.DELFIN - 5, H.DELFIN + 10], [1, 0.4, 0.4, 1], clamp);
  return x;
};

// Geometría del equipo (metros). La tabla mira hacia +x.
const MASTIL = 0.8;
export const PE = {
  ala: new THREE.Vector3(0.28, -MASTIL - 0.02, 0),
  mastil: new THREE.Vector3(0, -0.4, 0),
  tabla: new THREE.Vector3(0, 0.03, 0),
  estab: new THREE.Vector3(-0.42, -MASTIL - 0.02, 0),
};

// Punto del equipo → mundo (aplica altura y cabeceo)
export function puntoEquipo(p: THREE.Vector3, f: number) {
  const a = cabeceo(f);
  return new THREE.Vector3(p.x * Math.cos(a) - p.y * Math.sin(a), p.x * Math.sin(a) + p.y * Math.cos(a) + altura(f), p.z);
}

// ---------- Cámara ----------
type ClaveCam = [number, [number, number, number], [number, number, number]];
const V = (x: number, y: number, z: number): [number, number, number] => [x, y, z];
const MEDIO = Math.round((H.CIERRE + H.FIN) / 2);
const CAM: ClaveCam[] = [
  [0, V(-5.5, 2.6, 7.0), V(0, 0.5, 0)],
  [H.MASTIL - 10, V(-4.2, 1.4, 5.6), V(0, 0.2, 0)],
  [H.ALA, V(2.6, -0.2, 3.8), V(0.1, -0.35, 0)],
  [H.AVION + 40, V(2.0, -0.5, 2.9), V(0.2, -0.55, 0)],
  [H.DENSA + 20, V(3.8, 0.3, 5.6), V(0.6, 0.0, 0.7)],
  [H.LEVANTA, V(3.6, 0.7, 5.6), V(0.4, 0.3, 0.6)],
  [H.FUERA + 20, V(-3.4, 0.6, 4.4), V(0, 0.45, 0)],
  [H.MOTOR + 25, V(-2.8, 1.8, 4.0), V(0, 0.8, 0)],
  [H.BOMBEO + 20, V(0.2, 0.5, 6.2), V(0, 0.25, 0)],
  [H.ARRIBA + 20, V(0.6, -0.1, 4.6), V(0.15, -0.2, 0)],
  [H.DELFIN + 25, V(1.0, -0.2, 6.4), V(0.1, -0.45, -0.6)],
  [H.CIERRE + 10, V(-4, 1.2, 5.6), V(0, 0.4, 0)],
  [MEDIO, V(0.5, 1.6, 6.4), V(0, 0.4, 0)],
  [H.FIN - 5, V(4.2, 1.1, 4.8), V(0, 0.4, 0)],
  [H.DUR, V(6, 3.5, 8.5), V(0, 0.2, 0)],
];
export const FOV = 40;
export function camaraEn(f: number) {
  const fr = CAM.map((k) => k[0]);
  const p = new THREE.Vector3(...([0, 1, 2].map((i) => interpolate(f, fr, CAM.map((k) => k[1][i]), {...clamp, easing: suave})) as [number, number, number]));
  const t = new THREE.Vector3(...([0, 1, 2].map((i) => interpolate(f, fr, CAM.map((k) => k[2][i]), {...clamp, easing: suave})) as [number, number, number]));
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
function alaGeom(envergadura: number, cuerda: number, grosor: number, flecha = 0.06) {
  // ala vista desde arriba (x hacia adelante, z envergadura), simétrica
  const s = new THREE.Shape();
  s.moveTo(0, -envergadura / 2);
  s.quadraticCurveTo(cuerda * 0.55, 0, 0, envergadura / 2);
  s.lineTo(-cuerda * 0.35 - flecha, envergadura / 2 - 0.02);
  s.quadraticCurveTo(-cuerda * 0.55, 0, -cuerda * 0.35 - flecha, -envergadura / 2 + 0.02);
  s.closePath();
  const g = new THREE.ExtrudeGeometry(s, {depth: grosor, bevelEnabled: false, curveSegments: 10});
  g.rotateX(Math.PI / 2);
  g.translate(0, grosor / 2, 0);
  return g;
}
const ALA = alaGeom(0.95, 0.22, 0.025);
const ESTAB = alaGeom(0.38, 0.1, 0.015, 0.02);
const TABLA = (() => {
  const s = new THREE.Shape();
  s.moveTo(0.62, 0);
  s.quadraticCurveTo(0.55, 0.24, 0.1, 0.24);
  s.lineTo(-0.55, 0.21);
  s.quadraticCurveTo(-0.62, 0, -0.55, -0.21);
  s.lineTo(0.1, -0.24);
  s.quadraticCurveTo(0.55, -0.24, 0.62, 0);
  const g = new THREE.ExtrudeGeometry(s, {depth: 0.05, bevelEnabled: false, curveSegments: 10});
  g.rotateX(Math.PI / 2);
  g.translate(0, 0.05, 0);
  return g;
})();

const Equipo: React.FC<{f: number}> = ({f}) => {
  const resalta = f >= H.MASTIL - 10 && f < H.FUERA ? 1 : 0;
  const colorMastil = f >= H.MASTIL && f < H.DENSA ? C.ambar : C.cian;
  const colorAla = f >= H.ALA - 6 && f < H.DENSA ? C.ambar : C.cian;
  const inclinaAla = f >= H.INCLINA - 10 && f < H.DELFIN ? 0.12 * Math.sin(fase(f) + 0.4) : 0;
  return (
    <group>
      <Holo geom={TABLA} color={DORADO} relleno={0.1} linea={0.85} angulo={20} />
      <Holo geom={caja(0.03, MASTIL, 0.12)} color={colorMastil} relleno={0.12 + 0.1 * resalta} linea={0.95} position={[0, -MASTIL / 2, 0]} />
      <Holo geom={caja(0.75, 0.025, 0.03)} color={C.cian} relleno={0.2} linea={0.9} position={[-0.07, -MASTIL - 0.01, 0]} />
      <group position={PE.ala.toArray()} rotation={[0, 0, inclinaAla]}>
        <Holo geom={ALA} color={colorAla} relleno={0.15 + 0.1 * resalta} linea={1} angulo={8} />
      </group>
      <Holo geom={ESTAB} color={C.cian} relleno={0.12} linea={0.85} angulo={8} position={PE.estab.toArray()} />
    </group>
  );
};

// ---------- La chica (maniquí holográfico) ----------
const G = {
  torso: new THREE.CapsuleGeometry(0.14, 0.32, 3, 10),
  falda: new THREE.ConeGeometry(0.26, 0.5, 14, 1, true),
  cabeza: new THREE.SphereGeometry(0.1, 12, 10),
  pelo: new THREE.SphereGeometry(0.115, 12, 10, 0, Math.PI * 2, 0, Math.PI * 0.6),
  muslo: new THREE.CapsuleGeometry(0.06, 0.32, 3, 8),
  pierna: new THREE.CapsuleGeometry(0.05, 0.34, 3, 8),
  brazo: new THREE.CapsuleGeometry(0.04, 0.5, 3, 8),
};
const Chica: React.FC<{f: number; color: string; op: number}> = ({f, color, op}) => {
  const b = flexion(f);
  const cadera = 0.35 + 0.35 * b; // ángulo del muslo
  const rodilla = 0.7 + 0.7 * b;
  const L1 = 0.42;
  const L2 = 0.44;
  // altura de la cadera según la flexión (pie en la tabla)
  const yCadera = 0.06 + L2 * Math.cos(rodilla - cadera) + L1 * Math.cos(cadera);
  const brazos = 0.6 + 0.4 * Math.sin(fase(f) + 2.4);
  const P = (g: THREE.BufferGeometry, extra: React.JSX.IntrinsicElements['group'], fuerte = false) => <Holo geom={g} color={color} relleno={(fuerte ? 0.16 : 0.11) * op} linea={0.8 * op} angulo={28} {...extra} />;
  const pierna = (z: number) => (
    <group position={[0, yCadera, z]} rotation={[0, 0, cadera]}>
      {P(G.muslo, {position: [0, -L1 / 2, 0]})}
      <group position={[0, -L1, 0]} rotation={[0, 0, -rodilla]}>
        {P(G.pierna, {position: [0, -L2 / 2, 0]})}
      </group>
    </group>
  );
  return (
    <group position={[-0.05, 0.05, 0]}>
      {pierna(-0.11)}
      {pierna(0.11)}
      <group position={[0, yCadera, 0]} rotation={[0, 0, -(0.1 + 0.3 * b)]}>
        {P(G.falda, {position: [0, 0.08, 0]})}
        {P(G.torso, {position: [0, 0.38, 0]}, true)}
        {P(G.cabeza, {position: [0, 0.74, 0]}, true)}
        {P(G.pelo, {position: [-0.01, 0.76, 0], rotation: [0, 0, 0.3]})}
        {[-1, 1].map((s) => (
          <group key={s} position={[0, 0.56, s * 0.2]} rotation={[-s * brazos, 0, 0]}>
            {P(G.brazo, {position: [0, -0.28, 0]})}
          </group>
        ))}
      </group>
    </group>
  );
};

// ---------- Agua ----------
const SuperficieAgua: React.FC<{f: number; op: number}> = ({f, op}) => {
  const x0 = -(avance(f) % 0.5);
  const lineas = [];
  for (let k = -12; k <= 12; k++) {
    const pts: THREE.Vector3[] = [];
    for (let z = -6; z <= 6; z += 0.5) pts.push(new THREE.Vector3(x0 + k * 0.5, 0.012 * Math.sin(z * 1.3 + f * 0.08 + k), z));
    lineas.push(<Linea key={'x' + k} puntos={pts} color={AGUA} opacidad={0.22 * op} />);
  }
  for (let k = -12; k <= 12; k++) {
    const pts: THREE.Vector3[] = [];
    for (let x = -6; x <= 6; x += 0.5) pts.push(new THREE.Vector3(x, 0.012 * Math.sin(x * 1.1 + f * 0.08 + k), k * 0.5));
    lineas.push(<Linea key={'z' + k} puntos={pts} color={AGUA} opacidad={0.12 * op} />);
  }
  return (
    <group>
      {lineas}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[12, 12]} />
        <meshBasicMaterial color={AGUA} transparent opacity={0.07 * op} side={THREE.DoubleSide} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
      {/* volumen de agua: se nota qué está bajo la superficie */}
      <mesh position={[0, -1.5, 0]}>
        <boxGeometry args={[12, 3, 12]} />
        <meshBasicMaterial color={'#0369A1'} transparent opacity={0.1 * op} side={THREE.BackSide} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
    </group>
  );
};

// Flujo de agua alrededor del ala + flechas de fuerza
const FLECHA_CONO = new THREE.ConeGeometry(0.035, 0.09, 12);
const Flecha: React.FC<{desde: THREE.Vector3; dir: THREE.Vector3; largo: number; color: string; op?: number}> = ({desde, dir, largo, color, op = 1}) => {
  if (largo <= 0.01) return null;
  const d = dir.clone().normalize();
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d);
  const medio = desde.clone().add(d.clone().multiplyScalar(largo / 2));
  const punta = desde.clone().add(d.clone().multiplyScalar(largo));
  return (
    <group>
      <group position={medio.toArray()} quaternion={q}>
        <Holo geom={caja(0.018, largo, 0.018)} color={color} relleno={0.6 * op} linea={op} />
      </group>
      <group position={punta.toArray()} quaternion={q}>
        <Holo geom={FLECHA_CONO} color={color} relleno={0.6 * op} linea={op} angulo={30} />
      </group>
    </group>
  );
};

const FlujoAla: React.FC<{f: number}> = ({f}) => {
  const op = interpolate(f, [H.AVION, H.AVION + 15, H.FIN - 10, H.FIN + 10], [0, 1, 1, 0.4], clamp);
  if (op <= 0) return null;
  const lineas = [];
  const y0 = PE.ala.y;
  for (let k = 0; k < 6; k++) {
    const dy = -0.12 + k * 0.05;
    const pts: THREE.Vector3[] = [];
    for (let x = 1.1; x >= -0.9; x -= 0.05) {
      const cerca = Math.exp(-(((x - PE.ala.x + 0.03) / 0.16) ** 2));
      const des = (dy >= 0 ? 1 : -1) * 0.035 * cerca + (x < PE.ala.x - 0.1 ? -0.04 * (1 - Math.exp(-(PE.ala.x - x))) : 0);
      pts.push(new THREE.Vector3(x, y0 + dy + des, 0.32));
    }
    lineas.push(<Linea key={k} puntos={pts} color={AGUA} opacidad={0.6 * op} />);
  }
  const puntos = [];
  for (let k = 0; k < 6; k++) {
    const x = 1.1 - (((f * 0.045 + k * 0.29) % 1) * 2.0);
    puntos.push(
      <mesh key={k} position={[x, y0 - 0.12 + k * 0.05, 0.32]}>
        <sphereGeometry args={[0.012, 8, 6]} />
        <meshBasicMaterial color={'#E0F7FF'} transparent opacity={op} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
    );
  }
  // Sustentación (verde) y, en el bombeo, el empuje hacia adelante (ámbar)
  const sust = interpolate(f, [H.AVION + 20, H.AVION + 35], [0, 0.45], clamp) * (f >= H.BOMBEO ? 0.75 + 0.35 * flexion(f) : 1);
  const empuje = f >= H.ARRIBA - 5 && f < H.DELFIN + 10 ? interpolate(f, [H.ARRIBA - 5, H.ARRIBA + 10], [0, 1], clamp) * (0.12 + 0.28 * flexion(f)) : 0;
  const base = new THREE.Vector3(PE.ala.x, y0 + 0.03, 0.32);
  return (
    <group>
      {lineas}
      {puntos}
      <Flecha desde={base} dir={new THREE.Vector3(0, 1, 0)} largo={sust} color={C.verde} op={op} />
      <Flecha desde={base.clone().add(new THREE.Vector3(0.05, 0, 0))} dir={new THREE.Vector3(1, 0, 0)} largo={empuje} color={C.ambar} op={op} />
    </group>
  );
};

// Aire contra agua: dos cubos con partículas
const PUNTOS_DENSIDAD = (() => {
  const g = new THREE.BufferGeometry();
  const pts: number[] = [];
  let s = 3;
  const r = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  for (let i = 0; i < 8; i++) pts.push(1.6 + r() * 0.4, 0.35 + r() * 0.4, 1.9 + r() * 0.4);
  for (let i = 0; i < 700; i++) pts.push(1.6 + r() * 0.4, -0.75 + r() * 0.4, 1.9 + r() * 0.4);
  g.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
  return g;
})();
const Densidad: React.FC<{f: number}> = ({f}) => {
  const op = interpolate(f, [H.OCHOCIENTAS - 10, H.OCHOCIENTAS + 5, H.FUERA, H.FUERA + 15], [0, 1, 1, 0], clamp);
  if (op <= 0) return null;
  const geom = PUNTOS_DENSIDAD;
  return (
    <group>
      <Holo geom={caja(0.4, 0.4, 0.4)} color={'#E0F7FF'} relleno={0.03 * op} linea={0.6 * op} position={[1.8, 0.55, 2.1]} />
      <Holo geom={caja(0.4, 0.4, 0.4)} color={AGUA} relleno={0.08 * op} linea={0.9 * op} position={[1.8, -0.55, 2.1]} />
      <points geometry={geom}>
        <pointsMaterial color={'#E0F7FF'} size={0.012} transparent opacity={op} depthWrite={false} blending={THREE.AdditiveBlending} />
      </points>
    </group>
  );
};

// Delfín holográfico (cuerpo de cápsulas + cola que oscila)
const GD = {
  cuerpo: new THREE.SphereGeometry(1, 18, 12),
  hocico: new THREE.CapsuleGeometry(0.05, 0.18, 4, 10),
  aleta: new THREE.ConeGeometry(0.1, 0.22, 4),
  cola: alaGeom(0.5, 0.14, 0.02, 0.04),
};
const Delfin: React.FC<{f: number}> = ({f}) => {
  const op = interpolate(f, [H.DELFIN - 5, H.DELFIN + 15], [0, 1], clamp);
  if (op <= 0) return null;
  const ph = fase(f);
  const colaY = 0.08 * Math.sin(ph);
  const colaA = 0.35 * Math.cos(ph);
  const c = '#7DD3FC';
  return (
    <group position={[0.2, -0.95 + 0.03 * Math.sin(ph + 1), -1.3]} scale={1.35}>
      <Holo geom={GD.cuerpo} color={c} relleno={0.14 * op} linea={0.95 * op} angulo={25} scale={[0.7, 0.17, 0.17]} />
      <Holo geom={GD.hocico} color={c} relleno={0.1 * op} linea={0.7 * op} angulo={25} position={[0.75, -0.03, 0]} rotation={[0, 0, Math.PI / 2]} />
      <Holo geom={GD.aleta} color={c} relleno={0.1 * op} linea={0.7 * op} angulo={25} position={[0.02, 0.2, 0]} rotation={[0, 0, -0.5]} scale={[0.7, 1, 0.25]} />
      <group position={[-0.62, colaY, 0]} rotation={[0, 0, colaA]}>
        <Holo geom={GD.cola} color={C.ambar} relleno={0.25 * op} linea={op} angulo={8} rotation={[0, 0, 0]} />
      </group>
      <Flecha desde={new THREE.Vector3(-0.62, colaY + 0.05, 0.05)} dir={new THREE.Vector3(1, 0, 0)} largo={op * (0.15 + 0.2 * Math.abs(Math.sin(ph)))} color={C.ambar} op={op} />
    </group>
  );
};

// Salpicaduras / estela de la tabla
const Estela: React.FC<{f: number}> = ({f}) => {
  const out = [];
  for (let k = 0; k < 10; k++) {
    const u = ((f * 0.03 + k * 0.1) % 1);
    out.push(
      <mesh key={k} position={[-0.05 - u * 2.2, 0.01, (k % 2 ? 1 : -1) * (0.04 + u * 0.35)]}>
        <sphereGeometry args={[0.012 + 0.01 * (1 - u), 6, 4]} />
        <meshBasicMaterial color={'#E0F7FF'} transparent opacity={0.6 * (1 - u)} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
    );
  }
  return <group>{out}</group>;
};

const Escena: React.FC<{f: number}> = ({f}) => {
  const aparicion = interpolate(f, [0, 20], [0, 1], clamp);
  return (
    <group scale={[1, aparicion, 1]}>
      <SuperficieAgua f={f} op={aparicion} />
      <Estela f={f} />
      <group position={[0, altura(f), 0]} rotation={[0, 0, cabeceo(f)]}>
        <Equipo f={f} />
        <Chica f={f} color={'#F0ABFC'} op={1} />
        <FlujoAla f={f} />
      </group>
      <Densidad f={f} />
      <Delfin f={f} />
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

export const Holograma: React.FC = () => {
  const f = useCurrentFrame();
  const entrada = interpolate(f, [0, 12], [0, 1], clamp);
  const salida = interpolate(f, [H.DUR - 25, H.DUR - 5], [1, 0], clamp);
  const barrido = interpolate(f, [0, 22], [-100, 2000], clamp);
  const e = (p: THREE.Vector3) => puntoEquipo(p, f);
  return (
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, #0b2234 0%, #040b14 60%, #01040a 100%)', opacity: Math.min(entrada, salida)}}>
      <ThreeCanvas width={1080} height={1920} camera={{fov: FOV, near: 0.05, far: 100, position: [0, 2, 6]}}>
        <Camara f={f} />
        <Escena f={f} />
      </ThreeCanvas>

      <Etiqueta3D f={f} punto={new THREE.Vector3(1.2, 0, 0.8)} desde={10} hasta={H.ALA} color={AGUA} texto="Superficie del agua" dx={-40} dy={160} />
      <Etiqueta3D f={f} punto={e(PE.mastil)} desde={H.MASTIL} hasta={H.DENSA} color={C.ambar} texto="Mástil · ~80 cm" dx={60} dy={-160} />
      <Etiqueta3D f={f} punto={e(PE.ala)} desde={H.ALA} hasta={H.DENSA} color={C.ambar} texto="Ala submarina" dx={-60} dy={200} />
      <Etiqueta3D f={f} punto={e(new THREE.Vector3(PE.ala.x, PE.ala.y + 0.3, 0.32))} desde={H.AVION + 30} hasta={H.FUERA} color={C.verde} texto="Sustentación" dx={60} dy={-180} />
      <Etiqueta3D f={f} punto={new THREE.Vector3(1.8, 0.75, 2.1)} desde={H.OCHOCIENTAS} hasta={H.FUERA} color={'#E0F7FF'} texto="Aire" dx={50} dy={-120} />
      <Etiqueta3D f={f} punto={new THREE.Vector3(1.8, -0.75, 2.1)} desde={H.OCHOCIENTAS + 10} hasta={H.FUERA} color={AGUA} texto="Agua: ×800" dx={50} dy={140} />
      <Etiqueta3D f={f} punto={e(PE.tabla)} desde={H.FUERA + 10} hasta={H.MOTOR + 10} color={C.verde} texto="Fuera del agua: casi sin freno" dx={-40} dy={-260} />
      <Etiqueta3D f={f} punto={e(new THREE.Vector3(-0.05, 1.45, 0))} desde={H.ELLA - 4} hasta={H.BOMBEO + 10} color={'#F0ABFC'} texto="El motor: ella" dx={60} dy={-150} />
      <Etiqueta3D f={f} punto={e(new THREE.Vector3(PE.ala.x, PE.ala.y + 0.45, 0.32))} desde={H.ARRIBA} hasta={H.DELFIN + 20} color={C.verde} texto="↑ Arriba" dx={-60} dy={-160} />
      <Etiqueta3D f={f} punto={e(new THREE.Vector3(PE.ala.x + 0.4, PE.ala.y + 0.03, 0.32))} desde={H.ARRIBA + 8} hasta={H.DELFIN + 20} color={C.ambar} texto="→ Adelante" dx={40} dy={150} />
      <Etiqueta3D f={f} punto={new THREE.Vector3(-0.64, -0.95, -1.3)} desde={H.DELFIN + 15} hasta={H.CIERRE + 10} color={C.ambar} texto="Mismo truco" dx={-40} dy={180} />
      <Etiqueta3D f={f} punto={e(PE.ala)} desde={H.CIERRE + 15} hasta={H.FIN} color={C.verde} texto="Volando bajo el agua" dx={-60} dy={220} />

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
