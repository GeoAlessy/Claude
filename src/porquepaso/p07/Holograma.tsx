import React, {useLayoutEffect} from 'react';
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
// Holograma del video 07: el transformador por dentro (aceite + bobinas), el aceite que arde,
// el agua del refresco que se vuelve vapor y lanza el aceite encendido, la sartén,
// el poco CO₂ de una botella, la electricidad por el líquido y lo que dicen los expertos.
// Ejes (metros): poste en el origen, transformador en x ≈ 0.75, canasta del camión a la derecha.
// La sartén de la comparación flota a la izquierda (x = −6).
// =====================================================================
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const suave = Easing.inOut(Easing.cubic);
const BLANCO = '#E0F2FE';
const FUEGO = '#FB923C';
const AGUA = '#60A5FA';

const TANQUE = new THREE.Vector3(0.75, 6.5, 0); // centro del tanque
const TAPA_Y = 7.15;
const CANASTA = new THREE.Vector3(4.4, 8.4, 1.4);
const SARTEN = new THREE.Vector3(-6, 6.2, 0);

// ---------- Estado ----------
const calor = (f: number) => interpolate(f, [H.ARDE, H.LLAMAS, H.EXTINTOR + 10, H.EXTINTOR + 50], [0, 1, 1, 0], clamp);
const llamas = (f: number) =>
  interpolate(f, [H.LLAMAS - 15, H.LLAMAS + 10, H.TOCAR, H.LANZA, H.BOLA + 60, H.EXTINTOR, H.EXTINTOR + 40], [0, 0.6, 0.6, 1, 1, 0.8, 0], clamp);
// Botella: sale de la canasta y cae sobre la tapa del transformador
function botella(f: number) {
  const t = interpolate(f, [H.AGUA + 10, H.TOCAR], [0, 1], {...clamp, easing: Easing.in(Easing.quad)});
  const ini = CANASTA.clone().add(new THREE.Vector3(-0.3, 0.9, 0));
  const fin = new THREE.Vector3(TANQUE.x + 0.1, TAPA_Y + 0.25, 0.1);
  const p = ini.clone().lerp(fin, t);
  p.y += Math.sin(t * Math.PI) * 1.2;
  return {p, t, rot: t * 5};
}
// Arco del líquido (para la electricidad que sube por él)
const ARCO: THREE.Vector3[] = [];
for (let i = 0; i <= 24; i++) {
  const t = i / 24;
  const p = new THREE.Vector3(TANQUE.x + 0.1, TAPA_Y + 0.25, 0.1).lerp(CANASTA.clone().add(new THREE.Vector3(-0.3, 0.9, 0)), t);
  p.y += Math.sin(t * Math.PI) * 1.2;
  ARCO.push(p);
}

