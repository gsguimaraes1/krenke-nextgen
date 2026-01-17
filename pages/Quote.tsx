import React from 'react';
import { ChevronRight } from 'lucide-react';
import QuoteForm from '../components/QuoteForm';

const QuotePage: React.FC = () => {
  return (
    <div className="bg-slate-50 min-h-screen animate-fade-in">
      {/* Header Banner */}
      <div className="relative h-[350px] md:h-[450px] overflow-hidden flex items-center bg-[#1E1B4B] mb-20">
        {/* Background Image/Pattern */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 animate-pulse-slow"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-krenke-purple via-[#2a2175] to-blue-900 opacity-95"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="flex flex-col items-start">
            <div className="flex items-center gap-2 text-sm text-gray-300 mb-6 bg-white/5 px-3 py-1 rounded-full backdrop-blur-sm border border-white/10">
              <span>Home</span>
              <ChevronRight size={14} />
              <span className="text-krenke-orange font-bold">Orçamento</span>
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-white/80 text-xs font-bold uppercase tracking-widest mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-krenke-orange"></span>
              Proposta personalizada para você
            </div>

            <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter mb-4 drop-shadow-2xl">
              Solicitar Orçamento
            </h1>
            <div className="h-2 w-32 bg-gradient-to-r from-krenke-orange to-yellow-400 rounded-full"></div>
          </div>
        </div>

        {/* Decorative Bottom Fade */}
        <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-slate-50 to-transparent z-10"></div>
      </div>

      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8">

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