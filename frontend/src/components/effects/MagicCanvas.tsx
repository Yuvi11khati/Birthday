import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  decay: number;
  life: number;
}

interface TwinkleStar {
  x: number;
  y: number;
  size: number;
  speed: number;
  phase: number;
}

interface Bubble {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  wobbleSpeed: number;
  wobbleRange: number;
  angle: number;
}

export default function MagicCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Lists of objects
    const sparkles: Particle[] = [];
    const stars: TwinkleStar[] = [];
    const bubbles: Bubble[] = [];

    // Initialize Twinkling Stars
    const starCount = Math.floor((width * height) / 14000);
    for (let i = 0; i < starCount; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 1.8 + 0.5,
        speed: 0.01 + Math.random() * 0.02,
        phase: Math.random() * Math.PI * 2,
      });
    }

    // Initialize Bubbles
    const bubbleCount = Math.floor((width * height) / 80000);
    for (let i = 0; i < bubbleCount; i++) {
      bubbles.push({
        x: Math.random() * width,
        y: Math.random() * height + height, // Start below or randomly
        vx: (Math.random() - 0.5) * 0.3,
        vy: -0.4 - Math.random() * 0.8,
        size: Math.random() * 8 + 4,
        alpha: Math.random() * 0.15 + 0.05,
        wobbleSpeed: 0.02 + Math.random() * 0.03,
        wobbleRange: 0.2 + Math.random() * 0.5,
        angle: Math.random() * Math.PI * 2,
      });
    }

    const resize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);

    // Mouse movement listener for trailing sparkles
    let lastX = 0;
    let lastY = 0;
    let isFirstMove = true;

    const createSparkles = (x: number, y: number, count = 2) => {
      // Golden/lavender/blue colors for sparkles
      const colors = [
        'rgba(255, 209, 102, ', // Soft Gold
        'rgba(183, 148, 244, ', // Soft Lavender
        'rgba(165, 180, 252, ', // Baby Blue
        'rgba(255, 255, 255, ', // White
      ];

      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 1.5 + 0.2;
        sparkles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 0.5, // Float slightly upwards
          size: Math.random() * 3.5 + 1,
          color: colors[Math.floor(Math.random() * colors.length)],
          alpha: 1,
          decay: 0.01 + Math.random() * 0.015,
          life: 1,
        });
      }
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (isFirstMove) {
        lastX = e.clientX;
        lastY = e.clientY;
        isFirstMove = false;
        return;
      }

      const dist = Math.hypot(e.clientX - lastX, e.clientY - lastY);
      if (dist > 8) {
        // Spawn more sparkles if moving fast
        createSparkles(e.clientX, e.clientY, Math.min(Math.floor(dist / 6), 5));
        lastX = e.clientX;
        lastY = e.clientY;
      }
    };

    // Occasional ambient sparkles
    let ambientTimer = 0;

    window.addEventListener('pointermove', handlePointerMove, { passive: true });

    // Loop
    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      // 1. Draw and update stars
      stars.forEach((star) => {
        star.phase += star.speed;
        const currentAlpha = 0.2 + Math.abs(Math.sin(star.phase)) * 0.8;
        
        ctx.fillStyle = `rgba(255, 255, 255, ${currentAlpha})`;
        ctx.beginPath();
        // Simple star shape or circular
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();

        // Very occasional star glow
        if (star.size > 1.8 && Math.sin(star.phase) > 0.95) {
          ctx.shadowBlur = 6;
          ctx.shadowColor = '#ffd166';
          ctx.arc(star.x, star.y, star.size + 1, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 209, 102, ${currentAlpha * 0.4})`;
          ctx.fill();
          ctx.shadowBlur = 0; // reset
        }
      });

      // 2. Draw and update bubbles
      bubbles.forEach((bubble) => {
        bubble.y += bubble.vy;
        bubble.angle += bubble.wobbleSpeed;
        bubble.x += Math.sin(bubble.angle) * bubble.wobbleRange;

        // Reset if it goes off screen
        if (bubble.y + bubble.size < 0) {
          bubble.y = height + bubble.size + Math.random() * 20;
          bubble.x = Math.random() * width;
        }

        // Draw soft bubble
        ctx.strokeStyle = `rgba(165, 180, 252, ${bubble.alpha})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(bubble.x, bubble.y, bubble.size, 0, Math.PI * 2);
        ctx.stroke();

        // Bubble highlight
        ctx.fillStyle = `rgba(255, 255, 255, ${bubble.alpha * 0.6})`;
        ctx.beginPath();
        ctx.arc(
          bubble.x - bubble.size * 0.3,
          bubble.y - bubble.size * 0.3,
          bubble.size * 0.2,
          0,
          Math.PI * 2
        );
        ctx.fill();
      });

      // 3. Draw and update sparkles
      for (let i = sparkles.length - 1; i >= 0; i--) {
        const s = sparkles[i];
        s.x += s.vx;
        s.y += s.vy;
        s.alpha -= s.decay;

        if (s.alpha <= 0) {
          sparkles.splice(i, 1);
          continue;
        }

        ctx.fillStyle = `${s.color}${s.alpha})`;
        ctx.shadowBlur = 4;
        ctx.shadowColor = s.color.includes('255, 209') ? '#ffd166' : '#b794f4';

        ctx.beginPath();
        // A diamond/sparkle star shape instead of simple circles for a premium feel
        const r = s.size;
        ctx.moveTo(s.x, s.y - r);
        ctx.lineTo(s.x + r * 0.4, s.y - r * 0.4);
        ctx.lineTo(s.x + r, s.y);
        ctx.lineTo(s.x + r * 0.4, s.y + r * 0.4);
        ctx.moveTo(s.x, s.y + r);
        ctx.lineTo(s.x - r * 0.4, s.y + r * 0.4);
        ctx.lineTo(s.x - r, s.y);
        ctx.lineTo(s.x - r * 0.4, s.y - r * 0.4);
        ctx.closePath();
        ctx.fill();
        ctx.shadowBlur = 0; // reset
      }

      // Ambient particle generation
      ambientTimer++;
      if (ambientTimer % 35 === 0) {
        // Spawn an ambient spark floating in random places
        createSparkles(Math.random() * width, Math.random() * (height * 0.8), 1);
      }

      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', handlePointerMove);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-0 h-full w-full"
      style={{ opacity: 0.85 }}
    />
  );
}
