/*
 * The avatar's geometry: a sculpted head with glasses, side-part hair, a black
 * cap and a sweater, all built from Three.js primitives (no model file needed).
 * Tweak PALETTE to restyle it — e.g. skin tone, hair, cap or glasses colour,
 * HAIRLINE to move the hairline, HAIR for how voluminous the top is, and
 * CAP to move or remove the cap.
 */
import * as THREE from 'three';

THREE.ColorManagement.legacyMode = false;

type Vec3 = [number, number, number];

const PALETTE = {
  skin: 0xd09a6e,
  hair: 0x2a2629,
  sweater: 0x1b1922,
  rib: 0x2a2633,
  eyeWhite: 0xfbf8f4,
  iris: 0x5a3a22,
  pupil: 0x120c08,
  brow: 0x2a1c14,
  lipUpper: 0xb8695f,
  lipLower: 0xc97b70,
  lipLine: 0x7a3b34,
  frame: 0x16141a,
  lens: 0xcfe0ff,
  cap: 0x151417,
  capSeam: 0x2b292f,
};
const HEAD_Y = 0.9; // head centre inside the head group
const EYE_Y = 1.05;
const EYE_X = 0.35;
const LENS_Z = 1.0;
const LID_OPEN = -0.45;
// Where the hair ends, as a fraction of π measured down from the crown.
const HAIRLINE = { front: 0.25, side: 0.45, back: 0.62 };
// Black baseball cap. Set enabled: false to show the full swept-up hairstyle instead.
// rim: where the cap's edge sits (fraction of π from the top); brim.y: visor height.
const CAP = {
  enabled: true,
  thickness: 0.1,
  rim: { front: 0.3, side: 0.4, back: 0.42 },
  brim: { y: 1.64, reachX: 0.96, reachZ: 1.5, inner: [0.8, 0.74] as const, tilt: 0.17, pivotZ: 0.75 },
};
// base: thickness on the short sides; volume: extra lift on top; partX: where the side part sits (+x = avatar's left).
// Under the cap the quiff is flattened so it doesn't poke through.
const HAIR = { base: 0.045, volume: CAP.enabled ? 0.03 : 0.36, partX: 0.45 };
const EDGE_ROUND = 0.18; // last part of each strand that curls in to meet the scalp

type Materials = ReturnType<typeof makeMaterials>;

export interface Eye {
  group: THREE.Group;
  /** Iris + pupil + shine, shifted to follow the cursor. */
  look: THREE.Group;
  lid: THREE.Mesh;
}

export interface Avatar {
  head: THREE.Group;
  eyes: Eye[];
  torso: THREE.Group;
  lidOpen: number;
}

const sphere = (r: number, w = 48, h = 32) => new THREE.SphereGeometry(r, w, h);

function makeMaterials() {
  const std = (color: number, roughness: number, extra: THREE.MeshStandardMaterialParameters = {}) =>
    new THREE.MeshStandardMaterial({ color, roughness, metalness: 0, ...extra });
  return {
    skin: std(PALETTE.skin, 0.5),
    lid: std(PALETTE.skin, 0.5, { side: THREE.DoubleSide }),
    cap: std(PALETTE.cap, 0.8, { side: THREE.DoubleSide }),
    capSeam: std(PALETTE.capSeam, 0.7),
    hair: std(PALETTE.hair, 0.45, { map: strandTexture() }),
    sweater: std(PALETTE.sweater, 0.92),
    rib: std(PALETTE.rib, 0.85),
    eyeWhite: std(PALETTE.eyeWhite, 0.2),
    iris: std(PALETTE.iris, 0.3),
    pupil: std(PALETTE.pupil, 0.1),
    shine: new THREE.MeshBasicMaterial({ color: 0xffffff }),
    brow: std(PALETTE.brow, 0.85),
    lipUpper: std(PALETTE.lipUpper, 0.45),
    lipLower: std(PALETTE.lipLower, 0.4),
    lipLine: std(PALETTE.lipLine, 0.7),
    frame: std(PALETTE.frame, 0.25, { metalness: 0.3 }),
    lens: new THREE.MeshPhysicalMaterial({
      color: PALETTE.lens,
      roughness: 0.05,
      transparent: true,
      opacity: 0.16,
      clearcoat: 1,
      depthWrite: false,
      side: THREE.DoubleSide,
    }),
  };
}

