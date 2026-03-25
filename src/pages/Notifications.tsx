import React from 'react';
import { motion } from 'framer-motion';
import { 
  Bell, 
  Package, 
  Hammer, 
  ShieldCheck, 
  MessageSquare, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  Filter,
  ArrowUpRight
} from 'lucide-react';
import { cn } from '../lib/utils';

const notifications = [
  {
    id: 1,
    type: 'Encomenda',
    title: 'Encomenda Disponível',
    message: 'Uma nova encomenda da Amazon chegou para a sua unidade. Você pode retirá-la no Concierge.',
    time: 'Hoje, 14:20',
    unread: true,
    icon: Package,
    color: 'bg-blue-600',
    action: 'Ir para Concierge'
  },
  {
    id: 2,
    type: 'Manutenção',
    title: 'Manutenção Programada',
    message: 'A manutenção do elevador social da Torre A ocorrerá amanhã das 09:00 às 11:00.',
    time: 'Hoje, 10:05',
    unread: true,
    icon: Hammer,
    color: 'bg-amber-600',
    action: 'Ver Detalhes'
  },
  {
    id: 3,
    type: 'Segurança',
    title: 'Acesso Autorizado',
    message: 'Visitante (Carlos Silva) entrou no condomínio autorizado pelo seu QR Code.',
    time: 'Ontem, 19:45',
    unread: false,
    icon: ShieldCheck,
    color: 'bg-emerald-600',
    action: 'Histórico de Acessos'
  },
  {
    id: 4,
    type: 'Comunicação',
    title: 'Nova Mensagem do Síndico',
    message: 'Um novo edital para a assembleia extraordinária foi publicado no mural.',
    time: '05 Fev, 15:30',
    unread: false,
    icon: MessageSquare,
    color: 'bg-purple-600',
    action: 'Ver Edital'
  }
];

export default function Notifications() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Notifications Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-blue-600/10 dark:bg-blue-500/20 rounded-3xl flex items-center justify-center border border-blue-500/30">
            <Bell size={28} className="text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Central de Alertas</h1>
            <p className="text-slate-500 dark:text-slate-400 flex items-center gap-2 text-xs font-black uppercase tracking-widest mt-1">
              {notifications.filter(n => n.unread).length} novos alertas não lidos
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button className="p-3 bg-white dark:bg-slate-800 text-slate-400 hover:text-blue-600 rounded-2xl border border-slate-200 dark:border-slate-700 transition-all shadow-sm">
            <Filter size={20} />
          </button>
          <button className="p-3 bg-white dark:bg-slate-800 text-slate-400 hover:text-red-600 rounded-2xl border border-slate-200 dark:border-slate-700 transition-all shadow-sm">
            <Trash2 size={20} />
          </button>
          <button className="flex items-center gap-2 pl-4 pr-5 py-3 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-blue-500/20 active:scale-95 transition-all">
            <CheckCircle2 size={16} /> Tudo Lido
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {notifications.map((notif, index) => (
          <motion.div
            key={notif.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={cn(
              "group relative flex flex-col md:flex-row gap-6 p-8 bg-white dark:bg-slate-800 rounded-[40px] border transition-all hover:shadow-2xl overflow-hidden cursor-pointer",
              notif.unread 
                ? "border-blue-500/30 shadow-xl" 
                : "border-slate-100 dark:border-slate-700 opacity-80 hover:opacity-100"
            )}
          >
            {notif.unread && (
              <div className="absolute top-0 left-0 w-2 h-full bg-blue-600"></div>
            )}
            
            <div className={cn(
              "w-16 h-16 rounded-[24px] flex items-center justify-center shrink-0 shadow-lg group-hover:scale-110 transition-transform",
              notif.color,
              "text-white"
            )}>
              <notif.icon size={30} strokeWidth={2.5} />
            </div>

            <div className="flex-1 space-y-3 relative z-10">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <span className={cn(
                    "text-[10px] font-black uppercase tracking-[2px]",
                    notif.unread ? "text-blue-600 dark:text-blue-400" : "text-slate-400"
                  )}>
                    {notif.type}
                  </span>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase leading-tight tracking-tight">
                    {notif.title}
                  </h3>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-400 font-bold">
                  <Clock size={14} strokeWidth={2.5} />
                  {notif.time}
                </div>
              </div>
              
              <p className="text-slate-500 dark:text-slate-300 font-medium leading-relaxed max-w-2xl">
                {notif.message}
              </p>

              <div className="pt-4 flex items-center justify-between">
                <button className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-black uppercase text-[10px] tracking-widest group-hover:gap-4 transition-all">
                  {notif.action}
                  <ArrowUpRight size={16} />
                </button>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-2 text-slate-400 hover:text-red-500 transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
            
            {/* Background pattern */}
            <div className="absolute -bottom-10 -right-10 opacity-[0.03] text-slate-900 dark:text-white rotate-12 transition-transform group-hover:rotate-6 group-hover:scale-110">
              <notif.icon size={160} strokeWidth={4} />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Empty state or load more? */}
      <div className="flex justify-center pt-8">
        <button className="px-8 py-4 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-300 font-black uppercase text-[10px] tracking-widest rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm active:scale-95">
          Ver Notificações Antigas
        </button>
      </div>
    </div>
  );
}
