import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Link } from 'react-router-dom';
import { Calendar, User, ArrowRight, Search, Clock, Hash } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Post {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    cover_image: string;
    author: string;
    created_at: string;
}

const BlogPage: React.FC = () => {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        if (!supabase) {
            setLoading(false);
            return;
        }
        try {
            const { data, error } = await supabase
                .from('posts')
                .select('*')
                .eq('published', true)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setPosts(data || []);
        } catch (err) {
            console.error('Error fetching blog posts:', err);
        } finally {
            setLoading(false);
        }
    };

    const filteredPosts = posts.filter(post =>
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="bg-slate-50 min-h-screen pb-32 overflow-x-hidden">
            {/* Editorial Hero Section */}
            <div className="relative h-[500px] md:h-[650px] overflow-hidden flex items-center bg-krenke-purple">
                {/* Background Decorations */}
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-gradient-to-br from-krenke-purple via-vibrant-purple to-vibrant-orange opacity-40 mix-blend-overlay"></div>
                    <motion.div
                        animate={{
                            scale: [1, 1.2, 1],
                            rotate: [0, 10, 0]
                        }}
                        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                        className="absolute -top-[20%] -left-[10%] w-[60%] h-[120%] bg-vibrant-purple/10 blur-[150px] rounded-full"
                    ></motion.div>
                </div>

                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="max-w-4xl"
                    >
                        <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 text-white text-xs font-black uppercase tracking-[0.3em] mb-10">
                            <span className="w-2 h-2 rounded-full bg-vibrant-orange animate-pulse shadow-vibrant-orange"></span>
                            Universo Krenke
                        </div>

                        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white leading-[0.8] tracking-tighter mb-10 uppercase drop-shadow-2xl">
                            INSIGHTS & <br />
                            <span className="text-vibrant-orange">INFORMAÇÃO</span>
                        </h1>

                        <p className="text-2xl text-gray-300 font-medium leading-relaxed max-w-2xl border-l-4 border-vibrant-orange pl-8">
                            Mergulhe nas tendências pedagógicas, segurança em playgrounds e as últimas novidades do mundo do lazer infantil.
                        </p>
                    </motion.div>
                </div>

                <div className="absolute bottom-0 left-0 w-full h-40 bg-gradient-to-t from-slate-50 to-transparent"></div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 relative z-20">
                {/* Search Bar - Radical Design */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-3xl mx-auto relative group"
                >
                    <div className="absolute -inset-2 bg-gradient-to-r from-vibrant-orange to-vibrant-purple rounded-[3rem] opacity-20 blur-xl group-focus-within:opacity-40 transition-all duration-500"></div>
                    <div className="relative">
                        <Search className="absolute left-8 top-1/2 -translate-y-1/2 text-vibrant-orange" size={28} />
                        <input
                            type="text"
                            placeholder="Encontre artigos, dicas e guias..."
                            className="w-full pl-20 pr-10 py-8 bg-white rounded-[2.5rem] shadow-premium border-2 border-transparent focus:border-vibrant-orange outline-none transition-all font-black text-xl text-gray-900 placeholder:text-gray-300"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </motion.div>

                {/* Blog Grid */}
                <div className="py-24">
                    {loading ? (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="aspect-[4/5] bg-white rounded-[3rem] animate-pulse"></div>
                            ))}
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12">
                            <AnimatePresence mode='popLayout'>
                                {filteredPosts.map((post, index) => (
                                    <motion.article
                                        key={post.id}
                                        layout
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="group"
                                    >
                                        <Link to={`/blog/${post.slug}`} className="block relative">
                                            <div className="absolute -inset-2 bg-gradient-to-tr from-vibrant-orange/40 to-vibrant-purple/40 rounded-[3.5rem] opacity-0 group-hover:opacity-100 blur-2xl transition-all duration-700 -z-10"></div>

                                            <div className="relative bg-white rounded-[3rem] overflow-hidden shadow-premium border border-slate-100 h-full flex flex-col transform transition-all duration-700 group-hover:-translate-y-4">
                                                {/* Image Container */}
                                                <div className="relative aspect-[4/3] overflow-hidden">
                                                    <img
                                                        src={post.cover_image || 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=1200'}
                                                        alt={post.title}
                                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 grayscale-[0.2] group-hover:grayscale-0"
                                                    />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-krenke-purple/80 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-all duration-500"></div>

                                                    {/* Category Floating Badge */}
                                                    <div className="absolute top-6 left-6 px-4 py-1.5 rounded-full bg-vibrant-orange text-white text-[10px] font-black uppercase tracking-widest shadow-2xl">
                                                        Novidades
                                                    </div>
                                                </div>

                                                {/* Content Container */}
                                                <div className="p-10 flex-grow flex flex-col">
                                                    <div className="flex items-center gap-6 text-[10px] font-black uppercase tracking-widest text-gray-400 mb-6">
                                                        <span className="flex items-center gap-2"><Calendar size={12} className="text-vibrant-orange" /> {new Date(post.created_at).toLocaleDateString('pt-BR')}</span>
                                                        <span className="flex items-center gap-2 font-bold"><Clock size={12} className="text-vibrant-orange" /> 5 min leitura</span>
                                                    </div>

                                                    <h2 className="text-3xl font-black text-gray-900 mb-6 leading-[1.1] tracking-tighter group-hover:text-vibrant-orange transition-colors">
                                                        {post.title}
                                                    </h2>

                                                    <p className="text-gray-400 font-medium line-clamp-3 mb-8 leading-relaxed italic">
                                                        {post.excerpt}
                                                    </p>

                                                    <div className="mt-auto pt-8 border-t border-slate-50 flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-gray-400">
                                                                <User size={14} />
                                                            </div>
                                                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-900">{post.author}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2 text-vibrant-orange font-black text-xs uppercase tracking-tighter group-hover:gap-4 transition-all">
                                                            Explorar Artigo <ArrowRight size={16} strokeWidth={3} />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    </motion.article>
                                ))}
                            </AnimatePresence>
                        </div>
                    )}

                    {!loading && filteredPosts.length === 0 && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center py-40 border-2 border-dashed border-slate-200 rounded-[3rem] bg-white flex flex-col items-center gap-6"
                        >
                            <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center text-gray-300">
                                <Hash size={40} />
                            </div>
                            <div>
                                <h3 className="text-3xl font-black text-gray-900 uppercase tracking-tighter">Artigo não encontrado</h3>
                                <p className="text-gray-400 font-medium">Tente buscar por termos mais genéricos ou outras categorias.</p>
                            </div>
                            <button
                                onClick={() => setSearchTerm('')}
                                className="px-10 py-4 bg-krenke-purple text-white font-black uppercase text-xs tracking-widest rounded-2xl hover:bg-vibrant-orange transition-all"
                            >
                                Ver todos os posts
                            </button>
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BlogPage;
