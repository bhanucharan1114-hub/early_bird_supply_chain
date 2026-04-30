import React, { useEffect, useRef } from 'react';

export default function ParticleBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let width, height, centerX, centerY;
    let points = [];

    const initPoints = () => {
      points = [];
      // Create distinct horizontal layers
      const numLayers = 35; // Increased layers
      for (let i = 1; i < numLayers; i++) {
        // Vertical spacing from -1 to 1
        const normalizedY = -1 + (i * 2) / numLayers;
        // Radius of the layer based on an oval/ellipse curve
        const layerRadius = Math.sqrt(1 - normalizedY * normalizedY);
        
        // Number of points depends on layer circumference
        const numPointsInLayer = Math.max(12, Math.round(layerRadius * 150));
        
        for (let j = 0; j < numPointsInLayer; j++) {
          const theta = (j * Math.PI * 2) / numPointsInLayer;
          
          // Expanded screen-size horizontal oval stretch
          const x = layerRadius * Math.cos(theta) * 2.5; 
          const y = normalizedY * 1.5;
          const z = layerRadius * Math.sin(theta) * 2.0;
          
          points.push({ x, y, z, baseSize: Math.random() > 0.85 ? 1.5 : 0.8, type: 'layer' });
        }
      }

      // Inner sparse particles for depth
      for (let i = 0; i < 150; i++) {
        const x = (Math.random() * 2 - 1) * 0.8;
        const y = (Math.random() * 2 - 1) * 0.6;
        const z = (Math.random() * 2 - 1) * 0.8;
        if (x*x + y*y + z*z < 0.6) {
           points.push({ x, y, z, baseSize: Math.random() * 1.5 + 0.5, type: 'nebula' });
        }
      }
    };

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      centerX = width / 2;
      centerY = height / 2;
    };
    
    window.addEventListener('resize', resize);
    resize();
    initPoints();

    let time = 0;
    // Massive base radius to cover the screen
    const baseRadius = Math.max(window.innerWidth, window.innerHeight) * 0.45;

    const animate = () => {
      time += 0.015; 
      
      // Gradient Background
      const grad = ctx.createLinearGradient(0, 0, 0, height);
      grad.addColorStop(0, '#020617');
      grad.addColorStop(0.4, '#0f172a');
      grad.addColorStop(0.7, '#1e3a8a');
      grad.addColorStop(1, '#e0f2fe');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Subtle Grid
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      const gridSize = 60;
      for (let x = 0; x < width; x += gridSize) { ctx.moveTo(x, 0); ctx.lineTo(x, height); }
      for (let y = 0; y < height; y += gridSize) { ctx.moveTo(0, y); ctx.lineTo(width, y); }
      ctx.stroke();

      // Breathing effect
      const pulse = Math.sin(time * 1.5) * 0.08;
      const currentRadius = baseRadius * (1 + pulse);
      
      const rotX = time * 0.2;
      const rotY = time * 0.4;
      const cosX = Math.cos(rotX), sinX = Math.sin(rotX);
      const cosY = Math.cos(rotY), sinY = Math.sin(rotY);

      const projected = [];

      for (let p of points) {
        let y1 = p.y * cosX - p.z * sinX;
        let z1 = p.y * sinX + p.z * cosX;
        
        let x2 = p.x * cosY + z1 * sinY;
        let z2 = -p.x * sinY + z1 * cosY;
        let y2 = y1;

        const distance = 3; 
        const zPerspective = distance / (distance - z2);
        
        const px = centerX + x2 * currentRadius * zPerspective;
        const py = centerY + y2 * currentRadius * zPerspective;
        
        const alpha = Math.max(0.05, (z2 + 1) / 2);
        const finalSize = p.baseSize * zPerspective;

        projected.push({ px, py, alpha, z: z2, size: finalSize, type: p.type });
      }

      projected.sort((a, b) => a.z - b.z);

      for (let p of projected) {
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        // Render each dot as a horizontal oval
        ctx.ellipse(p.px, p.py, p.size * 2, p.size * 0.7, 0, 0, Math.PI * 2);
        
        // All dots are white
        ctx.fillStyle = '#ffffff';
        
        if (p.type === 'nebula') {
          ctx.shadowBlur = 12;
          ctx.shadowColor = '#ffffff';
        } else {
          ctx.shadowBlur = 4;
          ctx.shadowColor = 'rgba(255, 255, 255, 0.5)';
        }
        ctx.fill();
      }

      // Draw Outer HUD Rings
      ctx.globalAlpha = 0.2 + (pulse * 1.5);
      ctx.beginPath();
      ctx.setLineDash([2, 12]);
      ctx.ellipse(centerX, centerY, currentRadius * 2.8, currentRadius * 1.8, 0, 0, Math.PI * 2);
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();
      
      ctx.beginPath();
      ctx.setLineDash([1, 24]);
      ctx.ellipse(centerX, centerY, currentRadius * 3.0, currentRadius * 2.0, -time, 0, Math.PI * 2);
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();
      
      ctx.setLineDash([]);
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed inset-0 pointer-events-none z-0"
      style={{ display: 'block' }}
    />
  );
}
