import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Outlet } from 'react-router-dom';
import { Layout } from './components/Layout';
import HomePage from './pages/Home';
import AboutPage from './pages/About';
import ProductsPage from './pages/Products';
import QuotePage from './pages/Quote';
import ProjectsPage from './pages/Projects';
import AdminPage from './pages/Admin';
import BlogPage from './pages/Blog';
import BlogPostPage from './pages/BlogPost';
import PrivacyPage from './pages/Privacy';
import TermsPage from './pages/Terms';
import { Preloader } from './components/Preloader';

// Scroll to top on route change and trigger GTM pageview
const ScrollToTop = () => {
  const { pathname, search } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);

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
    <Router>
      <Preloader />
      <ScrollToTop />
      <Routes>
        {/* Public Routes with Main Layout */}
        <Route element={<Layout><Outlet /></Layout>}>
          <Route path="/" element={<HomePage />} />
          <Route path="/empresa" element={<AboutPage />} />
          <Route path="/produtos" element={<ProductsPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/blog/:slug" element={<BlogPostPage />} />
          <Route path="/projetos" element={<ProjectsPage />} />
          <Route path="/orcamento" element={<QuotePage />} />
          <Route path="/politica-de-privacidade" element={<PrivacyPage />} />
          <Route path="/termos-de-uso" element={<TermsPage />} />
        </Route>

        {/* Admin Routes - Layout handled inside AdminPage */}
        <Route path="/pgadmin/*" element={<AdminPage />} />

        {/* Fallback redirects */}
        <Route path="*" element={<HomePage />} />
      </Routes>
    </Router>
  );
};

export default App;