import * as THREE from 'three';

export const createTileTexture = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, 128, 128);
    ctx.strokeStyle = '#00ffff'; // Tron blue
    ctx.lineWidth = 2;
    ctx.strokeRect(1, 1, 126, 126);

    // Add a groove effect
    ctx.strokeStyle = 'rgba(0, 255, 255, 0.2)';
    ctx.lineWidth = 1;
    ctx.strokeRect(4, 4, 120, 120);

    return new THREE.CanvasTexture(canvas);
};

export const createGlowTexture = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    gradient.addColorStop(0, 'rgba(255,255,255,1)');
    gradient.addColorStop(0.1, 'rgba(255,200,200,1)');
    gradient.addColorStop(0.4, 'rgba(255,0,0,0.4)');
    gradient.addColorStop(1, 'rgba(255,0,0,0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 128, 128);
    return new THREE.CanvasTexture(canvas);
};
