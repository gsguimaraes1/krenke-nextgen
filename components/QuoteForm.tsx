import React, { useState } from 'react';
import { INITIAL_PRODUCTS } from '../products_data';
import { Check, Search } from 'lucide-react';

// Load all assets using Vite's glob import
const allAssets = import.meta.glob('../assets/**/*', { eager: true, as: 'url' });

// Helper to find images for a product
const findProductAssets = (productName: string) => {
  if (!productName || productName.length < 3) return { main: '', gallery: [] as string[] };

  const normalizedName = productName.toLowerCase().replace(/\s+/g, '');
  const matches: string[] = [];

  Object.entries(allAssets).forEach(([path, url]) => {
    if (path.toLowerCase().replace(/\s+/g, '').includes(normalizedName)) {
      matches.push(url as string);
    }
  });

  return {
    main: matches.length > 0 ? matches[0] : '',
    gallery: matches
  };
};

const QuoteForm: React.FC = () => {
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const toggleProduct = (productId: string) => {
    setSelectedProducts(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const filteredProducts = INITIAL_PRODUCTS.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const data = {
      name: formData.get('name'),
      phone: formData.get('phone'),
      email: formData.get('email'),
      message: formData.get('message'),
      products: selectedProducts.map(id => INITIAL_PRODUCTS.find(p => p.id === id)?.name)
    };
    console.log('Form submitted:', data);
    alert('Orçamento solicitado com sucesso!');
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
      `}</style>

      <div className="form-container">
        <h2 className="text-2xl font-black text-center mb-2">Solicitar Orçamento</h2>
        <p className="text-center text-gray-400 mb-4">Escolha os produtos e preencha seus dados</p>

        <form className="form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Nome Completo</label>
            <input type="text" id="name" name="name" placeholder="Seu nome" required />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-group">
              <label htmlFor="phone">WhatsApp</label>
              <input type="tel" id="phone" name="phone" placeholder="(00) 00000-0000" required />
            </div>
            <div className="form-group">
              <label htmlFor="email">E-mail</label>
              <input type="email" id="email" name="email" placeholder="seu@email.com" required />
            </div>
          </div>

          <div className="form-group">
            <label>Produtos de Interesse</label>
            <div className="search-container">
              <Search size={16} className="search-icon" />
              <input
                type="text"
                className="search-input"
                placeholder="Buscar produtos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="product-selector custom-scrollbar">
              {filteredProducts.map(product => {
                const assets = findProductAssets(product.name);
                const productImage = assets.main || 'https://via.placeholder.com/100?text=Sem+Imagem';

                return (
                  <div
                    key={product.id}
                    className={`product-item ${selectedProducts.includes(product.id) ? 'selected' : ''}`}
                    onClick={() => toggleProduct(product.id)}
                  >
                    <div className="checkbox-custom">
                      {selectedProducts.includes(product.id) && <Check size={16} color="white" strokeWidth={4} />}
                    </div>

                    <div className="product-img-wrapper">
                      <img src={productImage} alt={product.name} className="w-full h-full object-contain" />
                    </div>

                    <div className="flex flex-col min-w-0">
                      <span className="font-bold text-base tracking-tight truncate text-slate-900">{product.name}</span>
                      <span className="text-[11px] text-slate-500 uppercase font-semibold">{product.category}</span>
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
            <textarea id="message" name="message" placeholder="Conte-nos mais sobre seu projeto..."></textarea>
          </div>

          <button type="submit" className="form-submit-btn">
            ENVIAR SOLICITAÇÃO
          </button>
        </form>
      </div>
    </div>
  );
};

export default QuoteForm;