interface PartOptions {
  position?: Vec3;
  rotation?: Vec3;
  scale?: Vec3;
}

function part(geometry: THREE.BufferGeometry, material: THREE.Material, opts: PartOptions = {}) {
  const mesh = new THREE.Mesh(geometry, material);
  if (opts.position) mesh.position.set(...opts.position);
  if (opts.rotation) mesh.rotation.set(...opts.rotation);
  if (opts.scale) mesh.scale.set(...opts.scale);
  return mesh;
}

/** A cylinder stretched between two points (used for the glasses arms). */
function rod(from: Vec3, to: Vec3, radius: number, material: THREE.Material) {
  const start = new THREE.Vector3(...from);
  const end = new THREE.Vector3(...to);
  const dir = end.clone().sub(start);
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, dir.length(), 12), material);
  mesh.position.copy(start).addScaledVector(dir, 0.5);
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
  return mesh;
}

const smoothstep = (t: number) => {
  const c = Math.min(1, Math.max(0, t));
  return c * c * (3 - 2 * c);
};

/**
 * Bends a point on a unit sphere into the head shape: broad at the
 * cheekbones, easing into a soft, rounded U-shaped jaw, with a flatter face.
 * Mutates and returns `v` — it runs per vertex, so it avoids allocating.
 */
function sculpt(v: THREE.Vector3) {
  const cheeks = Math.exp(-((v.y + 0.35) ** 2) / 0.18);
  const cheekbones = Math.exp(-((v.y + 0.05) ** 2) / 0.1);
  const jaw = v.y < -0.15 ? smoothstep((-0.15 - v.y) / 0.85) : 0;
  v.x *= (1 + 0.04 * cheekbones) * (1 - 0.12 * jaw);
  if (v.z > 0) v.z *= 0.92 + 0.06 * cheeks;
  if (v.y < -0.65) {
    const chin = (-0.65 - v.y) / 0.35;
    v.z *= 1 + 0.04 * chin; // chin pushes forward a little
  }
  v.y *= 1.1;
  return v;
}

function headGeometry() {
  const geometry = new THREE.SphereGeometry(1, 96, 72);
  const pos = geometry.attributes.position as THREE.BufferAttribute;
  const v = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    sculpt(v.fromBufferAttribute(pos, i));
    pos.setXYZ(i, v.x, v.y, v.z);
  }
  geometry.computeVertexNormals();
  return geometry;
}

/** Fine light/dark streaks running from the crown to the hair ends. */
function strandTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 4;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    for (let x = 0; x < canvas.width; x++) {
      const shade = Math.round(215 + Math.random() * 40);
      ctx.fillStyle = `rgb(${shade}, ${shade}, ${shade})`;
      ctx.fillRect(x, 0, 1, canvas.height);
    }
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.encoding = THREE.sRGBEncoding;
  return texture;
}

/** Polar angle where the hair ends: a high rounded hairline in front, short sides, nape at the back. */
function hairlineAt(phi: number) {
  const front = Math.sin(phi); // 1 = facing forward, -1 = back of the head
  const across = Math.abs(Math.cos(phi)); // 0 = centre of the forehead, 1 = over the ear
  if (front <= 0) return (HAIRLINE.side + (HAIRLINE.back - HAIRLINE.side) * -front) * Math.PI;
  return (HAIRLINE.front + (HAIRLINE.side - HAIRLINE.front) * across ** 2) * Math.PI;
}

/**
 * Extra height of the swept-up top (a pompadour): tallest at the front,
 * fuller on the side away from the part, and kept off the short sides.
 */
