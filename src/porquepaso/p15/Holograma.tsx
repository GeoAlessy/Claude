import React, {useLayoutEffect, useMemo} from 'react';
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
// Holograma del video 15: por qué la escalera se fue hacia atrás.
// Vista de costado: el muelle a la izquierda (x < 0), el agua (y = 0) y un bote pegado al muelle.
// La escalera va del bote a la orilla del muelle, casi vertical, sin amarrar.
// Se queda quieta mientras el peso cae entre la base y el muelle (zona verde).
// Casi vertical, el cuerpo del que baja queda por fuera; el bote se mueve → la escalera gira hacia atrás.
// Al final: la regla 4 a 1, punta amarrada y base firme. El trabajador cae al agua y lo suben al bote.
// =====================================================================
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const suave = Easing.inOut(Easing.cubic);
const BLANCO = '#E0F2FE';
const MADERA = '#94A3B8';
const OBRERO = '#FB923C';
const ALTO = 3.5; // altura del muelle sobre el agua
const CUBIERTA = 0.3; // cubierta del bote
const L = 3.26; // largo de la escalera
const Z_BIEN = -4.6; // dónde se arma la escalera bien puesta

// ---------- Escalera ----------
// base: posición x sobre el bote (el bote se acerca un poco al muelle con cada paso)
const baseX = (f: number) => interpolate(f, [H.PASO - 6, H.PASO + 6, H.MUEVE + 4, H.INCLINA + 10], [0.34, 0.24, 0.16, 0.1], {...clamp, easing: suave});
const vuelco0 = H.PASA - 4;
// inclinación desde la vertical (positiva = la punta hacia el muelle)
const fi = (f: number) => {
  const reposo = Math.asin(baseX(f) / L);
  if (f < vuelco0) return reposo;
  const t = f - vuelco0;
  return Math.max(-1.42, reposo - 0.03 * (Math.exp(t / 17) - 1));
};
const enEscalera = (f: number, s: number) => {
  const a = fi(f);
  return new THREE.Vector3(baseX(f) - s * Math.sin(a), CUBIERTA + s * Math.cos(a), 0);
};

// ---------- Trabajador que baja ----------
// distancia de sus pies a la base (por la escalera)
const pasoS = (f: number) => interpolate(f, [H.LINEA + 30, H.INCLINARSE], [L - 0.35, 1.5], {...clamp, easing: suave});
const subida = (f: number) => interpolate(f, [H.LINEA, H.LINEA + 30], [0, 1], {...clamp, easing: suave}); // del muelle a la escalera
const hacia = (f: number) => interpolate(f, [H.INCLINARSE - 6, H.INCLINARSE + 12], [0.04, 0.32], {...clamp, easing: suave}); // se inclina hacia atrás
// se suelta de la escalera cuando esta ya cayó bastante
const SUELTA = (() => {
  for (let f = vuelco0; f < vuelco0 + 200; f++) if (fi(f) < -0.6) return f;
  return vuelco0 + 60;
})();
const CAE_AGUA = SUELTA + 16;
const X_AGUA = 2.15;
const sacado = (f: number) => interpolate(f, [H.SUBIERON - 6, H.SUBIERON + 26], [0, 1], {...clamp, easing: suave});
// estado del trabajador: pies, ángulo del cuerpo (positivo = cabeza hacia el muelle) y si está en el agua
function obrero(f: number): {pies: THREE.Vector3; ang: number; agua: number} {
  if (f < SUELTA) {
    const enE = enEscalera(f, pasoS(f));
    const a = fi(f);
    // pies un poco por fuera de los peldaños
    const pE = enE.add(new THREE.Vector3(0.14 * Math.cos(a), 0.14 * Math.sin(a), 0));
    const pM = new THREE.Vector3(-0.7, ALTO, 0);
    const k = subida(f);
    return {pies: pM.lerp(pE, k), ang: k * (a - hacia(f)), agua: 0};
  }
  if (f < CAE_AGUA) {
    const t = (f - SUELTA) / (CAE_AGUA - SUELTA);
    const p0 = obrero(SUELTA - 1).pies;
    const x = interpolate(t, [0, 1], [p0.x, X_AGUA]);
    const y = p0.y * (1 - t * t) + -0.4 * t * t + 0.4 * Math.sin(Math.PI * t);
    return {pies: new THREE.Vector3(x, y, 0), ang: interpolate(t, [0, 1], [-0.6, -1.5]), agua: 0};
  }
  // flota y luego lo suben al bote
  const s = sacado(f);
  const flota = new THREE.Vector3(X_AGUA + 0.25, -0.05 + 0.05 * Math.sin(f / 7), 0);
  const bote = new THREE.Vector3(1.25, CUBIERTA, 0.4);
  return {pies: flota.lerp(bote, s), ang: interpolate(s, [0, 1], [-1.45, 0]), agua: 1 - s};
}
// centro de masa aproximado del trabajador (a la altura de la cadera)
const cadera = (f: number) => {
  const {pies, ang} = obrero(f);
  return pies.clone().add(new THREE.Vector3(-0.95 * Math.sin(ang), 0.95 * Math.cos(ang), 0));
};

