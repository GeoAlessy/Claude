import React, {useLayoutEffect, useMemo} from 'react';
import * as THREE from 'three';
import {ThreeCanvas} from '@remotion/three';
import {useThree} from '@react-three/fiber';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';
import {Holo, Linea, caja, proyectar} from '../three/holo';
import {C, MONO} from '../estilo';
import {Pastilla} from '../hud';
import {H} from './tiempos';
export {H};

// =====================================================================
// Holograma del video 02: el jet sobre la tormenta, el hielo en la cola y la caída.
// El jet está en el origen (nariz hacia +x); cuando cae, el mundo sube.
// =====================================================================
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const suave = Easing.inOut(Easing.cubic);
const BLANCO_HIELO = '#E0F7FF';
const AZUL_NUBE = '#7DD3FC';

// ---------- Estado del vuelo ----------
// Cabeceo (rad, negativo = nariz abajo)
export function cabeceo(f: number) {
  return interpolate(f, [H.CAE, H.VEL + 40, H.CAIDA + 30, H.CIERRE + 40], [0, -0.42, -0.72, -0.6], {...clamp, easing: suave});
}
// Cuánto ha bajado el mundo (unidades de escena)
function caidaMundo(f: number) {
  let y = 0;
  for (let i = H.CAE; i < f; i++) y += interpolate(i, [H.CAE, H.CAIDA, H.CIERRE], [0, 0.35, 0.6], clamp);
  return y;
}
const ease = (x: number) => Easing.inOut(Easing.quad)(Math.min(1, Math.max(0, x)));
export const altitud = (f: number) => Math.round((11300 - 8300 * ease((f - H.CAE) / (H.CIERRE - H.CAE))) / 10) * 10;
export const velocidad = (f: number) =>
  Math.round(interpolate(f, [H.NARIZ, H.CAE, H.LIMITE, H.SOBRE, H.CAIDA + 40], [850, 860, 955, 1010, 1080], clamp));
// Hielo: en las alas desde "hielo", en la cola más rápido
const hieloAlas = (f: number) => interpolate(f, [H.PEGA - 6, H.COLA + 40, H.NARIZ + 60], [0, 0.6, 1], clamp);
const hieloCola = (f: number) => interpolate(f, [H.COLA, H.NARIZ, H.PIERDE + 10], [0.1, 0.75, 1], clamp);

// Punto del jet (coordenadas propias) → mundo, según el cabeceo
export function puntoJet(x: number, y: number, z: number, f: number) {
  const a = cabeceo(f);
  return new THREE.Vector3(x * Math.cos(a) - y * Math.sin(a), x * Math.sin(a) + y * Math.cos(a), z);
}

