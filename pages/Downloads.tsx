import React from 'react';
import { motion } from 'framer-motion';
import { Download, FileText, ChevronRight, BookOpen, ShieldCheck, LayoutGrid } from 'lucide-react';

const DownloadsPage: React.FC = () => {
    const resources = [
        {
            title: "Catálogo Geral 2025",
            description: "Linha completa de playgrounds, mobiliário urbano e brinquedos interativos.",
            size: "45 MB",
            type: "PDF",
            icon: LayoutGrid,
            accent: "vibrant-orange"
        },
        {
            title: "Manual de Instalação",
            description: "Guia técnico detalhado para preparação do terreno e montagem segura.",
            size: "12 MB",
            type: "PDF",
            icon: BookOpen,
            accent: "vibrant-purple"
        },
        {
            title: "Certificações de Segurança",
            description: "Laudos técnicos e conformidades com as normas ABNT NBR 16071.",
            size: "5 MB",
            type: "PDF",
            icon: ShieldCheck,
            accent: "vibrant-green"
        },
        {
            title: "Guia de Manutenção",
            description: "Cronograma e procedimentos para garantir a longevidade do seu parque.",
            size: "3 MB",
            type: "PDF",
            icon: FileText,
            accent: "vibrant-cyan"
        }
    ];

    return (
        <div className="bg-slate-50 min-h-screen pb-32 overflow-x-hidden">
            {/* Header Banner - Vibrant Hero */}
            <div className="relative h-[450px] md:h-[600px] overflow-hidden flex items-center bg-krenke-purple">
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-gradient-to-br from-krenke-purple via-vibrant-purple to-vibrant-orange opacity-50 mix-blend-overlay"></div>
                    <motion.div
                        animate={{
                            scale: [1, 1.1, 1],
                            opacity: [0.3, 0.5, 0.3]
                        }}
                        transition={{ duration: 15, repeat: Infinity }}
                        className="absolute top-0 right-0 w-[50%] h-full bg-vibrant-orange/10 blur-[120px] rounded-full"
                    ></motion.div>
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                </div>

                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="flex flex-col items-start"
                    >
                        <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 text-white text-xs font-black uppercase tracking-[0.3em] mb-10">
                            <span className="w-2 h-2 rounded-full bg-vibrant-orange animate-pulse shadow-vibrant-orange"></span>
                            Central de Recursos
                        </div>

                        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white leading-[0.8] tracking-tighter mb-10 uppercase drop-shadow-2xl">
                            DOWNLOADS <br />
                            <span className="text-vibrant-orange">TÉCNICOS</span>
                        </h1>

                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: '200px' }}
                            transition={{ delay: 0.6, duration: 1 }}
                            className="h-3 bg-vibrant-orange rounded-full shadow-vibrant-orange"
                        ></motion.div>
                    </motion.div>
                </div>

                <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-slate-50 to-transparent z-10"></div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-20">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    {resources.map((item, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1 }}
                            whileHover={{ y: -10 }}
                            className="group relative"
                        >
                            {/* Glow Effect */}
                            <div className={`absolute -inset-2 bg-${item.accent} rounded-[3rem] opacity-0 group-hover:opacity-20 blur-xl transition-all duration-500`}></div>

                            <div className="relative bg-white p-12 rounded-[2.5rem] shadow-premium border border-slate-100 flex flex-col md:flex-row gap-8 items-center h-full">
                                <div className={`w-24 h-24 rounded-3xl bg-${item.accent}/10 flex items-center justify-center shrink-0 border border-${item.accent}/20`}>
                                    <item.icon size={40} className={`text-${item.accent}`} />
                                </div>

                                <div className="flex-grow text-center md:text-left">
                                    <div className="flex flex-col md:flex-row md:items-center gap-2 mb-4">
                                        <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tighter group-hover:text-vibrant-orange transition-colors">
                                            {item.title}
                                        </h3>
                                        <span className={`inline-block px-3 py-1 rounded-full bg-slate-100 text-[10px] font-black uppercase text-gray-400 tracking-widest`}>
                                            {item.type} • {item.size}
                                        </span>
                                    </div>
                                    <p className="text-gray-400 font-medium leading-relaxed italic mb-8">
                                        {item.description}
                                    </p>

                                    <button className={`w-full md:w-auto px-8 py-4 bg-gray-900 group-hover:bg-vibrant-orange text-white rounded-2xl flex items-center justify-center gap-4 text-xs font-black uppercase tracking-widest transition-all shadow-xl group-hover:shadow-vibrant-orange`}>
                                        <Download size={18} /> Baixar Agora
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    className="mt-32 p-16 bg-krenke-purple rounded-[4rem] text-center relative overflow-hidden shadow-premium"
                >
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-vibrant-orange via-vibrant-purple to-vibrant-green"></div>
                    <div className="relative z-10 flex flex-col items-center">
                        <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter mb-8 max-w-3xl leading-none">
                            NÃO ENCONTROU O QUE <span className="text-vibrant-orange">PROCURAVA?</span>
                        </h2>
                        <p className="text-xl text-gray-300 font-medium mb-12 max-w-2xl">
                            Nossa equipe técnica pode fornecer arquivos CAD, especificações customizadas e detalhes sob medida para seu projeto.
                        </p>
                        <button className="px-12 py-6 bg-vibrant-orange text-white font-black uppercase text-sm tracking-widest rounded-2xl hover:bg-orange-500 transition-all transform hover:scale-105 shadow-vibrant-orange">
                            Solicitar Suporte Técnico
                        </button>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default DownloadsPage;
