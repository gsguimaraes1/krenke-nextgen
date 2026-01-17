import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Phone, Mail, MapPin, Facebook, Instagram, Youtube, ChevronDown } from 'lucide-react';
import logoBranco from '../assets/Logos/logo branco_krenke.png';
import logoMarcaBranco from '../assets/Logos/krenke_marca_em_branco.png';

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
    <nav className={`fixed w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-krenke-purple shadow-xl py-2' : 'bg-krenke-purple py-4'}`}>
      {/* Top Bar - Hidden on mobile */}
      <div className={`hidden lg:block border-b border-white/10 ${isScrolled ? 'h-0 overflow-hidden border-none' : 'h-10 mb-2'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex justify-between items-center text-sm text-gray-200">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-2 hover:text-white transition-colors gtm-topbar-phone"><Phone size={14} /> (47) 3373-0693</span>
            <span className="flex items-center gap-2 hover:text-white transition-colors gtm-topbar-email"><Mail size={14} /> contato@krenke.com.br</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-krenke-orange transition-colors gtm-social-instagram-top"><Instagram size={16} /></a>
            <a href="#" className="hover:text-krenke-orange transition-colors gtm-social-facebook-top"><Facebook size={16} /></a>
            <a href="#" className="hover:text-krenke-orange transition-colors gtm-social-youtube-top"><Youtube size={16} /></a>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0 gtm-nav-logo">
            <img
              src={logoBranco}
              alt="Krenke Brinquedos"
              className={`transition-all duration-300 ${isScrolled ? 'h-10' : 'h-14'}`}
            />
          </Link>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center gap-8">
            <Link to="/" className="text-white font-medium hover:text-krenke-orange transition-colors gtm-nav-link-home">Home</Link>
            <Link to="/about" className="text-white font-medium hover:text-krenke-orange transition-colors gtm-nav-link-about">Empresa</Link>

            {/* Products Dropdown */}
            <div className="relative group">
              <button
                className="flex items-center gap-1 text-white font-medium group-hover:text-krenke-orange transition-colors py-2 gtm-nav-dropdown-products"
              >
                Produtos <ChevronDown size={16} />
              </button>
              <div className="absolute top-full left-0 w-64 bg-white rounded-xl shadow-2xl py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 border-t-4 border-krenke-orange">
                {productCategories.map((cat, idx) => (
                  <Link
                    key={idx}
                    to={`/products?category=${encodeURIComponent(cat)}`}
                    className={`block px-6 py-3 text-gray-700 hover:bg-orange-50 hover:text-krenke-orange transition-colors border-b border-gray-50 last:border-none gtm-nav-category-${cat.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    {cat}
                  </Link>
                ))}
              </div>
            </div>


            <Link to="/downloads" className="text-white font-medium hover:text-krenke-orange transition-colors gtm-nav-link-downloads">Downloads</Link>
            <Link to="/projects" className="text-white font-medium hover:text-krenke-orange transition-colors gtm-nav-link-projects">Projetos</Link>

            <Link to="/quote" className="px-6 py-2.5 bg-krenke-orange text-white font-bold rounded-full hover:bg-orange-500 transition-all transform hover:scale-105 shadow-lg shadow-orange-900/20 gtm-nav-button-quote">
              Orçamento
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="text-white hover:text-krenke-orange transition-colors">
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`lg:hidden fixed inset-0 bg-krenke-purple z-40 transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'} pt-24 px-6`}>
        <div className="flex flex-col gap-6 text-lg">
          <Link to="/" className="text-white font-medium border-b border-white/10 pb-4 gtm-nav-mobile-home">Home</Link>
          <Link to="/about" className="text-white font-medium border-b border-white/10 pb-4 gtm-nav-mobile-about">Empresa</Link>

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
                    to={`/products?category=${encodeURIComponent(cat)}`}
                    className={`block text-gray-300 hover:text-krenke-orange text-sm gtm-nav-mobile-category-${cat.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    {cat}
                  </Link>
                ))}
              </div>
            )}
          </div>



          <Link to="/downloads" className="text-white font-medium border-b border-white/10 pb-4 gtm-nav-mobile-downloads">Downloads</Link>
          <Link to="/projects" className="text-white font-medium border-b border-white/10 pb-4 gtm-nav-mobile-projects">Projetos</Link>
          <Link to="/quote" className="text-center py-4 bg-krenke-orange text-white font-bold rounded-xl shadow-lg gtm-nav-mobile-button-quote">
            Solicitar Orçamento
          </Link>
        </div>
      </div>
    </nav>
  );
};

export const Footer: React.FC = () => {
  return (
    <footer className="bg-krenke-purple text-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          <div className="space-y-6">
            <img src={logoMarcaBranco} alt="Krenke" className="h-12" />
            <p className="text-gray-300 leading-relaxed">
              Diversão, segurança e confiabilidade são sinônimos dos produtos da Krenke Brinquedos. O melhor jeito de brincar!
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-krenke-orange transition-colors gtm-social-instagram-footer">
                <Instagram size={20} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-krenke-orange transition-colors gtm-social-facebook-footer">
                <Facebook size={20} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-krenke-orange transition-colors gtm-social-youtube-footer">
                <Youtube size={20} />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-6 border-l-4 border-krenke-orange pl-4 gtm-footer-title-menu">Menu Rápido</h3>
            <ul className="space-y-3 text-gray-300">
              <li><Link to="/" className="hover:text-krenke-orange transition-colors gtm-footer-link-home">Home</Link></li>
              <li><Link to="/about" className="hover:text-krenke-orange transition-colors gtm-footer-link-about">Empresa</Link></li>
              <li><Link to="/products" className="hover:text-krenke-orange transition-colors gtm-footer-link-products">Produtos</Link></li>

              <li><Link to="/quote" className="hover:text-krenke-orange transition-colors gtm-footer-link-quote">Orçamento</Link></li>
              <li><a href="#" className="hover:text-krenke-orange transition-colors gtm-footer-link-privacy">Política de privacidade</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-6 border-l-4 border-krenke-orange pl-4 gtm-footer-title-contact">Contato</h3>
            <ul className="space-y-4 text-gray-300">
              <li className="flex items-center gap-3 gtm-footer-contact-phone-1"><Phone className="text-krenke-orange" size={20} /> (47) 3373-0693</li>
              <li className="flex items-center gap-3 gtm-footer-contact-phone-2"><Phone className="text-krenke-orange" size={20} /> (47) 3373-0893</li>
              <li className="flex items-center gap-3 gtm-footer-contact-whatsapp"><div className="bg-green-500 p-1 rounded-full"><Phone size={12} className="text-white" /></div> (47) 98803-3068</li>
              <li className="flex items-center gap-3 gtm-footer-contact-email"><Mail className="text-krenke-orange" size={20} /> contato@krenke.com.br</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-6 border-l-4 border-krenke-orange pl-4">Endereços</h3>
            <ul className="space-y-4 text-gray-300 text-sm">
              <li className="flex gap-3">
                <MapPin className="text-krenke-orange flex-shrink-0" size={20} />
                <span>Matriz: Rodolfo Tepassé, 250 - Imigrantes - Guaramirim | SC</span>
              </li>
              <li className="flex gap-3">
                <MapPin className="text-krenke-orange flex-shrink-0" size={20} />
                <span>Filial Nordeste: BR 101 - Km 86 - São Sebastião - Palmares | PE</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 text-center text-gray-400 text-sm">
          <p>&copy; 2026 Krenke Brinquedos Pedagógicos LTDA - CNPJ 80.125.305/0001-88. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen font-sans text-gray-900">
      <Navbar />
      <main className="flex-grow pt-20">
        {children}
      </main>
      <Footer />
    </div>
  );
};