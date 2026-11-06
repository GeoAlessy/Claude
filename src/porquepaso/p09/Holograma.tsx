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
// Holograma del video 09: camioneta + tráiler en una entrada de grava en bajada.
// En Park, un perno traba la caja → solo las ruedas de atrás. Las del frente y las 4 del tráiler giran libres.
// Al subir el tractor crece el empuje cuesta abajo; las dos ruedas trabadas patinan en la grava y todo se va.
// Ejes (metros, en el plano de la entrada): la camioneta mira hacia −x (cuesta abajo), el tráiler se extiende hacia +x.
// =====================================================================
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const suave = Easing.inOut(Easing.cubic);
const BLANCO = '#E0F2FE';
const TRACTOR = '#60A5FA';
const GRIS = '#94A3B8';
const GRAVA = '#CBD5E1';
const PEND = 0.1; // ~6° de bajada (exagerado un poco para que se lea)

// ---------- Estado ----------
// Inclinación del suelo: al final (consejo) se vuelve plano
const pend = (f: number) => interpolate(f, [H.PLANO - 12, H.PLANO + 18], [PEND, 0], {...clamp, easing: suave});
// Cuánto rodó el equipo (negativo = cuesta abajo)
const rodado = (f: number) => {
  const t = Math.max(0, f - H.GRAVA_W + 6);
  return -Math.min(70, 0.0022 * t * t);
};
// Posición del tractor (su centro, sobre el suelo) y altura según la rampa
const tractorX = (f: number) => interpolate(f, [H.SUBIR - 12, H.TONELADA + 18], [12, 4.4], {...clamp, easing: suave});
const altura = (x: number) => (x <= 8.5 ? 0.72 : x >= 10.5 ? 0 : (0.72 * (10.5 - x)) / 2);
// Paso de coordenadas del plano inclinado al mundo
const mundo = (f: number, x: number, y: number, z: number) => {
  const a = pend(f);
  return new THREE.Vector3(x * Math.cos(a) - y * Math.sin(a), x * Math.sin(a) + y * Math.cos(a), z);
};

