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
}

export const ShowcaseCard: React.FC<ShowcaseCardProps> = ({ title, image, description, link, color = '#312783', imageScale = 1 }) => {
  const [isHovered, setIsHovered] = useState(false);

  // Helper to convert hex to rgba for shadows
  const getRgba = (hex: string, alpha: number) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };



  return (
    <div className="flex items-center justify-center">
      <motion.div
        className="relative min-h-[500px] w-full max-w-[350px] backdrop-blur-md rounded-3xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)] flex flex-col p-4 gap-4 overflow-hidden border border-white/10"
        style={{ backgroundColor: `${color}E6` }} // Hex + E6 = ~90% opacity
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        whileHover={{
          scale: 1.02,
          boxShadow: `0 35px 60px -15px ${getRgba(color, 0.5)}`,
          borderColor: "rgba(255,255,255,0.3)"
        }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
      >
        {/* Header Section */}
        <motion.div
          className="flex justify-between p-2 items-center z-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <motion.div
            whileHover={{ rotate: 10, scale: 1.1 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="bg-white/20 p-2 rounded-full"
          >
            <Box size={24} className="text-white" />
          </motion.div>

          <Link to={link}>
            <motion.div
              className="w-10 h-10 bg-white rounded-full flex items-center justify-center cursor-pointer shadow-lg"
              whileHover={{
                scale: 1.1,
                backgroundColor: "#ffffff",
                boxShadow: `0 0 15px ${getRgba(color, 0.7)}`
              }}
              whileTap={{ scale: 0.95 }}
            >
              <ArrowRight size={20} style={{ color: color }} />
            </motion.div>
          </Link>
        </motion.div>

        {/* Content Section */}
        <div className="flex flex-col gap-4 h-full">
          <motion.h3
            className="text-3xl text-center font-black text-white uppercase leading-none tracking-tight drop-shadow-md -mt-2 mb-2"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            {title}
          </motion.h3>

          <motion.div
            className="relative flex-grow rounded-2xl overflow-hidden group"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            {/* Background Blur Effect */}
            <div className="absolute inset-0 opacity-30 z-0">
              <motion.img
                src={image}
                alt="Background"
                className="w-full h-full object-cover blur-md scale-150"
                animate={{ scale: isHovered ? 1.2 : 1.5 }}
                transition={{ duration: 3, ease: "easeInOut" }}
              />
            </div>

            {/* Main Image */}
            <motion.div
              className="relative z-10 w-full h-full"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "easeInOut", duration: 0.5 }}
            >
              <img
                src={image}
                alt={title}
                className="w-full h-full object-cover rounded-2xl shadow-inner transition-transform duration-500"
                style={{ transform: `scale(${imageScale})` }}
              />
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80"></div>
            </motion.div>
          </motion.div>

          <motion.p
            className="text-xs text-center text-white font-medium px-4 pb-2 line-clamp-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.7 }}
          >
            {description}
          </motion.p>
        </div>
      </motion.div>
    </div>
  );
};