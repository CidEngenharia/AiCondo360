import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PawPrint, Plus, Dog, Cat, Bone, Syringe, 
  Trash2, Edit3, Camera, FileText, Rabbit,
  AlertTriangle, CheckCircle2, ChevronRight
} from 'lucide-react';
import { FeatureHeader } from '../components/FeatureHeader';

interface Pet {
  id: string;
  name: string;
  species: 'Dog' | 'Cat' | 'Other';
  breed: string;
  weight: string;
  color: string;
  photo: string;
  isVaccinated: boolean;
  lastVaccine?: string;
  status: 'Ativo' | 'Inativo';
}

const MOCK_PETS: Pet[] = [
  { 
    id: '1', 
    name: 'Thor', 
    species: 'Dog', 
    breed: 'Golden Retriever', 
    weight: '30kg', 
    color: 'Caramelo', 
    photo: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&h=400&fit=crop',
    isVaccinated: true,
    lastVaccine: '15/10/2023',
    status: 'Ativo'
  },
  { 
    id: '2', 
    name: 'Luna', 
    species: 'Cat', 
    breed: 'Siamês', 
    weight: '4kg', 
    color: 'Bege/Marrom', 
    photo: 'https://images.unsplash.com/photo-1513360371669-4adf3dd7dff8?w=400&h=400&fit=crop',
    isVaccinated: false,
    status: 'Ativo'
  }
];