// ---------- Cámara ----------
type ClaveCam = [number, [number, number, number], [number, number, number]];
const V = (x: number, y: number, z: number): [number, number, number] => [x, y, z];
const CAM: ClaveCam[] = [
  [0, V(6, 9, 10), V(1.2, 6.8, 0)],
  [H.ACEITE + 25, V(2.8, 7.4, 3.4), V(0.75, 6.5, 0)],
  [H.BOBINAS + 10, V(2.1, 7.0, 2.7), V(0.75, 6.4, 0)],
  [H.ARDE + 20, V(3.2, 7.8, 3.8), V(0.75, 6.9, 0)],
  [H.AGUA + 15, V(7.5, 9.6, 8.5), V(2.6, 7.8, 0.6)],
  [H.TOCAR, V(3.6, 8.2, 4.2), V(0.8, 7.2, 0)],
  [H.VAPOR + 20, V(3.0, 8.0, 3.4), V(0.8, 7.4, 0)],
  [H.LANZA + 10, V(4.5, 8.6, 6), V(0.8, 8.0, 0)],
  [H.BOLA + 40, V(6, 9.2, 9), V(0.8, 8.4, 0)],
  [H.SARTEN - 10, V(-4.1, 7.6, 4.0), V(-6, 6.3, 0)],
  [H.SARTEN + 40, V(-4.7, 7.2, 3.1), V(-6, 6.3, 0)],
  [H.GAS + 25, V(4, 8.2, 5), V(0.9, 7.2, 0)],
  [H.CORRIENTE + 15, V(8, 9.6, 9), V(2.6, 8.0, 0.6)],
  [H.DESCARGA + 10, V(7, 9.8, 6.5), V(3.4, 8.4, 1)],
  [H.EXPERTOS + 20, V(5, 8.6, 6), V(1, 7.4, 0)],
  [H.EXTINTOR + 20, V(4, 8.2, 5), V(0.8, 7.2, 0)],
  [H.DUR, V(9, 11, 12), V(1.5, 7, 0)],
];
export const FOV = 40;
export function camaraEn(f: number) {
  const fr = CAM.map((k) => k[0]);
  const p = new THREE.Vector3(...([0, 1, 2].map((i) => interpolate(f, fr, CAM.map((k) => k[1][i]), {...clamp, easing: suave})) as [number, number, number]));
  const t = new THREE.Vector3(...([0, 1, 2].map((i) => interpolate(f, fr, CAM.map((k) => k[2][i]), {...clamp, easing: suave})) as [number, number, number]));
  const temblor = interpolate(f, [H.LANZA - 1, H.LANZA, H.LANZA + 16], [0, 0.08, 0], clamp);
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
const G = {
  tanque: new THREE.CylinderGeometry(0.55, 0.55, 1.3, 24, 1, true),
  tapa: new THREE.CylinderGeometry(0.58, 0.58, 0.06, 24),
  aceite: new THREE.CylinderGeometry(0.52, 0.52, 1, 24),
  bobina: new THREE.CylinderGeometry(0.17, 0.17, 0.75, 16),
  aislador: new THREE.CylinderGeometry(0.07, 0.11, 0.42, 10),
  llama: new THREE.ConeGeometry(0.12, 0.45, 5),
  gota: new THREE.SphereGeometry(0.05, 6, 5),
  vapor: new THREE.SphereGeometry(1, 10, 8),
  persona: new THREE.CapsuleGeometry(0.2, 0.6, 3, 8),
  cabeza: new THREE.SphereGeometry(0.15, 10, 8),
  botella: new THREE.CylinderGeometry(0.06, 0.06, 0.32, 10),
  cuello: new THREE.CylinderGeometry(0.02, 0.05, 0.1, 8),
  sarten: new THREE.CylinderGeometry(0.5, 0.42, 0.12, 24, 1, true),
  fondo: new THREE.CircleGeometry(0.42, 24),
};

const Poste: React.FC<{f: number}> = ({f}) => {
  // fusible (cortacircuito) que se abre al "cortar la corriente"
  const abre = interpolate(f, [H.CORTA - 5, H.CORTA + 10], [0, 1.1], {...clamp, easing: Easing.out(Easing.back(2))});
  return (
    <group>
      <Holo geom={caja(0.28, 12, 0.28)} color={BLANCO} relleno={0.06} linea={0.6} position={[0, 6, 0]} />
      <Holo geom={caja(2.6, 0.12, 0.12)} color={BLANCO} relleno={0.1} linea={0.7} position={[0.2, 9.2, 0]} />
      {[-0.9, 0.2, 1.3].map((x) => (
        <Holo key={x} geom={G.aislador} color={BLANCO} relleno={0.15} linea={0.7} angulo={30} position={[x, 9.47, 0]} />
      ))}
      {/* cables */}
      {[-0.9, 0.2, 1.3].map((x) => (
        <Linea key={'l' + x} puntos={[new THREE.Vector3(x, 9.7, -12), new THREE.Vector3(x, 9.7, 12)]} color={BLANCO} opacidad={0.35} />
      ))}
      {/* bajante con el fusible hacia el transformador */}
      <group position={[0.75, 8.7, 0.25]} rotation={[0, 0, abre]}>
        <Holo geom={caja(0.06, 0.55, 0.06)} color={abre > 0.5 ? C.verde : C.ambar} relleno={0.4} linea={1} position={[0, -0.27, 0]} />
      </group>
      <Linea puntos={[new THREE.Vector3(0.75, 8.15, 0.25), new THREE.Vector3(0.75, TAPA_Y + 0.4, 0.15)]} color={BLANCO} opacidad={0.6} />
      {/* soporte del transformador */}
      <Holo geom={caja(0.6, 0.1, 0.5)} color={BLANCO} relleno={0.1} linea={0.6} position={[0.4, 5.8, 0]} />
    </group>
  );
};

const Transformador: React.FC<{f: number}> = ({f}) => {
  const corte = interpolate(f, [H.ACEITE, H.ACEITE + 20], [1, 0.25], clamp); // la carcasa se vuelve "transparente"
  const nivel = interpolate(f, [H.LLENO - 25, H.LLENO + 10], [0.02, 1.1], {...clamp, easing: Easing.out(Easing.cubic)});
  const c = calor(f);
  const colorAceite = c > 0.6 ? FUEGO : c > 0.2 ? C.ambar : '#FDE68A';
  const bobOp = interpolate(f, [H.BOBINAS - 5, H.BOBINAS + 10], [0.5, 1], clamp);
  const aisla = f >= H.AISLA && f < H.ARDE + 20 ? 0.5 + 0.5 * Math.sin(f / 3) : 0;
  return (
    <group position={TANQUE.toArray()}>
      <Holo geom={G.tanque} color={BLANCO} relleno={0.05 * corte} linea={0.85} angulo={30} />
      <Holo geom={G.tapa} color={BLANCO} relleno={0.1} linea={0.7} position={[0, 0.66, 0]} />
      {[-0.25, 0.25].map((x) => (
        <Holo key={x} geom={G.aislador} color={BLANCO} relleno={0.15} linea={0.8} angulo={30} position={[x, 0.9, 0.1]} />
      ))}
      {/* aceite */}
      <mesh geometry={G.aceite} position={[0, -0.6 + nivel / 2, 0]} scale={[1, Math.max(0.01, nivel), 1]}>
        <meshBasicMaterial color={colorAceite} transparent opacity={0.22 + 0.15 * c} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
      {/* núcleo y bobinas */}
      <Holo geom={caja(0.6, 0.85, 0.12)} color={C.cian} relleno={0.15 * bobOp} linea={0.8 * bobOp} position={[0, -0.05, 0]} />
      {[-0.2, 0.2].map((x) => (
        <Holo key={x} geom={G.bobina} color={aisla > 0.5 ? '#A5F3FC' : C.cian} relleno={(0.2 + 0.2 * aisla) * bobOp} linea={bobOp} angulo={30} position={[x, -0.05, 0]} />
      ))}
    </group>
  );
};

const Canasta: React.FC<{f: number}> = ({f}) => {
  const peligro = f >= H.DESCARGA && f < H.EXPERTOS + 20 ? (Math.floor(f / 5) % 2 ? 1 : 0.4) : 0;
  return (
    <group>
      <Holo geom={caja(1, 1.1, 1)} color={BLANCO} relleno={0.08} linea={0.8} position={CANASTA.toArray()} />
      {/* pluma del camión */}
      <Holo geom={caja(7, 0.25, 0.25)} color={BLANCO} relleno={0.06} linea={0.5} position={[CANASTA.x + 3.1, CANASTA.y - 1.4, CANASTA.z]} rotation={[0, 0, 0.42]} />
      {/* trabajador */}
      <group position={[CANASTA.x - 0.1, CANASTA.y + 0.55, CANASTA.z]}>
        <Holo geom={G.persona} color={peligro ? C.rojo : C.verde} relleno={0.25 + 0.3 * peligro} linea={1} angulo={30} position={[0, 0.25, 0]} />
        <Holo geom={G.cabeza} color={peligro ? C.rojo : C.verde} relleno={0.3} linea={1} angulo={30} position={[0, 0.85, 0]} />
      </group>
    </group>
  );
};

const Botella: React.FC<{f: number}> = ({f}) => {
  if (f < H.AGUA || f > H.TOCAR + 25) return null;
  const {p, rot} = botella(f);
  const op = interpolate(f, [H.AGUA, H.AGUA + 8, H.TOCAR + 5, H.TOCAR + 25], [0, 1, 1, 0], clamp);
  return (
    <group position={p.toArray()} rotation={[0, 0, rot]}>
      <Holo geom={G.botella} color={AGUA} relleno={0.35 * op} linea={op} angulo={30} />
      <Holo geom={G.cuello} color={AGUA} relleno={0.35 * op} linea={op} angulo={30} position={[0, 0.21, 0]} />
    </group>
  );
};

// Gotas de agua que caen sobre el aceite y se vuelven vapor
const Agua: React.FC<{f: number}> = ({f}) => {
  if (f < H.TOCAR - 5 || f > H.ESPACIO + 60) return null;
  const out = [];
  for (let k = 0; k < 40; k++) {
    const t0 = H.TOCAR - 5 + (k % 10) * 2;
    const t = f - t0;
    if (t < 0) continue;
    const vap = interpolate(f, [H.VAPOR - 8 + (k % 6) * 2, H.VAPOR + 10 + (k % 6) * 2], [0, 1], clamp);
    const x = TANQUE.x + Math.cos(k * 2.4) * 0.35 * Math.min(1, t / 10);
    const z = Math.sin(k * 2.4) * 0.35 * Math.min(1, t / 10);
    const y = Math.max(TAPA_Y + 0.05, TAPA_Y + 0.6 - t * 0.04) + vap * (0.4 + (k % 5) * 0.25) * Math.min(1, (f - H.VAPOR + 10) / 30);
    const r = 0.05 + vap * (0.1 + (k % 4) * 0.04);
    out.push(
      <mesh key={k} geometry={vap > 0.05 ? G.vapor : G.gota} position={[x, y, z]} scale={vap > 0.05 ? r : 1}>
        <meshBasicMaterial color={vap > 0.3 ? '#F1F5F9' : AGUA} transparent opacity={vap > 0.05 ? 0.12 * (1 - Math.max(0, Math.min(1, (f - H.LANZA) / 60))) : 0.9} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
    );
  }
  return <group>{out}</group>;
};

// Llamas en la tapa del transformador
const Llamas: React.FC<{f: number; centro: THREE.Vector3; n: number; escala?: number}> = ({f, centro, n, escala = 1}) => {
  if (n <= 0) return null;
  const out = [];
  for (let k = 0; k < 30; k++) {
    if (k / 30 > n) continue;
    const ciclo = (f * (0.04 + (k % 5) * 0.008) + k * 0.37) % 1;
    const a = k * 2.4;
    out.push(
      <mesh key={k} geometry={G.llama} position={[centro.x + Math.cos(a) * 0.35 * escala, centro.y + ciclo * 0.9 * escala * (0.6 + n), centro.z + Math.sin(a) * 0.35 * escala]} scale={escala * (1 - ciclo * 0.6)}>
        <meshBasicMaterial color={k % 3 === 0 ? C.rojo : ciclo < 0.25 ? '#FDE68A' : FUEGO} transparent opacity={(1 - ciclo) * 0.85} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
    );
  }
  return <group>{out}</group>;
};

// Aceite encendido lanzado por el aire + bola de fuego
const Bola: React.FC<{f: number}> = ({f}) => {
  if (f < H.LANZA - 4 || f > H.BOLA + 110) return null;
  const t = f - (H.LANZA - 4);
  const out = [];
  for (let k = 0; k < 36; k++) {
    const a = (k / 36) * Math.PI * 2;
    const v = 0.03 + ((k * 7) % 5) / 160;
    const tt = Math.min(t, 50);
    out.push(
      <mesh key={k} geometry={G.gota} position={[TANQUE.x + Math.cos(a) * v * tt * 1.4, TAPA_Y + 0.3 + tt * 0.06 - tt * tt * 0.0006, Math.sin(a) * v * tt]} scale={2.2}>
        <meshBasicMaterial color={k % 2 ? FUEGO : '#FDE68A'} transparent opacity={interpolate(t, [0, 60, 110], [1, 0.8, 0], clamp)} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
    );
  }
  const r = interpolate(f, [H.BOLA + 5, H.BOLA + 45, H.BOLA + 110], [0.2, 1.6, 2.1], {...clamp, easing: Easing.out(Easing.cubic)});
  const op = interpolate(f, [H.BOLA + 5, H.BOLA + 20, H.BOLA + 110], [0, 0.4, 0], clamp);
  return (
    <group>
      {out}
      {op > 0 && (
        <mesh geometry={G.vapor} position={[TANQUE.x, TAPA_Y + 1.3, 0]} scale={[r, r * 0.85, r]}>
          <meshBasicMaterial color={FUEGO} transparent opacity={op} depthWrite={false} blending={THREE.AdditiveBlending} />
        </mesh>
      )}
    </group>
  );
};

// La sartén: el mismo efecto en la cocina
const Sarten: React.FC<{f: number}> = ({f}) => {
  const op = interpolate(f, [H.SARTEN - 30, H.SARTEN - 10, H.GAS + 10, H.GAS + 30], [0, 1, 1, 0.2], clamp);
  if (op <= 0) return null;
  const gotaT = interpolate(f, [H.SARTEN, H.SARTEN + 15], [0, 1], {...clamp, easing: Easing.in(Easing.quad)});
  const llam = f >= H.SARTEN + 15 ? interpolate(f, [H.SARTEN + 15, H.SARTEN + 25, H.GAS], [0.3, 1, 0.5], clamp) : 0.25;
  return (
    <group>
      <group position={SARTEN.toArray()}>
        <Holo geom={G.sarten} color={BLANCO} relleno={0.06 * op} linea={0.8 * op} angulo={30} />
        <mesh geometry={G.fondo} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]}>
          <meshBasicMaterial color={C.ambar} transparent opacity={0.4 * op} depthWrite={false} blending={THREE.AdditiveBlending} side={THREE.DoubleSide} />
        </mesh>
        <Holo geom={caja(0.9, 0.06, 0.1)} color={BLANCO} relleno={0.1 * op} linea={0.8 * op} position={[-0.9, 0.02, 0]} />
      </group>
      {gotaT < 1 && (
        <mesh geometry={G.gota} position={[SARTEN.x, SARTEN.y + 0.9 - gotaT * 0.85, 0]} scale={1.6}>
          <meshBasicMaterial color={AGUA} transparent opacity={op} depthWrite={false} blending={THREE.AdditiveBlending} />
        </mesh>
      )}
      <Llamas f={f} centro={new THREE.Vector3(SARTEN.x, SARTEN.y, 0)} n={llam * op} escala={0.9} />
    </group>
  );
};

