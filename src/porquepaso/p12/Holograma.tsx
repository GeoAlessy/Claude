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
// Holograma del video 12: rayo provocado con cohete.
// La base de la nube se carga negativa y el suelo positivo; el aire es un muro.
// El cohete sube un cable de cobre conectado al suelo: la punta lleva "el suelo" casi hasta la nube,
// la electricidad se concentra, salta una chispa hacia arriba, la descarga recorre el cable,
// el cable se vaporiza y los siguientes rayos bajan por el mismo canal de aire caliente.
// Ejes: suelo en y = 0, base de la nube en y = BASE. El cohete sube por x = 0.
// =====================================================================
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const suave = Easing.inOut(Easing.cubic);
const BLANCO = '#E0F2FE';
const COBRE = '#F59E0B';
const RAYO = '#E9D5FF';
const NUBE = '#94A3B8';
const BASE = 56;
const ALTURA_MAX = 24; // a dónde llega el cohete

// ---------- Estado ----------
const altura = (f: number) => interpolate(f, [H.CABLE + 10, H.CASI + 10], [1, ALTURA_MAX], {...clamp, easing: Easing.out(Easing.quad)});
// La chispa sube desde la punta hasta la nube
const lider = (f: number) => interpolate(f, [H.CHISPA - 4, H.CONECTA], [0, 1], {...clamp, easing: Easing.in(Easing.quad)});
const descarga = (f: number) => (f >= H.CONECTA ? Math.max(0, 1 - (f - H.CONECTA) / 18) : 0);
// Destellos de los siguientes rayos por el mismo canal
const destellos = (f: number) => {
  let v = descarga(f);
  for (const d of [H.SIGUIENTES, H.SIGUIENTES + 14, H.SIGUIENTES + 30]) if (f >= d) v = Math.max(v, Math.max(0, 1 - (f - d) / 10));
  return v;
};
const vapor = (f: number) => interpolate(f, [H.CONECTA, H.CONECTA + 6, H.NARANJA + 20, H.CANAL + 10], [0, 1, 1, 0], clamp);
const viento = (f: number) => interpolate(f, [H.CONECTA, H.CONSEJO], [0, 2.2], clamp); // el canal se corre un poco

// Camino en zigzag de la descarga (fijo, determinista)
const ZIG: THREE.Vector3[] = (() => {
  const pts: THREE.Vector3[] = [];
  let x = 0;
  for (let k = 0; k <= 24; k++) {
    const y = ALTURA_MAX + (k / 24) * (BASE - ALTURA_MAX);
    const azar = (n: number) => ((Math.sin(n * 127.1) * 43758.5453) % 1 + 1) % 1 - 0.5;
    x += k === 0 ? 0 : azar(k) * 3.2 - 0.12;
    pts.push(new THREE.Vector3(x, y, azar(k + 50) * 1.6));
  }
  return pts;
})();
// Rama de la nube (como la del video)
const RAMA: THREE.Vector3[] = (() => {
  const pts: THREE.Vector3[] = [];
  for (let k = 0; k <= 16; k++) pts.push(new THREE.Vector3(-3 - k * 1.3, BASE - 1 + Math.sin(k * 1.4) * 1.5, Math.cos(k * 2.2) * 1.2));
  return pts;
})();

// ---------- Cámara ----------
type ClaveCam = [number, [number, number, number], [number, number, number]];
const V = (x: number, y: number, z: number): [number, number, number] => [x, y, z];
const CAM: ClaveCam[] = [
  [0, V(38, 30, 58), V(0, 30, 0)],
  [H.POSITIVO + 10, V(34, 28, 56), V(0, 28, 0)],
  [H.TENSION, V(32, 28, 54), V(0, 28, 0)],
  [H.COBRE + 10, V(10, 6, 22), V(0, 3, 0)],
  [H.SUELO + 10, V(14, 10, 26), V(0, 7, 0)],
  [H.METROS + 20, V(26, 22, 44), V(0, 18, 0)],
  [H.CONCENTRA, V(12, 26, 22), V(0, 24, 0)],
  [H.CHISPA + 10, V(26, 34, 46), V(0, 34, 0)],
  [H.RECORRE, V(40, 32, 66), V(0, 30, 0)],
  [H.NARANJA, V(18, 16, 30), V(0, 14, 0)],
  [H.SIGUIENTES, V(40, 32, 68), V(0, 30, 0)],
  [H.CONSEJO + 30, V(30, 26, 62), V(-4, 24, 4)],
  [H.DUR, V(-50, 34, 56), V(-2, 26, 4)],
];
export const FOV = 40;
export function camaraEn(f: number) {
  const fr = CAM.map((k) => k[0]);
  const p = new THREE.Vector3(...([0, 1, 2].map((i) => interpolate(f, fr, CAM.map((k) => k[1][i]), {...clamp, easing: suave})) as [number, number, number]));
  const t = new THREE.Vector3(...([0, 1, 2].map((i) => interpolate(f, fr, CAM.map((k) => k[2][i]), {...clamp, easing: suave})) as [number, number, number]));
  const temblor = Math.max(descarga(f), destellos(f) * 0.6) * 0.6;
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
const BOLA = new THREE.SphereGeometry(1, 12, 8);
// Tubo brillante entre puntos (las líneas finas casi no se ven en vertical)
const ARRIBA = new THREE.Vector3(0, 1, 0);
const Tubo: React.FC<{pts: THREE.Vector3[]; r: number; color: string; op: number}> = ({pts, r, color, op}) => {
  if (op <= 0.01) return null;
  const out = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i];
    const b = pts[i + 1];
    const d = b.clone().sub(a);
    const largo = d.length();
    if (largo < 1e-3) continue;
    const q = new THREE.Quaternion().setFromUnitVectors(ARRIBA, d.clone().normalize());
    out.push(
      <mesh key={i} position={a.clone().add(b).multiplyScalar(0.5).toArray()} quaternion={q} scale={[r, largo, r]}>
        <cylinderGeometry args={[1, 1, 1, 6]} />
        <meshBasicMaterial color={color} transparent opacity={op} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
    );
  }
  return <group>{out}</group>;
};
const Nube: React.FC<{f: number}> = ({f}) => {
  const brillo = destellos(f);
  const out = [];
  for (let k = 0; k < 26; k++) {
    const x = ((k * 37) % 100) - 50;
    const z = ((k * 53) % 60) - 30;
    const y = BASE + 4 + ((k * 7) % 5);
    out.push(
      <mesh key={k} geometry={BOLA} position={[x, y, z]} scale={[9, 4, 8]}>
        <meshBasicMaterial color={brillo > 0.2 ? RAYO : NUBE} transparent opacity={0.07 + brillo * 0.08} depthWrite={false} />
      </mesh>
    );
  }
  return <group>{out}</group>;
};

// Signos de carga (− en la base de la nube, + en el suelo)
const Signo: React.FC<{p: [number, number, number]; mas?: boolean; color: string; op: number}> = ({p, mas, color, op}) => (
  <group position={p}>
    <Holo geom={caja(3.2, 0.7, 0.7)} color={color} relleno={0.8 * op} linea={op} />
    {mas && <Holo geom={caja(0.7, 3.2, 0.7)} color={color} relleno={0.8 * op} linea={op} />}
  </group>
);
const Cargas: React.FC<{f: number}> = ({f}) => {
  const neg = interpolate(f, [H.NEGATIVA - 8, H.NEGATIVA + 8], [0, 1], clamp);
  const pos = interpolate(f, [H.POSITIVO - 8, H.POSITIVO + 8], [0, 1], clamp);
  const out = [];
  for (let k = 0; k < 14; k++) {
    const x = -32 + k * 5;
    if (neg > 0) out.push(<Signo key={'n' + k} p={[x, BASE - 5, (k % 3) * 4 - 4]} color={C.cian} op={neg * (0.6 + 0.4 * Math.sin(f * 0.2 + k))} />);
    if (pos > 0) out.push(<Signo key={'p' + k} mas p={[x + 2, 2, (k % 3) * 4 - 4]} color={C.rojo} op={pos * (0.6 + 0.4 * Math.sin(f * 0.2 + k + 1))} />);
  }
  return <group>{out}</group>;
};

