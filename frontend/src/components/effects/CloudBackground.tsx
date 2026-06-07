import { motion } from 'framer-motion';

export default function CloudBackground() {
  // We define three distinct clouds with different sizes, heights, opacity, and drifting durations.
  const clouds = [
    {
      id: 1,
      d: "M25 60 a20 20 0 0 1 20 -20 a25 25 0 0 1 45 -5 a20 20 0 0 1 30 5 a20 20 0 0 1 10 20 a20 20 0 0 1 -20 20 h-65 a20 20 0 0 1 -20 -20 z",
      scale: 1.8,
      top: '12%',
      duration: 75,
      opacity: 0.12,
      delay: 0,
    },
    {
      id: 2,
      d: "M10 50 a15 15 0 0 1 15 -15 a20 20 0 0 1 35 -4 a15 15 0 0 1 25 4 a15 15 0 0 1 10 15 a15 15 0 0 1 -15 15 h-55 a15 15 0 0 1 -15 -15 z",
      scale: 2.5,
      top: '25%',
      duration: 95,
      opacity: 0.08,
      delay: -30,
    },
    {
      id: 3,
      d: "M20 55 a18 18 0 0 1 18 -18 a22 22 0 0 1 40 -4 a18 18 0 0 1 28 4 a18 18 0 0 1 12 18 a18 18 0 0 1 -18 18 h-62 a18 18 0 0 1 -18 -18 z",
      scale: 1.4,
      top: '6%',
      duration: 60,
      opacity: 0.15,
      delay: -15,
    },
    {
      id: 4,
      d: "M30 65 a25 25 0 0 1 25 -25 a30 30 0 0 1 50 -6 a25 25 0 0 1 35 6 a25 25 0 0 1 15 25 a25 25 0 0 1 -25 25 h-75 a25 25 0 0 1 -25 -25 z",
      scale: 2.2,
      top: '45%',
      duration: 110,
      opacity: 0.06,
      delay: -45,
    },
  ];

  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
      {clouds.map((cloud) => (
        <motion.div
          key={cloud.id}
          className="absolute left-[-250px]"
          style={{ top: cloud.top, opacity: cloud.opacity }}
          animate={{
            x: ['-250px', '115vw'],
          }}
          transition={{
            duration: cloud.duration,
            repeat: Infinity,
            ease: 'linear',
            delay: cloud.delay,
          }}
        >
          <svg
            width="150"
            height="100"
            viewBox="0 0 150 100"
            fill="currentColor"
            className="text-white drop-shadow-md"
            style={{ transform: `scale(${cloud.scale})` }}
          >
            <path d={cloud.d} />
          </svg>
        </motion.div>
      ))}
    </div>
  );
}
