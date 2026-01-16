'use client';

import React, { useEffect, useRef } from 'react';
import styles from '../../styles/background.module.css';
import { clamp } from '../utils';

interface ThreeBackgroundProps {
    animationsEnabled?: boolean;
    bloomStrength?: number;
    bloomRadius?: number;
    bloomThreshold?: number;
    exposure?: number;
    noiseIntensity?: number;
}

export const ThreeBackground = ({
    animationsEnabled = true,
    bloomStrength = 0.85,
    bloomRadius = 0.55,
    bloomThreshold = 0.22,
    exposure = 1.05,
    noiseIntensity = 0.9,
}: ThreeBackgroundProps) => {
    const bgCanvasRef = useRef<HTMLCanvasElement>(null);
    const noiseCanvasRef = useRef<HTMLCanvasElement>(null);

    // We use refs to safely pass current props to the effect closure if needed, 
    // or we just include them in the dependency array. 
    // Since we want to update these values without full re-init, we might need a separate effect.
    // For now, let's keep it simple and re-init if meaningful things change, 
    // or use refs to update the running instance.

    const threeControlsRef = useRef<{
        setBloom: (s: number, r: number, t: number) => void;
        setExposure: (e: number) => void;
    } | null>(null);

    const noiseControlsRef = useRef<{
        setIntensity: (i: number) => void;
    } | null>(null);

    useEffect(() => {
        if (threeControlsRef.current) {
            threeControlsRef.current.setBloom(bloomStrength, bloomRadius, bloomThreshold);
        }
    }, [bloomStrength, bloomRadius, bloomThreshold]);

    useEffect(() => {
        if (threeControlsRef.current) {
            threeControlsRef.current.setExposure(exposure);
        }
    }, [exposure]);

    useEffect(() => {
        if (noiseControlsRef.current) {
            noiseControlsRef.current.setIntensity(noiseIntensity);
        }
    }, [noiseIntensity]);

    useEffect(() => {
        let cancelled = false;
        let rafId: number;
        let noiseIntervalId: number;
        let removeResize: (() => void) | undefined;
        let removeMouseMove: (() => void) | undefined;
        let cleanupThree: (() => void)[] = [];

        const init = async () => {
            const bgCanvas = bgCanvasRef.current;
            const noiseCanvas = noiseCanvasRef.current;
            if (!bgCanvas || !noiseCanvas) return;

            if (!animationsEnabled) {
                const nctx = noiseCanvas.getContext('2d');
                if (nctx) nctx.clearRect(0, 0, noiseCanvas.width, noiseCanvas.height);
                const bctx = bgCanvas.getContext('2d');
                if (bctx) bctx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);
                return;
            }

            try {
                const THREE = await import('three');
                const { EffectComposer } = await import('three/examples/jsm/postprocessing/EffectComposer.js');
                const { RenderPass } = await import('three/examples/jsm/postprocessing/RenderPass.js');
                const { UnrealBloomPass } = await import('three/examples/jsm/postprocessing/UnrealBloomPass.js');

                if (cancelled) return;

                // ---------- Procedural Noise Overlay ----------
                const nctx = noiseCanvas.getContext('2d', { alpha: true });
                if (!nctx) throw new Error('Could not acquire 2D context for noise canvas');

                const NOISE_TILE = 256;
                const noiseTile = document.createElement('canvas');
                noiseTile.width = NOISE_TILE;
                noiseTile.height = NOISE_TILE;
                const tctx = noiseTile.getContext('2d', { alpha: true });
                if (!tctx) throw new Error('Could not acquire 2D context for noise tile');

                const tileData = tctx.createImageData(NOISE_TILE, NOISE_TILE);
                const regenNoiseTile = (intensity01: number) => {
                    const data = tileData.data;
                    const intensity = clamp(intensity01, 0, 1);
                    for (let i = 0; i < data.length; i += 4) {
                        const v = Math.random() * 255;
                        data[i + 0] = v;
                        data[i + 1] = v;
                        data[i + 2] = v;
                        data[i + 3] = Math.floor(v * 0.18 * intensity);
                    }
                    tctx.putImageData(tileData, 0, 0);
                };

                let currentNoiseIntensity = noiseIntensity;
                regenNoiseTile(currentNoiseIntensity);
                let noiseTick = 0;

                const drawNoise = () => {
                    const dpr = Math.min(window.devicePixelRatio || 1, 2);
                    const w = noiseCanvas.width;
                    const h = noiseCanvas.height;

                    nctx.clearRect(0, 0, w, h);
                    nctx.globalAlpha = 1;

                    const ox = Math.floor((noiseTick * 13) % NOISE_TILE);
                    const oy = Math.floor((noiseTick * 9) % NOISE_TILE);

                    for (let y = -NOISE_TILE; y < h + NOISE_TILE; y += NOISE_TILE) {
                        for (let x = -NOISE_TILE; x < w + NOISE_TILE; x += NOISE_TILE) {
                            nctx.drawImage(noiseTile, x - ox, y - oy);
                        }
                    }

                    // subtle scanline
                    nctx.globalAlpha = 0.18 * currentNoiseIntensity;
                    nctx.fillStyle = 'rgba(0,0,0,1)';
                    for (let y = 0; y < h; y += Math.floor(3 * dpr)) {
                        nctx.fillRect(0, y, w, 1);
                    }

                    noiseTick++;
                };

                noiseControlsRef.current = {
                    setIntensity: (intensity: number) => {
                        currentNoiseIntensity = intensity;
                        regenNoiseTile(currentNoiseIntensity);
                    },
                };

                noiseIntervalId = window.setInterval(drawNoise, 50);

                // ---------- Three.js background (stars + bloom) ----------
                const renderer = new THREE.WebGLRenderer({
                    canvas: bgCanvas,
                    antialias: true,
                    alpha: true,
                    powerPreference: 'high-performance',
                });
                renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
                renderer.setClearColor(0x000000, 0);
                renderer.outputColorSpace = THREE.SRGBColorSpace;
                renderer.toneMapping = THREE.ACESFilmicToneMapping;
                renderer.toneMappingExposure = exposure;

                const scene = new THREE.Scene();
                const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 2500);
                camera.position.set(0, 0, 220);
                scene.add(new THREE.AmbientLight(0xffffff, 0.9));

                const STAR_COUNT = 2200;
                const positions = new Float32Array(STAR_COUNT * 3);
                const positions2 = new Float32Array(STAR_COUNT * 3);

                for (let i = 0; i < STAR_COUNT; i++) {
                    const i3 = i * 3;
                    positions[i3 + 0] = (Math.random() - 0.5) * 980;
                    positions[i3 + 1] = (Math.random() - 0.5) * 560;
                    positions[i3 + 2] = (Math.random() - 0.5) * 980;

                    positions2[i3 + 0] = (Math.random() - 0.5) * 1100;
                    positions2[i3 + 1] = (Math.random() - 0.5) * 680;
                    positions2[i3 + 2] = (Math.random() - 0.5) * 1100;
                }

                const geo = new THREE.BufferGeometry();
                geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
                const mat = new THREE.PointsMaterial({
                    color: 0xffb24a,
                    size: 1.05,
                    sizeAttenuation: true,
                    transparent: true,
                    opacity: 0.42,
                    blending: THREE.AdditiveBlending,
                    depthWrite: false,
                });
                const stars = new THREE.Points(geo, mat);
                scene.add(stars);

                const geo2 = new THREE.BufferGeometry();
                geo2.setAttribute('position', new THREE.BufferAttribute(positions2, 3));
                const mat2 = new THREE.PointsMaterial({
                    color: 0x5ab4ff,
                    size: 0.95,
                    sizeAttenuation: true,
                    transparent: true,
                    opacity: 0.10,
                    blending: THREE.AdditiveBlending,
                    depthWrite: false,
                });
                const dust = new THREE.Points(geo2, mat2);
                scene.add(dust);

                const composer = new EffectComposer(renderer);
                composer.addPass(new RenderPass(scene, camera));
                const bloomPass = new UnrealBloomPass(
                    new THREE.Vector2(1, 1),
                    bloomStrength,
                    bloomRadius,
                    bloomThreshold
                );
                composer.addPass(bloomPass);

                threeControlsRef.current = {
                    setBloom: (s, r, t) => {
                        bloomPass.strength = s;
                        bloomPass.radius = r;
                        bloomPass.threshold = t;
                    },
                    setExposure: (e) => {
                        renderer.toneMappingExposure = e;
                    },
                };

                // Resize handling
                const resize = () => {
                    const w = window.innerWidth;
                    const h = window.innerHeight;
                    renderer.setSize(w, h, false);
                    composer.setSize(w, h);
                    camera.aspect = w / h;
                    camera.updateProjectionMatrix();
                    bloomPass.setSize(w, h);

                    const dpr = Math.min(window.devicePixelRatio || 1, 2);
                    noiseCanvas.width = Math.floor(w * dpr);
                    noiseCanvas.height = Math.floor(h * dpr);
                };

                window.addEventListener('resize', resize);
                removeResize = () => window.removeEventListener('resize', resize);

                // Parallax
                let targetParallaxX = 0, targetParallaxY = 0;
                let parallaxX = 0, parallaxY = 0;
                const onMouseMove = (e: MouseEvent) => {
                    const nx = (e.clientX / window.innerWidth) * 2 - 1;
                    const ny = (e.clientY / window.innerHeight) * 2 - 1;
                    targetParallaxX = nx * 10;
                    targetParallaxY = -ny * 6;
                };
                window.addEventListener('mousemove', onMouseMove);
                removeMouseMove = () => window.removeEventListener('mousemove', onMouseMove);

                let t = 0;
                const animate = () => {
                    t += 0.0014;
                    parallaxX += (targetParallaxX - parallaxX) * 0.05;
                    parallaxY += (targetParallaxY - parallaxY) * 0.05;

                    camera.position.x = parallaxX;
                    camera.position.y = parallaxY;

                    stars.rotation.y = t * 0.5;
                    stars.rotation.x = t * 0.16;

                    dust.rotation.y = t * -0.3;
                    dust.rotation.x = t * 0.09;

                    composer.render();
                    rafId = requestAnimationFrame(animate);
                };

                resize();
                animate();

                cleanupThree.push(() => {
                    try {
                        geo.dispose();
                        mat.dispose();
                        geo2.dispose();
                        mat2.dispose();
                        renderer.dispose();
                    } catch (e) { console.error(e); }
                });
            } catch (err) {
                console.error("ThreeJS init error", err);
            }
        };

        init();

        return () => {
            cancelled = true;
            if (rafId) cancelAnimationFrame(rafId);
            if (noiseIntervalId) window.clearInterval(noiseIntervalId);
            if (removeResize) removeResize();
            if (removeMouseMove) removeMouseMove();
            cleanupThree.forEach(fn => fn());
            threeControlsRef.current = null;
            noiseControlsRef.current = null;
        };
    }, [animationsEnabled]); // Re-init if animations toggle

    return (
        <>
            <canvas ref={bgCanvasRef} className={styles.bg} />
            <canvas ref={noiseCanvasRef} className={styles.noise} />
        </>
    );
};
