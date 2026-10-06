import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MessagesSquare } from 'lucide-react';
import { WhatsAppForm } from './WhatsAppForm';

// Botão flutuante do site: abre o form de WhatsApp.
export const ContactLauncher: React.FC = () => {
  const [waOpen, setWaOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-[95] flex flex-col items-end">
      {/* Formulário do WhatsApp */}
      <WhatsAppForm open={waOpen} onClose={() => setWaOpen(false)} />

      {/* Botão principal */}
      <motion.button
        id="btn-contact-launcher"
        type="button"
        aria-label={waOpen ? 'Fechar' : 'Fale conosco pelo WhatsApp'}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setWaOpen((v) => !v)}
        className="w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center relative group text-white bg-gradient-to-tr from-vibrant-orange to-krenke-orange shadow-[0_8px_30px_rgba(243,146,0,0.45)] hover:shadow-[0_8px_30px_rgba(243,146,0,0.65)] transition-all"
      >
        <div className="absolute inset-0 bg-white/20 rounded-full scale-0 group-hover:scale-100 transition-transform duration-300"></div>
        <AnimatePresence mode="wait" initial={false}>
          {waOpen ? (
            <motion.span key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} className="relative z-10">
              <X size={28} />
            </motion.span>
          ) : (
            <motion.span key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} className="relative z-10">
              <MessagesSquare size={28} />
            </motion.span>
          )}
        </AnimatePresence>

        {/* Pulso quando fechado */}
        {!waOpen && (
          <>
            <div className="absolute inset-0 rounded-full border-2 border-krenke-orange animate-ping opacity-20"></div>
            <div className="absolute inset-0 rounded-full border border-krenke-orange animate-pulse opacity-40"></div>
          </>
        )}
      </motion.button>
    </div>
  );
};