// El "muro" de aire entre la nube y el suelo
const Muro: React.FC<{f: number}> = ({f}) => {
  const op = interpolate(f, [H.PARED - 10, H.PARED + 6, H.CABLE, H.CABLE + 20], [0, 1, 1, 0], clamp);
  if (op <= 0) return null;
  return <Holo geom={caja(70, BASE - 10, 40)} color={C.cian} relleno={0.09 * op} linea={0.7 * op} position={[0, BASE / 2 - 1, 0]} />;
};

const Suelo: React.FC = () => (
  <group>
    <Holo geom={caja(140, 0.2, 90)} color={C.verde} relleno={0.03} linea={0.2} position={[0, -0.1, 0]} />
    {/* lanzador */}
    <Holo geom={caja(1.6, 0.6, 1.6)} color={BLANCO} relleno={0.2} linea={0.8} position={[0, 0.3, 0]} />
    <Holo geom={caja(0.15, 3, 0.15)} color={BLANCO} relleno={0.3} linea={0.8} position={[0, 1.8, 0]} />
  </group>
);

const COHETE = new THREE.CylinderGeometry(0.25, 0.25, 1.6, 10);
const NARIZ = new THREE.ConeGeometry(0.25, 0.6, 10);
const Cohete: React.FC<{f: number}> = ({f}) => {
  const y = altura(f);
  const fuego = f > H.CABLE + 10 && f < H.CASI + 12;
  const op = interpolate(f, [H.CONECTA, H.CONECTA + 4], [1, 0.35], clamp);
  return (
    <group position={[0, y, 0]} scale={2.2}>
      <Holo geom={COHETE} color={BLANCO} relleno={0.25 * op} linea={op} angulo={30} />
      <Holo geom={NARIZ} color={C.rojo} relleno={0.4 * op} linea={op} angulo={30} position={[0, 1.1, 0]} />
      {fuego &&
        [0, 1, 2].map((k) => (
          <mesh key={k} geometry={BOLA} position={[0, -1.1 - k * 0.6 - ((f * 0.7) % 0.6), 0]} scale={0.3 - k * 0.07}>
            <meshBasicMaterial color={C.ambar} transparent opacity={0.8} depthWrite={false} blending={THREE.AdditiveBlending} />
          </mesh>
        ))}
    </group>
  );
};

// El cable: cobre; brilla cian ("lleva el suelo"), luego se vaporiza en naranja
const Cable: React.FC<{f: number}> = ({f}) => {
  const y = altura(f);
  if (f < H.CABLE) return null;
  const suelo = interpolate(f, [H.CASI - 6, H.CASI + 10, H.CONECTA], [0, 1, 1], clamp);
  const v = vapor(f);
  const pts: THREE.Vector3[] = [];
  for (let k = 0; k <= 20; k++) pts.push(new THREE.Vector3(Math.sin(k * 0.8 + f * 0.05) * 0.15 * (k / 20), (k / 20) * (y - 0.8), 0));
  if (f >= H.CONECTA) {
    // el cobre se vaporiza: puntos naranjas que se apagan
    const out = [];
    for (let k = 0; k < 60; k++) {
      const yy = ((k * 37) % 100) / 100 * ALTURA_MAX;
      const t = ((f + k * 3) % 30) / 30;
      out.push(
        <mesh key={k} geometry={BOLA} position={[Math.sin(k) * 0.3 * t + viento(f) * (yy / ALTURA_MAX), yy + t * 0.6, Math.cos(k) * 0.3 * t]} scale={0.18 + 0.2 * v}>
          <meshBasicMaterial color={COBRE} transparent opacity={v * (1 - t * 0.6)} depthWrite={false} blending={THREE.AdditiveBlending} />
        </mesh>
      );
    }
    return <group>{out}</group>;
  }
  return <Tubo pts={pts} r={0.14} color={suelo > 0.5 ? C.cian : COBRE} op={0.95} />;
};

// Punta: la electricidad se concentra (rayitos que convergen)
const Punta: React.FC<{f: number}> = ({f}) => {
  const op = interpolate(f, [H.CONCENTRA - 12, H.CONCENTRA + 4, H.CONECTA], [0, 1, 0], clamp);
  if (op <= 0) return null;
  const y = altura(f);
  const out = [];
  for (let k = 0; k < 14; k++) {
    const a = (k / 14) * Math.PI * 2;
    const t = ((f * 1.2 + k * 4) % 20) / 20;
    const r = 6 * (1 - t);
    out.push(
      <mesh key={k} geometry={BOLA} position={[Math.cos(a) * r, y + 1 + Math.abs(Math.sin(a)) * r * 0.8, Math.sin(a) * r * 0.6]} scale={0.2}>
        <meshBasicMaterial color={C.cian} transparent opacity={op * t} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
    );
  }
  out.push(
    <mesh key="g" geometry={BOLA} position={[0, y + 0.9, 0]} scale={0.6 + 0.3 * Math.sin(f * 0.6)}>
      <meshBasicMaterial color={C.cian} transparent opacity={op * 0.7} depthWrite={false} blending={THREE.AdditiveBlending} />
    </mesh>
  );
  return <group>{out}</group>;
};

// La descarga: chispa que sube, conexión, y el canal que queda
const Descarga: React.FC<{f: number}> = ({f}) => {
  const l = lider(f);
  const d = destellos(f);
  const canal = interpolate(f, [H.CONECTA, H.CONECTA + 10, H.CONSEJO + 40], [0, 0.6, 0.25], clamp);
  if (l <= 0) return null;
  const w = viento(f);
  const n = Math.max(2, Math.round(l * ZIG.length));
  const arriba = ZIG.slice(0, n).map((p) => p.clone().add(new THREE.Vector3(w * ((p.y - ALTURA_MAX) / (BASE - ALTURA_MAX) + 1) * 0.5, 0, 0)));
  const abajo = f >= H.CONECTA ? [new THREE.Vector3(w * 0.2, 0, 0), new THREE.Vector3(w * 0.5, ALTURA_MAX, 0)] : [];
  const color = d > 0.1 ? RAYO : C.cian;
  const op = f >= H.CONECTA ? Math.max(canal, d) : 0.9;
  return (
    <group>
      <Tubo pts={arriba} r={0.3 + d * 0.3} color={color} op={op} />
      {abajo.length > 0 && <Tubo pts={abajo} r={0.3 + d * 0.3} color={color} op={op} />}
      {d > 0.05 && <Tubo pts={RAMA} r={0.25} color={RAYO} op={d} />}
      {/* resplandor del canal en los destellos */}
      {d > 0.05 &&
        arriba.concat(abajo).map((p, k) => (
          <mesh key={k} geometry={BOLA} position={p.toArray()} scale={0.9 + d}>
            <meshBasicMaterial color={RAYO} transparent opacity={0.25 * d} depthWrite={false} blending={THREE.AdditiveBlending} />
          </mesh>
        ))}
      {/* pulsos de corriente bajando por el cable */}
      {f >= H.RECORRE - 6 &&
        f < H.VAPORIZA + 10 &&
        [0, 1, 2].map((k) => {
          const t = ((f - H.RECORRE + k * 6) % 18) / 18;
          return (
            <mesh key={'c' + k} geometry={BOLA} position={[w * 0.3, ALTURA_MAX * (1 - t), 0]} scale={0.6}>
              <meshBasicMaterial color={BLANCO} transparent opacity={1 - t} depthWrite={false} blending={THREE.AdditiveBlending} />
            </mesh>
          );
        })}
    </group>
  );
};

