import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  once?: boolean;
}

/** Gentle scroll-reveal used across every section. */
export default function Reveal({
  children,
  delay = 0,
  y = 28,
  className = '',
  once = true,
}: Props) {
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let handleScroll: () => void;
    let isListening = false;

    const startListening = () => {
      isListening = true;
      handleScroll = () => {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        
        // Trigger when the top of the element enters the viewport (with a 40px offset)
        if (rect.top < window.innerHeight - 40) {
          setInView(true);
          if (once) {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('resize', handleScroll);
          }
        } else if (!once) {
          setInView(false);
        }
      };

      // Check position after the layout has settled
      handleScroll();

      window.addEventListener('scroll', handleScroll, { passive: true });
      window.addEventListener('resize', handleScroll, { passive: true });
    };

    // Delay listener activation by 600ms to allow images to load and heights to stabilize
    const setupTimeout = setTimeout(startListening, 600);

    return () => {
      clearTimeout(setupTimeout);
      if (isListening && handleScroll) {
        window.removeEventListener('scroll', handleScroll);
        window.removeEventListener('resize', handleScroll);
      }
    };
  }, [once]);

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y }}
      transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
