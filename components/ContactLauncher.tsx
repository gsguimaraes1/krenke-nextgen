import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageCircle, MessagesSquare } from 'lucide-react';
import { WhatsAppForm, WhatsAppIcon, useBusinessHours } from './WhatsAppForm';

// Abre o widget do Chatwoot (bolha nativa fica escondida via hideMessageBubble).
// $chatwoot só existe depois do evento chatwoot:ready — chamar toggle antes
// disso abre uma janela em branco. Por isso aguardamos o ready se preciso.
function openChatwoot() {
  const w = window as any;
  if (w.$chatwoot?.toggle) {
    w.$chatwoot.toggle('open');
    return;
  }
  const onReady = () => {
    window.removeEventListener('chatwoot:ready', onReady);
    (window as any).$chatwoot?.toggle?.('open');
  };
  window.addEventListener('chatwoot:ready', onReady);
}

// Launcher único do site: um botão que abre a escolha entre WhatsApp e Chat ao vivo.
export const ContactLauncher: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [waOpen, setWaOpen] = useState(false);
  const isOffline = useBusinessHours();

  const options = [
    {
      key: 'whatsapp',
      label: 'WhatsApp',
      sub: isOffline ? 'Deixe sua mensagem' : 'Atendimento online',
      icon: <WhatsAppIcon className="w-6 h-6" />,
      circle: 'bg-[#25D366] shadow-[#25D366]/30',
      onClick: () => { setMenuOpen(false); setWaOpen(true); },
    },
    {
      key: 'chat',
      label: 'Chat ao vivo',
      sub: 'Converse pelo site',
      icon: <MessageCircle className="w-6 h-6" />,
      circle: 'bg-[#312783] shadow-[#312783]/30',
      onClick: () => { setMenuOpen(false); openChatwoot(); },
    },
  ];

  // Clique no botão principal: se o form do WhatsApp está aberto, fecha ele;
  // caso contrário alterna o menu de opções.
  const handleMainClick = () => {
    if (waOpen) { setWaOpen(false); return; }
    setMenuOpen((v) => !v);
  };

  const expanded = menuOpen || waOpen;

  return (
    <div className="fixed bottom-6 right-6 z-[95] flex flex-col items-end">
      {/* Formulário do WhatsApp */}
      <WhatsAppForm open={waOpen} onClose={() => setWaOpen(false)} />

      {/* Menu de opções (speed-dial) */}
      <AnimatePresence>
        {menuOpen && !waOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mb-4 flex flex-col items-end gap-3"
          >
            {options.map((opt, i) => (
              <motion.button
                key={opt.key}
                type="button"
                onClick={opt.onClick}
                initial={{ opacity: 0, y: 20, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.8 }}
                transition={{ type: 'spring', stiffness: 350, damping: 22, delay: i * 0.05 }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="group flex items-center gap-3"
              >
                {/* Rótulo */}
                <span className="flex flex-col items-end rounded-2xl bg-white px-4 py-2 shadow-[0_10px_30px_-8px_rgba(0,0,0,0.25)] border border-slate-100">
                  <span className="text-sm font-black text-gray-900 leading-tight">{opt.label}</span>
                  <span className="text-[10px] font-bold uppercase tracking-wide text-gray-400 leading-tight">{opt.sub}</span>
                </span>
                {/* Ícone */}
                <span className={`w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg transition-shadow ${opt.circle}`}>
                  {opt.icon}
                </span>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Botão principal */}
      <motion.button
        id="btn-contact-launcher"
        type="button"
        aria-label="Fale conosco"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleMainClick}
        className="w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center relative group text-white bg-gradient-to-tr from-vibrant-orange to-krenke-orange shadow-[0_8px_30px_rgba(243,146,0,0.45)] hover:shadow-[0_8px_30px_rgba(243,146,0,0.65)] transition-all"
      >
        <div className="absolute inset-0 bg-white/20 rounded-full scale-0 group-hover:scale-100 transition-transform duration-300"></div>
        <AnimatePresence mode="wait" initial={false}>
          {expanded ? (
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
        {!expanded && (
          <>
            <div className="absolute inset-0 rounded-full border-2 border-krenke-orange animate-ping opacity-20"></div>
            <div className="absolute inset-0 rounded-full border border-krenke-orange animate-pulse opacity-40"></div>
          </>
        )}
      </motion.button>
    </div>
  );
};
