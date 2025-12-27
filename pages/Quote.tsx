import React from 'react';
import QuoteForm from '../components/QuoteForm';

const QuotePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#f8fafc] py-20 flex flex-col items-center">
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-black text-gray-900 mb-6 tracking-tight">Orçamento Personalizado</h1>
          <p className="text-slate-500 max-w-2xl mx-auto text-lg leading-relaxed">
            Escolha os produtos de seu interesse em nosso catálogo e preencha seus dados para receber uma proposta exclusiva da nossa equipe.
          </p>
        </div>

        <QuoteForm />

        <div className="mt-20 text-center text-sm text-slate-400 border-t border-slate-200 pt-10">
          <div className="flex flex-col md:flex-row justify-center gap-6 md:gap-12 mb-6 text-slate-500">
            <span className="flex items-center gap-2 justify-center font-medium"><span className="w-2 h-2 bg-krenke-orange rounded-full"></span> Segunda a Sexta: 08h às 18h</span>
            <span className="flex items-center gap-2 justify-center font-medium"><span className="w-2 h-2 bg-[#312783] rounded-full"></span> contato@krenke.com.br</span>
          </div>
          <p>© 2026 Krenke Brinquedos. Transformando espaços, criando memórias.</p>
        </div>
      </div>
    </div>
  );
};

export default QuotePage;