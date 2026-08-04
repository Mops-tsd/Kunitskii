/**
 * Шейдер зданий.
 *
 * Один материал отвечает за весь путь дома: сначала виден только контур —
 * как линия на чертеже, затем внутрь «наливается» объём и загораются окна.
 * Разделять это на два материала было бы дороже: пришлось бы рисовать
 * геометрию дважды.
 */

export const buildingVertex = /* glsl */ `
  attribute vec3 aDims;      // ширина, глубина, высота дома в метрах
  attribute float aDelay;    // сдвиг начала роста, 0..1
  attribute float aSeed;     // персональное зерно для окон

  uniform float uFrame;      // прогресс фазы «поднимаются каркасы»
  uniform float uFill;       // прогресс фазы «заполняются объёмы»

  varying vec2 vUv;
  varying vec2 vGrid;        // координаты в метрах — по ним рисуется сетка окон
  varying vec3 vNormalW;
  varying float vFill;       // насколько заполнен конкретный дом
  varying float vSeed;
  varying float vDepth;

  void main() {
    // Волна: дальние дома трогаются позже ближних.
    float grow = clamp((uFrame - aDelay * 0.6) / 0.4, 0.0, 1.0);
    grow = grow * grow * (3.0 - 2.0 * grow);           // smoothstep

    float fill = clamp((uFill - aDelay * 0.45) / 0.55, 0.0, 1.0);
    fill = fill * fill * (3.0 - 2.0 * fill);

    float h = aDims.z * grow;

    vec3 p = position;
    p.x *= aDims.x;
    p.z *= aDims.y;
    p.y *= h;

    // Сетка окон считается в метрах, иначе окна растягивались бы
    // вместе с домом и на высотке были бы вчетверо крупнее.
    if (abs(normal.y) > 0.5) {
      vGrid = vec2(uv.x * aDims.x, uv.y * aDims.y);
    } else if (abs(normal.x) > 0.5) {
      vGrid = vec2(uv.x * aDims.y, uv.y * h);
    } else {
      vGrid = vec2(uv.x * aDims.x, uv.y * h);
    }

    vUv = uv;
    vFill = fill;
    vSeed = aSeed;
    vNormalW = normalize(mat3(instanceMatrix) * normal);

    vec4 world = instanceMatrix * vec4(p, 1.0);
    vec4 viewPos = modelViewMatrix * world;
    vDepth = -viewPos.z;

    gl_Position = projectionMatrix * viewPos;
  }
`;

export const buildingFragment = /* glsl */ `
  precision highp float;

  uniform vec3 uOutline;   // цвет линии чертежа
  uniform vec3 uBody;      // цвет бетона
  uniform vec3 uWindow;    // цвет света в окнах
  uniform vec3 uFogColor;
  uniform float uTime;
  uniform float uFogNear;
  uniform float uFogFar;

  varying vec2 vUv;
  varying vec2 vGrid;
  varying vec3 vNormalW;
  varying float vFill;
  varying float vSeed;
  varying float vDepth;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  void main() {
    // --- контур грани, толщиной ровно в пиксель на любом расстоянии
    vec2 fw = fwidth(vUv);
    vec2 edgeDist = min(vUv, 1.0 - vUv) / max(fw, vec2(1e-5));
    float edge = 1.0 - smoothstep(0.6, 2.2, min(edgeDist.x, edgeDist.y));

    // --- мягкая подсветка по нормали, без настоящих источников света
    vec3 lightDir = normalize(vec3(-0.4, 0.85, 0.35));
    float lambert = 0.28 + 0.72 * max(dot(normalize(vNormalW), lightDir), 0.0);

    // --- окна: сетка 1.6 × 1.1 м, горит примерно каждое третье
    vec2 cellId = floor(vGrid / vec2(1.6, 1.1));
    vec2 cell = fract(vGrid / vec2(1.6, 1.1));

    float pane =
      smoothstep(0.16, 0.24, cell.x) * (1.0 - smoothstep(0.70, 0.78, cell.x)) *
      smoothstep(0.22, 0.30, cell.y) * (1.0 - smoothstep(0.66, 0.74, cell.y));

    float roll = hash(cellId + vSeed * 37.0);
    // Часть окон медленно «дышит» — город выглядит живым, а не отрендеренным.
    float flicker = 0.75 + 0.25 * sin(uTime * 0.7 + roll * 43.0);
    float lit = step(0.62, roll) * flicker;

    // Крыши не светятся.
    lit *= step(0.5, 1.0 - abs(normalize(vNormalW).y));

    vec3 color = uBody * lambert * vFill;
    color += uWindow * pane * lit * vFill * 1.35;
    // Контур виден с самого начала и слегка гаснет, когда появился объём.
    color += uOutline * edge * (0.85 - 0.45 * vFill);

    // Туман прячет край сцены — дальние дома тают, а не обрываются.
    float fog = smoothstep(uFogNear, uFogFar, vDepth);
    color = mix(color, uFogColor, fog);

    float alpha = 1.0 - fog * 0.85;
    if (alpha < 0.01) discard;

    gl_FragColor = vec4(color, alpha);
  }
`;