const PERSONA = new THREE.CapsuleGeometry(0.4, 1.2, 4, 8);
// Consejo: una cometa con hilo en la tormenta
const Cometa: React.FC<{f: number}> = ({f}) => {
  const op = interpolate(f, [H.COMETAS - 10, H.COMETAS + 6], [0, 1], clamp);
  if (op <= 0) return null;
  const k = new THREE.Vector3(-12, 20 + Math.sin(f * 0.1) * 0.5, 12);
  const hilo: THREE.Vector3[] = [];
  for (let i = 0; i <= 12; i++) {
    const t = i / 12;
    hilo.push(new THREE.Vector3(-4 + (k.x + 4) * t, 1.6 + (k.y - 1.6) * t - Math.sin(t * Math.PI) * 2, 12));
  }
  const peligro = interpolate(f, [H.ATAJO - 6, H.ATAJO + 4], [0, 1], clamp);
  return (
    <group>
      <group position={k.toArray()} rotation={[0, 0, Math.PI / 4]}>
        <Holo geom={caja(4.5, 4.5, 0.15)} color={peligro > 0.5 ? C.rojo : C.ambar} relleno={0.35 * op} linea={op} />
      </group>
      <Tubo pts={hilo} r={0.1} color={peligro > 0.5 ? C.rojo : BLANCO} op={op} />
      <Holo geom={PERSONA} color={BLANCO} relleno={0.2 * op} linea={0.8 * op} angulo={40} position={[-4, 1, 12]} scale={1.4} />
    </group>
  );
};

