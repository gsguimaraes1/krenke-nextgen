import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Turnstile } from '@marsidev/react-turnstile';
import type { TurnstileInstance } from '@marsidev/react-turnstile';
import { Search, Loader2, LifeBuoy } from 'lucide-react';
import { CATEGORY_LABELS, STATUS_LABELS } from '../types';
import { formatDateTime } from '../lib/time';
import logoBranco from '../../assets/Logos/krenke-brinquedos-logo-branco.webp';

interface LookupTicket {
  ticket_number: string;
  title: string;
  category: string;
  status: string;
  priority: string;
  created_at: string;
  resolved_at: string | null;
}

const STATUS_COLOR: Record<string, string> = {
  novo: 'bg-slate-100 text-slate-600',
  em_andamento: 'bg-blue-100 text-blue-700',
  aguardando_cliente: 'bg-amber-100 text-amber-700',
  resolvido: 'bg-green-100 text-green-700',
  fechado: 'bg-slate-200 text-slate-500',
};

const MeusChamados: React.FC = () => {
  const turnstileRef = useRef<TurnstileInstance>(null);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tickets, setTickets] = useState<LookupTicket[] | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY;
    if (siteKey && !captchaToken) {
      setError('Complete a verificação anti-bot.');
      return;
    }

    setLoading(true);
    setTickets(null);
    try {
      const res = await fetch('/api/lookup-tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ captchaToken, email, phone }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Erro ao buscar chamados.');
      setTickets(json.tickets || []);
    } catch (err: any) {
      setError(err.message || 'Erro ao buscar chamados.');
      turnstileRef.current?.reset();
      setCaptchaToken(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center px-4 py-10">
      <img src={logoBranco} alt="Krenke Brinquedos" className="h-9 object-contain mb-8 bg-krenke-navy px-4 py-2 rounded-xl" />

      <form onSubmit={handleSubmit} className="w-full max-w-lg bg-white rounded-[2rem] shadow-premium border border-slate-100 p-8 space-y-4">
        <div className="flex flex-col items-center mb-2">
          <div className="w-14 h-14 rounded-full bg-krenke-orange/10 flex items-center justify-center mb-3">
            <Search className="w-7 h-7 text-krenke-orange" />
          </div>
          <h1 className="text-xl font-black text-slate-800">Meus chamados</h1>
          <p className="text-sm text-slate-500 text-center">
            Informe o e-mail e telefone usados na abertura do chamado.
          </p>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">E-mail *</label>
          <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-xl border-2 border-transparent bg-slate-50 focus:border-krenke-orange px-3 py-2.5 text-sm font-bold text-slate-800 outline-none transition-all" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">Telefone *</label>
          <input required value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full rounded-xl border-2 border-transparent bg-slate-50 focus:border-krenke-orange px-3 py-2.5 text-sm font-bold text-slate-800 outline-none transition-all" />
        </div>

        {import.meta.env.VITE_TURNSTILE_SITE_KEY && (
          <Turnstile
            ref={turnstileRef}
            siteKey={import.meta.env.VITE_TURNSTILE_SITE_KEY}
            onSuccess={setCaptchaToken}
            onExpire={() => setCaptchaToken(null)}
            onError={(code) => console.error('Turnstile error:', code)}
          />
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-xs font-semibold">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-vibrant-orange to-krenke-orange text-white font-black py-3.5 rounded-2xl shadow-lg shadow-orange-500/20 hover:shadow-orange-500/35 hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:hover:translate-y-0 flex items-center justify-center gap-2"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          Buscar
        </button>

        <Link to="/abrir-chamado" className="block text-center text-krenke-orange font-bold text-sm">
          Abrir novo chamado
        </Link>
      </form>

      {tickets !== null && (
        <div className="w-full max-w-lg mt-4 space-y-2">
          {tickets.length === 0 && (
            <p className="text-center text-sm text-slate-400">Nenhum chamado encontrado com esses dados.</p>
          )}
          {tickets.map((t) => (
            <div key={t.ticket_number} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex items-start gap-3">
              <LifeBuoy className="w-5 h-5 text-krenke-orange shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-mono text-slate-400">{t.ticket_number}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${STATUS_COLOR[t.status] || 'bg-slate-100 text-slate-600'}`}>
                    {STATUS_LABELS[t.status as keyof typeof STATUS_LABELS] || t.status}
                  </span>
                </div>
                <p className="text-sm font-bold text-slate-800 truncate">{t.title}</p>
                <p className="text-xs text-slate-500">
                  {CATEGORY_LABELS[t.category as keyof typeof CATEGORY_LABELS] || t.category} · aberto em {formatDateTime(t.created_at)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MeusChamados;
