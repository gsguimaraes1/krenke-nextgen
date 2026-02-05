import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Phone, Mail, MapPin, Facebook, Instagram, Youtube, ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';
import logoBranco from '../assets/Logos/krenke-brinquedos-logo-branco.png';
import logoMarcaBranco from '../assets/Logos/krenke-marca-playgrounds-branco.png';
import { CookieConsent } from './CookieConsent';
import { ScriptInjector } from './ScriptInjector';

const LanguageSelector: React.FC<{ isMobile?: boolean }> = ({ isMobile }) => {
  const languages = [
    { code: 'pt', label: 'BR', flag: 'https://flagcdn.com/w40/br.png' },
    { code: 'en', label: 'EN', flag: 'https://flagcdn.com/w40/us.png' },
    { code: 'es', label: 'ES', flag: 'https://flagcdn.com/w40/es.png' },
    { code: 'fr', label: 'FR', flag: 'https://flagcdn.com/w40/fr.png' },
    { code: 'de', label: 'DE', flag: 'https://flagcdn.com/w40/de.png' },
  ];

  return (
    <div className={`flex items-center gap-2 ${isMobile ? 'justify-center py-4 border-t border-white/10 mt-4' : ''}`}>
      {!isMobile && <span className="text-[10px] font-bold text-white/40 mr-1 uppercase">🌐</span>}
      <div className="flex gap-2.5">
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => (window as any).doGTranslate(lang.code)}
            className="group relative transition-all hover:scale-125 focus:outline-none"
            title={lang.label}
          >
            <img
              src={lang.flag}
              alt={lang.label}
              className="w-7 h-5 object-cover rounded shadow-md border border-white/20 group-hover:border-krenke-orange language-flag"
            />
          </button>
        ))}
      </div>
    </div>
  );
};

