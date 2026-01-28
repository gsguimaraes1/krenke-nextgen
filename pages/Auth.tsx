import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, LogIn, UserPlus, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';

const AuthPage: React.FC = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

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
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
                navigate('/pgadmin');
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
                <div className="bg-white/5 backdrop-blur-xl rounded-[2.5rem] border border-white/10 p-8 md:p-12 shadow-2xl relative">
                    {/* Header */}
                    <div className="text-center mb-10">
                        <div className="inline-flex p-4 bg-gradient-to-tr from-krenke-orange to-orange-400 rounded-3xl shadow-lg shadow-orange-500/20 mb-6 group transition-transform hover:scale-110 duration-300">
                            <ShieldCheck size={32} className="text-white" />
                        </div>
                        <h1 className="text-3xl font-black text-white mb-2 tracking-tight">
                            Painel <span className="text-krenke-orange">Krenke</span>
                        </h1>
                        <p className="text-gray-400 text-sm font-medium uppercase tracking-widest">
                            {isLogin ? 'Acesso Restrito' : 'Cadastro de Admin'}
                        </p>
                    </div>

                    {/* Messages */}
                    <AnimatePresence mode="wait">
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl flex items-center gap-3 mb-6 text-sm"
                            >
                                <AlertCircle size={18} className="shrink-0" />
                                {error}
                            </motion.div>
                        )}
                        {success && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="bg-green-500/10 border border-green-500/20 text-green-400 p-4 rounded-2xl flex items-center gap-3 mb-6 text-sm font-bold"
                            >
                                <ShieldCheck size={18} className="shrink-0" />
                                Cadastro realizado! Verifique seu email.
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Form */}
                    <form onSubmit={handleAuth} className="space-y-5">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">E-mail Corporativo</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-krenke-orange transition-colors" size={20} />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white outline-none focus:border-krenke-orange/50 focus:ring-4 focus:ring-krenke-orange/20 transition-all placeholder:text-gray-600"
                                    placeholder="exemplo@krenke.com.br"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Senha de Acesso</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-krenke-orange transition-colors" size={20} />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white outline-none focus:border-krenke-orange/50 focus:ring-4 focus:ring-krenke-orange/20 transition-all placeholder:text-gray-600"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-krenke-orange to-orange-500 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-3 shadow-xl shadow-orange-600/20 hover:shadow-orange-600/40 hover:-translate-y-1 active:translate-y-0 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    {isLogin ? 'Entrar no Sistema' : 'Criar Conta de Admin'}
                                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

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
                        src="https://krenke.netlify.app/assets/logo%20branco_krenke-Cke-155N.png"
                        alt="Logo Krenke"
                        className="h-6 opacity-30 grayscale hover:grayscale-0 hover:opacity-100 transition-all mx-auto duration-500"
                    />
                </div>
            </motion.div>
        </div>
    );
};

export default AuthPage;
