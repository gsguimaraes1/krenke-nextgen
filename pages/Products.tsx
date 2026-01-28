import React, { useState, useEffect, useMemo } from 'react';
import { Filter, Search, Download, ChevronRight, X, Plus } from 'lucide-react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { Product } from '../types';
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

const CATEGORY_STYLES: Record<string, { text: string; bg: string; dot: string }> = {
  'Playgrounds Completos': { text: 'text-krenke-logo-blue', bg: 'bg-krenke-logo-blue/10', dot: 'bg-krenke-logo-blue' },
  'Little Play': { text: 'text-krenke-logo-pink', bg: 'bg-krenke-logo-pink/10', dot: 'bg-krenke-logo-pink' },
  'Brinquedos Avulsos': { text: 'text-krenke-logo-cyan', bg: 'bg-krenke-logo-cyan/10', dot: 'bg-krenke-logo-cyan' },
  'Linha Pet': { text: 'text-krenke-logo-green', bg: 'bg-krenke-logo-green/10', dot: 'bg-krenke-logo-green' },
  'Mobiliário Urbano e Jardim': { text: 'text-krenke-logo-purple', bg: 'bg-krenke-logo-purple/10', dot: 'bg-krenke-logo-purple' },
  'LINHA TEMÁTICA': { text: 'text-krenke-logo-orange', bg: 'bg-krenke-logo-orange/10', dot: 'bg-krenke-logo-orange' },
  'Todos': { text: 'text-gray-600', bg: 'bg-gray-100', dot: 'bg-gray-400' }
};

