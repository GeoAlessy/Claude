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
// Holograma del video 13: la inercia. Un auto avanza a velocidad constante con una persona sobre el capó.
// A velocidad constante no hace falta fuerza para seguir con el auto; solo hay que aguantar el viento.
// El peligro está en los cambios: un frenazo (la persona sigue de largo) o una curva (quiere seguir derecho).
// Ejes (metros): el auto avanza hacia +x por la calle (z = 0). Un "auto fantasma" rojo en el carril de al lado
// muestra qué pasaría con un frenazo.
// =====================================================================
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const suave = Easing.inOut(Easing.cubic);
const BLANCO = '#E0F2FE';
const AUTO = '#94A3B8';
const AGENTE = '#FB923C';
const V = 0.35; // velocidad del auto (m por cuadro ≈ 38 km/h)
const CARRIL = 3.6;

// ---------- Estado ----------
// Posición del auto real: quieto, arranca y sigue a velocidad constante (con un zigzag suave al final)
const autoX = (f: number) => {
  if (f < H.ARRANCO) return 0;
  const t = f - H.ARRANCO;
  const arranque = Math.min(t, 20);
  return (V * arranque * arranque) / 40 + V * Math.max(0, t - 20);
};
const zig = (f: number) => {
  const k = interpolate(f, [H.CURVA - 10, H.CURVA + 6, H.CONSEJO, H.CONSEJO + 20], [0, 1, 1, 0], clamp);
  return Math.sin((f - H.CURVA) * 0.09) * 1.2 * k;
};
const rumbo = (f: number) => Math.atan2(zig(f + 1) - zig(f), V); // ángulo del auto en el zigzag
// El agente: de pie frente al auto, y al arrancar queda sobre el capó
const subida = (f: number) => interpolate(f, [H.ARRANCO - 8, H.ARRANCO + 8], [0, 1], {...clamp, easing: suave});
// Auto fantasma (lo que pasaría con un frenazo)
const fantasma = (f: number) => interpolate(f, [H.FRENAZO - 6, H.FRENAZO + 10, H.ZIGZAG, H.ZIGZAG + 20], [0, 1, 1, 0], clamp);
const frenoT = (f: number) => Math.max(0, f - H.FRENA);
const fantX = (f: number) => {
  // va igual que el real y frena en 12 cuadros
  const base = autoX(Math.min(f, H.FRENA));
  const t = Math.min(frenoT(f), 12);
  return base + V * t - (V / 24) * t * t;
};
const personaFantX = (f: number) => autoX(Math.min(f, H.FRENA)) + 7 * (1 - Math.exp(-frenoT(f) / 14)); // sigue de largo y cae delante
const caidaFant = (f: number) => interpolate(frenoT(f), [4, 22], [0, 1], clamp);

