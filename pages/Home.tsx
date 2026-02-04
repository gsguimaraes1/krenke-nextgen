import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, Award, PenTool, ArrowRight, HeartHandshake, Calculator, Truck, ShieldCheck, Zap, CreditCard, X, Calendar, User, FileText } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Post } from '../types';
import { motion } from 'framer-motion';
import { ShowcaseCard } from '../components/ui/ShowcaseCard';
import heroVideo from '../assets/Home/videokrenke.mp4';
import { ImageCarousel } from '../components/ImageCarousel';
import playgroundsImg from '../assets/Home/krenke-playgrounds-completos-parque-infantil.webp';
import brinquedosImg from '../assets/Home/krenke-brinquedos-infantis-avulsos.webp';
import linhaPetImg from '../assets/Home/krenke-playground-pet-linha-agility.webp';
import jardimImg from '../assets/Home/krenke-mobiliario-urbano-bancos-jardim.webp';
import sobreImg from '../assets/Sobre/krenke-sobre-nos-fabrica-playgrounds.webp';
import logoBranco from '../assets/Logos/krenke-brinquedos-logo-branco.png';

const HeroSection = () => {
  return (
    <div className="relative w-full h-[calc(100vh-80px)] min-h-[700px] bg-krenke-purple overflow-hidden flex items-center justify-center">
      {/* Video Background Wrapper */}
      <div className="absolute inset-0 w-full h-full z-0 pointer-events-none overflow-hidden">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover opacity-50 scale-105"
        >
          <source src={heroVideo} type="video/mp4" />
        </video>
      </div>

      {/* Overlays for readability and color tinting */}
      <div className="absolute inset-0 bg-gradient-to-br from-krenke-purple/80 via-krenke-purple/60 to-blue-900/60 mix-blend-multiply z-10"></div>
      <div className="absolute inset-0 bg-black/10 z-10"></div>

      {/* Gradient fade at bottom to merge with next section */}
      <div className="absolute bottom-0 left-0 w-full h-40 bg-gradient-to-t from-white via-white/50 to-transparent z-10"></div>

      {/* Content */}
      <div className="relative z-20 w-full flex flex-col items-center justify-center text-center px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-10 max-w-5xl"
        >

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 text-white text-xs md:text-sm font-bold tracking-[0.2em] uppercase shadow-2xl hover:bg-white/20 transition-all cursor-default"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-vibrant-orange animate-vibrant-pulse shadow-[0_0_10px_#FF9F0A]"></span>
            Desde 1987 • A maior fábrica de playgrounds do Brasil
          </motion.div>

          {/* Main Heading */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white tracking-tighter leading-[0.85] drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)] uppercase">
            O MELHOR JEITO<br />
            <motion.span
              animate={{
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
              }}
              transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
              className="text-transparent bg-clip-text bg-gradient-to-r from-vibrant-orange via-yellow-400 to-vibrant-orange bg-[length:200%_auto]"
            >
              DE BRINCAR
            </motion.span>
          </h1>

          {/* Description */}
          <p className="text-xl md:text-3xl text-white/90 max-w-3xl mx-auto font-medium leading-tight opacity-90 drop-shadow-md">
            Transformamos espaços em mundos de <span className="text-vibrant-orange">pura diversão</span> com segurança absoluta.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center pt-8">
            <Link
              to="/produtos"
              className="group relative px-10 py-5 bg-vibrant-orange text-white font-black text-xl rounded-2xl overflow-hidden shadow-[0_20px_40px_-10px_rgba(243,146,0,0.5)] hover:shadow-[0_30px_60px_-10px_rgba(243,146,0,0.6)] transition-all hover:scale-110 gtm-home-hero-button-products flex items-center gap-3"
            >
              <span className="relative z-10 flex items-center gap-2">
                Explorar Produtos <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-vibrant-orange opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Link>

            <Link
              to="/orcamento"
              className="px-10 py-5 bg-white/10 backdrop-blur-xl border-2 border-white/30 text-white font-black text-xl rounded-2xl hover:bg-white hover:text-krenke-purple transition-all flex items-center justify-center shadow-2xl gtm-home-hero-button-quote group"
            >
              <span className="group-hover:scale-110 transition-transform">Fazer Orçamento</span>
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 hidden md:block"
      >
        <div className="w-6 h-10 rounded-full border-2 border-white/30 flex justify-center p-1 backdrop-blur-sm">
          <div className="w-1.5 h-3 bg-white rounded-full animate-bounce"></div>
        </div>
      </motion.div>
    </div>
  );
};

