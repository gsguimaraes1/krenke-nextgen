import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import logo from '../assets/Logos/krenke-brinquedos-logo-branco.png';

export const IntroScreen: React.FC = () => {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        // 0.8s (entrada) + 1.2s (espera) = 2s total antes de iniciar a saída
        const timer = setTimeout(() => {
            setIsVisible(false);
        }, 2000);
        return () => clearTimeout(timer);
    }, []);

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    key="intro-screen"
                    initial={{ y: 0 }}
                    exit={{
                        y: '-100%',
                        transition: { duration: 0.8, ease: [0.77, 0, 0.175, 1] } // Ease robusto (industrial)
                    }}
                    className="fixed inset-0 z-[100] bg-krenke-purple flex items-center justify-center p-12"
                    style={{ backgroundColor: '#312783' }} // Garantindo a cor sólida da marca
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{
                            duration: 0.8,
                            ease: "easeOut"
                        }}
                        className="relative flex flex-col items-center"
                    >
                        <img
                            src={logo}
                            alt="Krenke Brinquedos"
                            className="max-w-[280px] md:max-w-[450px] w-full h-auto drop-shadow-2xl"
                        />

                        {/* Linha de progresso sutil para aumentar a percepção de tecnologia */}
                        <motion.div
                            initial={{ width: 0, opacity: 0 }}
                            animate={{ width: '100%', opacity: 1 }}
                            transition={{ delay: 0.5, duration: 1.2, ease: "linear" }}
                            className="h-[2px] bg-krenke-orange mt-8 rounded-full"
                        />
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
