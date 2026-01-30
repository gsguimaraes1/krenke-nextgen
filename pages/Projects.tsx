import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlayCircle, X, ChevronRight, MapPin, Play } from 'lucide-react';

const ProjectsPage: React.FC = () => {
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);

  const projects = [
    {
      title: "Playground Avião",
      location: "Colégio Fag | Cascavel-PR",
      videoId: "XeBQf3CaNuI",
      img: "https://img.youtube.com/vi/XeBQf3CaNuI/maxresdefault.jpg",
      accent: "vibrant-orange"
    },
    {
      title: "Maior Tobogã do Sul",
      location: "Parque Terra Atlântica | Penha-SC",
      videoId: "O2M2Aa4gmL0",
      img: "https://img.youtube.com/vi/O2M2Aa4gmL0/maxresdefault.jpg",
      accent: "vibrant-purple"
    },
    {
      title: "Conheça nossa Fábrica",
      location: "Guaramirim - SC",
      videoId: "q_vGGYCRYec",
      img: "https://img.youtube.com/vi/q_vGGYCRYec/maxresdefault.jpg",
      accent: "vibrant-green"
    },
    {
      title: "Brinquedos Krenke",
      location: "Institucional",
      videoId: "l2Cj1TE2tMI",
      img: "https://img.youtube.com/vi/l2Cj1TE2tMI/maxresdefault.jpg",
      accent: "vibrant-cyan"
    },
  ];

  return (
    <div className="bg-slate-50 min-h-screen overflow-x-hidden">
      {/* Header Banner - Vibrant Hero */}
      <div className="relative h-[450px] md:h-[600px] overflow-hidden flex items-center bg-krenke-purple">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-krenke-purple via-vibrant-purple to-vibrant-orange opacity-50 mix-blend-overlay"></div>
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.3, 0.5, 0.3]
            }}
            transition={{ duration: 15, repeat: Infinity }}
            className="absolute top-0 right-0 w-[50%] h-full bg-vibrant-orange/10 blur-[120px] rounded-full"
          ></motion.div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col items-start"
          >
            <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 text-white text-xs font-black uppercase tracking-[0.3em] mb-8">
              <span className="w-2 h-2 rounded-full bg-vibrant-orange animate-pulse shadow-vibrant-orange"></span>
              Projetos ao Redor do País
            </div>

            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white leading-[0.8] tracking-tighter mb-10 uppercase drop-shadow-2xl">
              ONDE O <br />
              <span className="text-vibrant-orange">RISO ACONTECE</span>
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {projects.map((project, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="group relative cursor-pointer"
              onClick={() => setSelectedVideo(project.videoId)}
            >
              {/* Outer Glow */}
              <div className={`absolute -inset-2 bg-${project.accent} rounded-[2.5rem] opacity-0 group-hover:opacity-20 blur-xl transition-all duration-500`}></div>

              <div className="relative rounded-[2rem] overflow-hidden shadow-premium bg-white border border-slate-100 flex flex-col h-full transform transition-all duration-500 group-hover:-translate-y-4">
                {/* Thumbnail Area */}
                <div className="relative aspect-video overflow-hidden">
                  <img
                    src={project.img}
                    alt={project.title}
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-krenke-purple/40 group-hover:bg-krenke-purple/20 transition-all duration-500 flex items-center justify-center">
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      className="w-24 h-24 rounded-full bg-white/10 backdrop-blur-xl border border-white/30 flex items-center justify-center text-white shadow-2xl"
                    >
                      <Play size={40} className="ml-1 fill-white" />
                    </motion.div>
                  </div>

                  {/* Location Badge */}
                  <div className="absolute top-6 left-6 flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-white text-[10px] font-black uppercase tracking-widest">
                    <MapPin size={12} className="text-vibrant-orange" />
                    {project.location}
                  </div>
                </div>

                {/* Content Area */}
                <div className="p-10 flex flex-col justify-between flex-grow">
                  <div>
                    <h3 className="text-3xl font-black text-gray-900 uppercase tracking-tighter mb-4 transition-colors group-hover:text-vibrant-orange">
                      {project.title}
                    </h3>
                    <p className="text-gray-400 font-medium leading-relaxed italic border-l-4 border-slate-100 pl-6 mb-8 group-hover:border-vibrant-orange transition-all">
                      Testemunhe a qualidade impecável da Krenke em ação neste projeto exclusivo.
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-8 border-t border-slate-50">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-300">Galeria de Vídeo</span>
                    <div className="flex items-center gap-2 text-vibrant-orange font-black text-xs uppercase tracking-tighter">
                      Assistir Agora <ChevronRight size={16} />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Video Modal - Premium Implementation */}
      <AnimatePresence>
        {selectedVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-krenke-purple/95 backdrop-blur-2xl"
          >
            <motion.button
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={() => setSelectedVideo(null)}
              className="absolute top-10 right-10 w-16 h-16 bg-white/10 hover:bg-vibrant-orange text-white rounded-[2rem] flex items-center justify-center transition-all border border-white/20"
            >
              <X size={32} strokeWidth={3} />
            </motion.button>

            <motion.div
              initial={{ scale: 0.9, y: 50, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 50, opacity: 0 }}
              className="w-full max-w-6xl aspect-video bg-black rounded-[3rem] overflow-hidden shadow-premium border-2 border-white/10"
            >
              <iframe
                className="w-full h-full"
                src={`https://www.youtube.com/embed/${selectedVideo}?autoplay=1&rel=0&modestbranding=1`}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProjectsPage;