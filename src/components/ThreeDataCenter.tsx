import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RackSensorData, CameraPreset } from '../types/datacenter';

interface ThreeDataCenterProps {
  racks: RackSensorData[];
  selectedRackId: string | null;
  onSelectRack: (rackId: string | null) => void;
  cameraPreset: CameraPreset;
  heatmapMode: 'status' | 'temperature' | 'smoke' | 'power';
  autoRotate: boolean;
  onFpsUpdate: (fps: number) => void;
}

export const ThreeDataCenter: React.FC<ThreeDataCenterProps> = ({
  racks,
  selectedRackId,
  onSelectRack,
  cameraPreset,
  heatmapMode,
  autoRotate,
  onFpsUpdate,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const racksRef = useRef<RackSensorData[]>(racks);
  racksRef.current = racks;

  const selectedRackIdRef = useRef<string | null>(selectedRackId);
  selectedRackIdRef.current = selectedRackId;

  const heatmapModeRef = useRef(heatmapMode);
  heatmapModeRef.current = heatmapMode;

  const [hoveredRack, setHoveredRack] = useState<RackSensorData | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);

  // References to 3D objects for dynamic updates
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const rackGroupsRef = useRef<Map<string, THREE.Group>>(new Map());
  const rackBeaconsRef = useRef<Map<string, { light: THREE.PointLight; mesh: THREE.Mesh }>>(new Map());
  const floorDecalsRef = useRef<Map<string, THREE.Mesh>>(new Map());
  const particleSystemRef = useRef<THREE.Points | null>(null);

  // Target camera positions for smooth interpolation
  const targetCamPos = useRef<THREE.Vector3>(new THREE.Vector3(7.5, 6.5, 8.5));
  const targetLookAt = useRef<THREE.Vector3>(new THREE.Vector3(0, 1.2, 0));

  // Update camera preset targets
  useEffect(() => {
    if (cameraPreset === 'isometric') {
      targetCamPos.current.set(7.5, 6.5, 8.5);
      targetLookAt.current.set(0, 1.2, 0);
    } else if (cameraPreset === 'hot_aisle') {
      // Hot exhaust corridor between rows
      targetCamPos.current.set(4.5, 2.0, 0);
      targetLookAt.current.set(-4.5, 1.5, 0);
    } else if (cameraPreset === 'cold_aisle') {
      // Front of Zone A cold aisle
      targetCamPos.current.set(-0.5, 2.2, -5.2);
      targetLookAt.current.set(0, 1.4, -2.4);
    } else if (cameraPreset === 'top_down') {
      targetCamPos.current.set(0.01, 11.5, 0.01);
      targetLookAt.current.set(0, 0, 0);
    } else if (cameraPreset === 'rack_focus') {
      const activeRack = racksRef.current.find((r) => r.id === selectedRackIdRef.current) || racksRef.current[0];
      const [rx, ry, rz] = activeRack.position;
      targetCamPos.current.set(rx + (rz > 0 ? 1.8 : -1.8), ry + 2.2, rz + (rz > 0 ? 2.5 : -2.5));
      targetLookAt.current.set(rx, ry + 1.2, rz);
    }
  }, [cameraPreset, selectedRackId]);

  // Procedural Server Rack Texture Generator
  const createRackFaceTexture = useCallback(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d')!;

    // Background dark chassis metal
    ctx.fillStyle = '#12151c';
    ctx.fillRect(0, 0, 512, 1024);

    // Rack mounting rails (left & right)
    ctx.fillStyle = '#1e2430';
    ctx.fillRect(0, 0, 36, 1024);
    ctx.fillRect(476, 0, 36, 1024);

    // Mounting holes
    ctx.fillStyle = '#0a0d13';
    for (let y = 16; y < 1024; y += 24) {
      ctx.fillRect(14, y, 8, 8);
      ctx.fillRect(490, y, 8, 8);
    }

    // Draw 8 server blades (slots)
    const bladeHeight = 114;
    for (let i = 0; i < 8; i++) {
      const top = 30 + i * (bladeHeight + 8);
      // Blade background
      ctx.fillStyle = i % 2 === 0 ? '#181d26' : '#141821';
      ctx.fillRect(42, top, 428, bladeHeight);

      // Bevel borders
      ctx.strokeStyle = '#273142';
      ctx.lineWidth = 2;
      ctx.strokeRect(42, top, 428, bladeHeight);

      // Ventilation honeycomb pattern
      ctx.fillStyle = '#0d1017';
      for (let vx = 54; vx < 280; vx += 12) {
        for (let vy = top + 14; vy < top + bladeHeight - 14; vy += 10) {
          ctx.beginPath();
          ctx.arc(vx, vy, 3, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Drive bays / Caddies
      ctx.fillStyle = '#222938';
      for (let d = 0; d < 4; d++) {
        const dx = 296 + d * 38;
        ctx.fillRect(dx, top + 18, 32, bladeHeight - 36);
        ctx.strokeStyle = '#334155';
        ctx.strokeRect(dx, top + 18, 32, bladeHeight - 36);
        // Drive activity LED
        ctx.fillStyle = d === 0 ? '#10b981' : d === 1 ? '#06b6d4' : '#64748b';
        ctx.fillRect(dx + 12, top + 24, 8, 4);
      }

      // Power button & status cluster
      ctx.fillStyle = '#0284c7';
      ctx.beginPath();
      ctx.arc(448, top + 34, 6, 0, Math.PI * 2);
      ctx.fill();

      // Activity green LED
      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      ctx.arc(448, top + 54, 4, 0, Math.PI * 2);
      ctx.fill();

      // Blade label
      ctx.fillStyle = '#94a3b8';
      ctx.font = 'bold 12px "JetBrains Mono", monospace';
      ctx.fillText(`U${8 - i} BLADE-SRV`, 54, top + bladeHeight - 14);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 4;
    return texture;
  }, []);

  // Floor grid procedural texture
  const createFloorTexture = useCallback(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // Anti-static vinyl tile slate color
    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 0, 512, 512);

    // Tile seams (600x600 mm raised floor grid)
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 4;
    ctx.strokeRect(0, 0, 512, 512);

    // Fine perforated micro-dots for raised floor airflow
    ctx.fillStyle = '#131c2e';
    for (let x = 32; x < 512; x += 48) {
      for (let y = 32; y < 512; y += 48) {
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(10, 8);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }, []);

  // Main Scene Setup
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Detect software WebGL per Three.js directives
    const isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 600;

    // Scene & Camera
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x06080e);
    scene.fog = new THREE.FogExp2(0x06080e, 0.04);

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(7.5, 6.5, 8.5);
    cameraRef.current = camera;

    // WebGL Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
      alpha: false,
    });
    rendererRef.current = renderer;
    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(renderer.domElement);

    // Studio Environment map (RoomEnvironment)
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // Orbit Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controlsRef.current = controls;
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 - 0.04; // Don't clip below floor
    controls.minDistance = 2.5;
    controls.maxDistance = 24;
    controls.target.set(0, 1.2, 0);

    // Studio Lighting Rig
    // Warm Key Light
    const keyLight = new THREE.DirectionalLight(0xdbeafe, 1.8);
    keyLight.position.set(6, 9, 5);
    keyLight.castShadow = !isSoftwareGl;
    if (keyLight.castShadow) {
      keyLight.shadow.mapSize.width = 1024;
      keyLight.shadow.mapSize.height = 1024;
      keyLight.shadow.camera.near = 0.5;
      keyLight.shadow.camera.far = 25;
      keyLight.shadow.camera.left = -8;
      keyLight.shadow.camera.right = 8;
      keyLight.shadow.camera.top = 8;
      keyLight.shadow.camera.bottom = -8;
      keyLight.shadow.bias = -0.0005;
    }
    scene.add(keyLight);

    // Cool fill light from opposite corner
    const fillLight = new THREE.DirectionalLight(0x0284c7, 0.9);
    fillLight.position.set(-6, 7, -6);
    scene.add(fillLight);

    // Ambient Hemisphere Light (Sky cool cyan, Ground deep slate)
    const hemiLight = new THREE.HemisphereLight(0x38bdf8, 0x090d16, 0.65);
    scene.add(hemiLight);

    // Overhead linear aisle luminaire strip lights
    const aisleLight1 = new THREE.PointLight(0xe0f2fe, 1.2, 12, 1.2);
    aisleLight1.position.set(0, 3.8, -2.4);
    scene.add(aisleLight1);

    const aisleLight2 = new THREE.PointLight(0xe0f2fe, 1.2, 12, 1.2);
    aisleLight2.position.set(0, 3.8, 2.4);
    scene.add(aisleLight2);

    // 1. Raised Floor Surface
    const floorGeo = new THREE.PlaneGeometry(16, 14);
    const floorMat = new THREE.MeshStandardMaterial({
      map: createFloorTexture(),
      roughness: 0.6,
      metalness: 0.25,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = 0;
    floor.receiveShadow = !isSoftwareGl;
    scene.add(floor);

    // Floor perimeter boundary guide lines
    const gridHelper = new THREE.GridHelper(16, 16, 0x0ea5e9, 0x1e293b);
    gridHelper.position.y = 0.002;
    scene.add(gridHelper);

    // 2. Room Walls & Architectural Structure
    const wallMat = new THREE.MeshStandardMaterial({
      color: 0x0d121f,
      roughness: 0.8,
      metalness: 0.2,
    });

    // Back wall
    const backWall = new THREE.Mesh(new THREE.BoxGeometry(16, 4.5, 0.2), wallMat);
    backWall.position.set(0, 2.25, -7);
    scene.add(backWall);

    // Left wall with industrial accent panels
    const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.2, 4.5, 14), wallMat);
    leftWall.position.set(-8, 2.25, 0);
    scene.add(leftWall);

    // Right wall
    const rightWall = new THREE.Mesh(new THREE.BoxGeometry(0.2, 4.5, 14), wallMat);
    rightWall.position.set(8, 2.25, 0);
    scene.add(rightWall);

    // Wall status stripes / neon conduit lines
    const neonStripeMat = new THREE.MeshBasicMaterial({ color: 0x0ea5e9 });
    const neonStripe = new THREE.Mesh(new THREE.BoxGeometry(16, 0.04, 0.04), neonStripeMat);
    neonStripe.position.set(0, 2.8, -6.88);
    scene.add(neonStripe);

    // 3. Overhead Cable Trays & Aisle Containment
    const trayMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b, // Yellow fiber raceway
      roughness: 0.4,
      metalness: 0.5,
    });
    const cableTray1 = new THREE.Mesh(new THREE.BoxGeometry(12, 0.1, 0.4), trayMat);
    cableTray1.position.set(0, 3.4, -2.4);
    scene.add(cableTray1);

    const cableTray2 = new THREE.Mesh(new THREE.BoxGeometry(12, 0.1, 0.4), trayMat);
    cableTray2.position.set(0, 3.4, 2.4);
    scene.add(cableTray2);

    // Translucent Containment Canopy above Hot Aisle
    const containmentMat = new THREE.MeshPhysicalMaterial({
      color: 0x38bdf8,
      roughness: 0.1,
      metalness: 0.1,
      transmission: isSoftwareGl ? 0 : 0.85,
      transparent: true,
      opacity: isSoftwareGl ? 0.35 : 0.6,
      depthWrite: false,
    });
    const canopy = new THREE.Mesh(new THREE.BoxGeometry(10, 0.05, 2.6), containmentMat);
    canopy.position.set(0, 2.9, 0);
    scene.add(canopy);

    // 4. CRAC Cooling Units (Computer Room Air Conditioning)
    const cracMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.3,
      metalness: 0.7,
    });

    const createCracUnit = (x: number, z: number, rotationY: number) => {
      const cracGroup = new THREE.Group();
      // Main Cabinet (tall HVAC)
      const cabinet = new THREE.Mesh(new THREE.BoxGeometry(1.6, 3.2, 0.9), cracMat);
      cabinet.position.y = 1.6;
      cabinet.castShadow = !isSoftwareGl;
      cracGroup.add(cabinet);

      // Supply air discharge louver
      const louverMat = new THREE.MeshBasicMaterial({ color: 0x06b6d4 });
      const louver = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.5, 0.02), louverMat);
      louver.position.set(0, 0.4, 0.46);
      cracGroup.add(louver);

      // Digital monitoring touchscreen on CRAC
      const screenMat = new THREE.MeshBasicMaterial({ color: 0x10b981 });
      const cracScreen = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.25, 0.02), screenMat);
      cracScreen.position.set(0, 2.1, 0.46);
      cracGroup.add(cracScreen);

      cracGroup.position.set(x, 0, z);
      cracGroup.rotation.y = rotationY;
      scene.add(cracGroup);
    };

    createCracUnit(-6.8, -2.4, Math.PI / 2);
    createCracUnit(-6.8, 2.4, Math.PI / 2);

    // 5. Build Procedural 3D Composite Server Racks
    const rackFaceTexture = createRackFaceTexture();
    const rackChassisMat = new THREE.MeshStandardMaterial({
      color: 0x111622,
      roughness: 0.35,
      metalness: 0.85,
    });

    const rackFrontMat = new THREE.MeshStandardMaterial({
      map: rackFaceTexture,
      roughness: 0.45,
      metalness: 0.65,
    });

    racksRef.current.forEach((rackData) => {
      const rackGroup = new THREE.Group();
      rackGroup.name = rackData.id;

      const [rx, ry, rz] = rackData.position;
      rackGroup.position.set(rx, ry, rz);

      // Part 1: Main Chassis Enclosure (42U Standard Rack ~ 2.1m tall, 0.8m wide, 1.0m deep)
      const chassisGeo = new THREE.BoxGeometry(1.2, 2.3, 1.1);
      const chassis = new THREE.Mesh(chassisGeo, rackChassisMat);
      chassis.position.y = 1.15;
      chassis.castShadow = !isSoftwareGl;
      chassis.receiveShadow = !isSoftwareGl;
      rackGroup.add(chassis);

      // Part 2: Front Blade Server Bay Faceplate
      const frontGeo = new THREE.PlaneGeometry(1.1, 2.1);
      const frontMesh = new THREE.Mesh(frontGeo, rackFrontMat);
      // Face inward towards cold aisle or hot aisle
      if (rz < 0) {
        frontMesh.position.set(0, 1.15, 0.56);
      } else {
        frontMesh.rotation.y = Math.PI;
        frontMesh.position.set(0, 1.15, -0.56);
      }
      rackGroup.add(frontMesh);

      // Part 3: Top Exhaust Fan Cowl Housing
      const fanCowlGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.08, 16);
      const fanCowlMat = new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.7 });
      const fan1 = new THREE.Mesh(fanCowlGeo, fanCowlMat);
      fan1.position.set(-0.25, 2.34, 0);
      const fan2 = new THREE.Mesh(fanCowlGeo, fanCowlMat);
      fan2.position.set(0.25, 2.34, 0);
      rackGroup.add(fan1, fan2);

      // Part 4: Overhead Status Beacon Lamp Tower
      const beaconBase = new THREE.Mesh(
        new THREE.CylinderGeometry(0.04, 0.04, 0.15, 8),
        new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.9 })
      );
      beaconBase.position.set(0, 2.4, 0);

      const beaconLensGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.12, 12);
      const beaconLensMat = new THREE.MeshBasicMaterial({ color: 0x10b981 });
      const beaconLens = new THREE.Mesh(beaconLensGeo, beaconLensMat);
      beaconLens.position.set(0, 2.52, 0);

      const beaconLight = new THREE.PointLight(0x10b981, 1.5, 4, 1.5);
      beaconLight.position.set(0, 2.55, 0);

      rackGroup.add(beaconBase, beaconLens, beaconLight);
      rackBeaconsRef.current.set(rackData.id, { light: beaconLight, mesh: beaconLens });

      // Part 5: Contact Shadow / Floor Status Halo Decal
      const decalGeo = new THREE.RingGeometry(0.65, 0.9, 24);
      const decalMat = new THREE.MeshBasicMaterial({
        color: 0x10b981,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.5,
      });
      decalMat.polygonOffset = true;
      decalMat.polygonOffsetFactor = -1;
      decalMat.polygonOffsetUnits = -1;
      const decal = new THREE.Mesh(decalGeo, decalMat);
      decal.rotation.x = -Math.PI / 2;
      decal.position.y = 0.01;
      rackGroup.add(decal);
      floorDecalsRef.current.set(rackData.id, decal);

      // Invisible Raycast Proxy Bounding Box for reliable clicking
      const hitBoxGeo = new THREE.BoxGeometry(1.3, 2.5, 1.2);
      const hitBoxMat = new THREE.MeshBasicMaterial({ visible: false });
      const hitBox = new THREE.Mesh(hitBoxGeo, hitBoxMat);
      hitBox.position.y = 1.25;
      hitBox.userData = { rackId: rackData.id };
      rackGroup.add(hitBox);

      scene.add(rackGroup);
      rackGroupsRef.current.set(rackData.id, rackGroup);
    });

    // 6. Airflow / Thermal Particle System (Cooling & Exhaust Dynamics)
    const particleCount = 180;
    const particleGeo = new THREE.BufferGeometry();
    const posArray = new Float32Array(particleCount * 3);
    const colArray = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      // Spread across room aisles
      const px = (Math.random() - 0.5) * 10;
      const py = Math.random() * 2.8 + 0.2;
      const pz = (Math.random() - 0.5) * 6;

      posArray[i * 3] = px;
      posArray[i * 3 + 1] = py;
      posArray[i * 3 + 2] = pz;

      // Cyan in cold aisle (|z| > 1.2), Amber/Red in hot aisle (|z| < 1.2)
      if (Math.abs(pz) < 1.2) {
        colArray[i * 3] = 0.95; // R
        colArray[i * 3 + 1] = 0.45; // G
        colArray[i * 3 + 2] = 0.1; // B
      } else {
        colArray[i * 3] = 0.05;
        colArray[i * 3 + 1] = 0.7;
        colArray[i * 3 + 2] = 0.95;
      }
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    particleGeo.setAttribute('color', new THREE.BufferAttribute(colArray, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 0.07,
      vertexColors: true,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
    });

    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);
    particleSystemRef.current = particles;

    // Pre-warm shaders
    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    // Animation / Render Loop
    let frameId = 0;
    let lastTime = performance.now();
    let frameCount = 0;
    let fpsTimer = 0;
    const clock = new THREE.Clock();

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    }

    const tick = () => {
      const now = performance.now();
      const dt = clock.getDelta();

      // FPS tracking
      frameCount++;
      if (now - fpsTimer >= 1000) {
        onFpsUpdate(Math.round((frameCount * 1000) / (now - fpsTimer)));
        frameCount = 0;
        fpsTimer = now;
      }

      // Smooth Camera Transitions via exponential damping
      camera.position.lerp(targetCamPos.current, 0.05);
      controls.target.lerp(targetLookAt.current, 0.05);
      controls.autoRotate = autoRotate;
      controls.autoRotateSpeed = 0.8;
      controls.update();

      // Animate Beacon Light Pulses for Warning / Critical States
      const time = clock.getElapsedTime();
      racksRef.current.forEach((rack) => {
        const beacon = rackBeaconsRef.current.get(rack.id);
        const decal = floorDecalsRef.current.get(rack.id);
        if (!beacon || !decal) return;

        let beaconColor = 0x10b981; // Normal Green
        let decalColor = 0x10b981;
        let intensity = 1.2;

        if (heatmapModeRef.current === 'status') {
          if (rack.status === 'critical') {
            beaconColor = 0xef4444; // Red
            decalColor = 0xef4444;
            // High frequency flashing strobe
            const blink = (Math.sin(time * 12) + 1) * 0.5 > 0.45 ? 1 : 0.15;
            intensity = blink * 3.5;
          } else if (rack.status === 'warning') {
            beaconColor = 0xf59e0b; // Amber
            decalColor = 0xf59e0b;
            intensity = (Math.sin(time * 4) + 1.2) * 1.2;
          }
        } else if (heatmapModeRef.current === 'temperature') {
          // Color gradient based on temperature: 18°C (cyan) -> 24°C (green) -> 28°C (yellow) -> 33°C (crimson)
          if (rack.temperature >= 30) {
            beaconColor = 0xef4444;
            decalColor = 0xef4444;
          } else if (rack.temperature >= 25) {
            beaconColor = 0xf59e0b;
            decalColor = 0xf59e0b;
          } else {
            beaconColor = 0x06b6d4;
            decalColor = 0x06b6d4;
          }
        } else if (heatmapModeRef.current === 'smoke') {
          if (rack.smokePpm >= 60 || rack.smokeDetected) {
            beaconColor = 0xef4444;
            decalColor = 0xef4444;
            intensity = 3.0;
          } else {
            beaconColor = 0x10b981;
            decalColor = 0x10b981;
          }
        } else if (heatmapModeRef.current === 'power') {
          if (rack.powerKw >= 8.0) {
            beaconColor = 0x8b5cf6; // Purple for high power
            decalColor = 0x8b5cf6;
          } else {
            beaconColor = 0x3b82f6;
            decalColor = 0x3b82f6;
          }
        }

        // Apply visual colors
        beacon.light.color.setHex(beaconColor);
        beacon.light.intensity = intensity;
        (beacon.mesh.material as THREE.MeshBasicMaterial).color.setHex(beaconColor);
        (decal.material as THREE.MeshBasicMaterial).color.setHex(decalColor);

        // Highlight selected rack with pulsing halo
        if (rack.id === selectedRackIdRef.current) {
          (decal.material as THREE.MeshBasicMaterial).opacity = 0.85 + Math.sin(time * 6) * 0.15;
          decal.scale.setScalar(1.15);
        } else {
          (decal.material as THREE.MeshBasicMaterial).opacity = 0.4;
          decal.scale.setScalar(1.0);
        }
      });

      // Airflow Particles Dynamics
      if (particleSystemRef.current) {
        const positions = particleSystemRef.current.geometry.attributes.position.array as Float32Array;
        for (let i = 0; i < particleCount; i++) {
          // Float upward and cycle
          positions[i * 3 + 1] += 0.012;
          if (positions[i * 3 + 1] > 3.4) {
            positions[i * 3 + 1] = 0.15;
          }
        }
        particleSystemRef.current.geometry.attributes.position.needsUpdate = true;
      }

      renderer.render(scene, camera);

      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        frameId = requestAnimationFrame(tick);
      }
    };

    tick();

    // Window Resize Handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (isSoftwareGl) {
        clearTimeout(frameId);
      } else {
        cancelAnimationFrame(frameId);
      }
      controls.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [createFloorTexture, createRackFaceTexture, onFpsUpdate]);

  // Raycasting for Rack Hover & Click Selection
  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const container = mountRef.current;
    const camera = cameraRef.current;
    const scene = sceneRef.current;
    if (!container || !camera || !scene) return;

    const rect = container.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(x, y), camera);

    const hitObjects: THREE.Object3D[] = [];
    rackGroupsRef.current.forEach((group) => {
      hitObjects.push(group);
    });

    const intersects = raycaster.intersectObjects(hitObjects, true);

    if (intersects.length > 0) {
      let foundRackId: string | null = null;
      let curr: THREE.Object3D | null = intersects[0].object;

      while (curr && curr !== scene) {
        if (curr.userData && curr.userData.rackId) {
          foundRackId = curr.userData.rackId;
          break;
        }
        if (curr.name && curr.name.startsWith('rack-')) {
          foundRackId = curr.name;
          break;
        }
        curr = curr.parent;
      }

      if (foundRackId) {
        const rackObj = racksRef.current.find((r) => r.id === foundRackId) || null;
        setHoveredRack(rackObj);
        setTooltipPos({ x: e.clientX, y: e.clientY });
        container.style.cursor = 'pointer';
        return;
      }
    }

    setHoveredRack(null);
    setTooltipPos(null);
    container.style.cursor = 'default';
  }, []);

  const handleClick = useCallback(() => {
    if (hoveredRack) {
      onSelectRack(hoveredRack.id);
    } else {
      onSelectRack(null);
    }
  }, [hoveredRack, onSelectRack]);

  return (
    <div
      ref={mountRef}
      onPointerMove={handlePointerMove}
      onClick={handleClick}
      className="relative w-full h-full three-canvas-container overflow-hidden select-none"
    >
      {/* 3D Floating Interactive Tooltip */}
      {hoveredRack && tooltipPos && (
        <div
          className="fixed pointer-events-none z-40 transform -translate-x-1/2 -translate-y-full mb-3 px-3.5 py-2.5 rounded-lg bg-zinc-900/95 border border-zinc-700/80 shadow-2xl backdrop-blur-md text-xs space-y-1"
          style={{ left: `${tooltipPos.x}px`, top: `${tooltipPos.y - 12}px` }}
        >
          <div className="flex items-center justify-between gap-3 border-b border-zinc-800 pb-1.5">
            <span className="font-bold text-zinc-100 flex items-center gap-1.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  hoveredRack.status === 'critical'
                    ? 'bg-rose-500 animate-ping'
                    : hoveredRack.status === 'warning'
                    ? 'bg-amber-400'
                    : 'bg-emerald-400'
                }`}
              />
              {hoveredRack.name}
            </span>
            <span className="font-mono text-[10px] text-zinc-400">{hoveredRack.ipAddress}</span>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 font-mono text-[11px] pt-1">
            <div className="text-zinc-400">
              Suhu: <span className="text-zinc-100 font-semibold">{hoveredRack.temperature}°C</span>
            </div>
            <div className="text-zinc-400">
              RH: <span className="text-zinc-100 font-semibold">{hoveredRack.humidity}%</span>
            </div>
            <div className="text-zinc-400">
              Asap/Gas: <span className="text-zinc-100 font-semibold">{hoveredRack.smokePpm} PPM</span>
            </div>
            <div className="text-zinc-400">
              Daya: <span className="text-zinc-100 font-semibold">{hoveredRack.powerKw} kW</span>
            </div>
          </div>
          <div className="text-[10px] text-cyan-400/90 pt-1 text-center font-sans">
            Klik untuk membuka inspektur rak & blade
          </div>
        </div>
      )}
    </div>
  );
};
