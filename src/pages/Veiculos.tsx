import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Car, Plus, Key, CreditCard, Clock, 
  Trash2, Edit3, CheckCircle2, AlertTriangle, FileText, Search
} from 'lucide-react';
import { FeatureHeader } from '../components/FeatureHeader';

interface Vehicle {
  id: string;
  type: 'Car' | 'Motorcycle' | 'Other';
  brand: string;
  model: string;
  plate: string;
  color: string;
  status: 'Ativo' | 'Inativo';
  parkingSpot?: string;
}

const MOCK_VEHICLES: Vehicle[] = [
  { 
    id: '1', 
    type: 'Car',
    brand: 'Toyota',
    model: 'Corolla', 
    plate: 'ABC-1234', 
    color: 'Prata',
    status: 'Ativo',
    parkingSpot: 'A-12'
  },
  { 
    id: '2', 
    type: 'Motorcycle',
    brand: 'Honda',
    model: 'CG 160', 
    plate: 'XYZ-9876', 
    color: 'Vermelha',
    status: 'Ativo',
    parkingSpot: 'M-05'
  }
];

export const Veiculos: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'ativos' | 'inativos'>('ativos');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredVehicles = MOCK_VEHICLES.filter(v => {
    const matchesTab = activeTab === 'ativos' ? v.status === 'Ativo' : v.status === 'Inativo';
    const query = searchQuery.toLowerCase();
    const matchesSearch = v.model.toLowerCase().includes(query) || 
                          v.brand.toLowerCase().includes(query) ||
                          v.plate.toLowerCase().includes(query);
    return matchesTab && matchesSearch;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 pt-6 w-full max-w-7xl mx-auto space-y-8">
      <FeatureHeader 
        icon={Car}
        title="Meus Veículos"
        description="Gerencie os veículos da sua unidade, vagas de garagem e controle de acesso."
        color="bg-sky-600"
      >
        <button className="flex items-center justify-center gap-2 bg-sky-600 hover:bg-sky-500 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-sky-600/20 active:scale-[0.98]">
          <Plus size={20} />
          <span>Novo Veículo</span>
        </button>
      </FeatureHeader>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700/50 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total de Veículos</p>
            <h3 className="text-3xl font-black text-slate-800 dark:text-white mt-1">
              {MOCK_VEHICLES.filter(v => v.status === 'Ativo').length}
            </h3>
          </div>
          <div className="w-12 h-12 bg-sky-50 dark:bg-sky-900/30 rounded-2xl flex items-center justify-center text-sky-600 dark:text-sky-400">
            <Car size={24} />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700/50 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Vagas Utilizadas</p>
            <h3 className="text-3xl font-black text-slate-800 dark:text-white mt-1">
              {MOCK_VEHICLES.filter(v => v.parkingSpot).length}
            </h3>
          </div>
          <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 size={24} />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700/50 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Pendências</p>
            <h3 className="text-3xl font-black text-slate-800 dark:text-white mt-1">
              0
            </h3>
          </div>
          <div className="w-12 h-12 bg-rose-50 dark:bg-rose-900/30 rounded-2xl flex items-center justify-center text-rose-600 dark:text-rose-400">
            <AlertTriangle size={24} />
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex bg-slate-100 dark:bg-slate-800/50 p-1.5 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 w-full sm:w-auto overflow-x-auto hide-scrollbar">
          <button 
            onClick={() => setActiveTab('ativos')}
            className={`flex-1 sm:flex-none px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
              activeTab === 'ativos' 
                ? 'bg-white dark:bg-slate-700 text-sky-600 dark:text-sky-400 shadow-sm' 
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            Veículos Ativos
          </button>
          <button 
            onClick={() => setActiveTab('inativos')}
            className={`flex-1 sm:flex-none px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
              activeTab === 'inativos' 
                ? 'bg-white dark:bg-slate-700 text-sky-600 dark:text-sky-400 shadow-sm' 
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            Histórico
          </button>
        </div>

        <div className="flex w-full sm:w-auto gap-3">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar veículo..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/50 text-slate-700 dark:text-slate-300 transition-all font-medium"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredVehicles.length > 0 ? (
            filteredVehicles.map((vehicle, index) => (
              <motion.div 
                key={vehicle.id} 
                layout
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="group bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/60 dark:border-slate-700/60 overflow-hidden shadow-sm hover:shadow-xl hover:shadow-sky-500/10 hover:border-sky-200 dark:hover:border-sky-800 transition-all duration-500 relative flex flex-col h-full"
              >
                {/* Decorational Background */}
                <div className="absolute right-0 top-0 w-32 h-32 bg-gradient-to-br from-sky-500/10 to-transparent dark:from-sky-400/5 dark:to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                
                <div className="p-6 relative z-10">
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-14 h-14 bg-sky-50 dark:bg-sky-900/30 rounded-2xl flex items-center justify-center text-sky-600 dark:text-sky-400 shrink-0">
                      <Car size={28} />
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold rounded-lg font-mono tracking-widest border border-slate-200 dark:border-slate-600">
                        {vehicle.plate}
                      </span>
                    </div>
                  </div>

                  <div className="mb-6 flex-grow">
                    <h3 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">{vehicle.model}</h3>
                    <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">{vehicle.brand} • {vehicle.color}</p>
                  </div>
                  
                  <div className="bg-slate-50 dark:bg-slate-800/80 rounded-2xl p-4 border border-slate-100 dark:border-slate-700/50 mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white dark:bg-slate-700 rounded-xl shadow-sm border border-slate-100 dark:border-slate-600 flex items-center justify-center text-slate-400">
                        <Key size={18} />
                      </div>
                      <div>
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block mb-0.5">Vaga</span>
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                          {vehicle.parkingSpot || 'Sem vaga vinculada'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-4 border-t border-slate-100 dark:border-slate-700/50 mt-auto">
                    <button className="flex-1 flex justify-center items-center gap-2 bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400 px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-sky-100 dark:hover:bg-sky-500/20 transition-colors">
                      <CreditCard size={18} />
                      <span className="hidden sm:inline">TAG Acesso</span>
                      <span className="sm:hidden">TAG</span>
                    </button>
                    <button className="p-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50 rounded-xl transition-colors">
                      <Edit3 size={18} />
                    </button>
                    <button className="p-2.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="col-span-full py-20 bg-white/50 dark:bg-slate-800/30 rounded-[3rem] border border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center text-center px-4"
            >
              <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6 shadow-inner">
                <Car size={40} className="text-slate-300 dark:text-slate-600" />
              </div>
              <h3 className="text-2xl font-black text-slate-800 dark:text-white mb-3">
                Nenhum veículo {activeTab === 'ativos' ? 'ativo' : 'inativo'}
              </h3>
              <p className="text-slate-500 max-w-md mx-auto mb-8 font-medium">
                Mantenha os dados dos seus veículos atualizados para facilitar o controle de acesso e uso das vagas de garagem.
              </p>
              {activeTab === 'ativos' && (
                <button className="flex items-center justify-center gap-2 bg-sky-600 text-white px-8 py-4 rounded-2xl font-bold transition-all shadow-lg hover:shadow-sky-600/30 hover:-translate-y-1">
                  <Plus size={20} />
                  Cadastrar Primeiro Veículo
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Informação sobre regras */}
      <div className="bg-gradient-to-br from-sky-50 to-indigo-50 dark:from-sky-900/10 dark:to-indigo-900/10 p-6 md:p-8 rounded-[2rem] border border-sky-100 dark:border-sky-800/30 flex flex-col md:flex-row items-center gap-6">
        <div className="w-16 h-16 bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-sky-100 dark:border-slate-700 shrink-0 flex items-center justify-center text-sky-600 dark:text-sky-400">
          <FileText size={32} />
        </div>
        <div>
          <h4 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Uso da Garagem</h4>
          <p className="text-slate-600 dark:text-slate-400 font-medium">
            Estacione seu veículo apenas na vaga delimitada para sua unidade. O uso do TAG de acesso é pessoal e intransferível. Evite buzinar e respeite o limite de velocidade.
          </p>
        </div>
        <button className="mt-4 md:mt-0 md:ml-auto whitespace-nowrap bg-white dark:bg-slate-800 text-sky-600 dark:text-sky-400 px-6 py-3 rounded-xl font-bold border border-sky-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-all">
          Ver Mapa de Vagas
        </button>
      </div>
    </div>
  );
};
