import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Car, Search, Plus, X, Edit2, Trash2, Shield, Info, Camera, User, FileText, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { FeatureHeader } from '../components/FeatureHeader';
import { VehicleService, Veiculo as IVeiculo } from '../services/supabaseService';
import { useAuth } from '../hooks/useAuth';


interface GaragemProps {
  userId: string;
  condoId: string;
  userRole?: string;
}

export const Garagem: React.FC<GaragemProps> = ({ userId, condoId, userRole }) => {
  const { user } = useAuth();

  const [vehicles, setVehicles] = useState<IVeiculo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const canManage = userRole === 'admin' || userRole === 'syndic' || userRole === 'global_admin';

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<IVeiculo | null>(null);
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const [photoInfoIdx, setPhotoInfoIdx] = useState<number | null>(null);

  useEffect(() => {
    setActivePhotoIdx(0);
  }, [selectedVehicle]);

  useEffect(() => {
    setPhotoInfoIdx(null);
  }, [showModal]);

  const [editingVehicle, setEditingVehicle] = useState<IVeiculo | null>(null);
  const [formData, setFormData] = useState({
    brand: '',
    model: '',
    plate: '',
    color: '',
    owner_name: '',
    observation: '',
    garage_number: '',
    unit_number: '',
    image_url: '',
    type: 'car' as 'car' | 'motorcycle' | 'bicycle',
    images: [] as string[],
    resident_car_qty: 1,
    resident_car_models: ''
  });

  useEffect(() => {
    fetchVehicles();
  }, [userId]);

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const data = canManage 
        ? await VehicleService.getCondoVehicles(condoId)
        : await VehicleService.getUserVehicles(userId);
      setVehicles(data);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (vehicle?: IVeiculo) => {
    if (vehicle) {
      setEditingVehicle(vehicle);
      setFormData({
        brand: vehicle.brand,
        model: vehicle.model,
        plate: vehicle.plate,
        color: vehicle.color,
        owner_name: vehicle.owner_name || '',
        observation: vehicle.observation || '',
        garage_number: vehicle.garage_number || '',
        unit_number: vehicle.unit_number || '',
        image_url: vehicle.image_url || '',
        type: vehicle.type,
        images: vehicle.images || (vehicle.image_url ? [vehicle.image_url] : []),
        resident_car_qty: vehicle.resident_car_qty || 1,
        resident_car_models: vehicle.resident_car_models || ''
      });
    } else {
      const currentCarCount = vehicles.filter(v => v.type === 'car').length;
      if (!canManage && currentCarCount >= 5) {
        alert("⚠️ Limite Atingido!\n\nVocê já possui 5 carros cadastrados. O limite por morador é de no máximo 5 carros.");
        return;
      }
      setEditingVehicle(null);
      setFormData({
        brand: '',
        model: '',
        plate: '',
        color: '',
        owner_name: '',
        observation: '',
        garage_number: '',
        unit_number: '',
        image_url: '',
        type: 'car',
        images: [],
        resident_car_qty: 1,
        resident_car_models: ''
      });
    }
    setShowModal(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const currentImages = formData.images || [];
      const slotsAvailable = 5 - currentImages.length;
      const filesToUpload = Array.from(files) as File[];
      filesToUpload.slice(0, slotsAvailable).forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFormData(prev => {
            const newImages = [...(prev.images || []), reader.result as string].slice(0, 5);
            return {
              ...prev,
              images: newImages,
              image_url: newImages[0] || ''
            };
          });
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const finalCondoId = condoId || user?.condoId;
      if (!finalCondoId || finalCondoId.trim() === '') {
        alert("⚠️ Sem condomínio selecionado!\n\nSe você for Administrador Global, selecione um condomínio no menu superior antes de cadastrar um veículo.");
        return;
      }

      // Validar no envio
      if (!editingVehicle && formData.type === 'car' && !canManage) {
        const currentCarCount = vehicles.filter(v => v.type === 'car').length;
        if (currentCarCount >= 5) {
          alert("⚠️ Limite Atingido!\n\nVocê já possui 5 carros cadastrados. O limite por morador é de no máximo 5 carros.");
          return;
        }
      }

      if (editingVehicle) {
        await VehicleService.updateVehicle(editingVehicle.id, {
          brand: formData.brand,
          model: formData.model,
          plate: formData.plate,
          color: formData.color,
          owner_name: formData.owner_name,
          observation: formData.observation,
          garage_number: formData.garage_number,
          unit_number: formData.unit_number,
          image_url: formData.image_url,
          type: formData.type,
          images: formData.images,
          resident_car_qty: formData.resident_car_qty,
          resident_car_models: formData.resident_car_models
        });
      } else {
        await VehicleService.createVehicle({
          brand: formData.brand,
          model: formData.model,
          plate: formData.plate,
          color: formData.color,
          owner_name: formData.owner_name,
          observation: formData.observation,
          garage_number: formData.garage_number,
          unit_number: formData.unit_number,
          image_url: formData.image_url,
          type: formData.type,
          user_id: userId,
          condominio_id: finalCondoId,
          images: formData.images,
          resident_car_qty: formData.resident_car_qty,
          resident_car_models: formData.resident_car_models
        });
      }
      setShowModal(false);
      fetchVehicles();
    } catch (error: any) {
      console.error('Error saving vehicle:', error);
      alert('Erro ao salvar veículo: ' + (error?.message || 'Erro desconhecido. Verifique o Condomínio em seu Perfil.'));
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Deseja excluir este veículo?')) {
      try {
        await VehicleService.deleteVehicle(id);
        fetchVehicles();
      } catch (error) {
        console.error('Error deleting vehicle:', error);
      }
    }
  };

  const filteredVehicles = vehicles.filter(v => 
    v.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.owner_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto py-6 px-4">
      <FeatureHeader 
        icon={Car}
        title="Minha Garagem"
        description="Gerencie os veículos cadastrados para sua unidade e controle o acesso ao condomínio."
        color="bg-zinc-800"
      />

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text"
            placeholder="Buscar por placa, proprietário ou modelo..."
            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-zinc-500 transition-all font-medium text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-900 text-white px-6 py-3 rounded-2xl font-medium transition-all shadow-lg shadow-zinc-500/20 active:scale-95"
        >
          <Plus size={20} />
          Cadastrar Veículo
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2].map(id => (
            <div key={id} className="bg-white dark:bg-slate-800 p-6 rounded-[32px] h-64 animate-pulse border border-slate-100 dark:border-slate-700"></div>
          ))}
        </div>
      ) : filteredVehicles.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <AnimatePresence mode="popLayout">
            {filteredVehicles.map((vehicle) => (
              <motion.div
                key={vehicle.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white dark:bg-slate-800 rounded-[24px] border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-lg transition-all group overflow-hidden flex flex-col"
              >
                {/* Imagem do Veículo */}
                <div className="h-32 bg-slate-100 dark:bg-slate-900 relative overflow-hidden transition-all">
                  {vehicle.image_url ? (
                    <img src={vehicle.image_url} alt={vehicle.model} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 dark:text-slate-700">
                      <Car size={32} strokeWidth={1} />
                      <span className="text-[8px] font-medium uppercase tracking-widest mt-1">Sem Foto</span>
                    </div>
                  )}

                  {vehicle.images && vehicle.images.length > 1 && (
                    <div className="absolute top-2 right-2 bg-black/60 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-md backdrop-blur-sm z-10">
                      1/{vehicle.images.length}
                    </div>
                  )}

                  {/* Tag de Tipo */}
                  <div className="absolute bottom-4 left-4">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest backdrop-blur-md shadow-lg ${
                      vehicle.type === 'car' ? 'bg-blue-500/90 text-white' :
                      vehicle.type === 'motorcycle' ? 'bg-orange-500/90 text-white' :
                      'bg-emerald-500/90 text-white'
                    }`}>
                      {vehicle.type === 'car' ? 'Carro' : vehicle.type === 'motorcycle' ? 'Moto' : 'Bicicleta'}
                    </span>
                  </div>
                </div>

                <div className="p-4 flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-normal text-lg text-slate-900 dark:text-white uppercase tracking-wider">
                      {vehicle.plate}
                    </h3>
                  </div>
                  
                  <p className="text-[10px] font-medium text-slate-500 mb-3 truncate">
                    {vehicle.brand} {vehicle.model} • <span className="opacity-70">{vehicle.color}</span>
                  </p>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-[10px] font-medium text-slate-600 dark:text-slate-400">
                      <User size={10} className="text-slate-400" />
                      <span className="truncate">{vehicle.owner_name}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-1 px-0.5 text-[10px] font-medium text-slate-500">
                       <div className="flex items-center gap-1.5">
                        <span className="opacity-60">VG:</span> <span className="text-slate-700 dark:text-slate-300">{vehicle.garage_number || '-'}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="opacity-60">UND:</span> <span className="text-slate-700 dark:text-slate-300">{vehicle.unit_number || '-'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Botões de Ação sempre visíveis */}
                <div className="px-3 py-2.5 bg-slate-50/50 dark:bg-slate-900/30 border-t border-slate-100 dark:border-slate-700/50 mt-auto flex items-center justify-between gap-1">
                  <div className="flex items-center gap-1.5 text-[8px] font-medium uppercase tracking-widest text-emerald-500">
                    <Shield size={10} />
                    Ativo
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setSelectedVehicle(vehicle)}
                      className="p-1.5 bg-white dark:bg-slate-800 hover:bg-blue-500 hover:text-white rounded-lg text-slate-400 transition-all border border-slate-100 dark:border-slate-700 shadow-sm"
                      title="Visualizar"
                    >
                      <Eye size={13} />
                    </button>
                    <button
                      onClick={() => handleOpenModal(vehicle)}
                      className="p-1.5 bg-white dark:bg-slate-800 hover:bg-amber-500 hover:text-white rounded-lg text-slate-400 transition-all border border-slate-100 dark:border-slate-700 shadow-sm"
                      title="Editar"
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      onClick={() => handleDelete(vehicle.id)}
                      className="p-1.5 bg-white dark:bg-slate-800 hover:bg-red-500 hover:text-white rounded-lg text-slate-400 transition-all border border-slate-100 dark:border-slate-700 shadow-sm"
                      title="Excluir"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="text-center py-24 bg-white dark:bg-slate-800 rounded-[48px] border border-dashed border-slate-200 dark:border-slate-700 shadow-inner">
          <div className="bg-slate-50 dark:bg-slate-900/50 w-32 h-32 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
            <Car size={64} className="text-slate-300" />
          </div>
          <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">Sua garagem está vazia</h3>
          <p className="text-slate-500 max-w-sm mx-auto font-medium text-lg mb-8 leading-relaxed">
            Cadastre seus veículos para facilitar a identificação e o acesso automático ao condomínio.
          </p>
          <button 
            onClick={() => handleOpenModal()}
            className="bg-zinc-800 hover:bg-zinc-900 text-white px-10 py-5 rounded-[24px] font-black uppercase text-xs tracking-widest shadow-2xl transition-all hover:scale-105"
          >
            Cadastrar Primeiro Veículo
          </button>
        </div>
      )}

      {/* Modal de Visualização do Veículo */}
      <AnimatePresence>
        {selectedVehicle && (() => {
          const vehiclePhotos = selectedVehicle.images && selectedVehicle.images.length > 0 
            ? selectedVehicle.images 
            : (selectedVehicle.image_url ? [selectedVehicle.image_url] : []);
          
          return (
            <div
              className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-md"
              onClick={() => setSelectedVehicle(null)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-sm max-h-[90vh] overflow-y-auto shadow-2xl"
                onClick={e => e.stopPropagation()}
              >
                {/* Imagem com Carrossel */}
                <div className="relative h-40 bg-slate-100 dark:bg-slate-900 overflow-hidden rounded-t-3xl">
                  {vehiclePhotos.length > 0 ? (
                    <>
                      <img src={vehiclePhotos[activePhotoIdx]} alt={selectedVehicle.model} className="w-full h-full object-cover" />
                      {vehiclePhotos.length > 1 && (
                        <div className="absolute inset-0 flex items-center justify-between px-2 pointer-events-none">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActivePhotoIdx(prev => (prev === 0 ? vehiclePhotos.length - 1 : prev - 1));
                            }}
                            className="p-1 rounded-full bg-black/50 text-white pointer-events-auto hover:bg-black/70 transition-all"
                          >
                            <ChevronLeft size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActivePhotoIdx(prev => (prev === vehiclePhotos.length - 1 ? 0 : prev + 1));
                            }}
                            className="p-1 rounded-full bg-black/50 text-white pointer-events-auto hover:bg-black/70 transition-all"
                          >
                            <ChevronRight size={16} />
                          </button>
                        </div>
                      )}
                      {/* Indicadores de bolinha */}
                      {vehiclePhotos.length > 1 && (
                        <div className="absolute bottom-3 right-3 flex gap-1 bg-black/40 px-2 py-0.5 rounded-full backdrop-blur-sm">
                          {vehiclePhotos.map((_, i) => (
                            <span
                              key={i}
                              className={`w-1 h-1 rounded-full transition-all ${
                                i === activePhotoIdx ? 'bg-white scale-125' : 'bg-white/40'
                              }`}
                            />
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 dark:text-slate-700">
                      <Car size={48} strokeWidth={1} />
                      <span className="text-[9px] font-medium uppercase tracking-widest mt-2">Sem Foto</span>
                    </div>
                  )}
                  <div className="absolute bottom-3 left-3">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest backdrop-blur-md shadow-lg ${
                      selectedVehicle.type === 'car' ? 'bg-blue-500/90 text-white' :
                      selectedVehicle.type === 'motorcycle' ? 'bg-orange-500/90 text-white' :
                      'bg-emerald-500/90 text-white'
                    }`}>
                      {selectedVehicle.type === 'car' ? 'Carro' : selectedVehicle.type === 'motorcycle' ? 'Moto' : 'Bicicleta'}
                    </span>
                  </div>
                  <button
                    onClick={() => setSelectedVehicle(null)}
                    className="absolute top-3 right-3 p-2 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md hover:bg-rose-500 hover:text-white rounded-xl transition-all"
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* Conteúdo */}
                <div className="p-5 space-y-4">
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{selectedVehicle.plate}</h3>
                    <p className="text-xs font-medium text-slate-500 mt-0.5">{selectedVehicle.brand} {selectedVehicle.model} • {selectedVehicle.color}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-3">
                      <p className="text-[9px] font-medium text-slate-400 uppercase tracking-widest mb-1">Proprietário</p>
                      <p className="text-xs font-black text-slate-800 dark:text-white truncate">{selectedVehicle.owner_name || '-'}</p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-3">
                      <p className="text-[9px] font-medium text-slate-400 uppercase tracking-widest mb-1">Unidade</p>
                      <p className="text-xs font-black text-slate-800 dark:text-white">{selectedVehicle.unit_number || '-'}</p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-3">
                      <p className="text-[9px] font-medium text-slate-400 uppercase tracking-widest mb-1">Vaga</p>
                      <p className="text-xs font-black text-slate-800 dark:text-white">{selectedVehicle.garage_number || '-'}</p>
                    </div>
                    <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-3">
                      <p className="text-[9px] font-medium text-emerald-400 uppercase tracking-widest mb-1">Status</p>
                      <p className="text-xs font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-1"><Shield size={10} /> Ativo</p>
                    </div>
                    
                    {/* Campos de quantidade e modelo do morador */}
                    <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-3">
                      <p className="text-[9px] font-medium text-slate-400 uppercase tracking-widest mb-1">Qtd Carros</p>
                      <p className="text-xs font-black text-slate-800 dark:text-white">{selectedVehicle.resident_car_qty || 1}</p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-3">
                      <p className="text-[9px] font-medium text-slate-400 uppercase tracking-widest mb-1">Modelos Unidade</p>
                      <p className="text-xs font-black text-slate-800 dark:text-white truncate" title={selectedVehicle.resident_car_models}>{selectedVehicle.resident_car_models || '-'}</p>
                    </div>
                  </div>

                  {selectedVehicle.observation && (
                    <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-xl p-3 border border-dashed border-zinc-200 dark:border-zinc-700">
                      <p className="text-[9px] font-medium text-slate-400 uppercase tracking-widest mb-1">Observações</p>
                      <p className="text-xs text-zinc-600 dark:text-zinc-300 italic leading-relaxed">"{selectedVehicle.observation}"</p>
                    </div>
                  )}

                  {/* Botões de ação no modal */}
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => { setSelectedVehicle(null); handleOpenModal(selectedVehicle); }}
                      className="flex-1 flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-4 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all"
                    >
                      <Edit2 size={14} /> Editar
                    </button>
                    <button
                      onClick={() => { handleDelete(selectedVehicle.id); setSelectedVehicle(null); }}
                      className="flex-1 flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all"
                    >
                      <Trash2 size={14} /> Excluir
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          );
        })()}
      </AnimatePresence>

      {/* Modal CRUD Veículo */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              className="bg-white dark:bg-slate-800 rounded-[32px] w-full max-w-lg overflow-y-auto max-h-[90vh] shadow-2xl border border-white/20 custom-scrollbar"
            >
              <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between sticky top-0 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md z-10">
                <div>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic">
                    {editingVehicle ? 'Editar Veículo' : 'Novo Veículo'}
                  </h3>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1 opacity-70">Gestão de Garagem AiCondo360</p>
                </div>
                <button onClick={() => setShowModal(false)} className="p-3 bg-slate-100 dark:bg-slate-700 hover:bg-rose-500 hover:text-white rounded-2xl transition-all group">
                  <X size={20} className="group-hover:rotate-90 transition-transform duration-300" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Upload de Foto (Múltiplas - até 5) */}
                <div className="space-y-2">
                  <label className="block text-[8px] font-black text-slate-400 uppercase tracking-widest px-1">
                    Fotos do Veículo (MÁXIMO 5 FOTOS)
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    {formData.images?.map((url, idx) => (
                      <div key={idx} className="relative aspect-square rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                        <img src={url} alt={`Foto ${idx + 1}`} className="w-full h-full object-cover" />
                        {/* Ícones sempre visíveis sobre a foto */}
                        <div className="absolute inset-0 flex flex-col justify-between p-1 bg-black/20">
                          {/* Topo: Visualizar dados */}
                          <button
                            type="button"
                            onClick={() => setPhotoInfoIdx(photoInfoIdx === idx ? null : idx)}
                            title="Ver dados do veículo"
                            className={`self-start p-1 rounded-lg text-white transition-all shadow-md ${
                              photoInfoIdx === idx
                                ? 'bg-blue-600'
                                : 'bg-black/50 hover:bg-blue-600'
                            }`}
                          >
                            <Eye size={10} />
                          </button>
                          {/* Base: Apagar foto */}
                          <button
                            type="button"
                            onClick={() => {
                              const newImages = formData.images.filter((_, i) => i !== idx);
                              setFormData({ ...formData, images: newImages, image_url: newImages[0] || '' });
                              if (photoInfoIdx === idx) setPhotoInfoIdx(null);
                            }}
                            title="Apagar foto"
                            className="self-end p-1 rounded-lg bg-rose-600/80 hover:bg-rose-600 text-white transition-all shadow-md"
                          >
                            <Trash2 size={10} />
                          </button>
                        </div>
                      </div>
                    ))}
                    {(!formData.images || formData.images.length < 5) && (
                      <button
                        type="button"
                        onClick={() => document.getElementById('photo-upload')?.click()}
                        className="aspect-square rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-zinc-500 flex flex-col items-center justify-center text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-all gap-1"
                      >
                        <Plus size={16} />
                        <span className="text-[7px] font-bold uppercase tracking-tight">Adicionar</span>
                      </button>
                    )}
                  </div>
                  <input
                    id="photo-upload"
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleImageUpload}
                  />

                  {/* Painel de dados do veículo ao clicar no olho */}
                  {photoInfoIdx !== null && editingVehicle && (
                    <div className="col-span-5 mt-1 p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/50 rounded-xl">
                      <p className="text-[8px] font-black text-blue-500 uppercase tracking-widest mb-2">Foto {photoInfoIdx + 1} — Dados do Veículo</p>
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <p className="text-[7px] text-slate-400 uppercase tracking-widest">Placa</p>
                          <p className="text-xs font-black text-slate-800 dark:text-white uppercase">{editingVehicle.plate}</p>
                        </div>
                        <div>
                          <p className="text-[7px] text-slate-400 uppercase tracking-widest">Modelo</p>
                          <p className="text-xs font-black text-slate-800 dark:text-white">{editingVehicle.brand} {editingVehicle.model}</p>
                        </div>
                        <div>
                          <p className="text-[7px] text-slate-400 uppercase tracking-widest">Cor</p>
                          <p className="text-xs font-black text-slate-800 dark:text-white">{editingVehicle.color}</p>
                        </div>
                        <div>
                          <p className="text-[7px] text-slate-400 uppercase tracking-widest">Proprietário</p>
                          <p className="text-[10px] font-bold text-slate-700 dark:text-slate-300 truncate">{editingVehicle.owner_name || '-'}</p>
                        </div>
                        <div>
                          <p className="text-[7px] text-slate-400 uppercase tracking-widest">Unidade</p>
                          <p className="text-[10px] font-bold text-slate-700 dark:text-slate-300">{editingVehicle.unit_number || '-'}</p>
                        </div>
                        <div>
                          <p className="text-[7px] text-slate-400 uppercase tracking-widest">Vaga</p>
                          <p className="text-[10px] font-bold text-slate-700 dark:text-slate-300">{editingVehicle.garage_number || '-'}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-6">
                  {/* Seção Principal */}
                  <div>
                    <h4 className="flex items-center gap-2 text-xs font-black text-zinc-900 dark:text-white uppercase tracking-widest mb-4">
                      <Car size={14} /> Dados do Veículo
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="md:col-span-1">
                        <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 px-1">Placa</label>
                        <input 
                          required
                          placeholder="ABC-1234"
                          className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-4 focus:ring-zinc-500/10 focus:border-zinc-500 transition-all font-black uppercase text-center text-sm"
                          value={formData.plate}
                          onChange={e => setFormData({...formData, plate: e.target.value.toUpperCase()})}
                        />
                      </div>
                      <div className="md:col-span-1">
                        <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 px-1">Tipo</label>
                        <select
                          className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-4 focus:ring-zinc-500/10 focus:border-zinc-500 transition-all font-bold appearance-none cursor-pointer"
                          value={formData.type}
                          onChange={e => setFormData({...formData, type: e.target.value as any})}
                        >
                          <option value="car">Carro</option>
                          <option value="motorcycle">Moto</option>
                          <option value="bicycle">Bicicleta</option>
                        </select>
                      </div>
                      <div className="md:col-span-1">
                        <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 px-1">Cor</label>
                        <input 
                          required
                          placeholder="Ex: Prata"
                          className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-4 focus:ring-zinc-500/10 focus:border-zinc-500 transition-all font-bold"
                          value={formData.color}
                          onChange={e => setFormData({...formData, color: e.target.value})}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-3">
                      <div>
                        <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 px-1">Marca</label>
                        <input 
                          required
                          placeholder="Ex: Toyota"
                          className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-4 focus:ring-zinc-500/10 focus:border-zinc-500 transition-all font-bold"
                          value={formData.brand}
                          onChange={e => setFormData({...formData, brand: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 px-1">Modelo</label>
                        <input 
                          required
                          placeholder="Ex: Corolla"
                          className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-4 focus:ring-zinc-500/10 focus:border-zinc-500 transition-all font-bold"
                          value={formData.model}
                          onChange={e => setFormData({...formData, model: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Seção Proprietário e Localização */}
                  <div>
                    <h4 className="flex items-center gap-2 text-xs font-black text-zinc-900 dark:text-white uppercase tracking-widest mb-4">
                      <User size={14} /> Detalhes de Identificação
                    </h4>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 px-1">Proprietário</label>
                        <input 
                          required
                          placeholder="Nome Completo"
                          className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-4 focus:ring-zinc-500/10 focus:border-zinc-500 transition-all font-bold"
                          value={formData.owner_name}
                          onChange={e => setFormData({...formData, owner_name: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 px-1">Vaga</label>
                        <input 
                          placeholder="Ex: G-12"
                          className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-4 focus:ring-zinc-500/10 focus:border-zinc-500 transition-all font-bold text-center"
                          value={formData.garage_number}
                          onChange={e => setFormData({...formData, garage_number: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 px-1">Unidade</label>
                        <input 
                          required
                          placeholder="Ex: 502 B"
                          className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-4 focus:ring-zinc-500/10 focus:border-zinc-500 transition-all font-bold text-center"
                          value={formData.unit_number}
                          onChange={e => setFormData({...formData, unit_number: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Seção Controle Geral de Carros da Unidade */}
                  <div className="border-t border-slate-100 dark:border-slate-700/50 pt-4">
                    <h4 className="flex items-center gap-2 text-xs font-black text-zinc-900 dark:text-white uppercase tracking-widest mb-4">
                      <Shield size={14} /> Controle Geral da Unidade
                    </h4>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="col-span-1">
                        <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 px-1">Qtd Carros</label>
                        <input 
                          type="number"
                          min="1"
                          max="10"
                          required
                          className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-4 focus:ring-zinc-500/10 focus:border-zinc-500 transition-all font-bold text-center text-sm"
                          value={formData.resident_car_qty}
                          onChange={e => setFormData({...formData, resident_car_qty: parseInt(e.target.value) || 1})}
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 px-1">Modelos dos Carros</label>
                        <input 
                          placeholder="Ex: Corolla, Civic"
                          className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-4 focus:ring-zinc-500/10 focus:border-zinc-500 transition-all font-bold"
                          value={formData.resident_car_models}
                          onChange={e => setFormData({...formData, resident_car_models: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Observações */}
                  <div>
                    <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 px-1 flex items-center gap-1">
                      <FileText size={10} /> Observações
                    </label>
                    <textarea 
                      placeholder="Alguma observação importante..."
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[16px] px-4 py-2.5 text-[11px] text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-4 focus:ring-zinc-500/10 focus:border-zinc-500 transition-all font-medium h-20 resize-none"
                      value={formData.observation}
                      onChange={e => setFormData({...formData, observation: e.target.value})}
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-4 sticky bottom-0 bg-white/50 dark:bg-slate-800/50 backdrop-blur-md pb-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-8 py-4 rounded-xl border-2 border-slate-100 dark:border-slate-700 text-slate-500 dark:text-slate-400 font-black uppercase text-[10px] tracking-widest hover:bg-slate-50 dark:hover:bg-slate-900 transition-all"
                  >
                    Descartar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-8 py-4 rounded-xl bg-zinc-900 hover:bg-black text-white font-black uppercase text-[10px] tracking-widest shadow-2xl shadow-zinc-500/40 transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
                  >
                    {editingVehicle ? 'Atualizar' : 'Finalizar'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Info Card */}
      <div className="mt-8 bg-zinc-900 p-6 md:p-8 rounded-[48px] text-white flex flex-col md:flex-row items-center gap-8 shadow-xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-white/5 rounded-full -mr-32 -mt-32 blur-[80px]"></div>
        <div className="bg-white/5 p-5 rounded-[32px] backdrop-blur-xl shrink-0 border border-white/10 shadow-lg">
          <Shield size={32} className="text-zinc-100 animate-pulse" />
        </div>
        <div className="text-center md:text-left flex-1 relative z-10">
          <h4 className="text-xl font-medium mb-3 tracking-tight leading-none uppercase italic">Acesso Inteligente</h4>
          <p className="opacity-70 text-sm leading-relaxed max-w-xl font-medium">
            Mantenha os dados atualizados. A foto auxilia na identificação rápida pela equipe de segurança.
          </p>
        </div>
        <div className="flex flex-col gap-3 shrink-0">
          <button className="bg-white text-zinc-900 hover:bg-zinc-100 px-8 py-4 rounded-[20px] font-medium text-[10px] uppercase tracking-widest transition-all active:scale-95">
            Solicitar Tag Antena
          </button>
        </div>
      </div>
    </div>
  );
};
