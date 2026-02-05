import React from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Award, ShieldCheck, Zap, Globe } from 'lucide-react';
import heroVideo from '../assets/Sobre/krenke-fabrica-playgrounds-video.mp4';
import image36Anos from '../assets/Sobre/krenke-36-anos-playgrounds-infantis.webp';
import imageFachada from '../assets/Sobre/krenke-fachada-fabrica-parques-infantis.jpg';
import imageNordeste from '../assets/Sobre/krenke-filial-nordeste-playgrounds.jpg';

const AboutPage: React.FC = () => {
  return (
    <div className="bg-white min-h-screen font-sans overflow-x-hidden">
      {/* Header Section - Vibrant Hero */}
      <div className="relative h-[450px] md:h-[600px] overflow-hidden flex items-center justify-center bg-krenke-purple">
        {/* Animated Background Layers */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-krenke-purple via-vibrant-purple to-vibrant-orange opacity-60 mix-blend-multiply"></div>
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 5, 0]
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"
          ></motion.div>
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-start"
          >
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 text-white text-xs font-black uppercase tracking-[0.3em] mb-8"
            >
              <span className="w-2 h-2 rounded-full bg-vibrant-orange animate-vibrant-pulse"></span>
              Excelência desde 1987
            </motion.div>

            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white leading-[0.8] tracking-tighter mb-6 uppercase drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
              NOSSA <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-vibrant-orange via-yellow-400 to-vibrant-orange bg-[length:200%_auto] animate-gradient-x">TRAJETÓRIA</span>
            </h1>

            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '200px' }}
              transition={{ delay: 0.6, duration: 1 }}
              className="h-3 bg-vibrant-orange rounded-full shadow-vibrant-orange"
            ></motion.div>
          </motion.div>
        </div>

        {/* Decorative Bottom Fade */}
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-white via-white/50 to-transparent z-10"></div>
      </div>

      {/* Sobre Nós Section - Energetic Precision */}
      <section className="py-32 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="grid lg:grid-cols-2 gap-24 items-center">
          {/* Left Column: Text & Stats */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-12"
          >
            <div>
              <span className="text-sm font-black text-krenke-purple uppercase tracking-widest bg-krenke-purple/5 px-4 py-1.5 rounded-full mb-6 inline-block">Essência Krenke</span>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 leading-[1.1] tracking-tighter mb-8 uppercase">
                PROJETANDO O <br />
                <span className="text-vibrant-orange">FUTURO DO LAZER</span>
              </h2>
              <p className="text-xl text-gray-500 leading-relaxed font-medium">
                Mais que playgrounds, criamos ecossistemas de desenvolvimento infantil onde a segurança absoluta encontra a diversão extrema.
              </p>
            </div>

            {/* Progress Bars - Vibrant Style */}
            <div className="space-y-8">
              {[
                { label: "Segurança Certificada ABNT", Icon: ShieldCheck, color: "vibrant-orange" },
                { label: "Qualidade de Exportação", Icon: Award, color: "krenke-purple" },
                { label: "Inovação Tecnológica", Icon: Zap, color: "vibrant-green" },
                { label: "Felicidade & Lazer", Icon: Globe, color: "pink-500" },
              ].map((stat, i) => (
                <div key={i} className="group">
                  <div className="flex justify-between mb-3 items-center">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl bg-${stat.color}/10 text-${stat.color}`}>
                        <stat.Icon size={20} />
                      </div>
                      <span className="text-gray-900 font-black uppercase text-xs tracking-widest">{stat.label}</span>
                    </div>
                    <span className="text-vibrant-orange font-black">100%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-3 p-0.5 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: '100%' }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.5, delay: i * 0.1 }}
                      className={`h-full bg-${stat.color} rounded-full shadow-lg`}
                    ></motion.div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right Column: Premium Video/Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="absolute -inset-4 bg-gradient-to-tr from-vibrant-orange/20 to-vibrant-purple/20 blur-2xl rounded-[3rem]"></div>
            <div className="relative h-full min-h-[650px] rounded-[3rem] overflow-hidden shadow-premium border-[12px] border-white transform lg:rotate-3 hover:rotate-0 transition-all duration-700 group">
              <div className="absolute top-10 right-10 z-20 bg-vibrant-orange text-white px-8 py-4 rounded-3xl shadow-2xl flex flex-col items-center">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80 mb-1">Dando vida ao lazer</span>
                <span className="text-5xl font-black">1987</span>
              </div>

              <video
                className="absolute inset-0 w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-1000"
                autoPlay
                muted
                loop
                playsInline
              >
                <source src={heroVideo} type="video/mp4" />
              </video>

              <div className="absolute inset-0 bg-gradient-to-t from-krenke-purple/80 via-transparent to-transparent opacity-60"></div>

              <div className="absolute bottom-10 left-10 text-white space-y-2">
                <p className="font-black text-3xl uppercase tracking-tighter">Nosso Complexo Industrial</p>
                <p className="text-lg font-bold text-vibrant-orange">Guaramirim, Santa Catarina</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* História Section - Multi-layered Depth */}
      <section className="py-32 bg-slate-50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-24 items-center">
            {/* Text Left */}
            <div className="order-2 lg:order-1 space-y-10">
              <h2 className="text-5xl md:text-7xl font-black text-gray-900 leading-none uppercase tracking-tighter">
                UMA <span className="text-krenke-purple">HISTÓRIA</span> <br />
                DE LIDERANÇA
              </h2>
              <div className="space-y-8 text-xl text-gray-500 font-medium leading-relaxed">
                <p>
                  <strong className="text-gray-900 font-black">A Krenke Brinquedos</strong> não apenas fabrica equipamentos; nós definimos o padrão nacional de excelência em diversão desde 1987.
                </p>
                <div className="pl-8 border-l-4 border-vibrant-orange py-2">
                  <p className="italic text-gray-700">
                    "Trabalhamos incansavelmente para que cada parquinho entregue seja um monumento à segurança e à infância feliz."
                  </p>
                </div>
                <p>
                  Investimos continuamente em tecnologia de ponta alemã para processamento de polímeros, garantindo que nossos Playgrounds resistam bravamente às intempéries do tempo, mantendo cores vibrantes e estruturas inabaláveis.
                </p>
              </div>
            </div>

            {/* Image Right */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="order-1 lg:order-2 relative"
            >
              <div className="absolute -top-10 -right-10 w-64 h-64 bg-krenke-purple/5 rounded-full blur-3xl animate-pulse"></div>
              <div className="relative rounded-[3rem] overflow-hidden shadow-premium border-2 border-white/50">
                <img
                  src={imageFachada}
                  alt="Fábrica de Parques Infantis Krenke"
                  className="w-full h-auto hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute top-6 left-6 p-4 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20">
                  <Award className="text-vibrant-orange" size={32} strokeWidth={2.5} />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Filial Nordeste Section - Asymmetric Energy */}
      <section className="py-32 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-24 items-center">
            {/* Image Left */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="absolute -inset-6 bg-vibrant-orange/5 blur-3xl rounded-[3rem]"></div>
              <div className="relative rounded-[3rem] overflow-hidden shadow-premium group">
                <img
                  src={imageNordeste}
                  alt="Sede Nordeste Krenke Playgrounds"
                  className="w-full h-auto group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-vibrant-orange/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-end p-12">
                  <span className="text-white font-black text-2xl uppercase tracking-widest">Atendimento Ágil em Todo o Brasil</span>
                </div>
              </div>
            </motion.div>

            {/* Text Right */}
            <div className="space-y-10">
              <h2 className="text-5xl md:text-7xl font-black text-gray-900 leading-none uppercase tracking-tighter">
                PRESENÇA <br />
                <span className="text-vibrant-orange">NACIONAL</span>
              </h2>
              <div className="space-y-8 text-xl text-gray-500 font-medium leading-relaxed">
                <p>
                  Para atender de forma mais veloz a demanda crescente do Nordeste Brasileiro, a Krenke estabeleceu um hub estratégico em <strong className="text-gray-900 font-black">Palmares, Pernambuco</strong>.
                </p>
                <div className="grid grid-cols-2 gap-8 pt-6">
                  <div className="p-8 rounded-[2rem] bg-slate-50 border border-gray-100 group hover:border-vibrant-orange transition-all">
                    <span className="block text-4xl font-black text-vibrant-orange mb-2">Nordeste</span>
                    <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Logística Local</span>
                  </div>
                  <div className="p-8 rounded-[2rem] bg-slate-50 border border-gray-100 group hover:border-krenke-purple transition-all">
                    <span className="block text-4xl font-black text-krenke-purple mb-2">Expertise</span>
                    <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Projetos Locais</span>
                  </div>
                </div>
                <p>
                  Esta expansão não é apenas sobre logística; é sobre estar perto de nossos clientes, entendendo as nuances climáticas e regionais para entregar a melhor solução em lazer do país.
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