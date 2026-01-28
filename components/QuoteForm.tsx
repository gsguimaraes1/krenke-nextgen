import React, { useState, useEffect } from 'react';
import { INITIAL_PRODUCTS } from '../products_data';
import { Check, Search, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Product } from '../types';

// Helper to find images for a product in Supabase Storage
const getProductAssetsFromStorage = async (product: any) => {
  const name = product.name || '';
  const id = product.id || '';
  if (!name && !id) return { main: '', gallery: [] as string[] };

  const variants = [
    id.toLowerCase(),
    id.toLowerCase().replace('kmp', 'kpm'),
    name.toLowerCase().trim().replace(/\s+/g, '-'),
    name.toLowerCase().trim().replace(/\s+/g, ''),
    name.split(' ').pop()?.toLowerCase()
  ].filter(Boolean);

  const uniqueVariants = Array.from(new Set(variants));

  for (const folder of uniqueVariants) {
    try {
      const { data: files, error } = await supabase.storage.from('products').list(folder as string);

      if (!error && files && files.length > 0) {
        const imageFiles = files.filter(f => f.name.match(/\.(webp|jpg|jpeg|png|gif)$/i));

        if (imageFiles.length > 0) {
          const gallery = imageFiles.map(file =>
            supabase.storage.from('products').getPublicUrl(`${folder}/${file.name}`).data.publicUrl
          );

          const mainImage = gallery.find(url =>
            url.toLowerCase().includes('perspectiva') ||
            url.toLowerCase().includes('capa') ||
            url.toLowerCase().includes('principal') ||
            url.toLowerCase().includes('capa')
          ) || gallery[0];

          return { main: mainImage, gallery };
        }
      }
    } catch (err) {
      console.error(`Erro ao listar pasta ${folder}:`, err);
    }
  }

  return { main: '', gallery: [] };
};

