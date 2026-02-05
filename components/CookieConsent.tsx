import React, { useState, useEffect } from 'react';
import { ShieldCheck, X, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const CookieConsent: React.FC = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem('krenke-cookie-consent');
        if (!consent) {
            const timer = setTimeout(() => setIsVisible(true), 1500);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem('krenke-cookie-consent', 'accepted');
        setIsVisible(false);
    };

    const handleDecline = () => {
        localStorage.setItem('krenke-cookie-consent', 'declined');
        setIsVisible(false);
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    className="fixed bottom-0 left-0 right-0 z-[100] p-4 md:p-6"
                >
                    <div className="max-w-7xl mx-auto">
                        <div className="bg-white/95 backdrop-blur-xl border border-gray-200 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] rounded-2xl md:rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
                            {/* Decorative side accent */}
                            <div className="absolute top-0 left-0 w-2 h-full bg-krenke-orange"></div>

                            <div className="flex items-start md:items-center gap-5 flex-1">
                                <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center shrink-0 border border-orange-100">
                                    <ShieldCheck className="text-krenke-orange" size={32} strokeWidth={2.5} />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-xl font-black text-krenke-purple">Privacidade e Cookies</h3>
                                    <p className="text-gray-600 text-sm md:text-base leading-relaxed max-w-3xl">
                                        Utilizamos cookies fundamentais para o funcionamento do site e para melhorar sua experiência de navegação, em conformidade com a <strong>LGPD (Lei Geral de Proteção de Dados)</strong>. Ao continuar, você concorda com nossa política.
                                    </p>
                                    <div className="flex gap-4">
                                        <a href="/politica-de-privacidade" className="text-krenke-orange text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 hover:underline transition-all">
                                            <FileText size={14} /> Ler Política Completa
                                        </a>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                                <button
                                    onClick={handleDecline}
                                    className="w-full sm:w-auto px-6 py-3 text-gray-400 font-bold text-sm hover:text-gray-600 transition-colors"
                                >
                                    Recusar
                                </button>
                                <button
                                    onClick={handleAccept}
                                    className="w-full sm:w-auto px-10 py-4 bg-krenke-purple text-white font-black rounded-xl shadow-lg shadow-purple-900/10 hover:shadow-purple-900/20 hover:-translate-y-1 active:scale-95 transition-all duration-300 uppercase tracking-wide text-sm"
                                >
                                    Aceitar e Continuar
                                </button>
                            </div>

                            <button
                                onClick={() => setIsVisible(false)}
                                className="absolute top-4 right-4 text-gray-300 hover:text-gray-500 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
