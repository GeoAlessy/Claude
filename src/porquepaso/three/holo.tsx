import React, {useMemo} from 'react';
import * as THREE from 'three';

// Material holográfico: relleno muy tenue + aristas brillantes, con mezcla aditiva.
export const Holo: React.FC<
  {
    geom: THREE.BufferGeometry;
    color: string;
    relleno?: number;
    linea?: number;
    angulo?: number; // ángulo mínimo para dibujar una arista (grados)
  } & React.JSX.IntrinsicElements['group']
> = ({geom, color, relleno = 0.07, linea = 0.9, angulo = 20, ...props}) => {
  const aristas = useMemo(() => new THREE.EdgesGeometry(geom, angulo), [geom, angulo]);
  return (
    <group {...props}>
      {relleno > 0 && (
        <mesh geometry={geom}>
          <meshBasicMaterial
            color={color}
            transparent
            opacity={relleno}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
      {linea > 0 && (
        <lineSegments geometry={aristas}>
          <lineBasicMaterial color={color} transparent opacity={linea} depthWrite={false} blending={THREE.AdditiveBlending} />
        </lineSegments>
      )}
    </group>
  );
};

// Caché de cajas para no crear miles de geometrías iguales
const cajas = new Map<string, THREE.BoxGeometry>();
export function caja(w: number, h: number, d: number) {
  const k = `${w}|${h}|${d}`;
  if (!cajas.has(k)) cajas.set(k, new THREE.BoxGeometry(w, h, d));
  return cajas.get(k)!;
}

// Línea simple (polilínea) holográfica
export const Linea: React.FC<{puntos: THREE.Vector3[]; color: string; opacidad?: number}> = ({puntos, color, opacidad = 0.8}) => {
  const g = useMemo(() => new THREE.BufferGeometry().setFromPoints(puntos), [puntos]);
  return (
    // @ts-expect-error: <line> de three, no el elemento SVG
    <line geometry={g}>
      <lineBasicMaterial color={color} transparent opacity={opacidad} depthWrite={false} blending={THREE.AdditiveBlending} />
    </line>
  );
};

// Proyecta un punto 3D a coordenadas de pantalla (para colocar etiquetas HTML)
export function proyectar(
  p: THREE.Vector3,
  camPos: THREE.Vector3,
  objetivo: THREE.Vector3,
  fov: number,
  ancho: number,
  alto: number
): [number, number, boolean] {
  const cam = new THREE.PerspectiveCamera(fov, ancho / alto, 0.05, 200);
  cam.position.copy(camPos);
  cam.lookAt(objetivo);
  cam.updateMatrixWorld();
  cam.updateProjectionMatrix();
  const v = p.clone().project(cam);
  return [((v.x + 1) / 2) * ancho, ((1 - v.y) / 2) * alto, v.z < 1];
}
