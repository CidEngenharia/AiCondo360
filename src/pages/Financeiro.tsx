import React from 'react';
import { CreditCard, Landmark, Receipt, TrendingUp, TrendingDown, DollarSign, Search, Filter } from 'lucide-react';
import { motion } from 'motion/react';

const FinanceiroPage: React.FC = () => {
  return (
    <div className="p-6 lg:p-10 space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Gestão Financeira</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Gerencie fluxo de caixa, inadimplência e boletos de forma simples.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm">
            <TrendingDown size={18} className="text-red-500" />
            Lançar Despesa
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-blue-200 dark:shadow-none">
            <TrendingUp size={18} className="text-emerald-300" />
            Registrar Receita
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Saldo Total', value: 'R$ 42.500,00', icon: Landmark, color: 'bg-blue-500' },
          { label: 'Recebido (Mês)', value: 'R$ 15.200,00', icon: TrendingUp, color: 'bg-emerald-500' },
          { label: 'Despesas (Mês)', value: 'R$ 8.400,00', icon: TrendingDown, color: 'bg-rose-500' },
          { label: 'Inadimplência', value: '4.2%', icon: Receipt, color: 'bg-amber-500' },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm"
          >
            <div className="flex items-center gap-4">
              <div className={`${stat.color} p-3 rounded-xl text-white shadow-lg`}>
                <stat.icon size={22} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">{stat.value}</h3>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Últimas Movimentações</h2>
            <button className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline">Ver tudo</button>
          </div>
          <div className="p-12 text-center text-slate-300 dark:text-slate-600">
            <DollarSign size={48} className="mx-auto mb-4 opacity-20" />
            <p className="font-medium text-slate-400">Nenhuma transação registrada neste período.</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-6 space-y-6">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Relatórios Rápidos</h2>
          <div className="space-y-3">
             {[
               { name: 'DRE Consolidado', desc: 'Resumo de receitas e despesas' },
               { name: 'Relatório de Inadimplência', desc: 'Lista de unidades com débitos' },
               { name: 'Previsão Orçamentária', desc: 'Estimativa para os próximos 6 meses' },
               { name: 'Movimentação Bancária', desc: 'Extrato das contas do condomínio' },
             ].map((report, i) => (
               <button key={i} className="w-full text-left p-4 rounded-xl border border-slate-50 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900 hover:border-blue-500/20 transition-all flex items-center justify-between group">
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400">{report.name}</h4>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{report.desc}</p>
                  </div>
                  <TrendingUp size={16} className="text-slate-300 group-hover:text-blue-500" />
               </button>
             ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinanceiroPage;
