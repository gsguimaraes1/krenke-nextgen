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
        <section className="py-20 bg-white overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-black text-gray-900 mb-4">
                        Espaços transformados, <span className="text-krenke-orange">memórias inesquecíveis</span>
                    </h2>
                    <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                        Somos especialistas em criar playgrounds que encantam e inspiram gerações
                    </p>
                </div>

                <div className="relative group">
                    {/* Carousel Track Container */}
                    <div className="overflow-hidden w-full px-4 py-8">
                        <motion.div
                            className="flex gap-6"
                            animate={{ x: `calc(-${currentIndex * (100 / itemsPerScreen)}% - ${currentIndex * 24 / itemsPerScreen}px)` }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        >
                            {images.map((img, idx) => (
                                <motion.div
                                    key={idx}
                                    className="relative flex-shrink-0 rounded-3xl overflow-hidden shadow-xl bg-gray-100"
                                    style={{
                                        width: `calc(${100 / itemsPerScreen}% - ${24 * (itemsPerScreen - 1) / itemsPerScreen}px)`,
                                        height: '400px'
                                    }}
                                    whileHover={{ scale: 1.05, y: -10 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <img src={img} alt={`Projeto ${idx + 1}`} className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                                        <span className="text-white font-bold text-lg">Projeto #{idx + 1}</span>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    </div>

                    {/* Navigation Buttons */}
                    <button
                        className="absolute -left-2 top-1/2 -translate-y-1/2 w-12 h-12 bg-white shadow-lg rounded-full flex items-center justify-center text-krenke-purple hover:bg-krenke-purple hover:text-white transition-all transform hover:scale-110 z-10"
                        onClick={prevSlide}
                    >
                        <ChevronLeft size={28} strokeWidth={2.5} />
                    </button>

                    <button
                        className="absolute -right-2 top-1/2 -translate-y-1/2 w-12 h-12 bg-white shadow-lg rounded-full flex items-center justify-center text-krenke-purple hover:bg-krenke-purple hover:text-white transition-all transform hover:scale-110 z-10"
                        onClick={nextSlide}
                    >
                        <ChevronRight size={28} strokeWidth={2.5} />
                    </button>
                </div>
            </div>
        </section>
    );
};
