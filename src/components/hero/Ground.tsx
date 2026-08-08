'use client';

import { useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { PHASE, heroState, span } from './heroState';
import { AVENUE, PITCH, STREET } from './cityLayout';
import { PALETTE } from '@/lib/palette';

/**
 * Плита основания.
 *
 * Без неё дома висели в пустоте на светящихся сваях — сцена читалась
 * как схема, а не как стройка. Плита появляется волной от центра сразу
 * после того, как забиты сваи: сначала основание, потом на нём растут
 * корпуса. Заодно она закрывает сваи снизу, и они перестают торчать
 * из-под готовых домов.
 *
 * На плите видна уличная сеть — та же, по которой расставлены кварталы
 * (см. cityLayout). Именно она на отлёте камеры показывает, что это
 * спланированный район, а не набор коробок.
 */

const groundVertex = /* glsl */ `
  varying vec2 vWorld;
  void main() {
    vec4 world = modelMatrix * vec4(position, 1.0);
    vWorld = world.xz;
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`;

const groundFragment = /* glsl */ `
  precision mediump float;

  uniform float uReveal;    // радиус залитой плиты, в метрах
  uniform float uPitch;     // шаг уличной сетки
  uniform float uStreet;    // ширина проезда
  uniform float uAvenue;    // насколько осевой проспект шире рядового проезда
  uniform vec3 uSlab;
  uniform vec3 uStreetColor;
  uniform vec3 uFogColor;
  uniform vec3 uEdge;

  varying vec2 vWorld;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  void main() {
    float dist = length(vWorld);

    // Плита разливается кольцом от центра; за фронтом ничего нет.
    float poured = 1.0 - smoothstep(uReveal - 10.0, uReveal, dist);
    if (poured < 0.02) discard;

    /*
     * Расстояние до ближайшей оси улицы. Кварталы сдвинуты на полшага,
     * поэтому оси сетки приходятся ровно на проезды.
     *
     * По оси X застройка дополнительно раздвинута на ширину проспекта
     * (см. cityLayout) — здесь этот сдвиг снимается, иначе разметка на
     * плите не совпала бы с домами, которые на ней стоят.
     */
    float ax = abs(vWorld.x);
    float lattice = max(ax - uAvenue, 0.0);
    vec2 toAxis = vec2(
      abs(fract(lattice / uPitch + 0.5) - 0.5) * uPitch,
      abs(fract(vWorld.y / uPitch + 0.5) - 0.5) * uPitch
    );
    // Внутри проспекта покрытие сплошное, разбивать его на кварталы нечем.
    float onAvenue = 1.0 - smoothstep(uAvenue - 1.0, uAvenue + uStreet * 0.5, ax);
    float nearest = min(toAxis.x, toAxis.y);
    float onStreet = max(
      1.0 - smoothstep(uStreet * 0.34, uStreet * 0.5, nearest),
      onAvenue
    );

    // Крупное пятно неровности: снег ложится неравномерно, ровная
    // заливка выглядит как пластик.
    float grain = hash(floor(vWorld * 0.45)) * 0.16;

    vec3 color = mix(uSlab, uStreetColor, onStreet) * (0.88 + grain);

    // Осевая разметка по центру проезда и по оси проспекта.
    float axis = max(
      1.0 - smoothstep(0.0, 0.5, nearest),
      1.0 - smoothstep(0.0, 0.5, ax)
    );
    color += uEdge * axis * 0.1;

    // Светящийся фронт заливки.
    float front = exp(-pow((dist - uReveal) / 6.0, 2.0));
    color += uEdge * front * 0.55;

    // Дальний край уводим в туман, чтобы плита не обрывалась линией.
    color = mix(color, uFogColor, smoothstep(110.0, 330.0, dist));

    gl_FragColor = vec4(color, 1.0);
  }
`;

export function Ground() {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: groundVertex,
        fragmentShader: groundFragment,
        // Плита непрозрачна там, где залита, и отбрасывается там, где нет.
        // Полупрозрачности не нужно: сваи должны именно скрываться под ней,
        // а не просвечивать сквозь бетон.
        transparent: false,
        depthWrite: true,
        uniforms: {
          uReveal: { value: 0 },
          uPitch: { value: PITCH },
          uStreet: { value: STREET },
          uAvenue: { value: AVENUE },
          uSlab: { value: new THREE.Color(PALETTE.slab) },
          uStreetColor: { value: new THREE.Color(PALETTE.street) },
          uFogColor: { value: new THREE.Color(PALETTE.void) },
          uEdge: { value: new THREE.Color(PALETTE.gridMajor) },
        },
      }),
    []
  );

  useFrame(() => {
    /*
     * Заливка идёт от конца свайных работ и обгоняет волну каркасов:
     * к моменту, когда поднимается очередной корпус, плита под ним уже
     * есть. Порядок здесь не косметика — если дом встанет раньше
     * основания, вся последовательность перестанет читаться.
     */
    const poured = span(heroState.progress, PHASE.slab[0], PHASE.slab[1]);
    material.uniforms.uReveal.value = poured * 430;
  });

  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, 0, 0]}
      material={material}
      renderOrder={0}
      frustumCulled={false}
    >
      <planeGeometry args={[720, 720]} />
    </mesh>
  );
}
