import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  User, 
  Clock, 
  FileText, 
  ShieldCheck, 
  Plus, 
  Search, 
  Trash2, 
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  MoreVertical,
  ExternalLink,
  Briefcase,
  History,
  Phone
} from 'lucide-react';
import { FeatureHeader } from '../components/FeatureHeader';

type ServiceProvider = {
  id: string;
  name: string;
  category: string;
  phone: string;
  rating: number;
  documentsStatus: 'valid' | 'expired' | 'pending';
  lastVisit: string;
};

type RecurrentService = {
  id: string;
  providerId: string;
  providerName: string;
  description: string;
  frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly';
  weekday?: string;
  time: string;
  nextOccurence: string;
  status: 'active' | 'paused';
};

const INITIAL_PROVIDERS: ServiceProvider[] = [
  { id: 'p1', name: 'Pet Care Express', category: 'Pet Shop / Banho e Tosa', phone: '(11) 98765-4321', rating: 4.8, documentsStatus: 'valid', lastVisit: '05/11/2024' },
  { id: 'p2', name: 'Dr. Ricardo Manutenção', category: 'Climatização / Ar Condicionado', phone: '(11) 97777-8888', rating: 5.0, documentsStatus: 'valid', lastVisit: '10/10/2024' },
  { id: 'p3', name: 'Limpeza Total Ltda', category: 'Limpeza / Diarista', phone: '(11) 96666-5555', rating: 4.5, documentsStatus: 'pending', lastVisit: '08/11/2024' },
];

const INITIAL_SERVICES: RecurrentService[] = [
  { id: 's1', providerId: 'p1', providerName: 'Pet Care Express', description: 'Banho e Tosa - Billy (Golden)', frequency: 'biweekly', weekday: 'Quarta-feira', time: '14:00', nextOccurence: '13/11/2024', status: 'active' },
  { id: 's2', providerId: 'p3', providerName: 'Limpeza Total Ltda', description: 'Faxina Geral', frequency: 'weekly', weekday: 'Segunda-feira', time: '08:00', nextOccurence: '11/11/2024', status: 'active' },
];

