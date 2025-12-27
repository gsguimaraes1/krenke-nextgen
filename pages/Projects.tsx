import React from 'react';
import { PlayCircle } from 'lucide-react';

const ProjectsPage: React.FC = () => {
  const projects = [
    { title: "Playground Avião", location: "Colégio Fag | Cascavel-PR", img: "https://picsum.photos/seed/proj1/600/400" },
    { title: "Maior Tobogã do Sul", location: "Parque Terra Atlântica | Penha-SC", img: "https://picsum.photos/seed/proj2/600/400" },
    { title: "Área de Lazer Completa", location: "Condomínio Garden | SP", img: "https://picsum.photos/seed/proj3/600/400" },
    { title: "Linha Pet Agility", location: "Praça Central | Curitiba-PR", img: "https://picsum.photos/seed/proj4/600/400" },
    { title: "Playground Barco Pirata", location: "Hotel Fazenda | MG", img: "https://picsum.photos/seed/proj5/600/400" },
    { title: "Espaço Kids", location: "Shopping Center | RJ", img: "https://picsum.photos/seed/proj6/600/400" },
  ];

  return (
    <div className="bg-white min-h-screen animate-fade-in">
       <div className="bg-krenke-blue text-white py-16 text-center">
        <h1 className="text-4xl font-black mb-4">Projetos Realizados</h1>
        <p className="text-xl text-blue-200">Veja onde a diversão já chegou.</p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project, idx) => (
            <div key={idx} className="group relative rounded-2xl overflow-hidden cursor-pointer shadow-lg">
              <img 
                src={project.img} 
                alt={project.title} 
                className="w-full aspect-video object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/30 transition-colors">
                <PlayCircle size={64} className="text-white opacity-80 group-hover:scale-110 transition-transform" />
              </div>
              <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-black/90 to-transparent">
                <h3 className="text-white font-bold text-xl">{project.title}</h3>
                <p className="text-gray-300 text-sm">{project.location}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProjectsPage;