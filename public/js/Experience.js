import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { GlitchPass } from 'three/examples/jsm/postprocessing/GlitchPass.js';
import { AudioLoader } from 'three/examples/jsm/loaders/AudioLoader.js';
import { Audio } from 'three/examples/jsm/audio/Audio.js';
import { AudioListener } from 'three/examples/jsm/audio/AudioListener.js';
import gsap from 'gsap';

export default class Experience {
    constructor() {
        this.canvas = document.querySelector('canvas.webgl');
        this.scene = new THREE.Scene();
        this.sizes = {
            width: window.innerWidth,
            height: window.innerHeight
        };
        this.camera = new THREE.PerspectiveCamera(75, this.sizes.width / this.sizes.height, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true,
            alpha: true
        });

        // Audio setup
        this.audioListener = new THREE.AudioListener();
        this.camera.add(this.audioListener);
        this.hoverSound = new Audio(this.audioListener);
        this.clickSound = new Audio(this.audioListener);
        this.ambientSound = new Audio(this.audioListener);

        // Load audio files
        const audioLoader = new AudioLoader();
        audioLoader.load('sounds/hover.mp3', (buffer) => {
            this.hoverSound.setBuffer(buffer);
            this.hoverSound.setVolume(0.5);
        });
        audioLoader.load('sounds/click.mp3', (buffer) => {
            this.clickSound.setBuffer(buffer);
            this.clickSound.setVolume(0.5);
        });
        audioLoader.load('sounds/ambient.mp3', (buffer) => {
            this.ambientSound.setBuffer(buffer);
            this.ambientSound.setVolume(0.2);
            this.ambientSound.setLoop(true);
        });

        this.init();
        this.animate();
    }

    init() {
        // Enhanced renderer settings
        this.renderer.setSize(this.sizes.width, this.sizes.height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        // Post-processing
        this.composer = new EffectComposer(this.renderer);
        this.renderPass = new RenderPass(this.scene, this.camera);
        this.composer.addPass(this.renderPass);

        // Bloom effect
        const bloomPass = new UnrealBloomPass(
            new THREE.Vector2(window.innerWidth, window.innerHeight),
            1.5, 0.4, 0.85
        );
        this.composer.addPass(bloomPass);

        // Glitch effect
        this.glitchPass = new GlitchPass();
        this.glitchPass.enabled = false;
        this.composer.addPass(this.glitchPass);

        // Camera position
        this.camera.position.set(0, 0, 5);

        // Lights
        this.addLights();

        // Particles
        this.addParticles();

        // Holographic sphere
        this.addHolographicSphere();

        // Grid floor
        this.addGridFloor();

        // Event listeners
        this.addEventListeners();
    }

    addLights() {
        const ambientLight = new THREE.AmbientLight(0x00ffff, 0.5);
        this.scene.add(ambientLight);

        this.pointLight = new THREE.PointLight(0x00ffff, 2, 100);
        this.pointLight.position.set(0, 10, 10);
        this.scene.add(this.pointLight);

        // Moving neon lights
        this.neonLights = [];
        const colors = [0xff00ff, 0x00ffff, 0xff0066];
        for (let i = 0; i < 3; i++) {
            const light = new THREE.PointLight(colors[i], 2, 50);
            light.position.set(
                Math.sin(i * Math.PI * 2 / 3) * 10,
                Math.cos(i * Math.PI * 2 / 3) * 10,
                0
            );
            this.neonLights.push(light);
            this.scene.add(light);
        }
    }

    addParticles() {
        const particleCount = 2000;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        const sizes = new Float32Array(particleCount);

        for (let i = 0; i < particleCount * 3; i += 3) {
            positions[i] = (Math.random() - 0.5) * 50;
            positions[i + 1] = (Math.random() - 0.5) * 50;
            positions[i + 2] = (Math.random() - 0.5) * 50;

            const color = new THREE.Color();
            color.setHSL(Math.random(), 1, 0.5);
            colors[i] = color.r;
            colors[i + 1] = color.g;
            colors[i + 2] = color.b;

            sizes[i / 3] = Math.random() * 2;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

        const material = new THREE.PointsMaterial({
            size: 0.1,
            vertexColors: true,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending
        });

        this.particles = new THREE.Points(geometry, material);
        this.scene.add(this.particles);
    }

    addHolographicSphere() {
        // Wireframe sphere
        const sphereGeometry = new THREE.IcosahedronGeometry(2, 4);
        const sphereMaterial = new THREE.MeshPhongMaterial({
            color: 0x00ffff,
            wireframe: true,
            transparent: true,
            opacity: 0.3
        });
        this.sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
        this.scene.add(this.sphere);

        // Inner glowing sphere
        const innerGeometry = new THREE.IcosahedronGeometry(1.8, 2);
        const innerMaterial = new THREE.MeshPhongMaterial({
            color: 0xff00ff,
            wireframe: true,
            transparent: true,
            opacity: 0.1
        });
        this.innerSphere = new THREE.Mesh(innerGeometry, innerMaterial);
        this.scene.add(this.innerSphere);
    }

    addGridFloor() {
        const size = 100;
        const divisions = 100;
        const gridHelper = new THREE.GridHelper(size, divisions, 0x00ffff, 0x00ffff);
        gridHelper.position.y = -5;
        this.scene.add(gridHelper);
    }

    animate() {
        requestAnimationFrame(this.animate.bind(this));

        // Rotate spheres
        if (this.sphere) {
            this.sphere.rotation.x += 0.001;
            this.sphere.rotation.y += 0.002;
            this.innerSphere.rotation.x -= 0.002;
            this.innerSphere.rotation.y -= 0.001;
        }

        // Animate particles
        if (this.particles) {
            const positions = this.particles.geometry.attributes.position.array;
            for (let i = 0; i < positions.length; i += 3) {
                positions[i + 1] += Math.sin(Date.now() * 0.001 + positions[i]) * 0.01;
            }
            this.particles.geometry.attributes.position.needsUpdate = true;
        }

        // Animate neon lights
        this.neonLights.forEach((light, i) => {
            const time = Date.now() * 0.001;
            light.position.x = Math.sin(time + i * Math.PI * 2 / 3) * 10;
            light.position.z = Math.cos(time + i * Math.PI * 2 / 3) * 10;
        });

        // Render scene
        this.composer.render();
    }

    addEventListeners() {
        window.addEventListener('resize', () => {
            this.sizes.width = window.innerWidth;
            this.sizes.height = window.innerHeight;
            this.camera.aspect = this.sizes.width / this.sizes.height;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(this.sizes.width, this.sizes.height);
            this.composer.setSize(this.sizes.width, this.sizes.height);
        });

        window.addEventListener('mousemove', (event) => {
            const mouseX = (event.clientX / this.sizes.width) * 2 - 1;
            const mouseY = -(event.clientY / this.sizes.height) * 2 + 1;

            gsap.to(this.camera.position, {
                x: mouseX * 2,
                y: mouseY * 2,
                duration: 1
            });
        });

        // Trigger glitch effect on click
        window.addEventListener('click', () => {
            this.glitchPass.enabled = true;
            this.clickSound.play();
            setTimeout(() => {
                this.glitchPass.enabled = false;
            }, 200);
        });
    }
}
