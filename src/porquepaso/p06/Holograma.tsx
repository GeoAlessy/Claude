import React, {useLayoutEffect} from 'react';
import * as THREE from 'three';
import {ThreeCanvas} from '@remotion/three';
import {useThree} from '@react-three/fiber';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';
import {Holo, caja, proyectar} from '../three/holo';
import {C, MONO, TITULAR} from '../estilo';
import {Pastilla} from '../hud';
import {H} from './tiempos';
export {H};

// =====================================================================
// Holograma del video 06: qué es el nitrato de amonio, por qué es estable,
// cómo el fuego lo derrite y lo descompone, la detonación y el consejo (rombo 5.1 + alejarse).
// Ejes (metros): la carretera va en x. El camión termina con el frente de la cabina en x ≈ 6.
// La "mesa" de la introducción (granos + planta) está fuera de la carretera, en z = 20.
// =====================================================================
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const suave = Easing.inOut(Easing.cubic);
const BLANCO = '#E0F2FE';
const FUEGO = '#FB923C';

// ---------- Estado ----------
const xCamion = (f: number) => interpolate(f, [H.CHOQUE - 20, H.CHOCO], [-46, 0], {...clamp, easing: Easing.out(Easing.quad)});
const xOtro = (f: number) => interpolate(f, [H.CHOQUE - 20, H.CHOCO, H.CHOCO + 10], [40, 8.6, 9.6], {...clamp, easing: Easing.out(Easing.quad)});
const fuego = (f: number) => interpolate(f, [H.CHOCO + 15, H.ARDER, H.DERRITE + 40, H.OXIGENO, H.REACCIONA], [0, 0.45, 0.7, 0.85, 1], clamp);
const temperatura = (f: number) =>
  interpolate(f, [H.DERRITE + 10, H.SE_DERRITE, H.DESCOMPONE + 20, H.REACCIONA], [20, 170, 230, 300], {...clamp, easing: Easing.inOut(Easing.quad)});
const derretido = (f: number) => interpolate(f, [H.SE_DERRITE - 25, H.SE_DERRITE + 15], [0, 1], {...clamp, easing: suave});
const tExp = (f: number) => f - H.REACCIONA;

