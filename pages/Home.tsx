import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, Award, PenTool, ArrowRight, HeartHandshake, Calculator, Truck, ShieldCheck, Zap, CreditCard, X, Calendar, User, Instagram } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Post } from '../types';
import { Helmet } from 'react-helmet-async';
import { ShowcaseCard } from '../components/ui/ShowcaseCard';
import { gsap, useGSAP, MQ } from '../lib/gsap';
import { SplitHeadline } from '../components/ui/SplitHeadline';
import { Reveal } from '../components/ui/Reveal';
import { Parallax } from '../components/ui/Parallax';
import { Counter } from '../components/ui/Counter';
import { Magnetic } from '../components/ui/Magnetic';
// heroVideo removido — vídeo agora hospedado no YouTube para evitar bandwidth do Vercel
const HERO_YOUTUBE_ID = 'C_KbvW2MjB8';
import { ImageCarousel } from '../components/ImageCarousel';
import sobreImg from '../assets/Home/Menino-Home-krenke.webp';
import logoBranco from '../assets/Logos/krenke-brinquedos-logo-branco.webp';
import imgPlaygroundsPadroes from '../assets/playgrounds_padroes/kmp_0502/kmp 0502 - render perspectiva.webp';
import imgBrinquedosAvulsos from '../assets/brinquedos-avulsos/cavalo-de-molas/cavalinho de mola - laranja - render.webp';
import imgAquaticos from '../assets/aquatico/KAQ 0302/KAQ 0302 - render perspectiva 2.webp';
import imgLittlePlay from '../assets/Little Play/KLP0201/krenke-playground-Little-Play-0201-render-perspectiva-2.webp';
import imgMobiliarios from '../assets/Mobiliario/banco4.webp';
import imgTematicos from '../assets/tematicos/TRATOR/trator - render 1.webp';
import { TranslatableText } from '../components/TranslatableText';

