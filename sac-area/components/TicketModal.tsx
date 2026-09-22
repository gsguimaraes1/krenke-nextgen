import React, { useEffect, useState } from 'react';
import { X, Send, Loader2, Clock, Trash2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import {
  Ticket, TicketEvent, StaffProfile,
  TICKET_STATUSES, STATUS_LABELS, CATEGORY_LABELS, PRIORITY_LABELS, isOverdue,
} from '../types';
import { formatDateTime } from '../lib/time';
import AttachmentField from './AttachmentField';

interface Props {
  ticket: Ticket;
  staff: StaffProfile[];
  onClose: () => void;
  onUpdated: (ticket: Ticket) => void;
  onDeleted: (ticketId: string) => void;
}

const TicketModal: React.FC<Props> = ({ ticket, staff, onClose, onUpdated, onDeleted }) => {
  const { user, profile } = useAuth();
  const [events, setEvents] = useState<TicketEvent[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [newNote, setNewNote] = useState('');
  const [noteType, setNoteType] = useState<'comment' | 'note'>('note');
  const [sending, setSending] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const isAdmin = profile?.role === 'super';

  const loadEvents = async () => {
    setLoadingEvents(true);
    const { data } = await supabase
      .from('sac_ticket_events')
      .select('*')
      .eq('ticket_id', ticket.id)
      .order('created_at', { ascending: true });
    setEvents(data || []);
    setLoadingEvents(false);
  };

  useEffect(() => { loadEvents(); }, [ticket.id]);

  const logEvent = async (type: 'comment' | 'note' | 'status_change', body: string | null, meta?: any) => {
    await supabase.from('sac_ticket_events').insert([{
      ticket_id: ticket.id,
      author_id: user?.id,
      author_name: profile?.full_name || profile?.email || null,
      type,
      body,
      meta: meta || null,
    }]);
  };

  const patchTicket = async (patch: Partial<Ticket>) => {
    setSaving(true);
    const { data, error } = await supabase
      .from('sac_tickets')
      .update(patch)
      .eq('id', ticket.id)
      .select('*, assignee:assigned_to(id, full_name, email, role)')
      .single();
    setSaving(false);
    if (!error && data) onUpdated(data as unknown as Ticket);
  };

  const handleStatusChange = async (status: string) => {
    if (status === ticket.status) return;
    await patchTicket({ status: status as any });
    await logEvent('status_change', null, { from: ticket.status, to: status });
    loadEvents();
  };

  const handleSubmitNote = async () => {
    if (!newNote.trim()) return;
    setSending(true);
    await logEvent(noteType, newNote.trim());
    setNewNote('');
    setSending(false);
    loadEvents();
  };

  const handleDelete = async () => {
    if (!window.confirm(`Excluir o chamado ${ticket.ticket_number}? Essa ação não pode ser desfeita.`)) return;
    setDeleting(true);
    const { error } = await supabase.from('sac_tickets').delete().eq('id', ticket.id);
    setDeleting(false);
    if (error) {
      window.alert('Erro ao excluir chamado.');
      return;
    }
    onDeleted(ticket.id);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between p-5 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-slate-400">{ticket.ticket_number}</span>
              {isOverdue(ticket) && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
                  <Clock className="w-3 h-3" /> Atrasado desde {formatDateTime(ticket.due_at!)}
                </span>
              )}
            </div>
            <h2 className="text-lg font-bold text-slate-800">{ticket.title}</h2>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            {isAdmin && (
              <button
                onClick={handleDelete}
                disabled={deleting}
                title="Excluir chamado"
                className="text-slate-400 hover:text-red-500 disabled:opacity-50"
              >
                {deleting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
              </button>
            )}
            <button onClick={onClose} className="text-slate-400 hover:text-slate-700">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Status</label>
              <select
                value={ticket.status}
                disabled={saving}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-2 py-1.5"
              >
                {TICKET_STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Prioridade</label>
              <select
                value={ticket.priority}
                disabled={saving}
                onChange={(e) => patchTicket({ priority: e.target.value as any })}
                className="w-full rounded-lg border border-slate-300 px-2 py-1.5"
              >
                {Object.entries(PRIORITY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Categoria</label>
              <select
                value={ticket.category}
                disabled={saving}
                onChange={(e) => patchTicket({ category: e.target.value as any })}
                className="w-full rounded-lg border border-slate-300 px-2 py-1.5"
              >
                {Object.entries(CATEGORY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Responsável</label>
              <select
                value={ticket.assigned_to || ''}
                disabled={saving}
                onChange={(e) => patchTicket({ assigned_to: e.target.value || null })}
                className="w-full rounded-lg border border-slate-300 px-2 py-1.5"
              >
                <option value="">Sem responsável</option>
                {staff.map((s) => <option key={s.id} value={s.id}>{s.full_name || s.email}</option>)}
              </select>
            </div>
          </div>

          <div className="bg-slate-50 rounded-xl p-3 text-sm space-y-1">
            <p><span className="font-semibold text-slate-600">Cliente:</span> {ticket.client_name}</p>
            {ticket.client_email && <p><span className="font-semibold text-slate-600">E-mail:</span> {ticket.client_email}</p>}
            {ticket.client_phone && <p><span className="font-semibold text-slate-600">Telefone:</span> {ticket.client_phone}</p>}
            {(ticket.client_city || ticket.client_state) && (
              <p><span className="font-semibold text-slate-600">Local:</span> {[ticket.client_city, ticket.client_state].filter(Boolean).join(' / ')}</p>
            )}
            {ticket.product_name && <p><span className="font-semibold text-slate-600">Produto:</span> {ticket.product_name}</p>}
            {ticket.order_reference && <p><span className="font-semibold text-slate-600">Pedido/NF:</span> {ticket.order_reference}</p>}
          </div>

          {ticket.description && (
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Descrição</label>
              <p className="text-sm text-slate-700 whitespace-pre-wrap">{ticket.description}</p>
            </div>
          )}

          <AttachmentField mode="attached" ticketId={ticket.id} />

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-2">Histórico</label>
            {loadingEvents ? (
              <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
            ) : (
              <div className="space-y-2">
                {events.map((ev) => (
                  <div key={ev.id} className="text-sm border border-slate-100 rounded-lg p-2.5">
                    {ev.type === 'status_change' ? (
                      <p className="text-xs text-slate-500 italic">
                        {ev.author_name || 'Sistema'} mudou status: {STATUS_LABELS[(ev.meta?.from as any) || 'novo']} → {STATUS_LABELS[(ev.meta?.to as any) || 'novo']}
                      </p>
                    ) : (
                      <>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-semibold text-slate-600">{ev.author_name || 'Equipe'}</span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${ev.type === 'note' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                            {ev.type === 'note' ? 'Nota interna' : 'Comentário'}
                          </span>
                        </div>
                        <p className="text-slate-700 whitespace-pre-wrap">{ev.body}</p>
                      </>
                    )}
                    <span className="text-[10px] text-slate-400">{formatDateTime(ev.created_at)}</span>
                  </div>
                ))}
                {events.length === 0 && <p className="text-xs text-slate-400">Sem atividade ainda.</p>}
              </div>
            )}
          </div>
        </div>

        <div className="p-4 border-t border-slate-100 space-y-2">
          <div className="flex gap-2 text-xs">
            <button
              onClick={() => setNoteType('note')}
              className={`px-2.5 py-1 rounded-full font-semibold ${noteType === 'note' ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-600'}`}
            >
              Nota interna
            </button>
            <button
              onClick={() => setNoteType('comment')}
              className={`px-2.5 py-1 rounded-full font-semibold ${noteType === 'comment' ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-600'}`}
            >
              Comentário
            </button>
          </div>
          <div className="flex gap-2">
            <textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              rows={2}
              placeholder="Adicionar nota ou comentário..."
              className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm resize-none"
            />
            <button
              onClick={handleSubmitNote}
              disabled={sending || !newNote.trim()}
              className="bg-krenke-orange text-white rounded-lg px-3 disabled:opacity-50"
            >
              {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketModal;
