import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Search, Calendar, Clock, CheckCircle2, Shield, Trash2, Plus } from 'lucide-react';
import { FeatureHeader } from '../components/FeatureHeader';

type Visitor = {
  id: string;
  name: string;
  type: string;
  date: string;
  time: string;
  status: 'pendente' | 'autorizado' | 'finalizado';
};

const INITIAL_VISITORS: Visitor[] = [
  { id: '1', name: 'Carlos Silva', type: 'Visitante', date: 'Hoje', time: '19:00', status: 'pendente' },
  { id: '2', name: 'Ana Souza', type: 'Prestador de Serviço', date: 'Amanhã', time: '09:00', status: 'autorizado' },
  { id: '3', name: 'Marcos Paulo', type: 'Entregador', date: '12/11/2024', time: '14:30', status: 'finalizado' },
  { id: '4', name: 'Julia Costa', type: 'Visitante', date: '10/11/2024', time: '20:00', status: 'finalizado' },
];

export const Visitantes: React.FC = () => {
  const [visitors, setVisitors] = useState<Visitor[]>(INITIAL_VISITORS);
  const [filter, setFilter] = useState<'all' | 'expected' | 'historic'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const handleDelete = (id: string) => {
    setVisitors(prev => prev.filter(visitor => visitor.id !== id));
  };

  const filteredVisitors = visitors.filter(visitor => {
    const isExpected = visitor.status === 'pendente' || visitor.status === 'autorizado';
    const matchesFilter = filter === 'all' || 
                         (filter === 'expected' && isExpected) ||
                         (filter === 'historic' && visitor.status === 'finalizado');
    const matchesSearch = visitor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          visitor.type.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="max-w-6xl mx-auto py-6 px-4">
      <FeatureHeader 
        icon={User}
        title="Visitantes e Permissões"
        description="Gerencie as permissões de entrada na sua unidade, convidados e prestadores de serviço."
        color="bg-blue-600"
      />

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text"
            placeholder="Buscar por nome ou tipo..."
            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex flex-wrap gap-3">
          <div className="flex bg-white dark:bg-slate-800 p-1 rounded-2xl border border-slate-100 dark:border-slate-700">
            <button 
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${filter === 'all' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
            >
              Todos
            </button>
            <button 
              onClick={() => setFilter('expected')}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${filter === 'expected' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
            >
              Esperados
            </button>
            <button 
              onClick={() => setFilter('historic')}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${filter === 'historic' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
            >
              Histórico
            </button>
          </div>
          
          <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-2xl font-bold transition-colors shadow-lg shadow-blue-500/20">
            <Plus size={20} />
            <span className="hidden lg:inline">Nova Liberação</span>
          </button>
        </div>
      </div>

      {filteredVisitors.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredVisitors.map((visitor) => (
              <motion.div
                key={visitor.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-xl hover:shadow-blue-500/10 transition-all group relative"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-3 rounded-2xl ${
                    visitor.status === 'pendente' ? 'bg-amber-100 text-amber-600' :
                    visitor.status === 'autorizado' ? 'bg-emerald-100 text-emerald-600' :
                    'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                  }`}>
                    {visitor.status === 'finalizado' ? <CheckCircle2 size={24} /> : <User size={24} />}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      visitor.status === 'pendente' ? 'bg-amber-100 text-amber-600' :
                      visitor.status === 'autorizado' ? 'bg-emerald-100 text-emerald-600' :
                      'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                    }`}>
                      {visitor.status === 'pendente' ? 'Pendente' : 
                       visitor.status === 'autorizado' ? 'Autorizado' : 
                       'Finalizado'}
                    </div>
                    
                    <button 
                      onClick={() => handleDelete(visitor.id)}
                      className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                      title="Excluir"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-1 group-hover:text-blue-600 transition-colors">
                  {visitor.name}
                </h3>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-4">
                  {visitor.type}
                </p>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3 text-sm text-slate-500">
                    <Calendar size={16} className="text-slate-400" />
                    <span>{visitor.date}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-500">
                    <Clock size={16} className="text-slate-400" />
                    <span>{visitor.time}</span>
                  </div>
                </div>

                {visitor.status === 'pendente' && (
                  <div className="pt-4 border-t border-slate-50 dark:border-slate-700 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Aguardando na portaria</span>
                    <button className="flex items-center justify-center gap-2 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 text-blue-600 px-4 py-2 rounded-xl text-xs font-bold transition-colors">
                      Autorizar Entrada
                    </button>
                  </div>
                )}
                {visitor.status === 'autorizado' && (
                  <div className="pt-4 border-t border-slate-50 dark:border-slate-700 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Aguardando chegada</span>
                    <div className="flex items-center gap-1 text-emerald-600 text-xs font-bold">
                      <Shield size={14} />
                      <span>Pré-autorizado</span>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700">
          <div className="bg-slate-50 dark:bg-slate-900 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <User size={40} className="text-slate-300" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Nenhum visitante encontrado</h3>
          <p className="text-slate-500 max-w-md mx-auto">
            Você não possui visitantes {filter === 'expected' ? 'esperados' : filter === 'historic' ? 'no histórico' : ''} no momento.
          </p>
        </div>
      )}

      {/* Security Tip */}
      <div className="mt-12 bg-gradient-to-br from-blue-600 to-indigo-700 p-8 rounded-[40px] text-white flex flex-col md:flex-row items-center gap-8 shadow-xl shadow-blue-500/20">
        <div className="bg-white/10 p-4 rounded-3xl backdrop-blur-md shrink-0">
          <Shield size={40} />
        </div>
        <div className="text-center md:text-left">
          <h4 className="text-xl font-bold mb-2">Dica de Segurança</h4>
          <p className="opacity-80 text-sm max-w-xl">
            Sempre pré-autorize seus visitantes e prestadores de serviço pelo app. Isso agiliza o acesso na portaria e aumenta a segurança do seu condomínio.
          </p>
        </div>
        <div className="flex-1 flex justify-end">
          <button className="whitespace-nowrap bg-white text-blue-600 px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:scale-105 transition-transform">
            Ver Normas
          </button>
        </div>
      </div>
    </div>
  );
};

