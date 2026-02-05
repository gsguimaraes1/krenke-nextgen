import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Calendar, User, ArrowLeft, Facebook, Twitter, Linkedin, Link as LinkIcon } from 'lucide-react';
import { motion } from 'framer-motion';

interface Post {
    id: string;
    title: string;
    slug: string;
    content: string;
    cover_image: string;
    author: string;
    created_at: string;
}

const BlogPostPage: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const [post, setPost] = useState<Post | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPost();
    }, [slug]);

    const fetchPost = async () => {
        try {
            const { data, error } = await supabase
                .from('posts')
                .select('*')
                .eq('slug', slug)
                .eq('published', true)
                .single();

            if (error) throw error;
            setPost(data);
        } catch (err) {
            console.error('Error fetching post:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center pt-20 bg-slate-50">
                <div className="w-12 h-12 border-4 border-krenke-orange border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!post) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center pt-20 bg-slate-50">
                <h1 className="text-4xl font-black text-krenke-blue mb-4">Post não encontrado</h1>
                <Link to="/blog" className="text-krenke-orange font-bold flex items-center gap-2">
                    <ArrowLeft size={20} /> Voltar ao Blog
                </Link>
            </div>
        );
    }

    return (
        <article className="bg-slate-50 min-h-screen pt-24 pb-20">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <Link
                    to="/blog"
                    className="inline-flex items-center gap-2 text-gray-500 hover:text-krenke-orange transition-colors mb-12 font-bold uppercase text-xs tracking-widest"
                >
                    <ArrowLeft size={16} /> Voltar ao Blog
                </Link>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <h1 className="text-4xl md:text-6xl font-black text-krenke-blue mb-8 leading-tight">
                        {post.title}
                    </h1>

                    <div className="flex flex-wrap items-center gap-6 mb-12 py-6 border-y border-gray-200">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-krenke-orange flex items-center justify-center text-white font-black">
                                {post.author.charAt(0)}
                            </div>
                            <div>
                                <p className="text-sm font-black text-gray-900 leading-none mb-1">{post.author}</p>
                                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Autor</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 text-gray-400 font-bold uppercase text-xs tracking-widest">
                            <Calendar size={16} className="text-krenke-orange" />
                            {new Date(post.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                        </div>
                    </div>

                    <div className="rounded-[40px] overflow-hidden shadow-2xl mb-16 aspect-video">
                        <img
                            src={post.cover_image || 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=1200'}
                            alt={post.title}
                            className="w-full h-full object-cover"
                        />
                    </div>

                    <div
                        className="prose prose-lg max-w-none prose-headings:text-krenke-blue prose-headings:font-black prose-p:text-gray-600 prose-img:rounded-3xl prose-a:text-krenke-orange font-medium"
                        dangerouslySetInnerHTML={{ __html: post.content }}
                    />

                    <div className="mt-20 pt-12 border-t border-gray-200">
                        <h3 className="text-xl font-black text-krenke-blue mb-6 uppercase tracking-wider">Compartilhe este artigo</h3>
                        <div className="flex gap-4">
                            {[
                                { icon: Facebook, color: 'bg-[#1877F2]' },
                                { icon: Twitter, color: 'bg-[#1DA1F2]' },
                                { icon: Linkedin, color: 'bg-[#0A66C2]' },
                                { icon: LinkIcon, color: 'bg-gray-800' }
                            ].map((social, i) => (
                                <button key={i} className={`${social.color} p-4 rounded-2xl text-white hover:scale-110 hover:-translate-y-1 transition-all shadow-lg`}>
                                    <social.icon size={20} />
                                </button>
                            ))}
                        </div>
                    </div>
                </motion.div>
            </div>
        </article>
    );
};

export default BlogPostPage;
