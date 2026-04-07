import React, { useState, useMemo, useEffect } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  Filter, 
  Plus,
  FileText,
  AlertCircle,
  CheckCircle2,
  Clock,
  Download,
  Search,
  MoreVertical,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  Building2,
  Wallet,
  CreditCard,
  PieChart,
  ExternalLink,
  RefreshCcw,
  X,
  Trash2,
  Eye,
  BarChart3,
  Pencil
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { FinanceiroService, BoletoService } from '../services/supabaseService';
import { useAuth } from '../contexts/AuthContext';

// --- Types ---
type FinanceiroTab = 'geral' | 'boletos' | 'relatorios';

interface DespesaItem {
  id: string;
  nome: string;
  valor: number;
  origem: 'manutencao' | 'limpeza' | 'seguranca' | 'utilitarios' | 'pessoal' | 'outros';
  observacao: string;
  created_at: string;
}

interface BoletoItem {
  id: string;
  nome: string;
  valor: number;
  vencimento: string;
  status: 'paid' | 'pending' | 'overdue' | 'pago' | 'pendente' | 'atrasado';
  alerta?: boolean;
  created_at: string;
}

const EMPTY_FORM = {
  activeTab: 'despesa' as 'despesa' | 'boleto',
  nome: '',
  valor: '',
  vencimento: format(new Date(), 'yyyy-MM-dd'),
  origem: 'manutencao' as DespesaItem['origem'],
  observacao: ''
};

const fmt = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

