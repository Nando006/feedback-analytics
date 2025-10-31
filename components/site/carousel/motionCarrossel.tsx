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
  // Quantos itens exibir por vez com base no breakpoint (responsividade)
  const [itemsPerView, setItemsPerView] = useState<number>(1);

  // 3. Função para calcular a largura, otimizada com useCallback
  const handleResize = useCallback(() => {
    if (carouselRef.current) {
      const scrollWidth = carouselRef.current.scrollWidth;
      const offsetWidth = carouselRef.current.offsetWidth;
      setWidth(scrollWidth - offsetWidth);
    }
  }, []);

  // Atualiza itemsPerView com base na largura da janela
  useEffect(() => {
    function updateItemsPerView() {
      const w = window.innerWidth;
      // Ajuste os breakpoints conforme sua grid/tailwind
      if (w >= 1280) setItemsPerView(3);
      else if (w >= 768) setItemsPerView(2);
      else setItemsPerView(1);
    }

    updateItemsPerView();
    window.addEventListener('resize', updateItemsPerView);
    return () => window.removeEventListener('resize', updateItemsPerView);
  }, []);

  // 4. Efeito que agora responde a mudanças no tamanho da tela
  useEffect(() => {
    handleResize(); // Calcula a largura na montagem

    // Use ResizeObserver para reagir a mudanças de layout internas (por exemplo quando minWidth dos itens muda)
    let ro: ResizeObserver | null = null;
    if (carouselRef.current && typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(() => handleResize());
      ro.observe(carouselRef.current);
    }

    window.addEventListener('resize', handleResize); // Adiciona listener para responsividade

    // Limpa o listener e observer ao desmontar o componente
    return () => {
      window.removeEventListener('resize', handleResize);
      if (ro && carouselRef.current) ro.unobserve(carouselRef.current);
    };
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
              className="flex-shrink-0"
              // Define a largura mínima com base em quantos itens devem caber na viewport
              style={{ minWidth: `${100 / itemsPerView}%` }}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 },
              }}
              whileHover={{ scale: 1.03, y: -5 }}
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