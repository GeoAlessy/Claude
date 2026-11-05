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
// Holograma del video 08: lluvia sobre suelo empapado (esponja llena), el río que crece,
// la casa de madera llena de aire que flota, la casa amarrada que se queda, el choque con el puente.
// Ejes (metros): el río corre hacia +x, cauce entre z = −15 y z = 15, orillas a 2 m de altura.
// =====================================================================
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const suave = Easing.inOut(Easing.cubic);
const BLANCO = '#E0F2FE';
const AGUA = '#38BDF8';
const MADERA = '#FCA5A5'; // la casa roja del video
const TECHO = C.verde;
const ORILLA = 2;
const PUENTE_X = 25;
const SUELO = new THREE.Vector3(-30, ORILLA, -24); // bloque de suelo (la esponja)

// ---------- Estado ----------
const nivel = (f: number) => interpolate(f, [H.CRECIO, H.ALTO + 25, H.APLASTA + 60, H.DUR], [0.7, 3.1, 3.1, 2.9], {...clamp, easing: suave});
const lluvia = (f: number) => interpolate(f, [H.LLUVIA, H.LLUVIA + 20, H.CRECIO + 40, H.AIRE + 20], [0, 1, 1, 0.15], clamp);

type Casa = {p: THREE.Vector3; rotY: number; rotZ: number; aplasta: number};
function casa(f: number): Casa {
  const flota = interpolate(f, [H.FLOTO - 15, H.FLOTO + 15], [0, 1], {...clamp, easing: suave});
  const y = ORILLA + flota * (nivel(f) - ORILLA - 0.6);
  // a la deriva: de la orilla al centro del río y río abajo hasta el puente
  const deriva = interpolate(f, [H.FLOTO + 15, H.CHOCAR], [0, 1], {...clamp, easing: Easing.in(Easing.quad)});
  const x = interpolate(deriva, [0, 1], [-25, PUENTE_X - 4.6]);
  const z = interpolate(deriva, [0, 0.5, 1], [22, 9, 4]);
  const giro = interpolate(deriva, [0, 1], [0, 0.5]) + Math.sin(f / 25) * 0.04 * flota;
  const aplasta = interpolate(f, [H.APLASTA - 10, H.APLASTA + 30], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  const choque = interpolate(f, [H.CHOCAR, H.CHOCAR + 12], [0, 1], clamp);
  return {p: new THREE.Vector3(x, Math.max(ORILLA, y) - 0.3 * aplasta, z), rotY: giro, rotZ: -0.18 * choque - 0.25 * aplasta, aplasta};
}

// ---------- Cámara ----------
type ClaveCam = [number, [number, number, number], [number, number, number]];
const V = (x: number, y: number, z: number): [number, number, number] => [x, y, z];
const CAM: ClaveCam[] = [
  [0, V(-20, 30, 70), V(0, 2, 0)],
  [H.LLUVIA + 30, V(-40, 25, 62), V(-20, 4, 10)],
  [H.TORMENTAS + 20, V(-50, 32, 72), V(-22, 9, 0)],
  [H.EMPAPADO + 10, V(-37, 7, -9), V(-30, 2, -24)],
  [H.LLENA + 20, V(-34.5, 5.5, -14), V(-30, 1.6, -24)],
  [H.CORRE + 20, V(-40, 10, 0), V(-28, 2, -18)],
  [H.CRECIO + 20, V(-52, 18, 40), V(-20, 2, 5)],
  [H.ALTO + 20, V(-46, 14, 46), V(-22, 3, 15)],
  [H.AIRE + 20, V(-41, 9, 41), V(-25, 3.5, 22)],
  [H.RODEA, V(-39, 8, 40), V(-25, 3.5, 22)],
  [H.FLOTO + 10, V(-40, 10, 43), V(-24, 4, 20)],
  [H.ANCLADA + 20, V(-31, 12, 46), V(-17, 3, 20)],
  [H.LLEVA, V(-20, 16, 42), V(-4, 3, 10)],
  [H.CHOCAR - 10, V(0, 14, 34), V(18, 3, 4)],
  [H.ACUMULA + 10, V(2, 10, 27), V(18, 3, 4)],
  [H.APLASTA + 20, V(5, 9, 25), V(20, 3, 4)],
  [H.CONSEJO + 20, V(-10, 30, 62), V(10, 2, 0)],
  [H.DUR, V(-40, 45, 82), V(0, 2, 0)],
];
export const FOV = 40;
export function camaraEn(f: number) {
  const fr = CAM.map((k) => k[0]);
  const p = new THREE.Vector3(...([0, 1, 2].map((i) => interpolate(f, fr, CAM.map((k) => k[1][i]), {...clamp, easing: suave})) as [number, number, number]));
  const t = new THREE.Vector3(...([0, 1, 2].map((i) => interpolate(f, fr, CAM.map((k) => k[2][i]), {...clamp, easing: suave})) as [number, number, number]));
  const temblor = interpolate(f, [H.CHOCAR - 1, H.CHOCAR, H.CHOCAR + 14], [0, 0.35, 0], clamp);
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
// Techo a dos aguas (prisma triangular)
const TECHO_G = (() => {
  const s = new THREE.Shape();
  s.moveTo(-3.4, 0);
  s.lineTo(3.4, 0);
  s.lineTo(0, 1.8);
  s.closePath();
  const g = new THREE.ExtrudeGeometry(s, {depth: 8.6, bevelEnabled: false});
  g.translate(0, 0, -4.3);
  g.rotateY(Math.PI / 2);
  return g;
})();

const CasaHolo: React.FC<{c: Casa; aire?: number; op?: number}> = ({c, aire = 0, op = 1}) => {
  const sx = 1 - 0.45 * c.aplasta;
  return (
    <group position={c.p.toArray()} rotation={[0, c.rotY, c.rotZ]}>
      <group scale={[sx, 1 - 0.2 * c.aplasta, 1]}>
        <Holo geom={caja(8, 3, 6)} color={MADERA} relleno={0.1 * op} linea={0.85 * op} position={[0, 1.5, 0]} />
        {/* ventanas y puerta */}
        {[-2.6, -1.2, 1.2, 2.6].map((x) => (
          <Holo key={x} geom={caja(0.9, 1.1, 0.05)} color={BLANCO} relleno={0.15 * op} linea={0.6 * op} position={[x, 1.8, 3.03]} />
        ))}
        <Holo geom={caja(0.9, 2, 0.05)} color={BLANCO} relleno={0.1 * op} linea={0.6 * op} position={[0, 1, 3.03]} />
        <group position={[0, 3, 0]} rotation={[c.aplasta * 0.3, 0, c.aplasta * 0.25]}>
          <Holo geom={TECHO_G} color={TECHO} relleno={0.12 * op} linea={0.85 * op} />
        </group>
        {/* el aire de adentro */}
        {aire > 0 && (
          <mesh position={[0, 1.5, 0]}>
            <boxGeometry args={[7.6, 2.7, 5.6]} />
            <meshBasicMaterial color={C.cian} transparent opacity={0.22 * aire} depthWrite={false} blending={THREE.AdditiveBlending} />
          </mesh>
        )}
      </group>
    </group>
  );
};

// La otra casa, amarrada a sus cimientos (se queda)
const CasaAmarrada: React.FC<{f: number}> = ({f}) => {
  const op = interpolate(f, [H.ANCLADA - 20, H.ANCLADA], [0.3, 1], clamp);
  const amarre = interpolate(f, [H.AMARRAN - 10, H.AMARRAN + 10], [0, 1], clamp);
  return (
    <group>
      <Holo geom={caja(8.4, 0.4, 6.4)} color={BLANCO} relleno={0.15} linea={0.6} position={[-8, ORILLA + 0.2, 26]} />
      <CasaHolo c={{p: new THREE.Vector3(-8, ORILLA + 0.4, 26), rotY: 0, rotZ: 0, aplasta: 0}} op={op} />
      {amarre > 0 &&
        [-3.6, 3.6].map((x) =>
          [-2.6, 2.6].map((z) => (
            <Holo key={`${x}${z}`} geom={caja(0.15, 3.6, 0.15)} color={C.verde} relleno={0.6 * amarre} linea={amarre} position={[-8 + x, ORILLA + 1.6, 26 + z]} />
          ))
        )}
    </group>
  );
};

// Cimiento de nuestra casa (se queda en la orilla cuando la casa se va)
const Cimiento: React.FC = () => <Holo geom={caja(8.4, 0.3, 6.4)} color={BLANCO} relleno={0.1} linea={0.5} position={[-25, ORILLA + 0.15, 22]} />;

// Puente peatonal de armadura
const Puente: React.FC = () => {
  const out = [];
  for (const sx of [-1.4, 1.4]) {
    out.push(<Holo key={'v' + sx} geom={caja(0.2, 0.2, 40)} color={BLANCO} relleno={0.2} linea={0.8} position={[PUENTE_X + sx, 4.2, 0]} />);
    out.push(<Holo key={'s' + sx} geom={caja(0.2, 0.2, 40)} color={BLANCO} relleno={0.2} linea={0.8} position={[PUENTE_X + sx, 6.2, 0]} />);
    for (let z = -19; z <= 19; z += 3.8) {
      out.push(<Holo key={`p${sx}${z}`} geom={caja(0.14, 2, 0.14)} color={BLANCO} relleno={0.2} linea={0.7} position={[PUENTE_X + sx, 5.2, z]} />);
      out.push(<Holo key={`d${sx}${z}`} geom={caja(0.1, 2.6, 0.1)} color={BLANCO} relleno={0.15} linea={0.5} position={[PUENTE_X + sx, 5.2, z + 1.9]} rotation={[0.85, 0, 0]} />);
    }
  }
  out.push(<Holo key="tablero" geom={caja(3, 0.15, 40)} color={BLANCO} relleno={0.12} linea={0.6} position={[PUENTE_X, 4.1, 0]} />);
  return <group>{out}</group>;
};

// Orillas y árboles
const PINO = new THREE.ConeGeometry(1.2, 5, 6);
const Orillas: React.FC = () => (
  <group>
    {[-1, 1].map((s) => (
      <Holo key={s} geom={caja(240, ORILLA, 60)} color={'#94A3B8'} relleno={0.04} linea={0.3} position={[0, ORILLA / 2, s * 45]} />
    ))}
    {Array.from({length: 16}, (_, k) => (
      <Holo key={'a' + k} geom={PINO} color={C.verde} relleno={0.06} linea={0.35} angulo={10} position={[-80 + k * 11 + ((k * 7) % 5), ORILLA + 2.5, k % 2 ? 40 + (k % 3) * 4 : -38 - (k % 3) * 4]} />
    ))}
  </group>
);

// Agua: cauce + desborde sobre las orillas, con líneas de corriente
const Agua: React.FC<{f: number}> = ({f}) => {
  const n = nivel(f);
  const out = [];
  const cauce = Math.min(n, ORILLA);
  out.push(
    <mesh key="cauce" position={[0, cauce / 2, 0]}>
      <boxGeometry args={[240, cauce, 30]} />
      <meshBasicMaterial color={AGUA} transparent opacity={0.16} depthWrite={false} blending={THREE.AdditiveBlending} />
    </mesh>
  );
  if (n > ORILLA) {
    out.push(
      <mesh key="desborde" position={[0, ORILLA + (n - ORILLA) / 2, 0]}>
        <boxGeometry args={[240, n - ORILLA, 90]} />
        <meshBasicMaterial color={AGUA} transparent opacity={0.13} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
    );
  }
  // agua que se acumula detrás de la casa contra el puente
  const acum = interpolate(f, [H.ACUMULA - 10, H.ACUMULA + 25], [0, 1], clamp) * interpolate(f, [H.APLASTA + 40, H.APLASTA + 90], [1, 0.4], clamp);
  if (acum > 0) {
    out.push(
      <mesh key="acum" position={[PUENTE_X - 12, n + 0.6 * acum, 4]}>
        <boxGeometry args={[14, 1.2 * acum, 12]} />
        <meshBasicMaterial color={AGUA} transparent opacity={0.3 * acum} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
    );
  }
  // líneas de corriente sobre la superficie
  const ancho = n > ORILLA ? 40 : 14;
  for (let k = 0; k < 60; k++) {
    const x = ((k * 37 + f * (0.5 + (k % 4) * 0.12)) % 200) - 100;
    const z = (((k * 53) % 100) / 100 - 0.5) * 2 * ancho;
    out.push(<Holo key={'l' + k} geom={caja(3, 0.03, 0.12)} color={BLANCO} relleno={0.5} linea={0.5} position={[x, n + 0.03, z]} />);
  }
  return <group>{out}</group>;
};

// Lluvia y nubes
const GOTA = new THREE.BoxGeometry(0.06, 1.2, 0.06);
const NUBE = new THREE.SphereGeometry(1, 12, 8);
const Lluvia: React.FC<{f: number}> = ({f}) => {
  const n = lluvia(f);
  if (n <= 0) return null;
  const out = [];
  for (let k = 0; k < 220; k++) {
    if (k / 220 > n) continue;
    const x = ((k * 71) % 140) - 90;
    const z = ((k * 43) % 100) - 50;
    const y = 30 - ((f * 1.1 + k * 3.7) % 30);
    out.push(
      <mesh key={k} geometry={GOTA} position={[x, y + ORILLA, z]}>
        <meshBasicMaterial color={AGUA} transparent opacity={0.5 * n} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
    );
  }
  for (let k = 0; k < 9; k++) {
    out.push(
      <mesh key={'n' + k} geometry={NUBE} position={[-80 + k * 18, 36 + (k % 3) * 2, -10 + ((k * 13) % 30)]} scale={[14, 4, 10]}>
        <meshBasicMaterial color={'#94A3B8'} transparent opacity={0.12 * n} depthWrite={false} />
      </mesh>
    );
  }
  return <group>{out}</group>;
};

// La esponja: bloque de suelo con poros que se llenan; luego la lluvia escurre por encima
const PORO = new THREE.SphereGeometry(0.16, 8, 6);
const POROS: [number, number, number][] = [];
for (let i = 0; i < 70; i++) POROS.push([((i * 37) % 100) / 100 * 3.4 - 1.7, -((i * 53) % 100) / 100 * 2.6 - 0.2, ((i * 71) % 100) / 100 * 3.4 - 1.7]);
const Esponja: React.FC<{f: number}> = ({f}) => {
  const op = interpolate(f, [H.TORMENTAS, H.EMPAPADO - 10, H.CRECIO + 10, H.CRECIO + 40], [0, 1, 1, 0.3], clamp);
  if (op <= 0) return null;
  const lleno = interpolate(f, [H.EMPAPADO - 20, H.LLENA + 10], [0.2, 1], clamp);
  const corre = f >= H.CORRE - 10;
  const out = [];
  for (let k = 0; k < 18; k++) {
    if (!corre) continue;
    const t = ((f - H.CORRE + 10 + k * 5) % 60) / 60;
    out.push(
      <mesh key={'c' + k} geometry={PORO} position={[SUELO.x + ((k * 29) % 100) / 100 * 3 - 1.5, SUELO.y + 0.15, SUELO.z - 1.8 + t * 9]} scale={0.8}>
        <meshBasicMaterial color={AGUA} transparent opacity={op * (1 - t)} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
    );
  }
  return (
    <group>
      <Holo geom={caja(4, 3, 4)} color={C.ambar} relleno={0.06 * op} linea={0.8 * op} position={[SUELO.x, SUELO.y - 1.5, SUELO.z]} />
      {POROS.map(([x, y, z], i) => (
        <mesh key={i} geometry={PORO} position={[SUELO.x + x, SUELO.y + y, SUELO.z + z]}>
          <meshBasicMaterial color={i / POROS.length < lleno ? AGUA : '#78350F'} transparent opacity={0.8 * op} depthWrite={false} blending={THREE.AdditiveBlending} />
        </mesh>
      ))}
      {out}
    </group>
  );
};

// Flechas de empuje del agua (chevrones hacia arriba bajo la casa)
const FLECHA = new THREE.ConeGeometry(0.45, 0.9, 4);
const Empuje: React.FC<{f: number; c: Casa}> = ({f, c}) => {
  const op = interpolate(f, [H.RODEA - 10, H.RODEA + 10, H.FLOTO + 30, H.FLOTO + 50], [0, 1, 1, 0], clamp);
  if (op <= 0) return null;
  const out = [];
  for (let k = 0; k < 9; k++) {
    const x = (k % 3) * 3 - 3;
    const z = Math.floor(k / 3) * 2.2 - 2.2;
    const sube = ((f + k * 6) % 30) / 30;
    out.push(
      <mesh key={k} geometry={FLECHA} position={[c.p.x + x, c.p.y - 0.8 + sube * 1.2, c.p.z + z]}>
        <meshBasicMaterial color={C.cian} transparent opacity={op * (1 - sube)} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
    );
  }
  return <group>{out}</group>;
};

// Pedazos que siguen río abajo después de que se rompe
const PEDAZO = new THREE.BoxGeometry(1.2, 0.15, 0.6);
const Pedazos: React.FC<{f: number}> = ({f}) => {
  if (f < H.APLASTA) return null;
  const t = f - H.APLASTA;
  const n = nivel(f);
  const out = [];
  for (let k = 0; k < 16; k++) {
    const x = PUENTE_X + 1 + t * (0.15 + (k % 4) * 0.05);
    const z = 4 + ((k * 37) % 100) / 100 * 10 - 5;
    out.push(<Holo key={k} geom={PEDAZO} color={k % 3 ? MADERA : TECHO} relleno={0.25} linea={0.8} position={[x, n + 0.05, z]} rotation={[0, k + t * 0.02, 0]} />);
  }
  return <group>{out}</group>;
};

const Escena: React.FC<{f: number}> = ({f}) => {
  const aparicion = interpolate(f, [0, 20], [0, 1], clamp);
  const c = casa(f);
  const aire = interpolate(f, [H.AIRE + 10, H.AIRE + 30, H.FLOTA + 20, H.FLOTA + 50], [0, 1, 1, 0], clamp);
  return (
    <group scale={[1, aparicion, 1]}>
      <gridHelper args={[300, 150, C.cian, C.cian]} position={[0, -0.01, 0]}>
        <lineBasicMaterial attach="material" color={C.cian} transparent opacity={0.05} />
      </gridHelper>
      <Orillas />
      <Agua f={f} />
      <Lluvia f={f} />
      <Esponja f={f} />
      <Cimiento />
      <CasaHolo c={c} aire={aire} />
      <CasaAmarrada f={f} />
      <Empuje f={f} c={c} />
      <Puente />
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

// Nivel del río
const Nivel: React.FC<{f: number}> = ({f}) => {
  const op = interpolate(f, [H.CRECIO + 5, H.CRECIO + 20, H.AIRE - 5, H.AIRE + 10], [0, 1, 1, 0], clamp);
  if (op <= 0) return null;
  const w = interpolate(f, [H.CRECIO + 10, H.ALTO + 20], [0.25, 0.92], {...clamp, easing: Easing.out(Easing.cubic)});
  return (
    <Panel op={op} color={AGUA}>
      <div style={{fontFamily: MONO, fontWeight: 700, fontSize: 26, letterSpacing: 2, color: AGUA}}>NIVEL DEL RÍO SAN JUAN</div>
      {fila('Pagosa Springs', w, w > 0.85 ? 'récord desde 1911' : 'subiendo…', w > 0.85 ? C.rojo : AGUA)}
    </Panel>
  );
};

// Peso contra empuje
const Balanza: React.FC<{f: number}> = ({f}) => {
  const op = interpolate(f, [H.FLOTA + 5, H.FLOTA + 20, H.ANCLADA - 5, H.ANCLADA + 10], [0, 1, 1, 0], clamp);
  if (op <= 0) return null;
  const empuje = interpolate(f, [H.PESA - 10, H.FLOTO + 5], [0.2, 0.85], {...clamp, easing: Easing.out(Easing.cubic)});
  const gana = empuje > 0.62;
  return (
    <Panel op={op} color={gana ? C.verde : C.cian}>
      <div style={{fontFamily: MONO, fontWeight: 700, fontSize: 26, letterSpacing: 2, color: gana ? C.verde : C.cian}}>{gana ? '¡FLOTA!' : 'PESO CONTRA EMPUJE'}</div>
      {fila('Peso de la casa', 0.6, '↓', MADERA)}
      {fila('Empuje del agua', empuje, '↑', AGUA)}
    </Panel>
  );
};

// Consejo: cuánta agua es peligrosa
const Consejo: React.FC<{f: number}> = ({f}) => {
  const op = interpolate(f, [H.CONSEJO + 5, H.CONSEJO + 20, H.FIN, H.FIN + 15], [0, 1, 1, 0], clamp);
  if (op <= 0) return null;
  const item = (desde: number, alto: number, texto: React.ReactNode, icono: React.ReactNode) => (
    <div style={{display: 'flex', alignItems: 'flex-end', gap: 24, marginTop: 18, opacity: interpolate(f, [desde - 8, desde + 4], [0, 1], clamp)}}>
      <svg width={150} height={130} viewBox="0 0 150 130">
        {icono}
        <rect x={0} y={130 - alto} width={150} height={alto} fill={AGUA} opacity={0.45} />
        <line x1={0} y1={130 - alto} x2={150} y2={130 - alto} stroke={AGUA} strokeWidth={3} />
      </svg>
      <div style={{fontFamily: TITULAR, fontWeight: 900, fontSize: 44, color: C.blanco, lineHeight: 1.1}}>{texto}</div>
    </div>
  );
  return (
    <Panel op={op} color={C.rojo}>
      <div style={{fontFamily: MONO, fontWeight: 700, fontSize: 26, letterSpacing: 2, color: C.rojo}}>NUNCA CRUCES EL AGUA</div>
      {item(
        H.QUINCE,
        22,
        <>
          15 cm<br />
          <span style={{color: C.ambar}}>te tumban</span>
        </>,
        <g fill="none" stroke={C.blanco} strokeWidth={6} strokeLinecap="round">
          <circle cx={75} cy={18} r={12} />
          <line x1={75} y1={30} x2={75} y2={82} />
          <line x1={75} y1={48} x2={50} y2={66} />
          <line x1={75} y1={48} x2={100} y2={66} />
          <line x1={75} y1={82} x2={58} y2={124} />
          <line x1={75} y1={82} x2={92} y2={124} />
        </g>
      )}
      {item(
        H.SESENTA,
        80,
        <>
          60 cm<br />
          <span style={{color: C.ambar}}>se llevan un auto</span>
        </>,
        <g fill="none" stroke={C.blanco} strokeWidth={6} strokeLinejoin="round">
          <path d="M10,100 L20,70 L45,52 L105,52 L130,72 L140,100 Z" />
          <circle cx={42} cy={104} r={13} />
          <circle cx={110} cy={104} r={13} />
        </g>
      )}
    </Panel>
  );
};

export const Holograma: React.FC = () => {
  const f = useCurrentFrame();
  const entrada = interpolate(f, [0, 12], [0, 1], clamp);
  const salida = interpolate(f, [H.DUR - 25, H.DUR - 5], [1, 0], clamp);
  const barrido = interpolate(f, [0, 22], [-100, 2000], clamp);
  const c = casa(f);
  return (
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, #0b2234 0%, #040b14 60%, #01040a 100%)', opacity: Math.min(entrada, salida)}}>
      <ThreeCanvas width={1080} height={1920} camera={{fov: FOV, near: 0.1, far: 2000, position: [0, 10, 20]}}>
        <Camara f={f} />
        <Escena f={f} />
      </ThreeCanvas>

      <Etiqueta3D f={f} punto={new THREE.Vector3(-25, 5, 22)} desde={H.LLUVIA + 20} hasta={H.EMPAPADO - 5} texto="Pagosa Springs, Colorado" dx={-30} dy={-260} />
      <Etiqueta3D f={f} punto={new THREE.Vector3(SUELO.x, SUELO.y - 1.2, SUELO.z + 2)} desde={H.EMPAPADO} hasta={H.CORRE + 5} color={C.ambar} texto="Suelo empapado" dx={-40} dy={240} />
      <Etiqueta3D f={f} punto={new THREE.Vector3(SUELO.x, SUELO.y + 0.3, SUELO.z + 3)} desde={H.CORRE} hasta={H.CRECIO + 10} color={AGUA} texto="Todo corre al río" dx={40} dy={-220} />
      <Etiqueta3D f={f} punto={new THREE.Vector3(c.p.x, c.p.y + 1.5, c.p.z)} desde={H.AIRE + 20} hasta={H.RODEA + 10} color={C.cian} texto="Llena de aire" dx={50} dy={-240} />
      <Etiqueta3D f={f} punto={new THREE.Vector3(c.p.x, c.p.y - 0.5, c.p.z + 3)} desde={H.ARRIBA - 5} hasta={H.FLOTA + 10} color={C.cian} texto="El agua empuja ↑" dx={-40} dy={240} />
      <Etiqueta3D f={f} punto={new THREE.Vector3(-8, ORILLA + 2, 29)} desde={H.AMARRAN} hasta={H.LLEVA + 10} color={C.verde} texto="Amarrada: se queda" dx={40} dy={-240} />
      <Etiqueta3D f={f} punto={new THREE.Vector3(c.p.x, c.p.y + 3.5, c.p.z)} desde={H.LLEVA - 15} hasta={H.CHOCAR} color={C.rojo} texto="Sin amarre: se va" dx={-40} dy={-240} />
      <Etiqueta3D f={f} punto={new THREE.Vector3(PUENTE_X, 6.2, 8)} desde={H.CHOCAR} hasta={H.ACUMULA + 10} color={BLANCO} texto="Puente" dx={40} dy={-220} />
      <Etiqueta3D f={f} punto={new THREE.Vector3(PUENTE_X - 12, nivel(f) + 1, 4)} desde={H.ACUMULA} hasta={H.CONSEJO} color={AGUA} texto="El agua se acumula" dx={-40} dy={240} />

      <Nivel f={f} />
      <Balanza f={f} />
      <Consejo f={f} />
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