// ---------- Cámara ----------
type ClaveCam = [number, [number, number, number], [number, number, number]];
const V = (x: number, y: number, z: number): [number, number, number] => [x, y, z];
const CAM: ClaveCam[] = [
  [0, V(6, 5, 32), V(0, 0.8, 20)],
  [H.NITRATO + 30, V(4, 3, 27), V(0, 0.9, 20)],
  [H.PLANTAS + 10, V(4.5, 2.8, 25.8), V(1.4, 0.9, 20)],
  [H.ESTABLE + 30, V(2.4, 1.9, 24), V(0, 0.5, 20)],
  [H.MANO + 20, V(3, 2.3, 24.6), V(0, 0.5, 20)],
  [H.CHOQUE + 20, V(-6, 16, 44), V(-8, 4.5, 0)],
  [H.CHOCO + 10, V(10, 9, 28), V(3, 4, 0)],
  [H.MONGOLIA + 30, V(-12, 10, 30), V(0, 4, 0)],
  [H.ARDER + 10, V(-14, 8, 24), V(0, 4.5, 0)],
  [H.DERRITE + 40, V(-3, 3.6, 9), V(-1.5, 1.6, 0)],
  [H.SE_DERRITE + 10, V(-1.5, 3.2, 7.2), V(-1.5, 1.4, 0)],
  [H.OXIGENO, V(-6, 5, 11), V(0, 2.2, 0)],
  [H.REACCIONA - 4, V(-10, 7, 18), V(0, 2, 0)],
  [H.REACCIONA + 30, V(-34, 26, 60), V(0, 9, 0)],
  [H.BEIRUT + 40, V(-30, 30, 52), V(0, 7, 0)],
  [H.VICTIMAS + 10, V(-22, 26, 42), V(0, 6, 0)],
  [H.CONSEJO + 20, V(-28, 40, 60), V(-4, 9, 4)],
  [H.KM + 10, V(-40, 85, 110), V(-12, 16, 12)],
  [H.DUR, V(40, 95, 120), V(0, 16, 0)],
];
export const FOV = 40;
export function camaraEn(f: number) {
  const fr = CAM.map((k) => k[0]);
  const p = new THREE.Vector3(...([0, 1, 2].map((i) => interpolate(f, fr, CAM.map((k) => k[1][i]), {...clamp, easing: suave})) as [number, number, number]));
  const t = new THREE.Vector3(...([0, 1, 2].map((i) => interpolate(f, fr, CAM.map((k) => k[2][i]), {...clamp, easing: suave})) as [number, number, number]));
  const temblor = interpolate(tExp(f), [-1, 0, 25], [0, 0.9, 0], clamp) + interpolate(f, [H.CHOCO - 1, H.CHOCO, H.CHOCO + 10], [0, 0.2, 0], clamp);
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
// Introducción: granos de fertilizante y una planta
// =====================================================================
const GRANO = new THREE.SphereGeometry(0.11, 8, 6);
const GRANOS: [number, number, number][] = [];
for (let i = 0; i < 140; i++) {
  const a = i * 2.39996;
  const r = Math.sqrt(i / 140) * 1.3;
  GRANOS.push([Math.cos(a) * r, 0.11 + (1.3 - r) * 0.55 + ((i * 7) % 3) * 0.03, Math.sin(a) * r]);
}
const Granos: React.FC<{f: number}> = ({f}) => {
  const op = interpolate(f, [H.CHOQUE + 10, H.CHOQUE + 40], [1, 0.25], clamp);
  const caer = (i: number) => interpolate(f, [H.NITRATO - 30 + (i % 40), H.NITRATO + (i % 40)], [3, 0], {...clamp, easing: Easing.in(Easing.quad)});
  const pulso = f >= H.ESTABLE ? 0.5 + 0.5 * Math.sin(f / 9) : 0;
  return (
    <group position={[0, 0, 20]}>
      {/* saco */}
      <Holo geom={caja(0.9, 1.2, 0.6)} color={BLANCO} relleno={0.06 * op} linea={0.6 * op} position={[-1.7, 0.6, -0.4]} rotation={[0, 0.4, 0.25]} />
      {GRANOS.map(([x, y, z], i) => (
        <mesh key={i} geometry={GRANO} position={[x, y + caer(i), z]}>
          <meshBasicMaterial color={pulso > 0 ? C.verde : BLANCO} transparent opacity={(0.55 + 0.25 * pulso) * op} depthWrite={false} blending={THREE.AdditiveBlending} />
        </mesh>
      ))}
    </group>
  );
};
const TALLO = new THREE.CylinderGeometry(0.03, 0.045, 1, 8);
const HOJA = new THREE.SphereGeometry(1, 10, 6);
const Planta: React.FC<{f: number}> = ({f}) => {
  const c = interpolate(f, [H.CAMPO - 5, H.PLANTAS + 20], [0.01, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  const op = interpolate(f, [H.CHOQUE + 10, H.CHOQUE + 40], [1, 0.25], clamp);
  return (
    <group position={[2.1, 0, 19.6]} scale={[c, c, c]}>
      <Holo geom={TALLO} color={C.verde} relleno={0.3 * op} linea={0.8 * op} angulo={40} position={[0, 0.6, 0]} scale={[1, 1.2, 1]} />
      {[0, 1, 2, 3].map((k) => (
        <Holo key={k} geom={HOJA} color={C.verde} relleno={0.15 * op} linea={0.5 * op} angulo={25} position={[Math.cos(k * 1.7) * 0.3, 0.45 + k * 0.22, Math.sin(k * 1.7) * 0.3]} scale={[0.32, 0.05, 0.14]} rotation={[0, -k * 1.7, 0.4]} />
      ))}
    </group>
  );
};

// =====================================================================
// Carretera (en losas que se levantan con la explosión)
// =====================================================================
const LOSAS: [number, number][] = [];
for (let x = -60; x <= 60; x += 6) for (const z of [-2, 2]) LOSAS.push([x, z]);
const Carretera: React.FC<{f: number}> = ({f}) => {
  const t = tExp(f);
  return (
    <group>
      {LOSAS.map(([x, z], i) => {
        const d = Math.hypot(x, z);
        const golpe = t >= 0 && d < 20 ? interpolate(t, [0, 10], [0, 1], {...clamp, easing: Easing.out(Easing.back(2))}) * (1 - d / 20) : 0;
        const roto = d < 7 && t >= 0;
        return (
          <Holo
            key={i}
            geom={caja(5.8, 0.25, 3.8)}
            color={roto ? C.rojo : '#94A3B8'}
            relleno={0.05}
            linea={0.45}
            position={[x, -0.12 - (d < 7 && t >= 0 ? 0.9 : 0) + golpe * 0.5, z]}
            rotation={[golpe * 0.35 * Math.sign(z), ((i * 13) % 7) * 0.02 * golpe, golpe * 0.3 * Math.sign(x || 1)]}
          />
        );
      })}
      {Array.from({length: 24}, (_, k) => -69 + k * 6).map((x) => (
        <Holo key={'c' + x} geom={caja(2.4, 0.03, 0.15)} color={C.ambar} relleno={0.35} linea={0.5} position={[x, 0.02, 0]} />
      ))}
    </group>
  );
};

// ---------- Camión con la carga en sacos ----------
const SACOS: [number, number, number][] = [];
for (let ix = 0; ix < 7; ix++) for (let iy = 0; iy < 3; iy++) for (const iz of [-0.5, 0.5]) SACOS.push([-5.6 + ix * 1.2, 0.95 + iy * 0.62, iz]);
const RUEDA = new THREE.CylinderGeometry(0.5, 0.5, 0.35, 14);
const Camion: React.FC<{f: number}> = ({f}) => {
  const t = tExp(f);
  if (t > 40) return null;
  const vuela = t >= 0;
  const op = vuela ? interpolate(t, [0, 40], [1, 0], clamp) : 1;
  const m = derretido(f);
  const calor = interpolate(temperatura(f), [20, 170, 300], [0, 0.6, 1], clamp);
  const colorCarga = calor > 0.5 ? C.ambar : calor > 0.15 ? '#FDE68A' : BLANCO;
  const pulso = f > H.GOLPE ? 0.5 + 0.5 * Math.sin(f * interpolate(f, [H.GOLPE, H.REACCIONA], [0.3, 1.2], clamp)) : 0;
  const despl = (k: number) => (vuela ? new THREE.Vector3(Math.cos(k * 2.1) * t * 0.9, t * 0.6 - t * t * 0.012, Math.sin(k * 2.1) * t * 0.9) : new THREE.Vector3());
  return (
    <group position={[xCamion(f), 0, -2]}>
      {/* cabina */}
      <group position={despl(1).toArray()} rotation={[vuela ? t * 0.08 : 0, 0, vuela ? t * 0.05 : 0]}>
        <Holo geom={caja(2.5, 3, 2.5)} color={BLANCO} relleno={0.08 * op} linea={0.8 * op} position={[5, 1.95, 0]} />
        <Holo geom={caja(0.1, 1.2, 2.2)} color={'#93C5FD'} relleno={0.15 * op} linea={0.8 * op} position={[6.27, 2.6, 0]} />
      </group>
      {/* caja del remolque: abierta para ver la carga */}
      <group position={despl(2).toArray()} rotation={[0, vuela ? t * 0.03 : 0, vuela ? -t * 0.04 : 0]}>
        <Holo geom={caja(9.6, 0.3, 2.6)} color={BLANCO} relleno={0.1 * op} linea={0.8 * op} position={[-1.8, 0.6, 0]} />
        <Holo geom={caja(9.6, 2.4, 2.6)} color={BLANCO} relleno={0.02 * op} linea={0.4 * op} position={[-1.8, 1.95, 0]} />
      </group>
      {[-5, -3.6, 4.6].map((x, k) =>
        [-1, 1].map((s) => (
          <Holo key={`${x}${s}`} geom={RUEDA} color={BLANCO} relleno={0.1 * op} linea={0.6 * op} angulo={30} position={[x + despl(k + 3).x, 0.5 + Math.max(0, despl(k + 3).y), s * 1.25 + despl(k + 3).z]} rotation={[Math.PI / 2, 0, 0]} />
        ))
      )}
      {/* carga: sacos que se derriten en un charco */}
      {!vuela &&
        SACOS.map(([x, y, z], i) => (
          <Holo
            key={i}
            geom={caja(1.05, 0.55, 0.9)}
            color={colorCarga}
            relleno={(0.12 + 0.25 * pulso) * op}
            linea={(0.75 - 0.35 * m) * op}
            position={[x, interpolate(m, [0, 1], [y, 0.85 + (y - 0.95) * 0.12]), z * (1 + 0.15 * m)]}
            scale={[1 + 0.12 * m, 1 - 0.8 * m, 1 + 0.1 * m]}
          />
        ))}
    </group>
  );
};

// Otro vehículo con el que chocó (genérico)
const Otro: React.FC<{f: number}> = ({f}) => {
  const t = tExp(f);
  const op = interpolate(f, [H.CHOQUE - 20, H.CHOQUE], [0, 1], clamp) * (t > 0 ? interpolate(t, [0, 30], [1, 0.15], clamp) : 1);
  const empuje = t > 0 ? Math.min(t, 20) * 0.5 : 0;
  return (
    <group position={[xOtro(f) + empuje, t > 0 ? Math.min(t, 10) * 0.08 : 0, -2]} rotation={[0, t > 0 ? Math.min(t, 20) * 0.04 : 0, 0]}>
      <Holo geom={caja(5.5, 2.6, 2.3)} color={C.ambar} relleno={0.08 * op} linea={0.8 * op} position={[2.75, 1.7, 0]} />
      {[0.9, 4.6].map((x) =>
        [-1, 1].map((s) => <Holo key={`${x}${s}`} geom={RUEDA} color={C.ambar} relleno={0.1 * op} linea={0.6 * op} angulo={30} position={[x, 0.5, s * 1.1]} rotation={[Math.PI / 2, 0, 0]} />)
      )}
    </group>
  );
};

// ---------- Fuego, humo y gases ----------
const LLAMA = new THREE.ConeGeometry(0.35, 1.2, 5);
const HUMO = new THREE.SphereGeometry(1, 8, 6);
const Fuego: React.FC<{f: number}> = ({f}) => {
  const n = fuego(f);
  if (n <= 0 || tExp(f) > 6) return null;
  const out = [];
  for (let k = 0; k < 46; k++) {
    if (k / 46 > n) continue;
    const ciclo = ((f * (0.03 + (k % 5) * 0.006) + k * 0.37) % 1);
    const x = 6.2 - ((k * 37) % 100) / 100 * 9 * n;
    const z = -2 + (((k * 53) % 100) / 100 - 0.5) * 2.6;
    const y = 3.2 + ciclo * (2 + 3 * n);
    const caliente = f > H.OXIGENO ? 1 : 0;
    out.push(
      <mesh key={k} geometry={LLAMA} position={[x, y, z]} scale={[1 - ciclo * 0.7, 1 - ciclo * 0.5, 1 - ciclo * 0.7]}>
        <meshBasicMaterial color={ciclo < 0.3 && caliente ? '#FEF3C7' : k % 3 === 0 ? C.rojo : FUEGO} transparent opacity={(1 - ciclo) * 0.8} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
    );
  }
  for (let k = 0; k < 14; k++) {
    const ciclo = ((f * 0.012 + k / 14) % 1);
    out.push(
      <mesh key={'h' + k} geometry={HUMO} position={[4 - ciclo * 8 - (k % 3) * 2, 5 + ciclo * 18, -2 + ((k * 7) % 5) - 2]} scale={1 + ciclo * 3.5 * n}>
        <meshBasicMaterial color={'#64748B'} transparent opacity={0.12 * (1 - ciclo) * n} depthWrite={false} />
      </mesh>
    );
  }
  return <group>{out}</group>;
};
const BURBUJA = new THREE.SphereGeometry(0.13, 8, 6);
const Gases: React.FC<{f: number}> = ({f}) => {
  if (f < H.DESCOMPONE - 20 || tExp(f) > 0) return null;
  const n = interpolate(f, [H.DESCOMPONE - 20, H.DESCOMPONE + 20, H.REACCIONA], [0, 0.6, 1], clamp);
  const out = [];
  for (let k = 0; k < 60; k++) {
    if (k / 60 > n) continue;
    const ciclo = ((f * 0.025 + k * 0.173) % 1);
    out.push(
      <mesh key={k} geometry={BURBUJA} position={[-5.6 + ((k * 41) % 100) / 100 * 7.4 + xCamion(f), 1.1 + ciclo * 3.2, -2 + (((k * 29) % 100) / 100 - 0.5) * 1.8]} scale={0.6 + ciclo}>
        <meshBasicMaterial color={k % 2 ? C.rojo : C.ambar} transparent opacity={(1 - ciclo) * 0.85} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
    );
  }
  return <group>{out}</group>;
};

// ---------- Explosión ----------
const BOLA = new THREE.SphereGeometry(1, 28, 18);
const ONDA = new THREE.RingGeometry(0.94, 1, 72);
const PEDAZO = new THREE.TetrahedronGeometry(0.35, 0);
const Explosion: React.FC<{f: number}> = ({f}) => {
  const t = tExp(f);
  if (t < 0) return null;
  const r = interpolate(t, [0, 10, 40], [1, 22, 30], {...clamp, easing: Easing.out(Easing.cubic)});
  const op = interpolate(t, [0, 4, 40], [0.9, 0.7, 0], clamp);
  const out = [];
  for (let k = 0; k < 28; k++) {
    const a = (k / 28) * Math.PI * 2;
    const v = 0.5 + ((k * 7) % 5) / 6;
    const tt = Math.min(t, 45);
    out.push(<Holo key={k} geom={PEDAZO} color={k % 2 ? C.rojo : C.ambar} relleno={0.3} linea={0.9} angulo={1} position={[Math.cos(a) * v * tt, Math.max(0.2, 1 + tt * 0.7 - tt * tt * 0.017), -2 + Math.sin(a) * v * tt]} rotation={[k + t * 0.3, k, t * 0.2]} />);
  }
  return (
    <group>
      {op > 0 && (
        <mesh geometry={BOLA} position={[0, 2, -2]} scale={[r, r * 0.8, r]}>
          <meshBasicMaterial color={'#FDBA74'} transparent opacity={op * 0.28} depthWrite={false} blending={THREE.AdditiveBlending} />
        </mesh>
      )}
      {[0, 1, 2].map((k) => {
        const tk = t - k * 5;
        if (tk < 0) return null;
        const rr = 2 + tk * 2.2;
        return (
          <mesh key={k} geometry={ONDA} position={[0, 0.15, -2]} rotation={[-Math.PI / 2, 0, 0]} scale={[rr, rr, 1]}>
            <meshBasicMaterial color={C.blanco} transparent opacity={interpolate(tk, [0, 45], [0.9, 0], clamp)} depthWrite={false} blending={THREE.AdditiveBlending} side={THREE.DoubleSide} />
          </mesh>
        );
      })}
      {out}
    </group>
  );
};

// ---------- Consejo: alejarse (anillo de seguridad y una persona que se va) ----------
const ANILLO = new THREE.RingGeometry(0.97, 1, 96);
const GP = {
  cuerpo: new THREE.CapsuleGeometry(0.3, 1.1, 3, 8),
  cabeza: new THREE.SphereGeometry(0.24, 10, 8),
};
const Seguridad: React.FC<{f: number}> = ({f}) => {
  if (f < H.ALEJATE - 10) return null;
  const r = interpolate(f, [H.ALEJATE, H.KM + 20], [4, 60], {...clamp, easing: Easing.out(Easing.cubic)});
  const op = interpolate(f, [H.ALEJATE - 10, H.ALEJATE + 10], [0, 1], clamp);
  const d = interpolate(f, [H.ALEJATE, H.KM + 40], [10, 66], {...clamp, easing: Easing.inOut(Easing.quad)});
  return (
    <group>
      <mesh geometry={ANILLO} position={[0, 0.2, -2]} rotation={[-Math.PI / 2, 0, 0]} scale={[r, r, 1]}>
        <meshBasicMaterial color={C.verde} transparent opacity={0.9 * op} depthWrite={false} blending={THREE.AdditiveBlending} side={THREE.DoubleSide} />
      </mesh>
      <group position={[-d * 0.7, 0, -2 + d * 0.7]}>
        <Holo geom={GP.cuerpo} color={C.verde} relleno={0.3 * op} linea={0.9 * op} angulo={30} position={[0, 1.9, 0]} scale={2.2} />
        <Holo geom={GP.cabeza} color={C.verde} relleno={0.3 * op} linea={0.9 * op} angulo={30} position={[0, 4.2, 0]} scale={2.2} />
      </group>
    </group>
  );
};

const Escena: React.FC<{f: number}> = ({f}) => {
  const aparicion = interpolate(f, [0, 20], [0, 1], clamp);
  return (
    <group scale={[1, aparicion, 1]}>
      <gridHelper args={[400, 200, C.cian, C.cian]} position={[0, -0.3, 0]}>
        <lineBasicMaterial attach="material" color={C.cian} transparent opacity={0.06} />
      </gridHelper>
      <Granos f={f} />
      <Planta f={f} />
      <Carretera f={f} />
      <Camion f={f} />
      <Otro f={f} />
      <Fuego f={f} />
      <Gases f={f} />
      <Explosion f={f} />
      <Seguridad f={f} />
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

// Ficha del químico
const Ficha: React.FC<{f: number}> = ({f}) => {
  const op = interpolate(f, [H.NITRATO + 5, H.NITRATO + 20, H.CHOQUE - 5, H.CHOQUE + 10], [0, 1, 1, 0], clamp);
  if (op <= 0) return null;
  return (
    <Panel op={op} color={C.cian}>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'baseline'}}>
        <div style={{fontFamily: MONO, fontWeight: 700, fontSize: 28, letterSpacing: 2, color: C.cian}}>NITRATO DE AMONIO</div>
        <div style={{fontFamily: MONO, fontWeight: 700, fontSize: 34, color: C.blanco}}>
          NH<sub>4</sub>NO<sub>3</sub>
        </div>
      </div>
      <div style={{marginTop: 12, fontFamily: MONO, fontWeight: 700, fontSize: 26, color: interpolate(f, [H.CAMPO, H.CAMPO + 10], [0, 1], clamp) > 0.5 ? C.verde : 'transparent'}}>Uso: fertilizante</div>
      <div style={{marginTop: 6, fontFamily: MONO, fontWeight: 700, fontSize: 26, color: f >= H.ESTABLE + 10 ? C.verde : 'transparent'}}>Estado normal: estable ✓</div>
    </Panel>
  );
};

// Termómetro de la carga
const Termometro: React.FC<{f: number}> = ({f}) => {
  const op = interpolate(f, [H.DERRITE + 5, H.DERRITE + 20, H.REACCIONA + 10, H.REACCIONA + 30], [0, 1, 1, 0], clamp);
  if (op <= 0) return null;
  const T = temperatura(f);
  const estado = f >= H.REACCIONA ? '¡REACCIONA!' : f >= H.DESCOMPONE ? 'SE DESCOMPONE' : f >= H.SE_DERRITE - 10 ? 'SE DERRITE' : 'SÓLIDO';
  const color = f >= H.REACCIONA ? C.rojo : f >= H.DESCOMPONE ? C.rojo : f >= H.SE_DERRITE - 10 ? C.ambar : C.cian;
  return (
    <Panel op={op} color={color}>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        <div style={{fontFamily: MONO, fontWeight: 700, fontSize: 26, letterSpacing: 2, color}}>TEMPERATURA DE LA CARGA</div>
        <div style={{fontFamily: MONO, fontWeight: 700, fontSize: 44, color: C.blanco}}>{Math.round(T)} °C</div>
      </div>
      <div style={{height: 22, marginTop: 14, borderRadius: 11, background: 'rgba(255,255,255,0.1)', overflow: 'hidden'}}>
        <div style={{width: `${(T / 300) * 100}%`, height: '100%', background: `linear-gradient(90deg, ${C.cian}, ${C.ambar}, ${C.rojo})`, boxShadow: `0 0 16px ${color}`}} />
      </div>
      <div style={{marginTop: 12, fontFamily: MONO, fontWeight: 700, fontSize: 30, color}}>{estado}</div>
    </Panel>
  );
};

// Beirut
const Beirut: React.FC<{f: number}> = ({f}) => {
  const op = interpolate(f, [H.BEIRUT + 5, H.BEIRUT + 20, H.VICTIMAS - 5, H.VICTIMAS + 8], [0, 1, 1, 0], clamp);
  if (op <= 0) return null;
  return (
    <Panel op={op} color={C.rojo}>
      <div style={{fontFamily: MONO, fontWeight: 700, fontSize: 26, letterSpacing: 2, color: C.rojo}}>MISMO QUÍMICO</div>
      <div style={{marginTop: 10, fontFamily: TITULAR, fontWeight: 900, fontSize: 56, color: C.blanco}}>Puerto de Beirut · 2020</div>
      <div style={{marginTop: 6, fontFamily: MONO, fontWeight: 700, fontSize: 28, color: C.ambar}}>2,750 toneladas en un almacén</div>
    </Panel>
  );
};

// Rombo amarillo 5.1 (comburente / oxidante)
const Rombo: React.FC<{f: number}> = ({f}) => {
  const op = interpolate(f, [H.ROMBO - 10, H.ROMBO + 5, H.KM - 5, H.KM + 10], [0, 1, 1, 0.0], clamp);
  if (op <= 0) return null;
  const s = interpolate(f, [H.ROMBO - 10, H.ROMBO + 8], [0.6, 1], {...clamp, easing: Easing.out(Easing.back(2))});
  return (
    <div style={{position: 'absolute', top: 290, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: op, transform: `scale(${s})`}}>
      <svg width={300} height={300} viewBox="-150 -150 300 300">
        <rect x={-100} y={-100} width={200} height={200} transform="rotate(45)" fill="#FACC15" stroke="#111" strokeWidth={6} />
        <rect x={-90} y={-90} width={180} height={180} transform="rotate(45)" fill="none" stroke="#111" strokeWidth={3} />
        {/* llama sobre un círculo */}
        <circle cx={0} cy={-18} r={22} fill="none" stroke="#111" strokeWidth={8} />
        <path d="M0,-96 C18,-74 26,-60 14,-44 C24,-48 28,-58 26,-66 C40,-50 36,-30 18,-26 L-18,-26 C-36,-30 -40,-50 -24,-66 C-26,-56 -22,-48 -12,-44 C-24,-60 -16,-78 0,-96 Z" fill="#111" />
        <rect x={-34} y={10} width={68} height={6} fill="#111" />
        <text x={0} y={92} textAnchor="middle" fontFamily="Inter, sans-serif" fontWeight={700} fontSize={34} fill="#111">
          5.1
        </text>
      </svg>
      <div style={{marginTop: 6}}>
        <Pastilla color={C.ambar} tam={30}>
          Oxidante · peligro de explosión
        </Pastilla>
      </div>
    </div>
  );
};

export const Holograma: React.FC = () => {
  const f = useCurrentFrame();
  const entrada = interpolate(f, [0, 12], [0, 1], clamp);
  const salida = interpolate(f, [H.DUR - 25, H.DUR - 5], [1, 0], clamp);
  const barrido = interpolate(f, [0, 22], [-100, 2000], clamp);
  const flash = interpolate(tExp(f), [0, 2, 12], [0, 0.18, 0], clamp);
  const tenue = interpolate(f, [H.VICTIMAS, H.VICTIMAS + 20, H.CONSEJO, H.CONSEJO + 20], [1, 0.6, 0.6, 1], clamp);
  return (
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, #0b2234 0%, #040b14 60%, #01040a 100%)', opacity: Math.min(entrada, salida)}}>
      <AbsoluteFill style={{opacity: tenue}}>
        <ThreeCanvas width={1080} height={1920} camera={{fov: FOV, near: 0.1, far: 3000, position: [0, 10, 20]}}>
          <Camara f={f} />
          <Escena f={f} />
        </ThreeCanvas>
      </AbsoluteFill>

      <Etiqueta3D f={f} punto={new THREE.Vector3(0, 0.9, 20)} desde={H.NITRATO + 15} hasta={H.CAMPO + 10} texto="Granos de fertilizante" dx={-40} dy={260} />
      <Etiqueta3D f={f} punto={new THREE.Vector3(2.1, 1.4, 19.6)} desde={H.PLANTAS - 5} hasta={H.ESTABLE + 10} color={C.verde} texto="Plantas" dx={40} dy={-200} />
      <Etiqueta3D f={f} punto={new THREE.Vector3(0, 0.6, 20)} desde={H.MANO - 10} hasta={H.CHOQUE} color={C.verde} texto="Se puede tocar" dx={-40} dy={260} />
      <Etiqueta3D f={f} punto={new THREE.Vector3(6.3, 2, -2)} desde={H.CHOCO} hasta={H.MONGOLIA + 10} color={C.rojo} texto="Choque" dx={40} dy={-220} />
      <Etiqueta3D f={f} punto={new THREE.Vector3(-20, 0, 0)} desde={H.MONGOLIA} hasta={H.ARDER + 15} texto="Mongolia Interior, China" dx={-30} dy={240} />
      <Etiqueta3D f={f} punto={new THREE.Vector3(-1.5, 1.4, -1.4)} desde={H.DERRITE + 30} hasta={H.SE_DERRITE - 5} texto="Carga: nitrato de amonio" dx={-30} dy={260} />
      <Etiqueta3D f={f} punto={new THREE.Vector3(1, 6, -2)} desde={H.OXIGENO - 5} hasta={H.GOLPE + 10} color={C.rojo} texto="+ oxígeno al fuego" dx={40} dy={-200} />
      <Etiqueta3D f={f} punto={new THREE.Vector3(0, 0, -2)} desde={H.REACCIONA + 40} hasta={H.BEIRUT + 30} color={C.rojo} texto="El asfalto, partido" dx={40} dy={240} />
      <Etiqueta3D f={f} punto={new THREE.Vector3(-42, 0.2, 40)} desde={H.KM - 10} hasta={H.FIN + 20} color={C.verde} texto="+1.5 km" dx={-30} dy={-220} />

      <Ficha f={f} />
      <Termometro f={f} />
      <Beirut f={f} />
      <Rombo f={f} />
      <AbsoluteFill
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, rgba(34,211,238,0.05) 0px, rgba(34,211,238,0.05) 2px, transparent 2px, transparent 6px)',
          mixBlendMode: 'screen',
        }}
      />
      <div style={{position: 'absolute', left: 0, top: barrido, width: '100%', height: 6, background: C.cian, boxShadow: `0 0 40px 18px ${C.cian}88`}} />
      <AbsoluteFill style={{background: `rgba(255,240,220,${flash})`}} />
    </AbsoluteFill>
  );
};
