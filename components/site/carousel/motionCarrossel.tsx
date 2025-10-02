'use client';

import { useEffect, useRef, useState } from 'react';
import CardCarrossel from '../cards/cardCarrossel';
import { motion } from 'framer-motion';

export default function MotionCarrossel({ data }: { data: any }) {
  const carousel = useRef<any>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    setWidth(carousel.current?.scrollWidth - carousel.current?.offsetWidth);
  }, []);

  return (
    <motion.div
      className="overflow-hidden p-4 rounded-2xl"
      ref={carousel}
      style={{
        background:
          'linear-gradient(180deg, var(--color-bg) 0%, var(--color-surface) 100%)',
        boxShadow: 'inset 0 0 20px rgba(0, 0, 0, 0.05)',
      }}>
      <motion.ul
        drag="x"
        dragConstraints={{ right: 0, left: -width }}
        dragMomentum={true}
        className="flex gap-8 snap-x snap-mandatory will-change-transform scale-75">
        {Object.values(data).map((item: any, index) => (
          <motion.li
            key={index}
            whileTap={{ scale: 1.1 }}
            className="snap-start shrink-0 select-none cursor-grab active:cursor-grabbing">
            <CardCarrossel
              title={item?.title}
              description={item?.description}
            />
          </motion.li>
        ))}
      </motion.ul>
    </motion.div>
  );
}