function volumeAt(dir: THREE.Vector3) {
  const top = smoothstep((dir.y - 0.2) / 0.6);
  const forward = 0.5 + 0.5 * Math.max(0, dir.z);
  const sweep = 0.65 + 0.35 * smoothstep((HAIR.partX - dir.x) / 0.25);
  const narrow = smoothstep((0.92 - Math.abs(dir.x)) / 0.4);
  return HAIR.volume * top * forward * sweep * narrow;
}

/**
 * Side-part hairstyle: one shell that hugs the head, short and tight on the
 * sides and back, lifted into a rounded quiff on top, with a groove for the part.
 */
function hairGeometry() {
  const geometry = new THREE.SphereGeometry(1, 192, 80);
  const pos = geometry.attributes.position as THREE.BufferAttribute;
  const uv = geometry.attributes.uv as THREE.BufferAttribute;
  const dir = new THREE.Vector3();
  const v = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    const phi = uv.getX(i) * Math.PI * 2;
    const along = 1 - uv.getY(i); // 0 at the crown, 1 at the hairline
    const theta = along * hairlineAt(phi);
    dir.set(-Math.cos(phi) * Math.sin(theta), Math.cos(theta), Math.sin(phi) * Math.sin(theta));

    const partLine = Math.exp(-(((dir.x - HAIR.partX) / 0.045) ** 2));
    const groove = partLine * smoothstep((dir.y - 0.3) / 0.3) * smoothstep((dir.z + 0.6) / 0.6);
    // Round the ends over so they meet the scalp — no thin, see-through edge.
    const tip = Math.max(0, (along - (1 - EDGE_ROUND)) / EDGE_ROUND);
    const curl = 1 - smoothstep(tip);
    const thickness = (HAIR.base + volumeAt(dir)) * (1 - 0.7 * groove) * curl - 0.03 * tip;

    sculpt(v.copy(dir).multiplyScalar(1 + thickness));
    pos.setXYZ(i, v.x, v.y, v.z);
  }
  geometry.computeVertexNormals();
  return geometry;
}

function buildHair(m: Materials) {
  return part(hairGeometry(), m.hair, { position: [0, HEAD_Y, 0] });
}

/** Polar angle of the cap's lower edge: sits above the brows in front, lower at the back. */
function capRimAt(phi: number) {
  const front = Math.sin(phi);
  const { rim } = CAP;
  return (front >= 0 ? rim.side + (rim.front - rim.side) * front : rim.side + (rim.back - rim.side) * -front) * Math.PI;
}

/** A point on the cap crown (head-local), `along` 0 = top button, 1 = lower edge. */
function capPoint(phi: number, along: number, lift = 0) {
  const theta = along * capRimAt(phi);
  const dir = new THREE.Vector3(-Math.cos(phi) * Math.sin(theta), Math.cos(theta), Math.sin(phi) * Math.sin(theta));
  const frontPanel = 0.05 * Math.max(0, dir.z) * dir.y * dir.y; // structured, slightly taller front
  const point = sculpt(dir.multiplyScalar(1 + CAP.thickness + frontPanel + lift));
  point.y += HEAD_Y;
  return point;
}

function capCrownGeometry() {
  const geometry = new THREE.SphereGeometry(1, 96, 40);
  const pos = geometry.attributes.position as THREE.BufferAttribute;
  const uv = geometry.attributes.uv as THREE.BufferAttribute;
  for (let i = 0; i < pos.count; i++) {
    const point = capPoint(uv.getX(i) * Math.PI * 2, 1 - uv.getY(i));
    pos.setXYZ(i, point.x, point.y, point.z);
  }
  geometry.computeVertexNormals();
  return geometry;
}

