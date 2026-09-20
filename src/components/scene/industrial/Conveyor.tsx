'use client';

import { useMemo } from 'react';
import { MACHINE } from './materials';

/**
 * A run of belt conveyor: side rails, legs, idler rollers and the belt itself.
 *
 * Built as a run along Z so the camera can travel its length, which is how the
 * line is actually read — you follow the product rather than watch it from the
 * side.
 */
export default function Conveyor({
  from,
  to,
  width = 2.3,
  height = -2.4,
}: {
  /** Start and end along Z. */
  from: number;
  to: number;
  width?: number;
  height?: number;
}) {
  const length = Math.abs(to - from);
  const midZ = (from + to) / 2;

  const rollers = useMemo(() => {
    const spacing = 1.9;
    const count = Math.max(2, Math.floor(length / spacing));
    return Array.from({ length: count }, (_, i) => from + (i + 0.5) * (length / count) * Math.sign(to - from));
  }, [from, to, length]);

  const legs = useMemo(() => {
    const spacing = 7.5;
    const count = Math.max(2, Math.floor(length / spacing));
    return Array.from({ length: count }, (_, i) => from + (i + 0.5) * (length / count) * Math.sign(to - from));
  }, [from, to, length]);

  return (
    <group>
      {/* Belt bed */}
      <mesh position={[0, height, midZ]} material={MACHINE.belt}>
        <boxGeometry args={[width, 0.09, length]} />
      </mesh>

      {/* Side rails */}
      {[-1, 1].map((side) => (
        <mesh
          key={side}
          position={[side * (width / 2 + 0.12), height + 0.12, midZ]}
          material={MACHINE.frame}
        >
          <boxGeometry args={[0.16, 0.42, length]} />
        </mesh>
      ))}

      {/* Idler rollers, just proud of the belt line */}
      {rollers.map((z) => (
        <mesh
          key={`r${z.toFixed(2)}`}
          position={[0, height - 0.11, z]}
          rotation={[0, 0, Math.PI / 2]}
          material={MACHINE.steelDark}
        >
          <cylinderGeometry args={[0.13, 0.13, width * 0.98, 10]} />
        </mesh>
      ))}

      {/* Legs and cross bracing */}
      {legs.map((z) => (
        <group key={`l${z.toFixed(2)}`} position={[0, 0, z]}>
          {[-1, 1].map((side) => (
            <mesh
              key={side}
              position={[side * (width / 2), height - 1.35, 0]}
              material={MACHINE.frameDark}
            >
              <boxGeometry args={[0.16, 2.6, 0.16]} />
            </mesh>
          ))}
          <mesh position={[0, height - 2.5, 0]} material={MACHINE.frameDark}>
            <boxGeometry args={[width + 0.3, 0.12, 0.12]} />
          </mesh>
        </group>
      ))}
    </group>
  );
}
