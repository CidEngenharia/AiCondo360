import React from 'react';
import { Star, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

interface UpgradeBannerProps {
  currentPlan: string;
}

export const UpgradeBanner: React.FC<UpgradeBannerProps> = ({ currentPlan }) => {
  if (currentPlan === 'premium') return null;

  return (
    <motion.section 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-500 to-orange-600 p-6 text-white shadow-xl shadow-orange-200 dark:shadow-none mb-6"
    >
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Star size={16} fill="white" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Potencialize seu Condomínio</span>
          </div>
          <h4 className="text-xl font-bold mb-1">Upgrade para o Plano Premium</h4>
          <p className="text-xs text-orange-100 opacity-90">Tenha acesso a Gestão de Consumo, Pets ilimitados e Assembleias Virtuais Avançadas.</p>
        </div>
        <button className="bg-white text-orange-600 px-6 py-3 rounded-2xl text-sm font-bold shadow-lg flex items-center justify-center gap-2 hover:bg-orange-50 transition-colors w-fit">
          Ver Planos
          <ArrowRight size={16} />
        </button>
      </div>
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
    </motion.section>
  );
};