const ProductModal: React.FC<{ product: Product | null; onClose: () => void }> = ({ product, onClose }) => {
  const [activeImage, setActiveImage] = useState<string>('');

  useEffect(() => {
    if (product) {
      setActiveImage(product.image);
      const originalTitle = document.title;
      document.title = `${product.name} | Krenke Brinquedos`;
      return () => {
        document.title = originalTitle;
      };
    }
  }, [product]);

  if (!product) return null;

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-black/70 transition-opacity" aria-hidden="true" onClick={onClose}></div>
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div className="relative inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-5xl sm:w-full animate-fade-in-up">
          <div className="absolute top-4 right-4 z-10">
            <button onClick={onClose} className="bg-white/80 hover:bg-white text-gray-400 hover:text-gray-500 rounded-full p-2 focus:outline-none backdrop-blur-sm shadow-sm gtm-modal-close">
              <X size={24} />
            </button>
          </div>

          <div className="grid md:grid-cols-2">
            {/* Left: Image Gallery */}
            <div className="bg-gray-100 p-6 md:p-8 flex flex-col h-full">
              <div className="flex-grow flex items-center justify-center bg-white rounded-xl overflow-hidden shadow-inner mb-4 border border-gray-200 aspect-square">
                <img
                  src={activeImage || product.image || 'https://via.placeholder.com/600?text=Sem+Imagem'}
                  alt={product.name}
                  className="max-w-full max-h-full object-contain"
                />
              </div>
              {product.images && product.images.length > 0 && (
                <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                  {/* Incluir a imagem principal na galeria também se não estiver lá */}
                  {[product.image, ...(product.images || [])].filter((v, i, a) => v && a.indexOf(v) === i).map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImage(img)}
                      className={`w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${activeImage === img ? 'border-krenke-orange' : 'border-transparent hover:border-gray-300'}`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Info */}
            <div className="p-6 md:p-10 flex flex-col h-full overflow-y-auto max-h-[80vh] md:max-h-[90vh]">
              <div className="mb-2">
                <span className="inline-block py-1 px-3 rounded-full bg-orange-50 text-krenke-orange text-xs font-bold uppercase tracking-wider">
                  {product.category}
                </span>
              </div>
              <h1 className="text-3xl font-black text-gray-900 mb-6 uppercase tracking-tight">{product.name}</h1>

              <style>{`
                .product-specs-content {
                  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                  color: #333;
                }

                .product-specs-content .krenke-desc {
                  line-height: 1.6;
                  margin-bottom: 25px;
                  font-size: 1rem;
                  color: #555;
                }

                .product-specs-content table {
                  width: 100%;
                  border-collapse: collapse;
                  background-color: #fff;
                  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
                  border-radius: 8px;
                  overflow: hidden;
                  border-left: 4px solid #301b6b;
                  margin-top: 1rem;
                  margin-bottom: 2rem;
                }

                .product-specs-content th, 
                .product-specs-content td {
                  padding: 12px 15px;
                  text-align: left;
                  border-bottom: 1px solid #eee;
                }

                .product-specs-content th {
                  background-color: #fff;
                  color: #301b6b;
                  font-weight: 700;
                  width: 40%;
                  text-transform: uppercase;
                  font-size: 0.85rem;
                  letter-spacing: 0.5px;
                }

                .product-specs-content tr:nth-child(even) {
                  background-color: #f8f9fa;
                }

                .product-specs-content tr:last-child td,
                .product-specs-content tr:last-child th {
                  border-bottom: none;
                }

                .product-specs-content .highlight-orange {
                  color: #e65100;
                  font-weight: bold;
                }
                
                .product-specs-content .highlight-area {
                  background-color: #fff8e1;
                  font-weight: bold;
                  color: #333;
                  padding: 4px 8px;
                  border-radius: 4px;
                }
              `}</style>

              {product.specs ? (
                <div className="product-specs-content prose prose-slate max-w-none mb-8" dangerouslySetInnerHTML={{ __html: product.specs }} />
              ) : (
                <p className="text-gray-600 text-lg leading-relaxed mb-8">{product.description}</p>
              )}

              <div className="mt-auto pt-6 border-t border-gray-100">
                <button
                  className="w-full bg-green-600 text-white font-bold py-4 rounded-xl hover:bg-green-700 transition-all shadow-lg shadow-green-900/20 flex items-center justify-center gap-2 gtm-modal-button-quote"
                  onClick={() => window.location.href = `/orcamento?produto=${encodeURIComponent(product.id)}`}
                >
                  Solicitar Orçamento Deste Item
                </button>
                <p className="text-center text-xs text-gray-400 mt-3">
                  * Imagens meramente ilustrativas. Cores e detalhes podem variar conforme projeto.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ProductsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [search, setSearch] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const getProductAssets = async (productId: string) => {
    try {
      const folder = productId.toLowerCase();
      const { data: files } = await supabase.storage.from('products').list(folder);
      if (!files || files.length === 0) return null;

      const imageFiles = files.filter(f => f.name.match(/\.(webp|jpg|jpeg|png|gif)$/i));
      if (imageFiles.length === 0) return null;

      const urls = imageFiles.map(file =>
        supabase.storage.from('products').getPublicUrl(`${folder}/${file.name}`).data.publicUrl
      );

      const main = urls.find(url =>
        url.toLowerCase().includes('perspectiva') ||
        url.toLowerCase().includes('capa') ||
        url.toLowerCase().includes('principal') ||
        url.toLowerCase().includes('foto-1')
      ) || urls[0];

      return { main, gallery: urls };
    } catch (err) {
      return null;
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;

      // Sincroniza imagens do Storage se o banco estiver vazio (comportamento original)
      const enrichedProducts = await Promise.all((data || []).map(async (p) => {
        if (!p.image || !p.images || p.images.length === 0) {
          const assets = await getProductAssets(p.id);
          if (assets) {
            return { ...p, image: p.image || assets.main, images: assets.gallery };
          }
        }
        return p;
      }));

      setProducts(enrichedProducts);
    } catch (err) {
      console.error('Erro ao buscar produtos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    const categoryParam = searchParams.get('categoria');
    if (categoryParam && CATEGORIES.includes(categoryParam)) {
      setActiveCategory(categoryParam);
    } else {
      setActiveCategory('Todos');
    }
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

  const handleCloseProduct = () => {
    setSearchParams(prev => {
      prev.delete('produto');
      return prev;
    });
  };

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesCategory = activeCategory === 'Todos' || p.category === activeCategory;
      const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.id.toLowerCase().includes(search.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [products, activeCategory, search]);

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      {selectedProduct && (
        <ProductModal product={selectedProduct} onClose={handleCloseProduct} />
      )}

      {/* Header Banner */}
      <div className="relative h-[300px] md:h-[400px] overflow-hidden flex items-center bg-[#1E1B4B]">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-[#1E1B4B] via-[#2a2175] to-blue-900 opacity-95"></div>
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full text-center md:text-left">
          <div className="flex flex-col items-center md:items-start">
            <div className="flex items-center gap-2 text-sm text-gray-300 mb-6 bg-white/5 px-3 py-1 rounded-full border border-white/10">
              <span>Home</span>
              <ChevronRight size={14} />
              <span className="text-krenke-orange font-bold">Produtos</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter mb-4">
              Nossos <span className="text-krenke-orange">Produtos</span>
            </h1>
            <p className="text-gray-300 max-w-2xl text-lg font-light">
              Explore nossa linha completa de playgrounds e brinquedos certificados, projetados para máxima segurança e diversão.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20">
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 p-4 md:p-8">
          <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
            {/* Search */}
            <div className="relative w-full md:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Buscar por nome ou código..."
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border-0 rounded-2xl focus:ring-2 focus:ring-krenke-orange transition-all outline-none"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* Category Filter Pills (Mobile) */}
            <div className="flex md:hidden overflow-x-auto w-full pb-2 gap-2 no-scrollbar">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => handleCategoryChange(cat)}
                  className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-bold transition-all ${activeCategory === cat ? 'bg-krenke-orange text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Sidebar Filters (Desktop) */}
          <div className="hidden lg:block w-72 flex-shrink-0">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-24">
              <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Filter size={18} className="text-krenke-orange" /> Categorias
              </h3>
              <div className="space-y-2">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    onClick={() => handleCategoryChange(cat)}
                    className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeCategory === cat ? 'bg-orange-50 text-krenke-orange' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Product Grid */}
          <div className="flex-1">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="bg-white rounded-3xl h-80 animate-pulse border"></div>
                ))}
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className="group bg-white rounded-[2.5rem] overflow-hidden border border-gray-100 shadow-sm hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] hover:-translate-y-2 transition-all duration-500 flex flex-col cursor-pointer"
                    onClick={() => setSearchParams({ ...Object.fromEntries(searchParams), produto: product.id })}
                  >
                    {/* Imagem com Hover Effect */}
                    <div className="aspect-[1/1] overflow-hidden bg-white relative">
                      <img
                        src={product.image || 'https://via.placeholder.com/400?text=Sem+Imagem'}
                        alt={product.name}
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-700 p-8 relative z-0"
                      />

                      {/* Badge flutuante */}
                      <div className="absolute top-6 left-6 z-20">
                        <div className={`backdrop-blur-md px-4 py-1.5 rounded-full shadow-sm border border-white/50 flex items-center gap-2 ${CATEGORY_STYLES[product.category]?.bg || 'bg-white/90'}`}>
                          <span className={`w-2 h-2 rounded-full animate-pulse ${CATEGORY_STYLES[product.category]?.dot || 'bg-krenke-orange'}`}></span>
                          <span className={`text-[10px] font-black uppercase tracking-widest ${CATEGORY_STYLES[product.category]?.text || 'text-gray-800'}`}>{product.category}</span>
                        </div>
                      </div>

                      {/* Botão flutuante no hover */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-30">
                        <div className="bg-krenke-blue text-white px-6 py-3 rounded-2xl font-black text-sm shadow-xl flex items-center gap-2 translate-y-4 group-hover:translate-y-0 transition-transform duration-500 hover:bg-krenke-orange transition-colors">
                          CONHECER PRODUTO <ChevronRight size={18} />
                        </div>
                      </div>
                    </div>

                    {/* Conteúdo do Card */}
                    <div className="p-8 flex flex-col flex-1 bg-white relative">
                      <h3 className="text-2xl font-black text-krenke-blue mb-3 group-hover:text-krenke-orange transition-colors tracking-tight">
                        {product.name}
                      </h3>
                      <p className="text-gray-400 text-sm line-clamp-2 mb-6 font-medium leading-relaxed">
                        {product.description}
                      </p>

                      <div className="mt-auto flex items-center justify-between pt-6 border-t border-gray-50">
                        <div className="flex flex-col">
                          <span className="text-[9px] uppercase tracking-widest text-gray-300 font-bold mb-0.5">Referência</span>
                          <span className="text-xs font-mono font-bold text-gray-400">{product.id}</span>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-krenke-orange group-hover:bg-krenke-orange group-hover:text-white transition-all duration-300">
                          <Plus size={20} />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded-3xl border border-dashed">
                <Search size={48} className="mx-auto text-gray-300 mb-4" />
                <h3 className="text-xl font-bold text-gray-900">Nenhum produto encontrado</h3>
                <p className="text-gray-500">Tente ajustar sua busca ou categoria.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;