/** Curved visor: a band between the forehead and an outer half-ellipse, drooping at the sides. */
function capBrimGeometry() {
  const { reachX, reachZ, inner } = CAP.brim;
  const steps = 48;
  const start = 0.15 * Math.PI;
  const end = 0.85 * Math.PI;
  const angle = (i: number) => start + ((end - start) * i) / steps;
  const shape = new THREE.Shape();
  for (let i = 0; i <= steps; i++) {
    const a = angle(i);
    if (i === 0) shape.moveTo(reachX * Math.cos(a), reachZ * Math.sin(a));
    else shape.lineTo(reachX * Math.cos(a), reachZ * Math.sin(a));
  }
  for (let i = steps; i >= 0; i--) {
    const a = angle(i);
    shape.lineTo(inner[0] * Math.cos(a), inner[1] * Math.sin(a));
  }
  shape.closePath();

  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: 0.035, bevelEnabled: true, bevelThickness: 0.012, bevelSize: 0.012, bevelSegments: 2, curveSegments: 8,
  });
  geometry.rotateX(Math.PI / 2); // lay it flat, pointing forward
  const pos = geometry.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const z = pos.getZ(i);
    const droop = 0.2 * (x / reachX) ** 2 * Math.max(0, z / reachZ) + 0.1 * Math.max(0, z - 0.75);
    pos.setY(i, pos.getY(i) - droop);
  }
  geometry.translate(0, 0, -CAP.brim.pivotZ); // hinge the tilt at the forehead
  geometry.computeVertexNormals();
  return geometry;
}

function capSeam(phi: number, m: Materials) {
  const points = Array.from({ length: 25 }, (_, i) => capPoint(phi, 0.03 + (0.97 * i) / 24, 0.006));
  return new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), 48, 0.008, 6), m.capSeam);
}

function buildCap(m: Materials) {
  const cap = new THREE.Group();
  const rimPoints = Array.from({ length: 96 }, (_, i) => capPoint((i / 96) * Math.PI * 2, 1));
  const seamAngles = [0, 1.05, 2.1].flatMap((offset) => [Math.PI / 2 + offset, Math.PI / 2 - offset]).slice(1);
  cap.add(
    part(capCrownGeometry(), m.cap),
    part(capBrimGeometry(), m.cap, { position: [0, CAP.brim.y, CAP.brim.pivotZ], rotation: [CAP.brim.tilt, 0, 0] }),
    part(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(rimPoints, true), 192, 0.022, 8, true), m.cap),
    part(sphere(0.07, 20, 12), m.cap, { position: capPoint(0, 0).toArray(), scale: [1, 0.55, 1] }),
    ...seamAngles.map((phi) => capSeam(phi, m))
  );
  return cap;
}

function buildEye(side: number, m: Materials): Eye {
  const group = new THREE.Group();
  group.position.set(EYE_X * side, EYE_Y, 0.76);
  group.rotation.y = 0.22 * side;
  const look = new THREE.Group();
  look.add(
    part(sphere(0.095, 32, 16), m.iris, { position: [0, 0, 0.14], scale: [1, 1, 0.35] }),
    part(sphere(0.05, 24, 12), m.pupil, { position: [0, 0, 0.168], scale: [1, 1, 0.3] }),
    part(sphere(0.022, 12, 8), m.shine, { position: [0.035, 0.04, 0.178] })
  );
  const lid = part(new THREE.SphereGeometry(0.178, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), m.lid, {
    rotation: [LID_OPEN, 0, 0],
  });
  group.add(part(sphere(0.17, 32, 24), m.eyeWhite), look, lid);
  return { group, look, lid };
}

function buildGlasses(m: Materials) {
  const glasses = new THREE.Group();
  [-1, 1].forEach((side) => {
    const lens = new THREE.Group();
    lens.position.set(EYE_X * side, EYE_Y, LENS_Z);
    lens.rotation.y = 0.12 * side;
    lens.add(
      part(new THREE.TorusGeometry(0.26, 0.03, 16, 64), m.frame),
      part(new THREE.CircleGeometry(0.26, 48), m.lens)
    );
    const hinge: Vec3 = [0.62 * side, EYE_Y + 0.02, 0.95];
    const temple: Vec3 = [1.05 * side, EYE_Y, 0.35];
    const ear: Vec3 = [1.04 * side, EYE_Y - 0.06, -0.15];
    glasses.add(lens, rod(hinge, temple, 0.022, m.frame), rod(temple, ear, 0.022, m.frame));
  });
  glasses.add(part(new THREE.TorusGeometry(0.095, 0.024, 10, 24, Math.PI), m.frame, {
    position: [0, EYE_Y - 0.01, LENS_Z + 0.02],
  }));
  return glasses;
}

