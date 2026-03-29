import React, { useState } from 'react';
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
  X
} from 'lucide-react';
import { FeatureHeader } from '../components/FeatureHeader';

type Listing = {
  id: string;
  title: string;
  price: string;
  category: string;
  author: string;
  unit: string;
  imageUrls: string[];
  description: string;
  date: string;
  whatsapp: string;
  condition: 'novo' | 'usado' | 'doação';
};

const CATEGORIES = [
  { id: 'all', name: 'Todos', icon: Package },
  { id: 'moveis', name: 'Móveis', icon: Sofa },
  { id: 'eletronicos', name: 'Eletrônicos', icon: Laptop },
  { id: 'utilidades', name: 'Utilidades', icon: Coffee },
  { id: 'servicos', name: 'Serviços', icon: Hammer },
];

const INITIAL_LISTINGS: Listing[] = [
  { 
    id: '1', title: 'iPhone 13 Pro 128GB', price: 'R$ 3.800', category: 'eletronicos', author: 'Ricardo', unit: 'Apto 152', 
    imageUrls: ['https://images.unsplash.com/photo-1632661674596-df8be070a5c5?w=400&h=300&fit=crop'], 
    description: 'Estado de novo, bateria 92%. Acompanha caixa e cabo original.', date: 'Hoje', condition: 'usado', whatsapp: '5511999999999'
  },
  { 
    id: '2', title: 'Sofá Retrátil 3 Lugares', price: 'R$ 1.200', category: 'moveis', author: 'Sônia', unit: 'Torre B 41', 
    imageUrls: ['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=300&fit=crop'], 
    description: 'Cinza chumbo, em ótimo estado. Retirada por conta do comprador.', date: 'Ontem', condition: 'usado', whatsapp: '5511999999999'
  },
  { 
    id: '3', title: 'Aulas de Violão p/ Iniciantes', price: 'R$ 80/h', category: 'servicos', author: 'Felipe', unit: 'Apto 88', 
    imageUrls: ['https://images.unsplash.com/photo-1510915363646-a6217664d442?w=400&h=300&fit=crop'], 
    description: 'Aulas teóricas e práticas. Experiência de 10 anos.', date: 'Há 2 dias', condition: 'novo', whatsapp: '5511999999999'
  },
  { 
    id: '4', title: 'Smart TV Samsung 50"', price: 'R$ 1.950', category: 'eletronicos', author: 'Mariana', unit: 'Apto 12', 
    imageUrls: ['https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400&h=300&fit=crop'], 
    description: '4K HDR, Crystal UHD. 1 ano de uso, sem detalhes.', date: 'Ontem', condition: 'usado', whatsapp: '5511999999999'
  },
];

