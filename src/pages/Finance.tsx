import React from 'react';
import { motion } from 'framer-motion';
import { 
  CreditCard, 
  Download, 
  FileText, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  Calendar
} from 'lucide-react';
import { cn } from '../lib/utils';

const invoices = [
  {
    id: 'INV-2024-001',
    month: 'Março 2024',
    dueDate: '10/03/2024',
    amount: 'R$ 850,00',
    status: 'pending',
    type: 'Condomínio'
  },
  {
    id: 'INV-2024-002',
    month: 'Fevereiro 2024',
    dueDate: '10/02/2024',
    amount: 'R$ 850,00',
    status: 'paid',
    type: 'Condomínio'
  },
  {
    id: 'INV-2024-003',
    month: 'Janeiro 2024',
    dueDate: '10/01/2024',
    amount: 'R$ 850,00',
    status: 'paid',
    type: 'Condomínio'
  }
];

const transactions = [
  { id: 1, title: 'Fundo de Reserva', amount: 'R$ 85,00', date: '10 Fev', type: 'expense', category: 'Taxa' },
  { id: 2, title: 'Manutenção Elevador', amount: 'R$ 120,00', date: '05 Fev', type: 'expense', category: 'Extra' },
  { id: 3, title: 'Pagamento Unidade 402', amount: 'R$ 850,00', date: '10 Jan', type: 'income', category: 'Condomínio' },
];

export default function Finance() {
  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Financeiro</h1>
        <p className="text-slate-500 dark:text-slate-400">Gerencie seus boletos, taxas e histórico de pagamentos.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl">
              <CreditCard size={24} />
            </div>
            <span className="flex items-center gap-1 text-xs font-medium text-emerald-500 bg-emerald-100 dark:bg-emerald-900/30 px-2 py-1 rounded-full">
              <TrendingUp size={12} /> +2.5%
            </span>
          </div>
          <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium">Saldo Atual</h3>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">R$ 1.250,40</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-2xl">
              <ArrowUpRight size={24} />
            </div>
          </div>
          <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium">Próximo Vencimento</h3>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">10 Mar 2024</p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">R$ 850,00</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-2xl">
              <ArrowDownRight size={24} />
            </div>
          </div>
          <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium">Total Pago (Ano)</h3>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">R$ 2.550,00</p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">3 mensalidades</p>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Active Invoice */}
        <section className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Boleto Atual</h2>
            <button className="text-sm text-blue-600 dark:text-blue-400 font-medium hover:underline">Ver todos</button>
          </div>
          
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-8 text-white shadow-xl shadow-blue-500/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-12 bg-white/10 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2"></div>
            
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-blue-100/80">
                  <Calendar size={18} />
                  <span className="text-sm font-medium uppercase tracking-wider text-blue-100">Vencimento em 10 dias</span>
                </div>
                <div>
                  <h3 className="text-4xl font-black">R$ 850,00</h3>
                  <p className="text-blue-100 mt-1 font-medium">Referente ao mês de Março/2024</p>
                </div>
              </div>
              
              <div className="flex flex-col gap-3 w-full md:w-auto">
                <button className="bg-white text-blue-600 px-6 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-blue-50 transition-colors shadow-lg shadow-black/10">
                  Pagar Agora
                </button>
                <button className="bg-blue-500/30 backdrop-blur-md text-white border border-white/20 px-6 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-blue-500/40 transition-colors">
                  <Download size={18} /> Baixar PDF
                </button>
              </div>
            </div>
            
            <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between text-sm text-blue-100/80">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                  <CheckCircle2 size={20} className="text-emerald-400" />
                </div>
                <div>
                  <p className="font-semibold text-white">Linha Digitável disponível</p>
                  <p>Copie e cole no seu banco</p>
                </div>
              </div>
              <button className="hover:text-white transition-colors">Copiar código</button>
            </div>
          </div>
        </section>

        {/* Recent History */}
        <section className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Últimas Faturas</h2>
            <button className="text-sm text-blue-600 dark:text-blue-400 font-medium hover:underline">Ver histórico</button>
          </div>
          
          <div className="space-y-3">
            {invoices.map((invoice, index) => (
              <motion.div
                key={invoice.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-between group hover:border-blue-300 dark:hover:border-blue-700 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center",
                    invoice.status === 'paid' 
                      ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"
                      : "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400"
                  )}>
                    {invoice.status === 'paid' ? <CheckCircle2 size={24} /> : <Clock size={24} />}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white">{invoice.month}</h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Vencimento: {invoice.dueDate}</p>
                  </div>
                </div>
                <div className="text-right flex items-center gap-4">
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">{invoice.amount}</p>
                    <p className={cn(
                      "text-xs font-bold uppercase tracking-wider",
                      invoice.status === 'paid' ? "text-emerald-500" : "text-amber-500"
                    )}>
                      {invoice.status === 'paid' ? 'Pago' : 'Pendente'}
                    </p>
                  </div>
                  <button className="p-2 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    <Download size={20} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      </div>

      {/* Transparency */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Transparência</h2>
            <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[10px] font-bold uppercase rounded">Beta</span>
          </div>
          <button className="text-sm text-blue-600 dark:text-blue-400 font-medium hover:underline">Prestação de Contas</button>
        </div>

        <div className="bg-slate-50 dark:bg-slate-900/50 rounded-3xl p-6 border border-slate-200 dark:border-slate-800">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-1 space-y-4">
              <div className="flex items-center gap-2 text-slate-900 dark:text-white">
                <FileText size={20} className="text-blue-600 dark:text-blue-400" />
                <h3 className="font-bold text-lg">Resumo de Gastos do Mês</h3>
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                Acompanhe em tempo real como o valor da sua taxa condominial está sendo investido na manutenção e melhoria do nosso prédio.
              </p>
              <div className="space-y-3">
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-slate-400">
                    <span>Manutenção</span>
                    <span>45%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 w-[45%]"></div>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-slate-400">
                    <span>Pessoal</span>
                    <span>30%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 w-[30%]"></div>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-slate-400">
                    <span>Reserva</span>
                    <span>25%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 w-[25%]"></div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex-1 space-y-4">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider border-b border-slate-200 dark:border-slate-800 pb-2">Investimentos</h4>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex flex-shrink-0 items-center justify-center">
                    <TrendingUp size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">Fundo de Melhorias</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Pintura da fachada prevista para Maio/2024</p>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-xs font-bold text-emerald-500 bg-emerald-100 dark:bg-emerald-900/30 px-2 py-0.5 rounded">R$ 45.300 acumulados</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex flex-shrink-0 items-center justify-center">
                    <AlertCircle size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">Troca de Iluminação LED</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Economia estimada de 15% na conta de luz comum</p>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 text-[10px] font-bold rounded">Em Aprovação</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
