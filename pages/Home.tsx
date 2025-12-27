import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, Award, PenTool, ArrowRight, HeartHandshake, Calculator, Truck, ShieldCheck, Zap, CreditCard } from 'lucide-react';
import { ShowcaseCard } from '../components/ui/ShowcaseCard';
import heroVideo from '../assets/videokrenke.mp4';
import { ImageCarousel } from '../components/ImageCarousel';
import playgroundsImg from '../assets/Playgrounds Completos-home.webp';
import brinquedosImg from '../assets/Brinquedos Avulsos-home.webp';
import linhaPetImg from '../assets/LinhaPet-Home.webp';
import jardimImg from '../assets/Jardim e mobili-home.webp';
import sobreImg from '../assets/SOBRE.webp';

const HeroSection = () => {
  return (
    <div className="relative w-full h-[calc(100vh-80px)] min-h-[650px] bg-krenke-purple overflow-hidden flex items-center justify-center">
      {/* Video Background Wrapper */}
      <div className="absolute inset-0 w-full h-full z-0 pointer-events-none overflow-hidden">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover opacity-60"
        >
          <source src={heroVideo} type="video/mp4" />
        </video>
      </div>

      {/* Overlays for readability and color tinting */}
      <div className="absolute inset-0 bg-gradient-to-br from-krenke-purple/90 via-krenke-purple/70 to-blue-900/80 mix-blend-multiply z-10"></div>
      <div className="absolute inset-0 bg-black/20 z-10"></div>

      {/* Texture Overlay (Optional for modern feel) */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-5 z-10"></div>

      {/* Gradient fade at bottom to merge with next section */}
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-gray-50 to-transparent z-10"></div>

      {/* Content */}
      <div className="relative z-20 w-full flex flex-col items-center justify-center text-center px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="space-y-8 animate-fade-in-up max-w-5xl">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs md:text-sm font-bold tracking-widest uppercase shadow-lg hover:bg-white/20 transition-colors cursor-default">
            <span className="w-2 h-2 rounded-full bg-krenke-orange animate-pulse"></span>
            Desde 1987 • A maior fábrica de playgrounds do Brasil
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white tracking-tight leading-[1.1] drop-shadow-xl">
            O MELHOR JEITO <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-krenke-orange via-yellow-400 to-krenke-orange bg-[length:200%_auto] animate-gradient">
              DE BRINCAR
            </span>
          </h1>

          {/* Description */}
          <p className="text-lg md:text-2xl text-gray-200 max-w-2xl mx-auto font-light leading-relaxed opacity-90">
            Transformamos espaços em universos de diversão com segurança certificada e tecnologia de ponta.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-5 justify-center pt-6">
            <Link
              to="/products"
              className="group relative px-8 py-4 bg-krenke-orange text-white font-bold text-lg rounded-full overflow-hidden shadow-xl shadow-orange-500/20 hover:shadow-orange-500/40 transition-all hover:scale-105"
            >
              <span className="relative z-10 flex items-center gap-2">
                Ver Produtos <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-orange-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Link>

            <Link
              to="/quote"
              className="px-8 py-4 bg-white/5 backdrop-blur-md border border-white/30 text-white font-bold text-lg rounded-full hover:bg-white hover:text-krenke-purple transition-all flex items-center justify-center shadow-lg"
            >
              Solicitar Orçamento
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

const Features = () => (
  <section className="py-20 bg-white relative z-10 -mt-16">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid md:grid-cols-3 gap-6">
        {[
          {
            icon: Award,
            title: "Desde 1987",
            desc: "A maior fábrica de playgrounds do Brasil.",
            bg: "bg-krenke-purple text-white border-krenke-purple"
          },
          {
            icon: CheckCircle,
            title: "Certificado de Segurança e Qualidade",
            desc: "Brinquedos avaliados e certificados pela ABNT.",
            bg: "bg-krenke-orange text-white border-krenke-orange"
          },
          {
            icon: PenTool,
            title: "Plástico Rotomoldado",
            desc: "Material resistente, durável e que não desbota.",
            bg: "bg-krenke-purple text-white border-krenke-purple"
          }
        ].map((feature, idx) => (
          <div
            key={idx}
            className={`${feature.bg} p-8 rounded-xl shadow-2xl border-2 border-dashed border-white/30 flex flex-col items-center text-center transform hover:-translate-y-2 transition-transform duration-300`}
          >
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-6 backdrop-blur-sm">
              <feature.icon size={32} strokeWidth={2} />
            </div>
            <h3 className="text-xl font-black mb-3 uppercase tracking-wide">{feature.title}</h3>
            <p className="text-white/90 leading-relaxed font-medium">{feature.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const CategoryPreview = () => {
  const categories = [
    {
      title: "Playgrounds Completos",
      image: playgroundsImg,
      link: "/products?category=Playgrounds%20Completos",
      description: "Estruturas completas que garantem diversão máxima com total segurança para todas as idades.",
      color: "#312783" // Krenke Purple
    },
    {
      title: "Brinquedos Avulsos",
      image: brinquedosImg,
      link: "/products?category=Brinquedos%20Avulsos",
      description: "Peças individuais perfeitas para complementar seu espaço de lazer com variedade.",
      color: "#FF8A00" // Orange
    },
    {
      title: "Linha Pet",
      image: linhaPetImg,
      link: "/products?category=Linha%20Pet",
      description: "Equipamentos especiais para o divertimento e treinamento do seu melhor amigo.",
      color: "#0B8E36" // Green
    },
    {
      title: "Jardim e Mobília",
      image: jardimImg,
      link: "/products?category=Mobiliário%20Urbano%20e%20Jardim",
      description: "Bancos e acessórios duráveis que trazem conforto e beleza para áreas externas.",
      color: "#0095DA", // Blue (Complementary)
      imageScale: 1.15
    },
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-gray-50 to-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black text-krenke-purple mb-4">Nossos Produtos</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Produtos fabricados com materiais de alto padrão oferecendo alta resistência e durabilidade.
            Todos os produtos Krenke são CERTIFICADOS de acordo com as normas da ABNT.
          </p>
          <div className="w-24 h-1 bg-krenke-orange mx-auto mt-6"></div>
        </div>

        {/* New Animated Showcase Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 justify-items-center">
          {categories.map((cat, idx) => (
            <ShowcaseCard
              key={idx}
              {...cat}
            />
          ))}
        </div>

        <div className="mt-20 text-center">
          <a
            href="/#/quote"
            className="inline-flex items-center gap-3 px-12 py-5 bg-gradient-to-r from-krenke-orange to-orange-500 text-white font-black text-xl rounded-2xl shadow-xl shadow-orange-500/20 hover:shadow-2xl hover:shadow-orange-500/40 hover:-translate-y-1 transition-all duration-300"
          >
            SOLICITAR ORÇAMENTO COMPLETO
            <ArrowRight strokeWidth={3} />
          </a>
        </div>
      </div>
    </section>
  );
};

const StatsSection = () => (
  <section className="py-20 bg-white">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid md:grid-cols-2 gap-12 items-center">
        <div className="space-y-8">
          <div>
            <h2 className="text-sm font-bold text-krenke-purple uppercase tracking-widest mb-2">Sobre Nós</h2>
            <h3 className="text-3xl md:text-4xl font-black text-gray-900 leading-tight">
              Qualidade de vida, segurança e confiabilidade são sinônimos dos produtos da Krenke Brinquedos.
            </h3>
          </div>

          <p className="text-gray-600 leading-relaxed">
            O Objetivo da Krenke Brinquedos é simples. Oferecer o que há de melhor em termos de Playgrounds Infantis visando a segurança de seu produto bem como sua durabilidade, fazendo com que assim os Playgrounds da Krenke Brinquedos sejam produtos com excelente custo benefício.
          </p>

          <div className="space-y-4">
            {[
              { label: "Segurança", val: "100%", bg: "bg-krenke-orange" },
              { label: "Qualidade", val: "100%", bg: "bg-krenke-purple" },
              { label: "Lazer", val: "100%", bg: "bg-green-600" },
              { label: "Felicidade para as crianças", val: "100%", bg: "bg-pink-500" },
            ].map((stat, i) => (
              <div key={i} className="group">
                <div className="flex justify-between mb-1 text-sm font-bold text-white">
                  <span className={`px-3 py-1 rounded-t-lg ${stat.bg}`}>{stat.label}</span>
                  <span className="text-gray-500">{stat.val}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-r-full h-3">
                  <div className={`${stat.bg} h-3 rounded-r-full transition-all duration-1000 w-[100%]`}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-krenke-orange/10 rounded-full filter blur-xl"></div>
          <div className="relative rounded-3xl overflow-hidden shadow-2xl border-8 border-white transform rotate-2 hover:rotate-0 transition-transform duration-500">
            <div className="absolute top-6 right-6 bg-white/90 backdrop-blur px-4 py-2 rounded-lg shadow-sm z-10">
              <span className="text-xs text-gray-500 block font-bold">Desde</span>
              <span className="text-2xl font-black text-krenke-green">1987</span>
            </div>
            <img src={sobreImg} alt="Criança no escorregador" className="w-full object-cover" />
          </div>
        </div>
      </div>
    </div>
  </section>
);

const Differentials = () => (
  <section className="py-20 bg-slate-50">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-black text-gray-900">Diferenciais Que Nos Tornam A <br /><span className="text-krenke-purple">Melhor Escolha Do Mercado</span></h2>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {[
          {
            title: "Atendimento humanizado",
            text: "Estamos aqui para ouvir, planejar e transformar sua ideia em realidade.",
            icon: HeartHandshake,
            color: "#FF8A00" // Orange
          },
          {
            title: "Orçamento personalizado",
            text: "Nossas soluções são pensadas para se ajustar ao seu espaço e estilo.",
            icon: Calculator,
            color: "#312783" // Purple
          },
          {
            title: "Prazo de entrega",
            text: "Com processos otimizados, entregamos seu playground em tempo recorde.",
            icon: Truck,
            color: "#0B8E36" // Green (Krenke Green-ish)
          },
          {
            title: "Qualidade garantida",
            text: "Trabalhamos com os melhores fornecedores do Brasil e materiais certificados.",
            icon: ShieldCheck,
            color: "#0095DA" // Blue
          },
          {
            title: "Agilidade no projeto",
            text: "Desenvolvemos uma prévia em 3D do seu parque.",
            icon: Zap,
            color: "#E11D48" // Red/Pink
          },
          {
            title: "Condições flexíveis",
            text: "Oferecemos opções de pagamento ajustáveis e suporte personalizado.",
            icon: CreditCard,
            color: "#7C3AED" // Violet
          }
        ].map((item, i) => (
          <div
            key={i}
            className="group bg-white p-8 rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 border-t-4 border-transparent hover:-translate-y-1"
            style={{ borderTopColor: 'transparent' }} // Default state overrides
          >
            {/* We use a workaround for the hover border color by using a style tag or just using the group-hover logic with arbitrary values if supported, 
                but simpler is to use inline style for a pseudo element or just manipulate the border color on hover via React state? 
                Actually, simpler is to just render the border color directly if we want it constant, OR use a wrapper.
                
                The user wants "mude a cor da barrinha um card de cada cor". 
                Let's use a ref or just simple style that changes on CSS hover. 
                Since we can't easily inject dynamic hover CSS styles in React without CSS-in-JS libraries like styled-components, 
                we'll use a `hover` class that forces the border color via a `style` attribute that leverages a CSS variable or just set it statically if acceptable.
                
                Wait, standard inline styles don't support pseudo-classes. 
                Alternative: Render the colored line as a separate div inside relative container.
            */}
            <div className="absolute top-0 left-0 right-0 h-1 rounded-t-xl transition-colors duration-300"
              style={{ backgroundColor: item.color, opacity: 0.8 }} />

            {/* Wait, the "border-t-4" on the main div is easier if we accept it's always colored or we use a helper. 
                Let's try the colored line approach as it's cleaner than fighting inline hover states. 
                Re-doing the structure: relative container, absolute top line that is the "barrinha".
            */}

            <div className="w-12 h-12 mb-4 text-krenke-orange group-hover:scale-110 transition-transform duration-300">
              <item.icon size={48} strokeWidth={1.5} style={{ color: item.color }} />
            </div>
            <h3 className="font-bold text-lg text-gray-900 mb-2">{item.title}</h3>
            <p className="text-gray-500 text-sm leading-relaxed">{item.text}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const HomePage: React.FC = () => {
  return (
    <div className="animate-fade-in">
      <HeroSection />
      <Features />
      <CategoryPreview />
      <StatsSection />
      <Differentials />
      <ImageCarousel />
    </div>
  );
};

export default HomePage;