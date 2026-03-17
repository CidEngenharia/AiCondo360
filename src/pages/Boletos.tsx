import React, { useState } from 'react';
import { motion } from 'motion/react';
import { CreditCard, Download, ExternalLink, Filter, Search, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { FeatureHeader } from '../components/FeatureHeader';

interface Boleto {
  id: string;
  month: string;
  year: number;
  dueDate: string;
  amount: number;
  status: 'paid' | 'pending' | 'overdue';
  type: string;
}

const mockBoletos: Boleto[] = [
  { id: '1', month: 'Dezembro', year: 2024, dueDate: '10/12/2024', amount: 450.00, status: 'paid', type: 'Condomínio' },
  { id: '2', month: 'Novembro', year: 2024, dueDate: '10/11/2024', amount: 450.00, status: 'paid', type: 'Condomínio' },
  { id: '3', month: 'Outubro', year: 2024, dueDate: '10/10/2024', amount: 450.00, status: 'paid', type: 'Condomínio' },
  { id: '4', month: 'Janeiro', year: 2025, dueDate: '10/01/2025', amount: 480.00, status: 'pending', type: 'Condomínio' },
];

export const Boletos: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'paid' | 'pending' | 'overdue'>('all');

  const filteredBoletos = mockBoletos.filter(b => 
    filter === 'all' ? true : b.status === filter
  ).sort((a, b) => b.id.localeCompare(a.id));

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
      case 'pending': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
      case 'overdue': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return <CheckCircle2 size={14} />;
      case 'pending': return <Clock size={14} />;
      case 'overdue': return <AlertCircle size={14} />;
      default: return null;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'paid': return 'Pago';
      case 'pending': return 'Pendente';
      case 'overdue': return 'Atrasado';
      default: return status;
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-6 px-4">
      <FeatureHeader 
        icon={CreditCard}
        title="Boletos (2ª via)"
        description="Acesse e gerencie seus boletos de condomínio e taxas extras."
        color="bg-blue-500"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Summary & Actions */}
        <div className="lg:col-span-1 space-y-6">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 rounded-3xl shadow-xl text-white overflow-hidden relative"
          >
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <CreditCard size={120} />
            </div>
            
            <h3 className="text-lg font-bold mb-1 opacity-90">Boleto em Aberto</h3>
            <p className="text-sm opacity-70 mb-6">Vencimento em 10 de Janeiro</p>
            
            <div className="mb-8">
              <span className="text-4xl font-black">R$ 480,00</span>
            </div>
            
            <button className="w-full bg-white text-blue-700 py-3 rounded-2xl font-bold hover:bg-blue-50 transition-all flex items-center justify-center gap-2 shadow-lg">
              <Download size={18} />
              Baixar PDF
            </button>
            <button className="w-full bg-blue-500/30 border border-white/20 mt-3 text-white py-3 rounded-2xl font-bold hover:bg-blue-400/30 transition-all flex items-center justify-center gap-2">
              <ExternalLink size={18} />
              Copiar Código
            </button>
          </motion.div>

          <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700">
            <h4 className="font-bold text-slate-900 dark:text-white mb-4">Estatísticas</h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500 font-medium">Pagos este ano</span>
                <span className="text-sm font-bold text-emerald-600">12</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500 font-medium">Total investido</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white">R$ 5.400,00</span>
              </div>
              <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 w-[92%]" />
              </div>
              <p className="text-[10px] text-slate-400 font-medium">Você manteve 92% das suas contas em dia este ano.</p>
            </div>
          </div>
        </div>

        {/* Right Column: List */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                  type="text" 
                  placeholder="Buscar boletos..."
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-700 border-none rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500 transition-all dark:text-white"
                />
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0">
                <button 
                  onClick={() => setFilter('all')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${filter === 'all' ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200'}`}
                >
                  Todos
                </button>
                <button 
                  onClick={() => setFilter('paid')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${filter === 'paid' ? 'bg-emerald-600 text-white shadow-md' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200'}`}
                >
                  Pagos
                </button>
                <button 
                  onClick={() => setFilter('pending')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${filter === 'pending' ? 'bg-amber-600 text-white shadow-md' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200'}`}
                >
                  Pendentes
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {filteredBoletos.map((boleto, index) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  key={boleto.id}
                  className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 hover:bg-white dark:hover:bg-slate-700 border border-transparent hover:border-slate-200 dark:hover:border-slate-600 rounded-2xl transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-4 mb-3 sm:mb-0">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${getStatusStyle(boleto.status)}`}>
                      {boleto.status === 'paid' ? <CheckCircle2 size={20} /> : <CreditCard size={20} />}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                        {boleto.month} {boleto.year}
                      </h4>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{boleto.type}</span>
                        <span className="text-[10px] text-slate-400">•</span>
                        <span className="text-[10px] font-medium text-slate-400">Vencimento: {boleto.dueDate}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                    <div className="text-left sm:text-right">
                      <p className="text-sm font-black text-slate-900 dark:text-white">R$ {boleto.amount.toFixed(2)}</p>
                      <div className={`mt-1 flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold w-fit sm:ml-auto ${getStatusStyle(boleto.status)}`}>
                        {getStatusIcon(boleto.status)}
                        {getStatusLabel(boleto.status)}
                      </div>
                    </div>
                    <button className="p-2.5 bg-white dark:bg-slate-800 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 border border-slate-200 dark:border-slate-700 rounded-xl transition-all">
                      <Download size={18} />
                    </button>
                  </div>
                </motion.div>
              ))}
              
              {filteredBoletos.length === 0 && (
                <div className="py-12 text-center">
                  <div className="bg-slate-100 dark:bg-slate-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                    <Search size={24} />
                  </div>
                  <h4 className="font-bold text-slate-900 dark:text-white">Nenhum boleto encontrado</h4>
                  <p className="text-sm text-slate-500 mt-1">Tente ajustar seus filtros de busca.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
