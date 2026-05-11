import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// Import images directly
import img1 from '../assets/Carrossel-home/Playground-krenke-01.webp';
import img2 from '../assets/Carrossel-home/Playground-krenke-02.webp';
import img3 from '../assets/Carrossel-home/Playground-krenke-03.webp';
import img4 from '../assets/Carrossel-home/Playground-krenke-04.webp';
import img5 from '../assets/Carrossel-home/Playground-krenke-05.webp';

const images = [img1, img2, img3, img4, img5];

export const ImageCarousel: React.FC = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [itemsPerScreen, setItemsPerScreen] = useState(3);

    // Responsive check
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 640) {
                setItemsPerScreen(1);
            } else if (window.innerWidth < 1024) {
                setItemsPerScreen(2);
            } else {
                setItemsPerScreen(3);
            }
        };

        handleResize(); // Init
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const maxIndex = Math.max(0, images.length - itemsPerScreen);

    const nextSlide = () => {
        setCurrentIndex(prev => (prev >= maxIndex ? 0 : prev + 1));
    };

    const prevSlide = () => {
        setCurrentIndex(prev => (prev <= 0 ? maxIndex : prev - 1));
    };

    // Auto-play
    useEffect(() => {
        const timer = setInterval(() => {
            if (window.innerWidth >= 640 && currentIndex < maxIndex) {
                setCurrentIndex(prev => (prev >= maxIndex ? 0 : prev + 1));
            } else if (window.innerWidth >= 640 && currentIndex >= maxIndex) {
                setCurrentIndex(0);
            }
        }, 4000);
        return () => clearInterval(timer);
    }, [itemsPerScreen, maxIndex, currentIndex]);

    return (
        <section className="py-32 bg-white overflow-hidden relative">
            <div className="absolute top-1/2 left-0 w-64 h-64 bg-krenke-purple/5 rounded-full blur-[100px] pointer-events-none"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="text-center mb-20">
                    <motion.h2
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        className="text-4xl md:text-6xl font-black text-gray-900 mb-6 uppercase tracking-tighter"
                    >
                        Espaços Transformativos <br />
                        <span className="text-vibrant-orange drop-shadow-sm">Memórias Inesquecíveis</span>
                    </motion.h2>
                    <p className="text-xl text-gray-500 max-w-3xl mx-auto font-medium">
                        Somos especialistas em criar ecossistemas de lazer que encantam e inspiram gerações.
                    </p>
                </div>

                <div className="relative group">
                    {/* Carousel Track Container */}
                    <div className="overflow-hidden w-full px-4 py-12">
                        <motion.div
                            className="flex gap-8"
                            animate={{ x: `calc(-${currentIndex * (100 / itemsPerScreen)}% - ${currentIndex * 32 / itemsPerScreen}px)` }}
                            transition={{ type: "spring", stiffness: 200, damping: 25 }}
                        >
                            {images.map((img, idx) => (
                                <motion.div
                                    key={idx}
                                    className="relative flex-shrink-0 rounded-[3rem] overflow-hidden shadow-premium bg-slate-50 border border-gray-100"
                                    style={{
                                        width: `calc(${100 / itemsPerScreen}% - ${32 * (itemsPerScreen - 1) / itemsPerScreen}px)`,
                                        height: '500px'
                                    }}
                                    whileHover={{ scale: 1.02, y: -20 }}
                                    transition={{ duration: 0.4 }}
                                >
                                    <img src={img} alt={`Projeto ${idx + 1}`} className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-krenke-purple/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-end p-10">
                                        <motion.span
                                            initial={{ y: 20, opacity: 0 }}
                                            whileInView={{ y: 0, opacity: 1 }}
                                            className="text-white font-black text-3xl uppercase tracking-tighter"
                                        >
                                            Projeto <br />
                                            <span className="text-vibrant-orange">EXCLUSIVO #{idx + 1}</span>
                                        </motion.span>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    </div>

                    {/* Navigation Buttons */}
                    <div className="hidden md:flex justify-center gap-6 mt-12">
                        <motion.button
                            whileHover={{ scale: 1.1, x: -5 }}
                            whileTap={{ scale: 0.9 }}
                            className="w-16 h-16 bg-white shadow-premium rounded-2xl flex items-center justify-center text-krenke-purple hover:bg-krenke-purple hover:text-white transition-all border border-gray-50"
                            onClick={prevSlide}
                        >
                            <ChevronLeft size={32} strokeWidth={3} />
                        </motion.button>

                        <motion.button
                            whileHover={{ scale: 1.1, x: 5 }}
                            whileTap={{ scale: 0.9 }}
                            className="w-16 h-16 bg-white shadow-premium rounded-2xl flex items-center justify-center text-krenke-purple hover:bg-krenke-purple hover:text-white transition-all border border-gray-50"
                            onClick={nextSlide}
                        >
                            <ChevronRight size={32} strokeWidth={3} />
                        </motion.button>
                    </div>
                </div>
            </div>
        </section>
    );
};
