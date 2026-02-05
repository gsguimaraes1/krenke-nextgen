import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, Sparkles } from 'lucide-react';
import QuoteForm from '../components/QuoteForm';

const QuotePage: React.FC = () => {
  return (
    <div className="bg-slate-50 min-h-screen overflow-x-hidden">
      {/* Header Banner - Vibrant Hero */}
      <div className="relative h-[450px] md:h-[600px] overflow-hidden flex items-center bg-krenke-purple">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-krenke-purple via-vibrant-purple to-vibrant-orange opacity-50 mix-blend-overlay"></div>
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.3, 0.5, 0.3]
            }}
            transition={{ duration: 15, repeat: Infinity }}
            className="absolute top-0 right-0 w-[50%] h-full bg-vibrant-orange/10 blur-[120px] rounded-full"
          ></motion.div>
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full uppercase">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col items-start"
          >
            <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 text-white text-xs font-black uppercase tracking-[0.3em] mb-10">
              <Sparkles size={14} className="text-vibrant-orange animate-pulse" />
              Projetos Customizados
            </div>

            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white leading-[0.8] tracking-tighter mb-10 uppercase drop-shadow-2xl">
              TRANSFORME <br />
              <span className="text-vibrant-orange">SEU ESPAÇO</span>
            </h1>

            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '200px' }}
              transition={{ delay: 0.6, duration: 1 }}
              className="h-3 bg-vibrant-orange rounded-full shadow-vibrant-orange"
            ></motion.div>
          </motion.div>
        </div>

        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-slate-50 to-transparent z-10"></div>
      </div>

      <div className="relative z-20 -mt-20">
        <QuoteForm />
      </div>


    </div>
  );
};

export default QuotePage;