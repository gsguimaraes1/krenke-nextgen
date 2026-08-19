import React, { useRef } from 'react';
import { Award, ShieldCheck, Zap, Globe } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { TranslatableText } from '../components/TranslatableText';
import { gsap, useGSAP, MQ } from '../lib/gsap';
import { SplitHeadline } from '../components/ui/SplitHeadline';
import { Reveal } from '../components/ui/Reveal';
import { Parallax } from '../components/ui/Parallax';
import { Counter } from '../components/ui/Counter';
import heroVideo from '../assets/Sobre/krenke-fabrica-playgrounds-video.mp4';
import imageFachada from '../assets/Sobre/krenke-fachada-fabrica-parques-infantis.webp';
import imageNordeste from '../assets/Sobre/krenke-filial-nordeste-playgrounds.webp';

// Classes fixas: Tailwind não detecta `bg-${var}` montado em runtime, então as
// barras coloridas precisam vir de strings completas.
const STATS = [
  { label: 'Segurança Certificada ABNT', Icon: ShieldCheck, bar: 'bg-vibrant-orange', chip: 'bg-vibrant-orange/10 text-vibrant-orange' },
  { label: 'Qualidade de Exportação', Icon: Award, bar: 'bg-krenke-purple', chip: 'bg-krenke-purple/10 text-krenke-purple' },
  { label: 'Inovação Tecnológica', Icon: Zap, bar: 'bg-vibrant-green', chip: 'bg-vibrant-green/10 text-vibrant-green' },
  { label: 'Felicidade & Lazer', Icon: Globe, bar: 'bg-pink-500', chip: 'bg-pink-500/10 text-pink-500' },
];

const AboutPage: React.FC = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add(MQ.motion, () => {
        const tl = gsap
          .timeline({ defaults: { ease: 'expo.out' } })
          .from('[data-hero-tag]', { x: -30, opacity: 0, duration: 0.9 }, 0.1)
          .from('[data-hero-title]', { yPercent: 115, opacity: 0, duration: 1.2 }, 0.25)
          .from('[data-hero-rule]', { scaleX: 0, transformOrigin: 'left center', duration: 1 }, 0.7);

        // Textura de fundo girando devagar — profundidade sem chamar atenção.
        const texture = gsap.to('[data-hero-texture]', {
          rotation: 4,
          scale: 1.15,
          duration: 24,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
        });

        return () => {
          tl.kill();
          texture.kill();
        };
      });

      return () => mm.revert();
    },
    { scope: heroRef }
  );

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add(MQ.reduce, () => {
        gsap.set('[data-stat-bar]', { scaleX: 1 });
      });

      mm.add(MQ.motion, () => {
        const bars = gsap.fromTo(
          '[data-stat-bar]',
          { scaleX: 0 },
          {
            scaleX: 1,
            ease: 'none',
            stagger: 0.08,
            scrollTrigger: {
              trigger: '[data-stat-list]',
              start: 'top 85%',
              end: 'bottom 65%',
              scrub: 0.6,
            },
          }
        );

        return () => bars.kill();
      });

      return () => mm.revert();
    },
    { scope: statsRef }
  );

  return (
    <div className="bg-white min-h-screen font-sans overflow-x-hidden">
      <Helmet>
        <title>Nossa Trajetória | Krenke Brinquedos - Fábrica de Playgrounds</title>
        <meta name="description" content="Conheça a história da Krenke Brinquedos, líder na fabricação de playgrounds desde 1987. Excelência, segurança e presença nacional." />
        <link rel="canonical" href="https://site.krenke.com.br/empresa" />
      </Helmet>

      {/* Header Section - Vibrant Hero */}
      <div ref={heroRef} className="relative h-[450px] md:h-[600px] overflow-hidden flex items-center justify-center bg-krenke-purple">
        {/* Animated Background Layers */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-krenke-purple via-vibrant-purple to-vibrant-orange opacity-60 mix-blend-multiply"></div>
          <div
            data-hero-texture
            className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.webp')] opacity-20"
          ></div>
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="flex flex-col items-start">
            <div
              data-hero-tag
              className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 text-white text-xs font-black uppercase tracking-[0.3em] mb-8"
            >
              <span className="w-2 h-2 rounded-full bg-vibrant-orange animate-vibrant-pulse"></span>
              <TranslatableText>Excelência desde 1987</TranslatableText>
            </div>

            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white leading-[0.8] tracking-tighter mb-6 uppercase drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
              <SplitHeadline as="span" text="NOSSA" type="chars" trigger="load" delay={0.2} className="block" />
              {/* Máscara em vez de split: o gradiente é `bg-clip-text` do bloco inteiro. */}
              <span className="block overflow-hidden pb-[0.08em]">
                <span
                  data-hero-title
                  className="block text-transparent bg-clip-text bg-gradient-to-r from-vibrant-orange via-yellow-400 to-vibrant-orange bg-[length:200%_auto] animate-gradient-x"
                >
                  <TranslatableText>TRAJETÓRIA</TranslatableText>
                </span>
              </span>
            </h1>

            <div data-hero-rule className="h-3 w-[200px] bg-vibrant-orange rounded-full shadow-vibrant-orange"></div>
          </div>
        </div>

        {/* Decorative Bottom Fade */}
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-white via-white/50 to-transparent z-10"></div>
      </div>

      {/* Sobre Nós Section - Energetic Precision */}
      <section ref={statsRef} className="py-32 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="grid lg:grid-cols-2 gap-24 items-center">
          {/* Left Column: Text & Stats */}
          <Reveal direction="left" distance={60} className="space-y-12">
            <div>
              <span className="text-sm font-black text-krenke-purple uppercase tracking-widest bg-krenke-purple/5 px-4 py-1.5 rounded-full mb-6 inline-block"><TranslatableText>Essência Krenke</TranslatableText></span>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 leading-[1.1] tracking-tighter mb-8 uppercase">
                <SplitHeadline as="span" text="PROJETANDO O" className="block" />
                <SplitHeadline as="span" text="FUTURO DO LAZER" className="block text-vibrant-orange" delay={0.15} />
              </h2>
              <p className="text-xl text-gray-500 leading-relaxed font-medium">
                <TranslatableText>Mais que playgrounds, criamos ecossistemas de desenvolvimento infantil onde a segurança absoluta encontra a diversão extrema.</TranslatableText>
              </p>
            </div>

            {/* Progress Bars - Vibrant Style */}
            <div data-stat-list className="space-y-8">
              {STATS.map((stat, i) => (
                <div key={i} className="group">
                  <div className="flex justify-between mb-3 items-center">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl ${stat.chip}`}>
                        <stat.Icon size={20} />
                      </div>
                      <span className="text-gray-900 font-black uppercase text-xs tracking-widest"><TranslatableText>{stat.label}</TranslatableText></span>
                    </div>
                    <Counter value={100} suffix="%" className="text-vibrant-orange font-black" />
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-3 p-0.5 overflow-hidden">
                    <div
                      data-stat-bar
                      className={`h-full w-full ${stat.bar} rounded-full shadow-lg origin-left`}
                      style={{ transform: 'scaleX(0)' }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>

          {/* Right Column: Premium Video/Image */}
          <Reveal direction="scale" className="relative">
            <div className="absolute -inset-4 bg-gradient-to-tr from-vibrant-orange/20 to-vibrant-purple/20 blur-2xl rounded-[3rem]"></div>
            <div className="relative h-full min-h-[650px] rounded-[3rem] overflow-hidden shadow-premium border-[12px] border-white transform lg:rotate-3 hover:rotate-0 transition-all duration-700 group">
              <div className="absolute top-10 right-10 z-20 bg-vibrant-orange text-white px-8 py-4 rounded-3xl shadow-2xl flex flex-col items-center">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80 mb-1"><TranslatableText>Dando vida ao lazer</TranslatableText></span>
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
                <p className="font-black text-3xl uppercase tracking-tighter"><TranslatableText>Nosso Complexo Industrial</TranslatableText></p>
                <p className="text-lg font-bold text-vibrant-orange"><TranslatableText>Guaramirim, Santa Catarina</TranslatableText></p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* História Section - Multi-layered Depth */}
      <section className="py-32 bg-slate-50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-24 items-center">
            {/* Text Left */}
            <Reveal direction="left" distance={60} className="order-2 lg:order-1 space-y-10">
              <h2 className="text-5xl md:text-7xl font-black text-gray-900 leading-none uppercase tracking-tighter">
                <SplitHeadline as="span" text="UMA" className="inline-block" />{' '}
                <SplitHeadline as="span" text="HISTÓRIA" className="inline-block text-krenke-purple" delay={0.1} />
                <br />
                <SplitHeadline as="span" text="DE LIDERANÇA" className="inline-block" delay={0.2} />
              </h2>
              <div className="space-y-8 text-xl text-gray-500 font-medium leading-relaxed">
                <p>
                  <strong className="text-gray-900 font-black"><TranslatableText>A Krenke Brinquedos Pedagógicos LTDA</TranslatableText></strong> <TranslatableText>não apenas fabrica equipamentos; nós definimos o padrão nacional de excelência em diversão desde 1987.</TranslatableText>
                </p>
                <div className="pl-8 border-l-4 border-vibrant-orange py-2">
                  <p className="italic text-gray-700">
                    <TranslatableText>"Trabalhamos incansavelmente para que cada parquinho entregue seja um monumento à segurança e à infância feliz."</TranslatableText>
                  </p>
                </div>
                <p>
                  <TranslatableText>Investimos continuamente em tecnologia de ponta alemã para processamento de polímeros, garantindo que nossos Playgrounds resistam bravamente às intempéries do tempo, mantendo cores vibrantes e estruturas inabaláveis.</TranslatableText>
                </p>
              </div>
            </Reveal>

            {/* Image Right */}
            <Reveal direction="right" distance={60} className="order-1 lg:order-2 relative">
              <div className="absolute -top-10 -right-10 w-64 h-64 bg-krenke-purple/5 rounded-full blur-3xl animate-pulse"></div>
              <div className="relative rounded-[3rem] overflow-hidden shadow-premium border-2 border-white/50">
                <Parallax speed={1.2} className="block">
                  <img
                    src={imageFachada}
                    alt="Fábrica de Parques Infantis Krenke"
                    loading="lazy"
                    decoding="async"
                    className="w-full h-auto scale-[1.18] hover:scale-[1.24] transition-transform duration-700"
                  />
                </Parallax>
                <div className="absolute top-6 left-6 p-4 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20">
                  <Award className="text-vibrant-orange" size={32} strokeWidth={2.5} />
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Filial Nordeste Section - Asymmetric Energy */}
      <section className="py-32 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-24 items-center">
            {/* Image Left */}
            <Reveal direction="left" distance={60} className="relative">
              <div className="absolute -inset-6 bg-vibrant-orange/5 blur-3xl rounded-[3rem]"></div>
              <div className="relative rounded-[3rem] overflow-hidden shadow-premium group">
                <Parallax speed={1.2} className="block">
                  <img
                    src={imageNordeste}
                    alt="Sede Nordeste Krenke Playgrounds"
                    loading="lazy"
                    decoding="async"
                    className="w-full h-auto scale-[1.18] group-hover:scale-[1.28] transition-transform duration-700"
                  />
                </Parallax>
                <div className="absolute inset-0 bg-gradient-to-t from-vibrant-orange/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-end p-12">
                  <span className="text-white font-black text-2xl uppercase tracking-widest"><TranslatableText>Atendimento Ágil em Todo o Brasil</TranslatableText></span>
                </div>
              </div>
            </Reveal>

            {/* Text Right */}
            <Reveal direction="right" distance={60} className="space-y-10">
              <h2 className="text-5xl md:text-7xl font-black text-gray-900 leading-none uppercase tracking-tighter">
                <SplitHeadline as="span" text="PRESENÇA" className="block" />
                <SplitHeadline as="span" text="NACIONAL" className="block text-vibrant-orange" delay={0.15} />
              </h2>
              <div className="space-y-8 text-xl text-gray-500 font-medium leading-relaxed">
                <p>
                  <TranslatableText>Para atender de forma mais veloz a demanda crescente do Nordeste Brasileiro, a Krenke estabeleceu um hub estratégico em</TranslatableText> <strong className="text-gray-900 font-black"><TranslatableText>Palmares, Pernambuco</TranslatableText></strong>.
                </p>
                <div className="grid grid-cols-2 gap-8 pt-6">
                  <div className="p-8 rounded-[2rem] bg-slate-50 border border-gray-100 group hover:border-vibrant-orange hover:-translate-y-2 transition-all duration-300">
                    <span className="block text-4xl font-black text-vibrant-orange mb-2"><TranslatableText>Nordeste</TranslatableText></span>
                    <span className="text-xs font-bold uppercase tracking-widest text-gray-500"><TranslatableText>Logística Local</TranslatableText></span>
                  </div>
                  <div className="p-8 rounded-[2rem] bg-slate-50 border border-gray-100 group hover:border-krenke-purple hover:-translate-y-2 transition-all duration-300">
                    <span className="block text-4xl font-black text-krenke-purple mb-2"><TranslatableText>Expertise</TranslatableText></span>
                    <span className="text-xs font-bold uppercase tracking-widest text-gray-500"><TranslatableText>Projetos Locais</TranslatableText></span>
                  </div>
                </div>
                <p>
                  <TranslatableText>Esta expansão não é apenas sobre logística; é sobre estar perto de nossos clientes, entendendo as nuances climáticas e regionais para entregar a melhor solução em lazer do país.</TranslatableText>
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