// --- Component ---
const FinanceiroPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<FinanceiroTab>('geral');
  const [boletos, setBoletos] = useState<BoletoItem[]>([]);
  const [despesas, setDespesas] = useState<DespesaItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<{type: 'despesa' | 'boleto', id: string} | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [reportDays, setReportDays] = useState(7);

  // ── Computed ──────────────────────────────────────────────────────────────
  const totalGasto = useMemo(() => despesas.reduce((s, d) => s + d.valor, 0), [despesas]);

  // Dados combinados para relatórios
  const reportItems = useMemo(() => {
    return [
      ...despesas,
      ...boletos.map(b => ({
        id: b.id,
        nome: b.nome,
        valor: b.valor,
        origem: 'outros' as const,
        observacao: `Boleto - Status: ${b.status}`,
        created_at: b.created_at
      }))
    ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [despesas, boletos]);

  const reportTotal = useMemo(
    () => reportItems.reduce((s, d) => s + d.valor, 0),
    [reportItems]
  );

  const stats = useMemo(() => {
    const totalBoletos = boletos.reduce((acc, b) => acc + b.valor, 0);
    const pendentes = boletos.filter(b => b.status === 'pending' || b.status === 'pendente').length;
    
    return {
      total: totalBoletos + totalGasto,
      boletos: totalBoletos,
      despesas: totalGasto,
      pendentes
    };
  }, [boletos, totalGasto]);

  const byOrigin = useMemo(() => {
    const acc: Record<string, number> = {};
    reportItems.forEach(d => {
      acc[d.origem] = (acc[d.origem] ?? 0) + d.valor;
    });
    return Object.entries(acc).sort((a, b) => b[1] - a[1]);
  }, [reportItems]);

  // ── Fetching ──────────────────────────────────────────────────────────────
  const fetchData = async () => {
    if (!user?.condoId) return;
    try {
      const [b, e] = await Promise.all([
        BoletoService.getCondoBoletos(user.condoId),
        FinanceiroService.getCondoExpenses(user.condoId)
      ]);
      
      setBoletos(b.map(x => ({
          id: x.id,
          nome: x.barcode || 'Boleto Geral',
          valor: Number(x.amount),
          vencimento: x.due_date,
          status: x.status as any,
          alerta: true,
          created_at: x.created_at
      })));

      setDespesas(e.map(x => ({
          id: x.id,
          nome: x.nome,
          valor: x.valor,
          origem: x.origem as any,
          observacao: x.observacao || '',
          created_at: x.created_at
      })));
    } catch (err) {
       console.error("Error fetching financial data:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user?.condoId]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalCondoId = user?.condoId;
    if (!finalCondoId || finalCondoId.trim() === '') {
      alert("⚠️ Sem condomínio selecionado!\n\nSe você for Administrador Global, selecione um condomínio no menu superior antes de lançar dados financeiros.");
      return;
    }
    if (!form.nome.trim() || !form.valor) return;

    setSaving(true);
    try {
      const dueDate = new Date(form.vencimento);
      const monthYear = format(dueDate, "MM/yyyy");

      if (editingRecord) {
        if (editingRecord.type === 'despesa') {
          await FinanceiroService.updateExpense(editingRecord.id, {
            nome: form.nome.trim(),
            valor: parseFloat(String(form.valor).replace(',', '.')),
            origem: form.origem,
            observacao: form.observacao.trim()
          });
        } else {
          await BoletoService.updateBoleto(editingRecord.id, {
            amount: parseFloat(String(form.valor).replace(',', '.')),
            due_date: form.vencimento,
            barcode: form.nome.trim(),
            month: monthYear
          });
        }
      } else {
        if (form.activeTab === 'despesa') {
          await FinanceiroService.createExpense({
            condominio_id: user.condoId,
            nome: form.nome.trim(),
            valor: parseFloat(String(form.valor).replace(',', '.')),
            origem: form.origem,
            observacao: form.observacao.trim()
          });
        } else {
          await BoletoService.createBoleto({
            condominio_id: user.condoId,
            user_id: null as any, 
            amount: parseFloat(String(form.valor).replace(',', '.')),
            due_date: form.vencimento,
            status: 'pending',
            barcode: form.nome.trim(),
            month: monthYear
          });
        }
      }
      await fetchData();
      setForm(EMPTY_FORM);
      setIsModalOpen(false);
      setEditingRecord(null);
    } catch (err: any) {
       console.error("Error saving financial record:", err);
       alert(`Erro ao salvar dados financeiros: ${err.message || 'Erro desconhecido'}`);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (type: 'despesa' | 'boleto', record: any) => {
    setEditingRecord({ type, id: record.id });
    setForm({
      nome: type === 'despesa' ? record.nome : record.barcode,
      valor: type === 'despesa' ? record.valor : record.amount,
      vencimento: type === 'despesa' ? new Date().toISOString().split('T')[0] : record.due_date,
      origem: type === 'despesa' ? record.origem : 'Outros',
      observacao: type === 'despesa' ? record.observacao : '',
      activeTab: type
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (type: 'despesa' | 'boleto', id: string) => {
    if (!confirm('Deseja realmente excluir este registro?')) return;
    try {
      if (type === 'despesa') await FinanceiroService.deleteExpense(id);
      else await BoletoService.deleteBoleto(id);
      fetchData();
    } catch (err) {
      alert('Erro ao excluir.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-indigo-600 rounded-2xl text-white shadow-lg">
                <Wallet size={20} />
              </div>
              <h1 className="text-xl font-medium text-slate-800 dark:text-white tracking-tight">Financeiro</h1>
            </div>
            <p className="text-xs text-slate-500 font-normal">Gestão inteligente de contas e despesas</p>
          </div>

          {user?.role !== 'resident' && (
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-5 py-3 rounded-2xl font-medium transition-all shadow-md hover:translate-y-[-1px] active:translate-y-[0px] text-sm"
            >
              <Plus size={18} />
              Lançar Novo
            </button>
          )}
        </header>

        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm relative group">
            <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest mb-1">Balanço Total</p>
            <h3 className="text-lg font-medium text-slate-800 dark:text-white">{fmt(stats.total)}</h3>
            <div className="mt-2 flex items-center gap-1.5 text-indigo-500">
              <TrendingUp size={14} />
              <span className="text-[10px] font-medium uppercase tracking-tight">Recursos Ativos</span>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
            <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest mb-1">Despesas Fixas</p>
            <h3 className="text-lg font-medium text-rose-500">{fmt(stats.despesas)}</h3>
            <div className="mt-2 text-rose-400 text-[10px] font-medium flex items-center gap-1">
              <TrendingDown size={14} />
              {despesas.length} REGISTROS
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
            <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest mb-1">Contas (Boletos)</p>
            <h3 className="text-lg font-medium text-amber-500">{fmt(stats.boletos)}</h3>
            <div className="mt-2 text-amber-500 text-[10px] font-medium flex items-center gap-1">
              <Clock size={14} />
              {stats.pendentes} PENDENTES
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="p-5 bg-indigo-600 rounded-3xl shadow-lg shadow-indigo-200 dark:shadow-none">
            <p className="text-[10px] font-medium text-indigo-100 uppercase tracking-widest mb-1">Saldo Líquido</p>
            <h3 className="text-lg font-medium text-white">{fmt(stats.total * -0.8)}</h3>
            <div className="mt-2 text-indigo-100 text-[10px] font-medium flex items-center gap-1">
              <CheckCircle2 size={14} />
              DISPONÍVEL
            </div>
          </motion.div>
        </div>

        {/* Tabs Control */}
        <div className="flex p-1 bg-slate-200/50 dark:bg-slate-800/50 rounded-2xl w-fit border border-white/10 mt-4">
          {(['geral', 'boletos', 'relatorios'] as FinanceiroTab[]).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-1.5 rounded-xl font-medium text-[11px] uppercase transition-all ${
                activeTab === tab 
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content Section */}
        <div className="mt-6">
          <AnimatePresence mode="wait">
            {activeTab === 'geral' && (
              <motion.div 
                key="geral" 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                className="grid grid-cols-1 lg:grid-cols-3 gap-6"
              >
                <div className="lg:col-span-1 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
                  <h4 className="font-medium text-sm text-slate-800 dark:text-white mb-6 uppercase tracking-tight">Origem das Despesas</h4>
                  <div className="space-y-4">
                    {byOrigin.map(([org, val]) => (
                      <div key={org}>
                        <div className="flex justify-between text-[10px] font-medium uppercase text-slate-400 mb-1">
                          <span>{org}</span>
                          <span className="text-slate-700 dark:text-white">{fmt(val)}</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-indigo-500 rounded-full"
                            style={{ width: `${(val / totalGasto) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <h4 className="font-medium text-sm text-slate-800 dark:text-white uppercase tracking-tight">Últimos Lançamentos</h4>
                    <button className="text-[10px] font-medium text-indigo-500 uppercase tracking-widest">Ver todos</button>
                  </div>
                  <div className="divide-y divide-slate-50 dark:divide-slate-800">
                    {reportItems.slice(0, 6).map(item => (
                      <div key={item.id} className="flex items-center justify-between py-3 group">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 group-hover:scale-105 transition-transform">
                            {item.origem === 'outros' ? <CreditCard size={14} className="text-amber-500" /> : <TrendingDown size={14} className="text-rose-400" />}
                          </div>
                          <div>
                            <p className="text-sm font-normal text-slate-700 dark:text-white">{item.nome}</p>
                            <p className="text-[10px] text-slate-400 uppercase">{format(new Date(item.created_at), 'dd/MM/yyyy')}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                           <span className="text-sm font-medium text-slate-800 dark:text-white">{fmt(item.valor)}</span>
                           {user?.role !== 'resident' && (
                             <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => handleEdit(item.origem === 'outros' ? 'boleto' : 'despesa', item)} className="p-1.5 text-slate-400 hover:text-indigo-500"><Pencil size={12}/></button>
                                <button onClick={() => handleDelete(item.origem === 'outros' ? 'boleto' : 'despesa', item.id)} className="p-1.5 text-slate-400 hover:text-rose-500"><Trash2 size={12}/></button>
                             </div>
                           )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'boletos' && (
              <motion.div key="boletos" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {boletos.map(boleto => (
                  <div key={boleto.id} className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm relative group">
                    <div className="flex justify-between items-start mb-4">
                      <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-xl">
                        <FileText className="text-amber-500" size={18} />
                      </div>
                      <span className={`px-2 py-0.5 rounded-lg text-[9px] font-medium uppercase ${
                        boleto.status === 'paid' || boleto.status === 'pago' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                      }`}>
                        {boleto.status === 'paid' || boleto.status === 'pago' ? 'Pago' : 'Pendente'}
                      </span>
                    </div>
                    <h5 className="text-sm font-medium text-slate-800 dark:text-white mb-1">{boleto.nome}</h5>
                    <p className="text-[10px] text-slate-400">Vencimento: {format(new Date(boleto.vencimento), 'dd/MM/yyyy')}</p>
                    <div className="mt-4 flex items-center justify-between border-t border-slate-50 dark:border-slate-800 pt-3">
                      <span className="text-md font-medium text-slate-800 dark:text-white">{fmt(boleto.valor)}</span>
                      {user?.role !== 'resident' && (
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                           <button onClick={() => handleEdit('boleto', boleto)} className="p-1.5 text-slate-400 hover:text-indigo-500"><Pencil size={14}/></button>
                           <button onClick={() => handleDelete('boleto', boleto.id)} className="p-1.5 text-slate-400 hover:text-rose-500"><Trash2 size={14}/></button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Cadastro Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => { setIsModalOpen(false); setEditingRecord(null); }} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
             <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }} className="bg-white dark:bg-slate-900 w-full max-w-[380px] rounded-3xl overflow-hidden shadow-2xl relative border border-white/20">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="text-md font-medium text-slate-800 dark:text-white tracking-tight">{editingRecord ? 'Editar' : 'Lançar Novo'}</h3>
                      <p className="text-[10px] text-slate-500">Dados financeiros do condomínio</p>
                    </div>
                    <button onClick={() => { setIsModalOpen(false); setEditingRecord(null); }} className="text-slate-400 hover:text-slate-600"><X size={18}/></button>
                  </div>

                  <div className="flex gap-2 mb-6 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-fit">
                    <button onClick={() => setForm({...form, activeTab: 'despesa'})} className={`px-4 py-1.5 rounded-lg text-[10px] font-medium uppercase transition-all ${form.activeTab === 'despesa' ? 'bg-white dark:bg-slate-700 text-slate-900 shadow-sm' : 'text-slate-400'}`}>Despesa</button>
                    <button onClick={() => setForm({...form, activeTab: 'boleto'})} className={`px-4 py-1.5 rounded-lg text-[10px] font-medium uppercase transition-all ${form.activeTab === 'boleto' ? 'bg-white dark:bg-slate-700 text-slate-900 shadow-sm' : 'text-slate-400'}`}>Boleto</button>
                  </div>

                  <form onSubmit={handleSave} className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[9px] font-medium text-slate-400 uppercase tracking-widest ml-1">Descrição</label>
                      <input required value={form.nome} onChange={e => setForm({...form, nome: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border-none px-4 py-2.5 rounded-xl text-sm font-normal text-slate-800 dark:text-white focus:ring-1 ring-indigo-500" placeholder="Ex: Manutenção Mensal"/>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[9px] font-medium text-slate-400 uppercase tracking-widest ml-1">Valor (R$)</label>
                        <input required type="number" step="0.01" value={form.valor} onChange={e => setForm({...form, valor: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border-none px-4 py-2.5 rounded-xl text-sm font-normal text-slate-800 dark:text-white focus:ring-1 ring-indigo-500" placeholder="0,00"/>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-medium text-slate-400 uppercase tracking-widest ml-1">Vencimento</label>
                        <input required type="date" value={form.vencimento} onChange={e => setForm({...form, vencimento: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border-none px-4 py-2.5 rounded-xl text-sm font-normal text-slate-800 dark:text-white focus:ring-1 ring-indigo-500"/>
                      </div>
                    </div>

                    {form.activeTab === 'despesa' && (
                      <div className="space-y-1">
                        <label className="text-[9px] font-medium text-slate-400 uppercase tracking-widest ml-1">Categoria</label>
                        <select value={form.origem} onChange={e => setForm({...form, origem: e.target.value as any})} className="w-full bg-slate-50 dark:bg-slate-800 border-none px-4 py-2.5 rounded-xl text-sm font-normal text-slate-800 dark:text-white focus:ring-1 ring-indigo-500">
                          <option value="manutencao">Manutenção</option>
                          <option value="limpeza">Limpeza</option>
                          <option value="seguranca">Segurança</option>
                          <option value="utilitarios">Utilitários</option>
                          <option value="outros">Outros</option>
                        </select>
                      </div>
                    )}

                    <div className="space-y-1">
                      <label className="text-[9px] font-medium text-slate-400 uppercase tracking-widest ml-1">Observações</label>
                      <textarea value={form.observacao} onChange={e => setForm({...form, observacao: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border-none px-4 py-2.5 rounded-xl text-xs font-normal text-slate-800 dark:text-white h-20 resize-none" placeholder="Opcional..."/>
                    </div>

                    <button disabled={saving} type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-medium text-sm transition-all flex items-center justify-center gap-2 mt-2">
                       {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : (editingRecord ? 'Atualizar' : 'Confirmar')}
                    </button>
                  </form>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FinanceiroPage;
