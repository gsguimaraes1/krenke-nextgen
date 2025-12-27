import React, { useState } from 'react';
import { INITIAL_PRODUCTS } from '../products_data';
import { Check, Search } from 'lucide-react';

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
          max-width: 500px;
          background: linear-gradient(#212121, #212121) padding-box,
                      linear-gradient(145deg, transparent 35%,#F39200, #312783) border-box;
          border: 2px solid transparent;
          padding: 32px 24px;
          font-size: 14px;
          font-family: inherit;
          color: white;
          display: flex;
          flex-direction: column;
          gap: 20px;
          box-sizing: border-box;
          border-radius: 16px;
          background-size: 200% 100%;
          animation: gradient 5s ease infinite;
        }

        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        .form-container button:active {
          scale: 0.95;
        }

        .form-container .form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .form-container .form-group {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .form-container .form-group label {
          display: block;
          color: #b0b0b0;
          font-weight: 600;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .form-container .form-group input, 
        .form-container .form-group textarea {
          width: 100%;
          padding: 12px 16px;
          border-radius: 8px;
          color: #fff;
          font-family: inherit;
          background-color: rgba(255, 255, 255, 0.05);
          border: 1px solid #414141;
          transition: all 0.3s ease;
        }

        .form-container .form-group input:focus,
        .form-container .form-group textarea:focus {
          outline: none;
          border-color: #F39200;
          background-color: rgba(255, 255, 255, 0.08);
          box-shadow: 0 0 0 4px rgba(243, 146, 0, 0.1);
        }

        .product-selector {
          background: rgba(0, 0, 0, 0.2);
          border: 1px solid #414141;
          border-radius: 8px;
          max-height: 200px;
          overflow-y: auto;
          padding: 10px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .product-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px;
          border-radius: 6px;
          cursor: pointer;
          transition: background 0.2s;
        }

        .product-item:hover {
          background: rgba(255, 255, 255, 0.05);
        }

        .product-item.selected {
          background: rgba(243, 146, 0, 0.1);
          border: 1px solid rgba(243, 146, 0, 0.3);
        }

        .checkbox-custom {
          width: 18px;
          height: 18px;
          border: 2px solid #F39200;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .selected .checkbox-custom {
          background: #F39200;
        }

        .form-submit-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: inherit;
          color: #fff;
          font-weight: 700;
          width: 100%;
          background: linear-gradient(135deg, #F39200, #ffb03b);
          border: none;
          padding: 14px 20px;
          font-size: 16px;
          gap: 10px;
          margin-top: 10px;
          cursor: pointer;
          border-radius: 8px;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(243, 146, 0, 0.3);
        }

        .form-submit-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(243, 146, 0, 0.4);
          filter: brightness(1.1);
        }

        .form-submit-btn:active {
          transform: translateY(0);
        }

        .search-container {
          position: relative;
          margin-bottom: 10px;
        }

        .search-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #717171;
        }

        .search-input {
          padding-left: 36px !important;
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
                            {filteredProducts.map(product => (
                                <div
                                    key={product.id}
                                    className={`product-item ${selectedProducts.includes(product.id) ? 'selected' : ''}`}
                                    onClick={() => toggleProduct(product.id)}
                                >
                                    <div className="checkbox-custom">
                                        {selectedProducts.includes(product.id) && <Check size={14} color="white" strokeWidth={4} />}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-bold text-sm">{product.name}</span>
                                        <span className="text-[10px] text-gray-500 uppercase">{product.category}</span>
                                    </div>
                                </div>
                            ))}
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
