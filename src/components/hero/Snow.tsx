'use client';

import { useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { PHASE, heroState, span } from './heroState';
import { PALETTE } from '@/lib/palette';

/**
 * Снег с боковым ветром.
 *
 * Второй смысловой акцент сцены после свай: климат — не декорация,
 * а условие задачи. Снег усиливается к финалу, когда камера отъезжает
 * и открывается весь силуэт города.
 *
 * Считается целиком на GPU: позиции частиц не пересчитываются на CPU,
 * вершинный шейдер сам гоняет их по циклу падения.
 */

const snowVertex = /* glsl */ `
  attribute float aSpeed;
  attribute float aScale;
  attribute float aPhase;

  uniform float uTime;
  uniform float uIntensity;
  uniform float uHeight;
  uniform float uPixelRatio;

  varying float vAlpha;

  void main() {
    vec3 p = position;

    // Падение по кольцу: долетев до земли, частица мгновенно возвращается наверх.
    float fall = mod(uTime * aSpeed + aPhase * uHeight, uHeight);
    p.y = uHeight - fall;

    // Ветер сносит вбок и слегка закручивает.
    p.x += sin(uTime * 0.35 + aPhase * 6.28) * 3.5 + fall * 0.32;
    p.z += cos(uTime * 0.27 + aPhase * 6.28) * 2.4;

    vec4 viewPos = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * viewPos;

    // Дальние снежинки мельче — иначе снег выглядит плоской пеленой.
    gl_PointSize = aScale * uPixelRatio * (170.0 / max(-viewPos.z, 1.0));

    // Гасим у самой земли и у верхней границы, чтобы не было видно стыка цикла.
    float edge = smoothstep(0.0, 6.0, p.y) * (1.0 - smoothstep(uHeight - 12.0, uHeight, p.y));
    vAlpha = edge * uIntensity;
  }
`;

const snowFragment = /* glsl */ `
  precision mediump float;
  uniform vec3 uColor;
  varying float vAlpha;

  void main() {
    // Круглая мягкая точка вместо квадрата.
    vec2 d = gl_PointCoord - 0.5;
    float mask = 1.0 - smoothstep(0.22, 0.5, length(d));
    float alpha = mask * vAlpha;
    if (alpha < 0.01) discard;
    gl_FragColor = vec4(uColor, alpha);
  }
`;

const FIELD = 560;
const HEIGHT = 300;

export function Snow({ count, pixelRatio }: { count: number; pixelRatio: number }) {
  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const speed = new Float32Array(count);
    const scale = new Float32Array(count);
    const phase = new Float32Array(count);

    for (let i = 0; i < count; i += 1) {
      positions[i * 3 + 0] = (Math.random() - 0.5) * FIELD;
      positions[i * 3 + 1] = 0; // реальная высота считается в шейдере
      positions[i * 3 + 2] = (Math.random() - 0.5) * FIELD;
      speed[i] = 2.5 + Math.random() * 6;
      scale[i] = 0.8 + Math.random() * 2.4;
      phase[i] = Math.random();
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('aSpeed', new THREE.BufferAttribute(speed, 1));
    geo.setAttribute('aScale', new THREE.BufferAttribute(scale, 1));
    geo.setAttribute('aPhase', new THREE.BufferAttribute(phase, 1));
    geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, HEIGHT / 2, 0), 400);
    return geo;
  }, [count]);

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: snowVertex,
        fragmentShader: snowFragment,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: {
          uTime: { value: 0 },
          uIntensity: { value: 0 },
          uHeight: { value: HEIGHT },
          uPixelRatio: { value: pixelRatio },
          uColor: { value: new THREE.Color(PALETTE.snow) },
        },
      }),
    [pixelRatio]
  );

  useFrame((_, delta) => {
    material.uniforms.uTime.value += delta;
    // Снег начинает идти на фазе заполнения и набирает силу к финалу.
    const early = span(heroState.progress, PHASE.lights[0], PHASE.lights[1]) * 0.45;
    const late = span(heroState.progress, PHASE.pullback[0], PHASE.pullback[1]) * 0.55;
    material.uniforms.uIntensity.value = early + late;
  });

  return <points geometry={geometry} material={material} renderOrder={3} />;
}
