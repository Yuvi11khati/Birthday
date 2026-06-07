import { useEffect, useState } from 'react';

export function useMousePosition() {
  const [pos, setPos] = useState({ x: -200, y: -200 });

  useEffect(() => {
    let frame = 0;
    const handle = (e: MouseEvent) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => setPos({ x: e.clientX, y: e.clientY }));
    };
    window.addEventListener('pointermove', handle, { passive: true });
    return () => {
      window.removeEventListener('pointermove', handle);
      cancelAnimationFrame(frame);
    };
  }, []);

  return pos;
}
