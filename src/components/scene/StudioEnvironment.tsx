'use client';

import { useEffect, useState } from 'react';
import { useThree } from '@react-three/fiber';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import * as THREE from 'three';

/**
 * Image-based lighting for the headline's glass.
 *
 * Clearcoat and iridescence are almost entirely reflection: with nothing to
 * reflect, a physical material renders as flat plastic and the whole point of
 * extruding the letters is lost. This supplies something — three's own room,
 * pre-filtered into an environment map.
 *
 * Built rather than downloaded. An HDR of a real room would light it slightly
 * better and cost one to two megabytes on the opening shot, which is the one
 * place on this page that cannot afford it.
 *
 * Generated in an effect, never during render. Pre-filtering binds its own
 * render targets and draws into them; done in the render phase it interleaves
 * with the frame loop and leaves the renderer pointed at the wrong target, so
 * the canvas goes black and stays there. That failure is silent — no warning,
 * no exception, just an empty scene — so it is worth naming here.
 *
 * The backdrops are unlit MeshBasicMaterial and ignore this entirely; the only
 * other thing it reaches is the bagging line, which it flatters.
 */
export default function StudioEnvironment() {
  const { gl } = useThree();
  const [texture, setTexture] = useState<THREE.Texture | null>(null);

  useEffect(() => {
    let generated: THREE.Texture | null = null;

    // Deferred a frame rather than run inline: it keeps the pre-filter clear of
    // both React's commit and the frame loop, and keeps the state write off the
    // effect's own synchronous path.
    const frame = requestAnimationFrame(() => {
      const pmrem = new THREE.PMREMGenerator(gl);
      const room = new RoomEnvironment();
      generated = pmrem.fromScene(room, 0.04).texture;
      room.dispose();
      pmrem.dispose();
      setTexture(generated);
    });

    return () => {
      cancelAnimationFrame(frame);
      generated?.dispose();
    };
  }, [gl]);

  if (!texture) return null;
  return <primitive object={texture} attach="environment" />;
}