export const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [productsOpen, setProductsOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsOpen(false);
    setProductsOpen(false);
  }, [location]);

  const productCategories = [
    "Playgrounds Completos",
    "Little Play",
    "Brinquedos Avulsos",
    "Linha Pet",
    "Mobiliário Urbano e Jardim"
  ];

  return (
    <nav className={`fixed w-full z-50 transition-all duration-500 ${isScrolled ? 'py-2' : 'py-4'}`}>
      {/* Dynamic Background with improved contrast */}
      <div className={`absolute inset-0 transition-all duration-500 ${isScrolled ? 'bg-krenke-purple shadow-premium' : 'bg-[#312783] border-b border-white/10'}`}></div>

      {/* Top Bar - Improved legibility to match previous version */}
      <div className={`hidden lg:block border-b border-white/5 ${isScrolled ? 'h-0 overflow-hidden border-none' : 'h-11 mb-1'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex justify-between items-center text-sm text-white font-bold opacity-90">
          <div className="flex items-center gap-8">
            <span className="flex items-center gap-2 hover:text-vibrant-orange transition-all cursor-default gtm-topbar-phone">
              <Phone size={16} /> (47) 3373-0693
            </span>
            <span className="flex items-center gap-2 hover:text-vibrant-orange transition-all cursor-default gtm-topbar-email">
              <Mail size={16} /> contato@krenke.com.br
            </span>
          </div>
          <div className="flex items-center gap-6">
            <LanguageSelector />
            <div className="w-px h-4 bg-white/20 mx-2"></div>
            <a href="#" className="hover:text-vibrant-orange transition-all gtm-social-instagram-top"><Instagram size={18} /></a>
            <a href="#" className="hover:text-vibrant-orange transition-all gtm-social-facebook-top"><Facebook size={16} /></a>
            <a href="#" className="hover:text-vibrant-orange transition-all gtm-social-youtube-top"><Youtube size={18} /></a>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0 gtm-nav-logo group">
            <motion.img
              whileHover={{ scale: 1.05, rotate: -2 }}
              src={logoBranco}
              alt="Krenke Brinquedos"
              className={`transition-all duration-500 ${isScrolled ? 'h-10' : 'h-16'}`}
            />
          </Link>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center gap-10">
            {['Home', 'Empresa'].map((item, i) => (
              <Link
                key={i}
                to={item === 'Home' ? '/' : `/${item.toLowerCase()}`}
                className="text-white font-black text-sm uppercase tracking-widest hover:text-vibrant-orange transition-all relative group"
              >
                {item}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-vibrant-orange transition-all group-hover:w-full"></span>
              </Link>
            ))}

            {/* Products Dropdown - Improved Background */}
            <div className="relative group">
              <button className="flex items-center gap-1 text-white font-black text-sm uppercase tracking-widest group-hover:text-vibrant-orange transition-all py-2">
                Produtos <ChevronDown size={14} className="group-hover:rotate-180 transition-transform" />
              </button>
              <div className="absolute top-full left-0 w-72 bg-krenke-purple/95 backdrop-blur-3xl rounded-3xl shadow-2xl py-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-4 group-hover:translate-y-0 border border-white/20">
                {productCategories.map((cat, idx) => (
                  <Link
                    key={idx}
                    to={`/produtos?categoria=${encodeURIComponent(cat)}`}
                    className="block px-8 py-3 text-white hover:bg-white/10 hover:text-vibrant-orange transition-colors gtm-nav-category"
                  >
                    <span className="font-bold">{cat}</span>
                  </Link>
                ))}
              </div>
            </div>

            {['Downloads', 'Blog', 'Projetos'].map((item, i) => (
              <Link
                key={i}
                to={`/${item.toLowerCase()}`}
                className="text-white font-black text-sm uppercase tracking-widest hover:text-vibrant-orange transition-all relative group"
              >
                {item}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-vibrant-orange transition-all group-hover:w-full"></span>
              </Link>
            ))}

            <Link to="/orcamento" className="px-8 py-3 bg-vibrant-orange text-white font-black uppercase text-sm tracking-tighter rounded-2xl hover:bg-orange-500 transition-all transform hover:scale-110 shadow-vibrant-orange gtm-nav-button-quote">
              Orçamento
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden relative z-50">
            <button onClick={() => setIsOpen(!isOpen)} className="w-12 h-12 flex items-center justify-center bg-white/10 rounded-2xl backdrop-blur-md border border-white/20 text-white hover:text-vibrant-orange transition-all">
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`lg:hidden fixed inset-0 bg-krenke-purple z-40 transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'} pt-24 px-6`}>
        <div className="flex flex-col gap-6 text-lg overflow-y-auto max-h-screen pb-20">
          <Link to="/" className="text-white font-medium border-b border-white/10 pb-4 gtm-nav-mobile-home">Home</Link>
          <Link to="/empresa" className="text-white font-medium border-b border-white/10 pb-4 gtm-nav-mobile-about">Empresa</Link>

          <div>
            <button
              onClick={() => setProductsOpen(!productsOpen)}
              className="flex items-center justify-between w-full text-white font-medium border-b border-white/10 pb-4 gtm-nav-mobile-products-toggle"
            >
              Produtos <ChevronDown size={20} className={`transform transition-transform ${productsOpen ? 'rotate-180' : ''}`} />
            </button>
            {productsOpen && (
              <div className="pl-4 py-2 space-y-3 bg-black/10 rounded-lg mt-2">
                {productCategories.map((cat, idx) => (
                  <Link
                    key={idx}
                    to={`/produtos?categoria=${encodeURIComponent(cat)}`}
                    className={`block text-gray-300 hover:text-krenke-orange text-sm gtm-nav-mobile-category-${cat.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    {cat}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <Link to="/downloads" className="text-white font-medium border-b border-white/10 pb-4 gtm-nav-mobile-downloads">Downloads</Link>
          <Link to="/blog" className="text-white font-medium border-b border-white/10 pb-4 gtm-nav-mobile-blog">Blog</Link>
          <Link to="/projetos" className="text-white font-medium border-b border-white/10 pb-4 gtm-nav-mobile-projects">Projetos</Link>
          <Link to="/orcamento" className="text-center py-4 bg-krenke-orange text-white font-bold rounded-xl shadow-lg gtm-nav-mobile-button-quote">
            Solicitar Orçamento
          </Link>

          <div className="text-center">
            <span className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em]">Seleção de Idioma</span>
            <LanguageSelector isMobile />
          </div>
        </div>
      </div>
    </nav>
  );
};

export const Footer: React.FC = () => {
  return (
    <footer className="bg-krenke-purple text-white pt-32 pb-12 relative overflow-hidden">
      {/* Vibrant Background Decoration */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-vibrant-orange via-vibrant-purple to-vibrant-green"></div>
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-vibrant-orange/10 rounded-full blur-[100px]"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-16 mb-20 border-b border-white/10 pb-20">
          {/* Logo & Bio */}
          <div className="lg:col-span-5 space-y-8">
            <Link to="/" className="inline-block group">
              <motion.img
                whileHover={{ scale: 1.05 }}
                src={logoMarcaBranco}
                alt="Krenke Brinquedos"
                className="h-20 w-auto drop-shadow-2xl"
              />
            </Link>
            <p className="text-xl text-gray-300 font-medium leading-relaxed max-w-md">
              Desde 1987 transformando espaços em mundos de <span className="text-white font-black">pura diversão</span> com segurança absoluta e design de elite.
            </p>
            <div className="flex gap-4">
              {[Facebook, Instagram, Youtube].map((Icon, i) => (
                <motion.a
                  key={i}
                  href="#"
                  whileHover={{ y: -5, color: '#FF9F0A' }}
                  className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 hover:bg-white/10 transition-all"
                >
                  <Icon size={24} />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Quick Links Group */}
          <div className="lg:col-span-3">
            <h4 className="text-vibrant-orange font-black uppercase tracking-[0.2em] text-sm mb-10">Explore</h4>
            <ul className="grid grid-cols-1 gap-4">
              {['Home', 'Empresa', 'Produtos', 'Downloads', 'Blog', 'Projetos'].map((item) => (
                <li key={item}>
                  <Link
                    to={item === 'Home' ? '/' : `/${item.toLowerCase()}`}
                    className="text-gray-400 font-bold hover:text-white transition-colors flex items-center gap-2 group"
                  >
                    <span className="w-0 h-0.5 bg-vibrant-orange transition-all group-hover:w-4"></span>
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Section */}
          <div className="lg:col-span-4 space-y-10">
            <h4 className="text-vibrant-orange font-black uppercase tracking-[0.2em] text-sm mb-10">Contato Direto</h4>
            <div className="space-y-6">
              {[
                { Icon: Phone, text: "(47) 3373-0693", sub: "Atendimento Comercial" },
                { Icon: Mail, text: "contato@krenke.com.br", sub: "Suporte e Dúvidas" },
                { Icon: MapPin, text: "Guaramirim, SC", sub: "Sede de Produção" }
              ].map((item, i) => (
                <div key={i} className="flex gap-5 group cursor-default">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:bg-vibrant-orange/20 transition-all">
                    <item.Icon size={24} className="group-hover:text-vibrant-orange transition-colors" />
                  </div>
                  <div>
                    <span className="block text-white font-black text-lg">{item.text}</span>
                    <span className="block text-gray-500 text-xs font-bold uppercase tracking-widest">{item.sub}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Legal Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-gray-500 font-bold text-sm">
            © {new Date().getFullYear()} Krenke Brinquedos Pedagógicos LTDA. <span className="text-white/20 ml-2">Premium Experience.</span>
          </p>
          <div className="flex gap-8 text-xs font-black uppercase tracking-widest text-gray-500">
            <Link to="/politica-de-privacidade" className="hover:text-vibrant-orange transition-colors">Privacidade</Link>
            <Link to="/termos-de-uso" className="hover:text-vibrant-orange transition-colors">Termos</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen font-sans text-gray-900 overflow-x-hidden">
      <ScriptInjector />
      <Navbar />
      <main className="flex-grow pt-20 overflow-x-hidden">
        {children}
      </main>
      <Footer />
      <CookieConsent />
    </div>
  );
};