const HeroSection = () => {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add(MQ.motion, () => {
        // Entrada coreografada. Os tempos casam com o delay do SplitHeadline da
        // primeira linha do H1 (0.3s), pra tudo parecer uma sequência só.
        const tl = gsap.timeline({ defaults: { ease: 'expo.out', duration: 1 } });

        tl.from('[data-hero-badge]', { yPercent: -80, opacity: 0 }, 0.1)
          .from('[data-hero-gradient]', { yPercent: 115, opacity: 0, duration: 1.3 }, 0.45)
          .from('[data-hero-desc]', { y: 32, opacity: 0 }, 1)
          .from('[data-hero-cta]', { y: 40, opacity: 0, stagger: 0.12 }, 1.15)
          .from('[data-hero-scroll]', { opacity: 0, duration: 0.8 }, 1.5);

        // Pulso contínuo do indicador de scroll.
        const dot = gsap.to('[data-hero-dot]', {
          y: 10,
          repeat: -1,
          yoyo: true,
          duration: 1.1,
          ease: 'sine.inOut',
        });

        // Profundidade na saída: o vídeo desce mais devagar que o conteúdo, que
        // sobe e desaparece antes da próxima seção entrar.
        const media = gsap.to('[data-hero-media]', {
          yPercent: 18,
          ease: 'none',
          scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: true },
        });

        const content = gsap.to('[data-hero-content]', {
          yPercent: -20,
          opacity: 0,
          ease: 'none',
          scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: true },
        });

        return () => {
          tl.kill();
          dot.kill();
          media.kill();
          content.kill();
        };
      });

      return () => mm.revert();
    },
    { scope: root }
  );

  return (
    <div
      ref={root}
      className="relative w-full h-[85vh] bg-krenke-purple overflow-hidden flex items-center justify-center"
    >
      {/* YouTube Video Background */}
      <div
        data-hero-media
        className="absolute inset-0 w-full h-full z-0 pointer-events-none overflow-hidden"
      >
        <iframe
          className="absolute w-[300%] h-[300%] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-70"
          src={`https://www.youtube.com/embed/${HERO_YOUTUBE_ID}?autoplay=1&mute=1&loop=1&playlist=${HERO_YOUTUBE_ID}&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1`}
          title="Krenke Brinquedos"
          allow="autoplay; encrypted-media"
          allowFullScreen
        />
      </div>

      {/* Overlays */}
      <div className="absolute inset-0 bg-gradient-to-br from-krenke-purple/80 via-krenke-purple/60 to-blue-900/60 mix-blend-multiply z-10"></div>
      <div className="absolute inset-0 bg-black/10 z-10"></div>

      {/* Gradient fade at bottom */}
      <div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-white to-transparent z-10"></div>

      {/* Content */}
      <div className="relative z-20 w-full flex flex-col items-center justify-center text-center px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div data-hero-content className="space-y-10 max-w-5xl">
          {/* Badge */}
          <div
            data-hero-badge
            className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 text-white text-xs md:text-sm font-bold tracking-[0.2em] uppercase shadow-2xl hover:bg-white/20 transition-all cursor-default"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-vibrant-orange animate-vibrant-pulse shadow-[0_0_10px_#FF9F0A]"></span>
            <TranslatableText>Desde 1987 • A maior fábrica de playgrounds do Brasil</TranslatableText>
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-white tracking-tighter leading-[0.9] md:leading-[0.85] drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)] uppercase">
            <SplitHeadline
              as="span"
              text="PLAYGROUNDS E"
              type="chars"
              trigger="load"
              delay={0.3}
              className="block"
            />
            {/* A segunda linha não é splitada: o `bg-clip-text` vive no elemento
                inteiro e quebraria em pedaços se o SplitText o dividisse. */}
            <span className="block overflow-hidden pb-[0.08em]">
              <span
                data-hero-gradient
                className="block text-transparent bg-clip-text bg-gradient-to-r from-vibrant-orange via-yellow-400 to-vibrant-orange bg-[length:200%_auto] animate-gradient-x"
              >
                <TranslatableText>PARQUES INFANTIS</TranslatableText>
              </span>
            </span>
          </h1>

          {/* Description */}
          <p
            data-hero-desc
            className="text-lg md:text-2xl lg:text-3xl text-white/90 max-w-3xl mx-auto font-medium leading-tight opacity-90 drop-shadow-md px-4"
          >
            <TranslatableText>Transformamos espaços em mundos de pura diversão com segurança absoluta.</TranslatableText>
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center pt-8">
            <div data-hero-cta>
              <Magnetic strength={0.3}>
                <Link
                  to="/produtos"
                  id="btn-home-hero-products"
                  className="group relative px-10 py-5 bg-vibrant-orange text-white font-black text-xl rounded-2xl overflow-hidden shadow-[0_20px_40px_-10px_rgba(243,146,0,0.5)] hover:shadow-[0_30px_60px_-10px_rgba(243,146,0,0.6)] transition-all gtm-home-hero-button-products flex items-center justify-center gap-3"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    <TranslatableText>Explorar Produtos</TranslatableText> <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-vibrant-orange opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </Link>
              </Magnetic>
            </div>

            <div data-hero-cta>
              <Magnetic strength={0.3}>
                <Link
                  to="/orcamento"
                  id="btn-home-hero-quote"
                  className="px-10 py-5 bg-white/10 backdrop-blur-xl border-2 border-white/30 text-white font-black text-xl rounded-2xl hover:bg-white hover:text-krenke-purple transition-all flex items-center justify-center shadow-2xl gtm-home-hero-button-quote group"
                >
                  <span className="group-hover:scale-110 transition-transform"><TranslatableText>Fazer Orçamento</TranslatableText></span>
                </Link>
              </Magnetic>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div
        data-hero-scroll
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 hidden md:block"
      >
        <div className="w-6 h-10 rounded-full border-2 border-white/30 flex justify-center p-1 backdrop-blur-sm">
          <div data-hero-dot className="w-1.5 h-3 bg-white rounded-full"></div>
        </div>
      </div>
    </div>
  );
};

