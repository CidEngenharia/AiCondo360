import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Car, Search, Plus, X, Edit2, Trash2, Shield, Info, CreditCard } from 'lucide-react';
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
        type: vehicle.type
      });
    } else {
      setEditingVehicle(null);
      setFormData({
        brand: '',
        model: '',
        plate: '',
        color: '',
        type: 'car'
      });
    }
    setShowModal(true);
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
    v.plate.toLowerCase().includes(searchTerm.toLowerCase())
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
            placeholder="Buscar por placa, marca ou modelo..."
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
            <div key={id} className="bg-white dark:bg-slate-800 p-6 rounded-[32px] h-48 animate-pulse border border-slate-100 dark:border-slate-700"></div>
          ))}
        </div>
      ) : filteredVehicles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredVehicles.map((vehicle) => (
              <motion.div
                key={vehicle.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white dark:bg-slate-800 p-6 rounded-[32px] border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-xl hover:shadow-zinc-500/5 transition-all group relative overflow-hidden"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="p-4 rounded-3xl bg-zinc-100 dark:bg-zinc-800/50 text-zinc-600 dark:text-zinc-400">
                    <Car size={24} />
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={() => handleOpenModal(vehicle)}
                      className="p-2 text-slate-400 hover:text-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-500/10 rounded-xl transition-all"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      onClick={() => handleDelete(vehicle.id)}
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="mb-4">
                  <h3 className="font-bold text-xl text-slate-900 dark:text-white uppercase tracking-tight">
                    {vehicle.plate}
                  </h3>
                  <p className="text-sm font-medium text-slate-500">
                    {vehicle.brand} {vehicle.model} • <span className="text-zinc-500">{vehicle.color}</span>
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-50 dark:border-slate-700/50 flex items-center justify-between">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                    vehicle.type === 'car' ? 'bg-blue-100 text-blue-600' :
                    vehicle.type === 'motorcycle' ? 'bg-orange-100 text-orange-600' :
                    'bg-emerald-100 text-emerald-600'
                  }`}>
                    {vehicle.type === 'car' ? 'Carro' : vehicle.type === 'motorcycle' ? 'Moto' : 'Bicicleta'}
                  </span>
                  
                  <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
                    <Shield size={12} />
                    Liberado
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-[48px] border border-dashed border-slate-200 dark:border-slate-700 shadow-inner">
          <div className="bg-slate-50 dark:bg-slate-900/50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
            <Car size={48} className="text-slate-300" />
          </div>
          <h3 className="text-2xl font-black text-slate-800 dark:text-white mb-2 tracking-tight">Sua garagem está vazia</h3>
          <p className="text-slate-500 max-w-sm mx-auto font-medium">
            Cadastre seus veículos para facilitar a identificação e o acesso automático ao condomínio.
          </p>
        </div>
      )}

      {/* Modal CRUD Veículo */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white dark:bg-slate-800 rounded-[40px] w-full max-w-lg overflow-y-auto max-h-[90vh] shadow-2xl custom-scrollbar"
            >
              <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between sticky top-0 bg-white dark:bg-slate-800 z-10">
                <div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                    {editingVehicle ? 'Editar Veículo' : 'Novo Veículo'}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">Informe os detalhes do veículo</p>
                </div>
                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-all">
                  <X size={20} className="text-slate-400" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 px-1">Placa</label>
                    <input 
                      required
                      placeholder="ABC-1234"
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-4 focus:ring-zinc-500/10 focus:border-zinc-500 transition-all font-bold uppercase"
                      value={formData.plate}
                      onChange={e => setFormData({...formData, plate: e.target.value.toUpperCase()})}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 px-1">Tipo</label>
                    <select
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-4 focus:ring-zinc-500/10 focus:border-zinc-500 transition-all font-bold appearance-none"
                      value={formData.type}
                      onChange={e => setFormData({...formData, type: e.target.value as any})}
                    >
                      <option value="car">Carro</option>
                      <option value="motorcycle">Moto</option>
                      <option value="bicycle">Bicicleta</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 px-1">Marca</label>
                    <input 
                      required
                      placeholder="Ex: Toyota"
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-4 focus:ring-zinc-500/10 focus:border-zinc-500 transition-all font-bold"
                      value={formData.brand}
                      onChange={e => setFormData({...formData, brand: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 px-1">Modelo</label>
                    <input 
                      required
                      placeholder="Ex: Corolla"
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-4 focus:ring-zinc-500/10 focus:border-zinc-500 transition-all font-bold"
                      value={formData.model}
                      onChange={e => setFormData({...formData, model: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 px-1">Cor</label>
                  <input 
                    required
                    placeholder="Ex: Prata"
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-4 focus:ring-zinc-500/10 focus:border-zinc-500 transition-all font-bold"
                    value={formData.color}
                    onChange={e => setFormData({...formData, color: e.target.value})}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-6 py-4 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-black uppercase text-[10px] tracking-widest hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-4 rounded-2xl bg-zinc-800 hover:bg-zinc-900 text-white font-black uppercase text-[10px] tracking-widest shadow-lg shadow-zinc-500/30 transition-all hover:scale-[1.02]"
                  >
                    {editingVehicle ? 'Salvar Alterações' : 'Cadastrar Veículo'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Info Card */}
      <div className="mt-12 bg-zinc-900 p-8 md:p-12 rounded-[48px] text-white flex flex-col md:flex-row items-center gap-10 shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full -mr-40 -mt-40 blur-3xl transition-all duration-700 group-hover:bg-white/10"></div>
        <div className="bg-white/10 p-5 rounded-[32px] backdrop-blur-md shrink-0 border border-white/20">
          <Info size={48} className="text-zinc-400" />
        </div>
        <div className="text-center md:text-left flex-1 relative z-10">
          <h4 className="text-2xl font-black mb-4 tracking-tight">Segurança e Agilidade</h4>
          <p className="opacity-70 text-sm leading-relaxed max-w-xl font-medium">
            Mantenha os dados dos seus veículos atualizados para garantir o reconhecimento automático na portaria e receber alertas importantes sobre sua vaga de garagem.
          </p>
        </div>
        <div className="flex flex-col gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">
            <CreditCard size={14} /> Tag de Acesso
          </div>
          <button className="bg-zinc-800 hover:bg-zinc-700 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all border border-zinc-700">
            Solicitar Tag
          </button>
        </div>
      </div>
    </div>
  );
};
