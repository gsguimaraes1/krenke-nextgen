import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import logo from '../assets/Logos/krenke-brinquedos-logo-branco.png';

export const Preloader: React.FC = () => {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Tempo de carregamento (2.5 segundos)
        const timer = setTimeout(() => {
            setLoading(false);
        }, 2500);
        return () => clearTimeout(timer);
    }, []);

    return (
        <AnimatePresence>
            {loading && (
                <motion.div
                    key="preloader"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0, transition: { duration: 0.8, ease: "easeInOut" } }}
                    className="fixed inset-0 z-[9999] bg-[#312783] flex items-center justify-center pointer-events-auto"
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="relative flex flex-col items-center p-12"
                    >
                        <img
                            src={logo}
                            alt="Krenke Brinquedos"
                            className="max-w-[280px] md:max-w-[450px] w-full h-auto drop-shadow-2xl"
                        />

                        <div className="mt-8 flex flex-col items-center gap-4">
                            <p className="text-white font-black tracking-[0.4em] text-[10px] md:text-[12px] uppercase opacity-70">
                                Tecnologia em Lazer
                            </p>
                            {/* Linha de carregamento sutil */}
                            <motion.div
                                initial={{ width: 0, opacity: 0 }}
                                animate={{ width: '100%', opacity: 1 }}
                                transition={{ delay: 0.5, duration: 1.5, ease: "linear" }}
                                className="h-[2px] bg-white/20 w-32 rounded-full overflow-hidden"
                            >
                                <motion.div
                                    className="h-full bg-orange-500"
                                    animate={{ x: ['-100%', '100%'] }}
                                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                                />
                            </motion.div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