/** Small closed-mouth smile with a slight smirk. */
function buildMouth(m: Materials) {
  const crease = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.17, 0.016, 0),
    new THREE.Vector3(-0.07, -0.006, 0.03),
    new THREE.Vector3(0.06, -0.004, 0.03),
    new THREE.Vector3(0.16, 0.032, 0),
  ]);
  const mouth = new THREE.Group();
  mouth.position.set(0, 0.47, 0.9);
  mouth.rotation.set(-0.18, 0, 0.05); // tilted so one corner sits a touch higher
  mouth.add(
    part(sphere(0.1, 32, 16), m.lipUpper, { position: [0, 0.018, 0], scale: [1.55, 0.26, 0.42] }),
    part(sphere(0.1, 32, 16), m.lipLower, { position: [0.005, -0.03, 0], scale: [1.35, 0.38, 0.45] }),
    part(new THREE.TubeGeometry(crease, 40, 0.008, 8), m.lipLine)
  );
  return mouth;
}

function buildFace(m: Materials) {
  const face = new THREE.Group();
  face.add(
    part(sphere(0.15), m.skin, { position: [0, 0.8, 0.97], scale: [1.1, 0.9, 0.9] })
  );
  [-1, 1].forEach((side) => {
    face.add(
      part(new THREE.CapsuleGeometry(0.05, 0.24, 6, 16), m.brow, {
        position: [0.37 * side, 1.4, 0.84],
        rotation: [-0.35, 0.3 * side, Math.PI / 2 - 0.08 * side],
        scale: [1, 1, 0.7],
      }),
      part(sphere(0.24), m.skin, { position: [0.97 * side, 0.92, -0.05], scale: [0.4, 0.95, 0.66] })
    );
  });
  return face;
}

function buildHead(m: Materials) {
  const head = new THREE.Group();
  head.position.y = -0.45;
  head.add(
    part(headGeometry(), m.skin, { position: [0, HEAD_Y, 0] }),
    buildFace(m),
    buildMouth(m),
    buildGlasses(m),
    buildHair(m)
  );
  if (CAP.enabled) head.add(buildCap(m));
  const eyes = [-1, 1].map((side) => buildEye(side, m));
  eyes.forEach((eye) => head.add(eye.group));
  return { head, eyes };
}

function buildTorso(m: Materials) {
  // Smooth shoulder silhouette from a spline, spun around the Y axis.
  const profile = new THREE.SplineCurve(([
    [0.34, -0.86], [0.72, -1.0], [1.15, -1.17], [1.42, -1.42],
    [1.54, -1.85], [1.55, -2.8], [1.46, -3.9],
  ] as const).map(([r, y]) => new THREE.Vector2(r, y))).getPoints(48);
  const torso = new THREE.Group();
  torso.add(
    part(new THREE.LatheGeometry(profile, 96), m.sweater, { position: [0, 0, -0.1], scale: [1, 1, 0.66] }),
    part(new THREE.TorusGeometry(0.42, 0.1, 16, 48), m.rib, { position: [0, -0.92, -0.02], rotation: [Math.PI / 2, 0, 0] }),
    part(new THREE.CylinderGeometry(0.3, 0.36, 0.7, 32), m.skin, { position: [0, -0.62, 0] })
  );
  return torso;
}

export function buildAvatar(): Avatar {
  const materials = makeMaterials();
  const { head, eyes } = buildHead(materials);
  return { head, eyes, torso: buildTorso(materials), lidOpen: LID_OPEN };
}
