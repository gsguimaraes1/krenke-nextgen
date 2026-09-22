import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Clock, Inbox, CheckCircle2, AlertTriangle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Ticket, TICKET_STATUSES, STATUS_LABELS, CATEGORY_LABELS, TicketCategory, isOverdue } from '../types';
import logoBranco from '../../assets/Logos/krenke-brinquedos-logo-branco.webp';

type Row = Pick<Ticket, 'status' | 'category' | 'priority' | 'created_at' | 'resolved_at' | 'due_at'>;

const Dashboard: React.FC = () => {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('sac_tickets')
        .select('status, category, priority, created_at, resolved_at, due_at');
      setRows((data || []) as Row[]);
      setLoading(false);
    })();
  }, []);

  const stats = useMemo(() => {
    const byStatus: Record<string, number> = {};
    TICKET_STATUSES.forEach((s) => { byStatus[s] = 0; });
    const byCategory: Record<string, number> = {};
    let overdue = 0;
    let resolutionHoursSum = 0;
    let resolutionCount = 0;
    let last7days = 0;
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

    rows.forEach((t) => {
      byStatus[t.status] = (byStatus[t.status] || 0) + 1;
      byCategory[t.category] = (byCategory[t.category] || 0) + 1;
      if (isOverdue(t)) overdue += 1;
      if (t.resolved_at) {
        resolutionHoursSum += (new Date(t.resolved_at).getTime() - new Date(t.created_at).getTime()) / 3600000;
        resolutionCount += 1;
      }
      if (new Date(t.created_at).getTime() >= sevenDaysAgo) last7days += 1;
    });

    return {
      total: rows.length,
      byStatus,
      byCategory,
      overdue,
      avgResolutionHours: resolutionCount ? resolutionHoursSum / resolutionCount : null,
      last7days,
      open: rows.length - (byStatus.resolvido || 0) - (byStatus.fechado || 0),
    };
  }, [rows]);

  const maxCategory = Math.max(1, ...(Object.values(stats.byCategory) as number[]));
  const maxStatus = Math.max(1, ...(Object.values(stats.byStatus) as number[]));

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="bg-krenke-navy px-4 py-3 flex items-center gap-3 shadow-lg">
        <img src={logoBranco} alt="Krenke Brinquedos" className="h-7 object-contain" />
        <div className="w-px h-6 bg-white/15" />
        <h1 className="font-black text-white tracking-tight">Dashboard SAC</h1>
        <Link to="/sac" className="ml-auto text-gray-300 hover:text-white flex items-center gap-1.5 text-sm font-semibold">
          <ArrowLeft className="w-4 h-4" /> Voltar ao Kanban
        </Link>
      </header>

      <main className="p-4 max-w-5xl mx-auto space-y-4">
        {loading ? (
          <p className="text-slate-400 text-sm">Carregando métricas...</p>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <StatCard icon={<Inbox className="w-5 h-5 text-krenke-orange" />} label="Chamados abertos" value={stats.open} />
              <StatCard icon={<AlertTriangle className="w-5 h-5 text-red-500" />} label="Atrasados" value={stats.overdue} highlight={stats.overdue > 0} />
              <StatCard
                icon={<CheckCircle2 className="w-5 h-5 text-green-500" />}
                label="Tempo médio resolução"
                value={stats.avgResolutionHours != null ? `${stats.avgResolutionHours.toFixed(1)}h` : '—'}
              />
              <StatCard icon={<Clock className="w-5 h-5 text-krenke-purple" />} label="Novos (7 dias)" value={stats.last7days} />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl border border-slate-200 p-5">
                <h2 className="text-sm font-black text-slate-700 mb-3">Por status</h2>
                <div className="space-y-2.5">
                  {TICKET_STATUSES.map((s) => (
                    <BarRow key={s} label={STATUS_LABELS[s]} value={stats.byStatus[s] || 0} max={maxStatus} />
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-5">
                <h2 className="text-sm font-black text-slate-700 mb-3">Por categoria</h2>
                <div className="space-y-2.5">
                  {Object.entries(CATEGORY_LABELS).map(([k, label]) => (
                    <BarRow key={k} label={label} value={stats.byCategory[k as TicketCategory] || 0} max={maxCategory} />
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: React.ReactNode; highlight?: boolean }> = ({ icon, label, value, highlight }) => (
  <div className={`bg-white rounded-2xl border p-4 ${highlight ? 'border-red-300' : 'border-slate-200'}`}>
    <div className="flex items-center gap-2 mb-2">{icon}<span className="text-xs font-bold text-slate-500">{label}</span></div>
    <p className="text-2xl font-black text-slate-800">{value}</p>
  </div>
);

const BarRow: React.FC<{ label: string; value: number; max: number }> = ({ label, value, max }) => (
  <div>
    <div className="flex items-center justify-between text-xs mb-1">
      <span className="font-semibold text-slate-600">{label}</span>
      <span className="font-black text-slate-800">{value}</span>
    </div>
    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
      <div className="h-full bg-krenke-orange rounded-full" style={{ width: `${(value / max) * 100}%` }} />
    </div>
  </div>
);

export default Dashboard;
