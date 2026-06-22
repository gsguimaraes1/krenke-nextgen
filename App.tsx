import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Outlet, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Preloader } from './components/Preloader';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';

// Importando a home estaticamente para o carregamento inicial mais rápido
import HomePage from './pages/Home';

// Code-splitting (Lazy loading) para o resto das rotas
const AboutPage = React.lazy(() => import('./pages/About'));
const ProductsPage = React.lazy(() => import('./pages/Products'));
const QuotePage = React.lazy(() => import('./pages/Quote'));
const ProjectsPage = React.lazy(() => import('./pages/Projects'));
const AdminPage = React.lazy(() => import('./pages/Admin'));
const BlogPage = React.lazy(() => import('./pages/Blog'));
const BlogPostPage = React.lazy(() => import('./pages/BlogPost'));
const PrivacyPage = React.lazy(() => import('./pages/Privacy'));
const TermsPage = React.lazy(() => import('./pages/Terms'));
const DownloadsPage = React.lazy(() => import('./pages/Downloads'));
const AuthPage = React.lazy(() => import('./pages/Auth'));
const CatalogoPage = React.lazy(() => import('./pages/Catalogo'));
const DynamicPage = React.lazy(() => import('./pages/DynamicPage'));
const ResellerArea = React.lazy(() => import('./pages/ResellerArea'));
const LpPage = React.lazy(() => import('./pages/Lp'));
const ObrigadoPage = React.lazy(() => import('./pages/Obrigado'));
const CareersPage = React.lazy(() => import('./pages/Careers'));
const ObrigadoCurriculoPage = React.lazy(() => import('./pages/ObrigadoCurriculo'));

import { captureUTMs } from './lib/utm-tracker';
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";

// Scroll to top on route change and trigger GTM pageview
const ScrollToTop = () => {
  const { pathname, search } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
    
    // Capture UTMs on every page load/change
    captureUTMs();

    // Notify GTM about the page change
    if ((window as any).dataLayer) {
      (window as any).dataLayer.push({
        event: 'pageview',
        path: pathname + search,
        title: document.title
      });
    }
  }, [pathname, search]);
  return null;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Preloader />
        <ScrollToTop />
        <React.Suspense fallback={<div className="h-screen w-screen bg-[#312783] flex items-center justify-center"><div className="w-10 h-10 border-4 border-white/20 border-t-vibrant-orange rounded-full animate-spin"></div></div>}>
          <Routes>
            {/* Public Routes with Main Layout */}
            <Route element={<Layout><Outlet /></Layout>}>
              <Route path="/" element={<HomePage />} />
              <Route path="/empresa" element={<AboutPage />} />
              <Route path="/produtos" element={<ProductsPage />} />
              <Route path="/produtos/categoria/:categoriaSlug" element={<ProductsPage />} />
              <Route path="/blog" element={<BlogPage />} />
              <Route path="/blog/:slug" element={<BlogPostPage />} />
              <Route path="/projetos" element={<ProjectsPage />} />
              <Route path="/downloads" element={<DownloadsPage />} />
              <Route path="/catalogo" element={<CatalogoPage />} />
              <Route path="/orcamento" element={<QuotePage />} />
              <Route path="/trabalhe-conosco" element={<CareersPage />} />
              <Route path="/politica-de-privacidade" element={<PrivacyPage />} />
              <Route path="/termos-de-uso" element={<TermsPage />} />
              <Route path="/404" element={<Navigate to="/" replace />} />
              <Route path="/:slug" element={<DynamicPage />} />
            </Route>

            {/* Landing Page - no main layout */}
            <Route path="/lp" element={<LpPage />} />

            {/* Thank you pages - no main layout */}
            <Route path="/obrigado" element={<ObrigadoPage />} />
            <Route path="/obrigado-curriculo" element={<ObrigadoCurriculoPage />} />

            {/* Deep Link WebView redirect - no layout */}

            {/* Auth Route */}
            <Route path="/login" element={<AuthPage />} />

            {/* Admin Routes - Layout handled inside AdminPage */}
            <Route path="/pgadmin/*" element={
              <ProtectedRoute allowedRoles={['super', 'hr']}>
                <AdminPage />
              </ProtectedRoute>
            } />

            {/* Reseller Area Route */}
            <Route path="/revendedor" element={
              <ProtectedRoute allowedRoles={['super', 'reseller']}>
                <Layout>
                  <ResellerArea />
                </Layout>
              </ProtectedRoute>
            } />

            {/* Fallback redirects */}
            <Route path="*" element={<HomePage />} />
          </Routes>
        </React.Suspense>
      </Router>
      <Analytics />
      <SpeedInsights />
    </AuthProvider>
  );
};

export default App;