// ---------- Cámara ----------
type ClaveCam = [number, [number, number, number], [number, number, number]];
const V = (x: number, y: number, z: number): [number, number, number] => [x, y, z];
const MEDIO = Math.round((H.CIERRE + 45 + H.FIN) / 2);
const CAM: ClaveCam[] = [
  [0, V(-17, 6, 27), V(0, -5, 0)],
  [H.ALTURA + 50, V(-13, 3.5, 21), V(0, -6, 0)],
  [H.TORMENTA + 30, V(-10, 1.5, 17), V(0, -8, 0)],
  [H.HIELO, V(-6.5, 2.4, 11.5), V(0, -1.5, 0)],
  [H.PEGA, V(3.2, 1.7, 6.4), V(0.4, 0, 1.4)],
  [H.COLA, V(1.2, 2.7, 5.2), V(-2.5, 1.15, 0.4)],
  [H.COLA + 60, V(-0.6, 2.4, 3.8), V(-2.7, 1.35, 0.3)],
  [H.NARIZ + 70, V(-1.2, 1.5, 4.8), V(-2.4, 0.9, 0)],
  [H.CAE, V(0.4, 1.0, 19), V(0, -0.3, 0)],
  [H.VEL + 40, V(-10, 3.5, 12), V(0.5, -0.8, 0)],
  [H.SOBRE, V(-7, 2, 10), V(0.4, -0.5, 0)],
  [H.CAIDA + 30, V(7, -8, 10), V(0, 0, 0)],
  [H.CIERRE, V(3, -4.5, 13), V(0, 0, 0)],
  [H.CIERRE + 45, V(-8, 2.5, 10), V(0, 0.9, 0)],
  [MEDIO, V(-1, 3, 13), V(0, 0.9, 0)],
  [H.FIN - 5, V(6.5, 1.5, 10.5), V(0, 0.9, 0)],
  [H.DUR, V(-16, 6, -20), V(0, -3, 0)],
];
export const FOV = 40;
export function camaraEn(f: number) {
  const fr = CAM.map((k) => k[0]);
  const p = new THREE.Vector3(...([0, 1, 2].map((i) => interpolate(f, fr, CAM.map((k) => k[1][i]), {...clamp, easing: suave})) as [number, number, number]));
  const t = new THREE.Vector3(...([0, 1, 2].map((i) => interpolate(f, fr, CAM.map((k) => k[2][i]), {...clamp, easing: suave})) as [number, number, number]));
  // temblor leve en la caída
  const temblor = interpolate(f, [H.SOBRE - 10, H.SOBRE, H.CIERRE, H.CIERRE + 20], [0, 1, 1, 0], clamp) * 0.06;
  p.add(new THREE.Vector3(Math.sin(f * 1.7) * temblor, Math.cos(f * 2.3) * temblor, 0));
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
// El jet (siluetas tipo Learjet: cola en T, motores atrás)
// =====================================================================
const GJ = {
  fuselaje: new THREE.CapsuleGeometry(0.36, 5.0, 6, 16),
  motor: new THREE.CylinderGeometry(0.2, 0.17, 1.0, 14, 1, true),
  cabina: new THREE.SphereGeometry(0.33, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2),
  cristal: new THREE.BoxGeometry(0.02, 0.16, 0.5),
};
function alaGeom(envergadura: number, cuerdaRaiz: number, cuerdaPunta: number, flecha: number, grosor: number) {
  // ala en el plano XZ (borde de ataque hacia +x), extruida en Y
  const s = new THREE.Shape();
  s.moveTo(0, 0);
  s.lineTo(-flecha, envergadura);
  s.lineTo(-flecha - cuerdaPunta, envergadura);
  s.lineTo(-cuerdaRaiz, 0);
  s.closePath();
  const g = new THREE.ExtrudeGeometry(s, {depth: grosor, bevelEnabled: false});
  g.rotateX(Math.PI / 2); // la forma (x, y) pasa a (x, z)
  g.translate(0, grosor / 2, 0);
  return g;
}
const ALA = alaGeom(3.2, 1.5, 0.6, 1.0, 0.06);
const ESTAB = alaGeom(1.35, 0.6, 0.32, 0.35, 0.04);
const DERIVA = (() => {
  const s = new THREE.Shape();
  s.moveTo(0, 0);
  s.lineTo(-0.55, 1.25);
  s.lineTo(-1.05, 1.25);
  s.lineTo(-1.15, 0);
  s.closePath();
  const g = new THREE.ExtrudeGeometry(s, {depth: 0.05, bevelEnabled: false});
  g.translate(0, 0, -0.025);
  return g;
})();
// Posiciones clave (coordenadas del jet)
export const PJ = {
  ala: [0.95, -0.12, 1.7] as [number, number, number],
  bordeAla: [0.55, -0.1, 1.2] as [number, number, number],
  estab: [-2.75, 1.48, 0.7] as [number, number, number],
  nariz: [3.0, 0.05, 0] as [number, number, number],
  cola: [-2.9, 1.2, 0] as [number, number, number],
  centro: [0, 0, 0] as [number, number, number],
};
const XESTAB = -2.55; // borde de ataque del estabilizador
const YESTAB = 1.45;

// Cristales de hielo a lo largo de un borde de ataque
const cristal = new THREE.TetrahedronGeometry(0.045, 0);
const Escarcha: React.FC<{desde: THREE.Vector3; hasta: THREE.Vector3; n: number; nivel: number; semilla: number}> = ({desde, hasta, n, nivel, semilla}) => {
  const visibles = Math.floor(n * nivel);
  return (
    <group>
      {Array.from({length: visibles}, (_, i) => {
        const u = (i * 0.618 + semilla) % 1;
        const p = desde.clone().lerp(hasta, u);
        const r = 0.6 + 0.8 * (((i * 7.31 + semilla * 13) % 1 + 1) % 1);
        return (
          <Holo key={i} geom={cristal} color={BLANCO_HIELO} relleno={0.35} linea={0.95} angulo={1} position={[p.x + 0.02, p.y + ((i % 3) - 1) * 0.02, p.z]} rotation={[i, i * 1.3, i * 0.7]} scale={r} />
        );
      })}
    </group>
  );
};

const Jet: React.FC<{f: number; color: string}> = ({f, color}) => {
  const hA = hieloAlas(f);
  const hC = hieloCola(f);
  const colaResaltada = f >= H.COLA && f < H.CIERRE ? 1 : 0;
  const colorCola = colaResaltada ? (f >= H.PIERDE ? C.rojo : C.ambar) : color;
  return (
    <group>
      {/* fuselaje */}
      <Holo geom={GJ.fuselaje} color={color} relleno={0.07} linea={0.55} angulo={25} rotation={[0, 0, Math.PI / 2]} />
      <Holo geom={GJ.cabina} color={color} relleno={0.06} linea={0.4} angulo={30} position={[2.25, 0.18, 0]} scale={[1.6, 0.9, 1]} />
      {[-0.13, 0.13].map((z, i) => (
        <Holo key={i} geom={GJ.cristal} color={color} relleno={0.3} linea={0.9} position={[2.45, 0.22, z]} rotation={[0, 0, -0.7]} scale={[1, 1, 0.45]} />
      ))}
      {/* alas */}
      <Holo geom={ALA} color={color} relleno={0.08} linea={0.8} angulo={10} position={[1.0, -0.2, 0.3]} />
      <Holo geom={ALA} color={color} relleno={0.08} linea={0.8} angulo={10} position={[1.0, -0.2, -0.3]} scale={[1, 1, -1]} />
      {/* motores */}
      {[0.62, -0.62].map((z, i) => (
        <group key={i} position={[-1.55, 0.32, z]} rotation={[0, 0, Math.PI / 2]}>
          <Holo geom={GJ.motor} color={color} relleno={0.08} linea={0.6} angulo={30} />
        </group>
      ))}
      {/* cola en T */}
      <Holo geom={DERIVA} color={colorCola} relleno={0.1} linea={0.85} angulo={10} position={[-1.95, 0.22, 0]} />
      <Holo geom={ESTAB} color={colorCola} relleno={0.14} linea={0.95} angulo={10} position={[XESTAB, YESTAB, 0.03]} />
      <Holo geom={ESTAB} color={colorCola} relleno={0.14} linea={0.95} angulo={10} position={[XESTAB, YESTAB, -0.03]} scale={[1, 1, -1]} />

      {/* hielo */}
      <Escarcha desde={new THREE.Vector3(1.0, -0.17, 0.35)} hasta={new THREE.Vector3(0.0, -0.17, 3.5)} n={60} nivel={hA} semilla={0.11} />
      <Escarcha desde={new THREE.Vector3(1.0, -0.17, -0.35)} hasta={new THREE.Vector3(0.0, -0.17, -3.5)} n={60} nivel={hA} semilla={0.37} />
      <Escarcha desde={new THREE.Vector3(XESTAB, YESTAB + 0.02, 0.05)} hasta={new THREE.Vector3(XESTAB - 0.35, YESTAB + 0.02, 1.4)} n={45} nivel={hC} semilla={0.53} />
      <Escarcha desde={new THREE.Vector3(XESTAB, YESTAB + 0.02, -0.05)} hasta={new THREE.Vector3(XESTAB - 0.35, YESTAB + 0.02, -1.4)} n={45} nivel={hC} semilla={0.79} />
    </group>
  );
};

// =====================================================================
// La tormenta
// =====================================================================
const bola = new THREE.IcosahedronGeometry(1, 1);
const NUBES: [number, number, number, number][] = (() => {
  const out: [number, number, number, number][] = [];
  let s = 7;
  const r = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  // torre
  for (let i = 0; i < 26; i++) out.push([-2 + (r() - 0.5) * 9, -26 + i * 0.75 + r() * 1.5, (r() - 0.5) * 9, 2.2 + r() * 2.2]);
  // yunque (parte de arriba, ancha)
  for (let i = 0; i < 22; i++) out.push([-2 + (r() - 0.5) * 22, -6.5 + r() * 1.2, (r() - 0.5) * 16, 1.8 + r() * 1.6]);
  return out;
})();
const RAYOS = [12, 52, 96, 150, 205, 262, 330, 410];

const Tormenta: React.FC<{f: number}> = ({f}) => {
  const rayo = RAYOS.find((k) => f >= k && f < k + 5);
  return (
    <group>
      {NUBES.map(([x, y, z, s], i) => (
        <Holo key={i} geom={bola} color={AZUL_NUBE} relleno={0.01} linea={0.085} angulo={8} position={[x + Math.sin(f / 40 + i) * 0.15, y, z]} scale={[s * 1.3, s * 0.8, s * 1.2]} />
      ))}
      {rayo !== undefined && (
        <Linea
          puntos={[0, 1, 2, 3, 4, 5, 6].map((k) => new THREE.Vector3(-2 + Math.sin(rayo * 3 + k * 2.1) * 1.8, -8 - k * 2.4, Math.cos(rayo + k) * 1.5))}
          color={'#FFFFFF'}
          opacidad={1 - (f - rayo) / 5}
        />
      )}
    </group>
  );
};

// Humedad que sube de la tormenta hacia el avión
const Humedad: React.FC<{f: number}> = ({f}) => {
  const op = interpolate(f, [H.HIELO - 10, H.HIELO + 10, H.NARIZ + 40, H.CAE + 20], [0, 1, 1, 0.25], clamp);
  const geom = useMemo(() => new THREE.BufferGeometry(), []);
  const N = 420;
  const pos = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) {
    const a = (i * 2.399) % (Math.PI * 2);
    const rad = 0.5 + ((i * 0.618) % 1) * 4.2;
    const fase = (i * 0.137) % 1;
    const y = -9 + ((fase + f * 0.008) % 1) * 10.5;
    pos[i * 3] = Math.cos(a) * rad * 1.1 - 0.4;
    pos[i * 3 + 1] = y;
    pos[i * 3 + 2] = Math.sin(a) * rad;
  }
  geom.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  return (
    <points geometry={geom}>
      <pointsMaterial color={BLANCO_HIELO} size={0.07} transparent opacity={0.85 * op} depthWrite={false} blending={THREE.AdditiveBlending} />
    </points>
  );
};

