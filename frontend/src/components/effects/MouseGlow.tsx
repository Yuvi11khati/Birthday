import { useMousePosition } from '../../hooks/useMousePosition';

/** Soft lavender/gold glow that follows the cursor (desktop only, pointer-fine). */
export default function MouseGlow() {
  const { x, y } = useMousePosition();
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-30 hidden mix-blend-soft-light md:block"
      style={{
        background: `radial-gradient(220px circle at ${x}px ${y}px, rgba(255,209,102,0.35), rgba(183,148,244,0.18) 40%, transparent 70%)`,
        transition: 'background 0.12s ease-out',
      }}
    />
  );
}
