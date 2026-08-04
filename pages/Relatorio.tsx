import React, { useEffect, useState } from 'react';
import { BarChart3, LogOut, AlertTriangle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import QuoteReportView from '../components/QuoteReportView';

// 'powerbi' busca a URL embedada via api/report-url (allowlist server-side).
// 'orcamentos' renderiza QuoteReportView direto — dados vêm do Supabase
// client-side (mesmo componente usado em /pgadmin/relatorio-orcamentos).
const REPORTS = [
  { key: 'vendas', label: 'Relatório de Vendas', type: 'powerbi' as const },
  { key: 'orcamentos', label: 'Relatório de Orçamentos', type: 'orcamentos' as const },
];

const RelatorioPage: React.FC = () => {
  const { signOut } = useAuth();
  const [activeReport, setActiveReport] = useState(REPORTS[0].key);
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const activeType = REPORTS.find(r => r.key === activeReport)?.type;

  useEffect(() => {
    if (activeType !== 'powerbi') {
      setLoading(false);
      setUrl(null);
      setError(null);
      return;
    }

    let cancelled = false;

    const fetchUrl = async () => {
      setLoading(true);
      setError(null);
      setUrl(null);

      if (!supabase) return;
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError('Sessão expirada. Faça login novamente.');
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`/api/report-url?report=${activeReport}`, {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        const json = await res.json();
        if (cancelled) return;
        if (!res.ok) {
          setError(json.error === 'Forbidden' ? 'Acesso negado.' : 'Erro ao carregar relatório.');
        } else {
          setUrl(json.url);
        }
      } catch {
        if (!cancelled) setError('Erro ao carregar relatório.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchUrl();
    return () => { cancelled = true; };
  }, [activeReport, activeType]);

  return (
    <div className="min-h-screen bg-[#0F0C29] flex flex-col">
      <header className="flex items-center justify-between px-6 py-4 bg-krenke-purple border-b border-white/10">
        <div className="flex items-center gap-3 text-white">
          <BarChart3 size={22} className="text-vibrant-orange" />
          <span className="font-black uppercase tracking-widest text-sm">Relatórios</span>
        </div>

        <nav className="flex items-center gap-2">
          {REPORTS.map((r) => (
            <button
              key={r.key}
              onClick={() => setActiveReport(r.key)}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                activeReport === r.key
                  ? 'bg-vibrant-orange text-white'
                  : 'bg-white/5 text-white/70 hover:bg-white/10'
              }`}
            >
              {r.label}
            </button>
          ))}
        </nav>

        <button
          onClick={signOut}
          className="flex items-center gap-2 text-white/60 hover:text-white text-xs font-bold uppercase tracking-widest transition-colors"
        >
          <LogOut size={16} /> Sair
        </button>
      </header>

      <main className="flex-grow relative overflow-y-auto">
        {activeType === 'orcamentos' ? (
          <div className="min-h-full bg-gray-50 p-6 md:p-10">
            <QuoteReportView />
          </div>
        ) : (
          <>
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-krenke-orange border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}

            {!loading && error && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-white/70">
                <AlertTriangle size={32} className="text-red-400" />
                <p className="font-bold">{error}</p>
              </div>
            )}

            {!loading && !error && url && (
              <iframe
                key={activeReport}
                title={REPORTS.find((r) => r.key === activeReport)?.label || 'Relatório'}
                src={url}
                className="w-full h-full absolute inset-0 border-0"
                allowFullScreen
              />
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default RelatorioPage;
