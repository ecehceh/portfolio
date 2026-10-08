/*
 * Renders the avatar from avatar-model.js. The head follows the cursor, the
 * eyes blink, and position/turn/opacity come from a shared `state` object
 * that main.js animates on scroll.
 */
(function () {
  'use strict';

  const LID_CLOSED = 1.55;
  const BLINK_MS = 150;
  const FOLLOW_EASE = 0.07;
  const INTRO_DROP = 2.4; // how far below its spot the avatar starts on load
  const STACKED_LAYOUT_MAX = 900; // matches the max-width: 899px breakpoint in style.css

  function buildGlow() {
    const size = 256;
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext('2d');
    const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    gradient.addColorStop(0, 'rgba(150, 80, 255, 0.85)');
    gradient.addColorStop(0.35, 'rgba(115, 50, 225, 0.35)');
    gradient.addColorStop(1, 'rgba(80, 30, 180, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
    const texture = new THREE.CanvasTexture(canvas);
    texture.encoding = THREE.sRGBEncoding;
    const glow = new THREE.Mesh(
      new THREE.PlaneGeometry(9, 9),
      new THREE.MeshBasicMaterial({ map: texture, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false })
    );
    glow.position.set(0, -0.2, -3);
    return glow;
  }

  function addLights(scene) {
    const key = new THREE.DirectionalLight(0xfff4ea, 1.5);
    key.position.set(2.5, 3, 5);
    const front = new THREE.DirectionalLight(0xffffff, 0.35);
    front.position.set(0, 0.5, 6);
    const fill = new THREE.DirectionalLight(0x8b6cff, 0.5);
    fill.position.set(-4, -1, 3);
    const rimLeft = new THREE.PointLight(0x9d5cff, 3.5, 14);
    rimLeft.position.set(-3, 1.6, -2.2);
    const rimRight = new THREE.PointLight(0xc084fc, 3, 14);
    rimRight.position.set(3, 0.6, -2.2);
    scene.add(new THREE.HemisphereLight(0xffffff, 0x1a0f2e, 0.55), key, front, fill, rimLeft, rimRight);
  }

  function createBlinker(lidOpen) {
    let nextBlink = performance.now() + 1800;
    let blinkStart = -Infinity;
    return function lidAngle(now) {
      if (now >= nextBlink) {
        blinkStart = now;
        nextBlink = now + 2200 + Math.random() * 3200;
      }
      const progress = (now - blinkStart) / (BLINK_MS * 2);
      if (progress < 0 || progress > 1) return lidOpen;
      return lidOpen + (LID_CLOSED - lidOpen) * Math.sin(Math.PI * progress);
    };
  }

  /**
   * @param {HTMLCanvasElement} canvas
   * @param {{xFrac:number, y:number, turn:number, fade:number, intro:number}} state  animated by main.js
   * @returns {{ setPointer(x:number, y:number): void } | null}  null when WebGL is unavailable
   */
  function createCharacterScene(canvas, state) {
    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    } catch (error) {
      console.warn('WebGL unavailable, showing fallback instead of the 3D character.', error);
      return null;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
    addLights(scene);

    const { head, eyes, torso, lidOpen } = window.Portfolio.buildAvatar();
    const root = new THREE.Group();
    root.add(buildGlow(), torso, head);
    scene.add(root);

    const pointer = { x: 0, y: 0 };
    const lidAngle = createBlinker(lidOpen);
    let viewWidth = 1;

    function resize() {
      const width = window.innerWidth;
      const height = window.innerHeight;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      // Pull back on the stacked (phone/tablet) layout so the avatar fits between the texts.
      const isStacked = width < STACKED_LAYOUT_MAX;
      const distance = camera.aspect < 0.8 ? 16 : isStacked ? 13.5 : 9.5;
      camera.position.set(0, 0.3, distance);
      camera.lookAt(0, 0.3, 0);
      camera.updateProjectionMatrix();
      const viewHeight = 2 * distance * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
      viewWidth = viewHeight * camera.aspect;
    }

    function animate(now) {
      requestAnimationFrame(animate);
      const opacity = state.fade * state.intro;
      canvas.style.opacity = String(opacity);
      if (opacity < 0.01) return;

      const t = now / 1000;
      root.position.x = state.xFrac * viewWidth;
      root.position.y = state.y - (1 - state.intro) * INTRO_DROP + Math.sin(t * 1.4) * 0.025;

      const lookX = pointer.x - state.xFrac * 2;
      head.rotation.y += (lookX * 0.45 + state.turn - head.rotation.y) * FOLLOW_EASE;
      head.rotation.x += (-pointer.y * 0.22 - head.rotation.x) * FOLLOW_EASE;
      torso.rotation.y = head.rotation.y * 0.25;

      const lid = lidAngle(now);
      const gazeX = THREE.MathUtils.clamp(lookX, -1, 1) * 0.04;
      const gazeY = THREE.MathUtils.clamp(pointer.y, -1, 1) * 0.03;
      eyes.forEach((eye) => {
        eye.lid.rotation.x = lid;
        eye.look.position.x += (gazeX - eye.look.position.x) * 0.15;
        eye.look.position.y += (gazeY - eye.look.position.y) * 0.15;
      });

      renderer.render(scene, camera);
    }

    resize();
    window.addEventListener('resize', resize);
    requestAnimationFrame(animate);

    return {
      setPointer(x, y) {
        pointer.x = x;
        pointer.y = y;
      },
    };
  }

  window.Portfolio = Object.assign(window.Portfolio || {}, { createCharacterScene });
})();
