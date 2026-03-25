import React from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  ShoppingBag, 
  Store, 
  Clock, 
  Star, 
  Filter, 
  ArrowRight,
  TrendingUp,
  Tag,
  Hammer,
  Truck,
  Monitor
} from 'lucide-react';
import { cn } from '../lib/utils';

const categories = [
  { id: 1, name: 'Tudo', active: true, icon: ShoppingBag },
  { id: 2, name: 'Serviços', active: false, icon: Hammer },
  { id: 3, name: 'Entrega', active: false, icon: Truck },
  { id: 4, name: 'Tecnologia', active: false, icon: Monitor },
  { id: 5, name: 'Promoções', active: false, icon: Tag },
];

const highlights = [
  {
    id: 1,
    title: 'Limpeza de Fachada',
    provider: 'ProClean Condos',
    rating: 4.8,
    reviews: 124,
    price: 'R$ 450,00',
    image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=400',
    category: 'Manutenção'
  },
  {
    id: 2,
    title: 'Reparo de Ar Condicionado',
    provider: 'ArTech Solutions',
    rating: 4.9,
    reviews: 89,
    price: 'A partir de R$ 120,00',
    image: 'https://images.unsplash.com/photo-1590426466820-b3f3ef80dc2d?auto=format&fit=crop&q=80&w=400',
    category: 'Reparo'
  },
  {
    id: 3,
    title: 'Monitoramento 24h',
    provider: 'SafeGuard Sec',
    rating: 4.7,
    reviews: 215,
    price: 'R$ 89,90/mês',
    image: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&q=80&w=400',
    category: 'Segurança'
  }
];

const neighborAds = [
  { id: 1, title: 'Vaga de Garagem G2-45', price: 'R$ 250,00', date: 'Hoje', status: 'Disponível' },
  { id: 2, title: 'Bicicleta Caloi Aro 29', price: 'R$ 1.200,00', date: 'Ontem', status: 'Novo' },
  { id: 3, title: 'Livros de Direito', price: 'R$ 150,00', date: '05 Fev', status: 'Usado' },
];

export default function Marketplace() {
  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Marketplace</h1>
          <p className="text-slate-500 dark:text-slate-400">Serviços e parcerias exclusivas para morar melhor.</p>
        </div>
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="O que você precisa hoje?" 
            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all text-slate-900 dark:text-white shadow-sm"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {categories.map((cat) => (
          <button
            key={cat.id}
            className={cn(
              "flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all whitespace-nowrap",
              cat.active 
                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" 
                : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700"
            )}
          >
            <cat.icon size={18} />
            {cat.name}
          </button>
        ))}
        <button className="flex items-center gap-2 px-4 py-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
          <Filter size={18} />
          Filtros
        </button>
      </div>

      {/* Featured Services */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Store className="text-blue-600 dark:text-blue-400" size={24} />
            Serviços em Destaque
          </h2>
          <button className="text-blue-600 dark:text-blue-400 font-bold flex items-center gap-1 hover:gap-2 transition-all">
            Ver tudo <ArrowRight size={18} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {highlights.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm hover:shadow-xl transition-all cursor-pointer"
            >
              <div className="h-48 overflow-hidden relative">
                <img 
                  src={item.image} 
                  alt={item.title} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 bg-black/50 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-widest rounded-full">
                    {item.category}
                  </span>
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-1 text-amber-500 mb-2">
                  <Star size={16} fill="currentColor" />
                  <span className="text-xs font-black">{item.rating}</span>
                  <span className="text-slate-400 font-medium ml-1">({item.reviews})</span>
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {item.title}
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">{item.provider}</p>
                <div className="flex items-center justify-between">
                  <span className="text-blue-600 dark:text-blue-400 font-black text-lg">{item.price}</span>
                  <button className="p-3 bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                    <ShoppingBag size={20} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Neighbor Marketplace */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Anúncios Vizinhos</h2>
            <button className="text-sm font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-4 py-2 rounded-xl">Criar Anúncio</button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {neighborAds.map((ad, index) => (
              <motion.div
                key={ad.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700 flex flex-col justify-between hover:border-blue-400 transition-colors group cursor-pointer"
              >
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">{ad.status}</span>
                    <span className="text-xs text-slate-400">{ad.date}</span>
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors uppercase tracking-tight">{ad.title}</h3>
                </div>
                <div className="mt-6 flex items-baseline gap-2">
                  <span className="text-xl font-black text-slate-900 dark:text-white">{ad.price}</span>
                  <span className="text-xs text-slate-400 font-medium">Negociável</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Benefits Card */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-[32px] p-8 text-white relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/20 blur-[60px] rounded-full -translate-y-1/2 translate-x-1/2"></div>
          
          <div className="relative z-10 space-y-6">
            <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20">
              <TrendingUp size={28} className="text-blue-400" />
            </div>
            <div>
              <h3 className="text-2xl font-black leading-tight tracking-tight uppercase">Benefícios<br/>Clube AiCondo</h3>
              <p className="text-slate-400 mt-2 text-sm leading-relaxed">Assine para ter frete grátis, descontos de até 25% em serviços e suporte prioritário do concierge.</p>
            </div>
            <button className="w-full bg-blue-600 py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg shadow-blue-500/20 hover:bg-blue-500 transition-all active:scale-95">
              Conhecer AiCondo+
            </button>
            
            <div className="pt-6 border-t border-white/10 flex items-center gap-4">
              <div className="flex -space-x-2">
                {[1,2,3].map(i => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center text-[10px] font-bold">U{i}</div>
                ))}
              </div>
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">42 vizinhos assinam</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