// Electricidad que sube por el chorro de líquido
const Rayo: React.FC<{f: number}> = ({f}) => {
  if (f < H.CONDUCE - 5 || f > H.CORTA) return null;
  const op = interpolate(f, [H.CONDUCE - 5, H.CONDUCE + 5, H.CORTA - 10, H.CORTA], [0, 1, 1, 0], clamp);
  const largo = Math.round(interpolate(f, [H.CONDUCE, H.DESCARGA], [3, ARCO.length], clamp));
  const pts = ARCO.slice(0, largo).map((p, i) => p.clone().add(new THREE.Vector3(Math.sin(i * 7 + f * 1.3) * 0.08, Math.cos(i * 5 + f * 1.7) * 0.08, 0)));
  const chorro = ARCO;
  return (
    <group>
      <Linea puntos={chorro} color={AGUA} opacidad={0.35 * op} />
      {Math.floor(f / 2) % 3 !== 0 && <Linea puntos={pts} color={'#FDE047'} opacidad={op} />}
      {/* chispas a lo largo del chorro: se ven mejor que una línea fina */}
      {pts.map((p, i) => (
        <mesh key={i} geometry={G.gota} position={p.toArray()} scale={Math.floor(f / 2 + i) % 3 === 0 ? 1.8 : 1}>
          <meshBasicMaterial color={i % 2 ? '#FDE047' : '#FEF9C3'} transparent opacity={op * (Math.floor(f / 2 + i) % 3 === 0 ? 1 : 0.55)} depthWrite={false} blending={THREE.AdditiveBlending} />
        </mesh>
      ))}
    </group>
  );
};

// Nube del extintor (polvo químico / CO₂ de verdad)
const Extintor: React.FC<{f: number}> = ({f}) => {
  if (f < H.EXTINTOR - 5) return null;
  const t = f - (H.EXTINTOR - 5);
  const out = [];
  for (let k = 0; k < 18; k++) {
    const a = k * 2.4;
    const r = Math.min(1, t / 30) * (0.3 + (k % 4) * 0.12);
    out.push(
      <mesh key={k} geometry={G.vapor} position={[TANQUE.x + Math.cos(a) * r * 1.3, TAPA_Y + 0.3 + (k % 3) * 0.2 + t * 0.004, Math.sin(a) * r]} scale={0.18 + r * 0.4}>
        <meshBasicMaterial color={'#F8FAFC'} transparent opacity={interpolate(t, [0, 15, 90], [0, 0.35, 0.08], clamp)} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
    );
  }
  return <group>{out}</group>;
};

const Escena: React.FC<{f: number}> = ({f}) => {
  const aparicion = interpolate(f, [0, 20], [0, 1], clamp);
  return (
    <group scale={[1, aparicion, 1]}>
      <gridHelper args={[60, 60, C.cian, C.cian]} position={[0, 0, 0]}>
        <lineBasicMaterial attach="material" color={C.cian} transparent opacity={0.08} />
      </gridHelper>
      <Poste f={f} />
      <Transformador f={f} />
      <Canasta f={f} />
      <Botella f={f} />
      <Agua f={f} />
      <Llamas f={f} centro={new THREE.Vector3(TANQUE.x, TAPA_Y, 0)} n={llamas(f)} />
      <Bola f={f} />
      <Sarten f={f} />
      <Rayo f={f} />
      <Extintor f={f} />
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

const Panel: React.FC<{op: number; color: string; children: React.ReactNode}> = ({op, color, children}) => (
  <div style={{position: 'absolute', top: 300, left: 60, right: 60, padding: '24px 30px', background: 'rgba(4,14,24,0.82)', border: `2px solid ${color}`, borderRadius: 24, boxShadow: `0 0 30px ${color}44`, opacity: op}}>
    {children}
  </div>
);
const fila = (t: string, w: number, valor: string, color: string) => (
  <div style={{marginTop: 18}}>
    <div style={{display: 'flex', justifyContent: 'space-between', fontFamily: MONO, fontWeight: 700, fontSize: 30, color: C.blanco}}>
      <span>{t}</span>
      <span style={{color}}>{valor}</span>
    </div>
    <div style={{height: 22, marginTop: 8, borderRadius: 11, background: 'rgba(255,255,255,0.1)', overflow: 'hidden'}}>
      <div style={{width: `${Math.max(1, w * 100)}%`, height: '100%', background: color, boxShadow: `0 0 16px ${color}`}} />
    </div>
  </div>
);

// 1 litro de agua → 1,700 litros de vapor
const Expansion: React.FC<{f: number}> = ({f}) => {
  const op = interpolate(f, [H.ESPACIO + 5, H.ESPACIO + 20, H.BOLA - 5, H.BOLA + 10], [0, 1, 1, 0], clamp);
  if (op <= 0) return null;
  const s = interpolate(f, [H.MIL - 10, H.MIL + 30], [1, 6], {...clamp, easing: Easing.out(Easing.cubic)});
  return (
    <Panel op={op} color={C.blanco}>
      <div style={{fontFamily: MONO, fontWeight: 700, fontSize: 26, letterSpacing: 2, color: C.blanco}}>AGUA → VAPOR</div>
      <div style={{display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', height: 250, marginTop: 10}}>
        <div style={{textAlign: 'center'}}>
          <div style={{width: 34, height: 34, margin: '0 auto', background: AGUA, boxShadow: `0 0 16px ${AGUA}`}} />
          <div style={{marginTop: 10, fontFamily: MONO, fontWeight: 700, fontSize: 26, color: AGUA}}>1 litro de agua</div>
        </div>
        <div style={{textAlign: 'center'}}>
          <div style={{width: 34 * s, height: 34 * s, margin: '0 auto', border: '3px solid #F1F5F9', background: 'rgba(241,245,249,0.15)', boxShadow: '0 0 20px rgba(241,245,249,0.5)'}} />
          <div style={{marginTop: 10, fontFamily: MONO, fontWeight: 700, fontSize: 26, color: C.blanco}}>~1,700 litros de vapor</div>
        </div>
      </div>
    </Panel>
  );
};

// El poco CO₂ de una botella frente a un extintor
const Gas: React.FC<{f: number}> = ({f}) => {
  const op = interpolate(f, [H.GAS + 5, H.GAS + 20, H.CORRIENTE - 5, H.CORRIENTE + 10], [0, 1, 1, 0], clamp);
  if (op <= 0) return null;
  const b = interpolate(f, [H.GRAMOS - 5, H.GRAMOS + 10], [0, 0.0075], clamp);
  const e = interpolate(f, [H.KILOS - 10, H.KILOS + 25], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  return (
    <Panel op={op} color={C.ambar}>
      <div style={{fontFamily: MONO, fontWeight: 700, fontSize: 26, letterSpacing: 2, color: C.ambar}}>CO₂ PARA APAGAR EL FUEGO</div>
      {fila('Botella de refresco', b, '~15 g', AGUA)}
      {fila('Extintor pequeño', e, '2 kg', C.verde)}
      <div style={{marginTop: 14, fontFamily: MONO, fontWeight: 700, fontSize: 28, color: e > 0.9 ? C.blanco : 'transparent'}}>Más de 100 veces menos</div>
    </Panel>
  );
};

// Lo que dicen los expertos
const Protocolo: React.FC<{f: number}> = ({f}) => {
  const op = interpolate(f, [H.EXPERTOS + 5, H.EXPERTOS + 20, H.FIN, H.FIN + 15], [0, 1, 1, 0], clamp);
  if (op <= 0) return null;
  const item = (desde: number, ok: boolean, texto: string) => (
    <div style={{marginTop: 14, display: 'flex', alignItems: 'center', gap: 16, fontFamily: TITULAR, fontWeight: 900, fontSize: 42, color: C.blanco, opacity: interpolate(f, [desde - 5, desde + 5], [0, 1], clamp)}}>
      <span style={{color: ok ? C.verde : C.rojo, fontSize: 48}}>{ok ? '✓' : '✗'}</span>
      {texto}
    </div>
  );
  return (
    <Panel op={op} color={C.verde}>
      <div style={{fontFamily: MONO, fontWeight: 700, fontSize: 26, letterSpacing: 2, color: C.verde}}>LO QUE DICEN LOS EXPERTOS</div>
      {item(H.CORTA, true, '1. Cortar la corriente')}
      {item(H.EXTINTOR, true, '2. Extintor de verdad')}
      {item(H.EXTINTOR + 20, false, 'Refresco o agua')}
    </Panel>
  );
};

export const Holograma: React.FC = () => {
  const f = useCurrentFrame();
  const entrada = interpolate(f, [0, 12], [0, 1], clamp);
  const salida = interpolate(f, [H.DUR - 25, H.DUR - 5], [1, 0], clamp);
  const barrido = interpolate(f, [0, 22], [-100, 2000], clamp);
  const flash = interpolate(f, [H.LANZA, H.LANZA + 2, H.LANZA + 10], [0, 0.12, 0], clamp);
  return (
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, #0b2234 0%, #040b14 60%, #01040a 100%)', opacity: Math.min(entrada, salida)}}>
      <ThreeCanvas width={1080} height={1920} camera={{fov: FOV, near: 0.05, far: 500, position: [0, 10, 20]}}>
        <Camara f={f} />
        <Escena f={f} />
      </ThreeCanvas>

      <Etiqueta3D f={f} punto={new THREE.Vector3(TANQUE.x - 0.3, TANQUE.y - 0.35, 0.45)} desde={H.LLENO - 5} hasta={H.ARDE + 10} color={C.ambar} texto="Aceite" dx={-40} dy={220} />
      <Etiqueta3D f={f} punto={new THREE.Vector3(TANQUE.x + 0.2, TANQUE.y, 0.2)} desde={H.BOBINAS - 5} hasta={H.ARDE + 10} texto="Bobinas" dx={50} dy={-220} />
      <Etiqueta3D f={f} punto={new THREE.Vector3(TANQUE.x, TAPA_Y + 0.4, 0)} desde={H.LLAMAS - 5} hasta={H.AGUA + 20} color={C.rojo} texto="El aceite arde" dx={50} dy={-200} />
      <Etiqueta3D f={f} punto={botella(f).p} desde={H.AGUA + 12} hasta={H.TOCAR - 2} color={AGUA} texto="Refresco: casi todo agua" dx={-40} dy={-200} />
      <Etiqueta3D f={f} punto={new THREE.Vector3(TANQUE.x, TAPA_Y + 0.9, 0)} desde={H.VAPOR - 5} hasta={H.ESPACIO + 10} color={C.blanco} texto="¡Vapor!" dx={60} dy={-200} />
      <Etiqueta3D f={f} punto={new THREE.Vector3(SARTEN.x, SARTEN.y + 0.4, 0)} desde={H.SARTEN - 10} hasta={H.GAS} color={C.ambar} texto="Sartén con aceite + agua" dx={30} dy={-240} />
      <Etiqueta3D f={f} punto={ARCO[12]} desde={H.CONDUCE + 10} hasta={H.EXPERTOS} color={'#FDE047'} texto="La electricidad sube" dx={-30} dy={-220} />
      <Etiqueta3D f={f} punto={new THREE.Vector3(CANASTA.x - 0.1, CANASTA.y + 1.5, CANASTA.z)} desde={H.DESCARGA} hasta={H.EXPERTOS + 10} color={C.rojo} texto="¡Peligro!" dx={40} dy={-180} />
      <Etiqueta3D f={f} punto={new THREE.Vector3(0.9, 8.5, 0.25)} desde={H.CORTA} hasta={H.EXTINTOR + 10} color={C.verde} texto="Corriente cortada" dx={-40} dy={240} />

      <Expansion f={f} />
      <Gas f={f} />
      <Protocolo f={f} />
      <AbsoluteFill
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, rgba(34,211,238,0.05) 0px, rgba(34,211,238,0.05) 2px, transparent 2px, transparent 6px)',
          mixBlendMode: 'screen',
        }}
      />
      <div style={{position: 'absolute', left: 0, top: barrido, width: '100%', height: 6, background: C.cian, boxShadow: `0 0 40px 18px ${C.cian}88`}} />
      <AbsoluteFill style={{background: `rgba(255,200,150,${flash})`}} />
    </AbsoluteFill>
  );
};