const Features = () => (
  <section className="py-24 bg-white relative z-10 -mt-24">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid md:grid-cols-3 gap-8">
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
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.1, duration: 0.5 }}
            whileHover={{ y: -15, scale: 1.02 }}
            className={`${feature.bg} p-10 rounded-[2.5rem] shadow-2xl flex flex-col items-center text-center transform transition-all duration-300 gtm-home-feature-${feature.slug} border border-white/10`}
          >
            <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center mb-8 backdrop-blur-xl rotate-12 group-hover:rotate-0 transition-transform">
              <feature.icon size={40} strokeWidth={2.5} />
            </div>
            <h3 className="text-2xl font-black mb-4 uppercase tracking-tighter leading-none">{feature.title}</h3>
            <p className="text-white/90 leading-tight font-bold text-lg">{feature.desc}</p>
          </motion.div>
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
      link: "/produtos?categoria=Playgrounds%20Completos",
      description: "Estruturas completas que garantem diversão máxima com total segurança para todas as idades.",
      color: "#312783", // Krenke Purple
      alt: "Playgrounds Completos Krenke - Parques Infantis Certificados"
    },
    {
      title: "Brinquedos Avulsos",
      image: brinquedosImg,
      link: "/produtos?categoria=Brinquedos%20Avulsos",
      description: "Peças individuais perfeitas para complementar seu espaço de lazer com variedade.",
      color: "#FF8A00", // Orange
      alt: "Brinquedos Infantis Avulsos Krenke - Diversão e Segurança"
    },
    {
      title: "Linha Pet",
      image: linhaPetImg,
      link: "/produtos?categoria=Linha%20Pet",
      description: "Equipamentos especiais para o divertimento e treinamento do seu melhor amigo.",
      color: "#0B8E36", // Green
      alt: "Linha Pet Krenke - Brinquedos para Parques Pet e Agility"
    },
    {
      title: "Jardim e Mobília",
      image: jardimImg,
      link: "/produtos?categoria=Mobiliário%20Urbano%20e%20Jardim",
      description: "Bancos e acessórios duráveis que trazem conforto e beleza para áreas externas.",
      color: "#0095DA", // Blue (Complementary)
      imageScale: 1.15,
      alt: "Mobiliário Urbano Krenke - Bancos de Jardim e Lixeiras"
    },
  ];

  return (
    <section className="py-32 bg-gradient-to-b from-white to-slate-100 flex flex-col items-center">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="text-center mb-20">
          <motion.h2
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="text-5xl md:text-7xl font-black text-krenke-purple mb-6 uppercase tracking-tighter"
          >
            Explore Nosso <span className="text-vibrant-orange">Universo</span>
          </motion.h2>
          <p className="text-xl text-gray-500 max-w-3xl mx-auto font-medium leading-relaxed">
            Produtos certificados pela ABNT com durabilidade extrema. O melhor investimento para o lazer das crianças.
          </p>
          <motion.div
            initial={{ width: 0 }}
            whileInView={{ width: '150px' }}
            viewport={{ once: true }}
            className="h-2 bg-vibrant-orange mx-auto mt-8 rounded-full shadow-[0_0_15px_#FF9F0A]"
          ></motion.div>
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
          <Link
            to="/orcamento"
            className="inline-flex items-center gap-3 px-12 py-5 bg-gradient-to-r from-krenke-orange to-orange-500 text-white font-black text-xl rounded-2xl shadow-xl shadow-orange-500/20 hover:shadow-2xl hover:shadow-orange-500/40 hover:-translate-y-1 transition-all duration-300 gtm-home-category-button-full-quote"
          >
            SOLICITAR ORÇAMENTO COMPLETO
            <ArrowRight strokeWidth={3} />
          </Link>
        </div>
      </div>
    </section>
  );
};

