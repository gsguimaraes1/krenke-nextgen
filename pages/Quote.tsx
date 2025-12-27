import React, { useState } from 'react';
import { Send, Check } from 'lucide-react';

const QuotePage: React.FC = () => {
  const [formState, setFormState] = useState('idle'); // idle, submitting, success

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormState('submitting');
    // Simulate API call
    setTimeout(() => {
      setFormState('success');
    }, 1500);
  };

  if (formState === 'success') {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center animate-fade-in">
        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
          <Check size={40} />
        </div>
        <h2 className="text-3xl font-black text-gray-900 mb-2">Solicitação Enviada!</h2>
        <p className="text-gray-600 max-w-md mb-8">
          Recebemos seus dados. Nossa equipe comercial entrará em contato em até 24 horas úteis com seu orçamento personalizado.
        </p>
        <button 
          onClick={() => setFormState('idle')}
          className="px-6 py-3 bg-krenke-purple text-white font-bold rounded-xl hover:bg-purple-800 transition-colors"
        >
          Enviar Nova Solicitação
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden grid md:grid-cols-5">
          
          {/* Sidebar Info */}
          <div className="bg-krenke-blue text-white p-8 md:col-span-2 flex flex-col justify-between relative overflow-hidden">
            <div className="relative z-10">
              <h1 className="text-3xl font-black mb-4">Solicite seu Orçamento</h1>
              <p className="text-blue-100 mb-8">
                Preencha o formulário para receber uma proposta personalizada para seu espaço.
              </p>
              
              <div className="space-y-4 text-sm">
                <div className="bg-blue-800/50 p-4 rounded-xl">
                  <p className="font-bold text-blue-200 uppercase text-xs mb-1">Atendimento</p>
                  <p>Seg - Sex: 08h às 18h</p>
                </div>
                <div className="bg-blue-800/50 p-4 rounded-xl">
                  <p className="font-bold text-blue-200 uppercase text-xs mb-1">Dúvidas?</p>
                  <p>contato@krenke.com.br</p>
                </div>
              </div>
            </div>
            
            {/* Decoration */}
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-krenke-orange rounded-full opacity-20 blur-3xl"></div>
            <div className="absolute top-10 -left-10 w-40 h-40 bg-krenke-purple rounded-full opacity-20 blur-3xl"></div>
          </div>

          {/* Form */}
          <div className="p-8 md:p-12 md:col-span-3">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Nome Completo*</label>
                  <input required type="text" className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-krenke-orange focus:border-transparent outline-none transition-all" placeholder="Seu nome" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Cidade/Estado*</label>
                  <input required type="text" className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-krenke-orange focus:border-transparent outline-none transition-all" placeholder="Ex: São Paulo - SP" />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">E-mail*</label>
                  <input required type="email" className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-krenke-orange focus:border-transparent outline-none transition-all" placeholder="seu@email.com" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Telefone/WhatsApp*</label>
                  <input required type="tel" className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-krenke-orange focus:border-transparent outline-none transition-all" placeholder="(00) 00000-0000" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Segmento</label>
                <select className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-krenke-orange focus:border-transparent outline-none transition-all">
                  <option>Selecione uma opção...</option>
                  <option>Escola / Creche</option>
                  <option>Condomínio</option>
                  <option>Prefeitura / Órgão Público</option>
                  <option>Hotel / Pousada</option>
                  <option>Residência</option>
                  <option>Revendedor</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Mensagem</label>
                <textarea rows={4} className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-krenke-orange focus:border-transparent outline-none transition-all resize-none" placeholder="Descreva o que você precisa..."></textarea>
              </div>

              <button 
                type="submit" 
                disabled={formState === 'submitting'}
                className="w-full bg-krenke-orange text-white font-bold py-4 rounded-xl hover:bg-orange-600 transition-all shadow-lg hover:shadow-orange-500/30 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {formState === 'submitting' ? 'Enviando...' : 'Enviar Solicitação'}
                {!formState && <Send size={18} />}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuotePage;