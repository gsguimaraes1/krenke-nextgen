import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase';
import {
    RefreshCw,
    TrendingUp,
    Users,
    DollarSign,
    Receipt,
    Search,
    Download,
    Trophy,
    Calendar,
    FileText,
} from 'lucide-react';
import type { QuoteItem } from '../types';

/**
 * Relatório de orçamentos da calculadora do revendedor (`orcamento_revendas`).
 *
 * Responde "quantos orçamentos foram feitos" e "quem fez": KPIs do período,
 * ranking por revendedor, volume por mês, tabela detalhada e export CSV.
 *
 * Leitura depende do RLS de `orcamento_revendas`: só `super` enxerga todas as
 * linhas — qualquer outro papel veria apenas os próprios orçamentos, o que
 * tornaria o relatório enganoso. O gate de papel fica em Admin.tsx.
 */

interface QuoteRow {
    id: string;
    quote_number: string;
    user_id: string;
    reseller_name: string | null;
    model_name: string | null;
    client_name: string | null;
    client_cnpj: string | null;
    margin: number | string | null;
    items: QuoteItem[] | null;
    total_bruto: number | string | null;
    total_com_ipi: number | string | null;
    created_at: string;
    updated_at: string;
}

interface ResellerStat {
    userId: string;
    name: string;
    count: number;
    total: number;
    avg: number;
    lastAt: string;
    share: number;
}

const PERIODS = [
    { id: '7d', label: '7 dias', days: 7 },
    { id: '30d', label: '30 dias', days: 30 },
    { id: '90d', label: '90 dias', days: 90 },
    { id: '12m', label: '12 meses', days: 365 },
    { id: 'all', label: 'Tudo', days: null },
] as const;

type PeriodId = typeof PERIODS[number]['id'];

const PAGE_SIZE = 50;
const MAX_ROWS = 5000;

const brl = (v: number) =>
    v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 2 });

const num = (v: number | string | null | undefined) => {
    const n = typeof v === 'string' ? parseFloat(v) : v;
    return Number.isFinite(n as number) ? (n as number) : 0;
};

const monthKey = (iso: string) => iso.slice(0, 7); // YYYY-MM

const monthLabel = (key: string) => {
    const [y, m] = key.split('-');
    const d = new Date(Number(y), Number(m) - 1, 1);
    return d.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '') + '/' + y.slice(2);
};

