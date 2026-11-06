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
// Holograma del video 11: el efecto látigo. La lancha viene hacia la playa y gira de golpe;
// el inflable, atado con una cuerda larga, sigue derecho por inercia y luego la cuerda lo lanza
// por fuera de la curva, más rápido que la lancha, hasta la arena.
// Ejes (metros): la orilla es la línea z = 0; el mar está en z > 0 y la arena en z < 0.
// La trayectoria del inflable sale de una simulación real (cuerda que solo tira, sin frenos).
// =====================================================================
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const suave = Easing.inOut(Easing.cubic);
const BLANCO = '#E0F2FE';
const MAR = '#38BDF8';
const ARENA = '#FBBF24';
const INFLABLE = '#60A5FA';
const CHALECO = '#FB923C';

// ---------- Simulación del efecto látigo ----------
const VB = 0.6; // velocidad de la lancha (m por paso)
const L = 16; // largo de la cuerda
const ZG = 15; // donde empieza el giro
const R = 5; // radio del giro de la lancha
const T1 = (60 - ZG) / VB;
function lancha(t: number): {p: [number, number]; v: [number, number]} {
  if (t <= T1) return {p: [0, 60 - VB * t], v: [0, -VB]};
  const s = (t - T1) * VB;
  const arco = (R * Math.PI) / 2;
  if (s <= arco) {
    const a = s / R;
    return {p: [R - R * Math.cos(a), ZG - R * Math.sin(a)], v: [VB * Math.sin(a), -VB * Math.cos(a)]};
  }
  return {p: [R + (s - arco), ZG - R], v: [VB, 0]};
}
const PASO = 0.5;
const TMAX = 200;
const SIM: {b: [number, number]; vb: [number, number]; t: [number, number]; vt: [number, number]}[] = [];
{
  let T: [number, number] = [0, 60 + L];
  let v: [number, number] = [0, -VB];
  const dt = 0.05;
  for (let i = 0; i <= TMAX / dt; i++) {
    const t = i * dt;
    const {p: b, v: vb} = lancha(t);
    T = [T[0] + v[0] * dt, T[1] + v[1] * dt];
    v = [v[0] * (1 - 0.004 * dt), v[1] * (1 - 0.004 * dt)];
    const d: [number, number] = [T[0] - b[0], T[1] - b[1]];
    const n = Math.hypot(d[0], d[1]);
    if (n > L) {
      const dh: [number, number] = [d[0] / n, d[1] / n];
      T = [b[0] + dh[0] * L, b[1] + dh[1] * L];
      const r = (v[0] - vb[0]) * dh[0] + (v[1] - vb[1]) * dh[1];
      if (r > 0) v = [v[0] - r * dh[0], v[1] - r * dh[1]];
    }
    if (Math.abs(t / PASO - Math.round(t / PASO)) < 1e-6) SIM.push({b, vb, t: [...T], vt: [...v]});
  }
}
const muestra = (t: number) => {
  const i = Math.max(0, Math.min(SIM.length - 2, Math.floor(t / PASO)));
  const k = Math.max(0, Math.min(1, t / PASO - i));
  const a = SIM[i];
  const c = SIM[i + 1];
  const mez = (x: [number, number], y: [number, number]): [number, number] => [x[0] + (y[0] - x[0]) * k, x[1] + (y[1] - x[1]) * k];
  return {b: mez(a.b, c.b), vb: mez(a.vb, c.vb), t: mez(a.t, c.t), vt: mez(a.vt, c.vt)};
};

// Reloj de la simulación según la narración (cámara lenta en los momentos clave)
const reloj = (f: number) =>
  interpolate(
    f,
    [0, H.CUERDA, H.GIRA, H.TENSA, H.RAPIDO, H.ALA, H.ORILLA, H.GENTE, H.CONSEJO, H.DUR],
    [20, 30, T1 - 2, 100, 116, 126, 133, 150, 162, 190],
    clamp
  );
// Altura del inflable: el aire lo levanta al acercarse a la orilla
const altura = (t: number) => interpolate(t, [124, 132, 142, 156, 164], [0.4, 1.2, 3.4, 2.2, 0.4], clamp);
const cabeceo = (t: number) => interpolate(t, [124, 132, 142, 156], [0, 0.35, 0.25, 0], clamp);
const vec = (p: [number, number], y = 0) => new THREE.Vector3(p[0], y, p[1]);

