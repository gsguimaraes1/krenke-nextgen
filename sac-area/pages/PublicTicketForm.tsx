import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Turnstile } from '@marsidev/react-turnstile';
import type { TurnstileInstance } from '@marsidev/react-turnstile';
import { LifeBuoy, Loader2 } from 'lucide-react';
import { CATEGORY_LABELS, TicketCategory } from '../types';
import { UploadedFile } from '../lib/upload';
import AttachmentField from '../components/AttachmentField';
import logoBranco from '../../assets/Logos/krenke-brinquedos-logo-branco.webp';

const PublicTicketForm: React.FC = () => {
  const navigate = useNavigate();
  const turnstileRef = useRef<TurnstileInstance>(null);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attachments, setAttachments] = useState<UploadedFile[]>([]);
  const [form, setForm] = useState({
    title: '', description: '',
    category: 'instalacao' as TicketCategory,
    client_name: '', client_email: '', client_phone: '', client_city: '', client_state: '',
    product_name: '', order_reference: '',
  });

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY;
    if (siteKey && !captchaToken) {
      setError('Complete a verificação anti-bot.');
      return;
    }

    setSending(true);
    try {
      const res = await fetch('/api/submit-ticket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ captchaToken, ticket: form, attachments }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Erro ao enviar');
      navigate('/abrir-chamado/obrigado', { state: { ticketNumber: json.ticket_number } });
    } catch (err: any) {
      setError(err.message || 'Erro ao enviar chamado. Tente novamente.');
      turnstileRef.current?.reset();
      setCaptchaToken(null);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center px-4 py-10">
      <img src={logoBranco} alt="Krenke Brinquedos" className="h-9 object-contain mb-8 bg-krenke-navy px-4 py-2 rounded-xl" />

      <form onSubmit={handleSubmit} className="w-full max-w-lg bg-white rounded-[2rem] shadow-premium border border-slate-100 p-8 space-y-4">
        <div className="flex flex-col items-center mb-2">
          <div className="w-14 h-14 rounded-full bg-krenke-orange/10 flex items-center justify-center mb-3">
            <LifeBuoy className="w-7 h-7 text-krenke-orange" />
          </div>
          <h1 className="text-xl font-black text-slate-800">Abrir chamado</h1>
          <p className="text-sm text-slate-500 text-center">
            Problemas de instalação, manutenção, garantia ou outras dúvidas — conte pra gente.
          </p>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">Categoria *</label>
          <select value={form.category} onChange={(e) => set('category', e.target.value)} required className="w-full rounded-xl border-2 border-transparent bg-slate-50 focus:border-krenke-orange px-3 py-2.5 text-sm font-bold text-slate-700 outline-none transition-all">
            {Object.entries(CATEGORY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">Assunto *</label>
          <input required value={form.title} onChange={(e) => set('title', e.target.value)} className="w-full rounded-xl border-2 border-transparent bg-slate-50 focus:border-krenke-orange px-3 py-2.5 text-sm font-bold text-slate-800 outline-none transition-all" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">Descreva o problema *</label>
          <textarea required rows={4} value={form.description} onChange={(e) => set('description', e.target.value)} className="w-full rounded-xl border-2 border-transparent bg-slate-50 focus:border-krenke-orange px-3 py-2.5 text-sm font-bold text-slate-800 outline-none resize-none transition-all" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">Seu nome *</label>
          <input required value={form.client_name} onChange={(e) => set('client_name', e.target.value)} className="w-full rounded-xl border-2 border-transparent bg-slate-50 focus:border-krenke-orange px-3 py-2.5 text-sm font-bold text-slate-800 outline-none transition-all" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <input placeholder="E-mail *" type="email" required value={form.client_email} onChange={(e) => set('client_email', e.target.value)} className="rounded-xl border-2 border-transparent bg-slate-50 focus:border-krenke-orange px-3 py-2.5 text-sm font-bold text-slate-800 outline-none transition-all" />
          <input placeholder="Telefone *" required value={form.client_phone} onChange={(e) => set('client_phone', e.target.value)} className="rounded-xl border-2 border-transparent bg-slate-50 focus:border-krenke-orange px-3 py-2.5 text-sm font-bold text-slate-800 outline-none transition-all" />
          <input placeholder="Cidade" value={form.client_city} onChange={(e) => set('client_city', e.target.value)} className="rounded-xl border-2 border-transparent bg-slate-50 focus:border-krenke-orange px-3 py-2.5 text-sm font-bold text-slate-800 outline-none transition-all" />
          <input placeholder="UF" maxLength={2} value={form.client_state} onChange={(e) => set('client_state', e.target.value.toUpperCase())} className="rounded-xl border-2 border-transparent bg-slate-50 focus:border-krenke-orange px-3 py-2.5 text-sm font-bold text-slate-800 outline-none transition-all" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <input placeholder="Produto/modelo" value={form.product_name} onChange={(e) => set('product_name', e.target.value)} className="rounded-xl border-2 border-transparent bg-slate-50 focus:border-krenke-orange px-3 py-2.5 text-sm font-bold text-slate-800 outline-none transition-all" />
          <input placeholder="Nº do pedido/NF" value={form.order_reference} onChange={(e) => set('order_reference', e.target.value)} className="rounded-xl border-2 border-transparent bg-slate-50 focus:border-krenke-orange px-3 py-2.5 text-sm font-bold text-slate-800 outline-none transition-all" />
        </div>

        <AttachmentField mode="pending" value={attachments} onChange={setAttachments} />

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
          <div className="bg-red-500/10 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-xs font-semibold flex items-center gap-2.5">
            <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse shrink-0" />
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={sending}
          className="w-full bg-gradient-to-r from-vibrant-orange to-krenke-orange text-white font-black py-3.5 rounded-2xl shadow-lg shadow-orange-500/20 hover:shadow-orange-500/35 hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:hover:translate-y-0 flex items-center justify-center gap-2"
        >
          {sending && <Loader2 className="w-4 h-4 animate-spin" />}
          Enviar chamado
        </button>
      </form>
    </div>
  );
};

export default PublicTicketForm;