const QuoteReportView: React.FC = () => {
    const [rows, setRows] = useState<QuoteRow[]>([]);
    const [names, setNames] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [period, setPeriod] = useState<PeriodId>('30d');
    const [resellerFilter, setResellerFilter] = useState('all');
    const [search, setSearch] = useState('');
    const [visible, setVisible] = useState(PAGE_SIZE);

    const fetchRows = async (p: PeriodId) => {
        if (!supabase) return;
        setLoading(true);
        setError(null);
        try {
            let query = supabase
                .from('orcamento_revendas')
                .select('id, quote_number, user_id, reseller_name, model_name, client_name, client_cnpj, margin, items, total_bruto, total_com_ipi, created_at, updated_at')
                .order('created_at', { ascending: false })
                .limit(MAX_ROWS);

            const days = PERIODS.find(x => x.id === p)?.days;
            if (days) {
                const from = new Date();
                from.setDate(from.getDate() - days);
                query = query.gte('created_at', from.toISOString());
            }

            const { data, error: err } = await query;
            if (err) throw err;
            setRows((data || []) as QuoteRow[]);
        } catch (e: any) {
            setError(e?.message || 'Falha ao carregar orçamentos.');
            setRows([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchNames = async () => {
        if (!supabase) return;
        const { data } = await supabase.from('profiles').select('id, full_name, email');
        const map: Record<string, string> = {};
        (data || []).forEach((p: any) => {
            map[p.id] = p.full_name || p.email || p.id;
        });
        setNames(map);
    };

    useEffect(() => { fetchNames(); }, []);
    useEffect(() => { fetchRows(period); setVisible(PAGE_SIZE); }, [period]);

    /** Nome do autor: snapshot da linha > profile atual > id abreviado. */
    const authorOf = (r: QuoteRow) =>
        r.reseller_name || names[r.user_id] || `Usuário ${r.user_id.slice(0, 8)}`;

    // Opções do filtro de revendedor — derivadas do período carregado.
    const resellerOptions = useMemo(() => {
        const map = new Map<string, string>();
        rows.forEach(r => { if (!map.has(r.user_id)) map.set(r.user_id, authorOf(r)); });
        return [...map.entries()]
            .map(([id, name]) => ({ id, name }))
            .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
    }, [rows, names]);

    const filtered = useMemo(() => {
        const term = search.trim().toLowerCase();
        return rows.filter(r => {
            if (resellerFilter !== 'all' && r.user_id !== resellerFilter) return false;
            if (!term) return true;
            return [r.quote_number, r.client_name, r.model_name, r.client_cnpj, authorOf(r)]
                .some(f => (f || '').toLowerCase().includes(term));
        });
    }, [rows, resellerFilter, search, names]);

    const kpis = useMemo(() => {
        const total = filtered.reduce((s, r) => s + num(r.total_com_ipi), 0);
        const resellers = new Set(filtered.map(r => r.user_id)).size;
        const pieces = filtered.reduce(
            (s, r) => s + (r.items || []).reduce((si, i) => si + (Number(i.qty) || 0), 0),
            0,
        );
        return {
            count: filtered.length,
            total,
            avg: filtered.length ? total / filtered.length : 0,
            resellers,
            pieces,
        };
    }, [filtered]);

    const ranking = useMemo<ResellerStat[]>(() => {
        const acc = new Map<string, ResellerStat>();
        filtered.forEach(r => {
            const cur = acc.get(r.user_id) || {
                userId: r.user_id,
                name: authorOf(r),
                count: 0,
                total: 0,
                avg: 0,
                lastAt: r.created_at,
                share: 0,
            };
            cur.count += 1;
            cur.total += num(r.total_com_ipi);
            if (r.created_at > cur.lastAt) cur.lastAt = r.created_at;
            acc.set(r.user_id, cur);
        });
        const list = [...acc.values()];
        const max = Math.max(1, ...list.map(x => x.count));
        list.forEach(x => {
            x.avg = x.count ? x.total / x.count : 0;
            x.share = (x.count / max) * 100;
        });
        return list.sort((a, b) => b.count - a.count || b.total - a.total);
    }, [filtered, names]);

    const byMonth = useMemo(() => {
        const acc = new Map<string, { count: number; total: number }>();
        filtered.forEach(r => {
            const k = monthKey(r.created_at);
            const cur = acc.get(k) || { count: 0, total: 0 };
            cur.count += 1;
            cur.total += num(r.total_com_ipi);
            acc.set(k, cur);
        });
        const list = [...acc.entries()]
            .map(([key, v]) => ({ key, ...v }))
            .sort((a, b) => a.key.localeCompare(b.key))
            .slice(-12);
        const max = Math.max(1, ...list.map(x => x.count));
        return list.map(x => ({ ...x, height: (x.count / max) * 100 }));
    }, [filtered]);

    const exportCsv = () => {
        const head = [
            'Numero', 'Data', 'Revendedor', 'Cliente', 'CNPJ', 'Modelo',
            'Itens', 'Pecas', 'Margem (%)', 'Total bruto', 'Total c/ IPI',
        ];
        const esc = (v: any) => `"${String(v ?? '').replace(/"/g, '""')}"`;
        const lines = filtered.map(r => [
            r.quote_number,
            new Date(r.created_at).toLocaleString('pt-BR'),
            authorOf(r),
            r.client_name || '',
            r.client_cnpj || '',
            r.model_name || '',
            (r.items || []).length,
            (r.items || []).reduce((s, i) => s + (Number(i.qty) || 0), 0),
            num(r.margin).toFixed(2).replace('.', ','),
            num(r.total_bruto).toFixed(2).replace('.', ','),
            num(r.total_com_ipi).toFixed(2).replace('.', ','),
        ].map(esc).join(';'));

        // BOM + ';' → abre certo no Excel pt-BR
        const blob = new Blob(['﻿' + [head.map(esc).join(';'), ...lines].join('\r\n')], {
            type: 'text/csv;charset=utf-8;',
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `orcamentos-revendas-${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const periodLabel = PERIODS.find(p => p.id === period)?.label || '';

    return (
        <div className="space-y-8">
            {/* Header + filtros */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-krenke-blue flex items-center gap-2">
                        <TrendingUp className="text-krenke-orange" size={24} /> Relatório de Orçamentos
                    </h1>
                    <p className="text-sm text-gray-500 font-medium">
                        Orçamentos salvos na calculadora do revendedor — quantidade, valores e autor.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={exportCsv}
                        disabled={!filtered.length}
                        className="flex items-center gap-2 px-4 py-2 bg-white border rounded-xl text-sm font-bold text-krenke-blue hover:border-krenke-orange disabled:opacity-40 transition-colors"
                    >
                        <Download size={16} /> CSV
                    </button>
                    <button
                        onClick={() => { fetchRows(period); fetchNames(); }}
                        className="p-2 text-gray-400 hover:text-krenke-orange transition-colors"
                        aria-label="Recarregar"
                    >
                        <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                    </button>
                </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border shadow-sm flex flex-wrap items-center gap-3">
                <div className="flex flex-wrap gap-1 bg-gray-50 p-1 rounded-xl border">
                    {PERIODS.map(p => (
                        <button
                            key={p.id}
                            onClick={() => setPeriod(p.id)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
                                period === p.id
                                    ? 'bg-krenke-orange text-white shadow'
                                    : 'text-gray-500 hover:text-krenke-blue'
                            }`}
                        >
                            {p.label}
                        </button>
                    ))}
                </div>

                <select
                    value={resellerFilter}
                    onChange={e => { setResellerFilter(e.target.value); setVisible(PAGE_SIZE); }}
                    className="px-3 py-2 bg-gray-50 border rounded-xl text-sm outline-none focus:border-krenke-orange"
                >
                    <option value="all">Todos os revendedores</option>
                    {resellerOptions.map(o => (
                        <option key={o.id} value={o.id}>{o.name}</option>
                    ))}
                </select>

                <div className="relative flex-1 min-w-[220px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                        type="text"
                        placeholder="Buscar por nº, cliente, modelo, CNPJ..."
                        value={search}
                        onChange={e => { setSearch(e.target.value); setVisible(PAGE_SIZE); }}
                        className="w-full pl-9 pr-4 py-2 bg-gray-50 border rounded-xl text-sm outline-none focus:border-krenke-orange"
                    />
                </div>
            </div>

            {error && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-sm text-red-600 font-medium">
                    {error}
                </div>
            )}

            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: `Orçamentos (${periodLabel})`, value: kpis.count.toLocaleString('pt-BR'), icon: Receipt, color: 'bg-orange-500' },
                    { label: 'Revendedores ativos', value: kpis.resellers.toLocaleString('pt-BR'), icon: Users, color: 'bg-indigo-500' },
                    { label: 'Valor total (c/ IPI)', value: brl(kpis.total), icon: DollarSign, color: 'bg-emerald-500' },
                    { label: 'Ticket médio', value: brl(kpis.avg), icon: TrendingUp, color: 'bg-blue-500' },
                ].map((s, i) => (
                    <div key={i} className="bg-white p-6 rounded-2xl border shadow-sm flex items-center gap-4">
                        <div className={`${s.color} p-3 rounded-xl text-white shrink-0`}>
                            <s.icon size={24} />
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs text-gray-500 font-medium truncate">{s.label}</p>
                            <p className="text-2xl font-black text-gray-900 truncate">{loading ? '—' : s.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
                {/* Ranking — quem fez */}
                <div className="bg-white p-8 rounded-2xl border shadow-sm">
                    <h3 className="font-black text-xl text-krenke-blue flex items-center gap-2 mb-6">
                        <Trophy className="text-krenke-orange" size={20} /> Quem fez
                    </h3>
                    {loading ? (
                        <p className="text-gray-400 italic text-center py-8">Carregando...</p>
                    ) : ranking.length === 0 ? (
                        <p className="text-gray-400 italic text-center py-8">Nenhum orçamento no período.</p>
                    ) : (
                        <div className="space-y-4">
                            {ranking.map((r, i) => (
                                <div key={r.userId} className="space-y-2">
                                    <div className="flex items-baseline justify-between gap-3">
                                        <p className="font-bold text-gray-900 truncate">
                                            <span className="text-gray-400 font-black mr-2">{i + 1}º</span>
                                            {r.name}
                                        </p>
                                        <p className="text-sm font-black text-krenke-blue whitespace-nowrap">
                                            {r.count} {r.count === 1 ? 'orçamento' : 'orçamentos'}
                                        </p>
                                    </div>
                                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-krenke-orange rounded-full" style={{ width: `${r.share}%` }} />
                                    </div>
                                    <div className="flex items-center justify-between text-[11px] text-gray-500 font-medium">
                                        <span>{brl(r.total)} · média {brl(r.avg)}</span>
                                        <span className="flex items-center gap-1">
                                            <Calendar size={11} /> último {new Date(r.lastAt).toLocaleDateString('pt-BR')}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Volume por mês */}
                <div className="bg-white p-8 rounded-2xl border shadow-sm">
                    <h3 className="font-black text-xl text-krenke-blue flex items-center gap-2 mb-6">
                        <TrendingUp className="text-krenke-orange" size={20} /> Orçamentos por mês
                    </h3>
                    {loading ? (
                        <p className="text-gray-400 italic text-center py-8">Carregando...</p>
                    ) : byMonth.length === 0 ? (
                        <p className="text-gray-400 italic text-center py-8">Sem dados no período.</p>
                    ) : (
                        <div className="flex items-end gap-2 h-56">
                            {byMonth.map(m => (
                                <div key={m.key} className="flex-1 flex flex-col items-center justify-end gap-2 h-full group">
                                    <span className="text-xs font-black text-krenke-blue">{m.count}</span>
                                    <div
                                        className="w-full bg-krenke-orange/80 group-hover:bg-krenke-orange rounded-t-lg transition-colors min-h-[4px]"
                                        style={{ height: `${m.height}%` }}
                                        title={`${monthLabel(m.key)}: ${m.count} orçamentos · ${brl(m.total)}`}
                                    />
                                    <span className="text-[10px] text-gray-400 font-bold uppercase">{monthLabel(m.key)}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Detalhamento */}
            <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
                <div className="p-6 border-b flex items-center justify-between">
                    <h3 className="font-black text-xl text-krenke-blue flex items-center gap-2">
                        <FileText className="text-krenke-orange" size={20} /> Detalhamento
                    </h3>
                    <span className="text-xs font-bold text-gray-400">
                        {filtered.length.toLocaleString('pt-BR')} registro(s)
                    </span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-[10px] uppercase text-gray-400 font-black">
                            <tr>
                                <th className="text-left px-6 py-3">Nº</th>
                                <th className="text-left px-6 py-3">Data</th>
                                <th className="text-left px-6 py-3">Revendedor</th>
                                <th className="text-left px-6 py-3">Cliente</th>
                                <th className="text-left px-6 py-3">Modelo</th>
                                <th className="text-right px-6 py-3">Itens</th>
                                <th className="text-right px-6 py-3">Total c/ IPI</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading && (
                                <tr><td colSpan={7} className="px-6 py-12 text-center text-gray-400 italic">Carregando...</td></tr>
                            )}
                            {!loading && filtered.length === 0 && (
                                <tr><td colSpan={7} className="px-6 py-12 text-center text-gray-400 italic">Nenhum orçamento encontrado.</td></tr>
                            )}
                            {!loading && filtered.slice(0, visible).map(r => (
                                <tr key={r.id} className="border-t hover:bg-orange-50/40 transition-colors">
                                    <td className="px-6 py-3 font-black text-krenke-blue whitespace-nowrap">{r.quote_number}</td>
                                    <td className="px-6 py-3 text-gray-500 whitespace-nowrap">
                                        {new Date(r.created_at).toLocaleDateString('pt-BR')}
                                    </td>
                                    <td className="px-6 py-3 font-bold text-gray-800">{authorOf(r)}</td>
                                    <td className="px-6 py-3 text-gray-600">{r.client_name || '—'}</td>
                                    <td className="px-6 py-3 text-gray-600">{r.model_name || '—'}</td>
                                    <td className="px-6 py-3 text-right text-gray-600">{(r.items || []).length}</td>
                                    <td className="px-6 py-3 text-right font-black text-gray-900 whitespace-nowrap">
                                        {brl(num(r.total_com_ipi))}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {!loading && filtered.length > visible && (
                    <div className="p-4 border-t text-center">
                        <button
                            onClick={() => setVisible(v => v + PAGE_SIZE)}
                            className="px-6 py-2 text-sm font-black text-krenke-orange hover:underline"
                        >
                            Carregar mais ({filtered.length - visible} restantes)
                        </button>
                    </div>
                )}
            </div>

            <p className="text-[11px] text-gray-400 italic">
                Data = primeiro salvamento do orçamento. Orçamento reeditado e salvo com o mesmo número
                conta uma vez. Limite de {MAX_ROWS.toLocaleString('pt-BR')} registros por consulta.
            </p>
        </div>
    );
};

export default QuoteReportView;
