import React, { useEffect, useRef } from 'react';

interface PrismRaysCanvasProps {
  width?: number;
  height?: number;
}

export const PrismRaysCanvas: React.FC<PrismRaysCanvasProps> = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = canvas.parentElement?.clientWidth || 800;
    let height = canvas.parentElement?.clientHeight || 800;

    const updateSize = () => {
      if (!canvas.parentElement) return;
      width = canvas.parentElement.clientWidth;
      height = canvas.parentElement.clientHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    };

    updateSize();
    const resizeObserver = new ResizeObserver(() => updateSize());
    if (canvas.parentElement) {
      resizeObserver.observe(canvas.parentElement);
    }

    const centerX = () => width / 2;
    const centerY = () => height / 2;

    const rayCount = 145;
    const rays: Array<{
      angle: number;
      speed: number;
      lengthFactor: number;
      width: number;
      hue: number;
      alpha: number;
      innerOffsetFactor: number;
    }> = [];

    const colors = [190, 215, 275, 320, 38, 160, 0];

    for (let i = 0; i < rayCount; i++) {
      const baseAngle = (i / rayCount) * Math.PI * 2;
      const jitter = (Math.random() - 0.5) * 0.05;
      rays.push({
        angle: baseAngle + jitter,
        speed: (Math.random() - 0.5) * 0.0003,
        lengthFactor: 0.65 + Math.random() * 0.45,
        width: Math.random() < 0.2 ? 2.5 + Math.random() * 1.8 : 0.6 + Math.random() * 1.4,
        hue: colors[Math.floor(Math.random() * colors.length)],
        alpha: 0.25 + Math.random() * 0.65,
        innerOffsetFactor: 0.12 + Math.random() * 0.14,
      });
    }

    let time = 0;

    const render = () => {
      time += 0.004;
      const cx = centerX();
      const cy = centerY();
      const maxRadius = width * 0.5;

      ctx.clearRect(0, 0, width, height);

      // Deep dark background circle
      const coreGradient = ctx.createRadialGradient(
        cx,
        cy,
        0,
        cx,
        cy,
        maxRadius
      );
      coreGradient.addColorStop(0, '#040508');
      coreGradient.addColorStop(0.4, '#07080d');
      coreGradient.addColorStop(0.78, '#0b0d14');
      coreGradient.addColorStop(0.98, '#12151f');
      coreGradient.addColorStop(1, 'transparent');

      ctx.beginPath();
      ctx.arc(cx, cy, maxRadius, 0, Math.PI * 2);
      ctx.fillStyle = coreGradient;
      ctx.fill();

      // Optical rays
      ctx.save();
      ctx.globalCompositeOperation = 'screen';

      for (let i = 0; i < rays.length; i++) {
        const ray = rays[i];
        const currentAngle = ray.angle + Math.sin(time + i * 0.12) * 0.012;
        const cos = Math.cos(currentAngle);
        const sin = Math.sin(currentAngle);

        const innerOffset = maxRadius * ray.innerOffsetFactor;
        const length = maxRadius * ray.lengthFactor;

        const startX = cx + cos * innerOffset;
        const startY = cy + sin * innerOffset;
        const endX = cx + cos * length;
        const endY = cy + sin * length;

        const rayGrad = ctx.createLinearGradient(startX, startY, endX, endY);

        if (ray.hue === 0) {
          rayGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
          rayGrad.addColorStop(0.3, `rgba(255, 255, 255, ${ray.alpha * 0.8})`);
          rayGrad.addColorStop(0.8, `rgba(235, 248, 255, ${ray.alpha * 0.6})`);
          rayGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
        } else {
          rayGrad.addColorStop(0, `hsla(${ray.hue}, 90%, 65%, 0)`);
          rayGrad.addColorStop(0.25, `hsla(${ray.hue}, 95%, 70%, ${ray.alpha * 0.75})`);
          rayGrad.addColorStop(0.7, `hsla(${ray.hue + 25}, 90%, 65%, ${ray.alpha * 0.5})`);
          rayGrad.addColorStop(1, `hsla(${ray.hue + 45}, 90%, 60%, 0)`);
        }

        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.strokeStyle = rayGrad;
        ctx.lineWidth = ray.width;
        ctx.stroke();
      }

      // Central core glow
      const centralGlow = ctx.createRadialGradient(
        cx,
        cy,
        0,
        cx,
        cy,
        maxRadius * 0.35
      );
      centralGlow.addColorStop(0, 'rgba(255, 255, 255, 0.08)');
      centralGlow.addColorStop(0.5, 'rgba(120, 160, 255, 0.04)');
      centralGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = centralGlow;
      ctx.beginPath();
      ctx.arc(cx, cy, maxRadius * 0.35, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      id="prism-rays-canvas"
      className="absolute inset-0 pointer-events-none rounded-full w-full h-full"
      style={{ width: '100%', height: '100%' }}
    />
  );
};