export const Animais: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'ativos' | 'inativos'>('ativos');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPets = MOCK_PETS.filter(pet => {
    const matchStatus = activeTab === 'ativos' ? pet.status === 'Ativo' : pet.status === 'Inativo';
    const matchSearch = pet.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        pet.breed.toLowerCase().includes(searchQuery.toLowerCase());
    return matchStatus && matchSearch;
  });

  const getSpeciesIcon = (species: string) => {
    switch (species) {
      case 'Dog': return <Dog size={24} className="text-amber-500" />;
      case 'Cat': return <Cat size={24} className="text-indigo-500" />;
      default: return <Rabbit size={24} className="text-slate-500" />;
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 pt-6 w-full max-w-7xl mx-auto space-y-8">
      <FeatureHeader 
        icon={PawPrint}
        title="Meus Pets"
        description="Gerencie os animais de estimação da sua unidade, carteiras de vacinação e controle de acesso."
        color="bg-indigo-600"
      />

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700/50 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total de Pets</p>
            <h3 className="text-3xl font-black text-slate-800 dark:text-white mt-1">
              {MOCK_PETS.filter(p => p.status === 'Ativo').length}
            </h3>
          </div>
          <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <Bone size={24} />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700/50 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Vacinados</p>
            <h3 className="text-3xl font-black text-slate-800 dark:text-white mt-1">
              {MOCK_PETS.filter(p => p.isVaccinated).length}
            </h3>
          </div>
          <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 size={24} />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700/50 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Vacinas Pendentes</p>
            <h3 className="text-3xl font-black text-slate-800 dark:text-white mt-1">
              {MOCK_PETS.filter(p => !p.isVaccinated).length}
            </h3>
          </div>
          <div className="w-12 h-12 bg-rose-50 dark:bg-rose-900/30 rounded-2xl flex items-center justify-center text-rose-600 dark:text-rose-400">
            <AlertTriangle size={24} />
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex bg-slate-100 dark:bg-slate-800/50 p-1.5 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 w-full sm:w-auto">
          <button 
            onClick={() => setActiveTab('ativos')}
            className={`flex-1 sm:flex-none px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
              activeTab === 'ativos' 
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' 
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            Pets Ativos
          </button>
          <button 
            onClick={() => setActiveTab('inativos')}
            className={`flex-1 sm:flex-none px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
              activeTab === 'inativos' 
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' 
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            Histórico
          </button>
        </div>

        <div className="flex w-full sm:w-auto gap-3">
          <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/40 active:scale-[0.98]">
            <Plus size={20} />
            <span>Novo Pet</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredPets.length > 0 ? (
            filteredPets.map((pet, index) => (
              <motion.div 
                key={pet.id} 
                layout
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="group bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/60 dark:border-slate-700/60 overflow-hidden shadow-sm hover:shadow-xl hover:shadow-indigo-500/10 hover:border-indigo-200 dark:hover:border-indigo-800 transition-all duration-500"
              >
                {/* Image Header */}
                <div className="h-48 w-full bg-slate-100 dark:bg-slate-700 relative overflow-hidden">
                  <img src={pet.photo} alt={pet.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent opacity-80" />
                  
                  {/* Status Badge */}
                  <div className="absolute top-4 right-4">
                    {pet.isVaccinated ? (
                      <span className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/90 backdrop-blur-md text-white text-[11px] uppercase tracking-wider font-bold rounded-full shadow-lg">
                        <CheckCircle2 size={14} /> Vacinado
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-500/90 backdrop-blur-md text-white text-[11px] uppercase tracking-wider font-bold rounded-full shadow-lg">
                        <AlertTriangle size={14} /> Vacina Pendente
                      </span>
                    )}
                  </div>

                  <div className="absolute bottom-4 left-5 right-5 flex justify-between items-end">
                    <div>
                      <h3 className="text-2xl font-black text-white drop-shadow-md tracking-tight">{pet.name}</h3>
                      <p className="text-white/80 text-sm font-medium mt-0.5">{pet.breed}</p>
                    </div>
                    <div className="bg-white/20 backdrop-blur-md p-2.5 rounded-2xl border border-white/20 shadow-lg">
                      {getSpeciesIcon(pet.species)}
                    </div>
                  </div>
                </div>
                
                {/* Details */}
                <div className="p-5">
                  <div className="grid grid-cols-2 gap-3 mb-5">
                    <div className="bg-slate-50 dark:bg-slate-800/80 rounded-2xl p-3 border border-slate-100 dark:border-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Peso</span>
                      <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{pet.weight}</span>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800/80 rounded-2xl p-3 border border-slate-100 dark:border-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Cor</span>
                      <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{pet.color}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-4 border-t border-slate-100 dark:border-slate-700/50">
                    <button className="flex-1 flex justify-center items-center gap-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors">
                      <Syringe size={16} />
                      <span className="hidden sm:inline">Vacinas</span>
                    </button>
                    <button className="p-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors">
                      <Edit3 size={18} />
                    </button>
                    <button className="p-2.5 text-rose-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-colors">
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
                <PawPrint size={40} className="text-slate-300 dark:text-slate-600" />
              </div>
              <h3 className="text-2xl font-black text-slate-800 dark:text-white mb-3">
                Nenhum pet encontrado
              </h3>
              <p className="text-slate-500 max-w-md mx-auto mb-8 font-medium">
                Você ainda não tem animais de estimação cadastrados nesta categoria. Mantenha os dados dos seus pets sempre atualizados.
              </p>
              <button className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-8 py-4 rounded-2xl font-bold transition-all shadow-lg hover:shadow-indigo-600/30 hover:-translate-y-1">
                <Plus size={20} />
                Cadastrar Primeiro Pet
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Informação sobre regras */}
      <div className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/10 dark:to-blue-900/10 p-6 md:p-8 rounded-[2rem] border border-indigo-100 dark:border-indigo-800/30 flex flex-col md:flex-row items-center gap-6">
        <div className="w-16 h-16 bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-indigo-100 dark:border-slate-700 shrink-0 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
          <FileText size={32} />
        </div>
        <div>
          <h4 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Regras de Convivência</h4>
          <p className="text-slate-600 dark:text-slate-400 font-medium">
            Lembre-se de manter a carteira de vacinação do seu pet sempre em dia. O trânsito de animais nas áreas comuns deve seguir as normas do regimento interno do condomínio (uso de coleira e guia).
          </p>
        </div>
        <button className="mt-4 md:mt-0 md:ml-auto whitespace-nowrap bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 px-6 py-3 rounded-xl font-bold border border-indigo-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-all">
          Ler Regimento
        </button>
      </div>
    </div>
  );
};
