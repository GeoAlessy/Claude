import React, {useLayoutEffect, useMemo} from 'react';
import * as THREE from 'three';
import {ThreeCanvas} from '@remotion/three';
import {useThree} from '@react-three/fiber';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';
import {Holo, Linea, caja, proyectar} from '../three/holo';
import {C, MONO, TITULAR} from '../estilo';
import {Pastilla} from '../hud';

// Línea de tiempo: sale de la narración (ver tiempos.ts)
import {H, EMPUJE, SENAL, LLEGA_MOTOR, ATASCO} from './tiempos';
export {H, EMPUJE, SENAL, LLEGA_MOTOR, ATASCO};

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const suave = Easing.inOut(Easing.cubic);

// =====================================================================
// Geometría de la escalera (metros). x: hacia arriba de la escalera, y: altura, z: ancho
// =====================================================================
const ANG = (30 * Math.PI) / 180;
const ALTO = 4;
const X0 = 1.5; // empieza la inclinación
const X1 = X0 + ALTO / Math.tan(ANG); // termina la inclinación
const XC = X1 + 0.6; // peine superior
const XC_INF = X0 - 0.6; // peine inferior
const PASO = 0.4;
const ANCHO = 1.0;

function yDe(x: number) {
  if (x <= X0) return 0;
  if (x >= X1) return ALTO;
  return (x - X0) * Math.tan(ANG);
}

// Posición del sensor, motor y freno
export const P = {
  peine: new THREE.Vector3(XC - 0.02, ALTO + 0.03, 0.15),
  sensor: new THREE.Vector3(XC + 0.18, ALTO - 0.13, 0.36),
  motor: new THREE.Vector3(XC + 0.75, ALTO - 0.95, -0.15),
  freno: new THREE.Vector3(XC + 0.75, ALTO - 0.95, 0.27),
  camarografo: new THREE.Vector3(X1 - 0.3, ALTO, 0),
  pareja: new THREE.Vector3(1.1, 0, 0),
};

// =====================================================================
// Cámara: fotogramas clave [frame, posición, objetivo]
// =====================================================================
type ClaveCam = [number, [number, number, number], [number, number, number]];
const V = (x: number, y: number, z: number): [number, number, number] => [x, y, z];
const CAM: ClaveCam[] = [
  [H.PREVIA, V(XC + 7.5, ALTO + 7.0, 3.5), V(3, 0.8, 0)],
  [H.CAMARA, V(XC + 5.5, ALTO + 5.0, 0.4), V(2, 0.6, 0)],
  [H.CAMARA + 115, V(XC + 4, ALTO + 3.5, 1.2), V(2.4, 1.0, 0)],
  [H.PEINE + 50, V(XC + 1.6, ALTO + 1.3, 2.2), V(XC, ALTO, 0)],
  [H.RAYOSX + 60, V(XC + 0.7, ALTO + 0.55, 1.35), V(XC + 0.15, ALTO - 0.1, 0.2)],
  [H.CLIC + 20, V(XC - 0.75, ALTO + 0.45, 1.25), V(XC + 0.1, ALTO - 0.02, 0.2)],
  [SENAL + 8, V(XC - 0.6, ALTO + 0.35, 1.2), V(XC + 0.15, ALTO - 0.08, 0.25)],
  [LLEGA_MOTOR, V(XC + 0.1, ALTO - 0.2, 2.2), V(XC + 0.6, ALTO - 0.75, 0.05)],
  [H.PARA_QUE - 5, V(XC + 0.1, ALTO - 0.25, 2.25), V(XC + 0.6, ALTO - 0.75, 0.05)],
  [H.PARA_QUE + 30, V(XC - 1.6, ALTO + 0.8, 1.7), V(XC - 0.1, ALTO + 0.05, 0)],
  [ATASCO + 40, V(XC - 1.0, ALTO + 0.55, 1.2), V(XC - 0.05, ALTO + 0.02, 0.1)],
  [H.ONU + 40, V(1.8, 6.5, 11.5), V(5.6, 2.4, 0)],
  [H.CIERRE - 5, V(3.5, 7.0, 10.5), V(5.8, 2.6, 0)],
  [H.CIERRE + 45, V(XC + 0.9, ALTO + 0.65, 1.4), V(XC, ALTO - 0.05, 0.15)],
  [H.FIN - 5, V(XC + 0.6, ALTO + 0.5, 1.15), V(XC, ALTO - 0.05, 0.15)],
  [H.DUR, V(-3, 5, 13), V(4.8, 2, 0)],
];
export const FOV = 40;

