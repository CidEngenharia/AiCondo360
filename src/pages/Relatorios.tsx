import React from 'react';
import { FileText, Download, Filter, Calendar, TrendingUp, PieChart, BarChart2, Briefcase, Printer, Share2, Search, ArrowRight, Table, List, Layout, Grid, Shield } from 'lucide-react';
import { motion } from 'motion/react';

const RelatoriosPage: React.FC = () => {
  return (
    <div className="p-6 lg:p-10 space-y-10">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Centro de Relatórios</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Informação estratégica para tomada de decisão e transparência condominial.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button className="flex items-center gap-2 px-5 py-3 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-2xl text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm">
             <Filter size={18} />
             Filtros Avançados
          </button>
          <button className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-sm font-bold transition-all shadow-xl shadow-blue-200 dark:shadow-none hover:scale-105 active:scale-95 group">
             <Layout size={18} className="transition-transform group-hover:rotate-12" />
             Novo Relatório Customizado
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: 'Formatos Exportáveis', value: 'PDF, CSV, XLS', icon: FileText, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
          { title: 'Taxa de Consumo', value: '1.2k views/mês', icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
          { title: 'Relatórios Gerados', value: '458 total', icon: BarChart2, color: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
          { title: 'Atualização Automática', value: 'A cada 15min', icon: Calendar, color: 'text-rose-500', bg: 'bg-rose-50 dark:bg-rose-900/20' },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="group bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-xl hover:shadow-slate-100 dark:hover:shadow-none transition-all cursor-pointer"
          >
            <div className={`${stat.bg} ${stat.color} w-12 h-12 rounded-2xl flex items-center justify-center mb-5 transition-transform group-hover:scale-110 group-hover:rotate-6`}>
              <stat.icon size={24} />
            </div>
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest leading-none mb-2">{stat.title}</h3>
            <p className="text-xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="space-y-6">
         <div className="flex items-center justify-between px-2">
            <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-3">
               <Grid size={22} className="text-blue-500" />
               Documentos Estratégicos
            </h2>
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
               <button className="p-2 bg-white dark:bg-slate-700 text-blue-500 rounded-lg shadow-sm">
                  <Layout size={16} />
               </button>
               <button className="p-2 text-slate-400 dark:hover:text-slate-200 transition-all">
                  <List size={16} />
               </button>
            </div>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {[
              { type: 'Financeiro', title: 'Relatório Mensal consolidado', date: 'Julho de 2023', icon: TrendingUp, color: 'bg-blue-600', description: 'Visão completa de receitas, despesas e inadimplência do mês vigente.' },
              { type: 'Manutenção', title: 'Cronograma de preventivas', icon: Briefcase, color: 'bg-emerald-600', date: 'Q3 - 2023', description: 'Lista detalhada de manutenções programadas para o próximo trimestre.' },
              { type: 'Inadimplência', title: 'Análise de devedores ativos', icon: PieChart, color: 'bg-rose-600', date: '30/08/2023', description: 'Métricas detalhadas sobre o fluxo de cobrança e histórico de acordos.' },
              { type: 'Ocupação', title: 'Gestão de Áreas Comuns', icon: Layout, color: 'bg-indigo-600', date: 'Semana 34', description: 'Dados sobre reservas do salão, quadras e churrasqueiras.' },
              { type: 'Jurídico', title: 'Andamento de Ações Ativas', icon: Shield, color: 'bg-slate-600', date: 'Agosto 2023', description: 'Resumo executivo de processos judiciais em nome do condomínio.' },
              { type: 'Consumo', title: 'Eficiência Energética e Água', icon: TrendingUp, color: 'bg-amber-600', date: 'Mensal', description: 'Comparativo de consumo entre blocos e sugestões de otimização.' },
            ].map((report, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -5 }}
                className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col group hover:border-blue-200 dark:hover:border-blue-900/30 transition-all"
              >
                <div className="p-8 flex-1">
                   <div className="flex items-center justify-between mb-6">
                      <span className={`px-4 py-1 rounded-full text-[10px] font-black text-white uppercase tracking-wider ${report.color}`}>
                         {report.type}
                      </span>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{report.date}</span>
                   </div>
                   <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-all">{report.title}</h3>
                   <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">{report.description}</p>
                </div>
                <div className="p-6 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
                   <div className="flex items-center gap-3">
                      <button className="p-2.5 rounded-xl bg-white dark:bg-slate-800 text-slate-500 hover:text-blue-500 transition-all shadow-sm">
                         <Printer size={16} />
                      </button>
                      <button className="p-2.5 rounded-xl bg-white dark:bg-slate-800 text-slate-500 hover:text-blue-500 transition-all shadow-sm">
                         <Share2 size={16} />
                      </button>
                   </div>
                   <button className="flex items-center gap-2 text-sm font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest hover:gap-3 transition-all">
                      Abrir PDF
                      <ArrowRight size={16} />
                   </button>
                </div>
              </motion.div>
            ))}
         </div>
      </div>
    </div>
  );
};

export default RelatoriosPage;
