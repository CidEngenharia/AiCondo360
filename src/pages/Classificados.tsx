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
  MoreVertical,
  X,
  Smartphone as SmartphoneIcon,
  Laptop,
  Sofa,
  Hammer
} from 'lucide-react';
import { FeatureHeader } from '../components/FeatureHeader';

type Listing = {
  id: string;
  title: string;
  price: string;
  category: string;
  author: string;
  unit: string;
  imageUrl: string;
  description: string;
  date: string;
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
    imageUrl: 'https://images.unsplash.com/photo-1632661674596-df8be070a5c5?w=400&h=300&fit=crop', 
    description: 'Estado de novo, bateria 92%. Acompanha caixa e cabo original.', date: 'Hoje', condition: 'usado' 
  },
  { 
    id: '2', title: 'Sofá Retrátil 3 Lugares', price: 'R$ 1.200', category: 'moveis', author: 'Sônia', unit: 'Torre B 41', 
    imageUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=300&fit=crop', 
    description: 'Cinza chumbo, em ótimo estado. Retirada por conta do comprador.', date: 'Ontem', condition: 'usado' 
  },
  { 
    id: '3', title: 'Aulas de Violão p/ Iniciantes', price: 'R$ 80/h', category: 'servicos', author: 'Felipe', unit: 'Apto 88', 
    imageUrl: 'https://images.unsplash.com/photo-1510915363646-a6217664d442?w=400&h=300&fit=crop', 
    description: 'Aulas teóricas e práticas. Experiência de 10 anos.', date: 'Há 2 dias', condition: 'novo' 
  },
  { 
    id: '4', title: 'Smart TV Samsung 50"', price: 'R$ 1.950', category: 'eletronicos', author: 'Mariana', unit: 'Apto 12', 
    imageUrl: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400&h=300&fit=crop', 
    description: '4K HDR, Crystal UHD. 1 ano de uso, sem detalhes.', date: 'Ontem', condition: 'usado' 
  },
];

export const Classificados: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);

  const filteredListings = INITIAL_LISTINGS.filter(l => 
    (selectedCategory === 'all' || l.category === selectedCategory) &&
    (l.title.toLowerCase().includes(searchTerm.toLowerCase()) || l.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <FeatureHeader 
        icon={ShoppingBag}
        title="Classificados Internos"
        description="O marketplace exclusivo do AiCondo360. Compre, venda ou troque itens com segurança diretamente com seus vizinhos."
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
      <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6 p-10 bg-slate-900 rounded-[48px] shadow-2xl relative overflow-hidden group border border-slate-800">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl -mr-32 -mt-32 group-hover:scale-110 transition-transform duration-700" />
        <div className="flex items-center gap-6 relative z-10 w-full md:w-auto">
          <div className="w-16 h-16 bg-amber-500 rounded-[28px] flex items-center justify-center text-white shadow-xl shadow-amber-500/30">
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
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white dark:bg-slate-800 rounded-[40px] overflow-hidden border border-slate-100 dark:border-slate-700 hover:shadow-2xl hover:shadow-amber-500/10 transition-all group flex flex-col"
            >
              <div className="relative h-56 overflow-hidden">
                <img 
                  src={listing.imageUrl} 
                  alt={listing.title} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute top-4 left-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-800 dark:text-white shadow-sm">
                  {listing.condition}
                </div>
                <button className="absolute top-4 right-4 p-3 bg-white/95 dark:bg-slate-900/95 backdrop-blur rounded-full text-slate-400 hover:text-rose-500 transition-all shadow-sm active:scale-90">
                  <Heart size={18} />
                </button>
              </div>

              <div className="p-8 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-3">
                  <h5 className="text-xl font-black text-slate-800 dark:text-white leading-tight uppercase tracking-tighter truncate">{listing.title}</h5>
                </div>
                <p className="text-2xl font-black text-amber-600 mb-6 font-mono tracking-tighter">{listing.price}</p>
                
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-6 line-clamp-2 leading-relaxed">
                  {listing.description}
                </p>

                <div className="pt-6 border-t border-slate-50 dark:border-slate-700/50 mt-auto">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-100 dark:bg-slate-900 rounded-full flex items-center justify-center text-slate-400">
                        <UserCircle2 size={24} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-800 dark:text-white uppercase tracking-tighter leading-none mb-1">{listing.author}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">{listing.unit}</p>
                      </div>
                    </div>
                    <button className="p-3 bg-amber-50 dark:bg-amber-500/10 text-amber-600 rounded-2xl hover:bg-amber-500 hover:text-white transition-all shadow-sm">
                      <MessageSquare size={20} />
                    </button>
                  </div>
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

      {/* Featured Sellers / Stats */}
      <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-12 rounded-[56px] text-white flex flex-col items-center text-center shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
        <Sparkles size={48} className="mb-6 drop-shadow-lg text-amber-100" />
        <h4 className="text-4xl font-black uppercase tracking-tighter mb-4 italic">Clube de Vantagens</h4>
        <p className="max-w-2xl text-lg font-bold opacity-90 leading-relaxed mb-10">
          Vizinhos verificados possuem taxas menores em serviços compartilhados e prioridade na entrega interna.
        </p>
        <div className="flex flex-wrap justify-center gap-12">
          <div className="flex flex-col items-center">
            <span className="text-5xl font-black mb-1 leading-none tracking-tighter">120+</span>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">Trocas Reais</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-5xl font-black mb-1 leading-none tracking-tighter">98%</span>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">Satisfação</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-5xl font-black mb-1 leading-none tracking-tighter">4.2t</span>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">CO2 Economizado</span>
          </div>
        </div>
      </div>
    </div>
  );
};
