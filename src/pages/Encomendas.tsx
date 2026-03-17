import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Package, Search, Calendar, User, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { FeatureHeader } from '../components/FeatureHeader';
import { PackageService, Encomenda } from '../services/supabaseService';

interface EncomendasProps {
  userId: string;
}

export const Encomendas: React.FC<EncomendasProps> = ({ userId }) => {
  const [packages, setPackages] = useState<Encomenda[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'delivered'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchPackages = async () => {
      setLoading(true);
      try {
        const data = await PackageService.getUserPackages(userId);
        setPackages(data);
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
                          pkg.tracking_code?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

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
            placeholder="Buscar por descrição ou código..."
            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
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
            Retiradas
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(id => (
            <div key={id} className="bg-white dark:bg-slate-800 p-6 rounded-3xl h-48 animate-pulse border border-slate-100 dark:border-slate-700"></div>
          ))}
        </div>
      ) : filteredPackages.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPackages.map((pkg) => (
            <motion.div
              key={pkg.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-xl hover:shadow-orange-500/10 transition-all group"
            >
              <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-2xl ${pkg.status === 'pending' ? 'bg-orange-100 text-orange-600' : 'bg-emerald-100 text-emerald-600'}`}>
                  <Package size={24} />
                </div>
                <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${pkg.status === 'pending' ? 'bg-orange-100 text-orange-600' : 'bg-emerald-100 text-emerald-600'}`}>
                  {pkg.status === 'pending' ? 'Para Retirar' : 'Retirado'}
                </div>
              </div>

              <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-2 group-hover:text-orange-600 transition-colors">
                {pkg.description}
              </h3>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 text-sm text-slate-500">
                  <Calendar size={16} className="text-slate-400" />
                  <span>{new Date(pkg.arrival_date).toLocaleDateString('pt-BR')}</span>
                </div>
                {pkg.tracking_code && (
                  <div className="flex items-center gap-3 text-sm text-slate-500">
                    <CheckCircle2 size={16} className="text-slate-400" />
                    <span>Cód: {pkg.tracking_code}</span>
                  </div>
                )}
                {pkg.status === 'delivered' && pkg.delivery_date && (
                   <div className="flex items-center gap-3 text-sm text-slate-500">
                    <Clock size={16} className="text-slate-400" />
                    <span>Retirado em: {new Date(pkg.delivery_date).toLocaleString('pt-BR')}</span>
                  </div>
                )}
              </div>

              {pkg.status === 'pending' && (
                <div className="pt-4 border-t border-slate-50 dark:border-slate-700 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Recebido por: Portaria</span>
                  <div className="flex items-center gap-1 text-orange-600 text-xs font-bold">
                    <AlertCircle size={14} />
                    <span>Aguardando você</span>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
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

      {/* Security Tip */}
      <div className="mt-12 bg-gradient-to-br from-indigo-600 to-blue-700 p-8 rounded-[40px] text-white flex flex-col md:flex-row items-center gap-8 shadow-xl shadow-blue-500/20">
        <div className="bg-white/10 p-4 rounded-3xl backdrop-blur-md">
          <CheckCircle2 size={40} />
        </div>
        <div className="text-center md:text-left">
          <h4 className="text-xl font-bold mb-2">Agilidade na Portaria</h4>
          <p className="opacity-80 text-sm max-w-xl">
            Sempre que retirar uma encomenda, certifique-se de que o porteiro registrou a saída no sistema. Isso nos ajuda a manter a organização e segurança de todos os moradores.
          </p>
        </div>
        <button className="whitespace-nowrap bg-white text-blue-600 px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:scale-105 transition-transform">
          Ver Histórico Completo
        </button>
      </div>
    </div>
  );
};
