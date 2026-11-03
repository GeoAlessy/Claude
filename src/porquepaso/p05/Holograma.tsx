import React, {useLayoutEffect} from 'react';
import * as THREE from 'three';
import {ThreeCanvas} from '@remotion/three';
import {useThree} from '@react-three/fiber';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';
import {Holo, caja, proyectar} from '../three/holo';
import {C, MONO} from '../estilo';
import {Pastilla} from '../hud';
import {H} from './tiempos';
export {H};

// =====================================================================
// Holograma del video 05: el valle de Pheriche (4,200 m), los excursionistas,
// la torre de control que no alcanza, las dos rutas, el roce de las aspas y el aire delgado.
// Ejes (metros): el valle va en x (Lukla hacia −x, el campamento base hacia +x). Helipuerto en el origen.
// =====================================================================
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const suave = Easing.inOut(Easing.cubic);
const BLANCO = '#E0F2FE';
const AZUL = '#93C5FD'; // helicóptero que sube desde Lukla (blanco con azul)
const NARANJA = '#FB923C'; // helicóptero que baja desde la zona del campamento base (rojo)
const RADIO_ROTOR = 5.35; // AS350: rotor de 10.7 m de diámetro

// ---------- Trayectorias ----------
const progreso = (f: number) =>
  interpolate(f, [H.TORRE, H.DOS, H.MISMO, H.ASPAS, H.TOCAN], [0, 0.15, 0.6, 0.93, 1], clamp);
type Estado = {pos: THREE.Vector3; yaw: number; pitch: number; roll: number; rotor: number; palas: number};
const A_INI = new THREE.Vector3(-130, 30, 18);
const A_FIN = new THREE.Vector3(-5.2, 3.2, 2.6);
const R_INI = new THREE.Vector3(105, 50, -20);
const R_FIN = new THREE.Vector3(2.2, 3.6, -3.2);
function enRuta(ini: THREE.Vector3, fin: THREE.Vector3, p: number) {
  const v = ini.clone().lerp(fin, p);
  v.y = fin.y + (ini.y - fin.y) * Math.pow(1 - p, 1.6);
  return v;
}
// Ruta completa (para dibujar la línea punteada)
function ruta(ini: THREE.Vector3, fin: THREE.Vector3) {
  const out: THREE.Vector3[] = [];
  for (let i = 0; i <= 40; i++) out.push(enRuta(ini, fin, i / 40));
  return out;
}
const RUTA_A = ruta(A_INI, A_FIN);
const RUTA_R = ruta(R_INI, R_FIN);

