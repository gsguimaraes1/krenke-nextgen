import React, { useState } from 'react';
import { PlayCircle, X, ChevronRight } from 'lucide-react';

const ProjectsPage: React.FC = () => {
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);

  const projects = [
    {
      title: "Playground Avião",
      location: "Colégio Fag | Cascavel-PR",
      videoId: "XeBQf3CaNuI",
      img: "https://img.youtube.com/vi/XeBQf3CaNuI/maxresdefault.jpg"
    },
    {
      title: "Maior Tobogã do Sul",
      location: "Parque Terra Atlântica | Penha-SC",
      videoId: "O2M2Aa4gmL0",
      img: "https://img.youtube.com/vi/O2M2Aa4gmL0/maxresdefault.jpg"
    },
    {
      title: "Conheça nossa Fábrica",
      location: "Guaramirim - SC",
      videoId: "q_vGGYCRYec",
      img: "https://img.youtube.com/vi/q_vGGYCRYec/maxresdefault.jpg"
    },
    {
      title: "Brinquedos Krenke",
      location: "Institucional",
      videoId: "l2Cj1TE2tMI",
      img: "https://img.youtube.com/vi/l2Cj1TE2tMI/maxresdefault.jpg"
    },
  ];

  return (
    <div className="bg-slate-50 min-h-screen animate-fade-in">
      {/* Header Banner */}
      <div className="relative h-[350px] md:h-[450px] overflow-hidden flex items-center bg-[#1E1B4B]">
        {/* Background Image/Pattern */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 animate-pulse-slow"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-krenke-purple via-[#2a2175] to-blue-900 opacity-95"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="flex flex-col items-start">
            <div className="flex items-center gap-2 text-sm text-gray-300 mb-6 bg-white/5 px-3 py-1 rounded-full backdrop-blur-sm border border-white/10">
              <span>Home</span>
              <ChevronRight size={14} />
              <span className="text-krenke-orange font-bold">Projetos</span>
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-white/80 text-xs font-bold uppercase tracking-widest mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-krenke-orange"></span>
              Veja onde a diversão já chegou
            </div>

            <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter mb-4 drop-shadow-2xl">
              Projetos de Parques e Playgrounds
            </h1>
            <div className="h-2 w-32 bg-gradient-to-r from-krenke-orange to-yellow-400 rounded-full"></div>
          </div>
        </div>

        {/* Decorative Bottom Fade */}
        <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-slate-50 to-transparent z-10"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8">
          {projects.map((project, idx) => (
            <div
              key={idx}
              className={`group relative rounded-2xl overflow-hidden cursor-pointer shadow-lg bg-gray-100 gtm-project-card gtm-project-video-${project.videoId}`}
              onClick={() => setSelectedVideo(project.videoId)}
            >
              <img
                src={project.img}
                alt={`Projeto de Parque Infantil Krenke: ${project.title} em ${project.location}`}
                title={`Playground Krenke - ${project.title}`}
                className="w-full aspect-video object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/30 transition-colors">
                <PlayCircle size={64} className="text-white opacity-80 group-hover:scale-110 transition-transform" />
              </div>
              <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-black/90 to-transparent">
                <h3 className="text-white font-bold text-xl gtm-project-title">{project.title}</h3>
                <p className="text-gray-300 text-sm">{project.location}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Video Modal */}
      {selectedVideo && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
          <button
            onClick={() => setSelectedVideo(null)}
            className="absolute top-6 right-6 text-white hover:text-krenke-orange transition-colors gtm-project-modal-close"
          >
            <X size={32} />
          </button>
          <div className="w-full max-w-5xl aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl">
            <iframe
              className="w-full h-full"
              src={`https://www.youtube.com/embed/${selectedVideo}?autoplay=1`}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectsPage;