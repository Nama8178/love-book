import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function ThreeBackground({ candleMode = true }) {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0e0a14, 0.0015);

    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 80;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);

    // 2. Golden Stardust Particles
    const dustCount = 450;
    const dustGeometry = new THREE.BufferGeometry();
    const dustPositions = new Float32Array(dustCount * 3);
    const dustScales = new Float32Array(dustCount);

    for (let i = 0; i < dustCount; i++) {
      dustPositions[i * 3] = (Math.random() - 0.5) * 200;
      dustPositions[i * 3 + 1] = (Math.random() - 0.5) * 150;
      dustPositions[i * 3 + 2] = (Math.random() - 0.5) * 120;
      dustScales[i] = Math.random() * 2.5 + 0.5;
    }

    dustGeometry.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));
    dustGeometry.setAttribute('scale', new THREE.BufferAttribute(dustScales, 1));

    // Custom circle canvas texture for soft glow particles
    const createCircleTexture = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 64;
      canvas.height = 64;
      const ctx = canvas.getContext('2d');
      const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
      grad.addColorStop(0, 'rgba(255, 220, 160, 1)');
      grad.addColorStop(0.3, 'rgba(255, 180, 100, 0.8)');
      grad.addColorStop(0.7, 'rgba(244, 63, 94, 0.3)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 64, 64);
      return new THREE.CanvasTexture(canvas);
    };

    const dustMaterial = new THREE.PointsMaterial({
      size: 2.2,
      map: createCircleTexture(),
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const dustPoints = new THREE.Points(dustGeometry, dustMaterial);
    scene.add(dustPoints);

    // 3. Falling 3D Rose Petals
    const petalCount = 45;
    const petalGroup = new THREE.Group();
    const petalGeom = new THREE.PlaneGeometry(2.4, 3.2, 3, 3);
    
    // Curve the petal vertices slightly for 3D realism
    const pos = petalGeom.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      pos.setZ(i, Math.sin(x * 1.5) * 0.4 + Math.cos(y * 1.2) * 0.3);
    }
    petalGeom.computeVertexNormals();

    const petalMat = new THREE.MeshBasicMaterial({
      color: 0xe11d48,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85,
    });

    const petals = [];
    for (let i = 0; i < petalCount; i++) {
      const mesh = new THREE.Mesh(petalGeom, petalMat.clone());
      // Give each petal subtle color variation
      const col = new THREE.Color().setHSL(0.97 + Math.random() * 0.05, 0.8, 0.5 + Math.random() * 0.2);
      mesh.material.color = col;

      mesh.position.set(
        (Math.random() - 0.5) * 160,
        Math.random() * 120 - 40,
        (Math.random() - 0.5) * 80
      );
      mesh.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );
      mesh.scale.setScalar(Math.random() * 0.6 + 0.6);

      petals.push({
        mesh,
        rotSpeedX: (Math.random() - 0.5) * 0.02,
        rotSpeedY: (Math.random() - 0.5) * 0.03,
        rotSpeedZ: (Math.random() - 0.5) * 0.02,
        speedY: Math.random() * 0.15 + 0.08,
        swaySpeed: Math.random() * 0.02 + 0.01,
        swayOffset: Math.random() * Math.PI * 2,
      });

      petalGroup.add(mesh);
    }
    scene.add(petalGroup);

    // 4. Warm Candlelight Bokeh Orbs
    const bokehCount = 12;
    const bokehGroup = new THREE.Group();
    const bokehTex = createCircleTexture();
    for (let i = 0; i < bokehCount; i++) {
      const spriteMat = new THREE.SpriteMaterial({
        map: bokehTex,
        color: i % 2 === 0 ? 0xffb74d : 0xff4081,
        transparent: true,
        opacity: Math.random() * 0.25 + 0.1,
        blending: THREE.AdditiveBlending,
      });
      const sprite = new THREE.Sprite(spriteMat);
      sprite.position.set(
        (Math.random() - 0.5) * 180,
        (Math.random() - 0.5) * 120,
        (Math.random() - 0.5) * 60 - 20
      );
      const scale = Math.random() * 35 + 20;
      sprite.scale.set(scale, scale, 1);
      bokehGroup.add(sprite);
    }
    scene.add(bokehGroup);

    // 5. Mouse Parallax
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const onMouseMove = (e) => {
      mouseX = (e.clientX - window.innerWidth / 2) * 0.0005;
      mouseY = (e.clientY - window.innerHeight / 2) * 0.0005;
    };
    window.addEventListener('mousemove', onMouseMove);

    // 6. Handle Resize
    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', onResize);

    // 7. Animation Loop
    let clock = new THREE.Clock();
    let animId;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // Soft mouse lerp
      targetX += (mouseX - targetX) * 0.05;
      targetY += (mouseY - targetY) * 0.05;

      camera.position.x = targetX * 30;
      camera.position.y = -targetY * 30;
      camera.lookAt(0, 0, 0);

      // Dust floating upwards softly
      const positions = dustPoints.geometry.attributes.position.array;
      for (let i = 0; i < dustCount; i++) {
        positions[i * 3 + 1] += 0.06; // move up
        positions[i * 3] += Math.sin(elapsed + i) * 0.02;
        if (positions[i * 3 + 1] > 75) {
          positions[i * 3 + 1] = -75;
        }
      }
      dustPoints.geometry.attributes.position.needsUpdate = true;

      // Petals tumbling gently down
      petals.forEach((p) => {
        p.mesh.position.y -= p.speedY;
        p.mesh.position.x += Math.sin(elapsed * p.swaySpeed + p.swayOffset) * 0.12;
        p.mesh.rotation.x += p.rotSpeedX;
        p.mesh.rotation.y += p.rotSpeedY;
        p.mesh.rotation.z += p.rotSpeedZ;

        // Reset if off bottom screen
        if (p.mesh.position.y < -70) {
          p.mesh.position.y = 70;
          p.mesh.position.x = (Math.random() - 0.5) * 160;
        }
      });

      // Bokeh subtle pulsing
      bokehGroup.children.forEach((b, idx) => {
        b.material.opacity = (Math.sin(elapsed * 1.5 + idx) * 0.08 + 0.18) * (candleMode ? 1.2 : 0.6);
      });

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', onResize);
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
      renderer.dispose();
      dustGeometry.dispose();
      dustMaterial.dispose();
      petalGeom.dispose();
      petalMat.dispose();
    };
  }, [candleMode]);

  return (
    <div
      ref={mountRef}
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
      aria-hidden="true"
    />
  );
}