// ---------- Cámara ----------
type ClaveCam = [number, [number, number, number], [number, number, number]];
const VC = (x: number, y: number, z: number): [number, number, number] => [x, y, z];
const CAM: ClaveCam[] = [
  [0, VC(9, 6, 12), VC(1, 1, 0)],
  [H.AGENTE + 10, VC(8, 3.5, 9), VC(2.5, 1.2, 0)],
  [H.ARRANCO + 20, VC(6, 4, 10), VC(1, 1.2, 0)],
  [H.CONSTANTE, VC(3, 3, 10), VC(1, 1.2, 0)],
  [H.NINGUNA, VC(2, 4, 11), VC(1, 1.2, 0)],
  [H.VIENTO_W, VC(8, 3, 6), VC(1.5, 1.3, 0)],
  [H.MANOS, VC(4.5, 3, 3.2), VC(1.4, 1.3, 0)],
  [H.FRENAZO + 20, VC(5, 9, 26), VC(5, 0.8, -CARRIL)],
  [H.LARGO + 10, VC(5.5, 8, 26), VC(5.5, 0.8, -CARRIL)],
  [H.CURVA, VC(-6, 14, 2), VC(2, 0.5, 0)],
  [H.DERECHO + 20, VC(-6, 14, 2), VC(2, 0.5, 0)],
  [H.CONSEJO + 30, VC(8, 6, 12), VC(1, 1, 0)],
  [H.DUR, VC(-8, 7, 12), VC(1, 1, 0)],
];
export const FOV = 40;
export function camaraEn(f: number) {
  const fr = CAM.map((k) => k[0]);
  const p = new THREE.Vector3(...([0, 1, 2].map((i) => interpolate(f, fr, CAM.map((k) => k[1][i]), {...clamp, easing: suave})) as [number, number, number]));
  const t = new THREE.Vector3(...([0, 1, 2].map((i) => interpolate(f, fr, CAM.map((k) => k[2][i]), {...clamp, easing: suave})) as [number, number, number]));
  // sigue al auto (salvo en el frenazo, donde se queda mirando al auto fantasma)
  const w = interpolate(f, [H.FRENA - 2, H.FRENA, H.ZIGZAG, H.ZIGZAG + 20], [1, 0, 0, 1], clamp);
  const d = new THREE.Vector3(w * autoX(f) + (1 - w) * autoX(H.FRENA), 0, 0);
  p.add(d);
  t.add(d);
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
const RUEDA = (() => {
  const g = new THREE.CylinderGeometry(0.34, 0.34, 0.25, 16);
  g.rotateX(Math.PI / 2);
  return g;
})();
const Auto: React.FC<{color: string; op: number}> = ({color, op}) => (
  <group>
    <Holo geom={caja(4.4, 0.75, 1.8)} color={color} relleno={0.1 * op} linea={0.85 * op} position={[0, 0.72, 0]} />
    <Holo geom={caja(2.2, 0.7, 1.6)} color={color} relleno={0.08 * op} linea={0.75 * op} position={[-0.5, 1.45, 0]} />
    {/* parabrisas */}
    <Holo geom={caja(0.9, 0.05, 1.5)} color={BLANCO} relleno={0.15 * op} linea={0.6 * op} position={[0.95, 1.43, 0]} rotation={[0, 0, -0.9]} />
    {[-1.4, 1.4].map((x) => [-0.9, 0.9].map((z) => <Holo key={`${x}${z}`} geom={RUEDA} color={color} relleno={0.2 * op} linea={0.8 * op} angulo={30} position={[x, 0.34, z]} />))}
  </group>
);

const CUERPO = new THREE.CapsuleGeometry(0.24, 1.1, 4, 8);
const CABEZA = new THREE.SphereGeometry(0.16, 10, 8);
// Persona: de pie (0) o acostada sobre el capó (1)
const Persona: React.FC<{acostado: number; color: string; op?: number; manos?: number}> = ({acostado, color, op = 1, manos = 0}) => {
  const rot = (acostado * Math.PI) / 2.2;
  return (
    <group>
      <group rotation={[0, 0, rot]}>
        <Holo geom={CUERPO} color={color} relleno={0.2 * op} linea={0.85 * op} angulo={40} position={[0, 0.8, 0]} />
        <Holo geom={CABEZA} color={color} relleno={0.25 * op} linea={0.8 * op} angulo={40} position={[0, 1.6, 0]} />
      </group>
      {manos > 0 &&
        [-0.35, 0.35].map((z) => (
          <mesh key={z} position={[-0.75, 0.55, z]}>
            <sphereGeometry args={[0.14, 10, 8]} />
            <meshBasicMaterial color={C.verde} transparent opacity={manos} depthWrite={false} blending={THREE.AdditiveBlending} />
          </mesh>
        ))}
    </group>
  );
};

const Calle: React.FC = () => (
  <group>
    <Holo geom={caja(400, 0.04, 12)} color={AUTO} relleno={0.03} linea={0.2} position={[150, -0.02, -1.5]} />
    {Array.from({length: 90}, (_, k) => (
      <Holo key={k} geom={caja(2, 0.03, 0.12)} color={BLANCO} relleno={0.6} linea={0.5} position={[-20 + k * 5, 0.02, -CARRIL / 2]} />
    ))}
    {Array.from({length: 40}, (_, k) => (
      <Holo key={'p' + k} geom={caja(0.4, 6 + (k % 3) * 2, 0.4)} color={C.cian} relleno={0.05} linea={0.25} position={[-20 + k * 11, 3 + (k % 3), -9]} />
    ))}
  </group>
);

// Flechas de velocidad (iguales para el auto y para él)
const FLECHA = (() => {
  const g = new THREE.ConeGeometry(0.22, 0.5, 8);
  g.rotateZ(-Math.PI / 2);
  return g;
})();
const Flecha: React.FC<{p: [number, number, number]; largo: number; color: string; op: number}> = ({p, largo, color, op}) => (
  <group position={p}>
    <Holo geom={caja(largo, 0.08, 0.08)} color={color} relleno={0.8 * op} linea={op} position={[largo / 2, 0, 0]} />
    <mesh geometry={FLECHA} position={[largo + 0.2, 0, 0]}>
      <meshBasicMaterial color={color} transparent opacity={op} depthWrite={false} blending={THREE.AdditiveBlending} />
    </mesh>
  </group>
);

// Líneas de viento contra él
const Viento: React.FC<{f: number; x: number}> = ({f, x}) => {
  const op = interpolate(f, [H.VIENTO_W - 10, H.VIENTO_W + 6, H.AGARRE + 20, H.AGARRE + 40], [0, 1, 1, 0], clamp);
  if (op <= 0) return null;
  const out = [];
  for (let k = 0; k < 14; k++) {
    const t = ((f * 1.6 + k * 7) % 30) / 30;
    out.push(<Holo key={k} geom={caja(1.2, 0.04, 0.04)} color={C.cian} relleno={0.8 * op * (1 - t)} linea={op * (1 - t)} position={[x + 6 - t * 5, 1.2 + (k % 4) * 0.25, ((k % 5) - 2) * 0.3]} />);
  }
  return <group>{out}</group>;
};

const Escena: React.FC<{f: number}> = ({f}) => {
  const aparicion = interpolate(f, [0, 20], [0, 1], clamp);
  const x = autoX(f);
  const z = zig(f);
  const s = subida(f);
  const flechas = interpolate(f, [H.CONSTANTE - 10, H.CONSTANTE + 6, H.VIENTO, H.VIENTO + 15], [0, 1, 1, 0], clamp);
  const manos = interpolate(f, [H.MANOS - 6, H.MANOS + 6, H.FRENAZO, H.FRENAZO + 15], [0, 1, 1, 0.4], clamp);
  const fa = fantasma(f);
  // en el zigzag, el cuerpo "quiere seguir derecho": se inclina hacia afuera de la curva
  const inclina = -rumbo(f) * 1.6;
  const real = interpolate(f, [H.FRENAZO, H.FRENAZO + 10, H.ZIGZAG, H.ZIGZAG + 15], [1, 0.12, 0.12, 1], clamp);
  return (
    <group scale={[1, aparicion, 1]}>
      <gridHelper args={[400, 200, C.cian, C.cian]} position={[150, -0.05, 0]}>
        <lineBasicMaterial attach="material" color={C.cian} transparent opacity={0.03} />
      </gridHelper>
      <Calle />
      {/* auto real con el agente */}
      <group position={[x, 0, z]} rotation={[0, -rumbo(f), 0]}>
        <Auto color={AUTO} op={real} />
        <group position={[interpolate(s, [0, 1], [3.6, 1.55]), interpolate(s, [0, 1], [0, 1.1]), 0]} rotation={[inclina, 0, 0]}>
          <Persona acostado={s} color={AGENTE} manos={manos} op={real} />
        </group>
        <Flecha p={[2.6, 0.9, 1.1]} largo={2.2} color={C.cian} op={flechas} />
        <Flecha p={[2.0, 2.0, 0]} largo={2.2} color={C.ambar} op={flechas} />
      </group>
      <Viento f={f} x={x} />
      {/* auto fantasma: el frenazo */}
      {fa > 0 && (
        <group>
          <group position={[fantX(f), 0, -CARRIL]}>
            <Auto color={C.rojo} op={fa} />
          </group>
          <group position={[personaFantX(f) + 1.55, 1.1 - caidaFant(f) * 1.0, -CARRIL]} rotation={[0, 0, -caidaFant(f) * 0.8]}>
            <Persona acostado={1} color={C.rojo} op={fa} />
          </group>
        </group>
      )}
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

// Fuerza necesaria a velocidad constante
const Fuerza: React.FC<{f: number}> = ({f}) => {
  const op = interpolate(f, [H.FUERZA + 4, H.FUERZA + 18, H.VIENTO, H.VIENTO + 14], [0, 1, 1, 0], clamp);
  if (op <= 0) return null;
  return (
    <Panel op={op} color={C.verde}>
      <Titulo color={C.verde}>VELOCIDAD CONSTANTE</Titulo>
      <div style={{fontFamily: TITULAR, fontWeight: 900, fontSize: 56, color: C.blanco, marginTop: 8}}>
        Fuerza para seguir: <span style={{color: C.verde}}>0</span>
      </div>
      <div style={{fontFamily: TITULAR, fontWeight: 900, fontSize: 40, color: C.ambar, marginTop: 10, opacity: interpolate(f, [H.CAMBIAR - 6, H.CAMBIAR + 4], [0, 1], clamp)}}>
        Solo hace falta para cambiar
      </div>
    </Panel>
  );
};

// El viento contra su peso
const VientoPanel: React.FC<{f: number}> = ({f}) => {
  const op = interpolate(f, [H.VIENTO + 4, H.VIENTO + 18, H.AGARRE + 30, H.AGARRE + 44], [0, 1, 1, 0], clamp);
  if (op <= 0) return null;
  const k = interpolate(f, [H.KILOS - 10, H.KILOS + 10], [0, 1], clamp);
  return (
    <Panel op={op} color={C.cian}>
      <Titulo color={C.cian}>A 40 KM/H, EN LÍNEA RECTA</Titulo>
      {fila('Empuje del viento', 0.04 * k + 0.005, '≈ 3 kg', C.cian)}
      {fila('Su propio peso', 0.95, '≈ 70 kg', AGENTE)}
    </Panel>
  );
};

// Consejo
const Consejo: React.FC<{f: number}> = ({f}) => {
  const op = interpolate(f, [H.CONSEJO + 5, H.CONSEJO + 20, H.FIN, H.FIN + 15], [0, 1, 1, 0], clamp);
  if (op <= 0) return null;
  return (
    <Panel op={op} color={C.rojo}>
      <Titulo color={C.rojo}>NUNCA</Titulo>
      <div style={{fontFamily: TITULAR, fontWeight: 900, fontSize: 50, color: C.blanco, marginTop: 8, lineHeight: 1.15}}>
        te subas a un auto en marcha
        <br />
        <span style={{color: C.ambar}}>ni arranques con alguien encima</span>
      </div>
      <div style={{fontFamily: TITULAR, fontWeight: 900, fontSize: 44, color: C.rojo, marginTop: 12, opacity: interpolate(f, [H.FRENAZO2 - 8, H.FRENAZO2 + 4], [0.2, 1], clamp)}}>
        Basta un solo frenazo
      </div>
    </Panel>
  );
};

export const Holograma: React.FC = () => {
  const f = useCurrentFrame();
  const entrada = interpolate(f, [0, 12], [0, 1], clamp);
  const salida = interpolate(f, [H.DUR - 25, H.DUR - 5], [1, 0], clamp);
  const barrido = interpolate(f, [0, 22], [-100, 2000], clamp);
  const x = autoX(f);
  return (
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, #0b2234 0%, #040b14 60%, #01040a 100%)', opacity: Math.min(entrada, salida)}}>
      <ThreeCanvas width={1080} height={1920} camera={{fov: FOV, near: 0.1, far: 2000, position: [0, 10, 20]}}>
        <Camara f={f} />
        <Escena f={f} />
      </ThreeCanvas>

      <Etiqueta3D f={f} punto={new THREE.Vector3(3.6, 1.8, 0)} desde={H.AGENTE - 4} hasta={H.ARRANCO} color={AGENTE} texto="Agente de tránsito" dx={-40} dy={-240} />
      <Etiqueta3D f={f} punto={new THREE.Vector3(x + 3.6, 0.9, 1.1)} desde={H.CONSTANTE - 4} hasta={H.VELOCIDAD + 10} color={C.cian} texto="Auto: 40 km/h" dx={-40} dy={240} />
      <Etiqueta3D f={f} punto={new THREE.Vector3(x + 3.2, 2.0, 0)} desde={H.VELOCIDAD - 4} hasta={H.FUERZA + 10} color={C.ambar} texto="Él: 40 km/h" dx={-40} dy={-240} />
      <Etiqueta3D f={f} punto={new THREE.Vector3(x + 0.8, 1.6, 0.35)} desde={H.MANOS - 4} hasta={H.ROCE + 8} color={C.verde} texto="Manos en el limpiaparabrisas" dx={-40} dy={-240} />
      <Etiqueta3D f={f} punto={new THREE.Vector3(x + 1.6, 1.2, 0)} desde={H.ROCE - 4} hasta={H.FRENAZO} color={C.verde} texto="Roce con el capó" dx={-40} dy={240} />
      <Etiqueta3D f={f} punto={new THREE.Vector3(fantX(f), 1.5, -CARRIL)} desde={H.FRENA - 4} hasta={H.DETIENE + 10} color={C.rojo} texto="Si frena de golpe…" dx={-40} dy={-240} />
      <Etiqueta3D f={f} punto={new THREE.Vector3(personaFantX(f) + 1.6, 1, -CARRIL)} desde={H.LARGO - 6} hasta={H.ZIGZAG + 10} color={C.rojo} texto="…él sigue de largo" dx={40} dy={240} />
      <Etiqueta3D f={f} punto={new THREE.Vector3(x + 1.6, 1.2, zig(f))} desde={H.DERECHO - 6} hasta={H.CONSEJO} color={C.ambar} texto="Su cuerpo quiere seguir derecho" dx={-40} dy={-240} />

      <Fuerza f={f} />
      <VientoPanel f={f} />
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
