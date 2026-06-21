import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { AnimatePresence, motion } from 'framer-motion';
import { Eye, EyeOff, ShieldCheck, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import { Turnstile } from '@marsidev/react-turnstile';
import type { TurnstileInstance } from '@marsidev/react-turnstile';
import logoBranco from '../assets/Logos/krenke-brinquedos-logo-branco.webp';

const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY as string;

// ── Images ─────────────────────────────────────────────────────────────────
const imageModules = import.meta.glob('../assets/login/*.webp', { eager: true }) as Record<
  string,
  { default: string }
>;
const LOGIN_IMAGES = Object.values(imageModules).map((m) => m.default);

const QUOTES = [
  { text: 'Onde cada brinquedo conta uma história.', author: 'Krenke Brinquedos' },
  { text: 'Qualidade que encanta, diversão que inspira.', author: 'Krenke Brinquedos' },
  { text: 'Inovação no mundo dos brinquedos.', author: 'Krenke Brinquedos' },
  { text: 'Transformando momentos em memórias.', author: 'Krenke Brinquedos' },
];

// ── Typewriter ─────────────────────────────────────────────────────────────
function Typewriter({ text, speed = 60 }: { text: string; speed?: number }) {
  const [display, setDisplay] = useState('');
  const [idx, setIdx] = useState(0);

  useEffect(() => { setDisplay(''); setIdx(0); }, [text]);
  useEffect(() => {
    if (idx >= text.length) return;
    const t = setTimeout(() => {
      setDisplay((p) => p + text[idx]);
      setIdx((p) => p + 1);
    }, speed);
    return () => clearTimeout(t);
  }, [idx, text, speed]);

  return <span>{display}<span className="animate-pulse opacity-60">|</span></span>;
}

// ── Glass input wrapper ────────────────────────────────────────────────────
function GlassInput({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm transition-all duration-200 focus-within:border-krenke-orange/50 focus-within:bg-krenke-orange/5 focus-within:shadow-[0_0_0_3px_rgba(243,146,0,0.08)]">
      {children}
    </div>
  );
}

// ── Login spark button ─────────────────────────────────────────────────────
type BtnStatus = 'idle' | 'saving' | 'saved';

function LoginButton({ loading }: { loading: boolean }) {
  const [btnStatus, setBtnStatus] = useState<BtnStatus>('idle');

  useEffect(() => {
    if (loading && btnStatus === 'idle') setBtnStatus('saving');
    if (!loading && btnStatus === 'saving') {
      // form submission handles navigation; just reset
      setBtnStatus('idle');
    }
  }, [loading]);

  return (
    <div className="relative w-full">
      <motion.button
        id="btn-entrar"
        type="submit"
        disabled={loading}
        aria-label="Entrar no Sistema"
        animate={btnStatus}
        variants={{
          idle:   { scale: 1 },
          saving: { scale: 1 },
          saved:  { scale: [1, 1.05, 1], transition: { duration: 0.25 } },
        }}
        whileHover={!loading ? { scale: 1.02 } : {}}
        whileTap={!loading ? { scale: 0.97 } : {}}
        className="group relative grid w-full overflow-hidden rounded-2xl px-6 py-4 btn-white-border transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60"
        style={{ minHeight: 56 }}
      >
        {/* Spark ring — idle only */}
        {!loading && (
          <span>
            <span className="spark mask-gradient absolute inset-0 h-full w-full animate-flip overflow-hidden rounded-2xl [mask:linear-gradient(black,_transparent_50%)] before:absolute before:aspect-square before:w-[200%] before:rotate-[-90deg] before:animate-rotate before:bg-[conic-gradient(from_0deg,transparent_0_340deg,rgba(243,146,0,0.9)_360deg)] before:content-[''] before:[inset:0_auto_auto_50%] before:[translate:-50%_-15%]" />
          </span>
        )}

        {/* Backdrop — orange fill */}
        <span className="backdrop absolute inset-px rounded-[14px] bg-gradient-to-r from-vibrant-orange to-krenke-orange shadow-lg shadow-orange-600/25 transition-all duration-200 group-hover:shadow-orange-600/40" />

        {/* Label */}
        <span className="relative z-10 flex items-center justify-center gap-2 text-sm font-bold text-white">
          <AnimatePresence mode="wait">
            {loading && (
              <motion.span key="spin" initial={{ opacity: 0 }} animate={{ opacity: 1, rotate: 360 }} exit={{ opacity: 0 }} transition={{ rotate: { repeat: Infinity, duration: 1, ease: 'linear' } }}>
                <Loader2 size={16} />
              </motion.span>
            )}
          </AnimatePresence>
          <motion.span
            key={loading ? 'loading' : 'idle'}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
          >
            {loading ? 'Entrando…' : 'Entrar no Sistema'}
          </motion.span>
          {!loading && (
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform duration-200" />
          )}
        </span>
      </motion.button>

      {/* Sparkle badge */}
      <AnimatePresence>
        {btnStatus === 'saved' && (
          <motion.div
            className="absolute -top-1 -right-1"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
          >
            <Sparkles size={20} className="text-yellow-400" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Error translation ──────────────────────────────────────────────────────
const translateError = (msg: string): string => {
  if (!msg) return 'Ocorreu um erro na autenticação.';
  const lower = msg.toLowerCase();
  if (lower.includes('invalid login credentials') || lower.includes('invalid credentials'))
    return 'E-mail ou senha inválidos. Verifique suas credenciais.';
  if (lower.includes('email not confirmed'))
    return 'E-mail não confirmado. Verifique sua caixa de entrada.';
  if (lower.includes('rate limit'))
    return 'Muitas tentativas. Aguarde alguns minutos e tente novamente.';
  if (lower.includes('network') || lower.includes('fetch'))
    return 'Erro de conexão. Verifique sua internet.';
  return msg;
};

// ── Main page ──────────────────────────────────────────────────────────────
const AuthPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [mfaCode, setMfaCode] = useState('');
  const [mfaChallengeId, setMfaChallengeId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [imgIndex, setImgIndex] = useState(0);
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const turnstileRef = useRef<TurnstileInstance>(null);

  const navigate = useNavigate();

  useEffect(() => {
    if (!supabase) return;
    void supabase.auth.getSession().then((result: { data: { session: unknown } }) => {
      if (result.data.session) navigate('/pgadmin', { replace: true });
    });
  }, [navigate]);

  useEffect(() => {
    if (LOGIN_IMAGES.length === 0) return;
    const t = setInterval(() => {
      setImgIndex((p) => (p + 1) % LOGIN_IMAGES.length);
      setQuoteIndex((p) => (p + 1) % QUOTES.length);
    }, 6000);
    return () => clearInterval(t);
  }, []);

  const handleMFAVerify = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    if (!supabase || !mfaChallengeId) return;
    try {
      const { error } = await supabase.auth.mfa.verify({ challengeId: mfaChallengeId, code: mfaCode });
      if (error) throw error;
      navigate('/pgadmin');
    } catch (err: any) {
      setError(err.message || 'Código MFA inválido.');
    } finally {
      setLoading(false);
    }
  };

  const handleAuth = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    if (!supabase) {
      setError('Sistema de autenticação não configurado.');
      return;
    }

    if (!captchaToken) {
      setError('Complete a verificação de segurança antes de entrar.');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password, options: { captchaToken: captchaToken ?? undefined } });
      if (error) throw error;
      const { data: factors, error: mfaError } = await supabase.auth.mfa.listFactors();
      if (mfaError) throw mfaError;
      const totpFactor = factors.all.find(
        (f: { factor_type: string; status: string; id: string }) =>
          f.factor_type === 'totp' && f.status === 'verified',
      );
      if (totpFactor) {
        const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({
          factorId: totpFactor.id,
        });
        if (challengeError) throw challengeError;
        setMfaChallengeId(challenge.id);
      } else {
        navigate('/pgadmin');
      }
    } catch (err: any) {
      setError(translateError(err.message));
      setCaptchaToken(null);
      turnstileRef.current?.reset();
    } finally {
      setLoading(false);
    }
  };

  const currentImage = LOGIN_IMAGES[imgIndex];
  const currentQuote = QUOTES[quoteIndex];

  return (
    <div className="h-[100dvh] flex flex-col md:flex-row bg-[#0F0C29] overflow-hidden">

      {/* ── Left: Form ── */}
      <section className="flex flex-1 items-center justify-center p-8 relative">

        <div className="w-full max-w-sm relative z-10">

          {/* Logo + header */}
          <div className="mb-10">
            <div className="animate-element animate-delay-100 flex items-center gap-3 mb-8">
              <div className="p-2.5 bg-gradient-to-tr from-vibrant-orange to-krenke-orange rounded-xl shadow-lg shadow-orange-500/20">
                <ShieldCheck size={22} className="text-white" />
              </div>
              <img src={logoBranco} alt="Krenke Brinquedos" className="h-8 object-contain" />
            </div>

            <h1 className="animate-element animate-delay-200 text-4xl font-semibold text-white leading-tight tracking-tight">
              Bem-vindo<span className="text-krenke-orange">.</span>
            </h1>
            <p className="animate-element animate-delay-300 mt-2 text-gray-400 text-sm">
              {mfaChallengeId
                ? 'Insira o código do seu aplicativo de autenticação.'
                : 'Acesse o sistema de gestão Krenke.'}
            </p>
          </div>

          {/* Error */}
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                key="error"
                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, height: 'auto', marginBottom: 20 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                className="overflow-hidden"
              >
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-xs font-semibold flex items-center gap-2.5">
                  <div className="w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse shrink-0" />
                  {error}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* MFA */}
          {mfaChallengeId ? (
            <form onSubmit={handleMFAVerify} className="space-y-5">
              <div className="animate-element animate-delay-300">
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2 text-center">
                  Código 2FA
                </label>
                <GlassInput>
                  <input
                    type="text"
                    value={mfaCode}
                    onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    required
                    autoFocus
                    placeholder="000000"
                    className="w-full bg-transparent py-4 px-4 text-center text-3xl font-black text-krenke-orange tracking-[0.5em] outline-none placeholder:text-gray-700 rounded-2xl"
                  />
                </GlassInput>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="animate-element animate-delay-400 w-full bg-gradient-to-r from-vibrant-orange to-krenke-orange text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-orange-600/30 active:scale-[0.98] transition-all duration-200 disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <><ShieldCheck size={18} />Verificar Código</>
                )}
              </button>

              <button
                type="button"
                onClick={() => setMfaChallengeId(null)}
                className="w-full text-xs text-gray-500 hover:text-gray-300 transition-colors py-2"
              >
                ← Voltar para Login
              </button>
            </form>

          ) : (
            /* Login form */
            <form onSubmit={handleAuth} className="space-y-5">

              {/* Email */}
              <div className="animate-element animate-delay-300">
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">
                  E-mail
                </label>
                <GlassInput>
                  <input
                    type="email"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    placeholder="seu@krenke.com.br"
                    className="w-full bg-transparent text-sm text-white py-4 px-4 rounded-2xl outline-none placeholder:text-gray-600"
                  />
                </GlassInput>
              </div>

              {/* Password */}
              <div className="animate-element animate-delay-400">
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">
                  Senha
                </label>
                <GlassInput>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoComplete="current-password"
                      placeholder="••••••••"
                      className="w-full bg-transparent text-sm text-white py-4 pl-4 pr-12 rounded-2xl outline-none placeholder:text-gray-600"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((p) => !p)}
                      className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-300 transition-colors"
                      aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                    >
                      {showPassword
                        ? <EyeOff className="w-4 h-4" />
                        : <Eye className="w-4 h-4" />
                      }
                    </button>
                  </div>
                </GlassInput>
              </div>

              {/* Turnstile invisible CAPTCHA */}
              <Turnstile
                ref={turnstileRef}
                siteKey={TURNSTILE_SITE_KEY}
                onSuccess={(token) => setCaptchaToken(token)}
                onExpire={() => { setCaptchaToken(null); turnstileRef.current?.reset(); }}
                options={{ size: 'flexible', theme: 'dark' }}
              />

              {/* Submit */}
              <div className="animate-element animate-delay-500 pt-2">
                <LoginButton loading={loading} />
              </div>

              {/* Bottom tag */}
              <p className="animate-element animate-delay-600 text-center text-[11px] text-gray-600 pt-1">
                <ShieldCheck size={11} className="inline mr-1 text-krenke-orange/60" />
                Acesso restrito · Autenticação 256-bit
              </p>
            </form>
          )}
        </div>
      </section>

      {/* ── Right: Image panel ── */}
      <section className="hidden md:block flex-1 relative p-4">
        <AnimatePresence mode="sync">
          <motion.div
            key={currentImage}
            initial={{ opacity: 0, scale: 1.03 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.9, ease: 'easeInOut' }}
            className="animate-slide-right animate-delay-300 absolute inset-4 rounded-3xl bg-cover bg-center"
            style={{ backgroundImage: `url(${currentImage})` }}
          />
        </AnimatePresence>

        {/* Gradient overlay */}
        <div className="absolute inset-4 rounded-3xl bg-gradient-to-t from-[#0F0C29] via-[#0F0C29]/15 to-transparent pointer-events-none" />
        <div className="absolute inset-4 rounded-3xl bg-gradient-to-r from-[#0F0C29]/30 to-transparent pointer-events-none" />

        {/* Top-right logo */}
        <div className="absolute top-10 right-10 z-10">
          <img src={logoBranco} alt="Krenke" className="h-8 object-contain drop-shadow-xl opacity-70" />
        </div>

        {/* Bottom: quote + dots */}
        <div className="absolute bottom-10 left-10 right-10 z-10">
          <AnimatePresence mode="wait">
            <motion.blockquote
              key={quoteIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.45 }}
              className="mb-5"
            >
              <p className="text-lg font-medium text-white leading-relaxed drop-shadow-sm">
                "<Typewriter key={currentQuote.text} text={currentQuote.text} speed={55} />"
              </p>
              <cite className="block mt-2 text-xs font-semibold text-krenke-orange not-italic tracking-widest uppercase">
                — {currentQuote.author}
              </cite>
            </motion.blockquote>
          </AnimatePresence>

          {/* Dot nav */}
          {LOGIN_IMAGES.length > 1 && (
            <div className="flex gap-1.5">
              {LOGIN_IMAGES.map((_, i) => (
                <button
                  key={i}
                  onClick={() => { setImgIndex(i); setQuoteIndex(i % QUOTES.length); }}
                  className={`h-1 rounded-full transition-all duration-300 ${
                    i === imgIndex ? 'w-6 bg-krenke-orange' : 'w-1.5 bg-white/25 hover:bg-white/50'
                  }`}
                  aria-label={`Imagem ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default AuthPage;