// ---------- Cámara ----------
type ClaveCam = [number, [number, number, number], [number, number, number]];
const VC = (x: number, y: number, z: number): [number, number, number] => [x, y, z];
const CAM: ClaveCam[] = [
  [0, VC(7, 3.4, 9), VC(0.4, 2.0, 0)],
  [H.VERTICAL, VC(3, 2.4, 10.5), VC(0.6, 2.1, 0)],
  [H.MUELLE, VC(4, 3, 9.5), VC(0.4, 2.1, 0)],
  [H.LINEA, VC(1.0, 2.2, 10.5), VC(0.5, 2.1, 0)],
  [H.BOTE2, VC(1.0, 2.2, 10.5), VC(0.6, 2.0, 0)],
  [H.ARBOL + 30, VC(2.0, 2.0, 11.5), VC(1.2, 1.7, 0)],
  [H.REGLA + 10, VC(5, 3.2, 10), VC(0.6, 2.0, -2.3)],
  [H.AMARRA + 20, VC(4.2, 3.8, 9), VC(0.5, 2.2, -2.4)],
  [H.SUERTE + 10, VC(5, 2.6, 8.5), VC(1.6, 1.0, 0)],
  [H.DUR, VC(-2.5, 3.6, 10), VC(0.6, 1.7, -1.5)],
];
export const FOV = 40;
export function camaraEn(f: number) {
  const fr = CAM.map((k) => k[0]);
  const p = new THREE.Vector3(...([0, 1, 2].map((i) => interpolate(f, fr, CAM.map((k) => k[1][i]), {...clamp, easing: suave})) as [number, number, number]));
  const t = new THREE.Vector3(...([0, 1, 2].map((i) => interpolate(f, fr, CAM.map((k) => k[2][i]), {...clamp, easing: suave})) as [number, number, number]));
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
const POSTE = new THREE.CylinderGeometry(0.16, 0.16, ALTO + 1, 10);
const LLANTA = (() => {
  const g = new THREE.TorusGeometry(0.28, 0.1, 6, 16);
  g.rotateY(Math.PI / 2);
  return g;
})();
const CUERPO = new THREE.CapsuleGeometry(0.2, 1.15, 4, 8);
const CABEZA = new THREE.SphereGeometry(0.15, 10, 8);
const CASCO = new THREE.SphereGeometry(0.17, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2);
const AMARRE = (() => {
  const g = new THREE.TorusGeometry(0.16, 0.04, 6, 16);
  g.rotateY(Math.PI / 2);
  return g;
})();
const ANILLO = (() => {
  const g = new THREE.TorusGeometry(1, 0.03, 4, 40);
  g.rotateX(Math.PI / 2);
  return g;
})();

const Muelle: React.FC = () => (
  <group>
    <Holo geom={caja(4, 0.3, 16)} color={MADERA} relleno={0.08} linea={0.6} position={[-2, ALTO - 0.15, 0]} />
    {[-7, -3.5, 0, 3.5, 7].map((z) =>
      [-0.25, -3.6].map((x) => <Holo key={`${z}${x}`} geom={POSTE} color={MADERA} relleno={0.06} linea={0.45} angulo={40} position={[x, (ALTO - 1) / 2, z]} />)
    )}
    {/* llantas de defensa */}
    {[-6, -4.8, -2.2, -1, 1.8, 3, 5.6].map((z) => (
      <Holo key={z} geom={LLANTA} color={BLANCO} relleno={0.06} linea={0.35} angulo={40} position={[0.05, ALTO - 0.6, z]} />
    ))}
    {/* baranda */}
    <Holo geom={caja(0.05, 0.9, 16)} color={MADERA} relleno={0.05} linea={0.3} position={[-0.1, ALTO + 0.45, 0]} />
  </group>
);

const Agua: React.FC<{f: number}> = ({f}) => (
  <group>
    <Holo geom={caja(30, 0.02, 24)} color={C.cian} relleno={0.04} linea={0} position={[6, -0.01, 0]} />
    {Array.from({length: 18}, (_, k) => {
      const x = 0.4 + k * 0.9 + 0.25 * Math.sin(f / 18 + k);
      return <Holo key={k} geom={caja(0.04, 0.01, 14)} color={C.cian} relleno={0.14} linea={0.1} position={[x, 0.01, 0]} />;
    })}
  </group>
);

const Bote: React.FC<{f: number; alerta: number}> = ({f, alerta}) => {
  const balanceo = 0.03 * Math.sin(f / 9) + interpolate(f, [H.PASO - 4, H.PASO + 6, H.PASO + 24], [0, 0.06, 0], clamp) + interpolate(f, [H.MUEVE - 4, H.MUEVE + 6, H.MUEVE + 24], [0, 0.06, 0], clamp);
  const color = alerta > 0 ? '#' + new THREE.Color(C.cian).lerp(new THREE.Color(C.rojo), alerta).getHexString() : C.cian;
  return (
    <group position={[0.95 + baseX(f) - 0.34, 0, 0]} rotation={[balanceo, 0, balanceo * 0.4]}>
      <Holo geom={caja(1.7, 0.55, 5)} color={color} relleno={0.1} linea={0.8} position={[0, CUBIERTA - 0.27, 0]} />
      <Holo geom={caja(1.4, 0.3, 1.2)} color={color} relleno={0.08} linea={0.5} position={[0.2, CUBIERTA + 0.15, -1.4]} />
      <Holo geom={caja(0.5, 0.5, 0.5)} color={color} relleno={0.08} linea={0.5} position={[0.3, CUBIERTA + 0.25, 1.6]} />
    </group>
  );
};

const Escalera: React.FC<{base: THREE.Vector3; ang: number; color: string; op: number}> = ({base, ang, color, op}) => (
  <group position={base} rotation={[0, 0, ang]}>
    {[-0.22, 0.22].map((z) => (
      <Holo key={z} geom={caja(0.06, L, 0.06)} color={color} relleno={0.4 * op} linea={op} position={[0, L / 2, z]} />
    ))}
    {Array.from({length: 10}, (_, k) => (
      <Holo key={k} geom={caja(0.04, 0.04, 0.44)} color={color} relleno={0.4 * op} linea={0.8 * op} position={[0, 0.25 + k * 0.31, 0]} />
    ))}
  </group>
);

// Persona: pies en el origen, cuerpo de 1.75 m, con casco
const Persona: React.FC<{color: string; ang: number; op?: number}> = ({color, ang, op = 1}) => (
  <group rotation={[0, 0, ang]}>
    <Holo geom={CUERPO} color={color} relleno={0.2 * op} linea={0.85 * op} angulo={40} position={[0, 0.78, 0]} />
    <Holo geom={CABEZA} color={color} relleno={0.25 * op} linea={0.8 * op} angulo={40} position={[0, 1.6, 0]} />
    <Holo geom={CASCO} color={BLANCO} relleno={0.25 * op} linea={0.7 * op} angulo={40} position={[0, 1.66, 0]} />
  </group>
);

// zona verde: entre la base y el muelle
const Zona: React.FC<{f: number; op: number}> = ({f, op}) => {
  if (op <= 0) return null;
  const bx = baseX(f);
  return <Holo geom={caja(1, 1, 1)} color={C.verde} relleno={0.12 * op} linea={0.5 * op} position={[bx / 2, ALTO / 2 + 0.1, 0]} scale={[Math.max(0.02, bx), ALTO - 0.2, 0.9]} />;
};

// plomada: del centro de masa al agua
const Plomada: React.FC<{f: number; op: number; color: string}> = ({f, op, color}) => {
  const c = cadera(f);
  const pts = useMemo(() => [c.clone(), new THREE.Vector3(c.x, 0.02, 0)], [c.x, c.y]); // eslint-disable-line react-hooks/exhaustive-deps
  if (op <= 0) return null;
  return (
    <group>
      <Linea puntos={pts} color={color} opacidad={op} />
      <mesh position={c}>
        <sphereGeometry args={[0.1, 12, 10]} />
        <meshBasicMaterial color={color} transparent opacity={op} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
    </group>
  );
};

// Escalera bien puesta (4 a 1): base sobre un bloque firme y punta amarrada
const BIEN_ALTO_BASE = 0.6;
const BIEN_BASE_X = (ALTO - BIEN_ALTO_BASE) / 4;
const BIEN_ANG = Math.atan2(BIEN_BASE_X, ALTO - BIEN_ALTO_BASE);
const LargoBien = Math.hypot(BIEN_BASE_X, ALTO - BIEN_ALTO_BASE);
const Bien: React.FC<{f: number}> = ({f}) => {
  const op = interpolate(f, [H.REGLA - 4, H.REGLA + 20], [0, 1], clamp);
  if (op <= 0) return null;
  const amarre = interpolate(f, [H.AMARRA_W - 6, H.AMARRA_W + 6], [0, 1], clamp);
  const firme = interpolate(f, [H.FIRME - 6, H.FIRME + 6], [0, 1], clamp);
  const cota = interpolate(f, [H.CUATRO - 6, H.CUATRO + 6], [0, 1], clamp);
  const cotaB = interpolate(f, [H.METRO - 10, H.METRO + 2], [0, 1], clamp);
  return (
    <group position={[0, 0, Z_BIEN]}>
      <Holo geom={caja(1.6, BIEN_ALTO_BASE, 1.4)} color={C.verde} relleno={(0.08 + 0.15 * firme) * op} linea={(0.5 + 0.5 * firme) * op} position={[0.8, BIEN_ALTO_BASE / 2, 0]} />
      <group position={[BIEN_BASE_X, BIEN_ALTO_BASE, 0]} rotation={[0, 0, BIEN_ANG]}>
        {[-0.22, 0.22].map((z) => (
          <Holo key={z} geom={caja(0.06, LargoBien, 0.06)} color={C.verde} relleno={0.4 * op} linea={op} position={[0, LargoBien / 2, z]} />
        ))}
        {Array.from({length: 9}, (_, k) => (
          <Holo key={k} geom={caja(0.04, 0.04, 0.44)} color={C.verde} relleno={0.4 * op} linea={0.8 * op} position={[0, 0.25 + k * 0.32, 0]} />
        ))}
      </group>
      {amarre > 0 && <Holo geom={AMARRE} color={C.verde} relleno={0.5 * amarre} linea={amarre} angulo={10} position={[0.02, ALTO - 0.1, 0]} />}
      {cota > 0 && <Linea puntos={[new THREE.Vector3(-0.45, BIEN_ALTO_BASE, 0.6), new THREE.Vector3(-0.45, ALTO, 0.6)]} color={C.ambar} opacidad={cota} />}
      {cotaB > 0 && <Linea puntos={[new THREE.Vector3(0, BIEN_ALTO_BASE + 0.02, 0.6), new THREE.Vector3(BIEN_BASE_X, BIEN_ALTO_BASE + 0.02, 0.6)]} color={C.ambar} opacidad={cotaB} />}
    </group>
  );
};

const Salpicadura: React.FC<{f: number}> = ({f}) => {
  const t = f - CAE_AGUA;
  if (t < 0 || t > 60) return null;
  return (
    <group position={[X_AGUA, 0.02, 0]}>
      {[0, 10, 20].map((d) => {
        const u = (t - d) / 40;
        if (u <= 0 || u >= 1) return null;
        return <mesh key={d} geometry={ANILLO} scale={[0.3 + 1.6 * u, 1, 0.3 + 1.6 * u]}><meshBasicMaterial color={BLANCO} transparent opacity={0.8 * (1 - u)} depthWrite={false} blending={THREE.AdditiveBlending} /></mesh>;
      })}
    </group>
  );
};

const Escena: React.FC<{f: number}> = ({f}) => {
  const aparicion = interpolate(f, [0, 20], [0, 1], clamp);
  const a = fi(f);
  const base = new THREE.Vector3(baseX(f), CUBIERTA, 0);
  const o = obrero(f);
  const c = cadera(f);
  const dentro = c.x <= baseX(f) + 0.02;
  const zona = interpolate(f, [H.ENTRE - 10, H.ENTRE + 4, H.ARBOL + 30, H.ARBOL + 50], [0, 1, 1, 0], clamp);
  const plomada = interpolate(f, [H.PESO - 8, H.PESO + 4, CAE_AGUA - 10, CAE_AGUA], [0, 1, 1, 0], clamp);
  const peligro = interpolate(f, [vuelco0 - 30, vuelco0 + 10], [0, 1], clamp);
  const colorEsc = '#' + new THREE.Color(BLANCO).lerp(new THREE.Color(C.rojo), peligro).getHexString();
  const opViejo = interpolate(f, [H.REGLA, H.REGLA + 30, H.SUERTE, H.SUERTE + 20], [1, 0.35, 0.35, 1], clamp);
  const alertaBote = interpolate(f, [H.FLOTA - 8, H.FLOTA + 4, H.SUERTE, H.SUERTE + 16], [0, 1, 1, 0], clamp);
  // el compañero del bote sostiene la base y, al final, ayuda a subirlo
  const compa = new THREE.Vector3(0.8 + baseX(f) - 0.34, CUBIERTA, 0.45);
  return (
    <group scale={[1, aparicion, 1]}>
      <gridHelper args={[60, 60, C.cian, C.cian]} position={[0, -0.05, 0]}>
        <lineBasicMaterial attach="material" color={C.cian} transparent opacity={0.03} />
      </gridHelper>
      <Muelle />
      <Agua f={f} />
      <Bote f={f} alerta={alertaBote} />
      <Zona f={f} op={zona} />
      <Escalera base={base} ang={a} color={colorEsc} op={opViejo} />
      {/* el compañero del bote */}
      <group position={[compa.x, compa.y, compa.z]}>
        <Persona color={C.cian} ang={interpolate(f, [H.SUBIERON - 10, H.SUBIERON + 10], [0.12, -0.35], clamp)} op={opViejo} />
      </group>
      <group position={[o.pies.x, o.pies.y, o.pies.z]}>
        <Persona color={OBRERO} ang={o.ang} op={Math.max(0.35, opViejo)} />
      </group>
      <Plomada f={f} op={plomada} color={dentro ? C.verde : C.rojo} />
      <Salpicadura f={f} />
      <Bien f={f} />
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
  const ly = Math.min(Math.max(y + dy, 720), 1420);
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
const Item: React.FC<{op: number; icono: string; color: string; activo?: boolean; children: React.ReactNode}> = ({op, icono, color, activo = true, children}) => (
  <div style={{display: 'flex', alignItems: 'center', gap: 20, marginTop: 12, opacity: op * (activo ? 1 : 0.35)}}>
    <span style={{fontFamily: TITULAR, fontWeight: 900, fontSize: 46, color, width: 44, textAlign: 'center'}}>{icono}</span>
    <span style={{fontFamily: TITULAR, fontWeight: 900, fontSize: 42, color: C.blanco}}>{children}</span>
  </div>
);

// ¿Dónde cae su peso?
const PanelPeso: React.FC<{f: number}> = ({f}) => {
  const op = interpolate(f, [H.LINEA + 4, H.LINEA + 18, H.ARBOL + 20, H.ARBOL + 34], [0, 1, 1, 0], clamp);
  if (op <= 0) return null;
  const fuera = f >= H.FUERA - 4;
  return (
    <Panel op={op} color={fuera ? C.rojo : C.verde}>
      <Titulo color={fuera ? C.rojo : C.verde}>¿DÓNDE CAE SU PESO?</Titulo>
      <Item op={interpolate(f, [H.ENTRE - 8, H.ENTRE + 2], [0, 1], clamp)} icono="✓" color={C.verde} activo={!fuera}>
        Entre la base y el muelle: quieta
      </Item>
      <Item op={interpolate(f, [H.FUERA - 8, H.FUERA + 2], [0, 1], clamp)} icono="✕" color={C.rojo}>
        Por fuera: se va hacia atrás
      </Item>
    </Panel>
  );
};

const PanelRegla: React.FC<{f: number}> = ({f}) => {
  const op = interpolate(f, [H.REGLA + 4, H.REGLA + 18, H.SUERTE, H.SUERTE + 14], [0, 1, 1, 0], clamp);
  if (op <= 0) return null;
  return (
    <Panel op={op} color={C.verde}>
      <Titulo color={C.verde}>REGLA 4 A 1 · UNOS 75°</Titulo>
      <div style={{fontFamily: TITULAR, fontWeight: 900, fontSize: 48, color: C.blanco, marginTop: 6, opacity: interpolate(f, [H.CUATRO - 6, H.CUATRO + 4], [0, 1], clamp)}}>
        <span style={{color: C.ambar}}>4 m</span> de alto → base a <span style={{color: C.ambar, opacity: interpolate(f, [H.METRO - 10, H.METRO], [0.2, 1], clamp)}}>1 m</span>
      </div>
      <Item op={interpolate(f, [H.AMARRA_W - 8, H.AMARRA_W + 2], [0, 1], clamp)} icono="✓" color={C.verde}>
        Punta amarrada
      </Item>
      <Item op={interpolate(f, [H.FIRME - 8, H.FIRME + 2], [0, 1], clamp)} icono="✓" color={C.verde}>
        Base sobre algo firme
      </Item>
      <Item op={interpolate(f, [H.FLOTA - 10, H.FLOTA], [0, 1], clamp)} icono="✕" color={C.rojo}>
        Nunca sobre algo que flota
      </Item>
    </Panel>
  );
};

export const Holograma: React.FC = () => {
  const f = useCurrentFrame();
  const entrada = interpolate(f, [0, 12], [0, 1], clamp);
  const salida = interpolate(f, [H.DUR - 25, H.DUR - 5], [1, 0], clamp);
  const barrido = interpolate(f, [0, 22], [-100, 2000], clamp);
  const punta = enEscalera(f, L);
  const mitad = enEscalera(f, L * 0.55);
  const base = new THREE.Vector3(baseX(f), CUBIERTA, 0);
  const c = cadera(f);
  const o = obrero(f);
  const grados = Math.round(90 - (Math.asin(baseX(f) / L) * 180) / Math.PI);
  return (
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, #0b2234 0%, #040b14 60%, #01040a 100%)', opacity: Math.min(entrada, salida)}}>
      <ThreeCanvas width={1080} height={1920} camera={{fov: FOV, near: 0.1, far: 2000, position: [0, 10, 20]}}>
        <Camara f={f} />
        <Escena f={f} />
      </ThreeCanvas>

      <Etiqueta3D f={f} punto={mitad} desde={H.VERTICAL - 6} hasta={H.BOTE1 + 4} color={C.ambar} texto={`Casi vertical: ${grados}°`} dx={40} dy={-200} />
      <Etiqueta3D f={f} punto={base} desde={H.BOTE1 - 4} hasta={H.MUELLE + 10} color={C.cian} texto="Apoyada en un bote" dx={40} dy={160} />
      <Etiqueta3D f={f} punto={base} desde={H.BASE - 4} hasta={H.PUNTA} color={C.cian} texto="Un compañero sostiene la base" dx={40} dy={160} />
      <Etiqueta3D f={f} punto={punta} desde={H.PUNTA - 4} hasta={H.LINEA + 6} color={C.rojo} texto="Punta sin amarrar" dx={40} dy={-140} />
      <Etiqueta3D f={f} punto={c} desde={H.PESO - 4} hasta={H.ENTRE + 30} color={C.verde} texto="Su peso" dx={40} dy={-120} />
      <Etiqueta3D f={f} punto={c} desde={H.FUERA - 6} hasta={H.BOTE2 + 4} color={C.rojo} texto="Por fuera de la base" dx={40} dy={-120} />
      <Etiqueta3D f={f} punto={base} desde={H.PASO - 6} hasta={H.ARBOL} color={C.ambar} texto="El bote se mueve" dx={40} dy={160} />
      <Etiqueta3D f={f} punto={punta} desde={H.GIRA - 8} hasta={H.FRENAR + 16} color={C.rojo} texto="Gira hacia atrás" dx={40} dy={-80} />
      <Etiqueta3D f={f} punto={new THREE.Vector3(BIEN_BASE_X * 0.5, ALTO * 0.55, Z_BIEN)} desde={H.REGLA + 10} hasta={H.AMARRA} color={C.verde} texto="Bien puesta" dx={-40} dy={-160} />
      <Etiqueta3D f={f} punto={new THREE.Vector3(1.2, CUBIERTA, 0)} desde={H.FLOTA - 8} hasta={H.SUERTE + 4} color={C.rojo} texto="Flota: se mueve" dx={40} dy={160} />
      <Etiqueta3D f={f} punto={o.pies.clone().add(new THREE.Vector3(0, 0.4, 0))} desde={H.AGUA - 6} hasta={H.FIN} color={C.verde} texto="Lo subieron al bote" dx={-40} dy={-200} />

      <PanelPeso f={f} />
      <PanelRegla f={f} />
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

export const SPLASH = CAE_AGUA;
