import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

// Configurable Theme Color Palette for 3D Materials
const THEME_3D_PALETTE = {
  ambient: 0xffffff,
  keyLight: 0xfff5e0,
  rimLight: 0x2dd4bf, // teal-400
  shirt: 0x0d9488,    // teal-600
  strap: 0x115e59,    // teal-800
  buckle: 0xe2e8f0,   // slate-200
  skin: 0xf59e0b,     // amber-500
  beard: 0x78350f,    // amber-900
  smile: 0x451a03,    // amber-950
  pupil: 0x1c1917,    // stone-900
  helmet: 0xfacc15,   // amber-400
  helmetRim: 0xeab308,// amber-500
  spark: 0x2dd4bf,    // teal-400
};

interface ThreeWorkerAvatarProps {
  className?: string;
  onAvatarClick?: () => void;
}

export function ThreeWorkerAvatar({ className = 'w-24 h-24', onAvatarClick }: ThreeWorkerAvatarProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [sparkCount, setSparkCount] = useState(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 96;
    const height = container.clientHeight || 96;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 0.2, 3.2);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(THEME_3D_PALETTE.ambient, 1.2);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(THEME_3D_PALETTE.keyLight, 2.0);
    dirLight.position.set(3, 4, 3);
    scene.add(dirLight);

    const rimLight = new THREE.DirectionalLight(THEME_3D_PALETTE.rimLight, 1.5);
    rimLight.position.set(-3, 2, -2);
    scene.add(rimLight);

    // Character Group
    const workerGroup = new THREE.Group();
    scene.add(workerGroup);

    // 1. Torso / Shirt & Overalls
    const torsoGeo = new THREE.CylinderGeometry(0.55, 0.7, 0.8, 24);
    const shirtMat = new THREE.MeshStandardMaterial({
      color: THEME_3D_PALETTE.shirt,
      roughness: 0.5,
      metalness: 0.1,
    });
    const torso = new THREE.Mesh(torsoGeo, shirtMat);
    torso.position.y = -0.75;
    workerGroup.add(torso);

    // Overalls Straps
    const strapMat = new THREE.MeshStandardMaterial({
      color: THEME_3D_PALETTE.strap,
      roughness: 0.4,
    });
    const strapGeo = new THREE.BoxGeometry(0.12, 0.75, 0.08);
    const leftStrap = new THREE.Mesh(strapGeo, strapMat);
    leftStrap.position.set(-0.25, -0.65, 0.52);
    leftStrap.rotation.z = -0.1;
    workerGroup.add(leftStrap);

    const rightStrap = new THREE.Mesh(strapGeo, strapMat);
    rightStrap.position.set(0.25, -0.65, 0.52);
    rightStrap.rotation.z = 0.1;
    workerGroup.add(rightStrap);

    // Buckles
    const buckleGeo = new THREE.CylinderGeometry(0.045, 0.045, 0.03, 16);
    const buckleMat = new THREE.MeshStandardMaterial({ color: THEME_3D_PALETTE.buckle, metalness: 0.8, roughness: 0.2 });
    const leftBuckle = new THREE.Mesh(buckleGeo, buckleMat);
    leftBuckle.rotation.x = Math.PI / 2;
    leftBuckle.position.set(-0.25, -0.5, 0.58);
    workerGroup.add(leftBuckle);

    const rightBuckle = new THREE.Mesh(buckleGeo, buckleMat);
    rightBuckle.rotation.x = Math.PI / 2;
    rightBuckle.position.set(0.25, -0.5, 0.58);
    workerGroup.add(rightBuckle);

    // 2. Neck
    const neckGeo = new THREE.CylinderGeometry(0.2, 0.22, 0.3, 16);
    const skinMat = new THREE.MeshStandardMaterial({
      color: THEME_3D_PALETTE.skin,
      roughness: 0.4,
      metalness: 0.05,
    });
    const neck = new THREE.Mesh(neckGeo, skinMat);
    neck.position.y = -0.3;
    workerGroup.add(neck);

    // 3. Head Pivot Group (for tracking pointer)
    const headGroup = new THREE.Group();
    headGroup.position.y = 0.15;
    workerGroup.add(headGroup);

    // Head Sphere
    const headGeo = new THREE.SphereGeometry(0.48, 32, 32);
    const head = new THREE.Mesh(headGeo, skinMat);
    headGroup.add(head);

    // Nose
    const noseGeo = new THREE.SphereGeometry(0.08, 16, 16);
    const nose = new THREE.Mesh(noseGeo, skinMat);
    nose.position.set(0, -0.02, 0.48);
    headGroup.add(nose);

    // Friendly Stubble / Beard Arc
    const beardGeo = new THREE.TorusGeometry(0.28, 0.07, 12, 24, Math.PI);
    const beardMat = new THREE.MeshStandardMaterial({ color: THEME_3D_PALETTE.beard, roughness: 0.8 });
    const beard = new THREE.Mesh(beardGeo, beardMat);
    beard.rotation.x = Math.PI / 2 + 0.3;
    beard.rotation.z = Math.PI;
    beard.position.set(0, -0.18, 0.36);
    headGroup.add(beard);

    // Smile Line
    const smileGeo = new THREE.TorusGeometry(0.12, 0.025, 8, 16, Math.PI * 0.7);
    const smileMat = new THREE.MeshBasicMaterial({ color: THEME_3D_PALETTE.smile });
    const smile = new THREE.Mesh(smileGeo, smileMat);
    smile.rotation.x = Math.PI / 2 + 0.2;
    smile.rotation.z = Math.PI + 0.5;
    smile.position.set(0, -0.12, 0.45);
    headGroup.add(smile);

    // Eyes Group
    const leftEyeGroup = new THREE.Group();
    leftEyeGroup.position.set(-0.16, 0.08, 0.42);
    headGroup.add(leftEyeGroup);

    const rightEyeGroup = new THREE.Group();
    rightEyeGroup.position.set(0.16, 0.08, 0.42);
    headGroup.add(rightEyeGroup);

    // Eye Whites
    const scleraGeo = new THREE.SphereGeometry(0.085, 16, 16);
    const scleraMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.1 });
    const leftSclera = new THREE.Mesh(scleraGeo, scleraMat);
    leftEyeGroup.add(leftSclera);
    const rightSclera = new THREE.Mesh(scleraGeo, scleraMat);
    rightEyeGroup.add(rightSclera);

    // Pupils
    const pupilGeo = new THREE.SphereGeometry(0.045, 12, 12);
    const pupilMat = new THREE.MeshBasicMaterial({ color: THEME_3D_PALETTE.pupil });
    const leftPupil = new THREE.Mesh(pupilGeo, pupilMat);
    leftPupil.position.set(0, 0, 0.06);
    leftEyeGroup.add(leftPupil);
    const rightPupil = new THREE.Mesh(pupilGeo, pupilMat);
    rightPupil.position.set(0, 0, 0.06);
    rightEyeGroup.add(rightPupil);

    // Eye Glints
    const glintGeo = new THREE.SphereGeometry(0.015, 8, 8);
    const glintMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const leftGlint = new THREE.Mesh(glintGeo, glintMat);
    leftGlint.position.set(0.02, 0.02, 0.09);
    leftEyeGroup.add(leftGlint);
    const rightGlint = new THREE.Mesh(glintGeo, glintMat);
    rightGlint.position.set(0.02, 0.02, 0.09);
    rightEyeGroup.add(rightGlint);

    // Eyebrows
    const browGeo = new THREE.BoxGeometry(0.12, 0.03, 0.03);
    const browMat = new THREE.MeshStandardMaterial({ color: THEME_3D_PALETTE.beard, roughness: 0.7 });
    const leftBrow = new THREE.Mesh(browGeo, browMat);
    leftBrow.position.set(-0.16, 0.22, 0.44);
    leftBrow.rotation.z = -0.1;
    headGroup.add(leftBrow);

    const rightBrow = new THREE.Mesh(browGeo, browMat);
    rightBrow.position.set(0.16, 0.22, 0.44);
    rightBrow.rotation.z = 0.1;
    headGroup.add(rightBrow);

    // 4. Construction Hardhat / Helmet
    const helmetGroup = new THREE.Group();
    helmetGroup.position.set(0, 0.24, 0);
    headGroup.add(helmetGroup);

    // Helmet Dome
    const helmetMat = new THREE.MeshStandardMaterial({
      color: THEME_3D_PALETTE.helmet,
      roughness: 0.25,
      metalness: 0.1,
    });
    const helmetDomeGeo = new THREE.SphereGeometry(0.53, 32, 24, 0, Math.PI * 2, 0, Math.PI * 0.52);
    const helmetDome = new THREE.Mesh(helmetDomeGeo, helmetMat);
    helmetGroup.add(helmetDome);

    // Helmet Rim
    const rimGeo = new THREE.TorusGeometry(0.54, 0.05, 12, 32);
    const rimMat = new THREE.MeshStandardMaterial({ color: THEME_3D_PALETTE.helmetRim, roughness: 0.3 });
    const helmetRim = new THREE.Mesh(rimGeo, rimMat);
    helmetRim.rotation.x = Math.PI / 2;
    helmetRim.position.y = 0.01;
    helmetGroup.add(helmetRim);

    // Helmet Front Peak
    const peakGeo = new THREE.CylinderGeometry(0.58, 0.58, 0.04, 32, 1, false, -Math.PI * 0.3, Math.PI * 0.6);
    const helmetPeak = new THREE.Mesh(peakGeo, rimMat);
    helmetPeak.position.set(0, 0.02, 0.05);
    helmetGroup.add(helmetPeak);

    // Helmet Center Ridge
    const ridgeGeo = new THREE.BoxGeometry(0.08, 0.15, 0.7);
    const ridge = new THREE.Mesh(ridgeGeo, helmetMat);
    ridge.position.set(0, 0.45, 0.05);
    helmetGroup.add(ridge);

    // 5. Sparks / Electric Arc Particle System (Triggered on click/tap)
    const particleCount = 45;
    const sparkGeo = new THREE.BufferGeometry();
    const sparkPositions = new Float32Array(particleCount * 3);
    const sparkVelocities = new Float32Array(particleCount * 3);
    const sparkAlphas = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      sparkPositions[i * 3] = 0;
      sparkPositions[i * 3 + 1] = 0;
      sparkPositions[i * 3 + 2] = 0;
      sparkVelocities[i * 3] = 0;
      sparkVelocities[i * 3 + 1] = 0;
      sparkVelocities[i * 3 + 2] = 0;
      sparkAlphas[i] = 0;
    }

    sparkGeo.setAttribute('position', new THREE.BufferAttribute(sparkPositions, 3));

    const sparkMat = new THREE.PointsMaterial({
      color: THEME_3D_PALETTE.spark,
      size: 0.09,
      transparent: true,
      blending: THREE.AdditiveBlending,
    });

    const sparkSystem = new THREE.Points(sparkGeo, sparkMat);
    scene.add(sparkSystem);

    const triggerSparks = () => {
      setSparkCount((c) => c + 1);
      const posAttr = sparkGeo.attributes.position as THREE.BufferAttribute;
      const positions = posAttr.array as Float32Array;

      for (let i = 0; i < particleCount; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 0.4;
        positions[i * 3 + 1] = 0.2 + (Math.random() - 0.5) * 0.4;
        positions[i * 3 + 2] = 0.4 + (Math.random() - 0.5) * 0.3;

        const theta = Math.random() * Math.PI * 2;
        const speed = 0.04 + Math.random() * 0.08;
        sparkVelocities[i * 3] = Math.cos(theta) * speed;
        sparkVelocities[i * 3 + 1] = Math.sin(theta) * speed + 0.02;
        sparkVelocities[i * 3 + 2] = (Math.random() - 0.5) * 0.05;
        sparkAlphas[i] = 1.0;
      }
      posAttr.needsUpdate = true;
    };

    // Pointer Tracking
    const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };

    const handlePointerMove = (e: PointerEvent | MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const clientX = e.clientX;
      const clientY = e.clientY;
      const x = ((clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((clientY - rect.top) / rect.height) * 2 - 1);
      mouse.targetX = Math.max(-1, Math.min(1, x));
      mouse.targetY = Math.max(-1, Math.min(1, y));
    };

    const handleGlobalMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - (rect.left + rect.width / 2)) / window.innerWidth) * 4;
      const y = -((e.clientY - (rect.top + rect.height / 2)) / window.innerHeight) * 4;
      mouse.targetX = Math.max(-1, Math.min(1, x));
      mouse.targetY = Math.max(-1, Math.min(1, y));
    };

    window.addEventListener('mousemove', handleGlobalMove);
    container.addEventListener('pointermove', handlePointerMove);

    // Click / Tap Bounce & Sparks
    let bounceProgress = 0;
    const handleClick = () => {
      bounceProgress = 1;
      triggerSparks();
      onAvatarClick?.();
    };

    container.addEventListener('click', handleClick);

    // Animation Loop
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Smooth interpolation for mouse tracking
      mouse.x += (mouse.targetX - mouse.x) * 0.08;
      mouse.y += (mouse.targetY - mouse.y) * 0.08;

      // Subtle breathing & idle float
      const idleFloat = Math.sin(elapsedTime * 2) * 0.03;
      workerGroup.position.y = idleFloat;

      // Head turn and tilt based on mouse position
      headGroup.rotation.y = mouse.x * 0.45;
      headGroup.rotation.x = -mouse.y * 0.35;

      // Eyes follow more aggressively
      leftPupil.position.x = mouse.x * 0.025;
      leftPupil.position.y = mouse.y * 0.025;
      rightPupil.position.x = mouse.x * 0.025;
      rightPupil.position.y = mouse.y * 0.025;

      // Bounce & Nod reaction
      if (bounceProgress > 0) {
        const bounce = Math.sin(bounceProgress * Math.PI) * 0.18;
        headGroup.position.y = 0.15 + bounce;
        headGroup.rotation.z = Math.sin(bounceProgress * Math.PI * 2) * 0.08;
        bounceProgress -= 0.04;
        if (bounceProgress < 0) bounceProgress = 0;
      }

      // Update Sparks
      const posAttr = sparkGeo.attributes.position as THREE.BufferAttribute;
      const positions = posAttr.array as Float32Array;
      let hasLiveSparks = false;

      for (let i = 0; i < particleCount; i++) {
        if (sparkAlphas[i] > 0) {
          hasLiveSparks = true;
          positions[i * 3] += sparkVelocities[i * 3];
          positions[i * 3 + 1] += sparkVelocities[i * 3 + 1];
          positions[i * 3 + 2] += sparkVelocities[i * 3 + 2];
          sparkVelocities[i * 3 + 1] -= 0.003; // gravity
          sparkAlphas[i] -= 0.03;
        }
      }

      if (hasLiveSparks) {
        posAttr.needsUpdate = true;
      }

      renderer.render(scene, camera);
    };

    animate();

    // Resize Observer
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const w = entry.contentRect.width;
        const h = entry.contentRect.height;
        if (w > 0 && h > 0) {
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
          renderer.setSize(w, h);
        }
      }
    });
    resizeObserver.observe(container);

    return () => {
      window.removeEventListener('mousemove', handleGlobalMove);
      container.removeEventListener('pointermove', handlePointerMove);
      container.removeEventListener('click', handleClick);
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [onAvatarClick]);

  return (
    <div
      className={`relative flex items-center justify-center rounded-full bg-gradient-to-b from-amber-100 via-sky-50 to-emerald-50 p-1 shadow-[0_8px_20px_rgba(0,0,0,0.06)] border-2 border-white cursor-pointer select-none group transition-transform active:scale-95 ${className}`}
      title="Interactive 3D Avatar • Tap for sparks & nod"
    >
      <div ref={containerRef} className="w-full h-full rounded-full overflow-hidden" />
      
      {/* Interactive Hint Indicator */}
      <span className="absolute -bottom-1 right-0 flex h-4 w-4">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-4 w-4 bg-amber-500 border border-white text-[9px] text-white font-black items-center justify-center">
          ⚡
        </span>
      </span>

      {/* Spark count glow trigger */}
      {sparkCount > 0 && (
        <span className="sr-only">Avatar clicked {sparkCount} times</span>
      )}
    </div>
  );
}
