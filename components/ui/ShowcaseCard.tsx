import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Box } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ShowcaseCardProps {
  title: string | React.ReactNode;
  image: string;
  description: string;
  link: string;
  color?: string;
  imageScale?: number;
  alt?: string;
}

export const ShowcaseCard: React.FC<ShowcaseCardProps> = ({ title, image, description, link, color = '#312783', imageScale = 1, alt }) => {
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
        className="relative min-h-[550px] w-full max-w-[380px] rounded-[3rem] shadow-premium flex flex-col p-6 gap-6 overflow-hidden border border-white/20 group"
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

        {/* Header Section */}
        <div className="flex justify-between items-center z-20">
          <motion.div
            whileHover={{ rotate: 15, scale: 1.2 }}
            className="bg-white/20 p-3 rounded-2xl backdrop-blur-md border border-white/20"
          >
            <Box size={28} className="text-white" />
          </motion.div>

          <Link to={link}>
            <motion.div
              className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center cursor-pointer shadow-2xl group-hover:rotate-12 transition-all"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <ArrowRight size={24} style={{ color: color }} strokeWidth={3} />
            </motion.div>
          </Link>
        </div>

        {/* Content Section */}
        <div className="flex flex-col gap-6 h-full z-10 relative">
          <motion.h3
            className="text-4xl text-center font-black text-white uppercase leading-none tracking-tighter drop-shadow-2xl"
            animate={{ y: isHovered ? -5 : 0 }}
          >
            {title}
          </motion.h3>

          <motion.div
            className="relative flex-grow rounded-[2rem] overflow-hidden border-2 border-white/10 shadow-inner"
            animate={{
              scale: isHovered ? 1.05 : 1,
            }}
            transition={{ duration: 0.4 }}
          >
            {/* Background Blur Effect */}
            <div className="absolute inset-0 opacity-40 z-0">
              <motion.img
                src={image}
                alt={alt || (typeof title === 'string' ? title : 'Produto Krenke')}
                className="w-full h-full object-cover blur-xl scale-150"
                animate={{
                  scale: isHovered ? 1.2 : 1.5,
                  rotate: isHovered ? 5 : 0
                }}
                transition={{ duration: 3, ease: "easeInOut" }}
              />
            </div>

            {/* Main Image */}
            <div className="relative z-10 w-full h-full p-2">
              <motion.img
                src={image}
                alt={alt || (typeof title === 'string' ? title : 'Produto Krenke')}
                className="w-full h-full object-cover rounded-[1.8rem] shadow-2xl"
                style={{ transform: `scale(${imageScale})` }}
                animate={{
                  y: isHovered ? -10 : 0,
                  rotate: isHovered ? -2 : 0
                }}
              />
              {/* Vibrant Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
            </div>
          </motion.div>

          <motion.p
            className="text-sm text-center text-white/90 font-bold px-4 pb-4 leading-snug drop-shadow-md"
            animate={{ opacity: isHovered ? 1 : 0.8 }}
          >
            {description}
          </motion.p>
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