export const Classificados: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [listings, setListings] = useState<Listing[]>(INITIAL_LISTINGS);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [expandedImage, setExpandedImage] = useState<string | null>(null);

  const [formData, setFormData] = useState<Omit<Listing, 'id' | 'date'>>({
    title: '',
    price: '',
    category: 'eletronicos',
    author: '',
    unit: '',
    imageUrls: [],
    description: '',
    condition: 'usado',
    whatsapp: '',
  });

  const filteredListings = listings.filter(l => 
    (selectedCategory === 'all' || l.category === selectedCategory) &&
    (l.title.toLowerCase().includes(searchTerm.toLowerCase()) || l.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []) as File[];
    if (formData.imageUrls.length + files.length > 2) {
      alert('Você pode enviar no máximo 2 fotos.');
      return;
    }

    files.forEach((file: File) => {
      if (file.size > 1024 * 1024) {
        alert(`A imagem ${file.name} deve ter no máximo 1MB (1024KB).`);
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, imageUrls: [...prev.imageUrls, reader.result as string] }));
      };
      reader.readAsDataURL(file);
    });
  };

  const handleCreateNew = () => {
    if(!formData.title.trim() || !formData.whatsapp.trim()) {
      alert("Preencha o título e o WhatsApp!");
      return;
    }
    
    if (editingId) {
      setListings(listings.map(l => l.id === editingId ? { ...formData, id: editingId, date: l.date } : l));
    } else {
      const newListing: Listing = {
        ...formData,
        id: Math.random().toString(36).substr(2, 9),
        date: 'Agora'
      };
      setListings([newListing, ...listings]);
    }
    closeModal();
  };

  const closeModal = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({ title: '', price: '', category: 'eletronicos', author: '', unit: '', imageUrls: [], description: '', condition: 'usado', whatsapp: '' });
  };

  const handleEdit = (listing: Listing) => {
    setFormData({
      title: listing.title,
      price: listing.price,
      category: listing.category,
      author: listing.author,
      unit: listing.unit,
      imageUrls: listing.imageUrls,
      description: listing.description,
      condition: listing.condition,
      whatsapp: listing.whatsapp || '',
    });
    setEditingId(listing.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este anúncio?')) {
      setListings(listings.filter(l => l.id !== id));
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <FeatureHeader 
        icon={ShoppingBag}
        title="Marketplace Interno"
        description="O classificados exclusivo do AiCondo360. Compre, venda ou troque itens com segurança diretamente com seus vizinhos."
        color="bg-amber-500"
      />

      {/* Categories Scroller */}
      <div className="flex gap-4 mb-12 overflow-x-auto pb-4 scrollbar-hide">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`flex items-center gap-3 px-8 py-4 rounded-[28px] text-sm font-black whitespace-nowrap transition-all border-b-4 active:scale-95 ${
              selectedCategory === cat.id 
              ? 'bg-amber-500 text-white border-amber-600 shadow-xl shadow-amber-500/20' 
              : 'bg-white dark:bg-slate-800 text-slate-500 border-slate-100 dark:border-slate-700 hover:bg-slate-50'
            }`}
          >
            <cat.icon size={20} className={selectedCategory === cat.id ? 'animate-bounce' : ''} />
            {cat.name}
          </button>
        ))}
      </div>

      {/* Global Actions Row */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6 p-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[48px] shadow-xl shadow-blue-500/20 relative overflow-hidden group border border-blue-500/30">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-400/20 rounded-full blur-3xl -mr-32 -mt-32 group-hover:scale-110 transition-transform duration-700" />
        <div className="flex items-center gap-6 relative z-10 w-full md:w-auto cursor-pointer" onClick={() => setShowForm(true)}>
          <div className="w-16 h-16 bg-amber-500 hover:bg-amber-400 transition-colors rounded-[28px] flex items-center justify-center text-white shadow-xl shadow-amber-500/30">
            <Plus size={32} />
          </div>
          <div>
            <h4 className="text-xl font-black text-white uppercase tracking-tighter">Anunciar Agora</h4>
            <p className="text-xs font-bold text-amber-500/80 uppercase tracking-widest leading-none">Venda rápido para quem mora ao lado</p>
          </div>
        </div>

        <div className="relative w-full md:w-96">
          <input 
            type="text"
            placeholder="O que você está procurando?"
            className="w-full bg-white/5 border border-white/10 rounded-[28px] px-12 py-5 text-white font-bold text-sm focus:bg-white/10 focus:ring-2 focus:ring-amber-500 transition-all outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-white/30" size={20} />
        </div>
      </div>

      {/* Listings Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mb-12">
        <AnimatePresence>
          {filteredListings.map((listing) => (
            <motion.div
              layout
              key={listing.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-slate-800 rounded-[32px] overflow-hidden border border-slate-100 dark:border-slate-700 hover:shadow-2xl hover:shadow-amber-500/10 transition-all flex flex-col"
            >
              {/* Card Header Social-like */}
              <div className="p-6 pb-4 border-b border-slate-100 dark:border-slate-700/50 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-slate-100 dark:bg-slate-900 rounded-full flex items-center justify-center text-slate-400 border border-slate-200 dark:border-slate-700">
                    <UserCircle2 size={24} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800 dark:text-white leading-none mb-1">{listing.author}</p>
                    <p className="text-[10px] font-medium text-slate-500 uppercase tracking-widest">{listing.unit} • {listing.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => handleEdit(listing)} className="p-2 text-slate-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-500/10 rounded-xl transition-colors">
                    <Edit3 size={18} />
                  </button>
                  <button onClick={() => handleDelete(listing.id)} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-colors">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              {/* Informações */}
              <div className="p-6 flex-1 flex flex-col">
                <h5 className="text-xl font-bold text-slate-800 dark:text-white mb-2 leading-snug">{listing.title}</h5>
                <p className="text-2xl font-black text-amber-600 mb-4 tracking-tighter">{listing.price}</p>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 leading-relaxed flex-1">
                  {listing.description}
                </p>
                
                {/* Miniaturas das Fotos */}
                {listing.imageUrls && listing.imageUrls.length > 0 && (
                  <div className="flex gap-3 mb-6">
                    {listing.imageUrls.map((url, i) => (
                      <div 
                        key={i} 
                        onClick={() => setExpandedImage(url)}
                        className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden cursor-pointer hover:opacity-80 transition-opacity border border-slate-200 dark:border-slate-700 shadow-sm"
                      >
                        <img src={url} alt={`Foto ${i+1}`} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                )}

                {/* Actions Bottom */}
                <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-700/50">
                  <span className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800/80 rounded-xl text-[10px] font-bold uppercase text-slate-500 tracking-widest border border-slate-200 dark:border-slate-700">
                    {listing.condition}
                  </span>
                  <a 
                    href={listing.whatsapp ? `https://wa.me/${listing.whatsapp.replace(/\D/g, '')}` : '#'} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    title="Falar no WhatsApp"
                    className="p-2.5 text-slate-400 hover:text-[#25D366] hover:bg-[#25D366]/10 rounded-full transition-colors flex items-center justify-center shrink-0"
                  >
                    <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredListings.length === 0 && (
          <div className="col-span-full py-32 text-center opacity-30 flex flex-col items-center">
            <ShoppingBag size={80} className="mb-6" />
            <h4 className="text-2xl font-black uppercase tracking-tighter">Nenhum anúncio por aqui</h4>
            <p className="text-sm font-bold uppercase tracking-widest mt-2">Seja o primeiro a anunciar nessa categoria!</p>
          </div>
        )}
      </div>

      {/* Aviso de Responsabilidade */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 rounded-[40px] text-white flex flex-col md:flex-row items-center gap-8 shadow-xl shadow-blue-500/20 mb-12">
        <div className="bg-white/10 p-4 rounded-3xl backdrop-blur-md shrink-0 focus-within:ring-2 focus-within:ring-amber-500">
          <Info size={40} className="text-amber-500 drop-shadow-md" />
        </div>
        <div className="text-center md:text-left">
          <h4 className="text-xl font-bold mb-2">Aviso de Responsabilidade</h4>
          <p className="opacity-80 text-sm max-w-4xl leading-relaxed">
            A administração do Sistema AiCondo360, o Síndico do Condomínio e o Administrador do Condomínio não se responsabilizam por quaisquer transações realizadas entre os condôminos na plataforma interna de Marketplace do Condomínio AiCondo360.
          </p>
        </div>
      </div>

      {/* Modal - Cadastrar/Editar Anúncio */}
      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between sticky top-0 bg-white dark:bg-slate-800 z-10">
                <h3 className="text-xl font-bold dark:text-white flex items-center gap-2">
                  <Tag className="text-amber-500" /> {editingId ? 'Editar Anúncio' : 'Novo Anúncio'}
                </h3>
                <button onClick={closeModal} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors">
                  <X size={24} className="text-slate-400" />
                </button>
              </div>
              <form className="p-6 space-y-5" onSubmit={(e) => { e.preventDefault(); handleCreateNew(); }}>
                
                {/* Imagens (Até 2) */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Fotos do Produto (Até 2 - Max 1MB/cada)
                  </label>
                  <div className="flex gap-4 items-center">
                    {formData.imageUrls.map((url, i) => (
                      <div key={i} className="relative w-24 h-24 rounded-2xl overflow-hidden border-2 border-slate-200 dark:border-slate-600">
                        <img src={url} alt={`Preview ${i+1}`} className="w-full h-full object-cover" />
                        <button 
                          type="button" 
                          onClick={() => setFormData(p => ({ ...p, imageUrls: p.imageUrls.filter((_, idx) => idx !== i) }))}
                          className="absolute top-1 right-1 bg-rose-500 text-white rounded-full p-1"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                    {formData.imageUrls.length < 2 && (
                      <div className="w-24 h-24 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-600 flex items-center justify-center relative hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                        <Camera size={28} className="text-slate-400" />
                        <input 
                          type="file" 
                          accept="image/*"
                          multiple
                          onChange={handleImageUpload}
                          className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Título do Anúncio *</label>
                    <input type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-xl p-3 focus:ring-2 focus:ring-amber-500 transition-all text-sm" placeholder="Ex: Bicicleta Caloi" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Preço</label>
                    <input type="text" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} required className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-xl p-3 focus:ring-2 focus:ring-amber-500 transition-all text-sm" placeholder="Ex: R$ 450,00" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Pequena Descrição *</label>
                  <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} required rows={3} className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-xl p-3 focus:ring-2 focus:ring-amber-500 transition-all text-sm" placeholder="Detalhes do seu produto..." />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Categoria</label>
                    <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-xl p-3 focus:ring-2 focus:ring-amber-500 transition-all text-sm">
                      <option value="eletronicos">Eletrônicos</option>
                      <option value="moveis">Móveis</option>
                      <option value="utilidades">Utilidades</option>
                      <option value="servicos">Serviços</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Seu WhatsApp *</label>
                    <input type="text" value={formData.whatsapp} onChange={e => setFormData({...formData, whatsapp: e.target.value})} required className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-xl p-3 focus:ring-2 focus:ring-amber-500 transition-all text-sm" placeholder="Ex: 11999999999" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Seu Nome</label>
                    <input type="text" value={formData.author} onChange={e => setFormData({...formData, author: e.target.value})} required className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-xl p-3 focus:ring-2 focus:ring-amber-500 transition-all text-sm" placeholder="Seu nome" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Unidade/Apt</label>
                    <input type="text" value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-xl p-3 focus:ring-2 focus:ring-amber-500 transition-all text-sm" placeholder="Sua unidade" />
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-4 rounded-2xl transition-colors shadow-lg shadow-amber-500/20 mt-4 outline-none border-none"
                >
                  {editingId ? 'Salvar Alterações' : 'Publicar Anúncio'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal - Ampliar Foto */}
      <AnimatePresence>
        {expandedImage && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md" onClick={() => setExpandedImage(null)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative max-w-4xl max-h-[90vh] w-full"
              onClick={e => e.stopPropagation()}
            >
              <button 
                onClick={() => setExpandedImage(null)} 
                className="absolute -top-12 right-0 p-2 text-white/70 hover:text-white transition-colors"
              >
                <X size={32} />
              </button>
              <img src={expandedImage} alt="Ampliada" className="w-full h-full object-contain rounded-xl" />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
