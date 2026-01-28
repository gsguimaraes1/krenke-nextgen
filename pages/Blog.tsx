import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Link } from 'react-router-dom';
import { Calendar, User, ArrowRight, Search } from 'lucide-react';
import { motion } from 'framer-motion';

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
        <div className="bg-slate-50 min-h-screen pt-24 pb-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-6xl font-black text-krenke-blue mb-4"
                    >
                        Blog <span className="text-krenke-orange">Krenke</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-gray-600 text-lg max-w-2xl mx-auto"
                    >
                        Notícias, dicas e novidades sobre playgrounds, lazer e parques infantis.
                    </motion.p>
                </div>

                <div className="mb-12 relative max-w-xl mx-auto">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Buscar artigos..."
                        className="w-full pl-12 pr-4 py-4 rounded-2xl border-none shadow-sm focus:ring-2 focus:ring-krenke-orange outline-none transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="w-12 h-12 border-4 border-krenke-orange border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredPosts.map((post, index) => (
                            <motion.article
                                key={post.id}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all group border border-gray-100"
                            >
                                <Link to={`/blog/${post.slug}`} className="block">
                                    <div className="aspect-video overflow-hidden">
                                        <img
                                            src={post.cover_image || 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=1200'}
                                            alt={post.title}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                        />
                                    </div>
                                    <div className="p-8">
                                        <div className="flex items-center gap-4 text-xs text-gray-400 mb-4 font-bold uppercase tracking-wider">
                                            <span className="flex items-center gap-1"><Calendar size={14} /> {new Date(post.created_at).toLocaleDateString('pt-BR')}</span>
                                            <span className="flex items-center gap-1"><User size={14} /> {post.author}</span>
                                        </div>
                                        <h2 className="text-2xl font-black text-krenke-blue mb-4 leading-tight group-hover:text-krenke-orange transition-colors">
                                            {post.title}
                                        </h2>
                                        <p className="text-gray-500 line-clamp-3 mb-6 leading-relaxed">
                                            {post.excerpt}
                                        </p>
                                        <div className="flex items-center gap-2 text-krenke-orange font-black uppercase text-sm group-hover:gap-4 transition-all">
                                            Leia mais <ArrowRight size={18} />
                                        </div>
                                    </div>
                                </Link>
                            </motion.article>
                        ))}
                    </div>
                )}

                {!loading && filteredPosts.length === 0 && (
                    <div className="text-center py-20 bg-white rounded-3xl border border-dashed text-gray-400 font-bold">
                        Nenhum artigo encontrado.
                    </div>
                )}
            </div>
        </div>
    );
};

export default BlogPage;
