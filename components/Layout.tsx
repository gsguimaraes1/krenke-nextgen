import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Phone, Mail, MapPin, Facebook, Instagram, Youtube, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import logoBranco from '../assets/Logos/krenke-brinquedos-logo-branco.webp';
import logoMarcaBranco from '../assets/Logos/krenke-marca-playgrounds-branco.webp';
import { CookieConsent } from './CookieConsent';
import { SecurityGuard } from './SecurityGuard';
import { ScriptInjector } from './ScriptInjector';
import { WhatsAppWidget } from './WhatsAppWidget';
import { supabase } from '../lib/supabase';
import { NavItem } from '../types';
import { useTranslation } from 'react-i18next';
import { TranslatableText } from './TranslatableText';

const slugify = (text: string) => 
  text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');

const LanguageSelector: React.FC<{ isMobile?: boolean }> = ({ isMobile }) => {
  const { i18n } = useTranslation();
  const languages = [
    { code: 'pt', label: 'BR', flag: 'https://flagcdn.com/w40/br.webp' },
    { code: 'en', label: 'EN', flag: 'https://flagcdn.com/w40/us.webp' },
    { code: 'es', label: 'ES', flag: 'https://flagcdn.com/w40/es.webp' },
  ];

  return (
    <div className={`flex items-center gap-2 ${isMobile ? 'justify-center py-4 border-t border-white/10 mt-4' : ''}`}>
      {!isMobile && <span className="text-[10px] font-bold text-white/40 mr-1 uppercase">🌐</span>}
      <div className="flex gap-2.5">
        {languages.map((lang) => (
          <button
            key={lang.code}
            id={`btn-lang-${lang.code}`}
            onClick={() => i18n.changeLanguage(lang.code)}
            className={`group relative transition-all hover:scale-125 focus:outline-none ${i18n.language === lang.code ? 'scale-110 ring-2 ring-vibrant-orange rounded' : 'opacity-60 hover:opacity-100'}`}
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
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [productsOpen, setProductsOpen] = useState(false);
  const location = useLocation();

  const [navItems, setNavItems] = useState<NavItem[]>([]);
  const [productCategories, setProductCategories] = useState<string[]>([
    "Playgrounds Padrões",
    "Little Play",
    "Brinquedos Avulsos",
    "Mobiliários",
    "Aquáticos",
    "Temáticos"
  ]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: menuData } = await supabase.from('site_settings').select('value').eq('key', 'main_menu').single();
        if (menuData?.value) {
            setNavItems(JSON.parse(menuData.value));
        }
      } catch (err) { console.error('Failed to load menu') }
      
      try {
        const { data: catData } = await supabase.from('site_settings').select('value').eq('key', 'product_categories').single();
        if (catData?.value) {
            setProductCategories(JSON.parse(catData.value));
        }
      } catch (err) { console.error('Failed to load categories') }
    };
    fetchData();
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsOpen(false);
    setProductsOpen(false);
  }, [location]);

  return (
    <nav className={`fixed w-full z-50 transition-all duration-500 ${isScrolled ? 'py-2' : 'py-4'}`}>
      {/* Dynamic Background with improved contrast */}
      <div className={`absolute inset-0 transition-all duration-500 ${isScrolled ? 'bg-krenke-purple shadow-premium' : 'bg-[#312783] border-b border-white/10'}`}></div>

      {/* Top Bar - Now visible on all devices but optimized */}
      <div className={`border-b border-white/5 transition-all duration-500 overflow-hidden ${isScrolled ? 'h-0 border-none' : 'h-auto md:h-11 mb-1'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col md:flex-row justify-center md:justify-between items-center text-[10px] md:text-sm text-white font-bold opacity-90 py-2 md:py-0 gap-2 md:gap-0">
          <div className="hidden md:flex items-center gap-8">
            <span id="nav-topbar-phone" className="flex items-center gap-2 hover:text-vibrant-orange transition-all cursor-default gtm-topbar-phone">
              <Phone size={14} /> (47) 99768-0329
            </span>
            <span id="nav-topbar-email" className="flex items-center gap-2 hover:text-vibrant-orange transition-all cursor-default gtm-topbar-email">
              <Mail size={14} /> comercial06@krenke.com.br
            </span>
          </div>
          <div className="flex items-center gap-4 md:gap-6">
            <Link id="nav-topbar-reseller" to="/revendedor" className="px-3 py-1 bg-white/10 hover:bg-vibrant-orange text-[9px] md:text-[10px] rounded-full transition-all flex items-center gap-2 border border-white/20 hover:border-transparent uppercase tracking-widest whitespace-nowrap">
              <span className="w-1.5 h-1.5 bg-vibrant-orange rounded-full animate-pulse"></span>
              {t('nav.reseller')}
            </Link>
            <div className="w-px h-4 bg-white/20 mx-1"></div>
            <LanguageSelector />
            <div className="hidden md:flex w-px h-4 bg-white/20 mx-1"></div>
            <div className="hidden md:flex items-center gap-4">
              <a id="nav-topbar-social-instagram" href="https://www.instagram.com/krenkebrinquedos/" target="_blank" rel="noopener noreferrer" className="hover:text-vibrant-orange transition-all gtm-social-instagram-top"><Instagram size={18} /></a>
              <a id="nav-topbar-social-facebook" href="https://www.facebook.com/krenkebrinquedosoficial" target="_blank" rel="noopener noreferrer" className="hover:text-vibrant-orange transition-all gtm-social-facebook-top"><Facebook size={16} /></a>
              <a id="nav-topbar-social-youtube" href="https://www.youtube.com/@KrenkeBrinquedos" target="_blank" rel="noopener noreferrer" className="hover:text-vibrant-orange transition-all gtm-social-youtube-top"><Youtube size={18} /></a>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link id="nav-logo" to="/" className="flex-shrink-0 gtm-nav-logo group">
            <motion.img
              whileHover={{ scale: 1.05, rotate: -2 }}
              src={logoBranco}
              alt="Krenke Brinquedos"
              className={`transition-all duration-500 ${isScrolled ? 'h-10' : 'h-16'}`}
            />
          </Link>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center gap-10">
            {navItems.length > 0 ? (
                <>
                  {navItems.map((item, i) => {
                    if (item.label.toLowerCase() === 'produtos') {
                        return (
                            <div key={i} className="relative group">
                              <button id="nav-item-produtos-toggle" className="flex items-center gap-1 text-white font-black text-sm uppercase tracking-widest group-hover:text-vibrant-orange transition-all py-2">
                                {t('nav.products')} <ChevronDown size={14} className="group-hover:rotate-180 transition-transform" />
                              </button>
                              <div className="absolute top-full left-0 w-72 bg-krenke-purple/95 backdrop-blur-3xl rounded-3xl shadow-2xl py-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-4 group-hover:translate-y-0 border border-white/20">
                                {productCategories.map((cat, idx) => (
                                  <Link
                                    key={idx}
                                    to={`/produtos/categoria/${slugify(cat)}`}
                                    className="block px-8 py-3 text-white hover:bg-white/10 hover:text-vibrant-orange transition-colors gtm-nav-category"
                                    id={`nav-category-${slugify(cat)}`}
                                  >
                                    <TranslatableText className="font-bold">{cat}</TranslatableText>
                                  </Link>
                                ))}
                              </div>
                            </div>
                        );
                    }
                    if (item.isExternal) {
                        return (
                          <a
                            key={i}
                            href={item.path}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-white font-black text-sm uppercase tracking-widest hover:text-vibrant-orange transition-all relative group mx-2"
                            id={`nav-item-external-${slugify(item.label)}`}
                          >
                            {item.label}
                            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-vibrant-orange transition-all group-hover:w-full"></span>
                          </a>
                        );
                    }
                    return (
                      <Link
                        key={i}
                        to={item.path}
                        className="text-white font-black text-sm uppercase tracking-widest hover:text-vibrant-orange transition-all relative group mx-2"
                      >
                        <TranslatableText>{item.label}</TranslatableText>
                        <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-vibrant-orange transition-all group-hover:w-full"></span>
                      </Link>
                    );
                  })}
                </>
            ) : (
                <>
                    {['Home', 'Empresa'].map((item, i) => (
                      <Link
                        key={i}
                        to={item === 'Home' ? '/' : `/${item.toLowerCase()}`}
                        className="text-white font-black text-sm uppercase tracking-widest hover:text-vibrant-orange transition-all relative group mx-2"
                      >
                        {item}
                        <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-vibrant-orange transition-all group-hover:w-full"></span>
                      </Link>
                    ))}

                    <div className="relative group">
                      <button className="flex items-center gap-1 text-white font-black text-sm uppercase tracking-widest group-hover:text-vibrant-orange transition-all py-2">
                        Produtos <ChevronDown size={14} className="group-hover:rotate-180 transition-transform" />
                      </button>
                      <div className="absolute top-full left-0 w-72 bg-krenke-purple/95 backdrop-blur-3xl rounded-3xl shadow-2xl py-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-4 group-hover:translate-y-0 border border-white/20">
                        {productCategories.map((cat, idx) => (
                          <Link
                            key={idx}
                            to={`/produtos/categoria/${slugify(cat)}`}
                            className="block px-8 py-3 text-white hover:bg-white/10 hover:text-vibrant-orange transition-colors gtm-nav-category"
                          >
                            <span className="font-bold">{cat}</span>
                          </Link>
                        ))}
                      </div>
                    </div>

                    {[{ label: 'Trabalhe Conosco', path: '/trabalhe-conosco' }, { label: 'Catálogo', path: '/catalogo' }].map((item, i) => (
                      <Link
                        key={i}
                        to={item.path}
                        className="text-white font-black text-sm uppercase tracking-widest hover:text-vibrant-orange transition-all relative group mx-2"
                      >
                        {item.label}
                        <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-vibrant-orange transition-all group-hover:w-full"></span>
                      </Link>
                    ))}
                </>
            )}

            <Link id="nav-button-quote" to="/orcamento" className="px-8 py-3 bg-vibrant-orange text-white font-black uppercase text-sm tracking-tighter rounded-2xl hover:bg-orange-500 transition-all transform hover:scale-110 shadow-vibrant-orange gtm-nav-button-quote">
              {t('nav.quote')}
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden relative z-50">
            <button id="nav-mobile-menu-toggle" onClick={() => setIsOpen(!isOpen)} className="w-12 h-12 flex items-center justify-center bg-white/10 rounded-2xl backdrop-blur-md border border-white/20 text-white hover:text-vibrant-orange transition-all">
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            drag="x"
            dragConstraints={{ left: 0, right: 1000 }}
            dragElastic={{ left: 0, right: 0.2 }}
            onDragEnd={(_, info) => {
              if (info.offset.x > 100 || info.velocity.x > 500) setIsOpen(false);
            }}
            className="lg:hidden fixed inset-0 bg-krenke-purple z-[60] pt-24 px-6 overflow-hidden flex flex-col touch-none"
          >
            {/* Pull Indicator for Drag */}
            <div className="absolute left-0 top-0 bottom-0 w-4 bg-white/5 flex items-center justify-center">
                <div className="w-1 h-12 bg-white/20 rounded-full"></div>
            </div>

            <div className="flex flex-col gap-6 text-lg overflow-y-auto pb-20 custom-scrollbar">
              <div className="flex justify-between items-center mb-4">
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">Navegação</span>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-2 bg-white/10 rounded-xl text-white hover:text-vibrant-orange transition-all"
                >
                  <X size={24} />
                </button>
              </div>

              <Link id="nav-mobile-reseller" to="/revendedor" className="flex items-center gap-3 px-6 py-4 bg-white/5 rounded-2xl border border-white/10 text-white font-black uppercase text-sm tracking-widest">
                <span className="w-2 h-2 bg-vibrant-orange rounded-full animate-pulse"></span>
                Área do Revendedor
              </Link>
              {navItems.length > 0 ? (
                <>
                  {navItems.map((item, i) => {
                    if (item.label.toLowerCase() === 'produtos') {
                      return (
                        <div key={i}>
                          <button
                            onClick={() => setProductsOpen(!productsOpen)}
                            className="flex items-center justify-between w-full text-white font-medium border-b border-white/10 pb-4 gtm-nav-mobile-products-toggle"
                          >
                            {t('nav.products')} <ChevronDown size={20} className={`transform transition-transform ${productsOpen ? 'rotate-180' : ''}`} />
                          </button>
                          {productsOpen && (
                            <div className="pl-4 py-2 space-y-3 bg-black/10 rounded-lg mt-2">
                              {productCategories.map((cat, idx) => (
                                <Link
                                  key={idx}
                                  to={`/produtos/categoria/${slugify(cat)}`}
                                  className={`block text-gray-300 hover:text-krenke-orange text-sm gtm-nav-mobile-category-${cat.toLowerCase().replace(/\s+/g, '-')}`}
                                >
                                  <TranslatableText>{cat}</TranslatableText>
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    }
                    if (item.isExternal) {
                      return <a key={i} id={`nav-mobile-item-external-${slugify(item.label)}`} href={item.path} target="_blank" rel="noopener noreferrer" className="text-white font-medium border-b border-white/10 pb-4 block"><TranslatableText>{item.label}</TranslatableText></a>;
                    }
                    return <Link key={i} id={`nav-mobile-item-${slugify(item.label)}`} to={item.path} className="text-white font-medium border-b border-white/10 pb-4 block"><TranslatableText>{item.label}</TranslatableText></Link>;
                  })}
                </>
              ) : (
                <>
                  <Link to="/" className="text-white font-medium border-b border-white/10 pb-4 gtm-nav-mobile-home">{t('nav.home')}</Link>
                  <Link to="/empresa" className="text-white font-medium border-b border-white/10 pb-4 gtm-nav-mobile-about">{t('nav.about')}</Link>

                  <div>
                    <button
                      onClick={() => setProductsOpen(!productsOpen)}
                      className="flex items-center justify-between w-full text-white font-medium border-b border-white/10 pb-4 gtm-nav-mobile-products-toggle"
                    >
                      {t('nav.products')} <ChevronDown size={20} className={`transform transition-transform ${productsOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {productsOpen && (
                      <div className="pl-4 py-2 space-y-3 bg-black/10 rounded-lg mt-2">
                        {productCategories.map((cat, idx) => (
                          <Link
                            key={idx}
                            to={`/produtos/categoria/${slugify(cat)}`}
                            className={`block text-gray-300 hover:text-krenke-orange text-sm gtm-nav-mobile-category-${cat.toLowerCase().replace(/\s+/g, '-')}`}
                          >
                            <TranslatableText>{cat}</TranslatableText>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>

                  <Link to="/trabalhe-conosco" className="text-white font-medium border-b border-white/10 pb-4">Trabalhe Conosco</Link>
                  <Link to="/catalogo" className="text-white font-medium border-b border-white/10 pb-4 gtm-nav-mobile-catalogo">{t('nav.catalog')}</Link>
                </>
              )}
              <Link id="nav-mobile-button-quote" to="/orcamento" className="text-center py-4 bg-krenke-orange text-white font-bold rounded-xl shadow-lg gtm-nav-mobile-button-quote">
                {t('nav.quote')}
              </Link>

              <div className="text-center">
                <span className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em]">{i18n.language === 'pt' ? 'Seleção de Idioma' : 'Language Selection'}</span>
                <LanguageSelector isMobile />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const MapSection: React.FC = () => {
  const { i18n } = useTranslation();
  return (
    <section className="w-full h-[600px] relative mt-20 group overflow-hidden">
      {/* Brand Gradient Top Border */}
      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-vibrant-orange via-vibrant-purple to-vibrant-green z-20"></div>
      
      {/* Interactive Overlay Info */}
      <div className="absolute top-12 left-1/2 -translate-x-1/2 md:left-12 md:translate-x-0 z-20 pointer-events-none transition-all duration-700 group-hover:translate-y-[-4px]">
        <div className="bg-white/80 backdrop-blur-2xl p-8 rounded-[2.5rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] border border-white/50 flex flex-col gap-3 min-w-[280px]">
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-vibrant-orange animate-pulse"></span>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-vibrant-orange">{i18n.language === 'pt' ? 'Unidade Industrial' : 'Industrial Unit'}</span>
          </div>
          <h3 className="text-2xl font-black text-krenke-purple uppercase tracking-tighter leading-none">Guaramirim <span className="text-gray-400">/ SC</span></h3>
          <p className="text-xs font-bold text-gray-500 max-w-[200px] leading-relaxed">{i18n.language === 'pt' ? 'Rua Rodolfo Tepasse, 250' : '250 Rodolfo Tepasse St.'}<br/>{i18n.language === 'pt' ? 'Bairro Imigrantes - 89270-802' : 'Imigrantes District - 89270-802'}</p>
          
          <a 
            id="map-button-routes"
            href="https://www.google.com/maps/dir//Krenke+Brinquedos+-+Rua+Rodolfo+Tepasse,+250+-+Bairro+Imigrantes,+Guaramirim+-+SC,+89270-802/@-26.4766346,-49.0204915,17z/data=!4m8!4m7!1m0!1m5!1m1!1s0x94debfbf96483247:0x11141cad35244bf3!2m2!1d-49.0204915!2d-26.4766346" 
            target="_blank" 
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center justify-center gap-2 px-6 py-3 bg-krenke-purple text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-vibrant-orange transition-all pointer-events-auto shadow-xl"
          >
            {i18n.language === 'pt' ? 'Ver Rotas' : 'Get Directions'}
          </a>
        </div>
      </div>

      <div className="absolute inset-0 bg-krenke-purple/10 pointer-events-none z-10 transition-opacity duration-700 group-hover:opacity-0"></div>

      <iframe 
        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1262.6633279944717!2d-49.020491537090365!3d-26.47663456862512!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94debfbf96483247%3A0x11141cad35244bf3!2sKrenke%20Brinquedos!5e0!3m2!1spt-BR!2sbr!4v1776731735254!5m2!1spt-BR!2sbr" 
        width="100%" 
        height="100%" 
        style={{ border: 0 }} 
        allowFullScreen 
        loading="lazy" 
        referrerPolicy="no-referrer-when-downgrade"
        title="Localização Krenke Brinquedos"
        className="grayscale invert-[0.05] brightness-[1.02] contrast-[1.05] group-hover:grayscale-0 group-hover:invert-0 group-hover:brightness-100 group-hover:contrast-100 transition-all duration-1000 scale-105 group-hover:scale-100"
      ></iframe>
    </section>
  );
};

export const Footer: React.FC = () => {
  const { t, i18n } = useTranslation();
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
              {t('footer.bio')}
            </p>
            <div className="flex gap-4">
              <motion.a id="footer-social-facebook" href="https://www.facebook.com/krenkebrinquedosoficial" target="_blank" rel="noopener noreferrer" whileHover={{ y: -5, color: '#FF9F0A' }} className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 hover:bg-white/10 transition-all"><Facebook size={24} /></motion.a>
              <motion.a id="footer-social-instagram" href="https://www.instagram.com/krenkebrinquedos/" target="_blank" rel="noopener noreferrer" whileHover={{ y: -5, color: '#FF9F0A' }} className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 hover:bg-white/10 transition-all"><Instagram size={24} /></motion.a>
              <motion.a id="footer-social-youtube" href="https://www.youtube.com/@KrenkeBrinquedos" target="_blank" rel="noopener noreferrer" whileHover={{ y: -5, color: '#FF9F0A' }} className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 hover:bg-white/10 transition-all"><Youtube size={24} /></motion.a>
            </div>
          </div>

          {/* Quick Links Group */}
          <div className="lg:col-span-3">
            <h4 className="text-vibrant-orange font-black uppercase tracking-[0.2em] text-sm mb-10">Nossos Produtos</h4>
            <ul className="grid grid-cols-1 gap-4">
              {[
                { label: 'Home', path: '/' },
                { label: 'Empresa', path: '/empresa' },
                { label: 'Produtos', path: '/produtos' },
                { label: 'Trabalhe Conosco', path: '/trabalhe-conosco' },
                { label: 'Catálogo', path: '/catalogo' },
              ].map((item) => (
                <li key={item.label}>
                  <Link
                    to={item.path}
                    id={`footer-link-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                    className="text-gray-400 font-bold hover:text-white transition-colors flex items-center gap-2 group"
                  >
                    <span className="w-0 h-0.5 bg-vibrant-orange transition-all group-hover:w-4"></span>
                    {item.label}
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
                { Icon: Phone, text: "(47) 99768-0329", sub: "Matriz - Santa Catarina" },
                { Icon: Phone, text: "(81) 99831-2244", sub: "Filial - Nordeste" },
                { Icon: Mail, text: "comercial06@krenke.com.br", sub: "Suporte e Dúvidas" },
                { Icon: MapPin, text: "Guaramirim, SC", sub: "Sede de Produção" },
                { Icon: MapPin, text: "Palmares, PE", sub: "Filial Nordeste" }
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
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 border-t border-white/5 pt-12">
          <p className="text-gray-500 font-bold text-sm">
            © {new Date().getFullYear()} Krenke Brinquedos Pedagógicos LTDA. CNPJ: 80.125.305/0001-69 <span className="text-white/20 ml-2">Engenharia da Diversão.</span>
          </p>
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 text-xs font-black uppercase tracking-widest text-gray-500">
            <button
              onClick={() => { localStorage.removeItem('krenke-cookie-consent'); window.location.reload(); }}
              id="footer-button-cookies"
              className="hover:text-vibrant-orange transition-colors px-2 py-1"
            >
              Cookies
            </button>
            <Link id="footer-link-privacy" to="/politica-de-privacidade" className="hover:text-vibrant-orange transition-colors px-2 py-1">Privacidade</Link>
            <Link id="footer-link-terms" to="/termos-de-uso" className="hover:text-vibrant-orange transition-colors px-2 py-1">Termos</Link>
            <Link id="footer-link-reseller" to="/revendedor" className="hover:text-vibrant-orange transition-colors px-2 py-1">Área do Revendedor</Link>
            <Link id="footer-link-trabalhe-conosco" to="/trabalhe-conosco" className="hover:text-vibrant-orange transition-colors px-2 py-1">Trabalhe Conosco</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  return (
    <div className="flex flex-col min-h-screen font-sans text-gray-900 overflow-x-hidden">
      <SecurityGuard />
      <ScriptInjector />
      <Navbar />
      <main className="flex-grow pt-20 overflow-x-hidden">
        {children}
      </main>
      <WhatsAppWidget />
      {location.pathname === '/' && <MapSection />}
      <Footer />
      <CookieConsent />
    </div>
  );
};