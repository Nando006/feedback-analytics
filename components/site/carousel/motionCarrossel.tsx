'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import CardCarrossel from '../cards/cardCarrossel'; // Verifique se o caminho está correto

// 1. Defina uma interface para os dados, melhorando a tipagem
interface CarouselItem {
  id: string | number; // Use um ID único para a 'key'
  title: string;
  description: string;
}

interface MotionCarouselProps {
  data: CarouselItem[];
}

export default function MotionCarousel({ data }: MotionCarouselProps) {
  // 2. Tipagem correta para a referência do elemento
  const carouselRef = useRef<HTMLUListElement>(null);
  const [width, setWidth] = useState(0);

  // 3. Função para calcular a largura, otimizada com useCallback
  const handleResize = useCallback(() => {
    if (carouselRef.current) {
      const scrollWidth = carouselRef.current.scrollWidth;
      const offsetWidth = carouselRef.current.offsetWidth;
      setWidth(scrollWidth - offsetWidth);
    }
  }, []);

  // 4. Efeito que agora responde a mudanças no tamanho da tela
  useEffect(() => {
    handleResize(); // Calcula a largura na montagem
    window.addEventListener('resize', handleResize); // Adiciona listener para responsividade

    // Limpa o listener ao desmontar o componente para evitar vazamento de memória
    return () => window.removeEventListener('resize', handleResize);
  }, [data, handleResize]); // Roda novamente se os dados ou a função mudarem

  return (
    <div className="w-full">
      <motion.div
        className="overflow-hidden cursor-grab"
        whileTap={{ cursor: 'grabbing' }}
      >
        <motion.ul
          ref={carouselRef}
          className="flex gap-8 p-4" // Padding para evitar que sombras sejam cortadas
          drag="x"
          dragConstraints={{ right: 0, left: -width }}
          dragElastic={0.1} // 5. Efeito elástico sutil ao arrastar até o fim
          initial="hidden"
          animate="visible"
          variants={{
            visible: {
              transition: {
                staggerChildren: 0.1, // Anima a entrada de cada card
              },
            },
          }}
        >
          {data.map((item) => (
            <motion.li
              key={item.id}
              className="flex-shrink-0 w-full"
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 },
              }}
              whileHover={{ scale: 1.05, y: -5 }}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            >
              <CardCarrossel
                title={item.title}
                description={item.description}
              />
            </motion.li>
          ))}
        </motion.ul>
      </motion.div>
    </div>
  );
}