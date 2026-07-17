import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { WhatsAppForm, WhatsAppIcon, useBusinessHours } from './WhatsAppForm';

// Widget standalone do WhatsApp (usado na landing page /lp): FAB próprio + formulário.
// O site principal usa o ContactLauncher (WhatsApp + Chat num único botão).
export const WhatsAppWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const isOffline = useBusinessHours();

  return (
    <div className="fixed bottom-6 right-6 z-[95] flex flex-col items-end gtm-wa-widget-container">
      <WhatsAppForm open={isOpen} onClose={() => setIsOpen(false)} />

      {/* Floating Button */}
      <motion.button
        id="btn-whatsapp-toggle"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 md:w-16 md:h-16 text-white rounded-full flex items-center justify-center transition-all relative group gtm-wa-widget-toggle ${
          isOffline
            ? 'bg-red-500 shadow-[0_8px_30px_rgba(239,68,68,0.4)] hover:shadow-[0_8px_30px_rgba(239,68,68,0.6)]'
            : 'bg-[#25D366] shadow-[0_8px_30px_rgba(37,211,102,0.4)] hover:shadow-[0_8px_30px_rgba(37,211,102,0.6)]'
        }`}
      >
        <div className="absolute inset-0 bg-white/20 rounded-full scale-0 group-hover:scale-100 transition-transform duration-300"></div>
        {isOpen ? <X size={28} className="relative z-10" /> : <WhatsAppIcon className="w-8 h-8 relative z-10" />}

        {/* Pulse effect when closed */}
        {!isOpen && (
          <>
            <div className={`absolute inset-0 rounded-full border-2 animate-ping opacity-20 ${isOffline ? 'border-red-500' : 'border-[#25D366]'}`}></div>
            <div className={`absolute inset-0 rounded-full border animate-pulse opacity-40 ${isOffline ? 'border-red-500' : 'border-[#25D366]'}`}></div>
          </>
        )}
      </motion.button>
    </div>
  );
};