const Features = () => (
  <section className="py-20 bg-white relative z-10">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <Reveal className="grid md:grid-cols-3 gap-8" stagger={0.12} distance={60}>
        {[{
          icon: Award,
          title: "Desde 1987",
          desc: "A maior e mais premiada fábrica de playgrounds do Brasil.",
          bg: "bg-krenke-purple text-white shadow-vibrant-purple",
          slug: "desde-1987"
        },
        {
          icon: CheckCircle,
          title: "Segurança 360°",
          desc: "Produtos robustos em conformidade total com a ABNT.",
          bg: "bg-vibrant-orange text-white shadow-vibrant-orange",
          slug: "abnt"
        },
        {
          icon: PenTool,
          title: "Alta Tecnologia",
          desc: "Polímeros de última geração com proteção UV industrial.",
          bg: "bg-krenke-purple text-white shadow-vibrant-purple",
          slug: "rotomoldagem"
        }
        ].map((feature, idx) => (
          <div
            key={idx}
            className={`${feature.bg} group p-10 rounded-[2.5rem] shadow-2xl flex flex-col items-center text-center transition-all duration-300 hover:-translate-y-4 hover:scale-[1.02] gtm-home-feature-${feature.slug} border border-white/10`}
          >
            <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center mb-8 backdrop-blur-xl rotate-12 group-hover:rotate-0 transition-transform duration-500">
              <feature.icon size={40} strokeWidth={2.5} />
            </div>
            <h3 className="text-2xl font-black mb-4 uppercase tracking-tighter leading-none"><TranslatableText>{feature.title}</TranslatableText></h3>
            <p className="text-white/90 leading-tight font-bold text-lg"><TranslatableText>{feature.desc}</TranslatableText></p>
          </div>
        ))}
      </Reveal>
    </div>
  </section>
);