function heliA(f: number): Estado {
  const t = f - H.TOCAN;
  const giro = f * 0.55;
  if (t < 0) {
    const p = progreso(f);
    return {pos: enRuta(A_INI, A_FIN, p), yaw: Math.atan2(-(A_FIN.z - A_INI.z), A_FIN.x - A_INI.x), pitch: -0.12 * (1 - p) - 0.05, roll: 0, rotor: giro, palas: 1};
  }
  // tras el roce: gira, cae y queda de costado
  const c = interpolate(t, [0, 30], [0, 1], {...clamp, easing: Easing.in(Easing.quad)});
  const pos = A_FIN.clone().add(new THREE.Vector3(-1.2 * c, 0, 0.8 * c));
  pos.y = interpolate(t, [0, 30], [A_FIN.y, 0.6], {...clamp, easing: Easing.in(Easing.quad)});
  const freno = interpolate(t, [0, 40], [0.55, 0], clamp);
  return {pos, yaw: interpolate(t, [0, 40], [0, 1.3], {...clamp, easing: Easing.out(Easing.quad)}), pitch: 0, roll: interpolate(t, [0, 34], [0, 1.25], clamp), rotor: H.TOCAN * 0.55 + t * freno * 0.5, palas: interpolate(t, [0, 6], [1, 0.45], clamp)};
}
function heliR(f: number): Estado {
  const t = f - H.TOCAN;
  const giro = f * 0.55 + 1;
  if (t < 0) {
    const p = progreso(f);
    return {pos: enRuta(R_INI, R_FIN, p), yaw: Math.atan2(-(R_FIN.z - R_INI.z), R_FIN.x - R_INI.x), pitch: -0.08 * (1 - p), roll: 0, rotor: giro, palas: 1};
  }
  // tras el roce: se inclina, se desliza y cae de lado
  const c = interpolate(t, [0, 42], [0, 1], {...clamp, easing: Easing.in(Easing.quad)});
  const pos = R_FIN.clone().add(new THREE.Vector3(3 * c, 0, -1.5 * c));
  pos.y = interpolate(t, [0, 14, 42], [R_FIN.y, R_FIN.y + 0.8, 0.7], {...clamp, easing: Easing.inOut(Easing.quad)});
  const freno = interpolate(t, [0, 46], [0.55, 0], clamp);
  return {
    pos,
    yaw: Math.atan2(-(R_FIN.z - R_INI.z), R_FIN.x - R_INI.x) + interpolate(t, [0, 46], [0, -0.9], clamp),
    pitch: interpolate(t, [0, 20, 42], [0, 0.35, 0.1], clamp),
    roll: interpolate(t, [0, 42], [0, -1.3], {...clamp, easing: Easing.in(Easing.quad)}),
    rotor: H.TOCAN * 0.55 + 1 + t * freno * 0.5,
    palas: interpolate(t, [0, 6], [1, 0.5], clamp),
  };
}
// Punto del roce: entre los dos rotores
const ROCE = new THREE.Vector3((A_FIN.x + R_FIN.x) / 2, (A_FIN.y + R_FIN.y) / 2 + 2.9, (A_FIN.z + R_FIN.z) / 2);

// Helicóptero que despega con excursionistas (los vuelos de ida y vuelta)
function lanzadera(f: number) {
  const t = interpolate(f, [H.IBAN - 30, H.IBAN + 90], [0, 1], clamp);
  const pos = new THREE.Vector3(-150 * Math.pow(t, 1.8), 0.1 + 40 * Math.pow(t, 1.2), 6 - 10 * t);
  return {pos, yaw: Math.PI, pitch: t > 0 ? -0.15 : 0, roll: 0, rotor: f * 0.55, palas: 1};
}

