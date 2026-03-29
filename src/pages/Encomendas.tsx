import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Package, Search, Calendar, User, Clock, CheckCircle2, AlertCircle, Plus, X, Upload, Smartphone as SmartphoneIcon, Tag } from 'lucide-react';
import { FeatureHeader } from '../components/FeatureHeader';
import { PackageService, Encomenda as BaseEncomenda } from '../services/supabaseService';

interface Encomenda extends BaseEncomenda {
  resident_name?: string;
  resident_whatsapp?: string;
  image_url?: string;
}

interface EncomendasProps {
  userId: string;
  userRole?: string;
}

export const Encomendas: React.FC<EncomendasProps> = ({ userId, userRole }) => {
  const [packages, setPackages] = useState<Encomenda[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'delivered'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Controle de Permissão
  const canManage = userRole === 'admin' || userRole === 'syndic' || userRole === 'global_admin';

  // Admin Form State
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    description: '',
    resident_name: '',
    resident_whatsapp: '',
    status: 'pending' as 'pending' | 'delivered',
    image_url: ''
  });

  useEffect(() => {
    const fetchPackages = async () => {
      setLoading(true);
      try {
        const data = await PackageService.getUserPackages(userId);
        
        // Dados Mocks para Visualização caso a API ainda não suporte os novos campos
        if (data.length === 0) {
          setPackages([
            {
              id: 'mock-1',
              description: 'Caixa Amazon',
              arrival_date: new Date().toISOString(),
              status: 'pending',
              resident_name: 'Carlos Oliveira',
              resident_whatsapp: '11999999999',
            } as Encomenda
          ]);
        } else {
          setPackages(data as Encomenda[]);
        }
      } catch (error) {
        console.error('Error fetching packages:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPackages();
  }, [userId]);

  const filteredPackages = packages.filter(pkg => {
    const matchesFilter = filter === 'all' || 
                         (filter === 'pending' && pkg.status === 'pending') ||
                         (filter === 'delivered' && pkg.status === 'delivered');
    const matchesSearch = pkg.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          pkg.tracking_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          pkg.resident_name?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1024 * 1024) {
      alert('A imagem deve ter no máximo 1MB.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(prev => ({ ...prev, image_url: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const handleSavePackage = (e: React.FormEvent) => {
    e.preventDefault();
    const novaEncomenda: Encomenda = {
      id: Math.random().toString(36).substring(7),
      description: formData.description,
      status: formData.status,
      arrival_date: new Date().toISOString(),
      resident_name: formData.resident_name,
      resident_whatsapp: formData.resident_whatsapp,
      image_url: formData.image_url,
      user_id: userId, // associando ao criador para fins de listagem fake
      condominio_id: 'fake-condo'
    };

    setPackages([novaEncomenda, ...packages]);
    setShowForm(false);
    setFormData({
      description: '',
      resident_name: '',
      resident_whatsapp: '',
      status: 'pending',
      image_url: ''
    });
  };

  return (
    <div className="max-w-6xl mx-auto py-6 px-4">
      <FeatureHeader 
        icon={Package}
        title="Encomendas e Correspondências"
        description="Acompanhe a chegada de suas encomendas e correspondências na portaria."
        color="bg-orange-600"
      />

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text"
            placeholder="Buscar por descrição, código ou morador..."
            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all font-medium text-sm text-slate-700 dark:text-slate-300"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex flex-wrap gap-3">
          <div className="flex bg-white dark:bg-slate-800 p-1 rounded-2xl border border-slate-100 dark:border-slate-700">
            <button 
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${filter === 'all' ? 'bg-orange-600 text-white shadow-lg shadow-orange-500/20' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
            >
              Todas
            </button>
            <button 
              onClick={() => setFilter('pending')}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${filter === 'pending' ? 'bg-orange-600 text-white shadow-lg shadow-orange-500/20' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
            >
              Pendentes
            </button>
            <button 
              onClick={() => setFilter('delivered')}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${filter === 'delivered' ? 'bg-orange-600 text-white shadow-lg shadow-orange-500/20' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
            >
              Entregues
            </button>
          </div>
          
          {canManage && (
            <button 
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-5 py-2.5 rounded-2xl font-bold transition-all shadow-xl shadow-orange-500/20 hover:scale-105 shrink-0"
            >
              <Plus size={20} />
              <span className="hidden lg:inline">Registrar Encomenda</span>
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(id => (
            <div key={id} className="bg-white dark:bg-slate-800 p-6 rounded-[32px] h-64 animate-pulse border border-slate-100 dark:border-slate-700"></div>
          ))}
        </div>
      ) : filteredPackages.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AnimatePresence>
            {filteredPackages.map((pkg) => (
              <motion.div
                key={pkg.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white dark:bg-slate-800 rounded-[32px] border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-xl hover:shadow-orange-500/10 transition-all group flex flex-col overflow-hidden"
              >
                {/* Imagem da Encomenda (se existir) */}
                {pkg.image_url && (
                  <div className="w-full h-32 bg-slate-100 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-700">
                    <img src={pkg.image_url} alt="Foto da Encomenda" className="w-full h-full object-cover" />
                  </div>
                )}
                
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex justify-between items-start mb-4">
                    <div className={`p-3 rounded-2xl flex items-center justify-center ${pkg.status === 'pending' ? 'bg-orange-100 text-orange-600' : 'bg-emerald-100 text-emerald-600'}`}>
                      {pkg.status === 'pending' ? <Package size={24} /> : <CheckCircle2 size={24} />}
                    </div>
                    <div className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1 ${pkg.status === 'pending' ? 'bg-orange-100 text-orange-600' : 'bg-emerald-100 text-emerald-600'}`}>
                      {pkg.status === 'pending' ? (
                        <>
                          <AlertCircle size={12} /> Para Retirar
                        </>
                      ) : (
                        <>
                          <CheckCircle2 size={12} /> Entregue
                        </>
                      )}
                    </div>
                  </div>

                  <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-2 group-hover:text-orange-600 transition-colors line-clamp-2">
                    {pkg.description}
                  </h3>

                  <div className="space-y-3 mb-6 flex-1">
                    {pkg.resident_name && (
                      <div className="flex items-center gap-3 text-sm text-slate-500 font-medium">
                        <User size={16} className="text-slate-400" />
                        <span>Morador: {pkg.resident_name}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-3 text-sm text-slate-500">
                      <Calendar size={16} className="text-slate-400" />
                      <span>Chegou em: {new Date(pkg.arrival_date).toLocaleDateString('pt-BR')}</span>
                    </div>
                    {pkg.tracking_code && (
                      <div className="flex items-center gap-3 text-sm text-slate-500">
                        <Tag size={16} className="text-slate-400" />
                        <span>Cód: {pkg.tracking_code}</span>
                      </div>
                    )}
                  </div>

                  {/* Ação: Botão WhatsApp e Rodapé */}
                  <div className="pt-4 border-t border-slate-50 dark:border-slate-700/50 flex flex-col gap-3">
                    {pkg.resident_whatsapp && (
                      <a 
                        href={`https://wa.me/${pkg.resident_whatsapp.replace(/\D/g, '')}?text=Olá,%20sua%20encomenda%20chegou%20na%20portaria!`}
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="w-full bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#25D366] py-2.5 rounded-2xl font-bold flex justify-center items-center gap-2 transition-colors text-sm"
                      >
                         <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                        </svg>
                        Avisar Morador
                      </a>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700">
          <div className="bg-slate-50 dark:bg-slate-900 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Package size={40} className="text-slate-300" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Nenhuma encomenda encontrada</h3>
          <p className="text-slate-500 max-w-md mx-auto">
            Você não possui encomendas {filter === 'pending' ? 'para retirar' : filter === 'delivered' ? 'retiradas' : ''} no momento.
          </p>
        </div>
      )}

      {/* Modal - Cadastrar/Scanear Encomenda */}
      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between sticky top-0 bg-white dark:bg-slate-800 z-10">
                <h3 className="text-xl font-bold dark:text-white flex items-center gap-2">
                  <Package className="text-orange-500" /> Registrar Nova Encomenda
                </h3>
                <button onClick={() => setShowForm(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors">
                  <X size={24} className="text-slate-400" />
                </button>
              </div>
              
              <form onSubmit={handleSavePackage} className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                    O que é? (Descrição) *
                  </label>
                  <input 
                    required
                    maxLength={60}
                    placeholder="Ex: Caixa Sedex, Pacote Amazon..."
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500 font-medium"
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                      Nome do Morador/Destinatário *
                    </label>
                    <input 
                      required
                      placeholder="Ex: João Silva (Apt 101)"
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500 font-medium"
                      value={formData.resident_name}
                      onChange={e => setFormData({...formData, resident_name: e.target.value})}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                      WhatsApp do Morador
                    </label>
                    <input 
                      type="tel"
                      placeholder="Ex: 11999999999"
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500 font-medium"
                      value={formData.resident_whatsapp}
                      onChange={e => setFormData({...formData, resident_whatsapp: e.target.value.replace(/\D/g, '')})}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                    Foto ou Escaneamento da Encomenda
                  </label>
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-200 dark:border-slate-700 border-dashed rounded-2xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors relative overflow-hidden group">
                    {formData.image_url ? (
                      <img src={formData.image_url} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-8 h-8 mb-3 text-orange-400 group-hover:scale-110 transition-transform" />
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-center px-4">
                          Clique para abrir câmera ou selecionar arquivo
                        </p>
                        <p className="text-[10px] text-slate-400 mt-1">Máx 1MB</p>
                      </div>
                    )}
                    <input 
                      type="file" 
                      className="hidden" 
                      accept="image/*"
                      capture="environment"
                      onChange={handleImageUpload}
                    />
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                    Status Atual
                  </label>
                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => setFormData({...formData, status: 'pending'})}
                      className={`flex-1 py-3 px-4 rounded-xl border flex items-center justify-center gap-2 font-bold transition-all ${
                        formData.status === 'pending' 
                        ? 'border-orange-500 bg-orange-50 dark:bg-orange-500/10 text-orange-600' 
                        : 'border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 bg-transparent hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <Package size={18} /> Pendente
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({...formData, status: 'delivered'})}
                      className={`flex-1 py-3 px-4 rounded-xl border flex items-center justify-center gap-2 font-bold transition-all ${
                        formData.status === 'delivered' 
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600' 
                        : 'border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 bg-transparent hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <CheckCircle2 size={18} /> Entregue
                    </button>
                  </div>
                </div>

                <div className="flex gap-3 pt-6 border-t border-slate-100 dark:border-slate-700">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="flex-1 px-6 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white font-bold transition-colors shadow-lg shadow-orange-500/20"
                  >
                    Registrar Encomenda
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