const Escena: React.FC<{f: number}> = ({f}) => {
  const aparicion = interpolate(f, [0, 20], [0, 1], clamp);
  return (
    <group scale={[1, aparicion, 1]}>
      <gridHelper args={[200, 100, C.cian, C.cian]} position={[0, -0.2, 0]}>
        <lineBasicMaterial attach="material" color={C.cian} transparent opacity={0.04} />
      </gridHelper>
      <Suelo />
      <Nube f={f} />
      <Cargas f={f} />
      <Muro f={f} />
      <Cable f={f} />
      <Cohete f={f} />
      <Punta f={f} />
      <Descarga f={f} />
      <Cometa f={f} />
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
const Titulo: React.FC<{color: string; children: React.ReactNode}> = ({color, children}) => (
  <div style={{fontFamily: MONO, fontWeight: 700, fontSize: 26, letterSpacing: 2, color}}>{children}</div>
);

// Distancia que tiene que saltar la chispa
const Salto: React.FC<{f: number}> = ({f}) => {
  const op = interpolate(f, [H.METROS - 4, H.METROS + 10, H.CHISPA, H.CHISPA + 12], [0, 1, 1, 0], clamp);
  if (op <= 0) return null;
  const frac = (BASE - altura(f)) / BASE;
  return (
    <Panel op={op} color={C.cian}>
      <Titulo color={C.cian}>DISTANCIA QUE DEBE SALTAR LA CHISPA</Titulo>
      <div style={{display: 'flex', alignItems: 'center', gap: 20, marginTop: 14}}>
        <div style={{flex: 1, height: 26, borderRadius: 13, background: 'rgba(255,255,255,0.1)', overflow: 'hidden'}}>
          <div style={{width: `${frac * 100}%`, height: '100%', background: C.cian, boxShadow: `0 0 16px ${C.cian}`}} />
        </div>
        <div style={{fontFamily: TITULAR, fontWeight: 900, fontSize: 44, color: C.blanco, whiteSpace: 'nowrap'}}>−{Math.round((1 - frac) * 100)}%</div>
      </div>
    </Panel>
  );
};

// Consejo
const Consejo: React.FC<{f: number}> = ({f}) => {
  const op = interpolate(f, [H.CONSEJO + 5, H.CONSEJO + 20, H.FIN, H.FIN + 15], [0, 1, 1, 0], clamp);
  if (op <= 0) return null;
  return (
    <Panel op={op} color={C.rojo}>
      <Titulo color={C.rojo}>EN UNA TORMENTA, NUNCA</Titulo>
      <div style={{fontFamily: TITULAR, fontWeight: 900, fontSize: 58, color: C.blanco, marginTop: 8, lineHeight: 1.1}}>
        eleves cometas ni drones <span style={{color: C.ambar}}>con cable</span>
      </div>
      <div style={{fontFamily: TITULAR, fontWeight: 900, fontSize: 44, color: C.rojo, marginTop: 12, opacity: interpolate(f, [H.ATAJO - 6, H.ATAJO + 6], [0.2, 1], clamp)}}>
        Te convierten en el atajo
      </div>
    </Panel>
  );
};

export const Holograma: React.FC = () => {
  const f = useCurrentFrame();
  const entrada = interpolate(f, [0, 12], [0, 1], clamp);
  const salida = interpolate(f, [H.DUR - 25, H.DUR - 5], [1, 0], clamp);
  const barrido = interpolate(f, [0, 22], [-100, 2000], clamp);
  const y = altura(f);
  const flash = descarga(f) * 0.5 + destellos(f) * 0.15;
  return (
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, #0b2234 0%, #040b14 60%, #01040a 100%)', opacity: Math.min(entrada, salida)}}>
      <ThreeCanvas width={1080} height={1920} camera={{fov: FOV, near: 0.1, far: 2000, position: [0, 10, 20]}}>
        <Camara f={f} />
        <Escena f={f} />
      </ThreeCanvas>

      <Etiqueta3D f={f} punto={new THREE.Vector3(-10, BASE - 1.5, 0)} desde={H.NEGATIVA - 4} hasta={H.PARED} color={C.cian} texto="Nube: negativa" dx={40} dy={-200} />
      <Etiqueta3D f={f} punto={new THREE.Vector3(-8, 1.2, 0)} desde={H.POSITIVO - 4} hasta={H.PARED} color={C.rojo} texto="Suelo: positivo" dx={40} dy={220} />
      <Etiqueta3D f={f} punto={new THREE.Vector3(10, BASE / 2, 20)} desde={H.PARED - 4} hasta={H.CABLE} color={C.cian} texto="Aire: un muro" dx={-40} dy={-200} />
      <Etiqueta3D f={f} punto={new THREE.Vector3(0, Math.min(y, 6) * 0.5, 0)} desde={H.COBRE - 4} hasta={H.SUELO + 20} color={COBRE} texto="Cable de cobre" dx={40} dy={-220} />
      <Etiqueta3D f={f} punto={new THREE.Vector3(0, 0.6, 0)} desde={H.SUELO - 4} hasta={H.PUNTA + 10} color={C.verde} texto="Conectado al suelo" dx={-40} dy={220} />
      <Etiqueta3D f={f} punto={new THREE.Vector3(0, y + 1, 0)} desde={H.CASI - 4} hasta={H.CHISPA - 4} color={C.cian} texto="Aquí llega «el suelo»" dx={40} dy={-220} />
      <Etiqueta3D f={f} punto={ZIG[Math.min(ZIG.length - 1, Math.round(lider(f) * (ZIG.length - 1)))]} desde={H.CHISPA} hasta={H.CONECTA + 4} color={C.cian} texto="La chispa sube" dx={40} dy={-200} />
      <Etiqueta3D f={f} punto={new THREE.Vector3(0.4, ALTURA_MAX * 0.5, 0)} desde={H.NARANJA - 6} hasta={H.CANAL + 6} color={COBRE} texto="Cobre vaporizado" dx={40} dy={-200} />
      <Etiqueta3D f={f} punto={new THREE.Vector3(viento(f) * 0.5, ALTURA_MAX * 0.8, 0)} desde={H.QUEDA - 4} hasta={H.CONSEJO} color={RAYO} texto="Canal de aire caliente" dx={-40} dy={-220} />

      <Salto f={f} />
      <Consejo f={f} />
      <AbsoluteFill style={{background: RAYO, opacity: flash, mixBlendMode: 'screen'}} />
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
