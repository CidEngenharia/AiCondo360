import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FEATURES } from '../constants';
import { ArrowLeft, Construction } from 'lucide-react';
import { motion } from 'motion/react';

export const FeatureDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const feature = FEATURES.find(f => f.id === id);

  if (!feature) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Funcionalidade não encontrada</h2>
        <button 
          onClick={() => navigate('/')}
          className="text-blue-600 font-semibold flex items-center gap-2"
        >
          <ArrowLeft size={16} /> Voltar ao Início
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      <header className="flex items-center gap-4">
        <button 
          onClick={() => navigate('/')}
          className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center shadow-sm border border-slate-100 dark:border-slate-700"
        >
          <ArrowLeft size={20} className="text-slate-600 dark:text-slate-300" />
        </button>
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">{feature.label}</h2>
          <p className="text-xs text-slate-500 uppercase tracking-wider font-medium">{feature.category}</p>
        </div>
      </header>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col items-center text-center space-y-4"
      >
        <div className={`w-20 h-20 rounded-2xl flex items-center justify-center text-white ${feature.color} shadow-lg shadow-blue-100 dark:shadow-none mb-4`}>
          <feature.icon size={40} />
        </div>
        
        <div className="bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 p-4 rounded-2xl flex items-center gap-3 border border-amber-100 dark:border-amber-800 mx-auto max-w-sm">
          <Construction size={24} className="flex-shrink-0" />
          <p className="text-xs font-medium text-left">
            A funcionalidade de <strong>{feature.label}</strong> está sendo integrada à nova versão do AiCondo360.
          </p>
        </div>

        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md">
            Estamos trabalhando para trazer a melhor experiência de gestão condominial diretamente para o seu dispositivo. Esta funcionalidade estará disponível em breve com recursos avançados de IA.
        </p>

        <button 
          onClick={() => navigate('/')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-blue-200 dark:shadow-none mt-4"
        >
          Entendi, voltar
        </button>
      </motion.div>
    </div>
  );
};
