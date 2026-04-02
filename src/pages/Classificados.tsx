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
  Loader2
} from 'lucide-react';
import { FeatureHeader } from '../components/FeatureHeader';
import { MercadoService, MercadoItem } from '../services/supabaseService';
import { useAuth } from '../hooks/useAuth';

type Listing = MercadoItem;

const CATEGORIES = [
  { id: 'all', name: 'Todos', icon: Package },
  { id: 'moveis', name: 'Móveis', icon: Sofa },
  { id: 'eletronicos', name: 'Eletrônicos', icon: Laptop },
  { id: 'utilidades', name: 'Utilidades', icon: Coffee },
  { id: 'servicos', name: 'Serviços', icon: Hammer },
];

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

  const [formData, setFormData] = useState<Partial<Listing>>({
    title: '',
    price: '',
    category: 'eletronicos',
    author: user?.name || '',
    unit: user?.unit || '',
    image_url: '',
    description: '',
    condition: 'usado',
    whatsapp: '',
    contact_name: user?.name || '', // NOVO CAMPO
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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) {
        alert('A imagem deve ter no máximo 1MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, image_url: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const closeModal = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      title: '',
      price: '',
      category: 'eletronicos',
      author: user?.name || '',
      unit: user?.unit || '',
      image_url: '',
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
    
    try {
      const itemData: any = {
        ...formData,
        condominio_id: user.condoId,
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

      <div className="max-w-7xl mx-auto space-y-6">
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
              {filteredListings.map((listing) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  key={listing.id}
                  className="group bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-300"
                >
                  <div className="p-3 flex justify-between items-center border-b border-slate-50 dark:border-slate-800/50">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 overflow-hidden shrink-0">
                        <UserCircle2 size={18} />
                      </div>
                      <div>
                        <p className="text-[11px] font-bold text-slate-800 dark:text-white leading-none mb-0.5">{listing.author}</p>
                        <p className="text-[9px] font-medium text-slate-400 uppercase tracking-tighter">{listing.unit} • {listing.created_at ? new Date(listing.created_at).toLocaleDateString() : 'Hoje'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-0.5">
                      <button onClick={() => handleEdit(listing)} className="p-1.5 text-slate-300 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-500/10 rounded-lg transition-colors">
                        <Edit3 size={14} />
                      </button>
                      <button onClick={() => handleDelete(listing.id)} className="p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2 gap-2">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-amber-500 transition-colors line-clamp-1 uppercase tracking-tight">{listing.title}</h3>
                      <div className="px-2 py-0.5 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-full text-[10px] font-black whitespace-nowrap">
                        {listing.price}
                      </div>
                    </div>
                    
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mb-4 h-8 italic">
                      {listing.description}
                    </p>
                    
                    {/* Foto do Produto */}
                    {listing.image_url && (
                      <div className="mb-4">
                        <div 
                          onClick={() => setExpandedImage(listing.image_url)}
                          className="aspect-[4/3] w-full rounded-xl overflow-hidden cursor-pointer hover:opacity-95 transition-opacity border border-slate-50 dark:border-slate-800 shadow-sm"
                        >
                          <img src={listing.image_url} alt={listing.title} className="w-full h-full object-cover" />
                        </div>
                      </div>
                    )}

                    <div className="pt-3 border-t border-slate-50 dark:border-slate-800/50 flex items-center justify-between">
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-widest ${
                        listing.condition === 'novo' ? 'bg-emerald-50 text-emerald-600' : 
                        listing.condition === 'doação' ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600'
                      }`}>
                        {listing.condition}
                      </span>
                      <a 
                        href={`https://wa.me/${listing.whatsapp}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-all font-bold text-[10px] uppercase tracking-wider"
                      >
                        <MessageSquare size={12} />
                        WhatsApp
                      </a>
                    </div>
                  </div>
                </motion.div>
              ))}
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
              <div className="p-5 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 text-amber-500 rounded-xl flex items-center justify-center">
                    <Tag size={20} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-tight">
                      {editingId ? 'Editar Anúncio' : 'Novo Anúncio'}
                    </h2>
                    <p className="text-slate-400 text-[10px] font-medium uppercase tracking-widest leading-none mt-1">Preencha os dados do anúncio</p>
                  </div>
                </div>
                <button onClick={closeModal} className="p-2 text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-full transition-all">
                  <X size={20} />
                </button>
              </div>

              <form className="p-6 sm:p-8 space-y-5 max-h-[70vh] overflow-y-auto" onSubmit={(e) => { e.preventDefault(); handleCreateNew(); }}>
                
                {/* Imagem (Max 1MB) */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 px-1">
                    Foto do Produto
                  </label>
                  <div className="flex gap-3 items-center">
                    {formData.image_url && (
                      <div className="relative w-20 h-20 rounded-xl overflow-hidden border-2 border-slate-100 dark:border-slate-800">
                        <img src={formData.image_url} alt="Preview" className="w-full h-full object-cover" />
                        <button 
                          type="button" 
                          onClick={() => setFormData(p => ({ ...p, image_url: '' }))}
                          className="absolute top-1 right-1 bg-rose-500 text-white rounded-full p-1"
                        >
                          <X size={10} />
                        </button>
                      </div>
                    )}
                    {!formData.image_url && (
                      <div className="w-20 h-20 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 flex items-center justify-center relative hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                        <Camera size={24} className="text-slate-300" />
                        <input 
                          type="file" 
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                      </div>
                    )}
                  </div>
                </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="col-span-full">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 px-1">Título</label>
                      <input 
                        type="text" 
                        placeholder="Ex: iPhone 13 Pro 128GB"
                        value={formData.title}
                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-amber-500 transition-all font-bold text-xs"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 px-1">Nome</label>
                      <input 
                        type="text" 
                        placeholder="Seu nome"
                        value={formData.contact_name}
                        onChange={(e) => setFormData({...formData, contact_name: e.target.value})}
                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-amber-500 transition-all font-bold text-xs"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 px-1">WhatsApp</label>
                      <input 
                        type="text" 
                        placeholder="719..."
                        value={formData.whatsapp}
                        onChange={(e) => setFormData({...formData, whatsapp: e.target.value})}
                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-amber-500 transition-all font-bold text-xs"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 px-1">Preço</label>
                      <input 
                        type="text" 
                        placeholder="R$..."
                        value={formData.price}
                        onChange={(e) => setFormData({...formData, price: e.target.value})}
                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-amber-500 transition-all font-bold text-xs"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 px-1">Categoria</label>
                      <select 
                        value={formData.category}
                        onChange={(e) => setFormData({...formData, category: e.target.value})}
                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-amber-500 transition-all font-bold text-xs"
                      >
                        {CATEGORIES.filter(c => c.id !== 'all').map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 px-1">Condição</label>
                      <select 
                        value={formData.condition}
                        onChange={(e) => setFormData({...formData, condition: e.target.value})}
                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-amber-500 transition-all font-bold text-xs"
                      >
                        <option value="novo">Novo</option>
                        <option value="usado">Usado</option>
                        <option value="doação">Doação</option>
                      </select>
                    </div>

                    <div className="col-span-full">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 px-1">Descrição</label>
                      <textarea 
                        rows={2}
                        placeholder="Descreva o item..."
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-amber-500 transition-all text-xs resize-none"
                        required
                      ></textarea>
                    </div>
                  </div>

                <div className="pt-4 flex gap-2">
                  <button 
                    type="submit"
                    className="flex-1 px-6 py-3.5 bg-zinc-900 hover:bg-black text-white rounded-xl transition-all font-bold text-[10px] uppercase tracking-widest shadow-xl"
                  >
                    {editingId ? 'Salvar' : 'Publicar'}
                  </button>
                </div>
              </form>
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
