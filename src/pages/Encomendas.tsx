import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Package, Search, Calendar, User, CheckCircle2, AlertCircle, Plus, X, Upload, Tag, Maximize2, Trash2, Edit2, FileText, Download, Eye, ArrowLeftRight } from 'lucide-react';
import { FeatureHeader } from '../components/Header';
import { PackageService, Encomenda as BaseEncomenda } from '../services/supabaseService';

interface Encomenda extends BaseEncomenda {
  resident_name?: string;
  resident_whatsapp?: string;
  image_url?: string;
  observation?: string;
  tracking_code?: string;
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
  const [filter, setFilter] = useState<'all' | 'pending' | 'delivered' | 'returned'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<Encomenda | null>(null);
  const [showReportModal, setShowReportModal] = useState<{show: boolean, days: number}>({show: false, days: 0});
  
  // Controle de Permissão
  const canManage = userRole === 'admin' || userRole === 'syndic' || userRole === 'global_admin';

  // Admin Form State
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    description: '',
    resident_name: '',
    resident_whatsapp: '',
    status: 'pending' as 'pending' | 'delivered' | 'returned',
    image_url: '',
    observation: ''
  });

  useEffect(() => {
    fetchPackages();
  }, [userId]);

  const fetchPackages = async () => {
    setLoading(true);
    try {
      const data = await PackageService.getUserPackages(userId);
      
      // Fallback para mocks se necessário (ajustando nomes de campos)
      const mappedData = data.map(pkg => ({
        ...pkg,
        image_url: pkg.image_url || pkg.photo_url // suporte a ambos
      }));

      if (mappedData.length === 0) {
        setPackages([
          {
            id: 'mock-1',
            description: 'Caixa Amazon',
            arrival_date: new Date().toISOString(),
            status: 'pending',
            resident_name: 'Carlos Oliveira',
            resident_whatsapp: '21999999999',
          } as Encomenda
        ]);
      } else {
        setPackages(mappedData as Encomenda[]);
      }
    } catch (error) {
      console.error('Error fetching packages:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPackages = packages.filter(pkg => {
    const matchesFilter = filter === 'all' || 
                         (filter === 'pending' && pkg.status === 'pending') ||
                         (filter === 'delivered' && pkg.status === 'delivered') ||
                         (filter === 'returned' && pkg.status === 'returned');
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

  const handleSavePackage = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
        if (selectedPackage) {
            // Update existing
            await PackageService.updatePackage(selectedPackage.id, formData);
        } else {
            // Create new
            await PackageService.createPackage({
                ...formData,
                user_id: userId,
                condominio_id: 'fake-condo', // Replace with real combo id if available
                status: formData.status as any,
                arrival_date: new Date().toISOString()
            } as any);
        }
        setShowForm(false);
        setSelectedPackage(null);
        fetchPackages();
        setFormData({
            description: '',
            resident_name: '',
            resident_whatsapp: '',
            status: 'pending',
            image_url: '',
            observation: ''
        });
    } catch (error) {
        console.error('Error saving package:', error);
    }
  };

  const handleDelete = async (id: string) => {
      if (window.confirm('Excluir este registro permanentemente?')) {
          try {
              await PackageService.deletePackage(id);
              setSelectedPackage(null);
              fetchPackages();
          } catch (error) {
              console.error('Error deleting:', error);
          }
      }
  };

  const handleEdit = (pkg: Encomenda) => {
    setSelectedPackage(pkg);
    setFormData({
      description: pkg.description,
      resident_name: pkg.resident_name || '',
      resident_whatsapp: pkg.resident_whatsapp || '',
      status: pkg.status as any,
      image_url: pkg.image_url || '',
      observation: pkg.observation || ''
    });
    setShowForm(true);
  };

  const getReportData = (days: number) => {
      const cutOff = new Date();
      cutOff.setDate(cutOff.getDate() - days);
      return packages.filter(p => new Date(p.arrival_date) >= cutOff);
  };

  return (
    <div className="max-w-6xl mx-auto py-6 px-4">
      <FeatureHeader 
        icon={Package}
        title="Encomendas e Correspondências"
        description="Acompanhe a chegada de suas encomendas e correspondências na portaria."
        color="bg-orange-600"
      />

      {/* Botões de Relatório */}
      <div className="flex justify-end gap-2 mb-4">
          <button 
            onClick={() => setShowReportModal({show: true, days: 7})}
            className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-orange-500 flex items-center gap-1 transition-colors px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full"
          >
              <FileText size={12} /> Relatório 7 Dias
          </button>
          <button 
            onClick={() => setShowReportModal({show: true, days: 15})}
            className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-orange-500 flex items-center gap-1 transition-colors px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full"
          >
              <FileText size={12} /> Relatório 15 Dias
          </button>
      </div>

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
            {['all', 'pending', 'delivered', 'returned'].map(f => (
                <button 
                    key={f}
                    onClick={() => setFilter(f as any)}
                    className={`px-4 py-2 rounded-xl text-sm font-bold transition-all capitalize ${filter === f ? 'bg-orange-600 text-white shadow-lg shadow-orange-500/20' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                >
                {f === 'all' ? 'Tudo' : f === 'pending' ? 'Pendente' : f === 'delivered' ? 'Entregue' : 'Devolvida'}
                </button>
            ))}
          </div>
          
          {canManage && (
            <button 
              onClick={() => {
                  setSelectedPackage(null);
                  setFormData({ description: '', resident_name: '', resident_whatsapp: '', status: 'pending', image_url: '', observation: '' });
                  setShowForm(true);
              }}
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
                onClick={() => setSelectedPackage(pkg)}
                className="bg-white dark:bg-slate-800 rounded-[32px] border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-xl hover:shadow-orange-500/10 transition-all group flex flex-col relative cursor-pointer overflow-hidden h-full"
              >
                {/* Imagem "Balão" da Encomenda */}
                {(pkg.image_url || pkg.photo_url) && (
                  <div className="absolute top-4 right-4 z-10" onClick={e => e.stopPropagation()}>
                    <button 
                      onClick={() => setSelectedImageUrl(pkg.image_url || pkg.photo_url!)}
                      className="relative w-16 h-16 rounded-full border-4 border-white dark:border-slate-700 shadow-xl overflow-hidden hover:scale-110 transition-transform active:scale-95 group/img"
                    >
                      <img src={pkg.image_url || pkg.photo_url} alt="Thumbnail" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                        <Maximize2 size={16} className="text-white" />
                      </div>
                    </button>
                  </div>
                )}
                
                <div className="p-6 flex flex-col h-full">
                  <div className="flex justify-between items-start mb-4 pr-16">
                    <div className={`p-3 rounded-2xl flex items-center justify-center ${
                        pkg.status === 'pending' ? 'bg-orange-100 text-orange-600' : 
                        pkg.status === 'returned' ? 'bg-rose-100 text-rose-600' : 
                        'bg-emerald-100 text-emerald-600'
                    }`}>
                      {pkg.status === 'pending' ? <Package size={24} /> : pkg.status === 'returned' ? <ArrowLeftRight size={24} /> : <CheckCircle2 size={24} />}
                    </div>
                  </div>

                  <div className={`inline-flex px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest items-center gap-1 mb-3 w-fit ${
                      pkg.status === 'pending' ? 'bg-orange-100 text-orange-600' : 
                      pkg.status === 'returned' ? 'bg-rose-100 text-rose-600' : 
                      'bg-emerald-100 text-emerald-600'
                  }`}>
                    {pkg.status === 'pending' ? <AlertCircle size={12} /> : pkg.status === 'returned' ? <X size={12} /> : <CheckCircle2 size={12} />}
                    {pkg.status === 'pending' ? 'Para Retirar' : pkg.status === 'returned' ? 'Devolvida' : 'Entregue'}
                  </div>

                  <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-2 group-hover:text-orange-600 transition-colors line-clamp-2">
                    {pkg.description}
                  </h3>

                  <div className="space-y-3 mb-6 flex-1">
                    {pkg.resident_name && (
                      <div className="flex items-center gap-3 text-sm text-slate-500 font-medium tracking-tight">
                        <User size={16} className="text-slate-400" />
                        <span className="line-clamp-1">Morador: {pkg.resident_name}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-3 text-sm text-slate-500">
                      <Calendar size={16} className="text-slate-400" />
                      <span>{new Date(pkg.arrival_date).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-50 dark:border-slate-700/50 flex flex-col gap-3 font-bold">
                    <div className="flex items-center justify-between text-[10px] text-slate-400 uppercase tracking-widest">
                        <span>Ver Detalhes</span>
                        <Eye size={12} />
                    </div>
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
            Não há registros correspondentes aos filtros selecionados.
          </p>
        </div>
      )}

      {/* Modal - Registrar / Editar Encomenda */}
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
                    <Package className="text-orange-500" /> {selectedPackage ? 'Modificar Registro' : 'Registrar Encomenda'}
                    </h3>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Gestão de Portaria AiCondo360</p>
                </div>
                <button onClick={() => { setShowForm(false); setSelectedPackage(null); }} className="p-3 bg-slate-50 dark:bg-slate-700 hover:bg-rose-500 hover:text-white rounded-2xl transition-all group">
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

                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-1">Status da Encomenda</label>
                        <div className="grid grid-cols-3 gap-2">
                             {[
                                 { id: 'pending', label: 'Pendente', icon: Package, color: 'text-orange-500' },
                                 { id: 'delivered', label: 'Entregue', icon: CheckCircle2, color: 'text-emerald-500' },
                                 { id: 'returned', label: 'Devolução', icon: ArrowLeftRight, color: 'text-rose-500' }
                             ].map(s => (
                                 <button
                                    key={s.id}
                                    type="button"
                                    onClick={() => setFormData({...formData, status: s.id as any})}
                                    className={`flex flex-col items-center gap-2 py-3 rounded-2xl border-2 transition-all ${
                                        formData.status === s.id 
                                        ? 'border-orange-500 bg-orange-50 dark:bg-orange-500/10' 
                                        : 'border-slate-100 dark:border-slate-800'
                                    }`}
                                 >
                                     <s.icon className={s.color} size={20} />
                                     <span className="text-[10px] font-black uppercase tracking-widest">{s.label}</span>
                                 </button>
                             ))}
                        </div>
                    </div>

                    {formData.status === 'returned' && (
                        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 px-1">Motivo da Devolução</label>
                            <textarea 
                                placeholder="Ex: Morador não encontrado, endereço não localizado..."
                                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-4 text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 transition-all font-medium h-24 resize-none"
                                value={formData.observation}
                                onChange={e => setFormData({...formData, observation: e.target.value})}
                            />
                        </motion.div>
                    )}
                </div>

                <div className="flex gap-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                  {selectedPackage && (
                      <button
                        type="button"
                        onClick={() => handleDelete(selectedPackage.id)}
                        className="p-5 rounded-[24px] bg-rose-100 text-rose-600 hover:bg-rose-600 hover:text-white transition-all shadow-lg shadow-rose-500/10"
                      >
                        <Trash2 size={24} />
                      </button>
                  )}
                  <button
                    type="submit"
                    className="flex-1 px-8 py-5 rounded-[24px] bg-zinc-900 hover:bg-black text-white font-black uppercase text-xs tracking-widest shadow-2xl transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
                  >
                    {selectedPackage ? 'Salvar Alterações' : 'Registrar Encomenda'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal - Detalhes (Leitura e Notificação) */}
      <AnimatePresence>
        {selectedPackage && !showForm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md" onClick={() => setSelectedPackage(null)}>
                <motion.div 
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 50 }}
                    className="bg-white dark:bg-slate-800 rounded-[48px] w-full max-w-2xl overflow-hidden shadow-2xl"
                    onClick={e => e.stopPropagation()}
                >
                    <div className="relative h-64 bg-slate-50 dark:bg-slate-900 overflow-hidden">
                         {(selectedPackage.image_url || selectedPackage.photo_url) ? (
                             <img src={selectedPackage.image_url || selectedPackage.photo_url} alt="Pacote" className="w-full h-full object-cover" />
                         ) : (
                             <div className="w-full h-full flex flex-col items-center justify-center text-slate-300">
                                 <Package size={80} strokeWidth={1} />
                                 <span className="text-[10px] font-black uppercase tracking-widest mt-4">Sem foto anexada</span>
                             </div>
                         )}
                         <button onClick={() => setSelectedPackage(null)} className="absolute top-6 right-6 p-4 bg-white/20 hover:bg-white/40 backdrop-blur-md text-white rounded-full transition-all">
                            <X size={20} />
                         </button>
                         <div className="absolute bottom-6 left-8">
                             <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl backdrop-blur-xl ${
                                 selectedPackage.status === 'pending' ? 'bg-orange-500 text-white' : 
                                 selectedPackage.status === 'returned' ? 'bg-rose-500 text-white' : 
                                 'bg-emerald-500 text-white'
                             }`}>
                                 {selectedPackage.status === 'pending' ? 'Pendente' : selectedPackage.status === 'returned' ? 'Devolvida' : 'Entregue'}
                             </span>
                         </div>
                    </div>

                    <div className="p-10 space-y-8">
                        <div>
                            <h3 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-tight mb-2">
                                {selectedPackage.description}
                            </h3>
                            <p className="text-slate-500 font-bold uppercase tracking-widest text-xs flex items-center gap-2">
                                <Calendar size={14} className="text-orange-500" /> Recebido em {new Date(selectedPackage.arrival_date).toLocaleDateString('pt-BR')} às {new Date(selectedPackage.arrival_date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-6 bg-slate-50 dark:bg-slate-900/50 p-8 rounded-[32px] border border-slate-100 dark:border-slate-800">
                             <div>
                                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Morador</label>
                                 <p className="font-black text-lg text-zinc-800 dark:text-slate-200">{selectedPackage.resident_name}</p>
                             </div>
                             <div>
                                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">WhatsApp</label>
                                 <p className="font-black text-lg text-zinc-800 dark:text-slate-200">{selectedPackage.resident_whatsapp || 'Não informado'}</p>
                             </div>
                        </div>

                        {selectedPackage.observation && (
                            <div className="p-6 bg-rose-50 dark:bg-rose-900/20 rounded-[28px] border border-rose-100 dark:border-rose-900/30">
                                <label className="text-[10px] font-black text-rose-500 uppercase tracking-widest block mb-1">Motivo/Obs</label>
                                <p className="text-sm font-bold text-rose-700 dark:text-rose-300 italic">"{selectedPackage.observation}"</p>
                            </div>
                        )}

                        <div className="flex gap-4">
                            <button 
                                onClick={() => handleEdit(selectedPackage)}
                                className="flex-1 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-700 dark:text-white py-5 rounded-[24px] font-black uppercase text-xs tracking-widest transition-all flex items-center justify-center gap-2"
                            >
                                <Edit2 size={16} /> Editar Registro
                            </button>
                            {selectedPackage.resident_whatsapp && (
                                <a 
                                    href={`https://wa.me/${selectedPackage.resident_whatsapp.replace(/\D/g, '')}?text=Olá%20${selectedPackage.resident_name},%20sua%20encomenda%20(${selectedPackage.description})%20chegou%20na%20portaria!`}
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="flex-[2] bg-[#25D366] text-white py-5 rounded-[24px] font-black uppercase text-xs tracking-widest transition-all flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/20 active:scale-95"
                                >
                                     <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                                     Notificar WhatsApp
                                </a>
                            )}
                        </div>
                    </div>
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

      {/* Modal Relatório */}
      <AnimatePresence>
          {showReportModal.show && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-2xl">
                  <motion.div 
                    initial={{ opacity: 0, y: 100 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 100 }}
                    className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-[48px] overflow-hidden shadow-2xl border border-white/10"
                  >
                       <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                           <div>
                               <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Relatório de Encomendas</h3>
                               <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Período: Últimos {showReportModal.days} dias</p>
                           </div>
                           <button onClick={() => setShowReportModal({show: false, days: 0})} className="p-4 bg-slate-100 dark:bg-slate-800 rounded-full hover:bg-rose-500 hover:text-white transition-all">
                               <X size={20} />
                           </button>
                       </div>

                       <div className="p-8 max-h-[60vh] overflow-y-auto">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100 dark:border-slate-800">
                                        <th className="text-left py-4 px-2">Data</th>
                                        <th className="text-left py-4 px-2">Descrição</th>
                                        <th className="text-left py-4 px-2">Morador</th>
                                        <th className="text-left py-4 px-2">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {getReportData(showReportModal.days).map(p => (
                                        <tr key={p.id} className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                            <td className="py-4 px-2 text-xs font-bold text-slate-600 dark:text-slate-400">{new Date(p.arrival_date).toLocaleDateString()}</td>
                                            <td className="py-4 px-2 text-xs font-black text-slate-900 dark:text-white uppercase">{p.description}</td>
                                            <td className="py-4 px-2 text-xs font-bold text-slate-500">{p.resident_name}</td>
                                            <td className="py-4 px-2">
                                                <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-full ${
                                                    p.status === 'pending' ? 'bg-orange-100 text-orange-600' : 
                                                    p.status === 'returned' ? 'bg-rose-100 text-rose-600' : 
                                                    'bg-emerald-100 text-emerald-600'
                                                }`}>
                                                    {p.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                       </div>

                       <div className="p-8 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                                Total: {getReportData(showReportModal.days).length} registros encontrados
                            </p>
                            <div className="flex gap-4">
                               <button className="flex items-center gap-2 bg-zinc-900 text-white px-6 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:scale-105 transition-all">
                                   <Download size={16} /> Baixar PDF
                               </button>
                            </div>
                       </div>
                  </motion.div>
              </div>
          )}
      </AnimatePresence>
    </div>
  );
};
