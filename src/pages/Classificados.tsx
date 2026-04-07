import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingBag, 
  Tag, 
  MessageSquare, 
  Search, 
  Filter, 
  Plus, 
  ChevronRight, 
  Heart, 
  Share2, 
  Camera, 
  ChevronLeft, 
  CircleDollarSign, 
  Package, 
  Sparkles, 
  UserCircle2, 
  MapPin, 
  CreditCard, 
  Clock, 
  Smartphone, 
  Coffee, 
  Cpu, 
  Zap, 
  LucideIcon, 
  CheckCircle2, 
  Smartphone as Phone, 
  Check, 
  Smartphone as SmartphoneIcon,
  Laptop,
  Sofa,
  Hammer,
  Edit3,
  Trash2,
  Info,
  X,
  Loader2,
  Car,
  Shield
} from 'lucide-react';
import { FeatureHeader } from '../components/FeatureHeader';
import { MercadoService, MercadoItem } from '../services/supabaseService';
import { useAuth } from '../hooks/useAuth';

type Listing = MercadoItem;

const CATEGORIES = [
  { id: 'all', name: 'Todos', icon: Package },
  { id: 'moveis', name: 'Móveis', icon: Sofa },
  { id: 'eletronicos', name: 'Eletrônicos', icon: Laptop },
  { id: 'automoveis', name: 'Automóveis', icon: Car },
  { id: 'utilidades', name: 'Utilidades', icon: Coffee },
  { id: 'servicos', name: 'Serviços', icon: Hammer },
];

