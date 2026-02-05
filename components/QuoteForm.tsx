import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Search, Loader2, Send, Phone, Mail, MapPin, Plus } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Product } from '../types';
import { INITIAL_PRODUCTS } from '../products_data';

const QuoteForm: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [honeypot, setHoneypot] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data, error } = await supabase.from('products').select('*').order('name', { ascending: true });
        if (error) throw error;
        setProducts(data && data.length > 0 ? data : (INITIAL_PRODUCTS as Product[]));
      } catch (err) {
        setProducts(INITIAL_PRODUCTS as Product[]);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const toggleProduct = (productId: string) => {
    setSelectedProducts(prev => prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]);
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Honeypot security check
    if (honeypot) {
      console.warn('Bot detected');
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData(e.target as HTMLFormElement);
    const data = {
      name: (formData.get('name') as string).trim(),
      phone: (formData.get('phone') as string).trim(),
      email: (formData.get('email') as string).trim().toLowerCase(),
      message: (formData.get('message') as string).trim(),
      products: selectedProducts.map(id => products.find(p => p.id === id)?.name || id)
    };

    // Basic Validation
    if (data.name.length < 3) {
      alert('Por favor, insira seu nome completo.');
      setIsSubmitting(false);
      return;
    }

    const phoneRegex = /^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/;
    if (!phoneRegex.test(data.phone)) {
      alert('Por favor, insira um WhatsApp válido no formato (00) 00000-0000');
      setIsSubmitting(false);
      return;
    }

    try {
      const { error } = await supabase.from('leads').insert([data]);
      if (error) throw error;
      alert('Orçamento solicitado com sucesso! Nossa equipe entrará em contato em breve.');
      setSelectedProducts([]);
      setHoneypot('');
      (e.target as HTMLFormElement).reset();
    } catch (err: any) {
      alert('Erro ao enviar: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 flex justify-center">
      {/* Centralized Form Container */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="w-full max-w-4xl bg-white rounded-[3rem] shadow-premium border border-slate-100 overflow-hidden relative"
      >
        {/* Top Energetic Strip */}
        <div className="h-2 w-full bg-gradient-to-r from-vibrant-orange via-vibrant-purple to-vibrant-green bg-[length:200%_auto] animate-gradient-x"></div>

        <div className="p-8 md:p-16">
          <div className="mb-12 text-center">
            <h2 className="text-3xl md:text-5xl font-black text-gray-900 uppercase tracking-tighter leading-none mb-6">
              PROPOSTA <span className="text-vibrant-orange">RÁPIDA</span>
            </h2>
            <p className="text-gray-400 font-medium text-lg italic max-w-2xl mx-auto">
              Preencha os dados abaixo para receber um orçamento detalhado em tempo recorde.
            </p>
          </div>

          <form className="space-y-10" onSubmit={handleSubmit}>
            {/* Honeypot Field (Security) */}
            <div className="hidden" aria-hidden="true">
              <input
                type="text"
                name="b_website_url"
                tabIndex={-1}
                value={honeypot}
                onChange={e => setHoneypot(e.target.value)}
                autoComplete="off"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-10">
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 px-2">Identificação</label>
                <input
                  name="name"
                  placeholder="Seu Nome Completo"
                  required
                  className="w-full px-8 py-5 bg-slate-50 border-2 border-transparent focus:border-vibrant-orange rounded-2xl outline-none font-black text-gray-900 transition-all shadow-sm focus:shadow-vibrant-orange"
                />
              </div>
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 px-2">WhatsApp</label>
                <input
                  name="phone"
                  placeholder="(00) 00000-0000"
                  required
                  className="w-full px-8 py-5 bg-slate-50 border-2 border-transparent focus:border-vibrant-purple rounded-2xl outline-none font-black text-gray-900 transition-all shadow-sm focus:shadow-vibrant-purple"
                />
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 px-2">Seu E-mail Corporativo</label>
              <input
                type="email"
                name="email"
                placeholder="exemplo@empresa.com.br"
                required
                className="w-full px-8 py-5 bg-slate-50 border-2 border-transparent focus:border-vibrant-cyan rounded-2xl outline-none font-black text-gray-900 transition-all shadow-sm focus:shadow-vibrant-cyan"
              />
            </div>

            {/* Product Selector */}
            <div className="space-y-6">
              <div className="flex items-center justify-between px-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Produtos Desejados</label>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-vibrant-orange">{selectedProducts.length} Selecionados</span>
              </div>

              <div className="relative group">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-vibrant-orange" size={20} />
                <input
                  placeholder="Filtrar por nome ou categoria..."
                  className="w-full pl-16 pr-8 py-5 bg-slate-50 border-2 border-transparent focus:border-vibrant-orange rounded-2xl outline-none font-bold text-gray-900 transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar p-1">
                <AnimatePresence>
                  {filteredProducts.map(product => (
                    <motion.div
                      key={product.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      onClick={() => toggleProduct(product.id)}
                      className={`relative p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center gap-4 ${selectedProducts.includes(product.id) ? 'bg-vibrant-orange/5 border-vibrant-orange shadow-vibrant-orange' : 'bg-white border-slate-100 hover:border-slate-200 shadow-sm'}`}
                    >
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${selectedProducts.includes(product.id) ? 'bg-vibrant-orange text-white' : 'bg-slate-50 text-slate-300'}`}>
                        {selectedProducts.includes(product.id) ? <Check size={20} strokeWidth={3} /> : <Plus size={20} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-black text-xs uppercase tracking-tighter truncate text-gray-900">{product.name}</p>
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{product.category}</p>
                      </div>
                      <div className="w-12 h-12 bg-white rounded-lg flex-shrink-0 p-1 border border-slate-50">
                        <img src={product.image} alt="" className="w-full h-full object-contain" />
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 px-2">Detalhes do Projeto</label>
              <textarea
                name="message"
                rows={4}
                placeholder="Descreva seu espaço, público-alvo ou necessidades específicas..."
                className="w-full px-8 py-5 bg-slate-50 border-2 border-transparent focus:border-vibrant-orange rounded-2xl outline-none font-bold text-gray-900 transition-all"
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-vibrant-orange py-8 rounded-[2.5rem] text-white font-black text-xl uppercase tracking-widest transition-all hover:shadow-vibrant-orange flex items-center justify-center gap-6 group overflow-hidden relative"
            >
              <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out"></div>
              {isSubmitting ? <Loader2 className="animate-spin" /> : <Send size={24} />}
              {isSubmitting ? 'ENVIANDO...' : 'SOLICITAR PROPOSTA AGORA'}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default QuoteForm;
