import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PawPrint, Plus, Dog, Cat, Bone, Syringe, 
  Trash2, Edit3, Camera, FileText, Rabbit,
  AlertTriangle, CheckCircle2, ChevronRight, X, ExternalLink, Eye
} from 'lucide-react';

interface Pet {
  id: string;
  name: string;
  species: 'Dog' | 'Cat' | 'Other';
  breed: string;
  weight: string;
  color: string;
  photo: string;
  address?: string;
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
    address: 'Apt 101, Bloco A',
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
    address: 'Apt 304, Bloco B',
    isVaccinated: false,
    status: 'Ativo'
  }
];

export const Animais: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'ativos' | 'inativos'>('ativos');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [pets, setPets] = useState<Pet[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [species, setSpecies] = useState<'Dog' | 'Cat' | 'Other'>('Dog');
  const [breed, setBreed] = useState('');
  const [weight, setWeight] = useState('');
  const [color, setColor] = useState('');
  const [photo, setPhoto] = useState('');
  const [address, setAddress] = useState('');
  const [isVaccinated, setIsVaccinated] = useState(false);
  
  const [viewingPet, setViewingPet] = useState<Pet | null>(null);
  const [isRulesModalOpen, setIsRulesModalOpen] = useState(false);

  useEffect(() => {
    // Tenta puxar da base remota, usa MOCK como fallback caso a API não responda/falhe CORS
    const fetchPets = async () => {
      try {
        const res = await fetch('https://petlocal-animal.vercel.app/api/pets');
        if (res.ok) {
          const data = await res.json();
          setPets(data.length ? data : MOCK_PETS);
        } else {
          setPets(MOCK_PETS);
        }
      } catch (err) {
        setPets(MOCK_PETS);
      }
    };
    fetchPets();
  }, []);

  const filteredPets = pets.filter(pet => {
    const matchStatus = activeTab === 'ativos' ? pet.status === 'Ativo' : pet.status === 'Inativo';
    const matchSearch = pet.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        pet.breed.toLowerCase().includes(searchQuery.toLowerCase());
    return matchStatus && matchSearch;
  });

  const getSpeciesIcon = (speciesName: string) => {
    switch (speciesName) {
      case 'Dog': return <Dog size={24} className="text-amber-500" />;
      case 'Cat': return <Cat size={24} className="text-indigo-500" />;
      default: return <Rabbit size={24} className="text-slate-500" />;
    }
  };

  const handleCreateNew = () => {
    if(!name.trim()) return;
    
    if (editingId) {
      setPets(pets.map(p => p.id === editingId ? { ...p, name, species, breed, weight, color, photo, address, isVaccinated } : p));
    } else {
      const newPet: Pet = {
        id: Math.random().toString(36).substr(2, 9),
        name, species, breed, weight, color, 
        photo: photo || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=400&h=400&fit=crop', 
        address,
        isVaccinated, 
        status: 'Ativo'
      };
      setPets([newPet, ...pets]);
    }
    
    closeModal();
  };

  const handleEdit = (pet: Pet) => {
    setName(pet.name);
    setSpecies(pet.species);
    setBreed(pet.breed);
    setWeight(pet.weight);
    setColor(pet.color);
    setPhoto(pet.photo);
    setAddress(pet.address || '');
    setIsVaccinated(pet.isVaccinated);
    setEditingId(pet.id);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir as informações deste pet?')) {
      setPets(pets.filter(p => p.id !== id));
    }
  };
  
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) {
        alert('A imagem deve ter no máximo 1MB (1024KB)');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setName('');
    setBreed('');
    setWeight('');
    setColor('');
    setAddress('');
    setPhoto('');
    setIsVaccinated(false);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 pt-6 w-full max-w-7xl mx-auto space-y-8">
      {/* Banner Petlocal */}
      <a 
        href="https://petlocal-animal.vercel.app/" 
        target="_blank" 
        rel="noopener noreferrer"
        className="block group relative overflow-hidden bg-gradient-to-r from-teal-500 to-emerald-600 rounded-3xl p-6 md:p-8 shadow-lg hover:shadow-xl transition-all"
      >
        <div className="absolute top-0 right-0 p-6 opacity-20 pointer-events-none group-hover:scale-110 transition-transform duration-700">
          <PawPrint size={150} />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-6">
          <div className="bg-white p-3 md:p-4 rounded-3xl shadow-md shrink-0 flex items-center justify-center">
            {/* Logo Petlocal Pequena */}
            <img src="/petlocal_logo.png" alt="Petlocal" className="w-16 h-16 md:w-20 md:h-20 object-contain rounded-xl" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling?.classList.remove('hidden'); }} />
            <PawPrint size={48} className="text-teal-600 hidden petlocal-fallback" />
          </div>
          <div className="text-center md:text-left text-white">
            <h2 className="text-2xl md:text-3xl font-black mb-2 flex items-center justify-center md:justify-start gap-3">
              Petlocal <ExternalLink size={24} className="text-white/70" />
            </h2>
            <p className="text-base md:text-lg font-medium text-emerald-50 max-w-2xl">
              Tenha acesso completo a informações de seu Pet. <span className="bg-white/20 px-2 py-0.5 rounded-md font-bold text-white">Acesso exclusivo para Assinantes AI Condo360</span>.
            </p>
          </div>
        </div>
      </a>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700/50 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total de Pets</p>
            <h3 className="text-3xl font-black text-slate-800 dark:text-white mt-1">
              {pets.filter(p => p.status === 'Ativo').length}
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
              {pets.filter(p => p.isVaccinated).length}
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
              {pets.filter(p => !p.isVaccinated).length}
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
                ? 'bg-white dark:bg-slate-700 text-teal-600 dark:text-teal-400 shadow-sm' 
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            Pets Ativos
          </button>
          <button 
            onClick={() => setActiveTab('inativos')}
            className={`flex-1 sm:flex-none px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
              activeTab === 'inativos' 
                ? 'bg-white dark:bg-slate-700 text-teal-600 dark:text-teal-400 shadow-sm' 
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            Histórico
          </button>
        </div>

        <div className="flex w-full sm:w-auto gap-3">
          <button onClick={() => setIsModalOpen(true)} className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-teal-600/20 hover:shadow-teal-600/40 active:scale-[0.98]">
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
                className="group bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/60 dark:border-slate-700/60 overflow-hidden shadow-sm hover:shadow-xl hover:shadow-teal-500/10 hover:border-teal-200 dark:hover:border-teal-800 transition-all duration-500 p-5 flex flex-col"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    {/* Foto Pequena em formato de balão */}
                    <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden shadow-md border-2 border-white dark:border-slate-800 shrink-0">
                      <img src={pet.photo} alt={pet.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-slate-800 dark:text-white tracking-tight leading-tight">{pet.name}</h3>
                      <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mt-0.5">{pet.breed}</p>
                    </div>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800/80 p-2.5 rounded-2xl border border-slate-100 dark:border-slate-700">
                    {getSpeciesIcon(pet.species)}
                  </div>
                </div>
                
                {/* Status Badges */}
                <div className="flex gap-2 mb-4">
                  {pet.isVaccinated ? (
                    <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-[11px] uppercase tracking-wider font-bold rounded-full">
                      <CheckCircle2 size={14} /> Vacinado
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 px-3 py-1 bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 text-[11px] uppercase tracking-wider font-bold rounded-full">
                      <AlertTriangle size={14} /> Vacina Pendente
                    </span>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1">
                  <div className="grid grid-cols-2 gap-3 mb-5">
                    <div className="bg-slate-50 dark:bg-slate-800/80 rounded-2xl p-3 border border-slate-100 dark:border-slate-700/50">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Peso</span>
                      <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{pet.weight}</span>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800/80 rounded-2xl p-3 border border-slate-100 dark:border-slate-700/50">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Cor</span>
                      <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{pet.color}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-4 border-t border-slate-100 dark:border-slate-700/50 mt-auto">
                    <button className="flex-1 flex justify-center items-center gap-2 bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400 px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-teal-100 dark:hover:bg-teal-900/40 transition-colors">
                      <Syringe size={16} />
                      <span className="hidden sm:inline">Vacinas</span>
                    </button>
                    <button onClick={() => setViewingPet(pet)} className="p-2.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-xl transition-colors" title="Ver Detalhes">
                      <Eye size={18} />
                    </button>
                    <button onClick={() => handleEdit(pet)} className="p-2.5 text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/20 rounded-xl transition-colors">
                      <Edit3 size={18} />
                    </button>
                    <button onClick={() => handleDelete(pet.id)} className="p-2.5 text-rose-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-colors">
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
              <button onClick={() => setIsModalOpen(true)} className="flex items-center justify-center gap-2 bg-teal-600 text-white px-8 py-4 rounded-2xl font-bold transition-all shadow-lg hover:shadow-teal-600/30 hover:-translate-y-1">
                <Plus size={20} />
                Cadastrar Primeiro Pet
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Modal Criar/Editar */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between sticky top-0 bg-white dark:bg-slate-800 z-10">
                <h3 className="text-xl font-bold dark:text-white">{editingId ? 'Editar Pet' : 'Novo Pet'}</h3>
                <button onClick={closeModal} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors">
                  <X size={24} className="text-slate-400" />
                </button>
              </div>
              <form className="p-6 space-y-4" onSubmit={(e) => { e.preventDefault(); handleCreateNew(); }}>
                <div className="flex gap-4 items-center">
                  <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center overflow-hidden shrink-0 border-2 border-slate-200 dark:border-slate-600">
                    {photo ? <img src={photo} alt="Preview" className="w-full h-full object-cover" /> : <Camera size={28} className="text-slate-400" />}
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Upload da Foto (Max 1MB)</label>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleImageUpload} 
                      className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-xl p-2.5 focus:ring-2 focus:ring-teal-500 transition-all text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100 dark:file:bg-teal-900 dark:file:text-teal-300" 
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nome *</label>
                    <input type="text" value={name} onChange={e => setName(e.target.value)} required className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-xl p-3 focus:ring-2 focus:ring-teal-500 transition-all text-sm" placeholder="Ex: Rex" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Espécie</label>
                    <select value={species} onChange={e => setSpecies(e.target.value as any)} className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-xl p-3 focus:ring-2 focus:ring-teal-500 transition-all text-sm">
                      <option value="Dog">Cachorro</option>
                      <option value="Cat">Gato</option>
                      <option value="Other">Outro</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Endereço (Ex: Apt 101, Casa 5)</label>
                  <input type="text" value={address} onChange={e => setAddress(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-xl p-3 focus:ring-2 focus:ring-teal-500 transition-all text-sm" placeholder="Apt ou casa" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Raça</label>
                    <input type="text" value={breed} onChange={e => setBreed(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-xl p-3 focus:ring-2 focus:ring-teal-500 transition-all text-sm" placeholder="Ex: Poodle" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Peso</label>
                    <input type="text" value={weight} onChange={e => setWeight(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-xl p-3 focus:ring-2 focus:ring-teal-500 transition-all text-sm" placeholder="Ex: 5kg" />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Cor Predominante</label>
                  <input type="text" value={color} onChange={e => setColor(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-xl p-3 focus:ring-2 focus:ring-teal-500 transition-all text-sm" placeholder="Ex: Branco e Preto" />
                </div>

                <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-100 dark:border-slate-700/50">
                  <input 
                    type="checkbox" 
                    id="vaccine" 
                    checked={isVaccinated} 
                    onChange={e => setIsVaccinated(e.target.checked)}
                    className="w-5 h-5 rounded text-teal-600 focus:ring-teal-500 bg-white border-slate-300"
                  />
                  <label htmlFor="vaccine" className="text-sm font-medium text-slate-700 dark:text-slate-300 select-none">
                    Vacinação está em dia
                  </label>
                </div>

                <button 
                  type="submit"
                  className="w-full bg-teal-600 text-white font-bold py-4 rounded-2xl hover:bg-teal-700 transition-colors shadow-lg shadow-teal-600/20 mt-4"
                >
                  {editingId ? 'Salvar Alterações' : 'Cadastrar Pet'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
      {/* Informação sobre regras */}
      <div className="bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-teal-900/10 dark:to-emerald-900/10 p-6 md:p-8 rounded-[2rem] border border-teal-100 dark:border-teal-800/30 flex flex-col md:flex-row items-center gap-6">
        <div className="w-16 h-16 bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-teal-100 dark:border-slate-700 shrink-0 flex items-center justify-center text-teal-600 dark:text-teal-400">
          <FileText size={32} />
        </div>
        <div>
          <h4 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Regras de Convivência</h4>
          <p className="text-slate-600 dark:text-slate-400 font-medium">
            Lembre-se de manter a carteira de vacinação do seu pet sempre em dia. O trânsito de animais nas áreas comuns deve seguir as normas do regimento interno do condomínio (uso de coleira e guia).
          </p>
        </div>
        <button onClick={() => setIsRulesModalOpen(true)} className="mt-4 md:mt-0 md:ml-auto whitespace-nowrap bg-white dark:bg-slate-800 text-teal-600 dark:text-teal-400 px-6 py-3 rounded-xl font-bold border border-teal-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-all">
          Ler Regimento
        </button>
      </div>

      {/* Modal - Visualizar Pet */}
      <AnimatePresence>
        {viewingPet && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
             <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl"
            >
              <div className="h-48 relative bg-slate-100 dark:bg-slate-700">
                <img src={viewingPet.photo} alt={viewingPet.name} className="w-full h-full object-cover" />
                <button onClick={() => setViewingPet(null)} className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/70 rounded-full transition-colors text-white">
                  <X size={20} />
                </button>
              </div>
              <div className="p-6 relative">
                <div className="absolute -top-8 right-6 bg-white dark:bg-slate-800 p-2 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-700">
                  {getSpeciesIcon(viewingPet.species)}
                </div>
                <h3 className="text-3xl font-black text-slate-800 dark:text-white mb-1">{viewingPet.name}</h3>
                <p className="text-slate-500 dark:text-slate-400 font-medium mb-6">{viewingPet.breed}</p>

                <div className="bg-slate-50 dark:bg-slate-800/80 rounded-2xl p-4 border border-slate-100 dark:border-slate-700/50 space-y-4">
                  <div className="flex justify-between items-center pb-3 border-b border-slate-200 dark:border-slate-700">
                    <span className="text-sm font-bold text-slate-500 dark:text-slate-400">Status Vacinas</span>
                    {viewingPet.isVaccinated ? (
                      <span className="flex items-center gap-1 text-emerald-600 font-bold bg-emerald-100 px-2 py-0.5 rounded text-sm"><CheckCircle2 size={16}/> Em dia</span>
                    ) : (
                      <span className="flex items-center gap-1 text-rose-600 font-bold bg-rose-100 px-2 py-0.5 rounded text-sm"><AlertTriangle size={16}/> Pendente</span>
                    )}
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-slate-200 dark:border-slate-700">
                    <span className="text-sm font-bold text-slate-500 dark:text-slate-400">Endereço / Unidade</span>
                    <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{viewingPet.address || 'Não cadastrado'}</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-slate-200 dark:border-slate-700">
                    <span className="text-sm font-bold text-slate-500 dark:text-slate-400">Peso</span>
                    <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{viewingPet.weight || '-'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-slate-500 dark:text-slate-400">Cor</span>
                    <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{viewingPet.color || '-'}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal - Regras de Convivência */}
      <AnimatePresence>
        {isRulesModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl max-h-[85vh] flex flex-col"
            >
              <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between bg-white dark:bg-slate-800 z-10">
                <h3 className="text-xl font-bold dark:text-white flex items-center gap-2">
                  <FileText className="text-teal-600" size={24} /> Resumo do Regimento Interno
                </h3>
                <button onClick={() => setIsRulesModalOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors">
                  <X size={24} className="text-slate-400" />
                </button>
              </div>
              <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-6 text-slate-600 dark:text-slate-300 text-sm md:text-base leading-relaxed">
                <div className="p-4 bg-teal-50 dark:bg-teal-900/20 text-teal-800 dark:text-teal-200 rounded-xl font-medium border border-teal-100 dark:border-teal-800/50">
                  A legislação brasileira garante o direito de manter animais de estimação em condomínios governados pelos princípios de Propriedade, Saúde, Sossego e Segurança ("os 3 Ss").
                </div>
                
                <h4 className="text-lg font-bold text-slate-800 dark:text-white border-b border-slate-100 dark:border-slate-700 pb-2">1. Direitos Essenciais</h4>
                <ul className="list-disc pl-5 space-y-2">
                  <li>O condomínio <strong className="text-slate-800 dark:text-white">não pode proibir</strong> a posse de animais de estimação, independentemente do porte, desde que não representem risco aos 3 Ss.</li>
                  <li>Visitantes não podem ser impedidos de circular ou entrar com seus animais de estimação.</li>
                  <li>Obrigação do uso de focinheira ou transporte no colo são proibidos se a lei municipal ou estadual não exigir isso para a raça.</li>
                </ul>

                <h4 className="text-lg font-bold text-slate-800 dark:text-white border-b border-slate-100 dark:border-slate-700 pb-2">2. Regras de Conduta e Convivência</h4>
                <ul className="list-disc pl-5 space-y-2">
                  <li><strong className="text-slate-800 dark:text-white">Uso de Guias:</strong> É obrigatório que os pets transitem nas áreas comuns sempre de coleira e guia curtas, conduzidos por pessoa capaz de controlá-los.</li>
                  <li><strong className="text-slate-800 dark:text-white">Higiene:</strong> O recolhimento das fezes e a limpeza da urina nas áreas comuns são de inteira responsabilidade do tutor. Recomendável sempre carregar sacos higiênicos ou tapetes de limpeza.</li>
                  <li><strong className="text-slate-800 dark:text-white">Barulhos:</strong> Barulhos excessivos repetitivos que tirem a tranquilidade e o sossego dos demais moradores (como latidos ininterruptos) podem ser alvo de multa, mediante notificação registrada.</li>
                  <li><strong className="text-slate-800 dark:text-white">Acesso Restrito:</strong> É proibida a permanência de animais de estimação (exceto cães-guia) em áreas como piscina, salão de festas e academias. O trânsito de elevador e hall deve ser feito da forma mais breve possível.</li>
                </ul>

                <p className="pt-4 text-xs text-slate-400 dark:text-slate-500 italic mt-6 text-center">
                  Baseado no guia "Animais de Estimação em Condomínio" sobre a lei sobre animais. O foco principal deve sempre ser o bom senso e o respeito à boa vivência entre vizinhos.
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