// ---------- Cámara ----------
type ClaveCam = [number, [number, number, number], [number, number, number]];
const V = (x: number, y: number, z: number): [number, number, number] => [x, y, z];
const CAM: ClaveCam[] = [
  [0, V(18, 8, 12), V(1, 1, 0)],
  [H.PUESTO + 10, V(15, 6.5, 11), V(-1, 1, 0)],
  [H.PERNO + 22, V(-1.8, 3.0, 17), V(-2.6, 2.3, 3.4)],
  [H.CAJA + 10, V(-2.0, 2.9, 16), V(-2.7, 2.2, 3.4)],
  [H.ATRAS + 22, V(3.5, 3.6, 9), V(-2.4, 0.7, 0)],
  [H.TRABA + 10, V(2.6, 2.6, 7.6), V(-1.8, 0.5, 0.6)],
  [H.LIBRES + 22, V(15, 7, 14), V(1, 0.6, 0)],
  [H.GIRAN + 10, V(13, 6, 16), V(0.5, 0.6, 0)],
  [H.BAJADA + 22, V(-2.4, 1.6, 21), V(-3.0, 0.3, 0)],
  [H.ABAJO, V(-3.2, 2.0, 21.5), V(-3.4, 0.2, 0)],
  [H.TRACTOR + 22, V(21, 8, 15), V(5, 1.2, 0)],
  [H.GOLPE + 6, V(19, 7, 14), V(3, 1, 0)],
  [H.GRAVA + 18, V(4.5, 2.6, 8.5), V(-1.3, 0.5, 0.5)],
  [H.PATINAN, V(4.2, 2.4, 8), V(-1.3, 0.5, 0.5)],
  [H.VA + 6, V(14, 6, 13), V(-6, 0.5, 0)],
  [H.CONSEJO + 22, V(19, 9, 16), V(1.5, 0.8, 0)],
  [H.FRENO + 4, V(17, 7, 14), V(1, 0.8, 0)],
  [H.CALZAS + 12, V(13, 3.5, 13), V(5, 0.5, 0)],
  [H.DUR, V(16, 10, -15), V(2, 1, 0)],
];
export const FOV = 40;
// La cámara sigue al equipo mientras rueda (y después lo deja ir)
const seguir = (f: number) => interpolate(f, [H.GRAVA, H.PATINAN, H.VA + 10, H.CONSEJO + 10], [1, 1, 0.55, 0], clamp);
export function camaraEn(f: number) {
  const fr = CAM.map((k) => k[0]);
  const p = new THREE.Vector3(...([0, 1, 2].map((i) => interpolate(f, fr, CAM.map((k) => k[1][i]), {...clamp, easing: suave})) as [number, number, number]));
  const t = new THREE.Vector3(...([0, 1, 2].map((i) => interpolate(f, fr, CAM.map((k) => k[2][i]), {...clamp, easing: suave})) as [number, number, number]));
  const s = rodado(f) * seguir(f);
  const d = mundo(f, s, 0, 0);
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
const cilindro = new Map<string, THREE.CylinderGeometry>();
function rueda(r: number, ancho: number) {
  const k = `${r}|${ancho}`;
  if (!cilindro.has(k)) {
    const g = new THREE.CylinderGeometry(r, r, ancho, 20);
    g.rotateX(Math.PI / 2);
    cilindro.set(k, g);
  }
  return cilindro.get(k)!;
}

const Rueda: React.FC<{x: number; y?: number; z: number; r: number; giro: number; color: string; op?: number; brillo?: number}> = ({x, y, z, r, giro, color, op = 1, brillo = 0}) => (
  <group position={[x, y ?? r, z]} rotation={[0, 0, giro]}>
    <Holo geom={rueda(r, 0.3)} color={color} relleno={(0.1 + 0.35 * brillo) * op} linea={0.9 * op} angulo={30} />
    {/* rayos para que se note si gira o no */}
    <Holo geom={caja(r * 1.7, 0.07, 0.32)} color={color} relleno={0.3 * op} linea={0.7 * op} />
    <Holo geom={caja(0.07, r * 1.7, 0.32)} color={color} relleno={0.3 * op} linea={0.7 * op} />
  </group>
);

// Colores de las ruedas según lo que se está explicando
type Estado = {op: number; trasera: string; libre: string; brilloT: number; brilloL: number; giroLibre: number; s: number; fantasma: boolean};

const Camioneta: React.FC<{e: Estado; transp: number}> = ({e, transp}) => {
  const o = e.op * transp;
  const col = e.fantasma ? C.verde : BLANCO;
  return (
    <group>
      <Holo geom={caja(2.4, 0.55, 2.0)} color={col} relleno={0.08 * o} linea={0.8 * o} position={[-1.2, 1.12, 0]} />
      <Holo geom={caja(1.7, 1.2, 2.0)} color={col} relleno={0.08 * o} linea={0.85 * o} position={[-3.25, 1.45, 0]} />
      <Holo geom={caja(1.1, 0.7, 1.9)} color={col} relleno={0.06 * o} linea={0.5 * o} position={[-3.2, 1.75, 0]} />
      <Holo geom={caja(1.9, 0.6, 2.0)} color={col} relleno={0.08 * o} linea={0.8 * o} position={[-5.05, 1.15, 0]} />
      <Holo geom={caja(6, 0.22, 1.7)} color={col} relleno={0.06 * o} linea={0.5 * o} position={[-3, 0.72, 0]} />
      {/* enganche */}
      <Holo geom={caja(1.2, 0.12, 0.14)} color={GRIS} relleno={0.3 * e.op} linea={0.8 * e.op} position={[0.5, 0.55, 0]} />
      {[-0.98, 0.98].map((z) => (
        <React.Fragment key={z}>
          <Rueda x={-4.9} z={z} r={0.42} giro={e.giroLibre - e.s / 0.42} color={e.libre} op={e.op} brillo={e.brilloL} />
          <Rueda x={-1.3} z={z} r={0.42} giro={0} color={e.trasera} op={e.op} brillo={e.brilloT} />
        </React.Fragment>
      ))}
    </group>
  );
};

// Caja de cambios y cardán (se ven cuando la camioneta se vuelve transparente)
const Transmision: React.FC<{f: number}> = ({f}) => {
  const op = interpolate(f, [H.PERNO, H.PERNO + 14, H.LIBRES, H.LIBRES + 20], [0, 1, 1, 0.25], clamp);
  if (op <= 0) return null;
  const verde = interpolate(f, [H.ATRAS + 5, H.TRABA], [0, 1], clamp);
  const col = verde > 0.5 ? C.verde : C.cian;
  return (
    <group>
      <Holo geom={caja(0.9, 0.42, 0.55)} color={C.ambar} relleno={0.25 * op} linea={op} position={[-3.4, 0.62, 0]} />
      <Holo geom={rueda(0.07, 1)} color={col} relleno={0.6 * op} linea={op} position={[-2.15, 0.5, 0]} rotation={[0, Math.PI / 2, 0]} scale={[1, 1, 1.75]} />
      <Holo geom={caja(0.16, 0.16, 1.95)} color={col} relleno={0.5 * op} linea={op} position={[-1.3, 0.42, 0]} />
      {/* pulsos del perno hacia las ruedas de atrás */}
      {verde > 0 &&
        [0, 1, 2].map((k) => {
          const t = ((f - H.ATRAS + k * 10) % 30) / 30;
          return (
            <mesh key={k} position={[-3 + t * 1.7, 0.5, 0]}>
              <sphereGeometry args={[0.09, 8, 6]} />
              <meshBasicMaterial color={C.verde} transparent opacity={op * (1 - t)} depthWrite={false} blending={THREE.AdditiveBlending} />
            </mesh>
          );
        })}
    </group>
  );
};

const Trailer: React.FC<{e: Estado}> = ({e}) => {
  const o = e.op;
  const col = e.fantasma ? C.verde : GRIS;
  return (
    <group>
      <Holo geom={caja(7, 0.2, 2.1)} color={col} relleno={0.1 * o} linea={0.85 * o} position={[5, 0.62, 0]} />
      {/* lanza en A */}
      {[-0.5, 0.5].map((z) => (
        <Holo key={z} geom={caja(1.5, 0.12, 0.12)} color={col} relleno={0.2 * o} linea={0.8 * o} position={[0.9 + 0.75, 0.58, z * 0.6]} rotation={[0, z * 0.55, 0]} />
      ))}
      {/* barandas */}
      {[-1.02, 1.02].map((z) => (
        <Holo key={z} geom={caja(7, 0.08, 0.08)} color={col} relleno={0.2 * o} linea={0.6 * o} position={[5, 0.95, z]} />
      ))}
      {/* rampas */}
      {[-0.62, 0.62].map((z) => (
        <Holo key={z} geom={caja(2.15, 0.06, 0.45)} color={col} relleno={0.15 * o} linea={0.7 * o} position={[9.5, 0.36, z]} rotation={[0, 0, -0.34]} />
      ))}
      {[5, 6].map((x) =>
        [-1.15, 1.15].map((z) => <Rueda key={`${x}${z}`} x={x} z={z} r={0.36} giro={e.giroLibre - e.s / 0.36} color={e.libre} op={o} brillo={e.brilloL} />)
      )}
    </group>
  );
};

const Tractor: React.FC<{op: number; color?: string}> = ({op, color = TRACTOR}) => (
  <group>
    <Holo geom={caja(1.3, 0.7, 0.8)} color={color} relleno={0.12 * op} linea={0.85 * op} position={[-0.55, 0.95, 0]} />
    <Holo geom={caja(0.9, 0.55, 1.4)} color={color} relleno={0.12 * op} linea={0.85 * op} position={[0.6, 1.05, 0]} />
    {/* arco antivuelco */}
    {[-0.6, 0.6].map((z) => (
      <Holo key={z} geom={caja(0.08, 1.5, 0.08)} color={color} relleno={0.3 * op} linea={0.8 * op} position={[1.0, 2.0, z]} />
    ))}
    <Holo geom={caja(0.08, 0.08, 1.28)} color={color} relleno={0.3 * op} linea={0.8 * op} position={[1.0, 2.75, 0]} />
    {/* cargador frontal */}
    {[-0.55, 0.55].map((z) => (
      <Holo key={z} geom={caja(2.2, 0.12, 0.12)} color={color} relleno={0.3 * op} linea={0.8 * op} position={[-0.9, 1.25, z]} rotation={[0, 0, 0.35]} />
    ))}
    <Holo geom={caja(0.45, 0.55, 1.5)} color={color} relleno={0.15 * op} linea={0.85 * op} position={[-2.05, 0.62, 0]} />
    {/* retroexcavadora */}
    <Holo geom={caja(1.5, 0.14, 0.14)} color={color} relleno={0.3 * op} linea={0.8 * op} position={[1.6, 1.75, 0]} rotation={[0, 0, 0.7]} />
    <Holo geom={caja(0.14, 1.2, 0.14)} color={color} relleno={0.3 * op} linea={0.8 * op} position={[2.15, 1.65, 0]} rotation={[0, 0, -0.25]} />
    <Holo geom={caja(0.4, 0.45, 0.5)} color={color} relleno={0.15 * op} linea={0.8 * op} position={[2.3, 0.95, 0]} />
    {[-0.75, 0.75].map((z) => (
      <React.Fragment key={z}>
        <Rueda x={0.7} z={z} r={0.6} giro={0} color={color} op={op} />
        <Rueda x={-1.0} z={z * 0.85} r={0.36} giro={0} color={color} op={op} />
      </React.Fragment>
    ))}
  </group>
);

const PERSONA = new THREE.CapsuleGeometry(0.22, 0.75, 4, 8);
const CABEZA = new THREE.SphereGeometry(0.17, 10, 8);
const Persona: React.FC<{p: [number, number, number]}> = ({p}) => (
  <group position={p}>
    <Holo geom={PERSONA} color={C.ambar} relleno={0.15} linea={0.7} angulo={40} position={[0, 0.6, 0]} />
    <Holo geom={CABEZA} color={C.ambar} relleno={0.2} linea={0.6} angulo={40} position={[0, 1.2, 0]} />
  </group>
);

// Rueda dentada + perno (la "lupa" junto a la camioneta, fuera del plano inclinado)
const LUPA = new THREE.Vector3(-2.8, 2.25, 3.4);
const ARO = new THREE.TorusGeometry(2.2, 0.03, 6, 64);
const DIENTE_R = 1.0;
const Perno: React.FC<{f: number}> = ({f}) => {
  const op = interpolate(f, [H.PERNO + 4, H.PERNO + 18, H.ATRAS, H.ATRAS + 16], [0, 1, 1, 0], clamp);
  if (op <= 0) return null;
  const phi = interpolate(f, [H.PERNO, H.PERNO_W + 2], [-1.4, 0], {...clamp, easing: Easing.out(Easing.quad)});
  const cae = interpolate(f, [H.PERNO_W - 2, H.PERNO_W + 5], [0, 1], {...clamp, easing: Easing.in(Easing.quad)});
  const trabado = cae >= 1;
  const colPerno = trabado ? C.verde : C.ambar;
  const yPerno = interpolate(cae, [0, 1], [DIENTE_R + 1.05, DIENTE_R + 0.3]);
  return (
    <group position={LUPA.toArray()}>
      {/* marco de la lupa */}
      <mesh position={[0.2, 0.3, -0.3]}>
        <circleGeometry args={[2.2, 48]} />
        <meshBasicMaterial color={'#0B2234'} transparent opacity={0.75 * op} depthWrite={false} />
      </mesh>
      <Holo geom={ARO} color={C.cian} relleno={0.6 * op} linea={0} position={[0.2, 0.3, -0.3]} />
      <group rotation={[0, 0, phi]}>
        <Holo geom={rueda(DIENTE_R - 0.12, 0.3)} color={BLANCO} relleno={0.12 * op} linea={0.8 * op} angulo={30} />
        <Holo geom={rueda(0.25, 0.34)} color={BLANCO} relleno={0.3 * op} linea={0.7 * op} angulo={30} />
        {Array.from({length: 12}, (_, k) => {
          const a = ((15 + k * 30) * Math.PI) / 180;
          return <Holo key={k} geom={caja(0.26, 0.24, 0.3)} color={BLANCO} relleno={0.2 * op} linea={0.8 * op} position={[Math.cos(a) * DIENTE_R, Math.sin(a) * DIENTE_R, 0]} rotation={[0, 0, a]} />;
        })}
      </group>
      {/* guía del perno */}
      {[-0.2, 0.2].map((x) => (
        <Holo key={x} geom={caja(0.06, 0.9, 0.34)} color={GRIS} relleno={0.2 * op} linea={0.6 * op} position={[x, DIENTE_R + 1.15, 0]} />
      ))}
      <Holo geom={caja(0.22, 1.0, 0.3)} color={colPerno} relleno={(trabado ? 0.55 : 0.3) * op} linea={op} position={[0, yPerno, 0]} />
    </group>
  );
};

// Flechas del peso cuesta abajo (en el plano inclinado)
const FLECHA = (() => {
  // chevrón plano apoyado en el suelo, apunta hacia −x (cuesta abajo)
  const sh = new THREE.Shape();
  sh.moveTo(-0.45, 0);
  sh.lineTo(0.05, 0.5);
  sh.lineTo(0.35, 0.5);
  sh.lineTo(-0.15, 0);
  sh.lineTo(0.35, -0.5);
  sh.lineTo(0.05, -0.5);
  sh.closePath();
  const g = new THREE.ShapeGeometry(sh);
  g.rotateX(-Math.PI / 2);
  return g;
})();
const Empuje: React.FC<{f: number; s: number}> = ({f, s}) => {
  const op = interpolate(f, [H.PESO - 8, H.PESO + 8, H.VA, H.VA + 20], [0, 1, 1, 0], clamp);
  if (op <= 0) return null;
  const fuerza = interpolate(f, [H.SUBIR, H.GOLPE], [0.6, 1], clamp);
  const out = [];
  for (let k = 0; k < 10; k++) {
    const t = ((f * (0.8 + 0.6 * fuerza) + k * 9) % 45) / 45;
    out.push(
      <mesh key={k} geometry={FLECHA} position={[s + 10 - t * 17, 0.06, k % 2 ? 1.9 : -1.9]} scale={0.9 + 0.5 * fuerza}>
        <meshBasicMaterial color={fuerza > 0.9 ? C.rojo : C.ambar} transparent opacity={op * Math.sin(t * Math.PI)} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
    );
  }
  return <group>{out}</group>;
};

// Grava que saltan las ruedas trabadas al patinar
const PIEDRA = new THREE.BoxGeometry(0.08, 0.08, 0.08);
const Piedras: React.FC<{f: number; s: number}> = ({f, s}) => {
  const op = interpolate(f, [H.PATINAN - 20, H.PATINAN - 5, H.CONSEJO, H.CONSEJO + 20], [0, 1, 1, 0], clamp);
  if (op <= 0) return null;
  const out = [];
  for (const z of [-0.98, 0.98]) {
    for (let k = 0; k < 18; k++) {
      const t = ((f + k * 2.7) % 18) / 18;
      out.push(
        <mesh key={`${z}${k}`} geometry={PIEDRA} position={[s - 1.3 + 0.3 + t * 1.6, Math.sin(t * Math.PI) * (0.4 + (k % 3) * 0.2), z + ((k % 5) - 2) * 0.08]}>
          <meshBasicMaterial color={GRAVA} transparent opacity={op * (1 - t)} depthWrite={false} blending={THREE.AdditiveBlending} />
        </mesh>
      );
    }
  }
  return <group>{out}</group>;
};

// Suelo: entrada de grava en bajada + pasto a los lados
const PUNTOS_GRAVA: [number, number][] = [];
for (let i = 0; i < 260; i++) PUNTOS_GRAVA.push([((i * 37) % 200) / 200 * 120 - 90, (((i * 53) % 100) / 100 - 0.5) * 5.6]);
const Suelo: React.FC = () => (
  <group>
    <Holo geom={caja(140, 0.04, 6)} color={GRAVA} relleno={0.05} linea={0.35} position={[-20, -0.02, 0]} />
    {[-1, 1].map((s) => (
      <Holo key={s} geom={caja(140, 0.04, 30)} color={C.verde} relleno={0.025} linea={0.12} position={[-20, -0.04, s * 18]} />
    ))}
    {PUNTOS_GRAVA.map(([x, z], i) => (
      <mesh key={i} geometry={PIEDRA} position={[x, 0.02, z]}>
        <meshBasicMaterial color={GRAVA} transparent opacity={0.35} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
    ))}
  </group>
);

// Calzas amarillas en las ruedas del tráiler (consejo)
const CALZA = (() => {
  const s = new THREE.Shape();
  s.moveTo(0, 0);
  s.lineTo(0.42, 0);
  s.lineTo(0, 0.3);
  s.closePath();
  const g = new THREE.ExtrudeGeometry(s, {depth: 0.26, bevelEnabled: false});
  g.translate(0, 0, -0.13);
  return g;
})();
const Calzas: React.FC<{f: number}> = ({f}) => {
  const k = interpolate(f, [H.CALZAS - 6, H.CALZAS + 10], [0, 1], {...clamp, easing: Easing.out(Easing.back(2))});
  if (k <= 0) return null;
  const out = [];
  for (const z of [-1.15, 1.15]) {
    out.push(<Holo key={'a' + z} geom={CALZA} color={C.ambar} relleno={0.5} linea={1} position={[6.36, 0, z]} scale={[k, k, 1]} />);
    out.push(<Holo key={'b' + z} geom={CALZA} color={C.ambar} relleno={0.5} linea={1} position={[4.64, 0, z]} rotation={[0, Math.PI, 0]} scale={[k, k, 1]} />);
  }
  return <group>{out}</group>;
};

// Referencia horizontal: muestra que la entrada va en bajada
const Horizonte: React.FC<{f: number}> = ({f}) => {
  const op = interpolate(f, [H.BAJA - 10, H.BAJA + 6, H.TRACTOR, H.TRACTOR + 15], [0, 1, 1, 0], clamp);
  if (op <= 0) return null;
  const y = 4 * Math.sin(PEND);
  const out = [];
  for (let k = 0; k < 16; k++) {
    out.push(<Holo key={k} geom={caja(0.45, 0.05, 0.05)} color={BLANCO} relleno={0.6 * op} linea={0.8 * op} position={[4 - k * 0.75 - 0.3, y, 3.2]} />);
  }
  out.push(<Holo key="p" geom={caja(12, 0.06, 0.06)} color={C.ambar} relleno={0.8 * op} linea={op} position={[-2, -2 * Math.sin(PEND), 3.2]} rotation={[0, 0, PEND]} />);
  return <group>{out}</group>;
};

const Escena: React.FC<{f: number}> = ({f}) => {
  const aparicion = interpolate(f, [0, 20], [0, 1], clamp);
  const s = rodado(f);
  const tx = tractorX(f);
  const hf = altura(tx - 1.0);
  const hr = altura(tx + 0.7);
  const ty = (hf + hr) / 2;
  const tPitch = Math.atan2(hr - hf, 1.7);
  // la camioneta se vuelve transparente para ver la caja de cambios
  const transp = interpolate(f, [H.PERNO, H.PERNO + 14, H.LIBRES, H.LIBRES + 20], [1, 0.3, 0.3, 1], clamp);
  const trabada = interpolate(f, [H.ATRAS + 5, H.TRABA + 4], [0, 1], clamp);
  const patina = f >= H.PATINAN - 10;
  const libres = interpolate(f, [H.FRENTE - 6, H.FRENTE + 6, H.BAJADA + 10, H.BAJADA + 30], [0, 1, 1, 0], clamp);
  const giroLibre = f >= H.FRENTE - 6 ? Math.max(0, Math.min(f, H.BAJADA + 30) - H.FRENTE + 6) * 0.06 : 0;
  const opEquipo = interpolate(f, [H.CONSEJO, H.CONSEJO + 30], [1, 0.25], clamp);
  const e: Estado = {
    op: opEquipo,
    trasera: patina ? C.rojo : trabada > 0.5 ? C.verde : BLANCO,
    libre: libres > 0.5 ? C.ambar : BLANCO,
    brilloT: patina ? 1 : trabada,
    brilloL: libres,
    giroLibre,
    s,
    fantasma: false,
  };
  // el equipo "bien estacionado" del consejo (verde, en su lugar original)
  const fant = interpolate(f, [H.CONSEJO + 4, H.CONSEJO + 24], [0, 1], clamp);
  const eF: Estado = {op: fant, trasera: C.verde, libre: C.verde, brilloT: interpolate(f, [H.FRENO - 4, H.FRENO + 6], [0, 1], clamp), brilloL: 0, giroLibre: 0, s: 0, fantasma: true};
  // el señor: en el asiento; al patinar salta y corre detrás
  const salta = interpolate(f, [H.PATINAN + 2, H.PATINAN + 14], [0, 1], {...clamp, easing: suave});
  const corre = Math.max(0, f - H.PATINAN - 14);
  const asiento: [number, number, number] = [s + tx + 0.55, 0.72 + 0.75, 0];
  const suelo: [number, number, number] = [s * 0.25 + tx + 0.5 - corre * 0.06, 0, 2.2];
  const persona: [number, number, number] = [
    asiento[0] + (suelo[0] - asiento[0]) * salta,
    asiento[1] + (suelo[1] - asiento[1]) * salta + Math.sin(salta * Math.PI) * 0.6,
    asiento[2] + (suelo[2] - asiento[2]) * salta,
  ];
  const enAsiento = f < H.PATINAN + 2;
  return (
    <group scale={[1, aparicion, 1]}>
      <gridHelper args={[300, 150, C.cian, C.cian]} position={[0, -0.5, 0]}>
        <lineBasicMaterial attach="material" color={C.cian} transparent opacity={0.04} />
      </gridHelper>
      <group rotation={[0, 0, pend(f)]}>
        <Suelo />
        <group position={[s, 0, 0]}>
          <Camioneta e={e} transp={transp} />
          <Transmision f={f} />
          <Trailer e={e} />
        </group>
        <group position={[s * (tx < 8.6 ? 1 : 0) + tx, ty, 0]} rotation={[0, 0, tPitch]}>
          <Tractor op={opEquipo} />
        </group>
        {enAsiento ? <Persona p={[s * (tx < 8.6 ? 1 : 0) + tx + 0.55, ty + 0.75, 0]} /> : <Persona p={persona} />}
        <Empuje f={f} s={s} />
        <Piedras f={f} s={s} />
        {fant > 0 && (
          <group>
            <Camioneta e={eF} transp={1} />
            <Trailer e={eF} />
            <group position={[4.4, 0.72, 0]}>
              <Tractor op={fant} color={C.verde} />
            </group>
            <Calzas f={f} />
          </group>
        )}
      </group>
      <Perno f={f} />
      <Horizonte f={f} />
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

// Cuántas ruedas frenan: 2 de 8
const Ruedas: React.FC<{f: number}> = ({f}) => {
  const op = interpolate(f, [H.LIBRES + 4, H.LIBRES + 18, H.BAJADA, H.BAJADA + 14], [0, 1, 1, 0], clamp);
  if (op <= 0) return null;
  const icono = (frena: boolean, i: number, desde: number) => {
    const k = interpolate(f, [desde + i * 2 - 4, desde + i * 2 + 4], [0, 1], clamp);
    const col = frena ? C.verde : C.ambar;
    return (
      <svg key={i} width={84} height={84} viewBox="0 0 84 84" style={{opacity: 0.25 + 0.75 * k}}>
        <circle cx={42} cy={42} r={34} fill={`${col}33`} stroke={col} strokeWidth={5} />
        <g transform={`rotate(${frena ? 0 : (f - H.LIBRES) * 6} 42 42)`} stroke={col} strokeWidth={5}>
          <line x1={14} y1={42} x2={70} y2={42} />
          <line x1={42} y1={14} x2={42} y2={70} />
        </g>
      </svg>
    );
  };
  return (
    <Panel op={op} color={C.ambar}>
      <Titulo color={C.ambar}>RUEDAS QUE FRENAN EN PARK</Titulo>
      <div style={{display: 'flex', alignItems: 'center', gap: 14, marginTop: 20}}>
        <div style={{fontFamily: MONO, fontWeight: 700, fontSize: 22, color: C.blanco, width: 150}}>CAMIONETA</div>
        {[false, false, true, true].map((fr, i) => icono(fr, i, fr ? H.LIBRES + 4 : H.FRENTE))}
      </div>
      <div style={{display: 'flex', alignItems: 'center', gap: 14, marginTop: 14}}>
        <div style={{fontFamily: MONO, fontWeight: 700, fontSize: 22, color: C.blanco, width: 150}}>TRÁILER</div>
        {[0, 1, 2, 3].map((i) => icono(false, i, H.CUATRO))}
      </div>
      <div style={{marginTop: 18, fontFamily: TITULAR, fontWeight: 900, fontSize: 50, color: C.blanco, opacity: interpolate(f, [H.GIRAN - 4, H.GIRAN + 6], [0, 1], clamp)}}>
        Solo <span style={{color: C.verde}}>2 de 8</span> frenan
      </div>
    </Panel>
  );
};

// Empuje cuesta abajo contra lo que aguantan las ruedas trabadas
const Balanza: React.FC<{f: number}> = ({f}) => {
  const op = interpolate(f, [H.TRACTOR + 4, H.TRACTOR + 18, H.VA + 4, H.VA + 18], [0, 1, 1, 0], clamp);
  if (op <= 0) return null;
  const empuje = interpolate(f, [H.SUBIR - 6, H.TONELADA + 18, H.GOLPE + 4], [0.42, 0.6, 0.86], clamp);
  const AGUANTE = 0.64;
  const gana = empuje > AGUANTE;
  const colE = gana ? C.rojo : C.ambar;
  const fila = (t: string, w: number, valor: string, color: string, marcaW?: number) => (
    <div style={{marginTop: 18}}>
      <div style={{display: 'flex', justifyContent: 'space-between', fontFamily: MONO, fontWeight: 700, fontSize: 28, color: C.blanco}}>
        <span>{t}</span>
        <span style={{color}}>{valor}</span>
      </div>
      <div style={{position: 'relative', height: 22, marginTop: 8, borderRadius: 11, background: 'rgba(255,255,255,0.1)'}}>
        <div style={{width: `${w * 100}%`, height: '100%', borderRadius: 11, background: color, boxShadow: `0 0 16px ${color}`}} />
        {marcaW !== undefined && <div style={{position: 'absolute', left: `${marcaW * 100}%`, top: -8, width: 4, height: 38, background: C.verde}} />}
      </div>
    </div>
  );
  return (
    <Panel op={op} color={colE}>
      <Titulo color={colE}>{gana ? '¡GANA LA BAJADA!' : 'EMPUJE CUESTA ABAJO'}</Titulo>
      {fila(f >= H.SUBIR ? 'Camioneta + tráiler + tractor' : 'Camioneta + tráiler', empuje, f >= H.TONELADA ? '+1 tonelada' : '', colE, AGUANTE)}
      {fila('Lo que aguantan 2 ruedas', AGUANTE, 'en grava', C.verde)}
    </Panel>
  );
};

// Consejo: lista de chequeo
const Consejo: React.FC<{f: number}> = ({f}) => {
  const op = interpolate(f, [H.CONSEJO + 5, H.CONSEJO + 20, H.FIN, H.FIN + 15], [0, 1, 1, 0], clamp);
  if (op <= 0) return null;
  const item = (desde: number, texto: string) => {
    const k = interpolate(f, [desde - 6, desde + 4], [0, 1], clamp);
    return (
      <div style={{display: 'flex', alignItems: 'center', gap: 22, marginTop: 18, opacity: 0.3 + 0.7 * k}}>
        <svg width={56} height={56} viewBox="0 0 56 56">
          <rect x={3} y={3} width={50} height={50} rx={12} fill={k > 0.5 ? `${C.verde}33` : 'none'} stroke={k > 0.5 ? C.verde : C.blanco} strokeWidth={4} />
          {k > 0.5 && <path d="M14,29 L24,39 L42,18" fill="none" stroke={C.verde} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" />}
        </svg>
        <div style={{fontFamily: TITULAR, fontWeight: 900, fontSize: 48, color: C.blanco}}>{texto}</div>
      </div>
    );
  };
  return (
    <Panel op={op} color={C.verde}>
      <Titulo color={C.verde}>ANTES DE CARGAR</Titulo>
      {item(H.PLANO, 'Suelo plano')}
      {item(H.FRENO, 'Freno de mano')}
      {item(H.CALZAS, 'Calzas en el tráiler')}
    </Panel>
  );
};

export const Holograma: React.FC = () => {
  const f = useCurrentFrame();
  const entrada = interpolate(f, [0, 12], [0, 1], clamp);
  const salida = interpolate(f, [H.DUR - 25, H.DUR - 5], [1, 0], clamp);
  const barrido = interpolate(f, [0, 22], [-100, 2000], clamp);
  const s = rodado(f);
  const L = (x: number, y: number, z: number) => mundo(f, x, y, z);
  return (
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, #0b2234 0%, #040b14 60%, #01040a 100%)', opacity: Math.min(entrada, salida)}}>
      <ThreeCanvas width={1080} height={1920} camera={{fov: FOV, near: 0.1, far: 2000, position: [0, 10, 20]}}>
        <Camara f={f} />
        <Escena f={f} />
      </ThreeCanvas>

      <Etiqueta3D f={f} punto={L(-3.2, 2.1, 0)} desde={12} hasta={H.PERNO} color={C.verde} texto="Freno de mano: puesto" dx={-30} dy={-300} />
      <Etiqueta3D f={f} punto={LUPA.clone().add(new THREE.Vector3(0, 1.9, 0))} desde={H.PERNO_W - 4} hasta={H.ATRAS + 6} color={C.verde} texto="El perno de Park" dx={-40} dy={-260} />
      <Etiqueta3D f={f} punto={L(-3.4, 0.62, 0.3)} desde={H.CAJA - 4} hasta={H.ATRAS + 10} color={C.ambar} texto="Caja de cambios" dx={-40} dy={300} />
      <Etiqueta3D f={f} punto={L(-1.3, 0.42, 1.0)} desde={H.TRABA - 4} hasta={H.LIBRES + 4} color={C.verde} texto="Solo atrás: trabadas" dx={30} dy={260} />
      <Etiqueta3D f={f} punto={L(-1.3, 0.9, 1.0)} desde={H.MANO - 2} hasta={H.TRABA - 6} color={C.verde} texto="Freno de mano → atrás" dx={30} dy={-280} />
      <Etiqueta3D f={f} punto={L(-6, 0, 3.2)} desde={H.BAJA - 4} hasta={H.ABAJO + 10} color={C.ambar} texto="Entrada en bajada" dx={40} dy={260} />
      <Etiqueta3D f={f} punto={L(s - 1.3, 0.2, 1.0)} desde={H.PATINAN - 6} hasta={H.VA + 6} color={C.rojo} texto="Patinan en la grava" dx={30} dy={260} />

      <Ruedas f={f} />
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
