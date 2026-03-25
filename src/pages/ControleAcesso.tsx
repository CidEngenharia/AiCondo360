import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, 
  UserCheck, 
  History, 
  QrCode, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  X, 
  Search, 
  Filter, 
  User, 
  Smartphone, 
  ShieldAlert, 
  Video, 
  MoreHorizontal,
  Plus
} from 'lucide-react';
import { FeatureHeader } from '../components/FeatureHeader';

type AccessRecord = {
  id: string;
  name: string;
  type: 'visitante' | 'prestador' | 'delivery';
  status: 'dentro' | 'fora' | 'pendente';
  entryTime?: string;
  exitTime?: string;
  photoUrl?: string;
  idNumber: string;
};

const INITIAL_DOCS: AccessRecord[] = [
  { id: '1', name: 'Juliana Fernandes', type: 'visitante', status: 'dentro', entryTime: '14:20', idNumber: '45.XXX.XXX-X' },
  { id: '2', name: 'Marcelo Delivery', type: 'delivery', status: 'fora', entryTime: '12:05', exitTime: '12:12', idNumber: '33.XXX.XXX-X' },
  { id: '3', name: 'Antônio da Silva', type: 'prestador', status: 'pendente', idNumber: '12.XXX.XXX-X' },
  { id: '4', name: 'Carla Souza', type: 'visitante', status: 'dentro', entryTime: '10:00', idNumber: '29.XXX.XXX-X' },
];

