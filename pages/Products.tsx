import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, Search, X, Plus, ShoppingCart, ChevronDown, ChevronUp, ArrowRight, Trash2 } from 'lucide-react';
import { useSearchParams, useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Product } from '../types';
import { supabase } from '../lib/supabase';
import { useTranslation } from 'react-i18next';
import { TranslatableText } from '../components/TranslatableText';

// High-performance image discovery via Vite Glob Import
const allAssets = import.meta.glob('../assets/**/*', { eager: true, query: '?url', import: 'default' });

const findProductAssets = (productName: string) => {
  if (!productName || productName.length < 3) return { main: '', gallery: [] as string[] };

  const normalize = (s: string) => s.toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\s-]+/g, '');

  const normalizedName = normalize(productName);
  const matches: string[] = [];

  Object.entries(allAssets).forEach(([path, url]) => {
    const normalizedPath = normalize(path);

    // Check if path contains the normalized name
    if (normalizedPath.includes(normalizedName)) {
      matches.push(url as string);
    }

    // Special mapping for LINHA TEMÁTICA to thematic folder
    if (normalizedName === 'linhatematica' && normalizedPath.includes('tematica2025')) {
      matches.push(url as string);
    }
  });

  // Sort to prioritize main product image (exact file name match)
  const sortedMatches = [...matches].sort((a, b) => {
    const aName = normalize(a.split('/').pop() || '');
    const bName = normalize(b.split('/').pop() || '');
    if (aName === normalizedName + '.webp' || aName === normalizedName + '.webp' || aName === normalizedName + '.webp') return -1;
    if (bName === normalizedName + '.webp' || bName === normalizedName + '.webp' || bName === normalizedName + '.webp') return 1;
    return 0;
  });

  return {
    main: sortedMatches.length > 0 ? sortedMatches[0] : '',
    gallery: sortedMatches
  };
};

// Removed static CATEGORIES array in favor of dynamic fetching

const CATEGORY_STYLES: Record<string, { color: string; bg: string }> = {
  'Playgrounds Completos': { color: 'vibrant-purple', bg: 'bg-vibrant-purple/10' },
  'Little Play': { color: 'pink-500', bg: 'bg-pink-500/10' },
  'Brinquedos Avulsos': { color: 'vibrant-cyan', bg: 'bg-vibrant-cyan/10' },
  'Linha Pet': { color: 'vibrant-green', bg: 'bg-vibrant-green/10' },
  'Mobiliário Urbano e Jardim': { color: 'vibrant-purple', bg: 'bg-vibrant-purple/10' },
  'LINHA TEMÁTICA': { color: 'vibrant-orange', bg: 'bg-vibrant-orange/10' },
  'Todos': { color: 'gray-500', bg: 'bg-gray-100' }
};