/** Formats a raw price value ("30", "1500.5", "30,0") to "R$ 30,00" */
const formatBRL = (value?: string | number): string => {
  if (!value) return 'R$ 0,00';
  const raw = String(value)
    .replace(/[R$\s]/g, '')
    .replace(/\./g, '')
    .replace(',', '.');
  const num = parseFloat(raw);
  if (isNaN(num)) return String(value);
  return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

export const Classificados: React.FC = () => {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const loadingRef = React.useRef(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [expandedImage, setExpandedImage] = useState<string | null>(null);
  const [selectedAd, setSelectedAd] = useState<Listing | null>(null);
  const [showDisclaimerModal, setShowDisclaimerModal] = useState(false);

  const [formData, setFormData] = useState<Partial<Listing>>({
    product_name: '',
    title: '',
    price: '',
    category: 'eletronicos',
    author: user?.name || '',
    unit: user?.unit || '',
    photo_url: '',
    photo_url_2: '',
    photo_url_3: '',
    description: '',
    condition: 'usado',
    whatsapp: '',
    contact_name: user?.name || '',
  });

  const loadListings = async () => {
    if (!user?.condoId || loadingRef.current) return;
    
    console.log("[Classificados] Loading listings for condo:", user.condoId);
    loadingRef.current = true;
    setLoading(true);
    
    try {
      const data = await MercadoService.getCondoItems(user.condoId);
      console.log("[Classificados] Data received:", data.length, "items");
      setListings(data);
    } catch (err) {
      console.error("[Classificados] Error loading listings:", err);
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  };

  // Sincroniza dados do formulário quando o usuário carrega
  useEffect(() => {
    if (user && !formData.author) {
      setFormData(prev => ({
        ...prev,
        author: user.name,
        unit: user.unit
      }));
    }
  }, [user]);

  useEffect(() => {
    if (user?.condoId) {
      loadListings();
    }
  }, [user?.condoId]);

  const filteredListings = listings.filter(l => 
    (selectedCategory === 'all' || l.category === selectedCategory) &&
    (l.title.toLowerCase().includes(searchTerm.toLowerCase()) || l.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const isBasicPlan = user?.plan === 'basic';

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, slot: number = 1) => {
    if (isBasicPlan) {
      alert("Upgrade de plano necessário para adicionar fotos aos anúncios!");
      return;
    }
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) {
        alert('A imagem deve ter no máximo 1MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const field = slot === 1 ? 'photo_url' : slot === 2 ? 'photo_url_2' : 'photo_url_3';
        setFormData(prev => ({ ...prev, [field]: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const closeModal = () => {
    setShowForm(false);
    setEditingId(null);
    setSelectedAd(null);
    setFormData({
      product_name: '',
      title: '',
      price: '',
      category: 'eletronicos',
      author: user?.name || '',
      unit: user?.unit || '',
      photo_url: '',
      photo_url_2: '',
      photo_url_3: '',
      description: '',
      condition: 'usado',
      whatsapp: '',
      contact_name: user?.name || '',
    });
  };

  const handleCreateNew = async () => {
    console.log("[Classificados] Submitting form with title:", formData.title);
    if(!formData.title?.trim()) {
      alert("Por favor, preencha o Título do Anúncio!");
      return;
    }
    if(!formData.whatsapp?.trim() || !formData.contact_name?.trim()) {
      alert("Por favor, preencha o Nome e o WhatsApp de contato!");
      return;
    }
    if(!user) return;

    const finalCondoId = user?.condoId;
    if (!finalCondoId || finalCondoId.trim() === '') {
      alert("⚠️ Sem condomínio selecionado!\n\nSe você for Administrador Global, selecione um condomínio no menu superior antes de publicar um anúncio.");
      return;
    }
    
    try {
      const itemData: any = {
        ...formData,
        condominio_id: finalCondoId,
        user_id: user.id,
        author: formData.author || user.name || 'Morador',
        unit: formData.unit || user.unit || '-',
        status: 'active'
      };

      if (editingId) {
        await MercadoService.updateItem(editingId, itemData);
      } else {
        await MercadoService.createItem(itemData);
      }
      
      loadListings();
      closeModal();
    } catch (err: any) {
      console.error('[Classificados] Erro detalhado:', err);
      alert(`Erro ao salvar anúncio:\n${err?.message || err?.details || JSON.stringify(err)}`);
    }
  };

  const handleEdit = (listing: Listing) => {
    setEditingId(listing.id);
    setFormData(listing);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este anúncio?')) {
      try {
        await MercadoService.deleteItem(id);
        loadListings();
      } catch (err) {
        console.error(err);
        alert("Erro ao excluir.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950/50 p-4 sm:p-6 lg:p-8">
      <FeatureHeader
        icon={ShoppingBag}
        title="Classificados"
        description="Compre e venda itens entre vizinhos com segurança."
        badge="Marketplace Interno"
        color="bg-amber-500"
      />

      <div className="max-w-7xl mx-auto space-y-4">
        {/* Barra de Ações */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-6 shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="Pesquisar..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800/50 border-none rounded-xl focus:ring-2 focus:ring-amber-500 transition-all text-xs text-slate-900 dark:text-white font-medium"
            />
          </div>
          
          <div className="flex gap-2 w-full sm:w-auto">
            <button 
              onClick={() => setShowDisclaimerModal(true)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all font-bold text-xs shadow-lg shadow-red-500/20 uppercase tracking-wider"
            >
              <Info size={16} />
              Comunicado
            </button>
            <button 
              onClick={() => setShowForm(true)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition-all font-bold text-xs shadow-lg shadow-amber-500/20 uppercase tracking-wider"
            >
              <Plus size={16} />
              Anunciar
            </button>
          </div>
        </div>

        {/* Categorias */}
        <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-hide">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full whitespace-nowrap transition-all text-[11px] font-bold uppercase tracking-tight border ${
                selectedCategory === cat.id
                  ? 'bg-amber-500 border-amber-500 text-white shadow-md'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400 hover:text-amber-500'
              }`}
            >
              <cat.icon size={14} />
              {cat.name}
            </button>
          ))}
        </div>

        {/* Grid de Itens */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 grayscale opacity-50">
             <Loader2 className="animate-spin mb-4" size={40} />
             <p className="text-slate-500">Carregando anúncios...</p>
          </div>
        ) : filteredListings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredListings.map((listing) => {
                const conditionColor =
                  listing.condition === 'novo'    ? 'text-emerald-500' :
                  listing.condition === 'doação'  ? 'text-violet-500'  :
                                                    'text-amber-500';
                return (
                  <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    key={listing.id}
                    className="group relative bg-white dark:bg-slate-900 rounded-[20px] border border-slate-100 dark:border-slate-800/60 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer p-3 flex gap-3 items-start"
                    onClick={() => setSelectedAd(listing)}
                  >
                    {/* Ações */}
                    <div className="absolute top-2.5 right-2.5 z-10 flex gap-1">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleEdit(listing); }}
                        className="p-1 text-slate-300 hover:text-amber-500 transition-all"
                      >
                        <Edit3 size={12} />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(listing.id); }}
                        className="p-1 text-slate-300 hover:text-rose-500 transition-all"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>

                    {/* Foto pequena */}
                    <div className="w-[72px] h-[72px] rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 flex-shrink-0 border border-slate-100 dark:border-slate-800">
                      {listing.photo_url || listing.image_url ? (
                        <img
                          src={listing.photo_url || listing.image_url}
                          alt={listing.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                          <ShoppingBag size={22} />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0 pr-10">
                      <p className="text-[8px] text-slate-400 uppercase tracking-widest mb-0.5">{listing.category}</p>
                      <h3 className="text-xs font-semibold text-slate-800 dark:text-white uppercase tracking-tight leading-tight truncate">
                        {listing.title || listing.product_name}
                      </h3>
                      <p className="text-sm font-bold text-amber-500 mt-0.5">{formatBRL(listing.price)}</p>
                      <span className={`text-[9px] font-medium italic ${conditionColor}`}>
                        {listing.condition}
                      </span>
                    </div>

                    {/* WhatsApp */}
                    <a
                      href={`https://wa.me/${listing.whatsapp}`}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="absolute bottom-3 right-3 w-7 h-7 bg-[#25D366] text-white rounded-full flex items-center justify-center shadow-md hover:scale-105 transition-transform"
                    >
                      <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current">
                        <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.284l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766 0-3.18-2.587-5.768-5.764-5.768zm3.393 8.3c-.15.422-.866.422-1.284.422-1.077 0-2.484-.523-3.415-1.455-.93-.93-1.454-2.338-1.454-3.415 0-.418 0-1.134.422-1.284.15-.054.436-.054.512-.054l.099.001c.148 0 .221.012.3.172.106.216.512 1.25.556 1.336.044.086.044.186-.014.3-.058.114-.145.186-.231.3-.086.114-.145.244-.058.386.416.71.97 1.206 1.706 1.543.142.064.216.035.316-.017.114-.058.458-.516.586-.7.128-.184.286-.156.472-.086l1.396.686c.072.044.156.072.2.142.054.086.028.328-.11.472zM12 2C6.477 2 2 6.477 2 12c0 1.891.526 3.655 1.439 5.166L2 22l4.993-1.312A9.942 9.942 0 0 0 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2z"/>
                      </svg>
                    </a>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-900 rounded-[32px] border border-slate-200 dark:border-slate-800 text-center px-4"
          >
            <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
              <ShoppingBag className="text-slate-300" size={48} />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Nenhum anúncio encontrado</h3>
            <p className="text-slate-500 max-w-sm mb-8">
              Seja o primeiro a desapegar de algo ou oferecer um serviço para seus vizinhos.
            </p>
            <button 
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-8 py-4 bg-amber-500 text-white rounded-2xl hover:bg-amber-600 transition-all font-bold shadow-lg shadow-amber-500/20"
            >
              <Plus size={20} />
              Criar o Primeiro Anúncio
            </button>
          </motion.div>
        )}
      </div>

      {/* Modal de Comunicado */}
      <AnimatePresence>
        {showDisclaimerModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDisclaimerModal(false)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-amber-50 dark:bg-amber-500/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-500 rounded-xl flex items-center justify-center">
                    <Info size={20} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-amber-800 dark:text-amber-500 tracking-tight">Comunicado Importante</h2>
                  </div>
                </div>
                <button onClick={() => setShowDisclaimerModal(false)} className="p-2 text-amber-600 dark:text-amber-500 hover:bg-amber-100 dark:hover:bg-amber-500/20 rounded-xl transition-all">
                  <X size={20} />
                </button>
              </div>
              <div className="p-6 md:p-8 space-y-4">
                <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed font-medium">
                  O Condomínio, o Síndico e a Gestão AiCondo360 <strong>não se responsabilizam</strong> por nenhuma transação realizada por condôminos dentro da plataforma AiCondo360.
                </p>
                <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed font-medium">
                  O intuito do Marketplace interno é apenas restringir a compra, venda e troca internamente (por estranhos externos).
                </p>
                <div className="bg-amber-50 dark:bg-amber-500/10 border-l-4 border-amber-500 p-4 rounded-r-xl">
                  <p className="text-amber-800 dark:text-amber-500 text-xs font-bold uppercase tracking-wide leading-relaxed">
                    Por isso, toda transação é de inteira responsabilidade do morador que publicou o anúncio.
                  </p>
                </div>
              </div>
              <div className="p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex justify-end">
                <button 
                  onClick={() => setShowDisclaimerModal(false)}
                  className="px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold text-sm hover:scale-105 transition-all shadow-lg"
                >
                  Estou Ciente
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal de Cadastro/Edição */}
      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
              className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
            >
              <div className="p-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-amber-50 dark:bg-amber-900/20 text-amber-500 rounded-lg flex items-center justify-center">
                    <Tag size={16} />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-slate-800 dark:text-white uppercase tracking-tight">
                      {editingId ? 'Editar' : 'Novo Anúncio'}
                    </h2>
                  </div>
                </div>
                <button onClick={closeModal} className="p-1.5 text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-all">
                  <X size={16} />
                </button>
              </div>

              <form className="p-5 space-y-4 max-h-[75vh] overflow-y-auto scrollbar-hide" onSubmit={(e) => { e.preventDefault(); handleCreateNew(); }}>
                
                {/* Fotos do Produto */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-[9px] font-semibold text-slate-400 uppercase tracking-widest px-0.5">
                      Fotos do Produto
                    </label>
                    {isBasicPlan && (
                      <span className="text-[8px] font-bold text-rose-500 uppercase tracking-tight">Indisponível no Plano Essencial</span>
                    )}
                  </div>
                  <div className={`flex gap-2 ${isBasicPlan ? 'opacity-40 cursor-not-allowed grayscale' : ''}`}>
                    {[1, 2, 3].map((slot) => {
                      const field = slot === 1 ? 'photo_url' : slot === 2 ? 'photo_url_2' : 'photo_url_3';
                      const url = (formData as any)[field];
                      
                      return (
                        <div key={slot} className={`relative group/modalimg flex-1 aspect-square ${isBasicPlan ? 'pointer-events-none' : ''}`}>
                          {url ? (
                            <div className="w-full h-full rounded-xl overflow-hidden border border-slate-100 dark:border-slate-800 relative">
                              <img src={url} alt={`Preview ${slot}`} className="w-full h-full object-cover" />
                              <button 
                                type="button" 
                                onClick={() => setFormData(p => ({ ...p, [field]: '' }))}
                                className="absolute -top-1 -right-1 bg-rose-500 text-white rounded-full p-1 z-10"
                              >
                                <X size={8} />
                              </button>
                            </div>
                          ) : (
                            <div className="w-full h-full rounded-xl border border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center relative hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
                              <Camera size={14} className="text-slate-300 mb-0.5" />
                              <span className="text-[7px] font-medium text-slate-400 uppercase">Foto {slot}</span>
                              <input 
                                type="file" 
                                accept="image/*"
                                onChange={(e) => handleImageUpload(e, slot)}
                                className="absolute inset-0 opacity-0 cursor-pointer"
                                disabled={isBasicPlan}
                              />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="col-span-full">
                      <label className="block text-[9px] font-semibold text-slate-400 uppercase tracking-widest mb-1 px-0.5">Título</label>
                      <input 
                        type="text" 
                        placeholder="Ex: iPhone 13 Pro"
                        value={formData.title}
                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/30 border-none rounded-xl focus:ring-1 focus:ring-amber-500 transition-all font-medium text-[11px]"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-[9px] font-semibold text-slate-400 uppercase tracking-widest mb-1 px-0.5">Preço</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium text-[10px]">R$</span>
                        <input 
                          type="text" 
                          placeholder="0,00"
                          value={formData.price}
                          onChange={(e) => setFormData({...formData, price: e.target.value})}
                          className="w-full pl-8 pr-3 py-2 bg-slate-50 dark:bg-slate-800/30 border-none rounded-xl focus:ring-1 focus:ring-amber-500 transition-all font-medium text-[11px]"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[9px] font-semibold text-slate-400 uppercase tracking-widest mb-1 px-0.5">WhatsApp</label>
                      <input 
                        type="text" 
                        placeholder="719..."
                        value={formData.whatsapp}
                        onChange={(e) => setFormData({...formData, whatsapp: e.target.value})}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/30 border-none rounded-xl focus:ring-1 focus:ring-amber-500 transition-all font-medium text-[11px]"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] font-semibold text-slate-400 uppercase tracking-widest mb-1 px-0.5">Categoria</label>
                      <select 
                        value={formData.category}
                        onChange={(e) => setFormData({...formData, category: e.target.value})}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/30 border-none rounded-xl focus:ring-1 focus:ring-amber-500 transition-all font-medium text-[11px] appearance-none"
                      >
                        {CATEGORIES.filter(c => c.id !== 'all').map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[9px] font-semibold text-slate-400 uppercase tracking-widest mb-1 px-0.5">Condição</label>
                      <select 
                        value={formData.condition}
                        onChange={(e) => setFormData({...formData, condition: e.target.value})}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/30 border-none rounded-xl focus:ring-1 focus:ring-amber-500 transition-all font-medium text-[11px] appearance-none"
                      >
                        <option value="novo">Novo</option>
                        <option value="usado">Usado</option>
                        <option value="doação">Doação</option>
                      </select>
                    </div>

                    <div className="col-span-full">
                      <label className="block text-[9px] font-semibold text-slate-400 uppercase tracking-widest mb-1 px-0.5">Descrição</label>
                      <textarea 
                        rows={2}
                        placeholder="..."
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/30 border-none rounded-xl focus:ring-1 focus:ring-amber-500 transition-all text-[11px] resize-none"
                        required
                      ></textarea>
                    </div>
                  </div>

                <div className="pt-2 flex gap-2">
                  <button 
                    type="submit"
                    className="flex-1 px-4 py-2.5 bg-zinc-900 hover:bg-black text-white rounded-xl transition-all font-medium text-[10px] uppercase tracking-widest"
                  >
                    {editingId ? 'Salvar' : 'Publicar'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Detalhes do Anúncio */}
      <AnimatePresence>
        {selectedAd && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedAd(null)}
              className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-[28px] shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden max-h-[85vh] flex flex-col"
            >
              <button 
                onClick={() => setSelectedAd(null)} 
                className="absolute top-3 right-3 z-20 p-1.5 bg-black/20 backdrop-blur-md text-white rounded-full hover:bg-black/40 transition-all"
              >
                <X size={14} />
              </button>

              {/* Conteúdo com fotos pequenas */}
              <div className="p-5 overflow-y-auto bg-white dark:bg-slate-900 space-y-3">

                {/* Linha 1: foto pequena + info principal */}
                <div className="flex gap-3 items-start">
                  {/* Foto Principal Pequena */}
                  <div
                    className="w-20 h-20 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 flex-shrink-0 cursor-zoom-in border border-slate-100 dark:border-slate-800"
                    onClick={() => { const img = selectedAd.photo_url || selectedAd.image_url; if(img) setExpandedImage(img); }}
                  >
                    {selectedAd.photo_url || selectedAd.image_url ? (
                      <img src={selectedAd.photo_url || selectedAd.image_url} alt={selectedAd.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300">
                        <ShoppingBag size={24} />
                      </div>
                    )}
                  </div>

                  {/* Info principal */}
                  <div className="flex-1 min-w-0">
                    <span className="text-[8px] text-amber-600 uppercase tracking-widest">{selectedAd.category}</span>
                    <h2 className="text-sm font-semibold text-slate-800 dark:text-white uppercase tracking-tight leading-tight truncate">{selectedAd.title || selectedAd.product_name}</h2>
                    <p className="text-sm font-bold text-amber-500 mt-0.5">{formatBRL(selectedAd.price)}</p>
                    <span className="text-[9px] text-slate-400 italic">{selectedAd.condition}</span>
                  </div>
                </div>

                {/* Fotos adicionais (thumbs) */}
                {[selectedAd.photo_url_2, selectedAd.photo_url_3].some(Boolean) && (
                  <div className="flex gap-2">
                    {[selectedAd.photo_url_2, selectedAd.photo_url_3].filter(Boolean).map((img, i) => (
                      <div
                        key={i}
                        className="w-14 h-14 rounded-lg overflow-hidden cursor-zoom-in border border-slate-100 dark:border-slate-800"
                        onClick={() => setExpandedImage(img as string)}
                      >
                        <img src={img as string} alt={`Foto ${i + 2}`} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-3 py-2 border-y border-slate-50 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                      <UserCircle2 size={14} />
                    </div>
                    <div>
                      <p className="text-[8px] text-slate-400 uppercase tracking-widest">Vendedor</p>
                      <p className="text-[10px] font-medium text-slate-700 dark:text-slate-300 uppercase">{selectedAd.author}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-[8px] text-slate-400 uppercase tracking-widest">Descrição</p>
                  <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">{selectedAd.description}</p>
                </div>

                <div className="pt-1 flex justify-center items-center gap-2">
                  <a 
                    href={`https://wa.me/${selectedAd.whatsapp}`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-9 h-9 bg-[#25D366] text-white rounded-full flex items-center justify-center shadow-md hover:scale-105 transition-transform"
                  >
                    <svg viewBox="0 0 24 24" className="w-4.5 h-4.5 fill-white">
                      <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.284l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766 0-3.18-2.587-5.768-5.764-5.768zm3.393 8.3c-.15.422-.866.422-1.284.422-1.077 0-2.484-.523-3.415-1.455-.93-.93-1.454-2.338-1.454-3.415 0-.418 0-1.134.422-1.284.15-.054.436-.054.512-.054l.099.001c.148 0 .221.012.3.172.106.216.512 1.25.556 1.336.044.086.044.186-.014.3-.058.114-.145.186-.231.3-.086.114-.145.244-.058.386.416.71.97 1.206 1.706 1.543.142.064.216.035.316-.017.114-.058.458-.516.586-.7.128-.184.286-.156.472-.086l1.396.686c.072.044.156.072.2.142.054.086.028.328-.11.472zM12 2C6.477 2 2 6.477 2 12c0 1.891.526 3.655 1.439 5.166L2 22l4.993-1.312A9.942 9.942 0 0 0 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2z"/>
                    </svg>
                  </a>
                  
                  <button 
                    onClick={() => { handleEdit(selectedAd); setSelectedAd(null); }}
                    className="p-2 text-slate-400 hover:text-amber-500 rounded-lg transition-all"
                  >
                    <Edit3 size={15} />
                  </button>
                  <button 
                    onClick={() => { handleDelete(selectedAd.id); setSelectedAd(null); }}
                    className="p-2 text-slate-400 hover:text-rose-500 rounded-lg transition-all"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Visualizador de Imagem Ampliada */}
      <AnimatePresence>
        {expandedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setExpandedImage(null)}
            className="fixed inset-0 z-[100] bg-slate-950/95 backdrop-blur-lg flex items-center justify-center p-4"
          >
            <motion.button
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              className="absolute top-8 right-8 text-white/50 hover:text-white transition-all bg-white/10 p-4 rounded-full backdrop-blur-md"
            >
              <X size={32} />
            </motion.button>
            <motion.img
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              src={expandedImage}
              alt="Ampliada"
              className="max-w-full max-h-full rounded-3xl shadow-2xl border-4 border-white/10"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
