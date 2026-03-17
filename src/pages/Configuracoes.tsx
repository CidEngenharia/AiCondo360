import React from 'react';
import { motion } from 'motion/react';
import { CreditCard, Shield, User, Bell, ChevronRight, Zap, Star, Check } from 'lucide-react';
import { PricingPlan } from '../constants';

interface SettingsProps {
  userPlan: PricingPlan;
  onPlanChange: (planId: PricingPlan) => void;
  userName: string;
}

export const Configuracoes: React.FC<SettingsProps> = ({ userPlan, onPlanChange, userName }) => {
  const plans = [
    {
      id: 'basic',
      name: 'Essencial (Basic)',
      price: 'R$ 199,00',
      features: ['Até 100 moradores', 'Mural de Avisos', 'Boletos Online', 'Reservas Básicas'],
      color: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
    },
    {
      id: 'premium',
      name: 'Premium',
      price: 'R$ 399,00',
      features: ['Moradores Ilimitados', 'Assembleias Virtuais', 'Gestão de Pets Avançada', 'Gestão de Consumo', 'Suporte 24/7'],
      color: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
      popular: true
    }
  ];

  return (
    <div className="p-4 space-y-8 pb-20">
      <header>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">Configurações</h2>
        <p className="text-sm text-slate-500">Gerencie sua conta e plano</p>
      </header>

      {/* Profile Section */}
      <section className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-300 text-2xl font-bold">
            {userName.charAt(0)}
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">{userName}</h3>
            <p className="text-xs text-slate-500">Usuário do plano {userPlan.toUpperCase()}</p>
          </div>
        </div>
        
        <div className="space-y-4">
          <button className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <User size={20} />
              </div>
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Dados Pessoais</span>
            </div>
            <ChevronRight size={18} className="text-slate-400 group-hover:translate-x-1 transition-transform" />
          </button>
          
          <button className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
                <Shield size={20} />
              </div>
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Segurança</span>
            </div>
            <ChevronRight size={18} className="text-slate-400 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </section>

      {/* Subscription Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h3 className="font-bold text-slate-800 dark:text-white">Seu Plano</h3>
          <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">Upgrade Disponível</span>
        </div>

        <div className="grid gap-4">
          {plans.map((plan) => (
            <motion.div
              key={plan.id}
              whileHover={{ scale: 1.01 }}
              className={cn(
                "relative bg-white dark:bg-slate-800 p-6 rounded-3xl border-2 transition-all",
                userPlan === plan.id 
                  ? "border-blue-500 dark:border-blue-600 shadow-lg shadow-blue-100 dark:shadow-none" 
                  : "border-slate-100 dark:border-slate-700"
              )}
            >
              {plan.popular && (
                <span className="absolute -top-3 left-6 flex items-center gap-1 bg-gradient-to-r from-amber-500 to-orange-600 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-lg">
                  <Star size={10} fill="currentColor" /> MAIS ESCOLHIDO
                </span>
              )}

              <div className="flex justify-between items-start mb-6">
                <div>
                  <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-1">{plan.name}</h4>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-slate-900 dark:text-white">{plan.price}</span>
                    <span className="text-xs text-slate-500">/mês</span>
                  </div>
                </div>
                {userPlan === plan.id && (
                  <div className="bg-blue-500 text-white p-1 rounded-full">
                    <Check size={16} />
                  </div>
                )}
              </div>

              <div className="space-y-3 mb-8">
                {plan.features.map((feature, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400">
                      <Check size={12} />
                    </div>
                    <span className="text-xs text-slate-600 dark:text-slate-400">{feature}</span>
                  </div>
                ))}
              </div>

              {userPlan !== plan.id ? (
                <button 
                  onClick={() => onPlanChange(plan.id as PricingPlan)}
                  className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-xl shadow-blue-200 dark:shadow-none transition-all flex items-center justify-center gap-2"
                >
                  <Zap size={16} fill="currentColor" />
                  Mudar para {plan.name}
                </button>
              ) : (
                <div className="w-full py-4 text-center text-blue-600 dark:text-blue-400 text-xs font-bold border border-blue-100 dark:border-blue-900/50 rounded-2xl bg-blue-50/50 dark:bg-blue-900/10">
                  Plano Atual Ativo
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </section>

      {/* Other Settings */}
      <section className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Preferências</h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between p-3 rounded-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 dark:text-orange-400">
                <Bell size={20} />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Notificações</span>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Push e Email</span>
              </div>
            </div>
            <div className="w-12 h-6 bg-blue-600 rounded-full flex items-center justify-end px-1 cursor-pointer">
              <div className="w-4 h-4 bg-white rounded-full"></div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

// Simple CN utility as it might not be exported from anywhere
function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