const CategoryPreview = () => {
  const pinRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  const categories = [
    {
      title: "Playgrounds Padrões",
      subtitle: "Linha Profissional Certified",
      image: imgPlaygroundsPadroes,
      link: "/produtos/categoria/playgrounds-padroes",
      description: "Estruturas completas que garantem diversão máxima com total segurança para todas as idades.",
      color: "#f18915",
      alt: "Playground Krenke KMP 0502 - Modelo Padrão",
      id: "btn-home-category-playgrounds-padroes"
    },
    {
      title: "Little Play",
      subtitle: "Para Pequenos Exploradores",
      image: imgLittlePlay,
      link: "/produtos/categoria/little-play",
      description: "Diversão sob medida para os pequenos, com segurança e ergonomia.",
      color: "#16462c",
      alt: "Playground Little Play Krenke - KLP 0201",
      id: "btn-home-category-little-play"
    },
    {
      title: "Brinquedos Avulsos",
      subtitle: "Acessórios e Lúdicos",
      image: imgBrinquedosAvulsos,
      link: "/produtos/categoria/brinquedos-avulsos",
      description: "Peças individuais perfeitas para complementar seu espaço de lazer com variedade.",
      color: "#5f2c65",
      alt: "Cavalinho de Mola Krenke - Brinquedo Avulso",
      id: "btn-home-category-brinquedos-avulsos"
    },
    {
      title: "Aquáticos",
      subtitle: "Diversão na Água",
      image: imgAquaticos,
      link: "/produtos/categoria/aquaticos",
      description: "Estruturas interativas para diversão na água com total segurança.",
      color: "#429ac6",
      alt: "Playground Aquático Krenke - KAQ 0302",
      id: "btn-home-category-aquaticos"
    },
    {
      title: "Mobiliários",
      subtitle: "Design e Conforto Urbano",
      image: imgMobiliarios,
      link: "/produtos/categoria/mobiliarios",
      description: "Bancos e acessórios duráveis que trazem conforto e beleza para áreas externas.",
      color: "#c14d89",
      alt: "Mesa Krenke - Mobiliário Urbano",
      id: "btn-home-category-mobiliarios"
    },
    {
      title: "Temáticos",
      subtitle: "Aventuras de Imaginação",
      image: imgTematicos,
      link: "/produtos/categoria/tematicos",
      description: "Aventuras lúdicas com playgrounds inspiradores que estimulam a imaginação.",
      color: "#284e9d",
      alt: "Playground Temático Krenke - Trator",
      id: "btn-home-category-tematicos"
    },
  ];

  useGSAP(
    () => {
      const pin = pinRef.current;
      const track = trackRef.current;
      if (!pin || !track) return;

      const mm = gsap.matchMedia();

      // Scroll horizontal só no desktop. Em telas menores — e quando o usuário
      // pede menos movimento — o track continua sendo um carrossel nativo com
      // snap, então nenhum card fica inacessível se o pin não ativar.
      mm.add(MQ.desktop, () => {
        // Distância = quanto o track precisa andar pra revelar o último card.
        const distance = () => Math.max(0, track.scrollWidth - window.innerWidth + 96);

        // Enquanto o GSAP controla o eixo X, o scroll nativo do track sai de cena.
        track.style.overflowX = 'hidden';

        const tween = gsap.to(track, {
          x: () => -distance(),
          ease: 'none', // obrigatório: mantém scroll e posição 1:1
          scrollTrigger: {
            trigger: pin,
            pin: true,
            start: 'top top',
            end: () => `+=${distance()}`,
            scrub: 1,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });

        // Barra de progresso do trilho.
        const bar = gsap.fromTo(
          '[data-track-progress]',
          { scaleX: 0 },
          {
            scaleX: 1,
            ease: 'none',
            scrollTrigger: {
              trigger: pin,
              start: 'top top',
              end: () => `+=${distance()}`,
              scrub: true,
              invalidateOnRefresh: true,
            },
          }
        );

        return () => {
          track.style.overflowX = '';
          tween.kill();
          bar.kill();
        };
      });

      return () => mm.revert();
    },
    { scope: pinRef }
  );

  return (
    <section className="py-32 bg-gradient-to-b from-white to-slate-100 flex flex-col items-center overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="text-center mb-20">
          <h2 className="text-5xl md:text-7xl font-black text-krenke-purple mb-6 uppercase tracking-tighter">
            <SplitHeadline as="span" text="Explore Nossa Linha de" className="inline-block" />{' '}
            <SplitHeadline as="span" text="Playgrounds" className="inline-block text-vibrant-orange" delay={0.15} />
          </h2>
          <Reveal delay={0.2}>
            <p className="text-xl text-gray-500 max-w-3xl mx-auto font-medium leading-relaxed">
              <TranslatableText>Produtos certificados pela ABNT com durabilidade extrema. O melhor investimento para o lazer das crianças.</TranslatableText>
            </p>
          </Reveal>
          <Reveal direction="scale" delay={0.3}>
            <div className="h-2 w-[150px] bg-vibrant-orange mx-auto mt-8 rounded-full shadow-[0_0_15px_#FF9F0A]"></div>
          </Reveal>
        </div>
      </div>

      {/* Trilho horizontal: pinado e puxado pelo scroll no desktop, carrossel com
          snap no mobile. */}
      <div
        ref={pinRef}
        className="relative w-full lg:h-screen lg:flex lg:flex-col lg:justify-center"
      >
        <div
          ref={trackRef}
          className="flex gap-8 lg:gap-12 px-6 lg:px-[8vw] overflow-x-auto snap-x snap-mandatory pb-10 lg:pb-0 no-scrollbar"
        >
          {categories.map((cat, idx) => (
            <ShowcaseCard
              key={idx}
              priority={idx === 0 || idx === 1}
              className="shrink-0 w-[85vw] sm:w-[420px] snap-center"
              heightClass="h-[clamp(460px,68vh,640px)]"
              {...cat}
            />
          ))}
        </div>

        {/* Progresso do trilho (desktop) */}
        <div className="hidden lg:block max-w-md mx-auto w-full h-1 bg-krenke-purple/10 rounded-full mt-12 overflow-hidden">
          <div data-track-progress className="h-full w-full origin-left bg-vibrant-orange rounded-full" style={{ transform: 'scaleX(0)' }} />
        </div>
      </div>

      <div className="mt-20 text-center">
        <Reveal direction="scale">
          <Magnetic strength={0.25}>
            <Link
              to="/orcamento"
              id="btn-home-category-full-quote"
              className="inline-flex items-center gap-3 px-12 py-5 bg-gradient-to-r from-krenke-orange to-orange-500 text-white font-black text-xl rounded-2xl shadow-xl shadow-orange-500/20 hover:shadow-2xl hover:shadow-orange-500/40 transition-all duration-300 gtm-home-category-button-full-quote"
            >
              <TranslatableText>SOLICITAR ORÇAMENTO COMPLETO</TranslatableText>
              <ArrowRight strokeWidth={3} />
            </Link>
          </Magnetic>
        </Reveal>
      </div>
    </section>
  );
};

const StatsSection = () => {
  const root = useRef<HTMLDivElement>(null);

  const stats = [
    { label: "Segurança Certificada", bg: "bg-vibrant-orange", shadow: "shadow-vibrant-orange" },
    { label: "Qualidade de Exportação", bg: "bg-krenke-purple", shadow: "shadow-vibrant-purple" },
    { label: "Lazer Educativo", bg: "bg-vibrant-green", shadow: "shadow-vibrant-green" },
    { label: "Felicidade Garantida", bg: "bg-pink-500", shadow: "shadow-pink-500/50" },
  ];

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add(MQ.reduce, () => {
        gsap.set('[data-stat-bar]', { scaleX: 1 });
      });

      mm.add(MQ.motion, () => {
        // As barras enchem conforme o bloco cruza a viewport (scrub) — dá a
        // sensação de que o scroll é quem "preenche" os indicadores.
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
    { scope: root }
  );

  return (
    <section ref={root} className="py-32 bg-white relative overflow-hidden" id="sobre-nos">
      {/* Background Decoration */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-krenke-purple/5 rounded-full blur-[120px] -mr-64 -mt-64"></div>
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-vibrant-orange/5 rounded-full blur-[100px] -ml-48 -mb-48"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          <Reveal direction="left" distance={60} className="space-y-10">
            <div>
              <span className="text-sm font-black text-vibrant-orange uppercase tracking-widest bg-vibrant-orange/10 px-4 py-1.5 rounded-full mb-6 inline-block"><TranslatableText>Nossa Essência</TranslatableText></span>
              <h3 className="text-4xl md:text-6xl font-black text-gray-900 leading-[1.1] tracking-tighter">
                <SplitHeadline as="span" text="QUALIDADE EM CADA" className="block" />
                <SplitHeadline as="span" text="PLAYGROUND E BRINQUEDO" className="block text-krenke-purple" delay={0.15} />
              </h3>
            </div>

            <p className="text-xl text-gray-500 leading-relaxed font-medium">
              <TranslatableText>Desde 1987, a Krenke lidera o mercado brasileiro com playgrounds que unem robustez técnica a um design focado na diversão e no desenvolvimento infantil.</TranslatableText>
            </p>

            <div data-stat-list className="space-y-6">
              {stats.map((stat, i) => (
                <div key={i} className="group">
                  <div className="flex justify-between mb-2 text-sm font-black uppercase tracking-widest">
                    <span className="text-gray-900"><TranslatableText>{stat.label}</TranslatableText></span>
                    <Counter value={100} suffix="%" className="text-vibrant-orange" />
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden border border-gray-100">
                    <div
                      data-stat-bar
                      className={`${stat.bg} h-full w-full rounded-full origin-left ${stat.shadow}`}
                      style={{ transform: 'scaleX(0)' }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal direction="scale" className="relative">
            <div className="absolute -inset-4 bg-gradient-to-tr from-vibrant-orange to-krenke-purple opacity-20 blur-2xl rounded-[3rem]"></div>
            <div className="relative rounded-[3rem] overflow-hidden shadow-premium border-[12px] border-white transform lg:rotate-3 hover:rotate-0 transition-all duration-700">
              <div className="absolute top-8 right-8 bg-vibrant-orange text-white px-6 py-3 rounded-2xl shadow-2xl z-20 flex flex-col items-center">
                <span className="text-xs font-black uppercase tracking-[0.2em] opacity-80"><TranslatableText>Líder desde</TranslatableText></span>
                <span className="text-4xl font-black">1987</span>
              </div>
              <Parallax speed={1.3} className="block h-[600px] w-full">
                <img
                  src={sobreImg}
                  alt="Fábrica Krenke"
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover scale-[1.18]"
                />
              </Parallax>
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
};

const Differentials = () => (
  <section className="py-32 bg-slate-50 relative overflow-hidden">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-20">
        <h2 className="text-4xl md:text-6xl font-black text-gray-900 leading-tight uppercase tracking-tighter">
          <SplitHeadline as="span" text="DIFERENCIAIS QUE" className="block" />
          <SplitHeadline as="span" text="IMPULSIONAM O MERCADO" className="block text-krenke-purple" delay={0.15} />
        </h2>
      </div>

      <Reveal className="grid md:grid-cols-3 gap-10" stagger={0.09} direction="scale">
        {[
          {
            title: "Foco no Ser Humano",
            text: "Atendimento personalizado para transformar sua visão em realidade.",
            icon: HeartHandshake,
            color: "#FF9F0A" // Vibrant Orange
          },
          {
            title: "Sob Medida",
            text: "Soluções flexíveis desenhadas para a sua necessidade específica.",
            icon: Calculator,
            color: "#4032B2" // Vibrant Purple
          },
          {
            title: "Logística Inteligente",
            text: "Processos otimizados para garantir a entrega mais rápida do país.",
            icon: Truck,
            color: "#2ECC71" // Vibrant Green
          },
          {
            title: "Qualidade de Ferro",
            text: "Materiais premium e fornecedores certificados de alto padrão.",
            icon: ShieldCheck,
            color: "#00D1FF" // Vibrant Cyan
          },
          {
            title: "Projetos 3D",
            text: "Visualize seu parque antes mesmo da instalação começar.",
            icon: Zap,
            color: "#F32051" // Vibrant Pink
          },
          {
            title: "Pagamento Facilitado",
            text: "Condições flexíveis que cabem no planejamento do seu projeto.",
            icon: CreditCard,
            color: "#8B5CF6" // Vibrant Violet
          }
        ].map((item, i) => (
          <div
            key={i}
            className="group bg-white p-10 rounded-[2.5rem] shadow-premium hover:shadow-2xl hover:-translate-y-3 transition-all duration-500 border-t-[8px] border-transparent relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 right-0 h-2 bg-gray-50 group-hover:bg-opacity-100 transition-all opacity-20"
              style={{ backgroundColor: item.color }} />

            <div className="w-16 h-16 mb-8 flex items-center justify-center rounded-3xl group-hover:rotate-12 transition-transform duration-500"
              style={{ backgroundColor: `${item.color}20` }}>
              <item.icon size={36} strokeWidth={2.5} style={{ color: item.color }} />
            </div>
            <h3 className="font-black text-2xl text-gray-900 mb-4 tracking-tight"><TranslatableText>{item.title}</TranslatableText></h3>
            <p className="text-gray-500 text-lg leading-snug font-medium"><TranslatableText>{item.text}</TranslatableText></p>
          </div>
        ))}
      </Reveal>
    </div>
  </section>
);

const ComparativeTable = () => {
  const [logoUrl, setLogoUrl] = useState(logoBranco);

  useEffect(() => {
    const fetchSettings = async () => {
      if (!supabase) return;
      const { data } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'site_logo_white')
        .single();
      if (data?.value) setLogoUrl(data.value);
    };
    fetchSettings();
  }, []);

  const comparisons = [
    { feature: "Polímero Rotomoldado", common: false, krenke: true },
    { feature: "Resistente a ferrugem e apodrecimento", common: false, krenke: true },
    { feature: "Conforto térmico (Não aquece como metal)", common: false, krenke: true },
    { feature: "Totalmente livre de farpas (Madeira zero)", common: false, krenke: true },
    { feature: "Alta durabilidade (Sol, Chuva e Intempéries)", common: "Baixa", krenke: true },
    { feature: "Baixa Manutenção (Dispensa pintura e verniz)", common: false, krenke: true },
    { feature: "Pigmentação UV Industrial (Não desbota fácil)", common: "Algumas", krenke: true },
    { feature: "Cantos arredondados (Segurança anti-impacto)", common: false, krenke: true },
    { feature: "Material atóxico e 100% Reciclável", common: false, krenke: true },
    { feature: "Certificação de Segurança ABNT", common: "Raras", krenke: true },
  ];

  return (
    <section className="py-32 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-7xl font-black text-krenke-purple mb-6 uppercase tracking-tight">
            <SplitHeadline as="span" text="A Superioridade" className="inline-block" />{' '}
            <SplitHeadline as="span" text="Krenke" className="inline-block text-vibrant-orange drop-shadow-sm" delay={0.15} />
          </h2>
          <Reveal delay={0.2}>
            <p className="text-xl text-gray-500 max-w-3xl mx-auto font-medium">
              <TranslatableText>Por que somos a primeira escolha de quem preza pela máxima segurança.</TranslatableText>
            </p>
          </Reveal>
        </div>

        {/* As linhas entram em cascata; o seletor alcança os <tr> dentro da tabela. */}
        <Reveal selector="tbody tr" stagger={0.045} distance={28} duration={0.6}>
          <div className="relative group overflow-x-auto rounded-[2rem] md:rounded-[3rem] shadow-premium border border-gray-100 bg-white w-full max-w-full">
            <table className="w-full min-w-[600px] md:min-w-[800px] border-collapse">
              <thead>
                <tr className="text-white">
                  <th className="bg-krenke-purple px-4 py-6 md:p-12 text-left font-black uppercase tracking-widest text-xs md:text-sm w-1/2 border-r border-white/10">
                    <TranslatableText>Especificações Técnicas</TranslatableText>
                  </th>
                  <th className="bg-slate-400 px-2 py-6 md:p-12 text-center font-black uppercase tracking-widest text-xs md:text-sm w-1/4 border-r border-white/10 break-words whitespace-normal leading-relaxed">
                    <TranslatableText>Mercado Comum</TranslatableText>
                  </th>
                  <th className="bg-vibrant-orange px-2 py-6 md:p-12 text-center font-black uppercase tracking-widest text-xs md:text-sm w-1/4 relative overflow-hidden">
                    <div className="flex justify-center items-center h-full scale-125 md:scale-[1.75]">
                      <img
                        src={logoUrl}
                        alt="Krenke Brinquedos"
                        className="h-6 md:h-12 w-auto object-contain drop-shadow-md"
                        loading="lazy"
                      />
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {comparisons.map((row, idx) => (
                  <tr key={idx} className="group hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-6 md:p-8 md:px-12 text-gray-900 font-bold md:font-black text-sm md:text-lg border-r border-gray-50 leading-snug">
                      <TranslatableText>{row.feature}</TranslatableText>
                    </td>
                    <td className="p-4 md:p-8 text-center border-r border-gray-50">
                      {row.common === true ? (
                        <div className="mx-auto w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-vibrant-green text-white flex items-center justify-center shadow-vibrant-green">
                          <CheckCircle size={24} className="md:w-7 md:h-7" />
                        </div>
                      ) : row.common === false ? (
                        <div className="mx-auto w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-red-500 text-white flex items-center justify-center shadow-lg shadow-red-500/30">
                          <X size={24} className="md:w-7 md:h-7" />
                        </div>
                      ) : (
                        <span className="text-gray-400 italic font-black uppercase text-[10px] md:text-xs tracking-widest"><TranslatableText>{row.common}</TranslatableText></span>
                      )}
                    </td>
                    <td className="p-4 md:p-8 text-center bg-orange-50/20">
                      <div className="mx-auto w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-vibrant-orange text-white flex items-center justify-center shadow-vibrant-orange transition-transform duration-300 hover:scale-125 hover:rotate-6">
                        <CheckCircle size={28} strokeWidth={3} className="md:w-8 md:h-8" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Reveal>
      </div>
    </section>
  );
};

const InstagramFeed = () => (
  <section className="py-32 bg-white relative overflow-hidden">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-16">
        <span className="text-sm font-black text-vibrant-orange uppercase tracking-[.3em] bg-vibrant-orange/10 px-6 py-2 rounded-full mb-6 inline-flex items-center gap-2">
          <Instagram size={16} /> @krenkebrinquedos
        </span>
        <h3 className="text-4xl md:text-6xl font-black text-krenke-purple uppercase tracking-tighter leading-none">
          <SplitHeadline as="span" text="Siga Nossas" className="inline-block" />{' '}
          <SplitHeadline as="span" text="Aventuras" className="inline-block text-vibrant-orange" delay={0.15} />
        </h3>
      </div>

      <Reveal direction="scale" className="mx-auto max-w-[800px] rounded-[2rem] overflow-hidden shadow-premium border border-gray-100">
        <iframe
          src="https://snapwidget.com/embed/1126759"
          className="w-full aspect-square border-0 overflow-hidden"
          title="Últimas postagens do Instagram Krenke Brinquedos"
          loading="lazy"
          allowTransparency
        />
      </Reveal>

      <div className="text-center mt-10">
        <Magnetic strength={0.25} className="inline-block">
          <a
            href="https://www.instagram.com/krenkebrinquedos/"
            target="_blank"
            rel="noopener noreferrer"
            id="btn-home-instagram-follow"
            className="inline-flex items-center gap-3 px-10 py-4 bg-gradient-to-r from-krenke-purple to-vibrant-orange text-white font-black uppercase text-sm tracking-widest rounded-2xl shadow-premium hover:shadow-2xl transition-all gtm-home-instagram-follow"
          >
            <Instagram size={20} /> <TranslatableText>Seguir no Instagram</TranslatableText>
          </a>
        </Magnetic>
      </div>
    </div>
  </section>
);

const BlogPreview = () => {
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    const fetchPosts = async () => {
      if (!supabase) return;
      const { data } = await supabase
        .from('posts')
        .select('*')
        .eq('published', true)
        .order('created_at', { ascending: false })
        .limit(3);
      if (data) setPosts(data);
    };
    fetchPosts();
  }, []);

  if (posts.length === 0) return null;

  return (
    <section className="py-32 bg-slate-50 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-10">
          <div className="max-w-2xl">
            <span className="text-sm font-black text-vibrant-orange uppercase tracking-[.3em] bg-white px-6 py-2 rounded-full shadow-sm mb-6 inline-block"><TranslatableText>Conteúdo & Insights</TranslatableText></span>
            <h3 className="text-4xl md:text-7xl font-black text-krenke-purple uppercase tracking-tighter leading-none">
              <SplitHeadline as="span" text="Últimas das" className="block" />
              <SplitHeadline as="span" text="Nossas Novidades" className="block text-vibrant-orange" delay={0.15} />
            </h3>
          </div>
          <Reveal direction="right">
            <Link id="btn-home-blog-all" to="/blog" className="px-10 py-5 bg-white border-4 border-krenke-purple text-krenke-purple font-black uppercase text-sm tracking-widest rounded-[2rem] hover:bg-krenke-purple hover:text-white transition-all flex items-center gap-3 group shadow-premium">
              <TranslatableText>Ver Blog Todo</TranslatableText> <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform" />
            </Link>
          </Reveal>
        </div>

        <Reveal className="grid lg:grid-cols-3 gap-12" stagger={0.12} direction="scale">
          {posts.map((post) => (
            <Link key={post.id} id={`btn-home-blog-post-${post.id}`} to={`/blog/${post.slug}`} className="group h-full bg-white rounded-[3rem] overflow-hidden shadow-premium hover:shadow-2xl transition-all border border-gray-100 flex flex-col">
              <div className="aspect-[4/3] overflow-hidden relative">
                <img src={post.cover_image} alt={post.title} loading="lazy" decoding="async" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
              <div className="p-10 flex flex-col flex-grow">
                <div className="flex items-center gap-6 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6">
                  <span className="flex items-center gap-2"><Calendar size={14} className="text-vibrant-orange" /> {new Date(post.created_at).toLocaleDateString()}</span>
                  <span className="flex items-center gap-2"><User size={14} className="text-vibrant-orange" /> {post.author.split(' ')[0]}</span>
                </div>
                <h4 className="text-2xl font-black text-krenke-purple mb-6 leading-[1.1] group-hover:text-vibrant-orange transition-colors line-clamp-3 uppercase tracking-tight">{post.title}</h4>
                <p className="text-gray-500 text-lg leading-snug line-clamp-2 mb-8 flex-grow font-medium">{post.excerpt}</p>
                <div className="flex items-center gap-3 text-vibrant-orange font-black uppercase text-sm tracking-widest group-hover:gap-6 transition-all mt-auto group-hover:translate-x-2">
                  <TranslatableText>Continuar Lendo</TranslatableText> <ArrowRight size={20} />
                </div>
              </div>
            </Link>
          ))}
        </Reveal>
      </div>
    </section>
  );
};

const HomePage: React.FC = () => {
  return (
    <div>
      <Helmet>
        <title>Krenke Brinquedos | Fábrica de Playgrounds e Parques Infantis Certificados</title>
        <meta name="description" content="Líder nacional na fabricação de playgrounds, parques infantis e brinquedos pedagógicos certificados pela ABNT. Qualidade, segurança e inovação para seu espaço de lazer." />
        <link rel="canonical" href="https://site.krenke.com.br/" />
        <meta property="og:title" content="Krenke Brinquedos | O Melhor Jeito de Brincar" />
        <meta property="og:description" content="Playgrounds e parques infantis com tecnologia de ponta e segurança absoluta. Conheça nossa linha completa." />
        <meta property="og:image" content="https://www.krenke.com.br/favicon.png" />
      </Helmet>
      <HeroSection />
      <Features />
      <CategoryPreview />
      <StatsSection />
      <InstagramFeed />
      <BlogPreview />
      <Differentials />
      <ComparativeTable />
      <ImageCarousel />
    </div>
  );
};

export default HomePage;