// ---------- Cámara ----------
type ClaveCam = [number, [number, number, number], [number, number, number]];
const V = (x: number, y: number, z: number): [number, number, number] => [x, y, z];
// En vertical caben mejor las distancias a lo largo de la pantalla: para la torre, las rutas
// y el roce, la cámara mira el valle "de punta" (desde +x), así el eje x queda de arriba abajo.
const CAM: ClaveCam[] = [
  [0, V(60, 70, 140), V(0, 5, 0)],
  [H.PHERICHE + 30, V(40, 40, 90), V(0, 3, 0)],
  [H.ALTURA + 20, V(30, 24, 60), V(4, 2, 4)],
  [H.NIEVE + 25, V(34, 16, 46), V(9, 2, 7)],
  [H.IBAN + 30, V(26, 30, 60), V(-25, 10, 0)],
  [H.TORRE + 25, V(50, 110, 8), V(-62, 0, 6)],
  [H.RADIO + 5, V(65, 112, 10), V(-45, 5, 2)],
  [H.DOS + 30, V(150, 150, 40), V(-15, 10, 0)],
  [H.BASE + 20, V(135, 135, 35), V(-10, 8, 0)],
  [H.MISMO + 25, V(70, 80, 12), V(-8, 4, 0)],
  [H.ASPAS + 15, V(42, 58, 8), V(-2, 3, 0)],
  [H.TOCAN - 4, V(27, 40, 6), V(-1.5, 3.5, 0)],
  [H.TOCAN + 16, V(22, 20, 22), V(-1, 1.5, 0)],
  [H.AIRE + 22, V(10, 11, 34), V(0, 2.5, 0)],
  [H.VICTIMA + 5, V(16, 16, 40), V(0, 1.5, 0)],
  [H.CIERRE, V(24, 28, 56), V(0, 2, 0)],
  [H.FIN - 5, V(40, 48, 84), V(0, 3, 0)],
  [H.DUR, V(66, 68, 128), V(0, 5, 0)],
];
export const FOV = 40;
export function camaraEn(f: number) {
  const fr = CAM.map((k) => k[0]);
  const p = new THREE.Vector3(...([0, 1, 2].map((i) => interpolate(f, fr, CAM.map((k) => k[1][i]), {...clamp, easing: suave})) as [number, number, number]));
  const t = new THREE.Vector3(...([0, 1, 2].map((i) => interpolate(f, fr, CAM.map((k) => k[2][i]), {...clamp, easing: suave})) as [number, number, number]));
  const temblor = interpolate(f, [H.TOCAN - 1, H.TOCAN, H.TOCAN + 14], [0, 0.25, 0], clamp);
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
const GH = {
  cabina: new THREE.SphereGeometry(1, 14, 10),
  pala: new THREE.BoxGeometry(RADIO_ROTOR, 0.05, 0.32),
  disco: new THREE.CircleGeometry(RADIO_ROTOR, 56),
  borde: new THREE.RingGeometry(RADIO_ROTOR - 0.08, RADIO_ROTOR + 0.08, 64),
  rotorCola: new THREE.TorusGeometry(0.62, 0.04, 6, 24),
};
const Helicoptero: React.FC<{e: Estado; color: string; disco?: number; colorDisco?: string; op?: number}> = ({e, color, disco = 0, colorDisco, op = 1}) => (
  <group position={e.pos.toArray()} rotation={[0, e.yaw, 0]}>
    <group rotation={[e.roll, 0, e.pitch]}>
      {/* cabina */}
      <Holo geom={GH.cabina} color={color} relleno={0.1 * op} linea={0.7 * op} angulo={12} position={[0.7, 1.55, 0]} scale={[2.1, 1.25, 1.15]} />
      {/* cola, deriva y rotor de cola */}
      <Holo geom={caja(5, 0.36, 0.36)} color={color} relleno={0.12 * op} linea={0.85 * op} position={[-3.6, 1.95, 0]} />
      <Holo geom={caja(0.9, 1.5, 0.12)} color={color} relleno={0.12 * op} linea={0.85 * op} position={[-6, 2.5, 0]} rotation={[0, 0, -0.25]} />
      <Holo geom={GH.rotorCola} color={color} relleno={0.2 * op} linea={0.6 * op} angulo={40} position={[-6.1, 2.6, 0.25]} />
      {/* patines */}
      {[-1, 1].map((s) => (
        <group key={s}>
          <Holo geom={caja(3.4, 0.09, 0.09)} color={color} relleno={0.2 * op} linea={0.9 * op} position={[0.6, 0.05, s * 0.95]} />
          <Holo geom={caja(0.08, 0.55, 0.08)} color={color} relleno={0.2 * op} linea={0.8 * op} position={[1.4, 0.35, s * 0.85]} rotation={[s * 0.2, 0, 0]} />
          <Holo geom={caja(0.08, 0.55, 0.08)} color={color} relleno={0.2 * op} linea={0.8 * op} position={[-0.2, 0.35, s * 0.85]} rotation={[s * 0.2, 0, 0]} />
        </group>
      ))}
      {/* mástil y rotor principal de 3 palas */}
      <Holo geom={caja(0.2, 0.5, 0.2)} color={color} relleno={0.2 * op} linea={0.9 * op} position={[0.5, 2.7, 0]} />
      <group position={[0.5, 2.95, 0]} rotation={[0, e.rotor, 0]}>
        {[0, 1, 2].map((k) => (
          <group key={k} rotation={[0, (k * 2 * Math.PI) / 3, 0]}>
            <Holo geom={GH.pala} color={color} relleno={0.3 * op} linea={0.95 * op} position={[(RADIO_ROTOR * e.palas) / 2, 0, 0]} scale={[e.palas, 1, 1]} />
          </group>
        ))}
      </group>
      {disco > 0 && (
        <group position={[0.5, 2.95, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <mesh geometry={GH.disco}>
            <meshBasicMaterial color={colorDisco ?? color} transparent opacity={0.12 * disco} depthWrite={false} blending={THREE.AdditiveBlending} side={THREE.DoubleSide} />
          </mesh>
          <mesh geometry={GH.borde}>
            <meshBasicMaterial color={colorDisco ?? color} transparent opacity={0.8 * disco} depthWrite={false} blending={THREE.AdditiveBlending} side={THREE.DoubleSide} />
          </mesh>
        </group>
      )}
    </group>
  </group>
);

// Montañas del valle (conos de pocas caras)
const CONO = new THREE.ConeGeometry(1, 1, 6);
const MONTES: [number, number, number, number][] = [];
for (let i = 0; i < 9; i++) {
  const x = -260 + i * 65;
  MONTES.push([x, -95 - (i % 2) * 25, 48 + (i % 3) * 8, 60 + ((i * 37) % 40)]);
  MONTES.push([x + 30, 95 + (i % 2) * 25, 44 + ((i + 1) % 3) * 9, 55 + ((i * 53) % 45)]);
}
const Montes: React.FC = () => (
  <group>
    {MONTES.map(([x, z, r, h], i) => (
      <Holo key={i} geom={CONO} color={BLANCO} relleno={0.015} linea={0.16} angulo={10} position={[x, h / 2, z]} scale={[r, h, r]} />
    ))}
  </group>
);

// Helipuerto: círculo y una H en el suelo
const ANILLO_PAD = new THREE.RingGeometry(5.6, 6, 48);
const Helipuerto: React.FC<{f: number}> = ({f}) => {
  const pulso = f < H.TOCAN ? 0.55 + 0.25 * Math.sin(f / 6) : 0.3;
  return (
    <group position={[0, 0.03, 0]}>
      <mesh geometry={ANILLO_PAD} rotation={[-Math.PI / 2, 0, 0]}>
        <meshBasicMaterial color={C.cian} transparent opacity={pulso} depthWrite={false} blending={THREE.AdditiveBlending} side={THREE.DoubleSide} />
      </mesh>
      <Holo geom={caja(0.5, 0.04, 4.2)} color={C.cian} relleno={0.5} linea={0.9} position={[-1.3, 0, 0]} />
      <Holo geom={caja(0.5, 0.04, 4.2)} color={C.cian} relleno={0.5} linea={0.9} position={[1.3, 0, 0]} />
      <Holo geom={caja(2.1, 0.04, 0.5)} color={C.cian} relleno={0.5} linea={0.9} />
    </group>
  );
};

// Excursionistas esperando junto al helipuerto
const GP = {
  cuerpo: new THREE.CapsuleGeometry(0.22, 0.95, 3, 8),
  cabeza: new THREE.SphereGeometry(0.17, 10, 8),
  mochila: new THREE.BoxGeometry(0.45, 0.7, 0.3),
};
const GENTE: [number, number, number][] = [];
for (let i = 0; i < 22; i++) GENTE.push([9 + (i % 11) * 1.25 + ((i * 7) % 5) * 0.15, 9 + Math.floor(i / 11) * 1.4 + ((i * 3) % 4) * 0.2, (i * 1.7) % 6.28]);
const Gente: React.FC<{f: number}> = ({f}) => {
  const op = interpolate(f, [H.NIEVE - 10, H.GENTE], [0.35, 1], clamp);
  return (
    <group>
      {GENTE.map(([x, z, r], i) => (
        <group key={i} position={[x, 0, z]} rotation={[0, r, 0]}>
          <Holo geom={GP.cuerpo} color={C.verde} relleno={0.22 * op} linea={0.8 * op} angulo={30} position={[0, 0.7, 0]} />
          <Holo geom={GP.cabeza} color={C.verde} relleno={0.25 * op} linea={0.8 * op} angulo={30} position={[0, 1.52, 0]} />
          {i % 3 === 0 && <Holo geom={GP.mochila} color={C.verde} relleno={0.15 * op} linea={0.6 * op} position={[0, 0.95, -0.3]} />}
        </group>
      ))}
    </group>
  );
};

// Nieve que cae (copos en posiciones fijas que bajan en bucle)
const COPO = new THREE.SphereGeometry(0.09, 5, 4);
const COPOS: [number, number, number, number][] = [];
for (let i = 0; i < 160; i++) COPOS.push([((i * 73) % 90) - 45, ((i * 131) % 70) - 35, (i * 17) % 30, 0.05 + ((i * 29) % 10) / 120]);
const Nieve: React.FC<{f: number}> = ({f}) => {
  const op = interpolate(f, [H.NIEVE - 15, H.NIEVE + 10], [0.25, 0.85], clamp);
  return (
    <group>
      {COPOS.map(([x, z, y0, v], i) => (
        <mesh key={i} geometry={COPO} position={[x + Math.sin(f / 20 + i) * 0.6, 30 - ((30 - y0 + f * v) % 30), z]}>
          <meshBasicMaterial color={BLANCO} transparent opacity={op} depthWrite={false} blending={THREE.AdditiveBlending} />
        </mesh>
      ))}
    </group>
  );
};

// Torre de Lukla: cúpula de alcance que se queda corta antes de llegar a Pheriche
const CUPULA = new THREE.SphereGeometry(1, 28, 10, 0, Math.PI * 2, 0, Math.PI / 2);
const TORRE_X = -150;
const ALCANCE = 100;
const Torre: React.FC<{f: number}> = ({f}) => {
  const op = interpolate(f, [H.TORRE, H.TORRE + 20], [0, 1], clamp) * interpolate(f, [H.MISMO, H.MISMO + 20], [1, 0.25], clamp);
  const r = ALCANCE * interpolate(f, [H.TORRE, H.TORRE_NO + 10], [0.2, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  if (op <= 0) return null;
  return (
    <group position={[TORRE_X, 0, 10]}>
      <Holo geom={caja(5, 30, 5)} color={C.ambar} relleno={0.15 * op} linea={0.9 * op} position={[0, 15, 0]} />
      <Holo geom={caja(10, 5, 10)} color={C.ambar} relleno={0.15 * op} linea={0.9 * op} position={[0, 32, 0]} />
      <Holo geom={CUPULA} color={C.ambar} relleno={0.03 * op} linea={0.28 * op} angulo={1} scale={[r, r * 0.55, r]} />
    </group>
  );
};

// Ondas de radio entre los pilotos (anillos que se abren alrededor de cada helicóptero)
const ONDA = new THREE.RingGeometry(0.92, 1, 48);
const Radio: React.FC<{f: number; centro: THREE.Vector3; color: string; desde: number; hasta: number; falla?: boolean}> = ({f, centro, color, desde, hasta, falla = false}) => {
  if (f < desde || f > hasta + 30) return null;
  const out = [];
  for (let k = 0; k < 3; k++) {
    const t = ((f - desde + k * 14) % 42) / 42;
    const fin = interpolate(f, [hasta, hasta + 30], [1, 0], clamp);
    // cuando la comunicación "falla", las ondas parpadean y se cortan
    const corte = falla ? (Math.floor(f / 5) % 3 === 0 ? 0.15 : 1) : 1;
    out.push(
      <mesh key={k} geometry={ONDA} position={[centro.x, centro.y + 2, centro.z]} rotation={[-Math.PI / 2, 0, 0]} scale={[2 + t * 11, 2 + t * 11, 1]}>
        <meshBasicMaterial color={color} transparent opacity={(1 - t) * 0.7 * fin * corte} depthWrite={false} blending={THREE.AdditiveBlending} side={THREE.DoubleSide} />
      </mesh>
    );
  }
  return <group>{out}</group>;
};

// Ruta punteada de cada helicóptero
const PUNTO = new THREE.SphereGeometry(0.5, 6, 4);
const Ruta: React.FC<{f: number; puntos: THREE.Vector3[]; color: string; desde: number}> = ({f, puntos, color, desde}) => {
  const op = interpolate(f, [desde - 10, desde + 10], [0, 1], clamp) * interpolate(f, [H.ASPAS, H.TOCAN], [1, 0.2], clamp);
  if (op <= 0) return null;
  const dibujados = Math.round(interpolate(f, [desde - 10, desde + 25], [0, puntos.length], clamp));
  return (
    <group>
      {puntos.slice(0, dibujados).map((p, i) => (
        <mesh key={i} geometry={PUNTO} position={p.toArray()}>
          <meshBasicMaterial color={color} transparent opacity={0.8 * op} depthWrite={false} blending={THREE.AdditiveBlending} />
        </mesh>
      ))}
    </group>
  );
};

// Pedazos de las palas tras el roce (pocos, sin explosión)
const PEDAZO = new THREE.TetrahedronGeometry(0.22, 0);
const Pedazos: React.FC<{f: number}> = ({f}) => {
  if (f < H.TOCAN) return null;
  const t = Math.min(f - H.TOCAN, 36);
  const out = [];
  for (let k = 0; k < 16; k++) {
    const a = (k / 16) * Math.PI * 2;
    const v = 0.18 + ((k * 7) % 5) / 30;
    const y = Math.max(0.1, ROCE.y + t * 0.2 - t * t * 0.012);
    out.push(<Holo key={k} geom={PEDAZO} color={C.ambar} relleno={0.3} linea={0.9} angulo={1} position={[ROCE.x + Math.cos(a) * v * t, y, ROCE.z + Math.sin(a) * v * t]} rotation={[k + t * 0.3, k, t * 0.2]} />);
  }
  return <group>{out}</group>;
};

// Pulso en el punto del roce
const PULSO = new THREE.RingGeometry(0.85, 1, 40);
const Roce: React.FC<{f: number}> = ({f}) => {
  const t = f - H.TOCAN;
  if (t < -4 || t > 40) return null;
  const op = interpolate(t, [-4, 0, 30], [0, 1, 0], clamp);
  return (
    <group position={ROCE.toArray()}>
      {[0, 1].map((k) => (
        <mesh key={k} geometry={PULSO} rotation={[-Math.PI / 2, 0, 0]} scale={[1 + Math.max(0, t - k * 8) * 0.35, 1 + Math.max(0, t - k * 8) * 0.35, 1]}>
          <meshBasicMaterial color={C.rojo} transparent opacity={op} depthWrite={false} blending={THREE.AdditiveBlending} side={THREE.DoubleSide} />
        </mesh>
      ))}
    </group>
  );
};

const Escena: React.FC<{f: number}> = ({f}) => {
  const aparicion = interpolate(f, [0, 20], [0, 1], clamp);
  const a = heliA(f);
  const r = heliR(f);
  const vis = interpolate(f, [H.TORRE - 10, H.TORRE + 10], [0, 1], clamp);
  // discos de las aspas: se encienden al explicar el roce
  const disco = interpolate(f, [H.MISMO + 10, H.ASPAS + 10], [0, 1], clamp) * interpolate(f, [H.TOCAN + 20, H.TOCAN + 45], [1, 0], clamp);
  const tocando = f >= H.TOCAN - 2;
  // al hablar de la víctima, la escena se apaga un poco
  const tenue = interpolate(f, [H.VICTIMA, H.VICTIMA + 20], [1, 0.55], clamp);
  return (
    <group scale={[1, aparicion, 1]}>
      <gridHelper args={[600, 150, C.cian, C.cian]} position={[0, -0.01, 0]}>
        <lineBasicMaterial attach="material" color={C.cian} transparent opacity={0.06 * tenue} />
      </gridHelper>
      <Montes />
      <Helipuerto f={f} />
      <Gente f={f} />
      <Nieve f={f} />
      {f < H.IBAN + 95 && <Helicoptero e={lanzadera(f)} color={C.cian} op={interpolate(f, [H.IBAN + 60, H.IBAN + 95], [1, 0.3], clamp)} />}
      <Torre f={f} />
      <Ruta f={f} puntos={RUTA_A} color={AZUL} desde={H.LUKLA} />
      <Ruta f={f} puntos={RUTA_R} color={NARANJA} desde={H.BASE} />
      {vis > 0 && <Helicoptero e={a} color={AZUL} disco={disco} colorDisco={tocando ? C.rojo : AZUL} op={vis * tenue} />}
      {vis > 0 && <Helicoptero e={r} color={NARANJA} disco={disco} colorDisco={tocando ? C.rojo : NARANJA} op={vis * tenue} />}
      <Radio f={f} centro={a.pos} color={AZUL} desde={H.RADIO - 10} hasta={H.DOS + 40} />
      <Radio f={f} centro={r.pos} color={NARANJA} desde={H.RADIO - 4} hasta={H.DOS + 40} />
      <Radio f={f} centro={a.pos} color={AZUL} desde={H.COMUNICACION - 6} hasta={H.TOCAN - 6} falla />
      <Radio f={f} centro={r.pos} color={NARANJA} desde={H.COMUNICACION} hasta={H.TOCAN - 6} falla />
      <Roce f={f} />
      <Pedazos f={f} />
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

// Altímetro: sube hasta 4,200 m al presentar Pheriche
const Altura: React.FC<{f: number}> = ({f}) => {
  const op = interpolate(f, [H.PHERICHE + 10, H.PHERICHE + 25, H.NIEVE + 20, H.NIEVE + 35], [0, 1, 1, 0], clamp);
  if (op <= 0) return null;
  const m = Math.round(interpolate(f, [H.PHERICHE + 15, H.ALTURA + 15], [0, 4200], {...clamp, easing: Easing.out(Easing.cubic)}) / 10) * 10;
  return (
    <div style={{position: 'absolute', top: 300, left: 60, right: 60, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '22px 30px', background: 'rgba(4,14,24,0.8)', border: `2px solid ${C.cian}`, borderRadius: 24, boxShadow: `0 0 30px ${C.cian}44`, opacity: op}}>
      <div style={{fontFamily: MONO, fontWeight: 700, fontSize: 30, letterSpacing: 2, color: C.cian}}>PHERICHE · NEPAL</div>
      <div style={{fontFamily: MONO, fontWeight: 700, fontSize: 44, color: C.blanco}}>{m.toLocaleString('en-US')} m</div>
    </div>
  );
};

// Densidad del aire: nivel del mar contra Pheriche (atmósfera estándar: ~65 %)
const Aire: React.FC<{f: number}> = ({f}) => {
  const op = interpolate(f, [H.AIRE + 5, H.AIRE + 20, H.VICTIMA - 10, H.VICTIMA + 4], [0, 1, 1, 0], clamp);
  if (op <= 0) return null;
  const mar = interpolate(f, [H.AIRE + 15, H.AIRE + 35], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  const alto = interpolate(f, [H.DELGADO - 10, H.DELGADO + 20], [0, 0.65], {...clamp, easing: Easing.out(Easing.cubic)});
  const fila = (t: string, w: number, valor: string, color: string) => (
    <div style={{marginTop: 18}}>
      <div style={{display: 'flex', justifyContent: 'space-between', fontFamily: MONO, fontWeight: 700, fontSize: 30, color: C.blanco}}>
        <span>{t}</span>
        <span style={{color}}>{valor}</span>
      </div>
      <div style={{height: 22, marginTop: 8, borderRadius: 11, background: 'rgba(255,255,255,0.1)', overflow: 'hidden'}}>
        <div style={{width: `${Math.max(2, w * 100)}%`, height: '100%', background: color, boxShadow: `0 0 16px ${color}`}} />
      </div>
    </div>
  );
  return (
    <div style={{position: 'absolute', top: 300, left: 60, right: 60, padding: '26px 30px', background: 'rgba(4,14,24,0.8)', border: `2px solid ${C.ambar}`, borderRadius: 24, boxShadow: `0 0 30px ${C.ambar}44`, opacity: op}}>
      <div style={{fontFamily: MONO, fontWeight: 700, fontSize: 26, letterSpacing: 2, color: C.ambar}}>AIRE PARA LAS ASPAS</div>
      {fila('Nivel del mar', mar, '100 %', C.verde)}
      {fila('Pheriche · 4,200 m', alto, '~65 %', C.ambar)}
    </div>
  );
};

export const Holograma: React.FC = () => {
  const f = useCurrentFrame();
  const entrada = interpolate(f, [0, 12], [0, 1], clamp);
  const salida = interpolate(f, [H.DUR - 25, H.DUR - 5], [1, 0], clamp);
  const barrido = interpolate(f, [0, 22], [-100, 2000], clamp);
  const a = heliA(f);
  const r = heliR(f);
  return (
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, #0b2234 0%, #040b14 60%, #01040a 100%)', opacity: Math.min(entrada, salida)}}>
      <ThreeCanvas width={1080} height={1920} camera={{fov: FOV, near: 0.1, far: 3000, position: [0, 10, 20]}}>
        <Camara f={f} />
        <Escena f={f} />
      </ThreeCanvas>

      <Etiqueta3D f={f} punto={new THREE.Vector3(0, 0.2, 0)} desde={H.PHERICHE + 25} hasta={H.NIEVE + 10} texto="Helipuerto" dx={-60} dy={170} />
      <Etiqueta3D f={f} punto={new THREE.Vector3(15, 1.8, 10)} desde={H.GENTE - 5} hasta={H.IBAN + 10} color={C.verde} texto="Excursionistas atrapados" dx={-40} dy={-230} />
      <Etiqueta3D f={f} punto={lanzadera(f).pos.clone().add(new THREE.Vector3(0, 3, 0))} desde={H.IBAN} hasta={H.TORRE - 5} texto="Ida y vuelta" dx={60} dy={-160} />
      <Etiqueta3D f={f} punto={new THREE.Vector3(TORRE_X, 34, 10)} desde={H.TORRE + 15} hasta={H.DOS + 15} color={C.ambar} texto="Torre de Lukla" dx={40} dy={-180} />
      <Etiqueta3D f={f} punto={new THREE.Vector3(0, 0.2, 0)} desde={H.TORRE_NO} hasta={H.DOS + 15} color={C.rojo} texto="Aquí no llega" dx={-40} dy={200} />
      <Etiqueta3D f={f} punto={a.pos.clone().add(new THREE.Vector3(0, 3, 0))} desde={H.LUKLA - 5} hasta={H.MISMO + 15} color={AZUL} texto="Desde Lukla" dx={40} dy={180} />
      <Etiqueta3D f={f} punto={r.pos.clone().add(new THREE.Vector3(0, 3, 0))} desde={H.BASE - 5} hasta={H.MISMO + 15} color={NARANJA} texto="Desde el campamento base" dx={-40} dy={-200} />
      <Etiqueta3D f={f} punto={new THREE.Vector3(0, 0.2, 0)} desde={H.MISMO + 20} hasta={H.ASPAS + 15} texto="Mismo punto" dx={60} dy={220} />
      <Etiqueta3D f={f} punto={a.pos.clone().add(new THREE.Vector3(-RADIO_ROTOR + 0.5, 2.95, 0))} desde={H.ASPAS + 15} hasta={H.TOCAN - 10} color={AZUL} texto="Aspas: 10.7 m" dx={-30} dy={220} />
      <Etiqueta3D f={f} punto={ROCE} desde={H.TOCAN - 4} hasta={H.AIRE + 5} color={C.rojo} texto="Se tocan" dx={50} dy={-220} />

      <Altura f={f} />
      <Aire f={f} />
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
