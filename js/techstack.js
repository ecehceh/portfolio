/*
 * "My Techstack" — labelled balls that drop in, huddle toward the centre,
 * collide with each other and get pushed around by the cursor.
 */
(function () {
  'use strict';

  THREE.ColorManagement.legacyMode = false;

  const BALLS_PER_TECH = 2;
  const CENTER_PULL = 1.8;
  const DEPTH_PULL = 4;
  const DRAG = 1.6;
  const RESTITUTION = 0.35;
  const POINTER_RADIUS = 2.4;
  const POINTER_FORCE = 70;
  const SUBSTEPS = 2;
  const MAX_DT = 1 / 30;

  function labelTexture(tech) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = tech.color;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = tech.text || '#ffffff';
    ctx.font = '700 44px Geist, system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    // Draw the label on both sides so it shows up whichever way the ball spins.
    [128, 384].forEach((x) => ctx.fillText(tech.label, x, 128, 150));
    const texture = new THREE.CanvasTexture(canvas);
    texture.encoding = THREE.sRGBEncoding;
    texture.anisotropy = 4;
    return texture;
  }

  function createBalls(scene, techs) {
    const geometry = new THREE.SphereGeometry(1, 40, 28);
    return techs.flatMap((tech) => {
      const material = new THREE.MeshStandardMaterial({ map: labelTexture(tech), roughness: 0.35, metalness: 0.05 });
      return Array.from({ length: BALLS_PER_TECH }, () => {
        const mesh = new THREE.Mesh(geometry, material);
        const baseRadius = 0.75 + Math.random() * 0.55;
        mesh.rotation.set(Math.random() * 0.6, Math.random() * Math.PI * 2, 0);
        scene.add(mesh);
        return { mesh, baseRadius, radius: baseRadius, pos: new THREE.Vector3(), vel: new THREE.Vector3() };
      });
    });
  }

  function collide(a, b, normal, scratch) {
    normal.subVectors(b.pos, a.pos);
    const dist = normal.length();
    const minDist = a.radius + b.radius;
    if (dist >= minDist || dist < 1e-6) return;
    normal.divideScalar(dist);
    const push = (minDist - dist) / 2;
    a.pos.addScaledVector(normal, -push);
    b.pos.addScaledVector(normal, push);
    const approach = scratch.subVectors(b.vel, a.vel).dot(normal);
    if (approach < 0) {
      const impulse = (approach * (1 + RESTITUTION)) / 2;
      a.vel.addScaledVector(normal, impulse);
      b.vel.addScaledVector(normal, -impulse);
    }
  }

  /**
   * @param {HTMLCanvasElement} canvas
   * @param {Array<{label:string,color:string,text?:string}>} techs
   */
  function createTechstack(canvas, techs) {
    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    } catch (error) {
      console.warn('WebGL unavailable, skipping techstack balls.', error);
      return null;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputEncoding = THREE.sRGBEncoding;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
    camera.position.set(0, 0, 20);
    const key = new THREE.DirectionalLight(0xffffff, 0.9);
    key.position.set(5, 8, 10);
    const purple = new THREE.PointLight(0xa855f7, 1.6, 45);
    purple.position.set(-8, -5, 8);
    scene.add(new THREE.HemisphereLight(0xffffff, 0x2a1b4a, 0.85), key, purple);

    const balls = createBalls(scene, techs);
    const pointer = { world: new THREE.Vector3(), active: false };
    const scratch = { a: new THREE.Vector3(), normal: new THREE.Vector3(), axis: new THREE.Vector3(), q: new THREE.Quaternion() };
    let sizeScale = 1;

    function resize() {
      const { clientWidth: w, clientHeight: h } = canvas;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      const viewHeight = 2 * camera.position.z * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
      sizeScale = Math.min(1, (viewHeight * camera.aspect) / 16);
      balls.forEach((b) => {
        b.radius = b.baseRadius * sizeScale;
        b.mesh.scale.setScalar(b.radius);
      });
    }

    function drop() {
      balls.forEach((b) => {
        b.pos.set((Math.random() - 0.5) * 10 * sizeScale, 9 + Math.random() * 14, (Math.random() - 0.5) * 2);
        b.vel.set(0, -Math.random() * 4, 0);
      });
    }

    function integrate(b, dt) {
      const pull = scratch.a.copy(b.pos).multiplyScalar(-CENTER_PULL);
      pull.z *= DEPTH_PULL;
      b.vel.addScaledVector(pull, dt);
      if (pointer.active) {
        const away = scratch.normal.subVectors(b.pos, pointer.world).setZ(0);
        const dist = away.length();
        const reach = POINTER_RADIUS * sizeScale + b.radius;
        if (dist < reach && dist > 1e-4) {
          b.vel.addScaledVector(away.divideScalar(dist), (1 - dist / reach) * POINTER_FORCE * dt);
        }
      }
      b.vel.multiplyScalar(Math.exp(-DRAG * dt));
      b.pos.addScaledVector(b.vel, dt);
    }

    function step(dt) {
      balls.forEach((b) => integrate(b, dt));
      for (let i = 0; i < balls.length; i++) {
        for (let j = i + 1; j < balls.length; j++) collide(balls[i], balls[j], scratch.normal, scratch.a);
      }
      balls.forEach((b) => {
        b.mesh.position.copy(b.pos);
        const speed = Math.hypot(b.vel.x, b.vel.y);
        if (speed < 1e-3) return;
        scratch.axis.set(-b.vel.y, b.vel.x, 0).divideScalar(speed);
        scratch.q.setFromAxisAngle(scratch.axis, (speed * dt) / b.radius);
        b.mesh.quaternion.premultiply(scratch.q);
      });
    }

    let running = false;
    let dropped = false;
    let frameId = 0;
    let last = 0;

    function frame(now) {
      frameId = requestAnimationFrame(frame);
      const dt = Math.min((now - last) / 1000, MAX_DT);
      last = now;
      for (let i = 0; i < SUBSTEPS; i++) step(dt / SUBSTEPS);
      renderer.render(scene, camera);
    }

    function setRunning(visible) {
      if (visible && !running) {
        if (!dropped) {
          drop();
          dropped = true;
        }
        running = true;
        last = performance.now();
        frameId = requestAnimationFrame(frame);
      } else if (!visible && running) {
        cancelAnimationFrame(frameId);
        running = false;
      }
    }

    function updatePointer(event) {
      const rect = canvas.getBoundingClientRect();
      const ray = new THREE.Vector3(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        -((event.clientY - rect.top) / rect.height) * 2 + 1,
        0.5
      ).unproject(camera);
      ray.sub(camera.position).normalize();
      pointer.world.copy(camera.position).addScaledVector(ray, -camera.position.z / ray.z);
      pointer.active = true;
    }

    canvas.addEventListener('pointermove', updatePointer);
    canvas.addEventListener('pointerdown', updatePointer);
    canvas.addEventListener('pointerleave', () => { pointer.active = false; });
    new ResizeObserver(resize).observe(canvas);
    new IntersectionObserver(([entry]) => setRunning(entry.isIntersecting), { threshold: 0.15 }).observe(canvas);
    resize();

    return { drop };
  }

  window.Portfolio = Object.assign(window.Portfolio || {}, { createTechstack });
})();