const ProductModal: React.FC<{
  product: Product | null;
  onClose: () => void;
  cart: string[];
  toggleCart: (id: string) => void;
}> = ({ product, onClose, cart, toggleCart }) => {
  const { i18n } = useTranslation();
  const [activeImage, setActiveImage] = useState<string>('');
  const [translatedSpecs, setTranslatedSpecs] = useState<string>('');

  useEffect(() => {
    if (product) {
      setActiveImage(product.image);
    }
  }, [product]);

  useEffect(() => {
    if (!product?.specs) { setTranslatedSpecs(''); return; }
    if (i18n.language === 'pt') { setTranslatedSpecs(product.specs); return; }
    import('../lib/i18n').then(({ translateText }) => {
      translateText(product.specs!, i18n.language).then(setTranslatedSpecs);
    });
  }, [product?.specs, i18n.language]);

  if (!product) return null;

  const inCart = cart.includes(product.id);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <Helmet>
          <title>{`${product.name} | Playground Krenke Certificado`}</title>
          <meta name="description" content={product.description?.substring(0, 160) || `Conheça o ${product.name} da Krenke. Um playground robusto, seguro e certificado pela ABNT para condomínios e escolas.`} />
          <link rel="canonical" href={`https://site.krenke.com.br/produtos?produto=${product.id}`} />
          <meta property="og:title" content={`${product.name} | Krenke Brinquedos`} />
          <meta property="og:description" content={product.description?.substring(0, 160) || `Playgrounds e parques infantis com tecnologia de ponta e segurança absoluta.`} />
          <meta property="og:image" content={product.image} />
          
          {/* JSON-LD Structured Data for Product */}
          <script type="application/ld+json">
            {JSON.stringify({
              "@context": "https://schema.org/",
              "@type": "Product",
              "name": product.name,
              "image": product.image,
              "description": product.description || `Playground de alta qualidade modelo ${product.id}`,
              "brand": {
                "@type": "Brand",
                "name": "Krenke"
              },
              "sku": product.id,
              "offers": {
                "@type": "Offer",
                "availability": "https://schema.org/InStock",
                "priceCurrency": "BRL",
                "url": `https://site.krenke.com.br/produtos?produto=${product.id}`
              }
            })}
          </script>
        </Helmet>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-krenke-purple/80 backdrop-blur-xl"
          onClick={onClose}
        ></motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 50 }}
          className="relative w-full max-w-[98vw] xl:max-w-[1600px] bg-white rounded-3xl md:rounded-[3rem] overflow-y-auto overflow-x-hidden shadow-premium h-[95vh] md:h-[90vh] custom-scrollbar"
        >
          {/* Close Button - Premium Floating Style */}
          <button
            onClick={onClose}
            className="fixed md:absolute top-8 right-8 z-[120] w-12 h-12 bg-gray-900/10 hover:bg-vibrant-orange backdrop-blur-md border border-black/5 md:border-white/20 rounded-2xl flex items-center justify-center text-gray-900 md:text-white transition-all shadow-xl"
          >
            <X size={28} />
          </button>

          {/* Wrapper for flex-row on desktop */}
          <div className="flex flex-col md:flex-row min-h-full">
            {/* Gallery Section */}
            <div className="md:w-1/2 p-4 pt-10 md:pt-14 md:px-8 md:pb-8 relative flex flex-col shrink-0">
              <div className="w-full flex items-start justify-center p-0 overflow-hidden relative group/hero">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={activeImage}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.1 }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    src={activeImage || product.image}
                    alt={`Playground Krenke - ${product.name}`}
                    loading="lazy"
                    decoding="async"
                    className="w-full max-w-full max-h-[400px] lg:max-h-[500px] xl:max-h-[650px] object-contain rounded-[2rem] bg-gray-50/50"
                  />
                </AnimatePresence>
              </div>

              {/* Thumbnails */}
              {product.images && product.images.length > 0 && (
                <div className="mt-4 md:mt-6">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-4 px-2"><TranslatableText>Galeria de Fotos</TranslatableText></p>
                  <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar px-2 snap-x">
                    {Array.from(new Set([product.image, ...(product.images || [])])).map((img, idx) => (
                      <motion.button
                        key={idx}
                        whileHover={{ y: -4 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setActiveImage(img)}
                        className={`relative w-20 h-20 md:w-24 md:h-24 flex-shrink-0 rounded-2xl overflow-hidden border-4 transition-all snap-start ${activeImage === img || (!activeImage && idx === 0)
                          ? 'border-vibrant-orange shadow-lg shadow-orange-500/20'
                          : 'border-white hover:border-slate-200'
                          }`}
                      >
                        <img src={img} alt="" loading="lazy" decoding="async" className="w-full h-full object-contain rounded-xl bg-gray-50" />
                        {activeImage === img && (
                          <div className="absolute inset-0 bg-vibrant-orange/10 flex items-center justify-center">
                            <div className="w-2 h-2 rounded-full bg-vibrant-orange animate-pulse" />
                          </div>
                        )}
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Content Section */}
            <div className="md:w-1/2 p-8 md:p-14 flex flex-col bg-white">
              <div className="mb-6">
                <span className={`px-4 py-1.5 rounded-full text-[10px] md:text-xs font-black uppercase tracking-widest ${CATEGORY_STYLES[product.category]?.bg || 'bg-krenke-purple/10'} text-${CATEGORY_STYLES[product.category]?.color || 'krenke-purple'}`}>
                  <TranslatableText>{product.category}</TranslatableText>
                </span>
              </div>

              <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-8 uppercase tracking-tighter leading-tight">
                <TranslatableText>{product.name}</TranslatableText>
              </h2>

              {/* Specifications Container */}
              <div className="tech-specs-table mb-12 relative flex flex-col">
                {product.specs ? (
                  <div
                    className="text-gray-700 leading-relaxed text-sm md:text-base tech-specs-container"
                    dangerouslySetInnerHTML={{ __html: translatedSpecs || product.specs }}
                  />
                ) : (
                  <div className="space-y-4">
                    <p className="text-base md:text-lg text-gray-500 font-medium leading-relaxed italic border-l-4 border-vibrant-orange pl-6">
                      <TranslatableText as="p">{product.description || 'Estamos preparando as especificações técnicas detalhadas para este item. Entre em contato para saber mais.'}</TranslatableText>
                    </p>
                  </div>
                )}
                
                {/* Seta contida no limite da tabela. Ela some ao final do scroll junto com a tabela */}
                <div className="sticky bottom-8 self-end z-[100] pointer-events-none mt-4 -mb-4 pr-2">
                  <div className="animate-bounce bg-vibrant-orange/90 backdrop-blur-md text-white p-3 rounded-full shadow-2xl hidden md:flex">
                     <ChevronDown size={28} strokeWidth={3} />
                  </div>
                </div>
              </div>

              <div className="mt-auto pt-8 border-t border-slate-50 space-y-4 relative z-10 bg-white">
                <button
                  className={`w-full py-6 rounded-2xl font-black text-lg uppercase tracking-widest transition-all shadow-xl flex items-center justify-center gap-4 hover:scale-[1.02] active:scale-95 ${
                    inCart 
                      ? 'bg-green-500 hover:shadow-green-500/20 text-white' 
                      : 'bg-vibrant-orange hover:shadow-orange-500/20 text-white'
                  }`}
                  onClick={() => toggleCart(product.id)}
                >
                  <ShoppingCart size={24} />
                  <TranslatableText>{inCart ? 'Adicionado ao Orçamento ✓' : 'Adicionar ao Orçamento'}</TranslatableText>
                </button>
                <div className="flex items-center justify-between opacity-40">
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Krenke Playgrounds © 2026</span>
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Ref: {product.id}</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export const ProductsPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { categoriaSlug } = useParams();
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>(['Todos', 'Playgrounds Completos', 'Little Play', 'Brinquedos Avulsos', 'Linha Pet', 'Mobiliário Urbano e Jardim', 'LINHA TEMÁTICA']);
  const [isCartExpanded, setIsCartExpanded] = useState(false);
  const [activeCategory, setActiveCategory] = useState('Todos');

  const [quoteCart, setQuoteCart] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('krenke_quote_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('krenke_quote_cart', JSON.stringify(quoteCart));
  }, [quoteCart]);

  const toggleCart = (productId: string) => {
    setQuoteCart(prev => 
      prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]
    );
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await supabase?.from('site_settings').select('value').eq('key', 'product_categories').single();
        if (data?.value) {
            const parsed = JSON.parse(data.value);
            if (!parsed.includes('Todos')) parsed.unshift('Todos');
            setCategories(parsed);
        }
      } catch (err) { }
    };
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    if (!supabase) {
      setProducts([]);
      setLoading(false);
      return;
    }
    try {
      const { data, error } = await supabase.from('products').select('*').order('name', { ascending: true });
      if (error) throw error;

      const rawProducts = data || [];

      // Post-process products to discover local images if database is missing them
      const processed = rawProducts.map(p => {
        const assets = findProductAssets(p.name);
        return {
          ...p,
          image: p.image || assets.main || 'https://via.placeholder.com/800x600?text=Krenke+Brinquedos',
          images: (p.images && p.images.length > 0) ? p.images : assets.gallery
        };
      });

      setProducts(processed);
    } catch (err) {
      // Fallback to empty if Supabase fails
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  const slugify = (text: string) => 
    text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');

  const getCategoryFromSlug = (slug: string) => {
    return categories.find(cat => slugify(cat) === slug) || 'Todos';
  };

  useEffect(() => {
    const categoryParam = searchParams.get('categoria');
    
    if (categoriaSlug) {
      const actualCategory = getCategoryFromSlug(categoriaSlug);
      setActiveCategory(actualCategory);
    } else if (categoryParam) {
      // Handle legacy/direct query params from Home showcase
      setActiveCategory(categoryParam);
    } else {
      setActiveCategory('Todos');
    }
  }, [categoriaSlug, searchParams, categories]);

  const handleCategoryChange = (cat: string) => {
    setActiveCategory(cat);
    if (cat === 'Todos') {
      navigate('/produtos');
    } else {
      navigate(`/produtos/categoria/${slugify(cat)}`);
    }
  };

  const selectedProduct = useMemo(() => {
    const idParam = searchParams.get('produto')?.toLowerCase();
    return products.find(p => p.id?.toLowerCase() === idParam) || null;
  }, [searchParams, products]);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesCategory = activeCategory === 'Todos' || p.category === activeCategory;
      const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || (p.id && p.id.toLowerCase().includes(search.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [products, activeCategory, search]);

  return (
    <div className="bg-slate-50 min-h-screen pb-32 overflow-x-hidden">
      <Helmet>
        <title>{activeCategory === 'Todos' ? 'Playgrounds e Parques Infantis | Fábrica Krenke' : `${activeCategory} | Catálogo Krenke`}</title>
        <meta name="description" content={`Explore nossa linha de ${activeCategory}. Qualidade e segurança em playgrounds certificados para escolas, condomínios e praças.`} />
        <link rel="canonical" href={`https://site.krenke.com.br/produtos${activeCategory !== 'Todos' ? `/categoria/${slugify(activeCategory)}` : ''}`} />
      </Helmet>
      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={() => setSearchParams(prev => { prev.delete('produto'); return prev; })}
          cart={quoteCart}
          toggleCart={toggleCart}
        />
      )}

      {/* Hero Banner */}
      <div className="relative h-[450px] md:h-[550px] overflow-hidden flex items-center bg-krenke-purple px-4">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-krenke-purple via-vibrant-purple to-vibrant-orange opacity-40 mix-blend-overlay"></div>
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.webp')] opacity-10"></div>
        </div>

        <div className="relative z-10 max-w-[85%] mx-auto w-full">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col items-start"
          >
            <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 text-white text-xs font-black uppercase tracking-[0.3em] mb-8">
              <span className="w-2 h-2 rounded-full bg-vibrant-orange animate-pulse shadow-vibrant-orange"></span>
              <TranslatableText>{activeCategory === 'Todos' ? 'Linha Completa 2026' : `Linha ${activeCategory} 2026`}</TranslatableText>
            </div>

            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white leading-[0.85] tracking-tighter mb-8 uppercase drop-shadow-2xl">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-vibrant-orange via-yellow-400 to-vibrant-orange bg-[length:200%_auto] animate-gradient-x">
                <TranslatableText>{activeCategory === 'Todos' ? 'DIVERSÃO' : activeCategory}</TranslatableText>
              </span>
            </h1>

            <div className="h-3 w-32 bg-vibrant-orange rounded-full shadow-vibrant-orange"></div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-[85%] mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-20">
        <div className="bg-white rounded-[3rem] shadow-premium p-6 md:p-12 flex flex-col md:flex-row gap-8 items-center justify-between border border-slate-100">
          <div className="relative w-full md:w-1/2">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-vibrant-orange" size={24} />
            <input
              type="text"
              id="form-products-search"
              placeholder="Pesquisar Parques, Playgrounds ou Código..."
              className="w-full pl-16 pr-8 py-6 bg-slate-50 border-2 border-transparent focus:border-vibrant-orange rounded-3xl font-black text-gray-900 outline-none transition-all placeholder:text-gray-300"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {/* Mobile Category Indicator */}
            <div className="lg:hidden mt-4 flex items-center gap-2 px-4">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400"><TranslatableText>Filtrando:</TranslatableText></span>
              <span className="text-[11px] font-black uppercase tracking-wider text-vibrant-orange bg-orange-50 px-3 py-1 rounded-full border border-orange-100/50">
                <TranslatableText>{activeCategory}</TranslatableText>
              </span>
            </div>
          </div>

          <div className="hidden md:flex gap-4">
            <div className="flex flex-col items-end text-right">
              <span className="text-[10px] font-black uppercase text-gray-300 tracking-widest leading-none mb-1"><TranslatableText>Mostrando</TranslatableText></span>
              <span className="text-2xl font-black text-krenke-purple uppercase leading-none">{filteredProducts.length} {t('products.items')}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[85%] mx-auto px-4 sm:px-6 lg:px-8 py-20 flex flex-col lg:flex-row gap-16">
        <aside className="hidden lg:block w-80 shrink-0 sticky top-28 h-fit">
          <h3 className="text-xs font-black uppercase tracking-[0.3em] text-gray-400 mb-8 px-4 flex items-center gap-3">
            <Filter size={14} className="text-vibrant-orange" /> {t('products.filter')}
          </h3>
          <div className="space-y-4">
            {categories.map(cat => (
              <button
                key={cat}
                id={`btn-products-filter-${slugify(cat)}`}
                onClick={() => handleCategoryChange(cat)}
                className={`w-full text-left px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-tighter transition-all ${activeCategory === cat ? 'bg-krenke-purple text-white shadow-xl' : 'text-gray-500 hover:bg-slate-100'}`}
              >
                <TranslatableText>{cat}</TranslatableText>
              </button>
            ))}
          </div>
        </aside>

        <main className="flex-1">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 text-center">{t('common.loading')}</div>
          ) : filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-12">
              {filteredProducts.map((product, idx) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: (idx % 3) * 0.1 }}
                  className="group"
                  onClick={() => setSearchParams({ ...Object.fromEntries(searchParams), produto: product.id })}
                >
                  <div 
                    key={product.id}
                    id={`btn-product-card-${product.id}`}
                    onClick={() => setSearchParams({ ...Object.fromEntries(searchParams), produto: product.id })}
                    className="bg-white rounded-[2.5rem] overflow-hidden shadow-premium border border-slate-100 cursor-pointer flex flex-col transform transition-all duration-500 hover:-translate-y-4 hover:shadow-2xl h-full group"
                  >
                    <div className="relative aspect-square p-2 md:p-4 bg-transparent flex items-center justify-center overflow-hidden">
                      <img
                        src={product.image}
                        alt={`Playground Krenke - ${product.name}`}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-contain rounded-[2rem] transition-transform duration-700 group-hover:scale-[1.05]"
                      />
                    </div>

                    <div className="p-6 md:p-8 flex flex-col items-start text-left flex-grow">
                      {/* Product Category Label */}
                      <span className="text-[10px] md:text-[11px] font-black uppercase tracking-widest text-vibrant-orange mb-3 bg-orange-50 px-3 py-1 rounded-full">
                        <TranslatableText>{product.category}</TranslatableText>
                      </span>

                      {/* Title & Ref */}
                      <h3 className="text-2xl md:text-[32px] font-black text-[#332984] uppercase tracking-tighter leading-none mb-1 group-hover:text-vibrant-orange transition-colors">
                        <TranslatableText>{product.name}</TranslatableText>
                      </h3>
                      <span className="text-[13px] font-bold text-slate-400 mb-8 tracking-wide">
                        REF: {product.id}
                      </span>

                      {/* Action Button */}
                      <div className="mt-auto w-full pt-5 border-t border-slate-100 flex items-center justify-between group/btn">
                        <span className="text-sm font-black uppercase tracking-widest text-slate-800 group-hover:text-vibrant-orange transition-colors">
                          {t('common.explore')}
                        </span>
                        <div className="w-12 h-12 rounded-full bg-slate-50 group-hover:bg-vibrant-orange flex items-center justify-center text-[#332984] group-hover:text-white transition-all duration-300 shadow-sm border border-slate-200 group-hover:border-vibrant-orange group-hover:-rotate-45">
                          <ArrowRight size={22} strokeWidth={2.5} />
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-40 bg-white rounded-[3rem] shadow-premium border-2 border-dashed border-slate-100">
              <h3 className="text-2xl font-black text-gray-900 uppercase"><TranslatableText>Nada Encontrado</TranslatableText></h3>
              <button id="btn-products-clear-filters" onClick={() => { setSearch(''); handleCategoryChange('Todos'); }} className="mt-8 px-10 py-4 bg-krenke-purple text-white font-black rounded-2xl"><TranslatableText>Limpar Filtros</TranslatableText></button>
            </div>
          )}
        </main>
      </div>

      <AnimatePresence>
        {quoteCart.length > 0 && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[90] flex flex-col gap-4"
          >
            {/* Expanded List Panel */}
            <AnimatePresence>
              {isCartExpanded && (
                <motion.div
                  initial={{ opacity: 0, y: 50, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 50, scale: 0.95 }}
                  className="bg-white rounded-3xl shadow-2xl border-2 border-slate-100 overflow-hidden w-[90vw] md:w-auto md:min-w-[400px] max-w-[500px] mb-2 mx-auto"
                >
                  <div className="bg-slate-50 p-4 border-b border-slate-100 flex justify-between items-center">
                    <h4 className="font-black text-sm uppercase tracking-widest text-[#332984]"><TranslatableText>Itens Selecionados</TranslatableText></h4>
                    <button 
                      id="btn-cart-clear"
                      onClick={() => setQuoteCart([])} 
                      className="text-red-500 hover:bg-red-100 p-2 rounded-xl transition-all flex items-center justify-center"
                      title="Limpar Orçamento"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                  <div className="max-h-[300px] overflow-y-auto p-2 custom-scrollbar">
                    {quoteCart.map(productId => {
                      const product = products.find(p => p.id === productId);
                      if (!product) return null;
                      return (
                        <div key={product.id} className="flex gap-3 items-center p-2 hover:bg-slate-50 rounded-xl transition-all">
                          <img src={product.image} alt="" loading="lazy" decoding="async" className="w-12 h-12 rounded-lg bg-white object-contain border border-slate-100 flex-shrink-0" />
                          <div className="flex-1 min-w-0 pr-2">
                            <p className="text-xs font-black truncate text-gray-900 leading-tight"><TranslatableText>{product.name}</TranslatableText></p>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest truncate"><TranslatableText>{product.category}</TranslatableText></p>
                          </div>
                          <button 
                            id={`btn-cart-remove-${product.id}`}
                            onClick={() => toggleCart(product.id)} 
                            className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg transition-all"
                            title="Remover Item"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Main Bar */}
            <div className="bg-white rounded-[2rem] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.25)] border-2 border-slate-100 flex items-center justify-between p-2 pl-6 gap-6 md:gap-12 min-w-[320px] mx-auto cursor-pointer" onClick={() => setIsCartExpanded(!isCartExpanded)}>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-vibrant-orange/10 flex items-center justify-center text-vibrant-orange relative z-10 transition-transform group-hover:scale-110">
                    <ShoppingCart size={22} />
                  </div>
                  <motion.div 
                    key={quoteCart.length}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-2 -right-2 bg-green-500 text-white text-[10px] font-black w-6 h-6 rounded-full flex items-center justify-center border-2 border-white z-20 shadow-lg"
                  >
                    {quoteCart.length}
                  </motion.div>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase tracking-widest text-vibrant-orange flex items-center gap-1">
                    <TranslatableText>Itens no</TranslatableText> {isCartExpanded ? <ChevronDown size={12}/> : <ChevronUp size={12}/>}
                  </span>
                  <span className="text-base font-black text-gray-900 leading-none"><TranslatableText>Orçamento</TranslatableText></span>
                </div>
              </div>
              <button 
                id="btn-cart-finish"
                onClick={(e) => { e.stopPropagation(); window.location.href = '/orcamento'; }}
                className="px-8 py-4 bg-gray-900 text-white rounded-3xl font-black text-sm uppercase tracking-widest hover:scale-105 hover:bg-vibrant-orange transition-all shadow-xl flex items-center gap-2"
              >
                <TranslatableText>Finalizar</TranslatableText> <ArrowRight size={18} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProductsPage;