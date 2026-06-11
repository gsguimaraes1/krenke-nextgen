import React, { useEffect, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MessageCircle, CheckCircle2 } from 'lucide-react';
import logobranco from '../assets/Logos/krenke-brinquedos-logo-branco.webp';

const WA_NUMBER = '554733730693';

function gerarHash(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let hash = '';
  for (let i = 0; i < 6; i++) hash += chars[Math.floor(Math.random() * chars.length)];
  return hash;
}

const PARTICLES = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  delay: Math.random() * 2,
  size: 4 + Math.random() * 8,
  color: ['#F39200', '#009FE3', '#008D36', '#7F2082', '#E6007E'][i % 5],
}));

export default function ObrigadoPage() {
  const navigate = useNavigate();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hash = useMemo(() => gerarHash(), []);
  const waText = encodeURIComponent(
    `Olá! Acabei de enviar um orçamento pelo site Institucional e gostaria de obter mais informações.\n\nMeu Número de atendimento é ${hash}`
  );
  const waUrl = `https://api.whatsapp.com/send/?phone=${WA_NUMBER}&text=${waText}`;

  useEffect(() => {
    timerRef.current = setTimeout(() => { window.location.href = waUrl; }, 5000);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [waUrl]);

  return (
    <>
      <Helmet>
        <title>Obrigado pelo contato — Krenke Brinquedos</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <div className="min-h-screen bg-[#312783] relative overflow-hidden flex flex-col items-center justify-center px-4 py-16">

        {/* Gradient orbs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-[#F39200]/10 blur-[120px]" />
          <div className="absolute -bottom-40 -right-40 w-[600px] h-[600px] rounded-full bg-[#009FE3]/10 blur-[120px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-[#008D36]/5 blur-[100px]" />
        </div>

        {/* Floating particles */}
        {PARTICLES.map(p => (
          <motion.div
            key={p.id}
            className="absolute rounded-full opacity-30 pointer-events-none"
            style={{ left: `${p.x}%`, bottom: '-20px', width: p.size, height: p.size, backgroundColor: p.color }}
            animate={{ y: [0, -(600 + Math.random() * 400)], opacity: [0, 0.4, 0] }}
            transition={{ duration: 6 + Math.random() * 4, delay: p.delay, repeat: Infinity, ease: 'linear' }}
          />
        ))}

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 w-full max-w-2xl"
        >
          {/* Top gradient strip */}
          <div className="h-1.5 w-full rounded-t-[2.5rem] bg-gradient-to-r from-[#F39200] via-[#7F2082] to-[#008D36] bg-[length:200%_auto] animate-gradient-x" />

          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-b-[2.5rem] p-10 md:p-16 flex flex-col items-center text-center">

            {/* Logo */}
            <motion.img
              src={logobranco}
              alt="Krenke Brinquedos"
              className="h-10 mb-10 object-contain"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            />

            {/* Check icon */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 18, delay: 0.3 }}
              className="mb-8"
            >
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-[#008D36]/20 blur-2xl scale-150" />
                <div className="relative w-24 h-24 rounded-full bg-[#008D36]/15 border border-[#008D36]/30 flex items-center justify-center">
                  <CheckCircle2 className="w-12 h-12 text-[#008D36]" strokeWidth={1.5} />
                </div>
              </div>
            </motion.div>

            {/* Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter leading-none mb-4"
            >
              OBRIGADO<span className="text-[#F39200]">!</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55 }}
              className="text-white/60 text-lg font-medium max-w-md mb-2"
            >
              Seu contato foi recebido com sucesso.
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.62 }}
              className="text-white/40 text-base max-w-sm mb-4"
            >
              Nossa equipe vai analisar sua solicitação e entrar em contato em breve com uma proposta personalizada.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.68 }}
              className="mb-12 flex flex-col items-center gap-1"
            >
              <span className="text-white/30 text-xs uppercase tracking-widest font-bold">Número de atendimento</span>
              <span className="text-[#F39200] text-2xl font-black tracking-[0.3em]">{hash}</span>
            </motion.div>

            {/* Divider */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.7, duration: 0.4 }}
              className="w-full h-px bg-white/10 mb-10"
            />

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.75 }}
              className="flex flex-col sm:flex-row gap-4 w-full"
            >
              <a
                href={waUrl}
                className="flex-1 flex items-center justify-center gap-3 bg-[#25D366] hover:bg-[#1ebe5d] text-white font-black uppercase tracking-wide text-sm py-4 px-6 rounded-2xl transition-all duration-200 hover:scale-[1.02] hover:shadow-[0_8px_30px_rgba(37,211,102,0.35)]"
              >
                <MessageCircle className="w-5 h-5" strokeWidth={2.5} />
                Falar no WhatsApp
              </a>

              <button
                onClick={() => navigate('/')}
                className="flex-1 flex items-center justify-center gap-3 bg-white/8 hover:bg-white/12 border border-white/15 text-white font-black uppercase tracking-wide text-sm py-4 px-6 rounded-2xl transition-all duration-200 hover:scale-[1.02]"
              >
                <ArrowLeft className="w-5 h-5" strokeWidth={2.5} />
                Voltar ao site
              </button>
            </motion.div>

            {/* Auto redirect hint */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
              className="text-white/20 text-xs mt-8"
            >
              Redirecionando para o WhatsApp em 5 segundos...
            </motion.p>
          </div>
        </motion.div>

        {/* Bottom decorative line */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4 }}
          className="relative z-10 mt-10 text-white/20 text-xs font-medium tracking-widest uppercase"
        >
          Krenke Brinquedos • Qualidade que dura
        </motion.p>
      </div>
    </>
  );
}
