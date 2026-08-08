/**
 * Шейдер зданий.
 *
 * Один материал отвечает за весь путь дома: сначала это каркас —
 * стойки и перекрытия, как на стройке, затем в него «наливается» объём,
 * появляются простенки и загораются окна. Разделять это на два материала
 * было бы дороже: пришлось бы рисовать геометрию дважды.
 *
 * Всё, что делает картинку похожей на настоящий дом, держится на одном
 * решении: и рост, и окна, и перекрытия считаются в этажах, а не в
 * условных долях. Этаж — это метры, поэтому окна на высотке и на
 * пятиэтажке одного размера, а дом растёт захватками, а не тянется.
 */

export const buildingVertex = /* glsl */ `
  attribute vec3 aDims;      // ширина, глубина, высота дома в метрах
  attribute float aDelay;    // сдвиг начала роста, 0..1
  attribute float aSeed;     // персональное зерно для окон

  uniform float uBuild;      // прогресс волны работ по всей площадке
  uniform float uLights;     // насколько город обжит — общий множитель окон
  uniform float uStorey;     // высота этажа в метрах

  varying vec2 vUv;
  varying vec2 vGrid;        // координаты в метрах — по ним рисуется фасад
  varying vec3 vNormalW;
  varying float vFill;       // насколько заполнен конкретный дом
  varying float vLit;        // насколько горят окна этого дома
  varying float vSeed;
  varying float vDepth;
  varying float vTop;        // высота дома на этом кадре, в метрах

  void main() {
    /*
     * Личное время дома. Волна работ расходится от центра наружу:
     * каждый дом проходит свой путь целиком — каркас, следом бетон, —
     * а не ждёт, пока весь город достоит скелет.
     */
    float local = uBuild * 1.6 - aDelay * 0.85;

    float grow = smoothstep(0.0, 0.30, local);
    float fill = smoothstep(0.34, 0.66, local);

    /*
     * Дом растёт этажами, а не тянется вверх плавно: очередная захватка
     * набирается быстро, потом пауза до следующей. Непрерывный рост
     * читается как резиновый — именно эта деталь сильнее всего выдавала,
     * что смотришь на анимацию, а не на стройку.
     */
    float floors = aDims.z / uStorey * grow;
    float shaped = floor(floors) + smoothstep(0.0, 0.6, fract(floors));
    float h = shaped * uStorey;

    vec3 p = position;
    p.x *= aDims.x;
    p.z *= aDims.y;
    p.y *= h;

    // Фасад размечается в метрах, иначе окна растягивались бы вместе
    // с домом и на высотке были бы вчетверо крупнее.
    if (abs(normal.y) > 0.5) {
      vGrid = vec2(uv.x * aDims.x, uv.y * aDims.y);
    } else if (abs(normal.x) > 0.5) {
      vGrid = vec2(uv.x * aDims.y, uv.y * h);
    } else {
      vGrid = vec2(uv.x * aDims.x, uv.y * h);
    }

    vUv = uv;
    vFill = fill;
    // Свет появляется только в достроенном доме и только когда
    // на площадку опускается вечер.
    vLit = fill * uLights;
    vSeed = aSeed;
    vTop = h;
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
  uniform vec3 uConcrete;  // цвет стены
  uniform vec3 uRoof;      // цвет кровли
  uniform vec3 uWindow;    // цвет света в окнах
  uniform vec3 uFogColor;
  uniform float uTime;
  uniform float uStorey;
  uniform float uFogNear;
  uniform float uFogFar;

  varying vec2 vUv;
  varying vec2 vGrid;
  varying vec3 vNormalW;
  varying float vFill;
  varying float vLit;
  varying float vSeed;
  varying float vDepth;
  varying float vTop;

  /*
   * Хеш без sin(). Привычный fract(sin(dot(p, ...)) * 43758.5) на больших
   * аргументах разваливается: во float32 у синуса не остаётся точности,
   * и вместо одного значения на окно получалась рябь внутри каждого окна.
   */
  float hash(vec2 p) {
    vec3 q = fract(vec3(p.xyx) * 0.1031);
    q += dot(q, q.yzx + 33.33);
    return fract((q.x + q.y) * q.z);
  }

  /** Линия постоянной экранной толщины вокруг значения 0 или 1 у coord. */
  float ruledLine(float coord, float width) {
    float d = min(fract(coord), 1.0 - fract(coord));
    return 1.0 - smoothstep(0.0, width * fwidth(coord), d);
  }

  void main() {
    vec3 n = normalize(vNormalW);
    float roofness = step(0.5, abs(n.y));

    // --- контур грани, толщиной ровно в пиксель на любом расстоянии
    vec2 fw = fwidth(vUv);
    vec2 edgeDist = min(vUv, 1.0 - vUv) / max(fw, vec2(1e-5));
    float edge = 1.0 - smoothstep(0.6, 2.2, min(edgeDist.x, edgeDist.y));

    // --- разметка фасада в этажах
    float floorCoord = vGrid.y / uStorey;
    float floorId = floor(floorCoord);
    float inFloor = fract(floorCoord);

    // Шаг оконной оси. 3.2 м — обычная ширина комнаты в панельном доме.
    float bayCoord = vGrid.x / 3.2;
    float bayId = floor(bayCoord);
    float inBay = fract(bayCoord);

    /*
     * Каркас: перекрытия и стойки. Пока объём не налит, дом выглядит
     * ровно так, как выглядит недостроенный — стопкой плит на колоннах.
     * Раньше на этой фазе была видна только коробка, и стройка читалась
     * как проволочная модель.
     */
    float slab = ruledLine(floorCoord, 1.6) * (1.0 - roofness);
    float column = ruledLine(bayCoord * 0.5, 1.4) * (1.0 - roofness);
    float skeleton = max(slab, column * 0.55);

    // --- окно внутри этажа: снизу глухой пояс перекрытия, сверху перемычка
    float pane =
      smoothstep(0.13, 0.19, inBay) * (1.0 - smoothstep(0.81, 0.87, inBay)) *
      smoothstep(0.30, 0.36, inFloor) * (1.0 - smoothstep(0.86, 0.92, inFloor));
    pane *= 1.0 - roofness;
    // Недостроенный верхний этаж окон ещё не имеет — иначе на срезе
    // растущего дома висел бы ряд половинок.
    pane *= step((floorId + 1.0) * uStorey, vTop + 0.01);

    /*
     * Свет горит квартирами, а не отдельными окнами: одно зерно на пару
     * соседних осей. Случайное посветление каждого окна по отдельности
     * давало рябь, из-за которой фасад читался как шум.
     */
    float roll = hash(vec2(floor(bayId * 0.5), floorId) + vSeed * 11.0);
    // Нижние этажи обжиты плотнее — там входные группы и встроенные помещения.
    float lowBoost = 1.0 + 0.25 * (1.0 - smoothstep(0.0, 7.0, floorId));
    float lit = step(0.68, roll * lowBoost);
    // Часть окон медленно «дышит» — город выглядит живым, а не отрендеренным.
    lit *= 0.7 + 0.3 * sin(uTime * 0.6 + roll * 43.0);
    // Внутри квартиры окна светят чуть по-разному.
    lit *= 0.75 + 0.35 * hash(vec2(bayId, floorId) + vSeed);

    // --- освещение
    vec3 lightDir = normalize(vec3(-0.45, 0.72, 0.52));
    float lambert = 0.16 + 0.84 * max(dot(n, lightDir), 0.0);
    // Небо светит сверху: горизонтальные грани всегда светлее вертикальных.
    float sky = 0.45 + 0.55 * (n.y * 0.5 + 0.5);
    // У земли между корпусами темнее — свет туда не доходит.
    float ao = mix(0.45, 1.0, smoothstep(0.0, 14.0, vGrid.y));

    vec3 surface = mix(uConcrete, uRoof, roofness);
    // Тёмное стекло: непогашенное окно должно быть темнее стены, а не
    // просто её повторять — иначе фасад выглядит глухой панелью.
    surface = mix(surface, surface * 0.42, pane);
    float shade = mix(lambert * 0.75 + sky * 0.45, sky * 0.8, roofness);

    vec3 color = surface * shade * mix(ao, 1.0, roofness) * vFill;

    /*
     * Каркас гасится с расстоянием отдельно от тумана: дом рядом должен
     * читаться линиями, а полсотни таких же за ним — уже нет, иначе
     * экран забивается сеткой и в ней тонет всё остальное.
     */
    float nearFrame = 0.25 + 0.75 * (1.0 - smoothstep(35.0, 150.0, vDepth));

    // Перекрытия видны и на готовом доме — межэтажным поясом.
    color += uOutline * slab * (0.14 + 0.28 * (1.0 - vFill)) * nearFrame;
    color += uOutline * skeleton * (1.0 - vFill) * 0.30 * nearFrame;
    color += uWindow * pane * lit * vLit * 1.15;
    // Контур виден с самого начала и слегка гаснет, когда появился объём.
    color += uOutline * edge * (0.62 - 0.32 * vFill);

    // Туман прячет край сцены — дальние дома тают, а не обрываются.
    // Он работает цветом, а не прозрачностью: полупрозрачный дом
    // показывал сквозь себя окна тех, что стоят за ним, и весь фасад
    // рассыпался в рябь.
    float fog = smoothstep(uFogNear, uFogFar, vDepth);
    color = mix(color, uFogColor, fog);

    /*
     * Прозрачность зависит только от того, налит ли объём. Пока дом —
     * каркас, видны одни линии и сквозь них смотрится вся стройка;
     * как только появился бетон, грань становится глухой.
     */
    float ink = max(edge, max(skeleton, slab));
    /*
     * Грань становится глухой, едва появился бетон, — раньше, чем стена
     * доберёт свой цвет. Пока alpha шла вровень с заливкой, сквозь
     * недокрашенный фасад просвечивали окна противоположной стены.
     */
    float alpha = clamp(max(smoothstep(0.0, 0.3, vFill), ink), 0.0, 1.0);
    if (alpha < 0.01) discard;

    gl_FragColor = vec4(color, alpha);
  }
`;
