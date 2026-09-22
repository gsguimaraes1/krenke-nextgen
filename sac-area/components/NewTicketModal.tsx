import React, { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { Ticket, TicketCategory, TicketPriority, CATEGORY_LABELS, PRIORITY_LABELS } from '../types';

interface Props {
  onClose: () => void;
  onCreated: (ticket: Ticket) => void;
}

const NewTicketModal: React.FC<Props> = ({ onClose, onCreated }) => {
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: '', description: '',
    category: 'outro' as TicketCategory,
    priority: 'media' as TicketPriority,
    client_name: '', client_email: '', client_phone: '', client_city: '', client_state: '',
    product_name: '', order_reference: '',
  });

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.client_name.trim()) {
      setError('Título e nome do cliente são obrigatórios.');
      return;
    }
    setSaving(true);
    setError(null);
    const { data, error: err } = await supabase
      .from('sac_tickets')
      .insert([{ ...form, source: 'interno', created_by: user?.id }])
      .select('*, assignee:assigned_to(id, full_name, email, role)')
      .single();
    setSaving(false);
    if (err) {
      setError('Erro ao criar chamado.');
      return;
    }
    onCreated(data as unknown as Ticket);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl"
      >
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-800">Novo chamado</h2>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Título *</label>
            <input value={form.title} onChange={(e) => set('title', e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Descrição</label>
            <textarea value={form.description} onChange={(e) => set('description', e.target.value)} rows={3} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Categoria</label>
              <select value={form.category} onChange={(e) => set('category', e.target.value)} className="w-full rounded-lg border border-slate-300 px-2 py-2 text-sm">
                {Object.entries(CATEGORY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Prioridade</label>
              <select value={form.priority} onChange={(e) => set('priority', e.target.value)} className="w-full rounded-lg border border-slate-300 px-2 py-2 text-sm">
                {Object.entries(PRIORITY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Cliente *</label>
            <input value={form.client_name} onChange={(e) => set('client_name', e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input placeholder="E-mail" value={form.client_email} onChange={(e) => set('client_email', e.target.value)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
            <input placeholder="Telefone" value={form.client_phone} onChange={(e) => set('client_phone', e.target.value)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
            <input placeholder="Cidade" value={form.client_city} onChange={(e) => set('client_city', e.target.value)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
            <input placeholder="UF" maxLength={2} value={form.client_state} onChange={(e) => set('client_state', e.target.value.toUpperCase())} className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input placeholder="Produto" value={form.product_name} onChange={(e) => set('product_name', e.target.value)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
            <input placeholder="Pedido/NF" value={form.order_reference} onChange={(e) => set('order_reference', e.target.value)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>

        <div className="p-4 border-t border-slate-100 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-semibold text-slate-600">Cancelar</button>
          <button type="submit" disabled={saving} className="bg-krenke-orange text-white font-black px-4 py-2 rounded-xl text-sm flex items-center gap-2 hover:bg-orange-600 transition-colors disabled:opacity-60">
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            Criar chamado
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewTicketModal;