const StatsSection = () => (
  <section className="py-32 bg-white relative overflow-hidden" id="sobre-nos">
    {/* Background Decoration */}
    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-krenke-purple/5 rounded-full blur-[120px] -mr-64 -mt-64"></div>
    <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-vibrant-orange/5 rounded-full blur-[100px] -ml-48 -mb-48"></div>

    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
      <div className="grid lg:grid-cols-2 gap-20 items-center">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="space-y-10"
        >
          <div>
            <span className="text-sm font-black text-vibrant-orange uppercase tracking-widest bg-vibrant-orange/10 px-4 py-1.5 rounded-full mb-6 inline-block">Nossa Essência</span>
            <h3 className="text-4xl md:text-6xl font-black text-gray-900 leading-[1.1] tracking-tighter">
              QUALIDADE DE VIDA E <br />
              <span className="text-krenke-purple">SEGURANÇA ABSOLUTA</span>
            </h3>
          </div>

          <p className="text-xl text-gray-500 leading-relaxed font-medium">
            Desde 1987, a Krenke lidera o mercado brasileiro com playgrounds que unem robustez técnica a um design focado na diversão e no desenvolvimento infantil.
          </p>

          <div className="space-y-6">
            {[
              { label: "Segurança Certificada", bg: "bg-vibrant-orange", shadow: "shadow-vibrant-orange" },
              { label: "Qualidade de Exportação", bg: "bg-krenke-purple", shadow: "shadow-vibrant-purple" },
              { label: "Lazer Educativo", bg: "bg-vibrant-green", shadow: "shadow-vibrant-green" },
              { label: "Felicidade Garantida", bg: "bg-pink-500", shadow: "shadow-pink-500/50" },
            ].map((stat, i) => (
              <div key={i} className="group">
                <div className="flex justify-between mb-2 text-sm font-black uppercase tracking-widest">
                  <span className="text-gray-900">{stat.label}</span>
                  <span className="text-vibrant-orange">100%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden border border-gray-100">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: '100%' }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.5, delay: i * 0.1, ease: "easeOut" }}
                    className={`${stat.bg} h-full rounded-full ${stat.shadow}`}
                  ></motion.div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative"
        >
          <div className="absolute -inset-4 bg-gradient-to-tr from-vibrant-orange to-krenke-purple opacity-20 blur-2xl rounded-[3rem]"></div>
          <div className="relative rounded-[3rem] overflow-hidden shadow-premium border-[12px] border-white transform lg:rotate-3 hover:rotate-0 transition-all duration-700">
            <div className="absolute top-8 right-8 bg-vibrant-orange text-white px-6 py-3 rounded-2xl shadow-2xl z-20 flex flex-col items-center">
              <span className="text-xs font-black uppercase tracking-[0.2em] opacity-80">Líder desde</span>
              <span className="text-4xl font-black">1987</span>
            </div>
            <img
              src={sobreImg}
              alt="Fábrica Krenke"
              className="w-full h-[600px] object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
          </div>
        </motion.div>
      </div>
    </div>
  </section>
);

const Differentials = () => (
  <section className="py-32 bg-slate-50 relative overflow-hidden">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-20">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl md:text-6xl font-black text-gray-900 leading-tight uppercase tracking-tighter"
        >
          DIFERENCIAIS QUE <br />
          <span className="text-krenke-purple">IMPULSIONAM O MERCADO</span>
        </motion.h2>
      </div>

      <div className="grid md:grid-cols-3 gap-10">
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
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ y: -10, scale: 1.02 }}
            className="group bg-white p-10 rounded-[2.5rem] shadow-premium hover:shadow-2xl transition-all duration-500 border-t-[8px] border-transparent relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 right-0 h-2 bg-gray-50 group-hover:bg-opacity-100 transition-all opacity-20"
              style={{ backgroundColor: item.color }} />

            <div className="w-16 h-16 mb-8 flex items-center justify-center rounded-3xl group-hover:rotate-12 transition-transform"
              style={{ backgroundColor: `${item.color}20` }}>
              <item.icon size={36} strokeWidth={2.5} style={{ color: item.color }} />
            </div>
            <h3 className="font-black text-2xl text-gray-900 mb-4 tracking-tight">{item.title}</h3>
            <p className="text-gray-500 text-lg leading-snug font-medium">{item.text}</p>
          </motion.div>
        ))}
      </div>
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
          <motion.h2
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="text-4xl md:text-7xl font-black text-krenke-purple mb-6 uppercase tracking-tight"
          >
            A Superioridade <span className="text-vibrant-orange drop-shadow-sm">Krenke</span>
          </motion.h2>
          <p className="text-xl text-gray-500 max-w-3xl mx-auto font-medium">
            Por que somos a primeira escolha de quem preza pela máxima segurança.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative group overflow-x-auto rounded-[3rem] shadow-premium border border-gray-100 bg-white"
        >
          <table className="w-full border-collapse">
            <thead>
              <tr className="text-white">
                <th className="bg-krenke-purple p-8 md:p-12 text-left font-black uppercase tracking-[0.2em] text-sm w-1/2 border-r border-white/10">
                  Especificações Técnicas
                </th>
                <th className="bg-slate-400 p-8 md:p-12 text-center font-black uppercase tracking-[0.2em] text-sm w-1/4 border-r border-white/10">
                  Mercado Comum
                </th>
                <th className="bg-vibrant-orange p-8 md:p-12 text-center font-black uppercase tracking-[0.2em] text-sm w-1/4 relative overflow-hidden">
                  <div className="flex justify-center items-center h-full scale-[1.75]">
                    <img
                      src={logoUrl}
                      alt="Krenke Brinquedos"
                      className="h-8 md:h-12 w-auto object-contain drop-shadow-md"
                    />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {comparisons.map((row, idx) => (
                <tr key={idx} className="group hover:bg-slate-50 transition-colors">
                  <td className="p-8 md:px-12 text-gray-900 font-black text-lg border-r border-gray-50">
                    {row.feature}
                  </td>
                  <td className="p-8 text-center border-r border-gray-50">
                    {row.common === true ? (
                      <div className="mx-auto w-12 h-12 rounded-2xl bg-vibrant-green text-white flex items-center justify-center shadow-vibrant-green">
                        <CheckCircle size={28} />
                      </div>
                    ) : row.common === false ? (
                      <div className="mx-auto w-12 h-12 rounded-2xl bg-red-500 text-white flex items-center justify-center shadow-lg shadow-red-500/30">
                        <X size={28} />
                      </div>
                    ) : (
                      <span className="text-gray-400 italic font-black uppercase text-xs tracking-widest">{row.common}</span>
                    )}
                  </td>
                  <td className="p-8 text-center bg-orange-50/20">
                    <motion.div
                      whileHover={{ scale: 1.2, rotate: 5 }}
                      className="mx-auto w-14 h-14 rounded-2xl bg-vibrant-orange text-white flex items-center justify-center shadow-vibrant-orange"
                    >
                      <CheckCircle size={32} strokeWidth={3} />
                    </motion.div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      </div>
    </section>
  );
};

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
            <span className="text-sm font-black text-vibrant-orange uppercase tracking-[.3em] bg-white px-6 py-2 rounded-full shadow-sm mb-6 inline-block">Conteúdo & Insights</span>
            <h3 className="text-4xl md:text-7xl font-black text-krenke-purple uppercase tracking-tighter leading-none">Últimas das <br /> <span className="text-vibrant-orange">Nossas Novidades</span></h3>
          </div>
          <Link to="/blog" className="px-10 py-5 bg-white border-4 border-krenke-purple text-krenke-purple font-black uppercase text-sm tracking-widest rounded-[2rem] hover:bg-krenke-purple hover:text-white transition-all flex items-center gap-3 group shadow-premium">
            Ver Blog Todo <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform" />
          </Link>
        </div>

        <div className="grid lg:grid-cols-3 gap-12">
          {posts.map((post, i) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <Link to={`/blog/${post.slug}`} className="group h-full bg-white rounded-[3rem] overflow-hidden shadow-premium hover:shadow-2xl transition-all border border-gray-100 flex flex-col">
                <div className="aspect-[4/3] overflow-hidden relative">
                  <img src={post.cover_image} alt={post.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
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
                    Continuar Lendo <ArrowRight size={20} />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const HomePage: React.FC = () => {
  return (
    <div className="animate-fade-in">
      <HeroSection />
      <Features />
      <CategoryPreview />
      <StatsSection />
      <BlogPreview />
      <Differentials />
      <ComparativeTable />
      <ImageCarousel />
    </div>
  );
};

export default HomePage;