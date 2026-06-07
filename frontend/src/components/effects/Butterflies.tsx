import { motion } from 'framer-motion';

export default function Butterflies() {
  const butterflies = [
    {
      id: 1,
      color: '#B794F4', // Soft Lavender
      scale: 0.7,
      top: '30%',
      delay: 0,
      duration: 18,
      pathX: [0, 250, 450, 200, 50, -100],
      pathY: [0, -100, 50, 150, 100, 0],
    },
    {
      id: 2,
      color: '#A5B4FC', // Baby Blue
      scale: 0.65,
      top: '60%',
      delay: 4,
      duration: 22,
      pathX: [0, -150, -350, -100, 100, 250, 0],
      pathY: [0, 80, -40, -120, -60, 50, 0],
    },
    {
      id: 3,
      color: '#FFD166', // Soft Gold
      scale: 0.55,
      top: '15%',
      delay: 8,
      duration: 20,
      pathX: [0, 180, 80, -100, -200, 0],
      pathY: [0, 120, 240, 100, -50, 0],
    },
  ];

  return (
    <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden" aria-hidden="true">
      {butterflies.map((b) => (
        <motion.div
          key={b.id}
          className="absolute"
          style={{
            top: b.top,
            left: b.id === 2 ? '85%' : '15%',
          }}
          animate={{
            x: b.pathX,
            y: b.pathY,
          }}
          transition={{
            duration: b.duration,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: b.delay,
          }}
        >
          {/* 3D Flapping wings effect */}
          <div className="relative flex items-center justify-center" style={{ transform: `scale(${b.scale})` }}>
            {/* Left wing */}
            <motion.div
              style={{ originX: 1, fill: b.color }}
              animate={{ rotateY: [0, 75, 0] }}
              transition={{ duration: 0.35, repeat: Infinity, ease: 'easeInOut' }}
              className="w-5 h-5"
            >
              <svg viewBox="0 0 100 100" className="w-full h-full">
                <path d="M100 50 C100 20, 60 0, 30 10 C10 20, 0 40, 20 60 C40 80, 80 80, 100 50 Z" />
              </svg>
            </motion.div>

            {/* Body */}
            <div className="w-[3px] h-6 bg-slate-700 rounded-full mx-[1px]" />

            {/* Right wing */}
            <motion.div
              style={{ originX: 0, fill: b.color }}
              animate={{ rotateY: [0, -75, 0] }}
              transition={{ duration: 0.35, repeat: Infinity, ease: 'easeInOut' }}
              className="w-5 h-5"
            >
              <svg viewBox="0 0 100 100" className="w-full h-full">
                <path d="M0 50 C0 20, 40 0, 70 10 C90 20, 100 40, 80 60 C60 80, 20 80, 0 50 Z" />
              </svg>
            </motion.div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
