import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Layout } from './components/Layout';
import HomePage from './pages/Home';
import AboutPage from './pages/About';
import ProductsPage from './pages/Products';
import QuotePage from './pages/Quote';
import ProjectsPage from './pages/Projects';
import AdminPage from './pages/Admin';


// Scroll to top on route change and trigger GTM pageview
const ScrollToTop = () => {
  const { pathname, search } = useLocation();
  React.useEffect(() => {
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
      <ScrollToTop />
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/projects" element={<ProjectsPage />} />

          <Route path="/pgadmin" element={<AdminPage />} />
          <Route path="/quote" element={<QuotePage />} />

          {/* Fallback redirects */}
          <Route path="*" element={<HomePage />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;