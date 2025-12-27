import React from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';
import heroVideo from '../assets/FabricaKrenke.mp4';
import image36Anos from '../assets/36anos-krenke.jpg.webp';
import imageFachada from '../assets/Fachada.webp';
import imageNordeste from '../assets/KrenkeNordeste.webp';

const AboutPage: React.FC = () => {
  return (
    <div className="animate-fade-in bg-white min-h-screen font-sans">
      {/* Header Section */}
      <div className="relative h-[350px] md:h-[450px] overflow-hidden flex items-center justify-center bg-[#1E1B4B]">
        {/* Background Image/Pattern */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 animate-pulse-slow"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-krenke-purple via-[#2a2175] to-blue-900 opacity-90"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="flex flex-col items-start justify-center h-full">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-white/80 text-xs font-bold uppercase tracking-widest mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-krenke-orange"></span>
              Conheça nossa trajetória
            </div>
            <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter mb-2 drop-shadow-2xl">
              História
            </h1>
            <div className="h-2 w-32 bg-gradient-to-r from-krenke-orange to-yellow-400 rounded-full"></div>
          </div>
        </div>

        {/* Decorative Bottom Fade */}
        <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-white to-transparent z-10"></div>
      </div>

      {/* Sobre Nós Section */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* Left Column: Text & Stats */}
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-krenke-purple mb-2">Sobre Nós</h2>
              <h3 className="text-3xl md:text-4xl font-black text-gray-900 leading-tight mb-6">
                Qualidade de vida, segurança e confiabilidade são sinônimos dos produtos da Krenke Brinquedos.
              </h3>
              <p className="text-gray-600 leading-relaxed text-sm md:text-base">
                O Objetivo da Krenke Brinquedos é simples. Oferecer o que há de melhor em termos de Playgrounds Infantis visando a segurança de seu produto bem como sua durabilidade, fazendo com que assim os Playgrounds da Krenke Brinquedos sejam produtos com excelente custo benefício.
              </p>
            </div>

            {/* Progress Bars */}
            <div className="space-y-4">
              {[
                { label: "Segurança", val: "100%", bg: "bg-krenke-orange" },
                { label: "Qualidade", val: "100%", bg: "bg-krenke-purple" },
                { label: "Lazer", val: "100%", bg: "bg-green-600" },
                { label: "Felicidade para as crianças", val: "100%", bg: "bg-purple-600" },
              ].map((stat, i) => (
                <div key={i} className="group">
                  <div className="flex justify-between mb-1 text-xs font-bold text-white">
                    <span className={`px-4 py-1 rounded-full ${stat.bg}`}>{stat.label}</span>
                    <span className="text-gray-500 hidden">{stat.val}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className={`${stat.bg} h-2 rounded-full w-full`}></div>
                  </div>
                </div>
              ))}
            </div>

            {/* Small Playground Image */}
            <div className="mt-8 rounded-2xl overflow-hidden shadow-lg border-4 border-white">
              <img src={image36Anos} alt="36 Anos Krenke" className="w-full h-auto object-cover" />
            </div>
          </div>

          {/* Right Column: Vertical Video/Image Facade */}
          <div className="relative h-full min-h-[600px] rounded-3xl overflow-hidden shadow-2xl group">
            <div className="absolute top-8 left-8 z-20 bg-white rounded-xl p-4 shadow-lg border-2 border-krenke-orange/20 transform -rotate-3 group-hover:rotate-0 transition-transform duration-300">
              <span className="block text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Desde</span>
              <span className="block text-4xl font-black text-krenke-green leading-none">1987</span>
            </div>

            <video
              className="absolute inset-0 w-full h-full object-cover"
              autoPlay
              muted
              loop
              playsInline
            >
              <source src={heroVideo} type="video/mp4" />
            </video>

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>

            <div className="absolute bottom-8 left-8 right-8 text-white">
              <p className="font-bold text-lg mb-1">Fábrica Krenke</p>
              <p className="text-sm opacity-80">Guaramirim - SC</p>
            </div>
          </div>
        </div>
      </section>

      {/* História Section */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Text Left */}
            <div className="order-2 lg:order-1">
              <h2 className="text-4xl font-black text-gray-900 mb-8">História</h2>
              <div className="space-y-6 text-gray-600 leading-relaxed">
                <p>
                  <strong className="text-krenke-purple">A Krenke Brinquedos</strong> é uma empresa sediada em Guaramirim – SC, especializada em fabricação, comercialização e montagem de playgrounds infantis.
                </p>
                <p>
                  Atuando desde 1987 no mercado brasileiro, a Krenke está comprometida com a satisfação de seus clientes, investindo continuamente em novos equipamentos projetados em conformidade com as normas da ABNT.
                </p>
                <p>
                  Qualidade de vida, segurança e confiabilidade são sinônimos dos produtos da Krenke Brinquedos. Os parquinhos e produtos da Krenke estão inseridos no dia-a-dia das pessoas, podendo ser encontrados em residências, escolas, praças públicas, condomínios residenciais e em diversos outros locais.
                </p>
              </div>
            </div>

            {/* Image Right */}
            <div className="order-1 lg:order-2 relative">
              <div className="absolute -inset-4 bg-krenke-blue/10 rounded-3xl transform rotate-2"></div>
              <img
                src={imageFachada}
                alt="Fachada da Fábrica Krenke"
                className="relative rounded-2xl shadow-xl w-full object-cover h-80 lg:h-96"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Filial Nordeste Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Image Left */}
            <div className="relative">
              <div className="absolute -inset-4 bg-krenke-orange/10 rounded-3xl transform -rotate-2"></div>
              <img
                src={imageNordeste}
                alt="Filial Nordeste Krenke"
                className="relative rounded-2xl shadow-xl w-full object-cover h-80 lg:h-96"
              />
            </div>

            {/* Text Right */}
            <div>
              <h2 className="text-4xl font-black text-gray-900 mb-8">Filial Nordeste</h2>
              <div className="space-y-6 text-gray-600 leading-relaxed">
                <p>
                  Atendendo a pedidos, a Krenke Brinquedos inaugurou uma filial para atender de forma mais ágil a região nordeste do nosso território nacional.
                </p>
                <p>
                  Localizada na cidade de Palmares em Pernambuco, a nova filial conta com atendimento personalizado para desenvolvimento de projetos de playgrounds para hotéis, condomínios, clubes, escolas e creches que necessitam de um parquinho infantil.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>


    </div>
  );
};

export default AboutPage;