const CONO = new THREE.ConeGeometry(0.12, 0.25, 12);
// Flujo de aire alrededor de la cola + flecha de la fuerza de la cola
const FlujoCola: React.FC<{f: number}> = ({f}) => {
  const op = interpolate(f, [H.COLA + 30, H.COLA + 45, H.CAE + 10, H.CAE + 30], [0, 1, 1, 0.3], clamp);
  if (op <= 0) return null;
  const turbulento = interpolate(f, [H.PIERDE - 10, H.PIERDE + 20], [0, 1], clamp);
  const lineas = [];
  for (let k = 0; k < 7; k++) {
    const y0 = YESTAB - 0.45 + k * 0.15;
    const pts: THREE.Vector3[] = [];
    for (let x = -1.0; x >= -4.6; x -= 0.12) {
      const cerca = Math.exp(-(((x - XESTAB + 0.2) / 0.5) ** 2));
      const desvio = (y0 > YESTAB ? 1 : -1) * 0.12 * cerca;
      const ruido = turbulento * Math.sin(x * 9 + f * 0.7 + k) * 0.07 * (x < XESTAB ? 1 : 0);
      pts.push(new THREE.Vector3(x, y0 + desvio + ruido, 0.75));
    }
    lineas.push(<Linea key={k} puntos={pts} color={turbulento > 0.5 && k > 2 ? C.rojo : C.cian} opacidad={0.55 * op} />);
  }
  // pulsos que corren por las líneas
  const pulsos = [];
  for (let k = 0; k < 7; k++) {
    const x = -1.0 - (((f * 0.08 + k * 0.37) % 1) * 3.6);
    pulsos.push(
      <mesh key={k} position={[x, YESTAB - 0.45 + k * 0.15, 0.75]}>
        <sphereGeometry args={[0.03, 8, 6]} />
        <meshBasicMaterial color={BLANCO_HIELO} transparent opacity={op} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
    );
  }
  // Flecha: la cola empuja hacia abajo (sostiene la nariz arriba). Con hielo se achica.
  const fuerza = interpolate(f, [H.NARIZ + 20, H.NARIZ + 35, H.PIERDE, H.CAE], [0, 1, 1, 0.25], clamp);
  const colorFlecha = f >= H.PIERDE ? C.rojo : C.ambar;
  return (
    <group>
      {lineas}
      {pulsos}
      {fuerza > 0 && (
        <group position={[XESTAB - 0.3, YESTAB - 0.05, 0.75]} scale={[1, fuerza, 1]}>
          <Holo geom={caja(0.05, 0.7, 0.05)} color={colorFlecha} relleno={0.5} linea={1} position={[0, -0.35, 0]} />
          <Holo geom={CONO} color={colorFlecha} relleno={0.5} linea={1} angulo={30} position={[0, -0.8, 0]} rotation={[Math.PI, 0, 0]} />
        </group>
      )}
    </group>
  );
};

// Estelas de velocidad (en el marco del jet)
const Estelas: React.FC<{f: number}> = ({f}) => {
  const op = interpolate(f, [H.VEL, H.VEL + 30, H.CIERRE + 30, H.FIN], [0, 1, 1, 0.3], clamp);
  if (op <= 0) return null;
  const out = [];
  for (let k = 0; k < 22; k++) {
    const y = ((k * 0.61) % 1) * 5 - 2.5;
    const z = ((k * 0.37) % 1) * 9 - 4.5;
    const x = 8 - (((f * 0.5 + k * 3.1) % 18) + 0);
    out.push(<Linea key={k} puntos={[new THREE.Vector3(x, y, z), new THREE.Vector3(x - 2.5, y, z)]} color={BLANCO_HIELO} opacidad={0.45 * op} />);
  }
  return <group>{out}</group>;
};

// Nubes que pasan a la altura del avión (sensación de velocidad)
const NubesPaso: React.FC<{f: number}> = ({f}) => {
  const out = [];
  for (let k = 0; k < 8; k++) {
    const x = 20 - (((f * 0.06 + k * 5.3) % 40) + 0);
    out.push(<Holo key={k} geom={bola} color={AZUL_NUBE} relleno={0.02} linea={0.1} angulo={8} position={[x, -2.5 + (k % 3) * 1.6, -6 + (k % 4) * 4]} scale={[2.4, 0.5, 1.6]} />);
  }
  return <group>{out}</group>;
};

const Escena: React.FC<{f: number}> = ({f}) => {
  const aparicion = interpolate(f, [0, 20], [0, 1], clamp);
  const dy = caidaMundo(f);
  return (
    <group>
      <group scale={[1, aparicion, 1]}>
        <group position={[0, dy, 0]}>
          <Tormenta f={f} />
          <Humedad f={f} />
          <gridHelper args={[120, 60, C.cian, C.cian]} position={[0, -30, 0]}>
            <lineBasicMaterial attach="material" color={C.cian} transparent opacity={0.07} />
          </gridHelper>
        </group>
        <NubesPaso f={f} />
        <group rotation={[0, 0, cabeceo(f)]}>
          <Jet f={f} color={C.cian} />
          <FlujoCola f={f} />
          <Estelas f={f} />
        </group>
      </group>
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
  const ly = Math.min(Math.max(y + dy, 560), 1360);
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

const fmt = (n: number) => n.toLocaleString('es-ES').replace(/,/g, '.');

// Instrumentos: altitud, velocidad (con zona roja) y temperatura / descenso
const Instrumentos: React.FC<{f: number}> = ({f}) => {
  const op = interpolate(f, [H.ALTURA, H.ALTURA + 12], [0, 1], clamp);
  if (op <= 0) return null;
  const alt = altitud(f);
  const vel = velocidad(f);
  const LIMITE_KMH = 950;
  const enRojo = vel >= LIMITE_KMH;
  const cayendo = f >= H.CAE + 10;
  const parpadeo = enRojo && f >= H.SOBRE && Math.floor(f / 6) % 2 === 0;
  const caja = (titulo: string, valor: string, color: string, extra?: React.ReactNode) => (
    <div
      style={{
        flex: 1,
        padding: '18px 20px',
        background: 'rgba(4,14,24,0.72)',
        border: `2px solid ${color}`,
        borderRadius: 20,
        boxShadow: `0 0 22px ${color}44`,
      }}
    >
      <div style={{fontFamily: MONO, fontWeight: 700, fontSize: 22, letterSpacing: 2, color}}>{titulo}</div>
      <div style={{fontFamily: MONO, fontWeight: 700, fontSize: 46, color: C.blanco, marginTop: 4, whiteSpace: 'nowrap'}}>{valor}</div>
      {extra}
    </div>
  );
  const barra = (
    <div style={{position: 'relative', height: 12, marginTop: 10, borderRadius: 6, background: 'rgba(255,255,255,0.12)', overflow: 'hidden'}}>
      <div style={{position: 'absolute', left: `${((LIMITE_KMH - 600) / 500) * 100}%`, right: 0, top: 0, bottom: 0, background: `${C.rojo}88`}} />
      <div style={{position: 'absolute', left: 0, width: `${Math.min(100, ((vel - 600) / 500) * 100)}%`, top: 0, bottom: 0, background: enRojo ? C.rojo : C.cian}} />
    </div>
  );
  return (
    <div style={{position: 'absolute', top: 250, left: 50, right: 50, opacity: op}}>
      <div style={{display: 'flex', gap: 16}}>
        {caja('ALTITUD', `${fmt(alt)} m`, cayendo ? C.rojo : C.cian)}
        {caja('VELOCIDAD', `${fmt(vel)} km/h`, enRojo ? C.rojo : C.cian, barra)}
      </div>
      <div style={{display: 'flex', gap: 16, marginTop: 16, alignItems: 'center'}}>
        {f < H.CAE + 10 ? (
          <Pastilla color={f >= H.FRIO ? C.cian : 'rgba(125,211,252,0.6)'} tam={28}>
            Afuera: −47 °C
          </Pastilla>
        ) : (
          <Pastilla color={C.rojo} punto tam={28}>
            Descenso: −6.000 m/min
          </Pastilla>
        )}
        {enRojo && (
          <div style={{opacity: parpadeo ? 0.45 : 1}}>
            <Pastilla color={C.rojo} punto tam={28}>
              {f >= H.SOBRE ? 'Sobrevelocidad' : 'Velocidad límite'}
            </Pastilla>
          </div>
        )}
      </div>
    </div>
  );
};

export const Holograma: React.FC = () => {
  const f = useCurrentFrame();
  const entrada = interpolate(f, [0, 12], [0, 1], clamp);
  const salida = interpolate(f, [H.DUR - 25, H.DUR - 5], [1, 0], clamp);
  const barrido = interpolate(f, [0, 22], [-100, 2000], clamp);
  const rayo = RAYOS.find((k) => f >= k && f < k + 4);
  const flashRayo = rayo !== undefined ? 0.12 * (1 - (f - rayo) / 4) : 0;
  const j = (p: [number, number, number]) => puntoJet(p[0], p[1], p[2], f);

  return (
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, #0b2234 0%, #040b14 60%, #01040a 100%)', opacity: Math.min(entrada, salida)}}>
      <ThreeCanvas width={1080} height={1920} camera={{fov: FOV, near: 0.05, far: 300, position: [0, 3, 10]}}>
        <Camara f={f} />
        <Escena f={f} />
      </ThreeCanvas>

      {/* Etiquetas (se quedan hasta el cambio de toma) */}
      <Etiqueta3D f={f} punto={j(PJ.centro)} desde={14} hasta={H.HIELO} texto="Learjet 60" dx={60} dy={-200} />
      <Etiqueta3D f={f} punto={new THREE.Vector3(-2, -7 + caidaMundo(f), 0)} desde={H.TORMENTA} hasta={H.HIELO + 10} color={AZUL_NUBE} texto="Tormenta" dx={-60} dy={220} />
      <Etiqueta3D f={f} punto={new THREE.Vector3(-0.6, -3.5, 1.2)} desde={H.HIELO + 15} hasta={H.PEGA} color={BLANCO_HIELO} texto="Humedad que sube" dx={-60} dy={240} />
      <Etiqueta3D f={f} punto={j(PJ.bordeAla)} desde={H.PEGA + 4} hasta={H.COLA} color={BLANCO_HIELO} texto="Hielo" dx={-80} dy={-220} />
      <Etiqueta3D f={f} punto={j(PJ.estab)} desde={H.COLA + 12} hasta={H.CAE} color={f >= H.PIERDE ? C.rojo : C.ambar} texto="La cola" dx={60} dy={-220} />
      <Etiqueta3D f={f} punto={j([XESTAB - 0.3, YESTAB - 0.85, 0.75])} desde={H.NARIZ + 30} hasta={H.CAE} color={f >= H.PIERDE ? C.rojo : C.ambar} texto={f >= H.PIERDE ? 'Pierde fuerza' : 'Sostiene la nariz'} dx={60} dy={160} />
      <Etiqueta3D f={f} punto={j(PJ.nariz)} desde={H.CAE + 6} hasta={H.VEL + 40} color={C.rojo} texto="Nariz abajo" dx={-40} dy={200} />
      <Etiqueta3D f={f} punto={j(PJ.cola)} desde={H.CIERRE + 40} hasta={H.FIN} color={C.ambar} texto="Investigación en curso" dx={40} dy={-230} />

      <Instrumentos f={f} />

      {/* Líneas de escaneo + barrido de entrada + destellos de rayo */}
      <AbsoluteFill
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, rgba(34,211,238,0.05) 0px, rgba(34,211,238,0.05) 2px, transparent 2px, transparent 6px)',
          mixBlendMode: 'screen',
        }}
      />
      <div style={{position: 'absolute', left: 0, top: barrido, width: '100%', height: 6, background: C.cian, boxShadow: `0 0 40px 18px ${C.cian}88`}} />
      <AbsoluteFill style={{background: `rgba(220,240,255,${flashRayo})`}} />
    </AbsoluteFill>
  );
};
