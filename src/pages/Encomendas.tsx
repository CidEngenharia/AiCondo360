import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Package, Search, Calendar, User, CheckCircle2, AlertCircle, Plus, X, Upload, Tag, Maximize2, Trash2 } from 'lucide-react';
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

// Helper to compress image
const compressImage = (base64Str: string, maxWidth = 400, maxHeight = 400): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = base64Str;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > maxWidth) {
          height *= maxWidth / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width *= maxHeight / height;
          height = maxHeight;
        }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', 0.7)); // 0.7 quality
    };
  });
};

export const Encomendas: React.FC<EncomendasProps> = ({ userId, userRole }) => {
  const [packages, setPackages] = useState<Encomenda[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'delivered'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  
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

    const reader = new FileReader();
    reader.onloadend = async () => {
      const compressed = await compressImage(reader.result as string);
      setFormData(prev => ({ ...prev, image_url: compressed }));
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
      user_id: userId,
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
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white dark:bg-slate-800 rounded-[32px] border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-xl hover:shadow-orange-500/10 transition-all group flex flex-col relative"
              >
                {/* Imagem "Balão" da Encomenda */}
                {pkg.image_url && (
                  <div className="absolute top-4 right-4 z-10">
                    <button 
                      onClick={() => setSelectedImageUrl(pkg.image_url!)}
                      className="relative w-16 h-16 rounded-full border-4 border-white dark:border-slate-700 shadow-xl overflow-hidden hover:scale-110 transition-transform active:scale-95 group/img"
                    >
                      <img src={pkg.image_url} alt="Thumbnail" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                        <Maximize2 size={16} className="text-white" />
                      </div>
                    </button>
                  </div>
                )}
                
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex justify-between items-start mb-4 pr-16">
                    <div className={`p-3 rounded-2xl flex items-center justify-center ${pkg.status === 'pending' ? 'bg-orange-100 text-orange-600' : 'bg-emerald-100 text-emerald-600'}`}>
                      {pkg.status === 'pending' ? <Package size={24} /> : <CheckCircle2 size={24} />}
                    </div>
                  </div>

                  <div className={`inline-flex px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest items-center gap-1 mb-3 ${pkg.status === 'pending' ? 'bg-orange-100 text-orange-600' : 'bg-emerald-100 text-emerald-600'}`}>
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
                  <div className="pt-4 border-t border-slate-50 dark:border-slate-700/50 flex flex-col gap-3 font-bold">
                    {pkg.resident_whatsapp && (
                      <a 
                        href={`https://wa.me/${pkg.resident_whatsapp.replace(/\D/g, '')}?text=Olá%20${pkg.resident_name},%20sua%20encomenda%20(${pkg.description})%20chegou%20na%20portaria!`}
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="w-full bg-[#25D366] text-white py-3 rounded-2xl flex justify-center items-center gap-2 hover:brightness-110 active:scale-[0.98] transition-all text-sm shadow-lg shadow-emerald-500/20"
                      >
                         <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                        </svg>
                        Notificar Morador
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

      {/* Modal - Cadastrar Encomenda */}
      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white dark:bg-slate-800 rounded-[40px] w-full max-w-xl overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="p-8 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between sticky top-0 bg-white dark:bg-slate-800 z-10">
                <div>
                    <h3 className="text-2xl font-black dark:text-white tracking-tighter uppercase italic flex items-center gap-2">
                    <Package className="text-orange-500" /> Registrar Encomenda
                    </h3>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Gestão de Portaria AiCondo360</p>
                </div>
                <button onClick={() => setShowForm(false)} className="p-3 bg-slate-50 dark:bg-slate-700 hover:bg-rose-500 hover:text-white rounded-2xl transition-all group">
                  <X size={20} className="group-hover:rotate-90 transition-all" />
                </button>
              </div>
              
              <form onSubmit={handleSavePackage} className="p-8 space-y-8">
                 {/* Upload e Compressão de Foto */}
                 <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-1">Foto da Encomenda</label>
                    <div className="relative group h-48 rounded-[32px] overflow-hidden bg-slate-50 dark:bg-slate-900 border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-orange-500 transition-all">
                        {formData.image_url ? (
                            <>
                                <img src={formData.image_url} alt="Preview" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                                     <button 
                                        type="button"
                                        onClick={() => document.getElementById('camera-input')?.click()}
                                        className="p-4 bg-white rounded-full text-zinc-900 shadow-xl transition-all hover:scale-110"
                                    >
                                        <Upload size={24} />
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={() => setFormData({ ...formData, image_url: '' })}
                                        className="p-4 bg-rose-500 rounded-full text-white shadow-xl transition-all hover:scale-110"
                                    >
                                        <Trash2 size={24} />
                                    </button>
                                </div>
                            </>
                        ) : (
                            <button 
                                type="button"
                                onClick={() => document.getElementById('camera-input')?.click()}
                                className="w-full h-full flex flex-col items-center justify-center gap-2"
                            >
                                <Upload size={32} className="text-orange-400" />
                                <span className="text-sm font-black text-slate-700 dark:text-slate-300 uppercase tracking-tight">Tirar Foto do Pacote</span>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Otmização automática ativada</span>
                            </button>
                        )}
                        <input id="camera-input" type="file" className="hidden" accept="image/*" capture="environment" onChange={handleImageUpload} />
                    </div>
                </div>

                <div className="space-y-6">
                    <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 px-1">O que chegou? (Descrição)</label>
                    <input 
                        required
                        placeholder="Ex: Pacote Mercado Livre, Caixa Amazon..."
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-4 text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all font-bold"
                        value={formData.description}
                        onChange={e => setFormData({...formData, description: e.target.value})}
                    />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 px-1">Nome do Morador</label>
                            <input 
                                required
                                placeholder="Nome ou Unidade"
                                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-4 text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all font-bold"
                                value={formData.resident_name}
                                onChange={e => setFormData({...formData, resident_name: e.target.value})}
                            />
                        </div>

                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 px-1">WhatsApp Ativo (Notificações)</label>
                            <input 
                                type="tel"
                                placeholder="11999999999"
                                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-4 text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all font-bold"
                                value={formData.resident_whatsapp}
                                onChange={e => setFormData({...formData, resident_whatsapp: e.target.value.replace(/\D/g, '')})}
                            />
                        </div>
                    </div>
                </div>

                <div className="flex gap-4 pt-6">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="flex-1 px-8 py-5 rounded-[24px] border-2 border-slate-100 dark:border-slate-700 text-slate-500 dark:text-slate-400 font-black uppercase text-xs tracking-widest hover:bg-slate-50 dark:hover:bg-slate-900 transition-all"
                  >
                    Descartar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-8 py-5 rounded-[24px] bg-orange-600 hover:bg-orange-700 text-white font-black uppercase text-xs tracking-widest shadow-2xl shadow-orange-500/40 transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
                  >
                    Salvar e Notificar
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal Zoom Foto */}
      <AnimatePresence>
          {selectedImageUrl && (
              <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-xl" onClick={() => setSelectedImageUrl(null)}>
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="relative max-w-4xl w-full h-[80vh] bg-white dark:bg-slate-900 rounded-[48px] overflow-hidden p-2 shadow-2xl"
                    onClick={e => e.stopPropagation()}
                  >
                      <button onClick={() => setSelectedImageUrl(null)} className="absolute top-6 right-6 p-4 bg-black/50 hover:bg-rose-500 text-white rounded-full z-10 transition-all">
                        <X size={24} />
                      </button>
                      <img src={selectedImageUrl} alt="Zoom" className="w-full h-full object-contain rounded-[40px]" />
                  </motion.div>
              </div>
          )}
      </AnimatePresence>
    </div>
  );
};
