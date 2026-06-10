import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Clock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { getStoredUTMs } from '../lib/utm-tracker';

const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.888-.788-1.489-1.761-1.663-2.06-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

export const WhatsAppWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [segment, setSegment] = useState('');
  const [otherSegment, setOtherSegment] = useState('');
  const [message, setMessage] = useState('');
  const [isOffline, setIsOffline] = useState(false);
  const [siteSettings, setSiteSettings] = useState<any[]>([]);

  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await supabase.from('site_settings').select('*');
      if (data) setSiteSettings(data);
    };
    fetchSettings();
  }, []);

  // Time check logic
  useEffect(() => {
    const checkStatus = () => {
      const now = new Date();
      const day = now.getDay();
      
      // 0 = Dom, 6 = Sáb
      if (day === 0 || day === 6) {
        setIsOffline(true);
        return;
      }
      
      const hour = now.getHours();
      const minute = now.getMinutes();
      const time = hour + (minute / 60);
      
      // Matutino: 07:30 - 12:00
      const isMorning = time >= 7.5 && time < 12;
      // Vespertino: 13:00 - 17:30
      const isAfternoon = time >= 13 && time < 17.5;
      
      setIsOffline(!(isMorning || isAfternoon));
    };

    checkStatus();
    const interval = setInterval(checkStatus, 60000); // verify every minute
    return () => clearInterval(interval);
  }, []);

  const WHATSAPP_NUMBER = '554733730693';

  const readCookie = (name: string) => {
    const match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
    return match ? decodeURIComponent(match[1]) : '';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !phone.trim() || !segment || !message.trim()) return;
    if (segment === 'outros' && !otherSegment.trim()) return;

    const finalSegmentLabel = segment === 'outros' ? otherSegment : segment;

    const utms = getStoredUTMs();
    const geoCity = readCookie('ck_cidade');
    const geoState = readCookie('ck_estado');

    // Prepare lead data
    const leadData = {
      name: name.trim(),
      phone: phone.trim(),
      segment: finalSegmentLabel,
      message: message.trim(),
      source: 'WhatsApp Widget',
      submitted_at: new Date().toISOString(),
      ...utms
    };

    // 1. Save to Supabase (fire-and-forget)
    supabase.from('leads').insert([leadData]).then(({ error }) => {
      if (error) console.error('Supabase lead error:', error);
    });

    // GTM / Pixel dataLayer event
    const eventId = `lead_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    (window as any).dataLayer = (window as any).dataLayer || [];
    (window as any).dataLayer.push({
      event: 'lead_whatsapp',
      event_id: eventId,
      lead_first_name: leadData.name.split(' ')[0].toLowerCase(),
      lead_phone: leadData.phone,
      lead_segment: leadData.segment,
      lead_source: leadData.source,
      lead_city: geoCity,
      lead_state: geoState,
    });

    // 2. Send to Webhook
    const mode = siteSettings.find(s => s.key === 'webhook_mode')?.value || 'test';
    const webhookUrl = mode === 'prod'
      ? siteSettings.find(s => s.key === 'webhook_prod_url')?.value
      : siteSettings.find(s => s.key === 'webhook_test_url')?.value;

    if (webhookUrl) {
      fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          form_type: 'whatsapp',
          name: leadData.name,
          email: '',
          phone: leadData.phone,
          city: geoCity,
          state: geoState,
          city_full: geoCity ? `${geoCity} - ${geoState}` : '',
          client_type: '',
          segment: leadData.segment,
          message: leadData.message,
          products: '',
          source: 'WhatsApp Widget',
          submitted_at: leadData.submitted_at,
          utm_source: (leadData as any).utm_source || '',
          utm_medium: (leadData as any).utm_medium || '',
          utm_campaign: (leadData as any).utm_campaign || '',
          utm_term: (leadData as any).utm_term || '',
          utm_content: (leadData as any).utm_content || '',
          utm_id: (leadData as any).utm_id || '',
        })
      }).catch(e => console.error('Webhook error:', e));
    }

    let finalMessage = `Olá, me chamo ${name}.`;
    if (finalSegmentLabel) finalMessage += ` Sou do segmento de ${finalSegmentLabel}.`;
    
    const baseText = message.trim();
    finalMessage += `\n\n${baseText}`;
    
    const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(finalMessage)}`;
    window.open(waUrl, '_blank');
    setIsOpen(false);
    setMessage('');
    setPhone('');
    setSegment('');
  };


  return (
    <div className="fixed bottom-6 right-6 z-[95] flex flex-col items-end gtm-wa-widget-container">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="mb-4 w-72 md:w-80 bg-white rounded-3xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.25)] border border-slate-100 overflow-hidden origin-bottom-right"
          >
            {/* Header */}
            <div className={`p-4 text-white flex justify-between items-center relative overflow-hidden transition-colors duration-500 ${isOffline ? 'bg-red-500' : 'bg-[#25D366]'}`}>
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
              <div className="flex items-center gap-3 relative z-10">
                {isOffline ? <Clock className="w-6 h-6" /> : <WhatsAppIcon className="w-6 h-6" />}
                <div>
                  <h4 className="font-black text-sm uppercase tracking-widest">Krenke Suporte</h4>
                  <p className="text-[10px] font-bold text-white/90 uppercase">{isOffline ? 'Fora de Atendimento' : 'Atendimento Online'}</p>
                </div>
              </div>
              <button 
                id="btn-wa-widget-close"
                onClick={() => setIsOpen(false)}
                className="text-white hover:bg-white/20 p-2 rounded-full transition-all relative z-10 gtm-wa-widget-close"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form */}
            <form id="wa-widget-form" onSubmit={handleSubmit} className="p-5 flex flex-col gap-3">
              {isOffline ? (
                <div className="bg-red-50 text-red-600 p-3 rounded-xl border border-red-100 flex items-start gap-2 mb-1">
                  <Clock size={16} className="mt-0.5 flex-shrink-0" />
                  <p className="text-[11px] font-bold leading-relaxed">
                    Você pode deixar sua mensagem! Retornaremos o mais breve possível no nosso horário comercial.<br/>
                    <span className="font-black">Seg - Sex: 07:30 - 12:00 e 13:00 - 17:30</span>
                  </p>
                </div>
              ) : (
                <p className="text-xs font-bold text-gray-500 mb-1 leading-relaxed">
                  Preencha para iniciar a conversa:
                </p>
              )}

              <div>
                <input
                  type="text"
                  id="form-wa-name"
                  name="form_fields[name]"
                  placeholder="Seu Nome Completo *"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 border-2 border-transparent focus:border-[#25D366] px-4 py-2.5 rounded-xl font-bold text-sm text-gray-900 outline-none transition-all placeholder:text-gray-400"
                />
              </div>

              <div>
                <input
                  type="tel"
                  id="form-wa-phone"
                  name="form_fields[telefone]"
                  placeholder="Seu Celular / WhatsApp *"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-50 border-2 border-transparent focus:border-[#25D366] px-4 py-2.5 rounded-xl font-bold text-sm text-gray-900 outline-none transition-all placeholder:text-gray-400"
                />
              </div>

              <div className="space-y-2">
                <select
                  id="form-wa-segment"
                  name="form_fields[segmento]"
                  value={segment}
                  onChange={(e) => {
                    setSegment(e.target.value);
                    if (e.target.value !== 'outros') setOtherSegment('');
                  }}
                  required
                  className={`w-full bg-slate-50 border-2 border-transparent focus:border-[#25D366] px-4 py-2.5 rounded-xl font-bold text-sm outline-none transition-all appearance-none cursor-pointer ${segment ? 'text-gray-900' : 'text-gray-400'}`}
                >
                  <option value="" disabled>Selecione um segmento *</option>
                  <option value="Hotel">Hotel / Resort</option>
                  <option value="Condominio">Condomínio</option>
                  <option value="Escola Privada">Escola Privada</option>
                  <option value="Prefeitura">Prefeitura / Órgão Público (Compra Direta)</option>
                  <option value="Shopping">Shopping / Área Comercial</option>
                  <option value="Clinica">Clínica / Hospital</option>
                  <option value="Construtora">Construtora (Compra Direta)</option>
                  <option value="Licitacao">Licitação</option>
                  <option value="outros">Outros</option>
                </select>

                <AnimatePresence>
                  {segment === 'outros' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <input
                        type="text"
                        id="form-wa-segment-other"
                        placeholder="Qual o seu segmento? *"
                        required
                        value={otherSegment}
                        onChange={(e) => setOtherSegment(e.target.value)}
                        className="w-full bg-slate-50 border-2 border-transparent focus:border-[#25D366] px-4 py-2.5 rounded-xl font-bold text-sm text-gray-900 outline-none transition-all placeholder:text-gray-400"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div>
                <textarea
                  id="form-wa-message"
                  name="form_fields[mensagem]"
                  placeholder="Como podemos te ajudar? *"
                  required
                  rows={2}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full bg-slate-50 border-2 border-transparent focus:border-[#25D366] px-4 py-2.5 rounded-xl font-bold text-sm text-gray-900 outline-none transition-all resize-none placeholder:text-gray-400 custom-scrollbar"
                ></textarea>
              </div>

              <button
                type="submit"
                id="form-wa-submit"
                disabled={!name.trim() || !phone.trim() || !segment || !message.trim() || (segment === 'outros' && !otherSegment.trim())}
                className={`w-full text-white font-black text-xs uppercase tracking-widest py-3 rounded-xl flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-95 shadow-lg mt-1 gtm-wa-widget-submit ${
                  isOffline ? 'bg-red-500 hover:bg-red-600 shadow-red-500/20' : 'bg-[#25D366] hover:bg-[#20bd5a] shadow-[#25D366]/20'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <Send size={16} />
                {isOffline ? 'Deixar Mensagem' : 'Iniciar Conversa'}
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

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