export function camaraEn(f: number) {
  const fr = CAM.map((k) => k[0]);
  const p = new THREE.Vector3(...[0, 1, 2].map((i) => interpolate(f, fr, CAM.map((k) => k[1][i]), {...clamp, easing: suave})) as [number, number, number]);
  const t = new THREE.Vector3(...[0, 1, 2].map((i) => interpolate(f, fr, CAM.map((k) => k[2][i]), {...clamp, easing: suave})) as [number, number, number]);
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
// Estado de la máquina en cada fotograma
// =====================================================================
function velocidadEscalera(f: number) {
  // Se mueve al inicio, se detiene en el clic; vuelve a moverse para la demo del zapato y se detiene en el atasco.
  if (f < SENAL) return interpolate(f, [SENAL - 1, SENAL + 6], [1, 0], clamp);
  if (f < H.PARA_QUE) return interpolate(f, [SENAL, SENAL + 6], [1, 0], clamp);
  if (f < ATASCO) return 1;
  if (f < H.CIERRE) return interpolate(f, [ATASCO, ATASCO + 6], [1, 0], clamp);
  return 0;
}
function desplazamiento(f: number) {
  let d = 0;
  for (let i = 0; i < f; i++) d += velocidadEscalera(i) * 0.0125; // m por fotograma
  return d;
}

// =====================================================================
// Piezas
// =====================================================================
const Escalones: React.FC<{d: number; color: string; opac: number}> = ({d, color, opac}) => {
  const n = Math.ceil((XC - XC_INF) / PASO) + 1;
  const pasos = [];
  for (let k = 0; k < n; k++) {
    const x = XC_INF + ((((k * PASO + d) % (n * PASO)) + n * PASO) % (n * PASO));
    if (x < XC_INF + 0.02 || x + PASO > XC + 0.02) continue;
    const yTop = yDe(x + PASO);
    const yBase = yDe(x);
    const contra = Math.max(yTop - yBase, 0.001);
    pasos.push(
      <group key={k}>
        <Holo geom={caja(PASO - 0.02, 0.03, ANCHO - 0.04)} color={color} relleno={0.09 * opac} linea={0.7 * opac} position={[x + PASO / 2, yTop - 0.015, 0]} />
        {contra > 0.02 && (
          <Holo geom={caja(0.02, contra, ANCHO - 0.04)} color={color} relleno={0.05 * opac} linea={0.4 * opac} position={[x + 0.01, yBase + contra / 2, 0]} />
        )}
      </group>
    );
  }
  return <group>{pasos}</group>;
};

const Estructura: React.FC<{color: string; opac: number}> = ({color, opac}) => {
  const lados = useMemo(() => {
    const out: THREE.Vector3[][] = [];
    for (const z of [-ANCHO / 2 - 0.06, ANCHO / 2 + 0.06]) {
      const arriba: THREE.Vector3[] = [];
      const abajo: THREE.Vector3[] = [];
      const pasamanos: THREE.Vector3[] = [];
      for (let x = -0.2; x <= XC + 1.0; x += 0.1) {
        arriba.push(new THREE.Vector3(x, yDe(x) + 0.12, z));
        abajo.push(new THREE.Vector3(x, yDe(x) - 0.75, z));
        pasamanos.push(new THREE.Vector3(x, yDe(x) + 0.95, z));
      }
      out.push(arriba, abajo, pasamanos);
      // postes verticales cada 0.8 m
      for (let x = -0.2; x <= XC + 1.0; x += 0.8) {
        out.push([new THREE.Vector3(x, yDe(x) - 0.75, z), new THREE.Vector3(x, yDe(x) + 0.95, z)]);
      }
    }
    return out;
  }, []);
  return (
    <group>
      {lados.map((pts, i) => (
        <Linea key={i} puntos={pts} color={color} opacidad={(i % 3 === 2 ? 0.9 : 0.45) * opac} />
      ))}
    </group>
  );
};

// Peine con dientes que encajan en las ranuras del escalón
const Peine: React.FC<{x: number; y?: number; color: string; opac: number; empuje: number; espejo?: boolean}> = ({x, y = ALTO, color, opac, empuje, espejo = false}) => {
  const dientes = [];
  for (let i = 0; i < 18; i++) {
    const z = -ANCHO / 2 + 0.05 + i * ((ANCHO - 0.1) / 17);
    dientes.push(
      <Holo key={i} geom={caja(0.12, 0.012, 0.018)} color={color} relleno={0.25 * opac} linea={0.9 * opac} position={[-0.06, 0, z]} angulo={1} />
    );
  }
  return (
    <group position={[x + empuje, y + 0.03, 0]} scale={[espejo ? -1 : 1, 1, 1]}>
      <Holo geom={caja(0.35, 0.025, ANCHO)} color={color} relleno={0.15 * opac} linea={0.95 * opac} position={[0.175, 0, 0]} />
      {dientes}
    </group>
  );
};

// Figura humana simple (holograma); "paso" anima las piernas
// Maniquí holográfico (cápsulas): se lee como persona incluso en pantallas chicas.
// Mira hacia +x. "paso" anima la caminata.
const G = {
  torso: new THREE.CapsuleGeometry(0.15, 0.34, 3, 10),
  cadera: new THREE.CapsuleGeometry(0.13, 0.1, 3, 10),
  cuello: new THREE.CapsuleGeometry(0.045, 0.06, 2, 8),
  cabeza: new THREE.SphereGeometry(0.11, 12, 10),
  muslo: new THREE.CapsuleGeometry(0.075, 0.3, 3, 8),
  pierna: new THREE.CapsuleGeometry(0.06, 0.32, 3, 8),
  brazo: new THREE.CapsuleGeometry(0.05, 0.24, 3, 8),
  antebrazo: new THREE.CapsuleGeometry(0.045, 0.22, 3, 8),
};
const Parte: React.FC<{g: THREE.BufferGeometry; color: string; fuerte?: boolean} & React.JSX.IntrinsicElements['group']> = ({g, color, fuerte = false, ...p}) => (
  <Holo geom={g} color={color} relleno={fuerte ? 0.16 : 0.12} linea={0.75} angulo={28} {...p} />
);
const Pierna: React.FC<{color: string; z: number; giro: number}> = ({color, z, giro}) => (
  <group position={[0, 0.92, z]} rotation={[0, 0, giro]}>
    <Parte g={G.muslo} color={color} position={[0, -0.22, 0]} />
    <group position={[0, -0.44, 0]} rotation={[0, 0, -Math.max(0, -giro) * 1.2]}>
      <Parte g={G.pierna} color={color} position={[0, -0.22, 0]} />
      <Holo geom={caja(0.24, 0.07, 0.11)} color={color} relleno={0.25} linea={0.9} position={[0.06, -0.44, 0]} />
    </group>
  </group>
);
const Brazo: React.FC<{color: string; z: number; giro: number; adelante?: boolean}> = ({color, z, giro, adelante = false}) => (
  <group position={[0, 1.42, z]} rotation={[0, 0, adelante ? 1.1 : giro]}>
    <Parte g={G.brazo} color={color} position={[0, -0.17, 0]} />
    <group position={[0, -0.33, 0]} rotation={[0, 0, adelante ? 0.6 : 0.15]}>
      <Parte g={G.antebrazo} color={color} position={[0, -0.15, 0]} />
    </group>
  </group>
);
const Persona: React.FC<{color: string; paso: number; escala?: number; camara?: boolean} & React.JSX.IntrinsicElements['group']> = ({
  color,
  paso,
  escala = 1,
  camara = false,
  ...props
}) => {
  const a = Math.sin(paso) * 0.4;
  return (
    <group {...props} scale={escala}>
      <Parte g={G.cadera} color={color} position={[0, 0.98, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[1, 1.2, 1]} />
      <Parte g={G.torso} color={color} fuerte position={[0, 1.27, 0]} scale={[0.85, 1, 1.35]} />
      <Parte g={G.cuello} color={color} position={[0, 1.53, 0]} />
      <Parte g={G.cabeza} color={color} fuerte position={[0.01, 1.66, 0]} scale={[1, 1.15, 0.95]} />
      <Pierna color={color} z={-0.1} giro={a} />
      <Pierna color={color} z={0.1} giro={-a} />
      <Brazo color={color} z={-0.24} giro={-a * 0.8} adelante={camara} />
      <Brazo color={color} z={0.24} giro={a * 0.8} adelante={camara} />
      {camara && (
        <group position={[0.42, 1.35, 0]}>
          <Holo geom={caja(0.26, 0.18, 0.16)} color={color} relleno={0.3} linea={1} />
          <Holo geom={useMemo(() => new THREE.CylinderGeometry(0.06, 0.07, 0.14, 12), [])} color={color} relleno={0.3} linea={1} angulo={30} position={[0.19, 0, 0]} rotation={[0, 0, Math.PI / 2]} />
        </group>
      )}
    </group>
  );
};

// =====================================================================
// Escena
// =====================================================================
const Escena: React.FC<{f: number}> = ({f}) => {
  const d = desplazamiento(f);
  // Modo rayos X: las piezas exteriores se vuelven casi invisibles
  const rayosX = interpolate(f, [H.RAYOSX, H.RAYOSX + 15, H.ONU, H.ONU + 15, H.CIERRE + 20, H.CIERRE + 35], [0, 1, 1, 0, 0, 1], clamp);
  const exterior = 1 - 0.75 * rayosX;
  const aparicion = interpolate(f, [0, 20], [0, 1], clamp);

  // Empuje del talón en el peine (exagerado para que se vea)
  const empujeTalon = interpolate(f, [EMPUJE, EMPUJE + 10, H.PARA_QUE - 20, H.PARA_QUE], [0, 0.035, 0.035, 0], clamp);
  const empujeZapato = interpolate(f, [ATASCO - 2, ATASCO + 8, H.ONU, H.ONU + 10], [0, 0.035, 0.035, 0], clamp);
  const empuje = Math.max(empujeTalon, empujeZapato);

  // Estado del sensor: rojo al activarse (demo del talón), verde en la demo del zapato y el cierre
  const sensorActivo = (f >= SENAL && f < H.PARA_QUE) || (f >= ATASCO + 6 && f < H.ONU);
  const colorSensor = f >= H.PARA_QUE ? C.verde : C.rojo;
  const brilloSensor = sensorActivo ? 0.6 + 0.4 * Math.sin(f / 2) : f >= H.CIERRE ? 0.55 + 0.3 * Math.sin(f / 5) : 0.2 + 0.8 * rayosX * 0.4;

  // Señal que viaja por el cable
  const cable = useMemo(
    () =>
      new THREE.CatmullRomCurve3([
        P.sensor.clone(),
        new THREE.Vector3(XC + 0.25, ALTO - 0.4, 0.4),
        new THREE.Vector3(XC + 0.5, ALTO - 0.75, 0.38),
        P.freno.clone().add(new THREE.Vector3(-0.05, 0.05, 0.12)),
      ]),
    []
  );
  const puntosCable = useMemo(() => cable.getPoints(40), [cable]);
  const uSenal = interpolate(f, [SENAL, LLEGA_MOTOR], [0, 1], clamp);
  const posSenal = cable.getPoint(uSenal);
  const senalVisible = f >= SENAL && f <= LLEGA_MOTOR + 4;

  const motorGira = velocidadEscalera(f);
  const giroMotor = d * 6;
  const pinza = interpolate(f, [LLEGA_MOTOR, LLEGA_MOTOR + 6], [0.06, 0.012], clamp) * (f < H.CIERRE ? 1 : 1);

  // Camarógrafo: sube de espaldas hacia el peine
  const xCam = interpolate(f, [H.CAMARA, H.CAMARA + 110], [X1 - 1.1, X1 + 0.15], {...clamp, easing: Easing.out(Easing.quad)});
  const camVisible = f < H.PEINE + 12;
  const opCam = interpolate(f, [H.PEINE - 6, H.PEINE + 10], [1, 0.001], clamp);

  // Talón (demo del clic) y zapato (demo de atrapamiento)
  const xTalon = interpolate(f, [H.CLIC, EMPUJE], [XC - 0.55, XC - 0.07], {...clamp, easing: Easing.in(Easing.quad)});
  const talonVisible = f >= H.CLIC - 10 && f < H.PARA_QUE;
  const xZapato = interpolate(f, [H.PARA_QUE, ATASCO], [XC - 1.2, XC - 0.1], clamp);
  const zapatoVisible = f >= H.PARA_QUE && f < H.ONU;

  return (
    <group>
      <gridHelper args={[40, 80, C.cian, C.cian]} position={[5, -0.8, 0]}>
        <lineBasicMaterial attach="material" color={C.cian} transparent opacity={0.08 * aparicion} />
      </gridHelper>
      <group scale={[1, aparicion, 1]}>
        <Estructura color={C.cian} opac={exterior} />
        <Escalones d={d} color={C.cian} opac={exterior} />
        <Peine x={XC} color={f >= EMPUJE && f < H.PARA_QUE ? C.rojo : f >= H.PIEZA && f < H.CAMARA + 10 ? C.ambar : C.cian} opac={1} empuje={empuje} />
        <Peine x={XC_INF} y={0} espejo color={C.cian} opac={exterior * 0.8} empuje={0} />
        {/* piso superior */}
        <Holo geom={caja(1.4, 0.02, ANCHO)} color={C.cian} relleno={0.04 * exterior} linea={0.5 * exterior} position={[XC + 0.35 + 0.7, ALTO + 0.03, 0]} />

        {/* Sensor de impacto bajo el peine */}
        <group position={P.sensor}>
          <Holo geom={caja(0.1, 0.07, 0.09)} color={colorSensor} relleno={0.35 * brilloSensor} linea={brilloSensor} angulo={1} />
          <Holo
            geom={caja(0.012, 0.09, 0.012)}
            color={colorSensor}
            relleno={0.5 * brilloSensor}
            linea={brilloSensor}
            position={[-0.05, 0.06, 0]}
            rotation={[0, 0, sensorActivo ? -0.5 : 0]}
          />
        </group>
        <Linea puntos={puntosCable} color={sensorActivo ? C.rojo : C.cian} opacidad={0.25 + 0.6 * rayosX} />
        {senalVisible && (
          <mesh position={posSenal}>
            <sphereGeometry args={[0.035, 12, 10]} />
            <meshBasicMaterial color={C.rojo} transparent opacity={1} blending={THREE.AdditiveBlending} depthWrite={false} />
          </mesh>
        )}

        {/* Motor y freno */}
        <group position={P.motor} rotation={[Math.PI / 2, 0, 0]}>
          <Holo geom={useMemo(() => new THREE.CylinderGeometry(0.17, 0.17, 0.42, 16), [])} color={motorGira > 0.05 ? C.cian : C.rojo} relleno={0.08} linea={0.35 + 0.6 * rayosX} angulo={30} />
          <group rotation={[0, giroMotor, 0]}>
            {[0, 1, 2].map((i) => (
              <Holo key={i} geom={caja(0.3, 0.02, 0.03)} color={C.cian} relleno={0.2} linea={0.4 + 0.6 * rayosX} position={[0, 0.22, 0]} rotation={[0, (i * Math.PI) / 3, 0]} />
            ))}
          </group>
        </group>
        <group position={P.freno} rotation={[Math.PI / 2, giroMotor, 0]}>
          <Holo geom={useMemo(() => new THREE.CylinderGeometry(0.22, 0.22, 0.025, 24), [])} color={C.cian} relleno={0.1} linea={0.35 + 0.6 * rayosX} angulo={30} />
        </group>
        <group position={P.freno.clone().add(new THREE.Vector3(0, 0.22, 0))}>
          <Holo geom={caja(0.08, 0.06, 0.02)} color={f >= LLEGA_MOTOR && f < H.PARA_QUE ? C.rojo : C.cian} relleno={0.3} linea={0.4 + 0.6 * rayosX} position={[0, 0, pinza]} />
          <Holo geom={caja(0.08, 0.06, 0.02)} color={f >= LLEGA_MOTOR && f < H.PARA_QUE ? C.rojo : C.cian} relleno={0.3} linea={0.4 + 0.6 * rayosX} position={[0, 0, -pinza]} />
        </group>

        {/* Personas */}
        {f < H.PEINE && (
          <>
            <Persona color={C.cian} paso={0} position={[P.pareja.x, 0, -0.2]} rotation={[0, 0, 0]} />
            <Persona color={C.cian} paso={0} escala={0.95} position={[P.pareja.x + 0.55, yDe(P.pareja.x + 0.55), 0.22]} />
          </>
        )}
        {camVisible && (
          <group>
            {/* mira hacia abajo de la escalera (−x) y camina hacia atrás (+x) */}
            <Persona
              color={C.rojo}
              paso={f / 4}
              camara
              position={[xCam, yDe(xCam + 0.2), 0]}
              rotation={[0, Math.PI, 0]}
              scale={opCam}
            />
          </group>
        )}
        {talonVisible && (
          <group position={[xTalon, ALTO + 0.06, 0.15]}>
            <Holo geom={caja(0.28, 0.08, 0.11)} color={C.ambar} relleno={0.2} linea={1} />
            <Holo geom={caja(0.07, 0.05, 0.11)} color={C.ambar} relleno={0.35} linea={1} position={[0.105, -0.055, 0]} />
          </group>
        )}
        {zapatoVisible && (
          <group position={[xZapato, ALTO + 0.06, -0.15]}>
            <Holo geom={caja(0.28, 0.08, 0.11)} color={C.ambar} relleno={0.2} linea={1} />
          </group>
        )}
      </group>
    </group>
  );
};

// =====================================================================
// Capa 2D: etiquetas ancladas a puntos 3D + barrido + líneas de escaneo
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
  const anchoEtiqueta = texto.length * 19 + 70; // aprox. para MONO 30 px
  const lxBruto = x + dx;
  const lx = dx < 0 ? Math.min(Math.max(lxBruto, anchoEtiqueta + 30), 1050) : Math.min(Math.max(lxBruto, 30), 1050 - anchoEtiqueta);
  const ly = Math.min(Math.max(y + dy, 140), 1700);
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

export const Holograma: React.FC = () => {
  const f = useCurrentFrame();
  const entrada = interpolate(f, [0, 12], [0, 1], clamp);
  const salida = interpolate(f, [H.DUR - 25, H.DUR - 5], [1, 0], clamp);
  const barrido = interpolate(f, [0, 22], [-100, 2000], clamp);
  const flashClic = interpolate(f, [SENAL, SENAL + 2, SENAL + 10], [0, 0.35, 0], clamp);

  return (
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, #0b2234 0%, #040b14 60%, #01040a 100%)', opacity: Math.min(entrada, salida)}}>
      <ThreeCanvas
        width={1080}
        height={1920}

        camera={{fov: FOV, near: 0.05, far: 200, position: [0, 3, 10]}}
      >
        <Camara f={f} />
        <Escena f={f} />
      </ThreeCanvas>

      {/* Etiquetas */}
      <Etiqueta3D f={f} punto={P.camarografo.clone().add(new THREE.Vector3(0.3, 1.9, 0))} desde={H.CAMARA + 20} hasta={H.PEINE + 20} color={C.rojo} texto="Camarógrafo" dx={-60} dy={-150} />
      <Etiqueta3D f={f} punto={P.pareja.clone().add(new THREE.Vector3(0.3, 1.9, 0))} desde={H.CAMARA + 10} hasta={H.PEINE - 10} texto="Trump y Melania" dx={40} dy={-130} />
      <Etiqueta3D f={f} punto={P.peine} desde={H.PEINE + 45} hasta={H.RAYOSX + 10} texto="Peine" dx={-80} dy={-200} />
      <Etiqueta3D f={f} punto={P.sensor} desde={H.RAYOSX + 25} hasta={H.CLIC + 15} color={C.rojo} texto="Sensor de impacto" dx={-120} dy={180} />
      <Etiqueta3D f={f} punto={P.sensor} desde={SENAL} hasta={SENAL + 40} color={C.rojo} texto="¡Clic!" dx={-80} dy={-160} />
      <Etiqueta3D f={f} punto={P.motor} desde={LLEGA_MOTOR - 5} hasta={H.PARA_QUE - 5} color={C.rojo} texto="Motor: apagado" dx={-60} dy={-300} />
      <Etiqueta3D f={f} punto={P.freno} desde={LLEGA_MOTOR + 8} hasta={H.PARA_QUE - 5} color={C.rojo} texto="Freno: activado" dx={80} dy={-170} />
      <Etiqueta3D f={f} punto={P.peine.clone().add(new THREE.Vector3(-0.15, 0.05, -0.3))} desde={ATASCO + 6} hasta={H.ONU - 5} color={C.verde} texto="Se detiene a tiempo ✓" dx={-40} dy={200} />
      <Etiqueta3D f={f} punto={P.sensor} desde={H.CIERRE + 45} hasta={H.FIN} color={C.verde} texto="Te está protegiendo" dx={-100} dy={-240} />

      <Etiqueta3D f={f} punto={P.peine} desde={H.PIEZA} hasta={H.CAMARA + 8} color={C.ambar} texto="Esta pieza" dx={-60} dy={-180} />

      {/* Cita de la ONU */}
      {f >= H.ONU + 20 && f < H.CIERRE && (
        <div
          style={{
            position: 'absolute',
            left: 70,
            right: 70,
            top: 300,
            padding: '34px 40px',
            background: C.vidrio,
            border: `2px solid ${C.cian}`,
            borderRadius: 28,
            boxShadow: `0 0 30px ${C.cian}44`,
            opacity: interpolate(f, [H.ONU + 20, H.ONU + 32, H.CIERRE - 10, H.CIERRE], [0, 1, 1, 0], clamp),
          }}
        >
          <div style={{fontFamily: MONO, fontWeight: 700, fontSize: 26, color: C.cian, letterSpacing: 2, marginBottom: 14}}>INVESTIGACIÓN · ONU</div>
          <div style={{fontFamily: TITULAR, fontWeight: 900, fontSize: 52, lineHeight: 1.12, color: C.blanco}}>
            “Se activó un mecanismo de seguridad en el escalón.”
          </div>
        </div>
      )}

      {/* Líneas de escaneo + barrido de entrada + destello del clic */}
      <AbsoluteFill
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, rgba(34,211,238,0.05) 0px, rgba(34,211,238,0.05) 2px, transparent 2px, transparent 6px)',
          mixBlendMode: 'screen',
        }}
      />
      <div style={{position: 'absolute', left: 0, top: barrido, width: '100%', height: 6, background: C.cian, boxShadow: `0 0 40px 18px ${C.cian}88`}} />
      <AbsoluteFill style={{background: `rgba(255,59,71,${flashClic})`}} />
    </AbsoluteFill>
  );
};
