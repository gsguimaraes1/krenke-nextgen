import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

interface ShowcaseCardProps {
  title: string;
  subtitle?: string;
  image: string;
  link: string;
  description: string;
  color: string;
  alt?: string;
  priority?: boolean;
  id?: string;
}

export const ShowcaseCard: React.FC<ShowcaseCardProps> = ({ 
  title, 
  subtitle,
  image, 
  link, 
  description, 
  color, 
  alt,
  priority = false,
  id
}) => {
  const [isHovered, setIsHovered] = useState(false);

  // Helper to convert hex to rgba for shadows
  const getRgba = (hex: string, alpha: number) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  return (
    <div className="flex items-center justify-center w-full">
      <motion.div
        className="relative h-[650px] md:h-[700px] w-full max-w-[450px] rounded-[3rem] shadow-premium flex flex-col px-10 py-12 gap-8 overflow-hidden border border-white/20 group"
        style={{ backgroundColor: `${color}F2` }} // ~95% opacity
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        whileHover={{
          y: -20,
          boxShadow: `0 40px 80px -15px ${getRgba(color, 0.6)}`,
        }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
      >
        {/* Animated Glow Backdrop */}
        <motion.div
          animate={{
            scale: isHovered ? [1, 1.2, 1] : 1,
            opacity: isHovered ? [0.3, 0.5, 0.3] : 0.2
          }}
          transition={{ duration: 4, repeat: Infinity }}
          className="absolute -top-20 -right-20 w-64 h-64 rounded-full blur-[80px] pointer-events-none"
          style={{ backgroundColor: 'white' }}
        />

        <div className="flex justify-end items-center z-20 h-8">
          {/* Top arrow removed as requested */}
        </div>

        {/* Content Section */}
        <div className="flex flex-col gap-6 h-full z-10 relative">
          <div className="flex flex-col items-center justify-center pt-2 px-2 text-center">
            {subtitle && (
              <motion.span 
                className="text-[10px] md:text-xs font-black uppercase tracking-[0.3em] text-white/70 mb-2"
                animate={{ opacity: isHovered ? 1 : 0.7 }}
              >
                {subtitle}
              </motion.span>
            )}
            <motion.h3
              className="text-3xl md:text-3xl font-black text-white uppercase leading-tight tracking-tight drop-shadow-2xl"
              animate={{ y: isHovered ? -2 : 0 }}
            >
              {title}
            </motion.h3>
          </div>

          <motion.div
            className="relative flex-grow rounded-[2rem] overflow-hidden bg-white shadow-xl"
            animate={{
              scale: isHovered ? 1.05 : 1,
            }}
            transition={{ duration: 0.4 }}
          >

            {/* Main Image */}
            <div className="relative z-10 w-full h-full p-6 flex items-center justify-center">
              <motion.img
                src={image}
                alt={alt || `Playground Krenke - ${title}`}
                width={380}
                height={550}
                loading={priority ? 'eager' : 'lazy'}
                fetchPriority={priority ? 'high' : 'auto'}
                decoding="async"
                className="w-full h-full object-contain"
                animate={{
                  scale: isHovered ? 1.1 : 1
                }}
              />
            </div>
          </motion.div>

          <Link to={link} className="mt-auto">
            <motion.button
              id={id}
              className="w-full py-4 bg-white rounded-2xl text-sm font-black uppercase tracking-widest shadow-xl transition-all"
              style={{ color: color }}
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
            >
              Ver Produtos
            </motion.button>
          </Link>

        </div>

        {/* Interactive Bottom Border */}
        <motion.div
          className="absolute bottom-0 left-0 h-1.5 bg-white"
          initial={{ width: 0 }}
          animate={{ width: isHovered ? '100%' : '0%' }}
          transition={{ duration: 0.6 }}
        />
      </motion.div>
    </div>
  );
};