// ---------- Cámara ----------
// Sigue a la lancha y al inflable; las claves son desplazamientos desde ese punto.
type ClaveCam = [number, [number, number, number], number];
const V = (x: number, y: number, z: number): [number, number, number] => [x, y, z];
const CAM: ClaveCam[] = [
  [0, V(-26, 34, 46), 0.5],
  [H.CUERDA + 20, V(-16, 14, 30), 0.5],
  [H.GIRA, V(-22, 30, 26), 0.5],
  [H.DERECHO, V(-26, 46, 22), 0.5],
  [H.GRANDE, V(-30, 58, 30), 0.5],
  [H.RAPIDO + 30, V(-24, 40, 30), 0.6],
  [H.AIRE, V(-14, 10, 22), 1],
  [H.LEVANTA, V(-12, 6, 18), 1],
  [H.METROS, V(-18, 16, 30), 0.8],
  [H.GENTE, V(-22, 18, 30), 0.8],
  [H.CONSEJO + 30, V(2, 52, 44), 0.3],
  [H.DUR, V(-14, 60, 52), 0.3],
];
export const FOV = 40;
export function camaraEn(f: number) {
  const fr = CAM.map((k) => k[0]);
  const o = new THREE.Vector3(...([0, 1, 2].map((i) => interpolate(f, fr, CAM.map((k) => k[1][i]), {...clamp, easing: suave})) as [number, number, number]));
  const peso = interpolate(f, fr, CAM.map((k) => k[2]), {...clamp, easing: suave}); // 0 = lancha, 1 = inflable
  const s = muestra(reloj(f));
  const t = vec(s.b).lerp(vec(s.t), peso);
  t.y = 1;
  // al final mira a toda la escena
  const fijo = interpolate(f, [H.CONSEJO, H.CONSEJO + 40], [0, 1], {...clamp, easing: suave});
  t.lerp(new THREE.Vector3(12, 0, 46), fijo);
  return {p: t.clone().add(o), t};
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
const Playa: React.FC<{f: number}> = ({f}) => {
  const olas = [];
  for (let k = 0; k < 80; k++) {
    const x = ((k * 37 + f * 0.2) % 200) - 80;
    const z = 2 + ((k * 53) % 120);
    olas.push(<Holo key={k} geom={caja(3, 0.03, 0.12)} color={MAR} relleno={0.5} linea={0.4} position={[x, 0.03, z]} />);
  }
  return (
    <group>
      <mesh position={[20, -0.05, 60]}>
        <boxGeometry args={[240, 0.1, 120]} />
        <meshBasicMaterial color={MAR} transparent opacity={0.08} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
      <Holo geom={caja(240, 0.1, 30)} color={ARENA} relleno={0.06} linea={0.3} position={[20, -0.05, -15]} />
      {/* la orilla */}
      <Holo geom={caja(240, 0.06, 0.4)} color={BLANCO} relleno={0.6} linea={0.8} position={[20, 0.02, 0]} />
      {olas}
    </group>
  );
};

const Lancha: React.FC<{p: [number, number]; v: [number, number]; color?: string; op?: number}> = ({p, v, color = BLANCO, op = 1}) => (
  <group position={[p[0], 0.5, p[1]]} rotation={[0, Math.atan2(-v[1], v[0]), 0]}>
    <Holo geom={caja(5, 1.1, 2)} color={color} relleno={0.15 * op} linea={0.9 * op} />
    <Holo geom={caja(1.6, 0.9, 1.6)} color={color} relleno={0.12 * op} linea={0.8 * op} position={[0.4, 1, 0]} />
  </group>
);

const PERSONA = new THREE.CapsuleGeometry(0.28, 0.8, 4, 8);
const Persona: React.FC<{p: THREE.Vector3; color: string; caida?: number; giro?: number}> = ({p, color, caida = 0, giro = 0}) => (
  <group position={p.toArray()} rotation={[0, giro, (caida * Math.PI) / 2.2]}>
    <Holo geom={PERSONA} color={color} relleno={0.2} linea={0.8} angulo={40} position={[0, 0.7, 0]} />
  </group>
);

const Inflable: React.FC<{f: number}> = ({f}) => {
  const t = reloj(f);
  const s = muestra(t);
  const y = altura(t);
  const ang = Math.atan2(-s.vt[1], s.vt[0]);
  const salen = interpolate(t, [140, 150], [0, 1], clamp); // los que iban arriba caen a la arena
  return (
    <group>
      <group position={[s.t[0], y, s.t[1]]} rotation={[0, ang, cabeceo(t)]}>
        <Holo geom={caja(4, 0.9, 2.4)} color={INFLABLE} relleno={0.2} linea={0.9} />
        {salen < 1 &&
          [-1.1, 0.1, 1.2].map((x, i) => <Persona key={i} p={new THREE.Vector3(x, 0.45 + salen * 1.5, i % 2 ? 0.5 : -0.5)} color={CHALECO} caida={salen} />)}
      </group>
    </group>
  );
};

// La cuerda: floja (curva) o tensa (roja)
const Cuerda: React.FC<{f: number}> = ({f}) => {
  const s = muestra(reloj(f));
  const y = altura(reloj(f));
  const d = Math.hypot(s.t[0] - s.b[0], s.t[1] - s.b[1]);
  const floja = Math.max(0, 1 - d / L);
  const tensa = floja < 0.01;
  const a = vec(s.b, 0.8);
  const b = vec(s.t, y + 0.3);
  const m = a.clone().lerp(b, 0.5);
  m.y -= floja * 6;
  const curva = new THREE.QuadraticBezierCurve3(a, m, b).getPoints(16);
  const op = interpolate(f, [H.TENSA - 4, H.TENSA + 4], [0, 1], clamp);
  return <Linea puntos={curva} color={tensa && op > 0.5 && f < H.CONSEJO ? C.rojo : BLANCO} opacidad={0.95} />;
};

// Estelas: la de la lancha (círculo chico) y la del inflable (círculo grande)
const Estelas: React.FC<{f: number}> = ({f}) => {
  const t = reloj(f);
  const op = interpolate(f, [H.GIRA - 10, H.GIRA + 10], [0, 1], clamp) * interpolate(f, [H.CONSEJO + 20, H.CONSEJO + 50], [1, 0.35], clamp);
  if (op <= 0 || t < T1 - 6) return null;
  const pb: THREE.Vector3[] = [];
  const pt: THREE.Vector3[] = [];
  for (let u = T1 - 6; u <= t; u += 1) {
    const s = muestra(u);
    pb.push(vec(s.b, 0.1));
    pt.push(vec(s.t, 0.1));
  }
  if (pb.length < 2) return null;
  return (
    <group>
      <Linea puntos={pb} color={C.cian} opacidad={op} />
      <Linea puntos={pt} color={C.ambar} opacidad={op} />
    </group>
  );
};

// Flechas de aire por debajo del frente del inflable
const FLECHA = new THREE.ConeGeometry(0.3, 0.8, 4);
const Aire: React.FC<{f: number}> = ({f}) => {
  const op = interpolate(f, [H.AIRE - 10, H.AIRE + 6, H.GENTE, H.GENTE + 15], [0, 1, 1, 0], clamp);
  if (op <= 0) return null;
  const t = reloj(f);
  const s = muestra(t);
  const y = altura(t);
  const out = [];
  for (let k = 0; k < 8; k++) {
    const u = ((f + k * 5) % 24) / 24;
    out.push(
      <mesh key={k} geometry={FLECHA} position={[s.t[0] + ((k % 4) - 1.5) * 0.9, y - 1.4 + u * 1.2, s.t[1] + (k < 4 ? -0.6 : 0.6)]}>
        <meshBasicMaterial color={C.cian} transparent opacity={op * (1 - u)} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
    );
  }
  return <group>{out}</group>;
};

// Gente en la arena: se apartan o caen cuando pasa el inflable
const GENTE: [number, number][] = [
  [22, -2.5], [25, -4], [28, -2], [31, -3.6], [34, -1.8], [37, -4.4], [40, -2.6], [44, -3.4], [18, -5], [48, -2],
];
const Gente: React.FC<{f: number}> = ({f}) => {
  const t = reloj(f);
  return (
    <group>
      {GENTE.map(([x, z], i) => {
        // cuándo pasa el inflable por su x
        let tPasa = 999;
        for (let u = 125; u < 170; u += 1) {
          if (muestra(u).t[0] >= x) {
            tPasa = u;
            break;
          }
        }
        const caida = interpolate(t, [tPasa - 1, tPasa + 3], [0, i % 3 === 2 ? 0.2 : 1], clamp);
        return <Persona key={i} p={new THREE.Vector3(x, 0, z)} color={BLANCO} caida={caida} giro={i} />;
      })}
    </group>
  );
};

// Consejo: el giro seguro, lejos de la orilla
const GiroSeguro: React.FC<{f: number}> = ({f}) => {
  const op = interpolate(f, [H.LEJOS - 20, H.LEJOS], [0, 1], clamp);
  if (op <= 0) return null;
  const pts: THREE.Vector3[] = [];
  for (let k = 0; k <= 40; k++) {
    const a = (k / 40) * Math.PI;
    pts.push(new THREE.Vector3(12 - 12 * Math.cos(a), 0.2, 55 - 12 * Math.sin(a)));
  }
  const recto: THREE.Vector3[] = [new THREE.Vector3(0, 0.2, 90), new THREE.Vector3(0, 0.2, 55)];
  return (
    <group>
      {[...recto.length ? [] : [], ...pts, ...Array.from({length: 12}, (_, k) => new THREE.Vector3(0, 0.2, 90 - k * 3))].map((q, k) => (
        <mesh key={k} position={q.toArray()}>
          <sphereGeometry args={[0.35, 8, 6]} />
          <meshBasicMaterial color={C.verde} transparent opacity={op} depthWrite={false} blending={THREE.AdditiveBlending} />
        </mesh>
      ))}
      <Lancha p={[24, 55]} v={[0, 0.6]} color={C.verde} op={op} />
    </group>
  );
};

const Escena: React.FC<{f: number}> = ({f}) => {
  const aparicion = interpolate(f, [0, 20], [0, 1], clamp);
  const s = muestra(reloj(f));
  return (
    <group scale={[1, aparicion, 1]}>
      <gridHelper args={[300, 150, C.cian, C.cian]} position={[0, -0.2, 0]}>
        <lineBasicMaterial attach="material" color={C.cian} transparent opacity={0.04} />
      </gridHelper>
      <Playa f={f} />
      <Estelas f={f} />
      <Lancha p={s.b} v={s.vb} />
      <Cuerda f={f} />
      <Inflable f={f} />
      <Aire f={f} />
      <Gente f={f} />
      <GiroSeguro f={f} />
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

// Velocidades en vivo (de la simulación)
const Velocidades: React.FC<{f: number}> = ({f}) => {
  const op = interpolate(f, [H.RAPIDO + 4, H.RAPIDO + 18, H.ALA, H.ALA + 14], [0, 1, 1, 0], clamp);
  if (op <= 0) return null;
  const s = muestra(reloj(f));
  const vb = Math.hypot(...s.vb);
  const vt = Math.hypot(...s.vt);
  const fila = (t: string, w: number, color: string, valor: string) => (
    <div style={{marginTop: 18}}>
      <div style={{display: 'flex', justifyContent: 'space-between', fontFamily: MONO, fontWeight: 700, fontSize: 28, color: C.blanco}}>
        <span>{t}</span>
        <span style={{color}}>{valor}</span>
      </div>
      <div style={{height: 22, marginTop: 8, borderRadius: 11, background: 'rgba(255,255,255,0.1)', overflow: 'hidden'}}>
        <div style={{width: `${Math.min(1, w) * 100}%`, height: '100%', background: color, boxShadow: `0 0 16px ${color}`}} />
      </div>
    </div>
  );
  return (
    <Panel op={op} color={C.ambar}>
      <Titulo color={C.ambar}>VELOCIDAD EN LA CURVA</Titulo>
      {fila('Lancha', vb / (2 * VB), C.cian, '×1')}
      {fila('Inflable', vt / (2 * VB), C.ambar, `×${(vt / vb).toFixed(1)}`)}
    </Panel>
  );
};

// Consejo
const Consejo: React.FC<{f: number}> = ({f}) => {
  const op = interpolate(f, [H.CONSEJO + 5, H.CONSEJO + 20, H.FIN, H.FIN + 15], [0, 1, 1, 0], clamp);
  if (op <= 0) return null;
  return (
    <Panel op={op} color={C.verde}>
      <Titulo color={C.verde}>LA LANCHA NUNCA DEBE GIRAR</Titulo>
      <div style={{fontFamily: TITULAR, fontWeight: 900, fontSize: 60, color: C.blanco, marginTop: 8, lineHeight: 1.1}}>
        cerca de la <span style={{color: C.ambar}}>playa</span>
      </div>
      <div style={{fontFamily: TITULAR, fontWeight: 900, fontSize: 40, color: C.blanco, marginTop: 14, opacity: interpolate(f, [H.LEJOS - 6, H.LEJOS + 6], [0.2, 1], clamp)}}>
        El inflable termina <span style={{color: C.rojo}}>más lejos</span> y <span style={{color: C.rojo}}>más rápido</span>
      </div>
    </Panel>
  );
};

export const Holograma: React.FC = () => {
  const f = useCurrentFrame();
  const entrada = interpolate(f, [0, 12], [0, 1], clamp);
  const salida = interpolate(f, [H.DUR - 25, H.DUR - 5], [1, 0], clamp);
  const barrido = interpolate(f, [0, 22], [-100, 2000], clamp);
  const t = reloj(f);
  const s = muestra(t);
  const y = altura(t);
  return (
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, #0b2234 0%, #040b14 60%, #01040a 100%)', opacity: Math.min(entrada, salida)}}>
      <ThreeCanvas width={1080} height={1920} camera={{fov: FOV, near: 0.1, far: 2000, position: [0, 10, 20]}}>
        <Camara f={f} />
        <Escena f={f} />
      </ThreeCanvas>

      <Etiqueta3D f={f} punto={vec(s.b, 1.5)} desde={H.CUERDA + 10} hasta={H.LARGA} color={C.cian} texto="Lancha" dx={40} dy={-220} />
      <Etiqueta3D f={f} punto={vec(s.b, 0.5).lerp(vec(s.t, 0.5), 0.5)} desde={H.LARGA - 4} hasta={H.FRENOS} color={BLANCO} texto="Cuerda larga" dx={40} dy={-220} />
      <Etiqueta3D f={f} punto={vec(s.t, 1)} desde={H.FRENOS - 4} hasta={H.INERCIA + 6} color={C.ambar} texto="Sin frenos ni timón" dx={-40} dy={240} />
      <Etiqueta3D f={f} punto={vec(s.b, 1.5)} desde={H.GIRA - 2} hasta={H.DERECHO} color={C.cian} texto="Gira de golpe" dx={40} dy={-220} />
      <Etiqueta3D f={f} punto={vec(s.t, 1)} desde={H.DERECHO - 4} hasta={H.TENSA} color={C.ambar} texto="Sigue derecho" dx={-40} dy={240} />
      <Etiqueta3D f={f} punto={vec(s.b, 0.5).lerp(vec(s.t, 0.5), 0.5)} desde={H.TENSA - 2} hasta={H.GRANDE - 6} color={C.rojo} texto="Se tensa" dx={40} dy={-220} />
      <Etiqueta3D f={f} punto={vec(s.t, 1)} desde={H.GRANDE - 4} hasta={H.RAPIDO + 6} color={C.ambar} texto="Círculo más grande" dx={40} dy={240} />
      <Etiqueta3D f={f} punto={vec(s.t, y + 0.5)} desde={H.LEVANTA - 6} hasta={H.ORILLA + 6} color={C.cian} texto="El aire lo levanta" dx={-40} dy={-240} />
      <Etiqueta3D f={f} punto={new THREE.Vector3(30, 0.2, 0)} desde={H.METROS - 4} hasta={H.GENTE + 10} color={C.rojo} texto="A pocos metros de la orilla" dx={-40} dy={260} />
      <Etiqueta3D f={f} punto={new THREE.Vector3(12, 0.3, 43)} desde={H.LEJOS - 4} hasta={H.FIN} color={C.verde} texto="Girar lejos" dx={40} dy={-200} />

      <Velocidades f={f} />
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
