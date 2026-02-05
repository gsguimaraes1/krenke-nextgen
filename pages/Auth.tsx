import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, LogIn, UserPlus, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import logoBranco from '../assets/Logos/krenke-brinquedos-logo-branco.png';

const AuthPage: React.FC = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [mfaCode, setMfaCode] = useState('');
    const [mfaChallengeId, setMfaChallengeId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

    const handleMFAVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (!supabase || !mfaChallengeId) return;

        try {
            const { error } = await supabase.auth.mfa.verify({
                challengeId: mfaChallengeId,
                code: mfaCode,
            });
            if (error) throw error;
            navigate('/pgadmin');
        } catch (err: any) {
            setError(err.message || 'Código MFA inválido.');
        } finally {
            setLoading(false);
        }
    };

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (!supabase) {
            setError('Sistema de autenticação não configurado.');
            setLoading(false);
            return;
        }

        try {
            if (isLogin) {
                const { data, error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;

                // Check for MFA
                const { data: factors, error: mfaError } = await supabase.auth.mfa.listFactors();
                if (mfaError) throw mfaError;

                const totpFactor = factors.all.find(f => f.factor_type === 'totp' && f.status === 'verified');

                if (totpFactor) {
                    const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({
                        factorId: totpFactor.id,
                    });
                    if (challengeError) throw challengeError;
                    setMfaChallengeId(challenge.id);
                } else {
                    navigate('/pgadmin');
                }
            } else {
                const { error } = await supabase.auth.signUp({ email, password });
                if (error) throw error;
                setSuccess(true);
                setTimeout(() => {
                    setIsLogin(true);
                    setSuccess(false);
                }, 3000);
            }
        } catch (err: any) {
            setError(err.message || 'Ocorreu um erro na autenticação.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0F0C29] flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[120px]" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-orange-600/10 rounded-full blur-[120px]" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md"
            >
                <div className="bg-[#1a164d]/60 backdrop-blur-3xl rounded-[3rem] border border-white/10 p-10 md:p-14 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.5)] relative overflow-hidden">
                    {/* Decorative radial gradients inside the card */}
                    <div className="absolute -top-24 -right-24 w-48 h-48 bg-orange-600/20 rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

                    {/* Header */}
                    <div className="text-center mb-12 relative z-10">
                        <motion.div
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            className="inline-flex p-5 bg-gradient-to-tr from-vibrant-orange to-orange-400 rounded-3xl shadow-2xl shadow-orange-500/20 mb-8 group transition-transform hover:scale-110 duration-500"
                        >
                            <ShieldCheck size={40} className="text-white" />
                        </motion.div>
                        <div className="flex justify-center mb-6">
                            <img src={logoBranco} alt="Krenke Brinquedos" className="h-12 object-contain drop-shadow-lg" />
                        </div>
                        <div className="flex flex-col gap-1 items-center">
                            <p className="text-vibrant-orange text-[12px] font-black uppercase tracking-[0.4em] mb-1">
                                SISTEMA DE GESTÃO
                            </p>
                            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.2em]">
                                {isLogin ? 'Autenticação Segura 256-bit' : 'Solicitar Token de Acesso'}
                            </p>
                        </div>
                    </div>

                    {/* Feedback Messages */}
                    <AnimatePresence mode="wait">
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mb-6 overflow-hidden"
                            >
                                <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-5 py-4 rounded-2xl text-xs font-bold flex items-center gap-3">
                                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse flex-shrink-0" />
                                    {error}
                                </div>
                            </motion.div>
                        )}
                        {success && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mb-6 overflow-hidden"
                            >
                                <div className="bg-green-500/10 border border-green-500/20 text-green-500 px-5 py-4 rounded-2xl text-xs font-bold flex items-center gap-3">
                                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse flex-shrink-0" />
                                    Solicitação enviada com sucesso! Aguarde aprovação.
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {mfaChallengeId ? (
                        <form onSubmit={handleMFAVerify} className="space-y-6 relative z-10">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 text-center block">Código de Verificação (2FA)</label>
                                <div className="relative group text-center">
                                    <input
                                        type="text"
                                        value={mfaCode}
                                        onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                        required
                                        autoFocus
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-4 text-center text-3xl font-black text-krenke-orange tracking-[0.5em] outline-none focus:border-krenke-orange/50 focus:ring-4 focus:ring-krenke-orange/20 transition-all placeholder:text-gray-600"
                                        placeholder="000000"
                                    />
                                </div>
                                <p className="text-[11px] text-gray-500 text-center mt-2">Insira o código gerado pelo seu aplicativo de autenticação.</p>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-krenke-orange to-orange-500 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-3 shadow-xl shadow-orange-600/20 hover:shadow-orange-600/40 hover:-translate-y-1 transition-all disabled:opacity-50 group"
                            >
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        Verificar Código
                                        <ShieldCheck size={20} />
                                    </>
                                )}
                            </button>

                            <button
                                type="button"
                                onClick={() => setMfaChallengeId(null)}
                                className="w-full text-xs text-gray-500 hover:text-white transition-colors py-2"
                            >
                                Voltar para Login
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleAuth} className="space-y-5">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">E-mail Corporativo</label>
                                <div className="relative group">
                                    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-vibrant-orange transition-colors" size={20} />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-14 pr-6 text-white outline-none focus:border-vibrant-orange/50 focus:ring-4 focus:ring-vibrant-orange/10 transition-all placeholder:text-gray-600 font-medium"
                                        placeholder="exemplo@krenke.com.br"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Senha de Acesso</label>
                                <div className="relative group">
                                    <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-vibrant-orange transition-colors" size={20} />
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-14 pr-6 text-white outline-none focus:border-vibrant-orange/50 focus:ring-4 focus:ring-vibrant-orange/10 transition-all placeholder:text-gray-600 font-medium"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-vibrant-orange to-orange-500 text-white font-black py-5 rounded-2xl flex items-center justify-center gap-3 shadow-2xl shadow-orange-600/30 hover:shadow-orange-600/50 hover:-translate-y-1 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed group text-lg"
                            >
                                {loading ? (
                                    <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        {isLogin ? 'Entrar no Sistema' : 'Solicitar Cadastro'}
                                        <ArrowRight size={22} className="group-hover:translate-x-2 transition-transform" />
                                    </>
                                )}
                            </button>
                        </form>
                    )}

                    {/* Footer Toggle */}
                    <div className="mt-8 text-center pt-8 border-t border-white/5">
                        <button
                            onClick={() => {
                                setIsLogin(!isLogin);
                                setError(null);
                            }}
                            className="text-sm font-bold text-gray-400 hover:text-white transition-colors inline-flex items-center gap-2"
                        >
                            {isLogin ? (
                                <>
                                    <UserPlus size={16} className="text-krenke-orange" />
                                    Não tem acesso? Solicitar cadastro
                                </>
                            ) : (
                                <>
                                    <LogIn size={16} className="text-krenke-orange" />
                                    Já possui conta? Fazer login
                                </>
                            )}
                        </button>
                    </div>
                </div>

                <div className="mt-8 text-center">
                    <img
                        src={logoBranco}
                        alt="Logo Krenke"
                        className="h-6 opacity-30 grayscale hover:grayscale-0 hover:opacity-100 transition-all mx-auto duration-500"
                    />
                </div>
            </motion.div>
        </div>
    );
};

export default AuthPage;
