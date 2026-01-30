import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, Search, ChevronRight, X, Plus, ShoppingCart } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { Product } from '../types';
import productsData from '../products.json';
import { supabase } from '../lib/supabase';

const CATEGORIES = [
  'Todos',
  'Playgrounds Completos',
  'Little Play',
  'Brinquedos Avulsos',
  'Linha Pet',
  'Mobiliário Urbano e Jardim',
  'LINHA TEMÁTICA'
];

const CATEGORY_STYLES: Record<string, { color: string; bg: string }> = {
  'Playgrounds Completos': { color: 'vibrant-purple', bg: 'bg-vibrant-purple/10' },
  'Little Play': { color: 'pink-500', bg: 'bg-pink-500/10' },
  'Brinquedos Avulsos': { color: 'vibrant-cyan', bg: 'bg-vibrant-cyan/10' },
  'Linha Pet': { color: 'vibrant-green', bg: 'bg-vibrant-green/10' },
  'Mobiliário Urbano e Jardim': { color: 'vibrant-purple', bg: 'bg-vibrant-purple/10' },
  'LINHA TEMÁTICA': { color: 'vibrant-orange', bg: 'bg-vibrant-orange/10' },
  'Todos': { color: 'gray-500', bg: 'bg-gray-100' }
};

const ProductModal: React.FC<{ product: Product | null; onClose: () => void }> = ({ product, onClose }) => {
  const [activeImage, setActiveImage] = useState<string>('');

  useEffect(() => {
    if (product) {
      setActiveImage(product.image);
      const originalTitle = document.title;
      document.title = `${product.name} | Krenke Brinquedos`;
      return () => { document.title = originalTitle; };
    }
  }, [product]);

  if (!product) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
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
          className="relative w-full max-w-6xl bg-white rounded-[3rem] overflow-hidden shadow-premium flex flex-col md:flex-row h-[90vh] md:h-auto max-h-[90vh]"
        >
          <button
            onClick={onClose}
            className="absolute top-6 right-6 z-20 w-12 h-12 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl flex items-center justify-center text-white hover:bg-vibrant-orange transition-all"
          >
            <X size={24} />
          </button>

          {/* Gallery Section */}
          <div className="md:w-1/2 p-8 bg-slate-50 relative flex flex-col h-full">
            <div className="flex-grow flex items-center justify-center bg-white rounded-[2.5rem] p-10 shadow-premium border border-slate-100 overflow-hidden relative group/hero">
              <AnimatePresence mode="wait">
                <motion.img
                  key={activeImage}
                  initial={{ opacity: 0, scale: 0.9, rotate: -2 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  exit={{ opacity: 0, scale: 1.1, rotate: 2 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  src={activeImage || product.image}
                  alt={product.name}
                  className="max-w-full max-h-[400px] object-contain drop-shadow-2xl"
                />
              </AnimatePresence>
            </div>

            {/* Thumbnails */}
            {product.images && product.images.length > 0 && (
              <div className="mt-8">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-300 mb-4 px-2">Galeria de Fotos</p>
                <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar px-2 snap-x">
                  {Array.from(new Set([product.image, ...(product.images || [])])).map((img, idx) => (
                    <motion.button
                      key={idx}
                      whileHover={{ y: -4 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setActiveImage(img)}
                      className={`relative w-24 h-24 flex-shrink-0 rounded-2xl overflow-hidden border-4 transition-all snap-start ${activeImage === img || (!activeImage && idx === 0)
                        ? 'border-vibrant-orange shadow-lg shadow-orange-500/20'
                        : 'border-transparent hover:border-slate-200'
                        }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
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

          <div className="md:w-1/2 p-12 overflow-y-auto flex flex-col">
            <div className="mb-6">
              <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest ${CATEGORY_STYLES[product.category]?.bg} text-${CATEGORY_STYLES[product.category]?.color}`}>
                {product.category}
              </span>
            </div>

            <h2 className="text-4xl font-black text-gray-900 mb-8 uppercase tracking-tighter leading-none">
              {product.name}
            </h2>

            <div className="prose prose-slate tech-specs-table max-w-none mb-12 flex-grow overflow-y-auto custom-scrollbar">
              {product.specs ? (
                <div
                  className="text-gray-700 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: product.specs }}
                />
              ) : (
                <p className="text-lg text-gray-400 font-medium leading-relaxed italic border-l-4 border-vibrant-orange pl-6">
                  {product.description}
                </p>
              )}
            </div>

            <div className="space-y-4">
              <button
                className="w-full bg-vibrant-orange py-5 rounded-2xl text-white font-black uppercase tracking-tighter flex items-center justify-center gap-4 hover:shadow-vibrant-orange transition-all hover:scale-[1.02]"
                onClick={() => window.location.href = `/orcamento?produto=${encodeURIComponent(product.id)}`}
              >
                <ShoppingCart size={24} />
                Solicitar Orçamento
              </button>
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Ref: {product.id}</span>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

const ProductsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [search, setSearch] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    setLoading(true);
    if (!supabase) {
      setProducts(productsData as Product[]);
      setLoading(false);
      return;
    }
    try {
      const { data, error } = await supabase.from('products').select('*').order('name', { ascending: true });
      if (error) throw error;
      setProducts(data && data.length > 0 ? data : (productsData as Product[]));
    } catch (err) {
      setProducts(productsData as Product[]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  useEffect(() => {
    const categoryParam = searchParams.get('categoria');
    setActiveCategory(categoryParam && CATEGORIES.includes(categoryParam) ? categoryParam : 'Todos');
  }, [searchParams]);

  const handleCategoryChange = (cat: string) => {
    setActiveCategory(cat);
    setSearchParams(prev => {
      if (cat === 'Todos') prev.delete('categoria');
      else prev.set('categoria', cat);
      return prev;
    });
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
      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={() => setSearchParams(prev => { prev.delete('produto'); return prev; })}
        />
      )}

      {/* Hero Banner */}
      <div className="relative h-[450px] md:h-[550px] overflow-hidden flex items-center bg-krenke-purple px-4">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-krenke-purple via-vibrant-purple to-vibrant-orange opacity-40 mix-blend-overlay"></div>
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto w-full">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col items-start"
          >
            <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 text-white text-xs font-black uppercase tracking-[0.3em] mb-8">
              <span className="w-2 h-2 rounded-full bg-vibrant-orange animate-pulse shadow-vibrant-orange"></span>
              Linha Completa 2026
            </div>

            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white leading-[0.85] tracking-tighter mb-8 uppercase drop-shadow-2xl">
              MUNDO DE <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-vibrant-orange via-yellow-400 to-vibrant-orange bg-[length:200%_auto] animate-gradient-x">DIVERSÃO</span>
            </h1>

            <div className="h-3 w-32 bg-vibrant-orange rounded-full shadow-vibrant-orange"></div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-20">
        <div className="bg-white rounded-[3rem] shadow-premium p-6 md:p-12 flex flex-col md:flex-row gap-8 items-center justify-between border border-slate-100">
          <div className="relative w-full md:w-1/2">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-vibrant-orange" size={24} />
            <input
              type="text"
              placeholder="Pesquise por nome ou código..."
              className="w-full pl-16 pr-8 py-6 bg-slate-50 border-2 border-transparent focus:border-vibrant-orange rounded-3xl font-black text-gray-900 outline-none transition-all placeholder:text-gray-300"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="hidden md:flex gap-4">
            <div className="flex flex-col items-end text-right">
              <span className="text-[10px] font-black uppercase text-gray-300 tracking-widest leading-none mb-1">Mostrando</span>
              <span className="text-2xl font-black text-krenke-purple uppercase leading-none">{filteredProducts.length} Itens</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 flex flex-col lg:flex-row gap-16">
        <aside className="hidden lg:block w-80 shrink-0 sticky top-28 h-fit">
          <h3 className="text-xs font-black uppercase tracking-[0.3em] text-gray-400 mb-8 px-4 flex items-center gap-3">
            <Filter size={14} className="text-vibrant-orange" /> Filtrar por Categoria
          </h3>
          <div className="space-y-4">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                className={`w-full text-left px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-tighter transition-all ${activeCategory === cat ? 'bg-krenke-purple text-white shadow-xl' : 'text-gray-500 hover:bg-slate-100'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </aside>

        <main className="flex-1">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 text-center">Carregando...</div>
          ) : filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
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
                  <div className="bg-white rounded-[2rem] overflow-hidden shadow-premium border border-slate-100 cursor-pointer flex flex-col transform transition-all duration-500 hover:-translate-y-4 h-full">
                    <div className="relative aspect-[4/3] p-2 bg-slate-50 flex items-center justify-center overflow-hidden">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-[110%] h-[110%] object-contain transition-transform duration-700 group-hover:scale-115"
                      />
                    </div>

                    <div className="p-8 flex flex-col items-center text-center flex-grow">
                      <h3 className="text-xl font-black text-gray-900 uppercase tracking-tighter mb-4 group-hover:text-vibrant-orange transition-colors">
                        {product.name}
                      </h3>
                      <div className="mt-auto w-full pt-6 border-t border-slate-50 flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">Ref: {product.id}</span>
                        <div className="w-10 h-10 rounded-xl bg-slate-900 group-hover:bg-vibrant-orange flex items-center justify-center text-white transition-all shadow-lg">
                          <Plus size={20} />
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-40 bg-white rounded-[3rem] shadow-premium border-2 border-dashed border-slate-100">
              <h3 className="text-2xl font-black text-gray-900 uppercase">Nada Encontrado</h3>
              <button onClick={() => { setSearch(''); handleCategoryChange('Todos'); }} className="mt-8 px-10 py-4 bg-krenke-purple text-white font-black rounded-2xl">Limpar Filtros</button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default ProductsPage;