import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PawPrint, Plus, Dog, Cat, Bone, Syringe, 
  Trash2, Edit3, Camera, FileText, Rabbit,
  AlertTriangle, CheckCircle2, ChevronRight, X, ExternalLink, Eye, Loader2
} from 'lucide-react';
import { PetService } from '../services/supabaseService';
import { useAuth } from '../hooks/useAuth';

interface Pet {
  id: string;
  condominio_id?: string;
  user_id?: string;
  name: string;
  species: 'Dog' | 'Cat' | 'Other';
  breed: string;
  weight: string;
  color: string;
  photo?: string;
  photo_url?: string;
  address: string;
  is_vaccinated: boolean;
  owner_name?: string;
  status: 'Ativo' | 'Inativo';
  created_at?: string;
}

const MOCK_PETS: Pet[] = [];

export const Animais: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'ativos' | 'inativos'>('ativos');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
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
  const [ownerName, setOwnerName] = useState('');
  const [isVaccinated, setIsVaccinated] = useState(false);
  
  const [viewingPet, setViewingPet] = useState<Pet | null>(null);
  const [isRulesModalOpen, setIsRulesModalOpen] = useState(false);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);

  const loadPets = async () => {
    if (!user?.condoId) return;
    setLoading(true);
    try {
      const data = await PetService.getCondoPets(user.condoId);
      setPets(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPets();
  }, [user?.condoId]);

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

  const handleCreateNew = async () => {
    if(!name.trim() || !user) return;

    if (!user.condoId || user.condoId.trim() === '') {
      alert("⚠️ Sem condomínio selecionado!\n\nSe você for Administrador Global, selecione um condomínio no menu superior antes de cadastrar um animal.");
      return;
    }
    
    try {
      const petData = {
        name, 
        species, 
        breed, 
        weight, 
        color, 
        photo: photo || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=400&h=400&fit=crop', 
        address,
        is_vaccinated: isVaccinated,
        owner_name: ownerName,
        condominio_id: user.condoId,
        user_id: user.id,
        status: 'Ativo'
      };

      if (editingId) {
        await PetService.updatePet(editingId, petData);
      } else {
        await PetService.createPet(petData);
      }
      
      loadPets();
      closeModal();
    } catch (err: any) {
      const errorMsg = err.message || "Erro desconhecido";
      alert(`Erro ao salvar pet: ${errorMsg}\n\nVerifique se o formulário está preenchido corretamente.`);
      console.error(err);
    }
  };

  const checkPremiumAction = () => {
    if (user?.role === 'global_admin' || user?.plan === 'premium') return true;
    alert("funcionalidade apenas para o Plano Premium");
    return false;
  };

  const handleEdit = (pet: Pet) => {
    if (!checkPremiumAction()) return;
    setName(pet.name);
    setSpecies(pet.species);
    setBreed(pet.breed);
    setWeight(pet.weight);
    setColor(pet.color);
    setPhoto(pet.photo_url || pet.photo || '');
    setAddress(pet.address || '');
    setIsVaccinated(pet.is_vaccinated);
    setOwnerName(pet.owner_name || '');
    setEditingId(pet.id);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!checkPremiumAction()) return;
    if (window.confirm('Tem certeza que deseja excluir as informações deste pet?')) {
      try {
        await PetService.deletePet(id);
        loadPets();
      } catch (err) {
        alert("Erro ao excluir pet.");
      }
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
    setOwnerName('');
    setIsVaccinated(false);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 pt-6 w-full max-w-7xl mx-auto space-y-8">
      {/* Banner Petlocal */}
      <div className="group relative overflow-hidden bg-gradient-to-r from-teal-500 to-emerald-600 rounded-3xl p-6 md:p-8 shadow-lg transition-all duration-500 border border-teal-400/20">
        <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none group-hover:scale-110 transition-transform duration-1000">
          <PawPrint size={180} />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 md:gap-12">
          <div className="flex flex-col items-center gap-3 shrink-0">
            <a 
              href="https://petlocal-animal.vercel.app/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:scale-105 transition-transform duration-300 group/logo"
            >
              <img 
                src="/petlocal_full_logo.png" 
                alt="Petlocal" 
                className="w-32 md:w-40 h-auto object-contain drop-shadow-md" 
                onError={(e) => { 
                  e.currentTarget.style.display = 'none'; 
                  const fallback = e.currentTarget.parentElement?.querySelector('.petlocal-fallback');
                  if (fallback) fallback.classList.remove('hidden');
                }}
              />
              <div className="hidden petlocal-fallback flex flex-col items-center">
                <PawPrint size={48} className="text-white" />
              </div>
            </a>

            <a 
              href="https://petlocal-animal.vercel.app/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-4 py-1.5 border border-emerald-300/40 text-white rounded-full font-medium text-[11px] hover:bg-white/10 transition-all uppercase tracking-wider"
            >
              <ExternalLink size={12} className="text-emerald-200" /> Explorar Hub Petlocal
            </a>
          </div>

          <div className="text-center md:text-left text-white max-w-2xl">
            <p className="text-xl md:text-2xl font-medium text-emerald-50 leading-tight">
              Descubra ferramentas exclusivas para a gestão do seu Pet. 
              <span className="block mt-2 font-normal text-yellow-400 text-sm md:text-base tracking-wide italic">
                Acesso exclusivo para Comunidade AI Condo360
              </span>
            </p>
          </div>
        </div>
      </div>

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
              {pets.filter(p => p.is_vaccinated).length}
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
              {pets.filter(p => !p.is_vaccinated).length}
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
          <button 
            onClick={() => checkPremiumAction() && setIsModalOpen(true)} 
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-teal-600/20 hover:shadow-teal-600/40 active:scale-[0.98]"
          >
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
                      <button 
                        onClick={() => setZoomedImage(pet.photo_url || pet.photo || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=400&h=400&fit=crop')}
                        className="w-full h-full block group relative cursor-pointer"
                        title="Ampliar Foto"
                      >
                        <img 
                          src={pet.photo_url || pet.photo || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=400&h=400&fit=crop'} 
                          alt={pet.name} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          onError={(e) => {
                             e.currentTarget.src = 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=400&h=400&fit=crop';
                          }}
                        />
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                           <ExternalLink size={14} className="text-white" />
                        </div>
                      </button>
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-xl font-black text-slate-800 dark:text-white tracking-tight leading-tight truncate">{pet.name}</h3>
                      <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mt-0.5 truncate">{pet.breed}</p>
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-teal-500"></div>
                        <p className="text-slate-600 dark:text-slate-300 text-[11px] font-black uppercase tracking-tight truncate">Tutor: {pet.owner_name || 'NI'}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800/80 p-2.5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm group-hover:bg-teal-50 dark:group-hover:bg-teal-900/20 transition-colors">
                    {getSpeciesIcon(pet.species)}
                  </div>
                </div>
                
                {/* Status Badges */}
                <div className="flex gap-2 mb-4">
                  {pet.is_vaccinated ? (
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
              <button 
                onClick={() => checkPremiumAction() && setIsModalOpen(true)} 
                className="flex items-center justify-center gap-2 bg-teal-600 text-white px-8 py-4 rounded-2xl font-bold transition-all shadow-lg hover:shadow-teal-600/30 hover:-translate-y-1"
              >
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
              className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="relative">
                <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between sticky top-0 bg-white dark:bg-slate-800 z-10">
                  <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">
                    {editingId ? 'Editar Pet' : 'Novo Pet'}
                  </h3>
                  <button onClick={closeModal} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors text-slate-300">
                    <X size={16} />
                  </button>
                </div>
              </div>
              <form className="p-5 space-y-4" onSubmit={(e) => { e.preventDefault(); handleCreateNew(); }}>
                <div className="flex gap-4 items-center mb-2">
                  <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden shrink-0 border-2 border-slate-100 dark:border-slate-700 shadow-inner relative group cursor-pointer" onClick={() => photo && setZoomedImage(photo)}>
                    {photo ? (
                      <>
                        <img src={photo} alt="Preview" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                           <ExternalLink size={16} className="text-white" />
                        </div>
                      </>
                    ) : <Camera size={22} className="text-slate-400" />}
                  </div>
                  <div className="flex-1">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 px-1">Foto do Pet</label>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleImageUpload} 
                      className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-xl p-2 focus:ring-2 focus:ring-teal-500 transition-all text-[11px] file:mr-3 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-[10px] file:font-black file:uppercase file:bg-teal-50 file:text-teal-700 dark:file:bg-teal-900 dark:file:text-teal-300" 
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 px-1">Nome do Pet</label>
                    <input type="text" value={name} onChange={e => setName(e.target.value)} required className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-xl p-3 focus:ring-2 focus:ring-teal-500 transition-all text-xs font-bold dark:text-white" placeholder="Ex: Rex" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 px-1">Espécie</label>
                    <select value={species} onChange={e => setSpecies(e.target.value as any)} className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-xl p-3 focus:ring-2 focus:ring-teal-500 transition-all text-xs font-bold dark:text-white appearance-none">
                      <option value="Dog">Cachorro</option>
                      <option value="Cat">Gato</option>
                      <option value="Other">Outro</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 px-1">Tutor</label>
                    <input type="text" value={ownerName} onChange={e => setOwnerName(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-xl p-3 focus:ring-2 focus:ring-teal-500 transition-all text-xs font-bold dark:text-white" placeholder="Nome" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 px-1">Unidade</label>
                    <input type="text" value={address} onChange={e => setAddress(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-xl p-3 focus:ring-2 focus:ring-teal-500 transition-all text-xs font-bold dark:text-white" placeholder="Apt" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 px-1">Raça</label>
                    <input type="text" value={breed} onChange={e => setBreed(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-xl p-3 focus:ring-2 focus:ring-teal-500 transition-all text-xs font-bold dark:text-white" placeholder="Ex: Poodle" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 px-1">Peso</label>
                    <input type="text" value={weight} onChange={e => setWeight(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-xl p-3 focus:ring-2 focus:ring-teal-500 transition-all text-xs font-bold dark:text-white" placeholder="Ex: 5kg" />
                  </div>
                </div>
                
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 px-1">Cor Predominante</label>
                  <input type="text" value={color} onChange={e => setColor(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-xl p-3 focus:ring-2 focus:ring-teal-500 transition-all text-xs font-bold dark:text-white" placeholder="Ex: Branco/Preto" />
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
                  className="w-full bg-zinc-900 hover:bg-black text-white font-black uppercase text-[11px] tracking-[0.2em] py-4 rounded-2xl shadow-xl transition-all active:scale-[0.98] mt-4"
                >
                  {editingId ? 'Salvar' : 'Cadastrar'}
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
              className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl max-h-[90vh] flex flex-col"
            >
              <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between sticky top-0 bg-white dark:bg-slate-800 z-10 shrink-0">
                  <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                    Visualizar Pet
                  </h3>
                  <button onClick={() => setViewingPet(null)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors text-slate-300">
                    <X size={16} />
                  </button>
              </div>

              <div className="p-5 overflow-y-auto custom-scrollbar">
                <div className="flex flex-col items-center mb-6">
                  <button 
                    onClick={() => setZoomedImage(viewingPet.photo_url || viewingPet.photo || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=400&h=400&fit=crop')} 
                    title="Visualizar Foto"
                    className="w-24 h-24 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center overflow-hidden shrink-0 border-4 border-slate-50 dark:border-slate-800 shadow-md group relative cursor-pointer"
                  >
                    <img 
                      src={viewingPet.photo_url || viewingPet.photo || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=400&h=400&fit=crop'} 
                      alt={viewingPet.name} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" 
                      onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=400&h=400&fit=crop'; }}
                    />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                       <ExternalLink size={20} className="text-white" />
                    </div>
                  </button>
                  
                  <div className="flex items-center gap-2 mt-3">
                    <h3 className="text-2xl font-black text-slate-800 dark:text-white leading-tight">{viewingPet.name}</h3>
                    <div className="bg-slate-50 dark:bg-slate-800 p-1.5 rounded-xl border border-slate-100 dark:border-slate-700">
                      {getSpeciesIcon(viewingPet.species)}
                    </div>
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 font-medium text-sm mt-1">{viewingPet.breed}</p>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/80 rounded-2xl p-4 border border-slate-100 dark:border-slate-700/50 space-y-4">
                  <div className="flex justify-between items-center pb-3 border-b border-slate-200 dark:border-slate-700">
                    <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Status Vacinas</span>
                    {viewingPet.is_vaccinated ? (
                      <span className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-bold bg-emerald-100 dark:bg-emerald-900/30 px-2.5 py-1 rounded text-[11px] uppercase tracking-wider"><CheckCircle2 size={14}/> Em dia</span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-rose-700 dark:text-rose-400 font-bold bg-rose-100 dark:bg-rose-900/30 px-2.5 py-1 rounded text-[11px] uppercase tracking-wider"><AlertTriangle size={14}/> Pendente</span>
                    )}
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-slate-200 dark:border-slate-700">
                    <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Tutor</span>
                    <span className="text-xs font-bold text-teal-600 dark:text-teal-400">{viewingPet.owner_name || 'NI'}</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-slate-200 dark:border-slate-700">
                    <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Endereço/Und</span>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{viewingPet.address || 'NC'}</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-slate-200 dark:border-slate-700">
                    <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Peso</span>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{viewingPet.weight || '-'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Cor</span>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{viewingPet.color || '-'}</span>
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
      {/* Modal - Zoom da Foto */}
      <AnimatePresence>
        {zoomedImage && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-sm" onClick={() => setZoomedImage(null)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative max-w-4xl w-full flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                onClick={() => setZoomedImage(null)} 
                className="absolute -top-12 right-0 md:-right-12 p-2 text-white hover:text-slate-300 transition-colors"
              >
                <X size={32} />
              </button>
              <img 
                src={zoomedImage} 
                alt="Pet Ampliado" 
                className="max-h-[85vh] max-w-full rounded-2xl shadow-2xl object-contain border border-white/10" 
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
