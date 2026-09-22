import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { LogOut, Plus, Search, BarChart3, Clock } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { Ticket, TicketStatus, TICKET_STATUSES, StaffProfile, CATEGORY_LABELS, PRIORITY_LABELS, isOverdue } from '../types';
import TicketColumn from '../components/TicketColumn';
import TicketModal from '../components/TicketModal';
import NewTicketModal from '../components/NewTicketModal';
import logoBranco from '../../assets/Logos/krenke-brinquedos-logo-branco.webp';

const Kanban: React.FC = () => {
  const { profile, signOut } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [staff, setStaff] = useState<StaffProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [onlyMine, setOnlyMine] = useState(false);
  const [onlyOverdue, setOnlyOverdue] = useState(false);
  const [selected, setSelected] = useState<Ticket | null>(null);
  const [showNew, setShowNew] = useState(false);

  const loadTickets = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('sac_tickets')
      .select('*, assignee:assigned_to(id, full_name, email, role), attachments:sac_ticket_attachments(count)')
      .order('created_at', { ascending: false });
    setTickets((data || []) as unknown as Ticket[]);
    setLoading(false);
  };

  const loadStaff = async () => {
    const { data } = await supabase.from('profiles').select('id, full_name, email, role').in('role', ['sac', 'super']);
    setStaff((data || []) as StaffProfile[]);
  };

  useEffect(() => { loadTickets(); loadStaff(); }, []);

  // Realtime — qualquer mudança em sac_tickets (drag de outro atendente,
  // chamado novo pelo form público) recarrega o board sozinho.
  useEffect(() => {
    if (!supabase) return;
    const channel = supabase
      .channel('sac_tickets_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sac_tickets' }, () => loadTickets())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const filtered = useMemo(() => {
    return tickets.filter((t) => {
      if (categoryFilter && t.category !== categoryFilter) return false;
      if (priorityFilter && t.priority !== priorityFilter) return false;
      if (onlyMine && t.assigned_to !== profile?.id) return false;
      if (onlyOverdue && !isOverdue(t)) return false;
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        return (
          t.title.toLowerCase().includes(q) ||
          t.client_name.toLowerCase().includes(q) ||
          t.ticket_number.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [tickets, categoryFilter, priorityFilter, onlyMine, onlyOverdue, search, profile]);

  const byStatus = (status: TicketStatus) => filtered.filter((t) => t.status === status);

  const handleDrop = async (status: TicketStatus, ticketId: string) => {
    const ticket = tickets.find((t) => t.id === ticketId);
    if (!ticket || ticket.status === status) return;
    setTickets((prev) => prev.map((t) => (t.id === ticketId ? { ...t, status } : t)));
    const { data } = await supabase
      .from('sac_tickets')
      .update({ status })
      .eq('id', ticketId)
      .select('*, assignee:assigned_to(id, full_name, email, role)')
      .single();
    if (data) {
      setTickets((prev) => prev.map((t) => (t.id === ticketId ? (data as unknown as Ticket) : t)));
      await supabase.from('sac_ticket_events').insert([{
        ticket_id: ticketId,
        author_id: profile?.id,
        author_name: profile?.full_name || profile?.email || null,
        type: 'status_change',
        meta: { from: ticket.status, to: status },
      }]);
    }
  };

  const handleTicketUpdated = (updated: Ticket) => {
    setTickets((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    setSelected(updated);
  };

  const handleTicketDeleted = (ticketId: string) => {
    setTickets((prev) => prev.filter((t) => t.id !== ticketId));
    setSelected(null);
  };

  const handleTicketCreated = (created: Ticket) => {
    setTickets((prev) => [created, ...prev]);
    setShowNew(false);
  };

  return (
    <div className="h-screen flex flex-col bg-slate-100">
      <header className="bg-krenke-navy px-4 py-3 flex items-center justify-between flex-wrap gap-3 shadow-lg z-10">
        <div className="flex items-center gap-3">
          <img src={logoBranco} alt="Krenke Brinquedos" className="h-7 object-contain" />
          <div className="w-px h-6 bg-white/15" />
          <h1 className="font-black text-white tracking-tight">SAC</h1>
        </div>

        <div className="flex items-center gap-2 flex-1 max-w-xl">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por título, cliente ou número..."
              className="w-full rounded-lg border border-white/10 bg-white/5 text-white placeholder:text-gray-500 pl-9 pr-3 py-1.5 text-sm outline-none focus:border-krenke-orange/50 focus:bg-krenke-orange/5 transition-colors"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-lg border border-white/10 bg-white/5 text-white px-2 py-1.5 text-sm outline-none focus:border-krenke-orange/50"
          >
            <option value="" className="text-slate-800">Todas categorias</option>
            {Object.entries(CATEGORY_LABELS).map(([k, v]) => <option key={k} value={k} className="text-slate-800">{v}</option>)}
          </select>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="rounded-lg border border-white/10 bg-white/5 text-white px-2 py-1.5 text-sm outline-none focus:border-krenke-orange/50"
          >
            <option value="" className="text-slate-800">Todas prioridades</option>
            {Object.entries(PRIORITY_LABELS).map(([k, v]) => <option key={k} value={k} className="text-slate-800">{v}</option>)}
          </select>
          <label className="flex items-center gap-1.5 text-sm text-gray-300 whitespace-nowrap">
            <input type="checkbox" checked={onlyMine} onChange={(e) => setOnlyMine(e.target.checked)} />
            Meus
          </label>
          <label className="flex items-center gap-1.5 text-sm text-gray-300 whitespace-nowrap">
            <input type="checkbox" checked={onlyOverdue} onChange={(e) => setOnlyOverdue(e.target.checked)} />
            <Clock className="w-3.5 h-3.5" /> Atrasados
          </label>
        </div>

        <div className="flex items-center gap-4">
          <Link
            to="/sac/dashboard"
            className="text-gray-300 hover:text-white flex items-center gap-1.5 text-sm font-semibold"
            title="Dashboard"
          >
            <BarChart3 className="w-4 h-4" /> Dashboard
          </Link>
          <button
            onClick={() => setShowNew(true)}
            className="bg-gradient-to-r from-vibrant-orange to-krenke-orange text-white font-bold px-3 py-1.5 rounded-lg text-sm flex items-center gap-1.5 shadow-lg shadow-orange-600/20 hover:shadow-orange-600/35 transition-shadow"
          >
            <Plus className="w-4 h-4" /> Novo chamado
          </button>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-krenke-orange rounded-full flex items-center justify-center font-black text-xs text-white shrink-0">
              {(profile?.full_name?.[0] || profile?.email?.[0] || 'K').toUpperCase()}
            </div>
            <div className="hidden md:block leading-none">
              <p className="text-xs text-white font-bold truncate max-w-[140px]">{profile?.full_name || profile?.email}</p>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">{profile?.role === 'super' ? 'Super Admin' : 'Atendente SAC'}</p>
            </div>
          </div>
          <button onClick={signOut} className="text-gray-400 hover:text-red-400 transition-colors" title="Sair">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-x-auto overflow-y-hidden p-4">
        {loading ? (
          <p className="text-slate-400 text-sm">Carregando chamados...</p>
        ) : (
          <div className="flex gap-3 h-full">
            {TICKET_STATUSES.map((status) => (
              <TicketColumn
                key={status}
                status={status}
                tickets={byStatus(status)}
                onCardClick={setSelected}
                onDrop={handleDrop}
              />
            ))}
          </div>
        )}
      </main>

      {selected && (
        <TicketModal
          ticket={selected}
          staff={staff}
          onClose={() => setSelected(null)}
          onUpdated={handleTicketUpdated}
          onDeleted={handleTicketDeleted}
        />
      )}
      {showNew && <NewTicketModal onClose={() => setShowNew(false)} onCreated={handleTicketCreated} />}
    </div>
  );
};

export default Kanban;
