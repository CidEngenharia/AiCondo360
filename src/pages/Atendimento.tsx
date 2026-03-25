import React from 'react';
import { Headset, Star, Search, Filter, Mail, Phone, MessageSquare, AlertTriangle, Clock, CheckCircle } from 'lucide-react';
import { motion } from 'motion/react';

const AtendimentoPage: React.FC = () => {
  return (
    <div className="p-6 lg:p-10 space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Canais de Atendimento</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Gerencie chamados de condôminos, dúvidas e solicitações de serviços.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-blue-200 dark:shadow-none">
            Digitalizar Solicitação Novo Chamado
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {[
          { label: 'Tempo Médio Resposta', value: '45m', icon: Clock, color: 'bg-indigo-500' },
          { label: 'Satisfação (CSAT)', value: '4.8/5', icon: Star, color: 'bg-emerald-500' },
          { label: 'Chamados Críticos', value: '8', icon: AlertTriangle, color: 'bg-rose-500' },
          { label: 'Resolvidos (Mes)', value: '142', icon: CheckCircle, color: 'bg-blue-500' },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm"
          >
            <div className="flex items-center gap-4">
               <div className={`${stat.color} p-3 rounded-xl text-white shadow-lg`}>
                  <stat.icon size={22} />
               </div>
               <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">{stat.value}</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-tight">{stat.label}</p>
               </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-slate-700 font-bold text-slate-900 dark:text-white flex items-center gap-3">
               <MessageSquare size={20} className="text-blue-500" />
               Solicitações Recentes
            </div>
            <div className="divide-y divide-slate-50 dark:divide-slate-700">
               {[
                 { user: 'Ricardo Santos', text: 'Problema com barulho no 3º andar...', date: 'há 10min', type: 'Reclamação', status: 'Novo' },
                 { user: 'Marcela Lima', text: 'Dúvida sobre boleto vencido...', date: 'há 25min', type: 'Dúvida', status: 'Em aberto' },
                 { user: 'Paulo André', text: 'Solicitação de reserva do salão...', date: 'há 1h', type: 'Reserva', status: 'Pendente' },
                 { user: 'Fernanda Rocha', text: 'Reclamação vazamento garagem...', date: 'há 3h', type: 'Manutenção', status: 'Crítico' },
               ].map((item, i) => (
                 <div key={i} className="p-6 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all cursor-pointer group flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-sm font-bold text-slate-500 uppercase">{item.user[0]}</div>
                    <div className="flex-1">
                       <div className="flex items-center justify-between mb-1">
                          <h4 className="font-bold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400">{item.user}</h4>
                          <span className="text-[10px] text-slate-400 uppercase font-bold">{item.date}</span>
                       </div>
                       <p className="text-sm text-slate-500 line-clamp-1">{item.text}</p>
                       <div className="flex items-center gap-2 mt-2">
                          <span className="px-2 py-0.5 rounded-lg bg-slate-50 dark:bg-slate-900 text-[10px] font-bold text-slate-400 uppercase border border-slate-100 dark:border-slate-700">{item.type}</span>
                          <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase ${item.status === 'Crítico' ? 'bg-rose-100 text-rose-600' : 'bg-blue-100 text-blue-600'}`}>{item.status}</span>
                       </div>
                    </div>
                 </div>
               ))}
            </div>
         </div>

         <div className="space-y-6">
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-6 overflow-hidden">
               <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Contatos Rápidos</h2>
               <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: 'E-mail Administradora', icon: Mail, value: 'contato@admin.com.br' },
                    { label: 'Telefone Portaria', icon: Phone, value: '(11) 98888-7777' },
                    { label: 'Whatsapp Síndico', icon: MessageSquare, value: 'Abrir conversa' },
                    { label: 'Site Oficial', icon: Headset, value: 'condo360.com.br' },
                  ].map((contact, i) => (
                    <button key={i} className="flex flex-col items-center gap-2 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all border-dashed group">
                       <contact.icon size={20} className="text-slate-400 group-hover:text-blue-500" />
                       <span className="text-[10px] font-bold text-slate-400 text-center uppercase leading-none mt-1">{contact.label}</span>
                       <span className="text-xs font-bold text-slate-700 dark:text-slate-200 mt-0.5">{contact.value}</span>
                    </button>
                  ))}
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default AtendimentoPage;
