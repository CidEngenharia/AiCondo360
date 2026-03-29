import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Car, Search, Plus, X, Edit2, Trash2, Shield, Info, CreditCard, Camera, User, Hash, FileText } from 'lucide-react';
import { FeatureHeader } from '../components/FeatureHeader';
import { VehicleService, Veiculo as IVeiculo } from '../services/supabaseService';

interface GaragemProps {
  userId: string;
  condoId: string;
}

export const Garagem: React.FC<GaragemProps> = ({ userId, condoId }) => {
  const [vehicles, setVehicles] = useState<IVeiculo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal State
  const [showModal, setShowModal] = useState(false);
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
    type: 'car' as 'car' | 'motorcycle' | 'bicycle'
  });

  useEffect(() => {
    fetchVehicles();
  }, [userId]);

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const data = await VehicleService.getUserVehicles(userId);
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
        type: vehicle.type
      });
    } else {
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
        type: 'car'
      });
    }
    setShowModal(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Simulação de upload gerando uma URL temporária do objeto
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, image_url: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingVehicle) {
        await VehicleService.updateVehicle(editingVehicle.id, formData);
      } else {
        await VehicleService.createVehicle({
          ...formData,
          user_id: userId,
          condominio_id: condoId
        });
      }
      setShowModal(false);
      fetchVehicles();
    } catch (error) {
      console.error('Error saving vehicle:', error);
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
          className="flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-900 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-zinc-500/20 hover:scale-105 active:scale-95"
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredVehicles.map((vehicle) => (
              <motion.div
                key={vehicle.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white dark:bg-slate-800 rounded-[32px] border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-xl hover:shadow-zinc-500/5 transition-all group overflow-hidden flex flex-col"
              >
                {/* Imagem do Veículo */}
                <div className="h-48 bg-slate-100 dark:bg-slate-900 relative overflow-hidden group-hover:brightness-110 transition-all">
                  {vehicle.image_url ? (
                    <img src={vehicle.image_url} alt={vehicle.model} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 dark:text-slate-700">
                      <Car size={64} strokeWidth={1} />
                      <span className="text-[10px] font-black uppercase tracking-widest mt-2">Sem Foto</span>
                    </div>
                  )}
                  
                  {/* Botões de Ação sobre a imagem */}
                  <div className="absolute top-4 right-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                    <button 
                      onClick={() => handleOpenModal(vehicle)}
                      className="p-3 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md text-slate-600 dark:text-slate-300 hover:text-zinc-900 dark:hover:text-white rounded-2xl shadow-xl transition-all"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      onClick={() => handleDelete(vehicle.id)}
                      className="p-3 bg-rose-500/90 backdrop-blur-md text-white hover:bg-rose-600 rounded-2xl shadow-xl transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

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

                <div className="p-6">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-black text-2xl text-slate-900 dark:text-white uppercase tracking-tighter">
                      {vehicle.plate}
                    </h3>
                  </div>
                  
                  <p className="text-sm font-bold text-slate-500 mb-4">
                    {vehicle.brand} {vehicle.model} • <span className="opacity-70">{vehicle.color}</span>
                  </p>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400">
                      <div className="w-6 h-6 rounded-lg bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
                        <User size={12} />
                      </div>
                      <span className="opacity-70">Proprietário:</span> {vehicle.owner_name}
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                       <div className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400">
                        <div className="w-6 h-6 rounded-lg bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
                          <Car size={12} />
                        </div>
                        <span className="opacity-70">Garagem:</span> {vehicle.garage_number || 'N/A'}
                      </div>
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400">
                        <div className="w-6 h-6 rounded-lg bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
                          <Hash size={12} />
                        </div>
                        <span className="opacity-70">Und:</span> {vehicle.unit_number || 'N/A'}
                      </div>
                    </div>

                    {vehicle.observation && (
                      <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-700/50">
                        <p className="text-[10px] text-zinc-500 italic leading-relaxed">
                          "{vehicle.observation}"
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="px-6 py-4 bg-slate-50/50 dark:bg-slate-900/30 border-t border-slate-100 dark:border-slate-700/50 mt-auto flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-emerald-500">
                    <Shield size={12} className="fill-emerald-500/10" />
                    Status: Ativo
                  </div>
                  <div className="text-[10px] font-bold text-slate-400">
                    ID: #{vehicle.id.slice(0, 4)}
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

      {/* Modal CRUD Veículo */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              className="bg-white dark:bg-slate-800 rounded-[48px] w-full max-w-2xl overflow-y-auto max-h-[95vh] shadow-2xl border border-white/20 custom-scrollbar"
            >
              <div className="p-8 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between sticky top-0 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md z-10">
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

              <form onSubmit={handleSubmit} className="p-8 space-y-8">
                {/* Upload de Foto */}
                <div className="relative group">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-1">Foto do Veículo</label>
                  <div className="relative h-56 rounded-[32px] overflow-hidden bg-slate-50 dark:bg-slate-900 border-2 border-dashed border-slate-200 dark:border-slate-700 group-hover:border-zinc-500 transition-all">
                    {formData.image_url ? (
                      <>
                        <img src={formData.image_url} alt="Preview" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-4">
                           <button 
                            type="button"
                            onClick={() => document.getElementById('photo-upload')?.click()}
                            className="p-4 bg-white rounded-full text-zinc-900 shadow-xl transition-all hover:scale-110"
                          >
                            <Camera size={24} />
                          </button>
                          <button 
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, image_url: '' }))}
                            className="p-4 bg-rose-500 rounded-full text-white shadow-xl transition-all hover:scale-110"
                          >
                            <Trash2 size={24} />
                          </button>
                        </div>
                      </>
                    ) : (
                      <button 
                        type="button"
                        onClick={() => document.getElementById('photo-upload')?.click()}
                        className="w-full h-full flex flex-col items-center justify-center gap-4 hover:bg-slate-100/50 dark:hover:bg-slate-800/50 transition-all"
                      >
                        <div className="p-6 bg-white dark:bg-slate-800 rounded-[32px] shadow-xl text-slate-400">
                          <Camera size={40} strokeWidth={1.5} />
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-black text-slate-700 dark:text-slate-300 tracking-tight">Cliqu para fazer upload</p>
                          <p className="text-xs font-bold text-slate-400">Formatos: JPG, PNG • Max 5MB</p>
                        </div>
                      </button>
                    )}
                    <input 
                      id="photo-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Seção Principal */}
                  <div>
                    <h4 className="flex items-center gap-2 text-xs font-black text-zinc-900 dark:text-white uppercase tracking-widest mb-4">
                      <Car size={14} /> Dados do Veículo
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="md:col-span-1">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 px-1">Placa</label>
                        <input 
                          required
                          placeholder="ABC-1234"
                          className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-4 text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-4 focus:ring-zinc-500/10 focus:border-zinc-500 transition-all font-black uppercase text-center text-lg"
                          value={formData.plate}
                          onChange={e => setFormData({...formData, plate: e.target.value.toUpperCase()})}
                        />
                      </div>
                      <div className="md:col-span-1">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 px-1">Tipo</label>
                        <select
                          className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-4 text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-4 focus:ring-zinc-500/10 focus:border-zinc-500 transition-all font-bold appearance-none cursor-pointer"
                          value={formData.type}
                          onChange={e => setFormData({...formData, type: e.target.value as any})}
                        >
                          <option value="car">Carro</option>
                          <option value="motorcycle">Moto</option>
                          <option value="bicycle">Bicicleta</option>
                        </select>
                      </div>
                      <div className="md:col-span-1">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 px-1">Cor</label>
                        <input 
                          required
                          placeholder="Ex: Prata"
                          className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-4 text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-4 focus:ring-zinc-500/10 focus:border-zinc-500 transition-all font-bold"
                          value={formData.color}
                          onChange={e => setFormData({...formData, color: e.target.value})}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 px-1">Marca</label>
                        <input 
                          required
                          placeholder="Ex: Toyota"
                          className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-4 text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-4 focus:ring-zinc-500/10 focus:border-zinc-500 transition-all font-bold"
                          value={formData.brand}
                          onChange={e => setFormData({...formData, brand: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 px-1">Modelo</label>
                        <input 
                          required
                          placeholder="Ex: Corolla"
                          className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-4 text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-4 focus:ring-zinc-500/10 focus:border-zinc-500 transition-all font-bold"
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
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="md:col-span-1">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 px-1">Proprietário</label>
                        <input 
                          required
                          placeholder="Nome Completo"
                          className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-4 text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-4 focus:ring-zinc-500/10 focus:border-zinc-500 transition-all font-bold"
                          value={formData.owner_name}
                          onChange={e => setFormData({...formData, owner_name: e.target.value})}
                        />
                      </div>
                      <div className="md:col-span-1">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 px-1">Vaga Garagem</label>
                        <input 
                          placeholder="Ex: G-12"
                          className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-4 text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-4 focus:ring-zinc-500/10 focus:border-zinc-500 transition-all font-bold"
                          value={formData.garage_number}
                          onChange={e => setFormData({...formData, garage_number: e.target.value})}
                        />
                      </div>
                      <div className="md:col-span-1">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 px-1">Unidade / Ap</label>
                        <input 
                          required
                          placeholder="Ex: 502 Bloco B"
                          className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-4 text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-4 focus:ring-zinc-500/10 focus:border-zinc-500 transition-all font-bold"
                          value={formData.unit_number}
                          onChange={e => setFormData({...formData, unit_number: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Observações */}
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 px-1 flex items-center gap-1">
                      <FileText size={10} /> Observações Internas
                    </label>
                    <textarea 
                      placeholder="Alguma observação importante sobre o veículo, avarias ou acessos..."
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[24px] px-5 py-4 text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-4 focus:ring-zinc-500/10 focus:border-zinc-500 transition-all font-medium h-32 resize-none"
                      value={formData.observation}
                      onChange={e => setFormData({...formData, observation: e.target.value})}
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-4 sticky bottom-0 bg-white/50 dark:bg-slate-800/50 backdrop-blur-md pb-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-8 py-5 rounded-[24px] border-2 border-slate-100 dark:border-slate-700 text-slate-500 dark:text-slate-400 font-black uppercase text-xs tracking-widest hover:bg-slate-50 dark:hover:bg-slate-900 transition-all"
                  >
                    Descartar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-8 py-5 rounded-[24px] bg-zinc-900 hover:bg-black text-white font-black uppercase text-xs tracking-widest shadow-2xl shadow-zinc-500/40 transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
                  >
                    {editingVehicle ? 'Atualizar Registro' : 'Finalizar Cadastro'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Info Card */}
      <div className="mt-16 bg-gradient-to-br from-zinc-800 to-zinc-950 p-10 md:p-16 rounded-[64px] text-white flex flex-col md:flex-row items-center gap-12 shadow-2xl shadow-zinc-500/10 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/5 rounded-full -mr-40 -mt-40 blur-[100px] transition-all duration-700 group-hover:bg-white/10"></div>
        <div className="bg-white/10 p-8 rounded-[40px] backdrop-blur-xl shrink-0 border border-white/20 shadow-2xl">
          <Shield size={64} className="text-zinc-100 animate-pulse" />
        </div>
        <div className="text-center md:text-left flex-1 relative z-10">
          <h4 className="text-4xl font-black mb-6 tracking-tighter leading-none uppercase italic">Acesso Inteligente</h4>
          <p className="opacity-80 text-lg leading-relaxed max-w-2xl font-medium">
            Mantenha os dados dos seus veículos e proprietários sempre atualizados. A foto do veículo auxilia na pronta identificação pela equipe de segurança e inteligência de portaria.
          </p>
        </div>
        <div className="flex flex-col gap-4 shrink-0">
          <div className="flex items-center gap-3 text-xs font-black text-zinc-400 uppercase tracking-widest mb-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></div>
            Sincronizado com CRM
          </div>
          <button className="bg-white text-zinc-900 hover:bg-zinc-100 px-10 py-6 rounded-[28px] font-black text-xs uppercase tracking-widest transition-all shadow-xl hover:scale-105 active:scale-95">
            Solicitar Tag Antena
          </button>
        </div>
      </div>
    </div>
  );
};