export const ControleAcesso: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'realtime' | 'history' | 'invites'>('realtime');
  const [records, setRecords] = useState<AccessRecord[]>(INITIAL_DOCS);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredRecords = records.filter(r => r.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <FeatureHeader 
        icon={ShieldCheck}
        title="Controle de Acesso"
        description="Segurança total para sua unidade. Gerencie convites, visualize acessos em tempo real e mantenha o histórico digital."
        color="bg-emerald-600"
      />

      {/* Access Control Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <div className="bg-emerald-50 dark:bg-emerald-950/30 p-8 rounded-[40px] border border-emerald-100 dark:border-emerald-800 flex flex-col items-center text-center shadow-sm">
          <div className="w-16 h-16 bg-white dark:bg-emerald-900 rounded-[28px] flex items-center justify-center text-emerald-600 shadow-xl shadow-emerald-500/10 mb-6">
            <UserCheck size={32} />
          </div>
          <h4 className="text-3xl font-black text-emerald-700 dark:text-emerald-400 mb-1">02</h4>
          <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600/60">Pessoas na Unidade</p>
        </div>

        <div className="bg-slate-50 dark:bg-slate-900/50 p-8 rounded-[40px] border border-slate-100 dark:border-slate-800 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-[28px] flex items-center justify-center text-slate-400 mb-6 shadow-sm border border-slate-100 dark:border-slate-700">
            <Smartphone size={32} />
          </div>
          <h4 className="text-3xl font-black text-slate-700 dark:text-slate-300 mb-1">15</h4>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">QR Codes Gerados</p>
        </div>

        <div className="bg-slate-50 dark:bg-slate-900/50 p-8 rounded-[40px] border border-slate-100 dark:border-slate-800 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-[28px] flex items-center justify-center text-slate-400 mb-6 shadow-sm border border-slate-100 dark:border-slate-700">
            <Clock size={32} />
          </div>
          <h4 className="text-3xl font-black text-slate-700 dark:text-slate-300 mb-1">28</h4>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Acessos no Mês</p>
        </div>

        <div className="bg-indigo-50 dark:bg-indigo-950/30 p-8 rounded-[40px] border border-indigo-100 dark:border-indigo-800 flex flex-col items-center text-center cursor-pointer hover:scale-[1.02] transition-transform shadow-xl shadow-indigo-500/5 active:scale-95 group">
          <div className="w-16 h-16 bg-white dark:bg-indigo-900 rounded-[28px] flex items-center justify-center text-indigo-600 shadow-xl shadow-indigo-500/10 mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
            <Plus size={32} />
          </div>
          <h4 className="text-lg font-black text-indigo-700 dark:text-indigo-400 mb-1 leading-none uppercase tracking-tighter">Convidar</h4>
          <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-600/60">Novo Convidado</p>
        </div>
      </div>

      {/* Main Content Areas */}
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Mini - Actions */}
        <div className="w-full lg:w-72 space-y-4">
          <button 
            onClick={() => setActiveTab('realtime')}
            className={`w-full flex items-center gap-4 px-6 py-5 rounded-[28px] text-sm font-black transition-all ${activeTab === 'realtime' ? 'bg-slate-900 text-white shadow-2xl' : 'bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-500 hover:bg-slate-50'}`}
          >
            <Smartphone size={20} />
            Monitoramento
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={`w-full flex items-center gap-4 px-6 py-5 rounded-[28px] text-sm font-black transition-all ${activeTab === 'history' ? 'bg-slate-900 text-white shadow-2xl' : 'bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-500 hover:bg-slate-50'}`}
          >
            <History size={20} />
            Histórico Digital
          </button>
          <button 
            onClick={() => setActiveTab('invites')}
            className={`w-full flex items-center gap-4 px-6 py-5 rounded-[28px] text-sm font-black transition-all ${activeTab === 'invites' ? 'bg-slate-900 text-white shadow-2xl' : 'bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-500 hover:bg-slate-50'}`}
          >
            <QrCode size={20} />
            Gerenciar Convites
          </button>
          
          <div className="pt-6 relative group overflow-hidden bg-slate-100 dark:bg-slate-900 rounded-[32px] p-8 border border-slate-200 dark:border-slate-800 text-center">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -mr-16 -mt-16 animate-pulse" />
            <Smartphone size={40} className="mx-auto text-indigo-500 mb-6 drop-shadow-lg" />
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest leading-tight mb-4">Seu Smartphone é sua Chave</p>
            <p className="text-[10px] font-bold text-slate-500 italic leading-relaxed">Pressione o botão de pânico no app em caso de emergência.</p>
          </div>
        </div>

        {/* Dynamic Display Panel */}
        <div className="flex-1 bg-white dark:bg-slate-800 rounded-[40px] p-8 border border-slate-100 dark:border-slate-700 shadow-sm min-h-[600px] flex flex-col">
          <div className="flex flex-col sm:flex-row justify-between items-center pb-8 border-b border-slate-50 dark:border-slate-700 gap-4 mb-8">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
              <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tighter">Status Atual</h3>
            </div>
            <div className="relative w-full sm:w-auto">
              <input 
                type="text"
                placeholder="Pesquisar registros..."
                className="w-full sm:w-64 pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-emerald-500 transition-all outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div 
              key={activeTab}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="flex-1"
            >
              <div className="space-y-4">
                {filteredRecords.map((record) => (
                  <div 
                    key={record.id} 
                    className="flex flex-col sm:flex-row items-center justify-between p-6 bg-slate-50/50 dark:bg-slate-900/30 rounded-3xl border border-slate-100 dark:border-slate-800 hover:bg-white dark:hover:bg-slate-900 hover:shadow-xl hover:shadow-emerald-500/5 transition-all group border-l-4"
                    style={{ borderLeftColor: record.status === 'dentro' ? '#10b981' : record.status === 'pendente' ? '#f59e0b' : '#94a3b8' }}
                  >
                    <div className="flex items-center gap-6 w-full sm:w-auto mb-4 sm:mb-0">
                      <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-[22px] shadow-sm border border-slate-100 dark:border-slate-700 font-black overflow-hidden flex items-center justify-center text-slate-300 relative">
                        <User size={32} className="group-hover:scale-110 transition-transform duration-500" />
                        {record.status === 'dentro' && (
                          <div className="absolute top-1 right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-800" />
                        )}
                      </div>
                      <div>
                        <p className="text-lg font-black text-slate-800 dark:text-white mb-0.5">{record.name}</p>
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{record.type}</span>
                          <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{record.idNumber}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-12 text-center w-full sm:w-auto justify-between sm:justify-end">
                      <div className="hidden md:block">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 leading-none">Status</p>
                        <p className={`text-xs font-black uppercase tracking-tighter ${record.status === 'dentro' ? 'text-emerald-500' : record.status === 'pendente' ? 'text-amber-500' : 'text-slate-400'}`}>
                          {record.status === 'dentro' ? 'No Local' : record.status === 'pendente' ? 'Pendente' : 'Finalizado'}
                        </p>
                      </div>
                      
                      <div className="hidden sm:block">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 leading-none">Entrada / Saída</p>
                        <p className="text-xs font-bold text-slate-700 dark:text-slate-300 font-mono">
                          {record.entryTime || '--:--'} {record.exitTime ? `➜ ${record.exitTime}` : ''}
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <button className="p-3 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-xl transition-all">
                          <Video size={18} />
                        </button>
                        <button className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all">
                          <MoreHorizontal size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {filteredRecords.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-20 opacity-50">
                    <Smartphone size={64} className="text-slate-200 mb-6" />
                    <p className="text-xl font-bold text-slate-400">Nenhum registro encontrado</p>
                  </div>
                )}
              </div>
            </motion.div>
          </AnimatePresence>

          <button className="mt-8 w-full p-4 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-3xl text-sm font-black text-slate-400 hover:border-indigo-500 hover:text-indigo-500 transition-all uppercase tracking-widest flex items-center justify-center gap-2">
            <History size={18} />
            Ver Relatório Completo do Dia
          </button>
        </div>
      </div>

      {/* Footer / Alerts Section */}
      <div className="mt-12 flex flex-col md:flex-row gap-6">
        <div className="flex-1 bg-gradient-to-br from-red-600 to-rose-700 p-10 rounded-[48px] text-white flex items-center gap-8 shadow-2xl relative overflow-hidden group">
          <div className="absolute bottom-0 right-0 w-48 h-48 bg-white/10 rounded-full -mr-24 -mb-24 group-hover:scale-125 transition-transform duration-700" />
          <div className="bg-white/10 p-5 rounded-[28px] shrink-0 border border-white/20">
            <ShieldAlert size={40} className="text-rose-100" />
          </div>
          <div>
            <h4 className="text-2xl font-black uppercase tracking-tighter mb-2 italic">Acesso Restrito?</h4>
            <p className="opacity-80 text-sm leading-relaxed font-bold">
              Caso identifique uma entrada não autorizada, bloqueie o QR Code imediatamente pelo app móvel. 
            </p>
          </div>
        </div>

        <div className="flex-1 bg-slate-900 p-10 rounded-[48px] text-white flex items-center gap-8 shadow-2xl relative overflow-hidden group border border-slate-800">
           <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -mr-24 -mt-24 group-hover:scale-110 transition-transform duration-700" />
           <div className="bg-white/5 p-5 rounded-[28px] shrink-0 border border-white/10">
            <Video size={40} className="text-indigo-400" />
          </div>
          <div>
            <h4 className="text-2xl font-black uppercase tracking-tighter mb-2 italic">Câmeras</h4>
            <p className="opacity-80 text-sm leading-relaxed font-bold">
              Visualize a foto capturada no totem de entrada e o log de vídeo sincronizado em um clique.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
