import React, { useEffect, useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { supabase } from '../lib/supabase';
import { Page } from '../types';
import { Layout } from '../components/Layout';
import { Preloader } from '../components/Preloader';
import { sanitizeHtml } from '../lib/sanitize';

export const DynamicPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [page, setPage] = useState<Page | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchPage = async () => {
      if (!slug) return;
      
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('pages')
          .select('*')
          .eq('slug', slug)
          .eq('is_published', true)
          .single();

        if (error || !data) {
          setError(true);
        } else {
          setPage(data);
        }
      } catch (err) {
        console.error('Error fetching dynamic page:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchPage();
  }, [slug]);

  if (loading) return <Preloader />;
  if (error || !page) return <Navigate to="/404" replace />;

  return (
    <div className="pt-32 pb-24 min-h-screen bg-gray-50">
      <Helmet>
        <title>{`${page.title} | Playgrounds Krenke`}</title>
        <meta name="description" content={page.content.replace(/<[^>]*>?/gm, '').substring(0, 160)} />
        <link rel="canonical" href={`https://site.krenke.com.br/${page.slug}`} />
      </Helmet>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          {page.cover_image && (
            <div className="w-full h-64 md:h-96 relative">
              <img 
                src={page.cover_image} 
                alt={`Playground Krenke - ${page.title}`} 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-8 md:p-12">
                 <h1 className="text-3xl md:text-5xl font-black text-white">{page.title}</h1>
              </div>
            </div>
          )}
          
          <div className={`p-8 md:p-12 ${!page.cover_image ? 'pt-16' : ''}`}>
            {!page.cover_image && (
              <h1 className="text-3xl md:text-5xl font-black text-krenke-blue mb-12 border-b pb-8">{page.title}</h1>
            )}
            
            <div 
              className="prose prose-lg max-w-none prose-headings:text-krenke-blue prose-a:text-krenke-orange prose-img:rounded-2xl space-y-6"
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(page.content) }}
            />
          </div>
        </div>

      </div>
    </div>
  );
};

export default DynamicPage;
