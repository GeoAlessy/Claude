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
// Holograma del video 10: el Stromboli. La columna de la explosión sube, una parte se desploma
// y baja por la ladera (flujo piroclástico); al tocar el mar hierve el agua, forma un colchón de vapor
// y la nube se desliza encima. El bote huye.
// Ejes (unidades ≈ 25 m): el volcán en el origen, la ladera de la Sciara del Fuoco mira hacia +x, el mar en y = 0.
// =====================================================================
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const suave = Easing.inOut(Easing.cubic);
const BLANCO = '#E0F2FE';
const MAR = '#38BDF8';
const ROCA = '#94A3B8';
const NUBE = '#CBD5E1';
const CALIENTE = '#FB923C';
const ALTO = 22; // altura del volcán
const ORILLA = 40; // donde la ladera toca el mar (en x)
const FRENTE_MAX = 95;

// ---------- Estado ----------
// Frente del flujo: recorrido desde el cráter (0) hasta el mar y más allá
const frente = (f: number) =>
  interpolate(f, [H.DESPLOMO, H.LADERA, H.CIEN + 20, H.TOCAR + 10, H.DISCO + 30, H.NADIE + 40], [0, 18, ORILLA - 4, ORILLA + 4, 68, FRENTE_MAX], clamp);
// Punto del camino a una distancia x desde el cráter (sobre la ladera y luego sobre el mar)
const camino = (x: number) => {
  if (x <= ORILLA) return new THREE.Vector3(x, Math.max(0, ALTO * (1 - (x - 3) / (ORILLA - 3))) + 1.2, 0);
  return new THREE.Vector3(x, 1.8, 0);
};
const columna = (f: number) => interpolate(f, [H.EXPLOSION - 4, H.EXPLOSION + 40], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
const bote = (f: number) => {
  const huye = interpolate(f, [H.HUIR - 10, H.NADIE + 60], [0, 1], {...clamp, easing: Easing.in(Easing.quad)});
  return new THREE.Vector3(96 + huye * 50, 0.4, 6 + huye * 14);
};

// ---------- Cámara ----------
type ClaveCam = [number, [number, number, number], [number, number, number]];
const V = (x: number, y: number, z: number): [number, number, number] => [x, y, z];
const CAM: ClaveCam[] = [
  [0, V(120, 45, 110), V(20, 14, 0)],
  [H.EXPLOSION, V(100, 40, 95), V(10, 22, 0)],
  [H.DESPLOMO + 10, V(95, 50, 90), V(5, 30, 0)],
  [H.PIRO, V(85, 36, 80), V(18, 12, 0)],
  [H.GRADOS + 10, V(76, 32, 72), V(18, 12, 0)],
  [H.PESADO + 30, V(70, 34, 70), V(10, 20, 0)],
  [H.AVALANCHA, V(70, 26, 62), V(20, 10, 0)],
  [H.CIEN + 10, V(80, 18, 60), V(32, 5, 0)],
  [H.HIERVE, V(88, 14, 56), V(46, 3, 0)],
  [H.COLCHON + 10, V(82, 9, 46), V(50, 2, 0)],
  [H.DISCO + 10, V(104, 15, 64), V(62, 3, 0)],
  [H.HUIR, V(125, 18, 70), V(88, 2, 6)],
  [H.NADIE + 20, V(150, 24, 90), V(105, 2, 12)],
  [H.CONSEJO + 30, V(140, 50, 130), V(40, 10, 10)],
  [H.DUR, V(-60, 70, 160), V(20, 10, 0)],
];
export const FOV = 40;
export function camaraEn(f: number) {
  const fr = CAM.map((k) => k[0]);
  const p = new THREE.Vector3(...([0, 1, 2].map((i) => interpolate(f, fr, CAM.map((k) => k[1][i]), {...clamp, easing: suave})) as [number, number, number]));
  const t = new THREE.Vector3(...([0, 1, 2].map((i) => interpolate(f, fr, CAM.map((k) => k[2][i]), {...clamp, easing: suave})) as [number, number, number]));
  const temblor = interpolate(f, [H.EXPLOSION - 1, H.EXPLOSION, H.EXPLOSION + 18], [0, 0.8, 0], clamp);
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
const CONO = new THREE.CylinderGeometry(3, ORILLA, ALTO, 28, 1, true);
const CRATER = new THREE.TorusGeometry(3, 0.25, 6, 24);
const Isla: React.FC = () => (
  <group>
    <Holo geom={CONO} color={ROCA} relleno={0.07} linea={0.45} angulo={8} position={[0, ALTO / 2, 0]} />
    {/* cráter */}
    <Holo geom={CRATER} color={CALIENTE} relleno={0.5} linea={0} position={[0, ALTO, 0]} rotation={[Math.PI / 2, 0, 0]} />
    {/* la Sciara del Fuoco: el canal de la ladera que mira al mar */}
    {[-1, 1].map((s) => (
      <Holo key={s} geom={caja(Math.hypot(ORILLA - 3, ALTO), 0.25, 0.25)} color={C.ambar} relleno={0.4} linea={0.8} position={[(ORILLA + 3) / 2, ALTO / 2 + 0.3, s * 5]} rotation={[0, 0, -Math.atan2(ALTO, ORILLA - 3)]} />
    ))}
  </group>
);

// Mar con olas
const Mar: React.FC<{f: number}> = ({f}) => {
  const out = [];
  for (let k = 0; k < 70; k++) {
    const x = ((k * 37 + f * 0.3) % 260) - 100;
    const z = ((k * 53) % 200) - 100;
    out.push(<Holo key={k} geom={caja(4, 0.04, 0.15)} color={MAR} relleno={0.5} linea={0.4} position={[x, 0.05, z]} />);
  }
  return (
    <group>
      <mesh position={[0, -0.05, 0]}>
        <boxGeometry args={[400, 0.1, 400]} />
        <meshBasicMaterial color={MAR} transparent opacity={0.08} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
      {out}
    </group>
  );
};

// Bocanadas de nube
const BOLA = new THREE.SphereGeometry(1, 12, 8);
const Bocanada: React.FC<{p: THREE.Vector3; r: number; color: string; op: number}> = ({p, r, color, op}) => (
  <mesh geometry={BOLA} position={p.toArray()} scale={r}>
    <meshBasicMaterial color={color} transparent opacity={op} depthWrite={false} />
  </mesh>
);

// Columna de la explosión (sube) — el humo liviano
const Columna: React.FC<{f: number}> = ({f}) => {
  const c = columna(f);
  if (c <= 0) return null;
  const out = [];
  for (let k = 0; k < 40; k++) {
    const t = ((f * 0.4 + k * 7) % 60) / 60;
    const y = ALTO + t * 45 * c;
    const r = 2 + t * 6;
    const x = Math.sin(k * 1.7) * (1 + t * 6);
    const z = Math.cos(k * 2.3) * (1 + t * 6);
    out.push(<Bocanada key={k} p={new THREE.Vector3(x, y, z)} r={r} color={NUBE} op={0.1 * c * (1 - t * 0.6)} />);
  }
  return <group>{out}</group>;
};

// El flujo piroclástico: bocanadas pegadas al suelo, del cráter al frente
const Flujo: React.FC<{f: number}> = ({f}) => {
  const fr = frente(f);
  if (fr <= 0) return null;
  const caliente = interpolate(f, [H.GRADOS - 6, H.GRADOS + 10, H.PESADO + 20], [0, 1, 0.5], clamp);
  const out = [];
  const N = 90;
  for (let k = 0; k < N; k++) {
    const x = (k / N) * fr;
    const base = camino(x);
    const sobreMar = x > ORILLA;
    const r = 1.6 + (x / FRENTE_MAX) * 4 + Math.sin(k * 3.1 + f * 0.1) * 0.6;
    const p = base.clone().add(new THREE.Vector3(Math.sin(k * 5.3) * 1.5, r * 0.6 + (sobreMar ? 0.6 : 0), Math.cos(k * 4.1) * (2 + x * 0.12)));
    const col = caliente > 0.3 && k % 3 === 0 ? CALIENTE : '#94A3B8';
    out.push(<Bocanada key={k} p={p} r={r} color={col} op={0.12} />);
  }
  // frente que se enrosca
  for (let k = 0; k < 8; k++) {
    const p = camino(fr).add(new THREE.Vector3(Math.sin(f * 0.2 + k) * 2, 2 + (k % 3) * 1.6, ((k % 4) - 1.5) * 3));
    out.push(<Bocanada key={'f' + k} p={p} r={3 + (fr / FRENTE_MAX) * 3} color={'#CBD5E1'} op={0.14} />);
  }
  return <group>{out}</group>;
};

// Colchón de vapor bajo el flujo sobre el mar
const Vapor: React.FC<{f: number}> = ({f}) => {
  const fr = frente(f);
  const op = interpolate(f, [H.HIERVE - 10, H.COLCHON], [0, 1], clamp);
  if (fr <= ORILLA || op <= 0) return null;
  const largo = fr - ORILLA;
  const out = [];
  for (let k = 0; k < 50; k++) {
    const t = ((f * 0.8 + k * 9) % 30) / 30;
    const x = ORILLA + ((k * 37) % 100) / 100 * largo;
    const z = (((k * 53) % 100) / 100 - 0.5) * 14;
    out.push(<Bocanada key={k} p={new THREE.Vector3(x, 0.1 + t * 1.4, z)} r={0.25 + t * 0.2} color={BLANCO} op={op * 0.7 * (1 - t)} />);
  }
  return (
    <group>
      <mesh position={[ORILLA + largo / 2, 0.55, 0]}>
        <boxGeometry args={[largo, 1.1, 16]} />
        <meshBasicMaterial color={BLANCO} transparent opacity={0.16 * op} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
      {out}
    </group>
  );
};

// Flechas: el humo sube, el flujo baja
const FLECHA = new THREE.ConeGeometry(1, 2.2, 4);
const Flechas: React.FC<{f: number}> = ({f}) => {
  const op = interpolate(f, [H.AIRE - 10, H.AIRE + 6, H.RAPIDO, H.RAPIDO + 15], [0, 1, 1, 0], clamp);
  if (op <= 0) return null;
  const out = [];
  for (let k = 0; k < 3; k++) {
    const t = ((f + k * 12) % 36) / 36;
    out.push(
      <mesh key={'s' + k} geometry={FLECHA} position={[-10, ALTO + 10 + t * 14, 0]}>
        <meshBasicMaterial color={C.cian} transparent opacity={op * Math.sin(t * Math.PI)} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
    );
    const p = camino(6 + t * 22).add(new THREE.Vector3(0, 7, -9));
    out.push(
      <mesh key={'b' + k} geometry={FLECHA} position={p.toArray()} rotation={[0, 0, -(Math.PI / 2 + Math.atan2(ALTO, ORILLA - 3))]}>
        <meshBasicMaterial color={C.rojo} transparent opacity={op * Math.sin(t * Math.PI)} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
    );
  }
  return <group>{out}</group>;
};

// El bote con su lancha a remolque
const Bote: React.FC<{f: number}> = ({f}) => {
  const p = bote(f);
  const ang = Math.atan2(14, 50);
  const estela = interpolate(f, [H.HUIR - 10, H.HUIR + 10], [0, 1], clamp);
  return (
    <group position={p.toArray()} rotation={[0, -ang, 0]}>
      <Holo geom={caja(5, 1.2, 1.8)} color={BLANCO} relleno={0.15} linea={0.9} position={[0, 0.6, 0]} />
      <Holo geom={caja(2, 1, 1.4)} color={BLANCO} relleno={0.12} linea={0.8} position={[-0.4, 1.7, 0]} />
      <Holo geom={caja(2.2, 0.6, 1.2)} color={C.ambar} relleno={0.2} linea={0.8} position={[-6, 0.3, 0]} />
      {estela > 0 &&
        Array.from({length: 10}, (_, k) => (
          <Holo key={k} geom={caja(1.2, 0.05, 0.3)} color={BLANCO} relleno={0.6 * estela} linea={0.5 * estela} position={[-8 - k * 1.6, 0.05, ((k % 2) - 0.5) * (0.6 + k * 0.3)]} />
        ))}
    </group>
  );
};

const Escena: React.FC<{f: number}> = ({f}) => {
  const aparicion = interpolate(f, [0, 20], [0, 1], clamp);
  return (
    <group scale={[1, aparicion, 1]}>
      <gridHelper args={[400, 100, C.cian, C.cian]} position={[0, -0.2, 0]}>
        <lineBasicMaterial attach="material" color={C.cian} transparent opacity={0.04} />
      </gridHelper>
      <Mar f={f} />
      <Isla />
      <Columna f={f} />
      <Flujo f={f} />
      <Vapor f={f} />
      <Flechas f={f} />
      <Bote f={f} />
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

// ¿Qué es? gas + ceniza + rocas a cientos de grados
const Receta: React.FC<{f: number}> = ({f}) => {
  const op = interpolate(f, [H.PIRO - 4, H.PIRO + 10, H.PESADO, H.PESADO + 14], [0, 1, 1, 0], clamp);
  if (op <= 0) return null;
  const item = (desde: number, icono: React.ReactNode, texto: string) => (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, opacity: interpolate(f, [desde - 6, desde + 4], [0.15, 1], clamp)}}>
      <svg width={110} height={90} viewBox="0 0 110 90">
        {icono}
      </svg>
      <div style={{fontFamily: TITULAR, fontWeight: 900, fontSize: 38, color: C.blanco}}>{texto}</div>
    </div>
  );
  const temp = interpolate(f, [H.GRADOS - 8, H.GRADOS + 14], [0, 1], clamp);
  return (
    <Panel op={op} color={CALIENTE}>
      <Titulo color={CALIENTE}>FLUJO PIROCLÁSTICO</Titulo>
      <div style={{display: 'flex', justifyContent: 'space-around', alignItems: 'flex-end', marginTop: 16}}>
        {item(
          H.GAS,
          <g fill="none" stroke={BLANCO} strokeWidth={5} strokeLinecap="round">
            <path d="M15,60 Q30,40 45,60 T75,60 T105,60" />
            <path d="M15,35 Q30,15 45,35 T75,35 T105,35" opacity={0.6} />
          </g>,
          'Gas'
        )}
        <div style={{fontFamily: TITULAR, fontWeight: 900, fontSize: 44, color: CALIENTE, marginBottom: 6}}>+</div>
        {item(
          H.CENIZA,
          <g fill={NUBE}>
            {Array.from({length: 22}, (_, k) => (
              <circle key={k} cx={12 + ((k * 37) % 88)} cy={18 + ((k * 53) % 60)} r={3 + (k % 3)} />
            ))}
          </g>,
          'Ceniza'
        )}
        <div style={{fontFamily: TITULAR, fontWeight: 900, fontSize: 44, color: CALIENTE, marginBottom: 6}}>+</div>
        {item(
          H.ROCAS,
          <g fill="none" stroke={BLANCO} strokeWidth={5} strokeLinejoin="round">
            <path d="M15,75 L30,45 L55,40 L62,72 Z" />
            <path d="M62,78 L72,50 L98,55 L100,80 Z" />
          </g>,
          'Rocas'
        )}
      </div>
      <div style={{marginTop: 18, display: 'flex', alignItems: 'center', gap: 18, opacity: temp}}>
        <div style={{flex: 1, height: 24, borderRadius: 12, background: 'rgba(255,255,255,0.1)', overflow: 'hidden'}}>
          <div style={{width: `${temp * 100}%`, height: '100%', background: `linear-gradient(90deg, ${C.ambar}, ${CALIENTE}, ${C.rojo})`, boxShadow: `0 0 16px ${CALIENTE}`}} />
        </div>
        <div style={{fontFamily: TITULAR, fontWeight: 900, fontSize: 40, color: C.rojo, whiteSpace: 'nowrap'}}>cientos de °C</div>
      </div>
    </Panel>
  );
};

// Velocidad
const Velocidad: React.FC<{f: number}> = ({f}) => {
  const op = interpolate(f, [H.RAPIDO + 4, H.RAPIDO + 16, H.VAPOR, H.VAPOR + 14], [0, 1, 1, 0], clamp);
  if (op <= 0) return null;
  const v = interpolate(f, [H.RAPIDO + 4, H.CIEN + 8], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  const ang = -120 + v * 230;
  return (
    <Panel op={op} color={C.rojo}>
      <Titulo color={C.rojo}>VELOCIDAD DEL FLUJO</Titulo>
      <div style={{display: 'flex', alignItems: 'center', gap: 30, marginTop: 10}}>
        <svg width={200} height={150} viewBox="0 0 200 150">
          <path d="M20,130 A80,80 0 1,1 180,130" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth={14} strokeLinecap="round" />
          <path d="M20,130 A80,80 0 1,1 180,130" fill="none" stroke={C.rojo} strokeWidth={14} strokeLinecap="round" strokeDasharray={`${v * 420} 999`} />
          <line x1={100} y1={100} x2={100 + 62 * Math.sin((ang * Math.PI) / 180)} y2={100 - 62 * Math.cos((ang * Math.PI) / 180)} stroke={C.blanco} strokeWidth={6} strokeLinecap="round" />
          <circle cx={100} cy={100} r={9} fill={C.blanco} />
        </svg>
        <div style={{fontFamily: TITULAR, fontWeight: 900, fontSize: 76, color: C.blanco, lineHeight: 1}}>
          +{Math.round(v * 100)}
          <div style={{fontSize: 36, color: C.rojo}}>km/h</div>
        </div>
      </div>
    </Panel>
  );
};

// La mesa de aire: el disco flota sobre un colchón y se desliza
const Mesa: React.FC<{f: number}> = ({f}) => {
  const op = interpolate(f, [H.DISCO - 10, H.DISCO + 4, H.BOTE + 10, H.BOTE + 24], [0, 1, 1, 0], clamp);
  if (op <= 0) return null;
  const x = 60 + ((f - H.DISCO + 10) * 7) % 700;
  return (
    <Panel op={op} color={BLANCO}>
      <Titulo color={BLANCO}>COMO EN UNA MESA DE AIRE</Titulo>
      <svg width={900} height={220} viewBox="0 0 900 220" style={{marginTop: 10}}>
        <rect x={20} y={150} width={860} height={40} rx={8} fill="rgba(56,189,248,0.15)" stroke={MAR} strokeWidth={3} />
        {Array.from({length: 22}, (_, k) => {
          const t = ((f + k * 5) % 20) / 20;
          return <line key={k} x1={40 + k * 39} y1={150 - t * 30} x2={40 + k * 39} y2={142 - t * 30} stroke={BLANCO} strokeWidth={4} opacity={1 - t} strokeLinecap="round" />;
        })}
        <ellipse cx={x} cy={112} rx={70} ry={18} fill="rgba(148,163,184,0.5)" stroke={BLANCO} strokeWidth={4} />
        <text x={x} y={70} textAnchor="middle" fill={BLANCO} fontFamily={MONO} fontWeight={700} fontSize={24}>
          la nube
        </text>
        <text x={450} y={212} textAnchor="middle" fill={MAR} fontFamily={MONO} fontWeight={700} fontSize={22}>
          vapor = casi sin roce
        </text>
      </svg>
    </Panel>
  );
};

// Consejo: más rápida que tú
const Consejo: React.FC<{f: number}> = ({f}) => {
  const op = interpolate(f, [H.CONSEJO + 5, H.CONSEJO + 20, H.FIN, H.FIN + 15], [0, 1, 1, 0], clamp);
  if (op <= 0) return null;
  const k = interpolate(f, [H.RAPIDA - 10, H.RAPIDA + 15], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
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
  return (
    <Panel op={op} color={C.rojo}>
      <Titulo color={C.rojo}>SI VES UNA NUBE ASÍ</Titulo>
      <div style={{fontFamily: TITULAR, fontWeight: 900, fontSize: 56, color: C.blanco, marginTop: 8, opacity: interpolate(f, [H.ALEJATE - 6, H.ALEJATE + 4], [0.2, 1], clamp)}}>
        No esperes: <span style={{color: C.ambar}}>aléjate</span>
      </div>
      {fila('Flujo piroclástico', 0.95 * k, '+100 km/h', C.rojo)}
      {fila('Tú corriendo', 0.14 * k, '~15 km/h', C.verde)}
    </Panel>
  );
};

export const Holograma: React.FC = () => {
  const f = useCurrentFrame();
  const entrada = interpolate(f, [0, 12], [0, 1], clamp);
  const salida = interpolate(f, [H.DUR - 25, H.DUR - 5], [1, 0], clamp);
  const barrido = interpolate(f, [0, 22], [-100, 2000], clamp);
  const fr = frente(f);
  const b = bote(f);
  return (
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, #0b2234 0%, #040b14 60%, #01040a 100%)', opacity: Math.min(entrada, salida)}}>
      <ThreeCanvas width={1080} height={1920} camera={{fov: FOV, near: 0.1, far: 3000, position: [0, 10, 20]}}>
        <Camara f={f} />
        <Escena f={f} />
      </ThreeCanvas>

      <Etiqueta3D f={f} punto={new THREE.Vector3(0, ALTO, 0)} desde={H.ISLA + 20} hasta={H.EXPLOSION} color={C.ambar} texto="Volcán Stromboli" dx={-40} dy={-280} />
      <Etiqueta3D f={f} punto={new THREE.Vector3(0, ALTO + 30, 0)} desde={H.SUBIO - 10} hasta={H.DESPLOMO + 10} color={C.cian} texto="La columna sube…" dx={40} dy={-200} />
      <Etiqueta3D f={f} punto={camino(Math.max(2, fr - 2))} desde={H.DESPLOMO} hasta={H.PIRO - 4} color={C.rojo} texto="…y una parte se desploma" dx={-40} dy={260} />
      <Etiqueta3D f={f} punto={new THREE.Vector3(-10, ALTO + 16, 0)} desde={H.FLOTA - 6} hasta={H.LADERA} color={C.cian} texto="Humo: sube" dx={-40} dy={-220} />
      <Etiqueta3D f={f} punto={camino(Math.min(fr, 20)).add(new THREE.Vector3(0, 3, 0))} desde={H.LADERA - 4} hasta={H.RAPIDO + 6} color={C.rojo} texto="Más pesado: baja" dx={40} dy={260} />
      <Etiqueta3D f={f} punto={new THREE.Vector3(ORILLA + 6, 0.6, 6)} desde={H.HIERVE} hasta={H.COLCHON - 4} color={CALIENTE} texto="El agua hierve" dx={-40} dy={260} />
      <Etiqueta3D f={f} punto={new THREE.Vector3(ORILLA + 9, 0.8, 6)} desde={H.COLCHON - 4} hasta={H.DISCO - 8} color={BLANCO} texto="Colchón de vapor" dx={-40} dy={260} />
      <Etiqueta3D f={f} punto={b.clone().add(new THREE.Vector3(0, 2, 0))} desde={H.HUIR - 4} hasta={H.CONSEJO} color={C.verde} texto={f >= H.NADIE ? 'Nadie salió herido' : 'El bote huye'} dx={-40} dy={-240} />

      <Receta f={f} />
      <Velocidad f={f} />
      <Mesa f={f} />
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
