import React, { useState, useMemo } from 'react';
import {
  CreditCard, Landmark, Receipt, TrendingUp, TrendingDown, DollarSign,
  Plus, X, FileText, Download, ChevronRight, Droplets, Zap, Building2,
  Wrench, Waves, MoreHorizontal, Calendar, Filter, Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';

// ─── Types ───────────────────────────────────────────────────────────────────
type ExpenseOrigin =
  | 'Água'
  | 'Luz'
  | 'Condomínio'
  | 'Manutenção Predial'
  | 'Manutenção da Piscina'
  | 'Outros';

interface Despesa {
  id: string;
  nome: string;
  valor: number;
  origem: ExpenseOrigin;
  observacao: string;
  file_url?: string;
  created_at: string;
}

interface IBoleto {
  id: string;
  nome: string;
  valor: number;
  vencimento: string;
  status: 'pendente' | 'pago' | 'atrasado';
  alerta: boolean;
  created_at: string;
}

// ─── Constants ───────────────────────────────────────────────────────────────
const ORIGENS: { label: ExpenseOrigin; icon: React.ElementType; color: string }[] = [
  { label: 'Água',                 icon: Droplets,  color: 'bg-cyan-500/10 text-cyan-500' },
  { label: 'Luz',                  icon: Zap,       color: 'bg-yellow-500/10 text-yellow-500' },
  { label: 'Condomínio',           icon: Building2, color: 'bg-blue-500/10 text-blue-500' },
  { label: 'Manutenção Predial',   icon: Wrench,    color: 'bg-orange-500/10 text-orange-500' },
  { label: 'Manutenção da Piscina',icon: Waves,     color: 'bg-teal-500/10 text-teal-500' },
  { label: 'Outros',               icon: MoreHorizontal, color: 'bg-slate-500/10 text-slate-500' },
];

const EMPTY_FORM = {
  activeTab: 'despesa' as 'despesa' | 'boleto',
  nome: '',
  valor: '',
  origem: 'Condomínio' as ExpenseOrigin,
  observacao: '',
  vencimento: new Date().toISOString().split('T')[0],
  alerta: true
};

// ─── Helper ───────────────────────────────────────────────────────────────────
const fmt = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

const filterByDays = (items: Despesa[], days: number) => {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  return items.filter(d => new Date(d.created_at) >= cutoff);
};

const originInfo = (o: ExpenseOrigin) =>
  ORIGENS.find(r => r.label === o) ?? ORIGENS[ORIGENS.length - 1];

// ─── Component ────────────────────────────────────────────────────────────────
const FinanceiroPage: React.FC = () => {
  const { user } = useAuth();

  // modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  // listas locais
  const [despesas, setDespesas] = useState<Despesa[]>([]);
  const [boletos, setBoletos] = useState<IBoleto[]>([]);

  // relatório
  const [reportDays, setReportDays] = useState<7 | 15 | null>(null);
  const [boletoReportFilter, setBoletoReportFilter] = useState<7 | 15 | null>(null);

  // ── Computed ──────────────────────────────────────────────────────────────
  const totalGasto = useMemo(() => despesas.reduce((s, d) => s + d.valor, 0), [despesas]);

  const reportItems = useMemo(
    () => (reportDays ? filterByDays(despesas, reportDays) : despesas),
    [despesas, reportDays]
  );

  const reportTotal = useMemo(
    () => reportItems.reduce((s, d) => s + d.valor, 0),
    [reportItems]
  );

  // agrupamento por origem para sumário
  const byOrigin = useMemo(() => {
    const acc: Record<string, number> = {};
    reportItems.forEach(d => {
      acc[d.origem] = (acc[d.origem] ?? 0) + d.valor;
    });
    return Object.entries(acc).sort((a, b) => b[1] - a[1]);
  }, [reportItems]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nome.trim() || !form.valor) return;

    setSaving(true);
    try {
      if (form.activeTab === 'despesa') {
        const nova: Despesa = {
          id: crypto.randomUUID(),
          nome: form.nome.trim(),
          valor: parseFloat(form.valor.replace(',', '.')),
          origem: form.origem,
          observacao: form.observacao.trim(),
          created_at: new Date().toISOString(),
        };
        setDespesas(prev => [nova, ...prev]);
      } else {
        const novo: IBoleto = {
          id: crypto.randomUUID(),
          nome: form.nome.trim(),
          valor: parseFloat(form.valor.replace(',', '.')),
          vencimento: form.vencimento,
          status: 'pendente',
          alerta: form.alerta,
          created_at: new Date().toISOString(),
        };
        setBoletos(prev => [novo, ...prev]);
      }
      setForm(EMPTY_FORM);
      setIsModalOpen(false);
    } finally {
      setSaving(false);
    }
  };

  const handleExportBoletoReport = (days: 7 | 15) => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() + days);
    
    const filtered = boletos.filter(b => {
      const dv = new Date(b.vencimento);
      return dv <= cutoff && dv >= new Date() && b.status === 'pendente';
    });

    if (filtered.length === 0) {
      alert(`Nenhum boleto a vencer nos próximos ${days} dias.`);
      return;
    }

    const rows = [
      ['Boleto', 'Valor', 'Vencimento', 'Status'],
      ...filtered.map(b => [
        b.nome,
        fmt(b.valor),
        new Date(b.vencimento).toLocaleDateString('pt-BR'),
        b.status
      ])
    ];

    const csv = rows.map(r => r.map(c => `"${c}"`).join(';')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `boletos_vencimento_${days}_dias.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Excluir esta despesa?')) {
      setDespesas(prev => prev.filter(d => d.id !== id));
    }
  };

  const handleExportCSV = () => {
    const rows = [
      ['Nome', 'Origem', 'Valor', 'Observação', 'Data'],
      ...reportItems.map(d => [
        d.nome,
        d.origem,
        d.valor.toFixed(2).replace('.', ','),
        d.observacao,
        new Date(d.created_at).toLocaleDateString('pt-BR'),
      ]),
    ];
    const csv = rows.map(r => r.map(c => `"${c}"`).join(';')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio_despesas_${reportDays ?? 'total'}_dias.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="p-4 sm:p-6 lg:p-10 space-y-8 min-h-screen bg-slate-50/50 dark:bg-slate-950/50">

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 text-emerald-600 rounded-full text-xs font-bold uppercase tracking-wider mb-3">
            <DollarSign size={13} />
            Gestão Financeira
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Controle <span className="text-emerald-500">Financeiro</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Gerencie despesas, boletos e gere relatórios do condomínio.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => { setForm({...EMPTY_FORM, activeTab: 'boleto'}); setIsModalOpen(true); }}
            className="flex items-center gap-2 px-5 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-2xl text-sm font-bold transition-all shadow-lg shadow-indigo-500/25 active:scale-95"
          >
            <Calendar size={18} />
            Novo Boleto
          </button>
          <button
            onClick={() => { setForm({...EMPTY_FORM, activeTab: 'despesa'}); setIsModalOpen(true); }}
            className="flex items-center gap-2 px-5 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl text-sm font-bold transition-all shadow-lg shadow-emerald-500/25 active:scale-95"
          >
            <Plus size={18} />
            Lançar Despesa
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total de Despesas', value: fmt(totalGasto), icon: TrendingDown, color: 'bg-rose-500' },
          { label: 'Registros', value: `${despesas.length} lançamentos`, icon: Receipt, color: 'bg-blue-500' },
          { label: 'Últimos 7 dias', value: fmt(filterByDays(despesas, 7).reduce((s, d) => s + d.valor, 0)), icon: Calendar, color: 'bg-amber-500' },
          { label: 'Últimos 15 dias', value: fmt(filterByDays(despesas, 15).reduce((s, d) => s + d.valor, 0)), icon: Landmark, color: 'bg-indigo-500' },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm"
          >
            <div className="flex items-center gap-4">
              <div className={`${stat.color} p-3 rounded-xl text-white shadow`}>
                <stat.icon size={20} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">{stat.value}</h3>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Relatórios rápidos + Lista */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Lista de despesas */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4 flex-wrap">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Últimas Movimentações</h2>
            <div className="flex items-center gap-2">
              {([null, 7, 15] as const).map(d => (
                <button
                  key={String(d)}
                  onClick={() => setReportDays(d)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    reportDays === d
                      ? 'bg-emerald-500 text-white shadow'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200'
                  }`}
                >
                  {d === null ? 'Tudo' : `${d} dias`}
                </button>
              ))}
              {reportItems.length > 0 && (
                <button
                  onClick={handleExportCSV}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 transition-all"
                >
                  <Download size={13} />
                  CSV
                </button>
              )}
            </div>
          </div>

          {reportItems.length === 0 ? (
            <div className="p-16 text-center">
              <DollarSign size={48} className="mx-auto mb-4 text-slate-200 dark:text-slate-700" />
              <p className="font-medium text-slate-400 dark:text-slate-500">
                Nenhuma despesa registrada {reportDays ? `nos últimos ${reportDays} dias` : ''}.
              </p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="mt-4 px-5 py-2.5 bg-emerald-500 text-white rounded-xl text-sm font-bold hover:bg-emerald-600 transition-all"
              >
                + Lançar primeiro
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-50 dark:divide-slate-800">
              <AnimatePresence>
                {reportItems.map((d) => {
                  const info = originInfo(d.origem);
                  return (
                    <motion.div
                      key={d.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group"
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${info.color}`}>
                        <info.icon size={18} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{d.nome}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">{d.origem} · {new Date(d.created_at).toLocaleDateString('pt-BR')}</p>
                        {d.observacao && <p className="text-[11px] text-slate-500 truncate mt-0.5 italic">"{d.observacao}"</p>}
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-bold text-rose-500">- {fmt(d.valor)}</p>
                      </div>
                      <button
                        onClick={() => handleDelete(d.id)}
                        className="opacity-0 group-hover:opacity-100 p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-all"
                      >
                        <Trash2 size={15} />
                      </button>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
              <div className="px-5 py-4 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total do período</span>
                <span className="text-base font-black text-rose-500">{fmt(reportTotal)}</span>
              </div>
            </div>
          )}
        </div>

        {/* Painel lateral: sumário e relatórios */}
        <div className="space-y-6">

          {/* Sumário por origem */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-5">
            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4">Por Categoria</h2>
            {byOrigin.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">Nenhuma despesa ainda.</p>
            ) : (
              <div className="space-y-3">
                {byOrigin.map(([origem, valor]) => {
                  const info = originInfo(origem as ExpenseOrigin);
                  const pct = reportTotal > 0 ? (valor / reportTotal) * 100 : 0;
                  return (
                    <div key={origem}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${info.color}`}>
                            <info.icon size={12} />
                          </div>
                          <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">{origem}</span>
                        </div>
                        <span className="text-xs font-bold text-slate-800 dark:text-white">{fmt(valor)}</span>
                      </div>
                      <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Relatórios Rápidos Financeiro */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-5">
            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4">Relatórios de Despesas</h2>
            <div className="space-y-2">
              {[7, 15].map(days => (
                <button
                  key={days}
                  onClick={() => { setReportDays(days as any); handleExportCSV(); }}
                  className="w-full text-left p-4 rounded-xl border border-slate-100 dark:border-slate-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/10 hover:border-emerald-200 transition-all flex items-center justify-between group"
                >
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 group-hover:text-emerald-600">Últimos {days} dias</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">Baixar movimentações recentes</p>
                  </div>
                  <Download size={14} className="text-slate-300 group-hover:text-emerald-500" />
                </button>
              ))}
            </div>
          </div>

          {/* Relatórios de Vencimento de Boletos */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-5 border-l-4 border-l-indigo-500">
            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-1">Vencimentos</h2>
            <p className="text-[10px] text-slate-400 mb-4 uppercase font-bold tracking-widest">Próximos Boletos</p>
            <div className="space-y-2">
              {[7, 15].map(days => (
                <button
                  key={days}
                  onClick={() => handleExportBoletoReport(days as any)}
                  className="w-full text-left p-4 rounded-xl border border-slate-100 dark:border-slate-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/10 hover:border-indigo-200 transition-all flex items-center justify-between group"
                >
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600">Vencer em {days} dias</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">Gerar lista de pagamentos</p>
                  </div>
                  <Download size={14} className="text-slate-300 group-hover:text-indigo-500" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Boletos Cadastrados */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden mt-8">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800">
           <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
             <Calendar size={18} className="text-indigo-500" />
             Boletos Registrados
           </h2>
        </div>
        {boletos.length === 0 ? (
          <div className="p-12 text-center text-slate-400">Nenhum boleto cadastrado no momento.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0 divide-x divide-y divide-slate-50 dark:divide-slate-800">
            {boletos.map(b => {
              const dv = new Date(b.vencimento);
              const hoje = new Date();
              const diffTime = dv.getTime() - hoje.getTime();
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
              const isUrgent = diffDays <= 3 && b.status === 'pendente';

              return (
                <div key={b.id} className={`p-5 transition-all hover:bg-slate-50 dark:hover:bg-slate-800/30 relative overflow-hidden group`}>
                  {isUrgent && <div className="absolute top-0 right-0 w-20 h-20 bg-rose-500/10 rotate-45 translate-x-10 -translate-y-10" />}
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="font-bold text-slate-800 dark:text-white truncate pr-8">{b.nome}</h4>
                    {b.alerta && isUrgent && (
                      <span className="flex h-2 w-2 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                      </span>
                    )}
                  </div>
                  <p className="text-xl font-black text-indigo-600 dark:text-indigo-400 mb-4">{fmt(b.valor)}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                      <Calendar size={12} />
                      {dv.toLocaleDateString('pt-BR')}
                    </div>
                    {isUrgent ? (
                      <span className="text-[10px] font-bold text-rose-500 bg-rose-50 dark:bg-rose-900/20 px-2 py-1 rounded-md uppercase tracking-tighter">Vence em {diffDays} dias</span>
                    ) : (
                      <span className="text-[10px] font-medium text-slate-400 bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded-md uppercase">Pendente</span>
                    )}
                  </div>
                  
                  <button 
                    onClick={() => setBoletos(prev => prev.filter(x => x.id !== b.id))}
                    className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 p-1.5 text-slate-300 hover:text-rose-500 transition-all"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ─── Modal de Lançamento ─────────────────────────────────────────────── */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-950/40 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
            >
              {/* Header do modal */}
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 ${form.activeTab === 'despesa' ? 'bg-emerald-500/10' : 'bg-indigo-500/10'} rounded-2xl flex items-center justify-center transition-colors`}>
                    {form.activeTab === 'despesa' ? <TrendingDown size={20} className="text-emerald-500" /> : <Calendar size={20} className="text-indigo-500" />}
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-slate-900 dark:text-white">
                      {form.activeTab === 'despesa' ? 'Lançar Despesa' : 'Cadastrar Boleto'}
                    </h2>
                    <p className="text-xs text-slate-400">
                      {form.activeTab === 'despesa' ? 'Registre uma nova saída financeira' : 'Agende um pagamento futuro'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSave} className="p-6 space-y-5">

                {/* Nome do Registro */}
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                    {form.activeTab === 'despesa' ? 'Nome da Despesa *' : 'Nome do Boleto *'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={form.activeTab === 'despesa' ? "Ex: Conta de água" : "Ex: Manutenção Elevador"}
                    value={form.nome}
                    onChange={e => setForm({ ...form, nome: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-emerald-500/20 font-medium dark:text-white transition-all"
                  />
                </div>

                {/* Valor + Dinâmico (Origem ou Vencimento) */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Valor (R$) *</label>
                    <input
                      type="number"
                      required
                      min="0.01"
                      step="0.01"
                      placeholder="0,00"
                      value={form.valor}
                      onChange={e => setForm({ ...form, valor: e.target.value })}
                      className={`w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 ${form.activeTab === 'despesa' ? 'focus:ring-emerald-500/20' : 'focus:ring-indigo-500/20'} font-medium dark:text-white transition-all`}
                    />
                  </div>
                  {form.activeTab === 'despesa' ? (
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Origem *</label>
                      <select
                        value={form.origem}
                        onChange={e => setForm({ ...form, origem: e.target.value as ExpenseOrigin })}
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-emerald-500/20 font-medium dark:text-white transition-all appearance-none cursor-pointer"
                      >
                        {ORIGENS.map(o => (
                          <option key={o.label} value={o.label}>{o.label}</option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Vencimento *</label>
                      <input
                        type="date"
                        required
                        value={form.vencimento}
                        onChange={e => setForm({ ...form, vencimento: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-indigo-500/20 font-medium dark:text-white transition-all cursor-pointer"
                      />
                    </div>
                  )}
                </div>

                {form.activeTab === 'boleto' && (
                  <div className="flex items-center justify-between p-4 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-300 rounded-xl">
                    <div className="flex items-center gap-2">
                      <Zap size={16} />
                      <span className="text-xs font-bold">Ativar Alerta de Vencimento</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={form.alerta} 
                        onChange={e => setForm({...form, alerta: e.target.checked})}
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>
                )}

                {form.activeTab === 'despesa' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Observações</label>
                    <textarea
                      rows={2}
                      placeholder="Detalhes adicionais..."
                      value={form.observacao}
                      onChange={e => setForm({ ...form, observacao: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-emerald-500/20 font-medium dark:text-white transition-all resize-none"
                    />
                  </div>
                )}

                {/* Upload de comprovante */}
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Comprovante / Boleto</label>
                  <button
                    type="button"
                    className="w-full px-4 py-3 bg-indigo-50 dark:bg-indigo-900/10 border-2 border-dashed border-indigo-200 dark:border-indigo-800 rounded-xl flex items-center justify-center gap-3 text-indigo-500 hover:bg-indigo-100 dark:hover:bg-indigo-900/20 transition-all group"
                  >
                    <FileText size={18} className="group-hover:scale-110 transition-transform" />
                    <span className="text-sm font-bold">Anexar PDF / Imagem</span>
                  </button>
                  <p className="text-[10px] text-slate-400 mt-1.5 text-center">Upload disponível após integração com Supabase Storage</p>
                </div>

                {/* Ações */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-xl font-bold hover:bg-slate-200 transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className={`flex-[2] py-3 ${form.activeTab === 'despesa' ? 'bg-emerald-500' : 'bg-indigo-500'} text-white rounded-xl font-bold hover:brightness-110 transition-all shadow-lg active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2`}
                  >
                    {form.activeTab === 'despesa' ? <Plus size={18} /> : <Calendar size={18} />}
                    {saving ? 'Salvando...' : (form.activeTab === 'despesa' ? 'Registrar Despesa' : 'Cadastrar Boleto')}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FinanceiroPage;