const QuoteForm: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .order('name', { ascending: true });

        if (error) throw error;

        if (data && data.length > 0) {
          const enriched = await Promise.all(data.map(async (p: any) => {
            if (p.image && p.image.startsWith('http')) return p;
            const assets = await getProductAssetsFromStorage(p);
            return {
              ...p,
              image: assets.main || 'https://via.placeholder.com/100?text=Sem+Imagem',
              images: assets.gallery
            };
          }));
          setProducts(enriched);
        } else {
          const processedInitial = await Promise.all(INITIAL_PRODUCTS.map(async (p) => {
            const assets = await getProductAssetsFromStorage(p);
            return {
              ...p,
              image: assets.main || 'https://via.placeholder.get/100?text=Sem+Imagem',
              images: assets.gallery
            };
          }));
          setProducts(processedInitial);
        }
      } catch (err) {
        console.error('Error fetching products for quote form:', err);
        setProducts(INITIAL_PRODUCTS.map(p => ({ ...p, image: 'https://via.placeholder.com/100?text=Erro+Storage', images: [] })));
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const toggleProduct = (productId: string) => {
    setSelectedProducts(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const data = {
      name: formData.get('name') as string,
      phone: formData.get('phone') as string,
      email: formData.get('email') as string,
      message: formData.get('message') as string,
      products: selectedProducts.map(id => products.find(p => p.id === id)?.name || id)
    };

    try {
      const { error } = await supabase.from('leads').insert([data]);
      if (error) throw error;

      alert('Orçamento solicitado com sucesso! Entraremos em contato em breve.');
      // Reset form
      setSelectedProducts([]);
      (e.target as HTMLFormElement).reset();
    } catch (err: any) {
      console.error('Error saving lead:', err);
      alert('Erro ao enviar solicitação: ' + err.message);
    }
  };

  return (
    <div className="flex justify-center py-10">
      <style>{`
        .form-container {
          width: 100%;
          max-width: 1100px;
          background: white;
          border: 1px solid rgba(49, 39, 131, 0.1);
          padding: 60px 48px;
          color: #1a1a1a;
          display: flex;
          flex-direction: column;
          gap: 32px;
          box-sizing: border-box;
          border-radius: 32px;
          position: relative;
          box-shadow: 0 40px 100px rgba(49, 39, 131, 0.08);
          overflow: hidden;
        }

        .form-container::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 6px;
          background: linear-gradient(90deg, #F39200, #312783, #F39200);
          background-size: 200% 100%;
          animation: gradient 4s linear infinite;
        }

        @keyframes gradient {
          0% { background-position: 100% 0%; }
          100% { background-position: -100% 0%; }
        }

        .form-container button:active {
          scale: 0.98;
        }

        .form-container .form {
          display: flex;
          flex-direction: column;
          gap: 32px;
        }

        .form-container .form-group {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .form-container .form-group label {
          display: block;
          color: #334155;
          font-weight: 800;
          font-size: 13px;
          text-transform: uppercase;
          letter-spacing: 1.5px;
        }

        .form-container .form-group input, 
        .form-container .form-group textarea,
        .form-container .search-input {
          width: 100%;
          padding: 16px 20px;
          border-radius: 16px;
          color: #1e293b;
          font-family: inherit;
          background-color: #f8fafc;
          border: 2px solid #f1f5f9;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          font-size: 15px;
        }

        .form-container .form-group input:focus,
        .form-container .form-group textarea:focus,
        .form-container .search-input:focus {
          outline: none;
          border-color: #F39200;
          background-color: white;
          box-shadow: 0 0 0 4px rgba(243, 146, 0, 0.1);
        }

        .product-selector {
          background: #f8fafc;
          border: 2px solid #f1f5f9;
          border-radius: 20px;
          max-height: 500px;
          overflow-y: auto;
          padding: 20px;
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 16px;
        }

        .product-item {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px;
          border-radius: 16px;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          border: 2px solid transparent;
          background: white;
          box-shadow: 0 4px 6px rgba(0,0,0,0.02);
        }

        .product-item:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 20px rgba(49, 39, 131, 0.05);
          border-color: rgba(49, 39, 131, 0.1);
        }

        .product-item.selected {
          background: #fdfaf5;
          border-color: #F39200;
          box-shadow: 0 8px 15px rgba(243, 146, 0, 0.1);
        }

        .checkbox-custom {
          width: 24px;
          height: 24px;
          border: 2px solid #e2e8f0;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          flex-shrink: 0;
          background: white;
        }

        .selected .checkbox-custom {
          background: #F39200;
          border-color: #F39200;
          box-shadow: 0 0 12px rgba(243, 146, 0, 0.4);
        }

        .form-submit-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: inherit;
          color: #fff;
          font-weight: 900;
          width: 100%;
          background: linear-gradient(135deg, #F39200, #ffb03b);
          border: none;
          padding: 22px 32px;
          font-size: 18px;
          text-transform: uppercase;
          letter-spacing: 2px;
          gap: 16px;
          margin-top: 16px;
          cursor: pointer;
          border-radius: 20px;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 15px 35px rgba(243, 146, 0, 0.3);
        }

        .form-submit-btn:hover {
          transform: translateY(-5px);
          box-shadow: 0 25px 50px rgba(243, 146, 0, 0.45);
          filter: brightness(1.05);
        }

        .search-container {
          position: relative;
        }

        .search-icon {
          position: absolute;
          left: 20px;
          top: 50%;
          transform: translateY(-50%);
          color: #94a3b8;
        }

        .search-input {
          padding-left: 52px !important;
        }

        .product-img-wrapper {
          width: 80px;
          height: 80px;
          border-radius: 12px;
          background: white;
          overflow: hidden;
          flex-shrink: 0;
          border: 1px solid #f1f5f9;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 4px;
          transition: transform 0.3s ease;
        }

        .product-item:hover .product-img-wrapper {
          transform: scale(1.1);
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }

        @media (max-width: 768px) {
          .form-container {
            padding: 40px 20px;
            border-radius: 24px;
            gap: 24px;
          }

          .product-selector {
            grid-template-columns: 1fr;
            padding: 12px;
            max-height: 400px;
          }

          .product-item {
            padding: 12px;
            gap: 12px;
          }

          .product-img-wrapper {
            width: 60px;
            height: 60px;
          }

          .form-submit-btn {
            padding: 18px 24px;
            font-size: 16px;
          }

          .form-container h2 {
            font-size: 1.5rem;
          }
        }

        @media (max-width: 480px) {
          .form-container {
            padding: 30px 16px;
          }

          .product-item span.font-bold {
            font-size: 14px;
          }
        }
      `}</style>

      <div className="form-container">
        <h2 className="text-2xl font-black text-center mb-2">Solicitar Orçamento de Playgrounds</h2>
        <p className="text-center text-gray-400 mb-4">Escolha os melhores brinquedos e parques infantis para o seu projeto</p>

        <form className="form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Nome Completo</label>
            <input type="text" id="name" name="name" placeholder="Seu nome" required className="gtm-quote-input-name" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-group">
              <label htmlFor="phone">WhatsApp</label>
              <input type="tel" id="phone" name="phone" placeholder="(00) 00000-0000" required className="gtm-quote-input-phone" />
            </div>
            <div className="form-group">
              <label htmlFor="email">E-mail</label>
              <input type="email" id="email" name="email" placeholder="seu@email.com" required className="gtm-quote-input-email" />
            </div>
          </div>

          <div className="form-group">
            <label>Produtos de Interesse</label>
            <div className="search-container">
              <Search size={16} className="search-icon" />
              <input
                type="text"
                className="search-input gtm-quote-search-products"
                placeholder="Buscar produtos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="product-selector custom-scrollbar relative min-h-[100px]">
              {loading ? (
                <div className="absolute inset-0 flex items-center justify-center bg-white/50 z-10">
                  <Loader2 className="animate-spin text-krenke-orange" size={32} />
                </div>
              ) : null}
              {filteredProducts.map(product => {
                const productImage = product.image || 'https://via.placeholder.com/100?text=Sem+Imagem';

                return (
                  <div
                    key={product.id}
                    className={`product-item ${selectedProducts.includes(product.id) ? 'selected' : ''} gtm-quote-product-item-${product.id}`}
                    onClick={() => toggleProduct(product.id)}
                  >
                    <div className="checkbox-custom">
                      {selectedProducts.includes(product.id) && <Check size={16} color="white" strokeWidth={4} />}
                    </div>

                    <div className="product-img-wrapper">
                      <img src={productImage} alt={product.name} className="w-full h-full object-contain" />
                    </div>

                    <div className="flex flex-col min-w-0">
                      <span className="font-bold text-base tracking-tight truncate text-slate-900 gtm-quote-product-name uppercase">{product.name}</span>
                      <span className="text-[11px] text-slate-500 uppercase font-semibold gtm-quote-product-category">{product.category}</span>
                    </div>
                  </div>
                );
              })}
              {filteredProducts.length === 0 && (
                <div className="text-center py-4 text-gray-500 italic">Nenhum produto encontrado</div>
              )}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="message">Observações (Opcional)</label>
            <textarea id="message" name="message" placeholder="Conte-nos mais sobre seu projeto..." className="gtm-quote-input-message"></textarea>
          </div>

          <button type="submit" className="form-submit-btn gtm-quote-button-submit">
            ENVIAR SOLICITAÇÃO
          </button>
        </form>
      </div>
    </div>
  );
};

export default QuoteForm;