export const AgendasRecorrentes: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'providers' | 'schedules' | 'calendar'>('schedules');
  const [providers, setProviders] = useState<ServiceProvider[]>(INITIAL_PROVIDERS);
  const [services, setServices] = useState<RecurrentService[]>(INITIAL_SERVICES);
  const [searchTerm, setSearchTerm] = useState('');

  const filterProviders = providers.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filterServices = services.filter(s => 
    s.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.providerName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <FeatureHeader 
        icon={Calendar}
        title="Agendas Recorrentes"
        description="Gerencie seus serviços recorrentes, prestadores de confiança e notificações automáticas."
        color="bg-indigo-600"
      />

      {/* Tabs Design */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div className="flex bg-white dark:bg-slate-800 p-1.5 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-x-auto max-w-full">
          <button 
            onClick={() => setActiveTab('schedules')}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-black transition-all whitespace-nowrap ${activeTab === 'schedules' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
          >
            <Clock size={18} />
            Agendas Ativas
          </button>
          <button 
            onClick={() => setActiveTab('providers')}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-black transition-all whitespace-nowrap ${activeTab === 'providers' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
          >
            <Briefcase size={18} />
            Prestadores
          </button>
          <button 
            onClick={() => setActiveTab('calendar')}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-black transition-all whitespace-nowrap ${activeTab === 'calendar' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
          >
            <Calendar size={18} />
            Calendário
          </button>
        </div>

        <div className="flex-1 min-w-[300px] relative transition-all focus-within:ring-2 focus-within:ring-indigo-500 rounded-2xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-black" size={20} />
          <input 
            type="text"
            placeholder={activeTab === 'providers' ? "Buscar prestador ou categoria..." : "Buscar serviço ou descrição..."}
            className="w-full pl-12 pr-4 py-3.5 bg-white dark:bg-slate-800 rounded-2xl border-none shadow-sm focus:outline-none dark:text-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3.5 rounded-2xl font-black text-sm uppercase tracking-tight transition-all shadow-xl shadow-indigo-500/20 hover:scale-[1.02] active:scale-95">
          <Plus size={20} />
          {activeTab === 'providers' ? 'Novo Prestador' : 'Nova Agenda'}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'schedules' && (
          <motion.div 
            key="schedules"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            {filterServices.map((service) => (
              <div key={service.id} className="bg-white dark:bg-slate-800 rounded-[32px] p-8 border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-2xl hover:shadow-indigo-500/10 transition-all group overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
                
                <div className="flex justify-between items-start mb-6 relative z-10">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-900/40 rounded-2xl flex items-center justify-center text-indigo-600 font-black">
                      <Clock size={28} />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-slate-800 dark:text-white leading-tight">{service.description}</h3>
                      <p className="text-slate-500 dark:text-slate-400 font-bold">{service.providerName}</p>
                    </div>
                  </div>
                  <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${service.status === 'active' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                    {service.status === 'active' ? 'Ativa' : 'Pausada'}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6 mb-8 relative z-10">
                  <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl">
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Frequência</p>
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300 capitalize">{service.frequency === 'biweekly' ? 'Quinzenal' : service.frequency === 'weekly' ? 'Semanal' : service.frequency === 'daily' ? 'Diário' : 'Mensal'}</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl">
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Próxima</p>
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{service.nextOccurence} às {service.time}</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 relative z-10">
                  <button className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all">
                    <MessageSquare size={16} />
                    WhatsApp
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all">
                    <History size={16} />
                    Histórico
                  </button>
                  <button className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {activeTab === 'providers' && (
          <motion.div 
            key="providers"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filterProviders.map((provider) => (
              <div key={provider.id} className="bg-white dark:bg-slate-800 rounded-[32px] p-6 border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-xl transition-all group">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-[24px] flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500">
                    <User size={32} />
                  </div>
                  <div className="flex gap-2">
                    <div className={`p-2 rounded-xl ${provider.documentsStatus === 'valid' ? 'bg-emerald-100 text-emerald-600' : provider.documentsStatus === 'pending' ? 'bg-amber-100 text-amber-600' : 'bg-red-100 text-red-600'}`}>
                      {provider.documentsStatus === 'valid' ? <ShieldCheck size={18} /> : <AlertCircle size={18} />}
                    </div>
                    <button className="p-2 text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl">
                      <MoreVertical size={18} />
                    </button>
                  </div>
                </div>

                <h3 className="text-lg font-black text-slate-800 dark:text-white mb-0.5">{provider.name}</h3>
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-4">{provider.category}</p>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400 font-medium">
                    <Phone size={14} className="text-slate-400" />
                    <span>{provider.phone}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400 font-medium">
                    <CheckCircle2 size={14} className="text-emerald-500" />
                    <span>Documentos: {provider.documentsStatus === 'valid' ? 'Validados' : provider.documentsStatus === 'pending' ? 'Em análise' : 'Expirados'}</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-50 dark:border-slate-700 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase">Última Visita</p>
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{provider.lastVisit}</p>
                  </div>
                  <div className="flex items-center gap-1.5 bg-amber-50 dark:bg-amber-900/30 px-3 py-1 rounded-lg">
                    <span className="text-xs font-black text-amber-600">★ {provider.rating}</span>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {activeTab === 'calendar' && (
          <motion.div 
            key="calendar"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white dark:bg-slate-800 rounded-[40px] p-8 border border-slate-100 dark:border-slate-700 shadow-sm min-h-[500px] flex flex-col"
          >
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
              <h2 className="text-2xl font-black text-slate-800 dark:text-white">Novembro 2024</h2>
              <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-900 p-1.5 rounded-2xl">
                <button className="px-4 py-2 font-black text-xs uppercase tracking-widest text-slate-500">Mês</button>
                <button className="px-4 py-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm text-indigo-600 font-black text-xs uppercase tracking-widest">Semana</button>
                <button className="px-4 py-2 font-black text-xs uppercase tracking-widest text-slate-500">Dia</button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-4 mb-4">
              {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
                <div key={day} className="text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">{day}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-4 flex-1">
              {Array.from({ length: 30 }).map((_, i) => {
                const day = i + 1;
                const hasService = services.find(s => s.nextOccurence.startsWith(day < 10 ? `0${day}` : `${day}`));
                return (
                  <div key={i} className={`min-h-[100px] p-3 rounded-2xl border ${hasService ? 'border-indigo-200 bg-indigo-50/30' : 'border-slate-100 opacity-50'} dark:border-slate-700 flex flex-col gap-2 hover:border-indigo-400 transition-colors cursor-pointer`}>
                    <span className="text-sm font-black text-slate-700 dark:text-slate-300">{day}</span>
                    {hasService && (
                      <div className="bg-indigo-600 text-white text-[9px] font-black p-1.5 rounded-lg truncate">
                        {hasService.description}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Info Banner */}
      <div className="mt-12 bg-gradient-to-r from-slate-900 to-indigo-950 p-10 rounded-[48px] text-white flex flex-col lg:flex-row items-center gap-10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-32 -mt-32" />
        <div className="bg-white/10 p-6 rounded-[32px] backdrop-blur-xl shrink-0 border border-white/10 shadow-inner">
          <ShieldCheck size={48} className="text-indigo-400" />
        </div>
        <div className="text-center lg:text-left relative z-10">
          <h4 className="text-2xl font-black mb-3">Segurança em Primeiro Lugar</h4>
          <p className="opacity-70 text-base leading-relaxed max-w-2xl font-medium">
            Todos os prestadores de serviço cadastrados nesta seção passam por uma verificação automática de antecedentes e validade de documentos. Receba alertas via WhatsApp 30 minutos antes do início previsto.
          </p>
        </div>
        <div className="flex-1 flex justify-end relative z-10 w-full lg:w-auto">
          <button className="w-full lg:w-auto flex items-center justify-center gap-3 bg-white text-indigo-900 px-10 py-5 rounded-[24px] font-black text-sm uppercase tracking-widest hover:bg-indigo-50 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-black/20">
            Exportar Relatório
            <ExternalLink size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};
