import React from 'react';
import { motion } from 'motion/react';
import { Check, ArrowRight, Building2, Shield, Zap, Globe } from 'lucide-react';
import { PLANS } from '../constants';
import { useNavigate } from 'react-router-dom';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* Hero Section */}
      <header className="relative overflow-hidden pt-20 pb-32 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="flex flex-col items-center text-center">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white mb-8"
            >
              <Building2 size={32} />
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6"
            >
              Gestão Condominial <br />
              <span className="text-blue-600">Sem Complicações</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-slate-600 max-w-2xl mb-10"
            >
              O AiCondo360 é a plataforma definitiva para síndicos, administradores e moradores. 
              Tudo o que seu condomínio precisa em um só lugar.
            </motion.p>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex gap-4"
            >
              <button 
                onClick={() => navigate('/login')}
                className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all flex items-center gap-2"
              >
                Começar Agora
                <ArrowRight size={20} />
              </button>
              <button className="bg-white text-slate-900 px-8 py-4 rounded-2xl font-bold border border-slate-200 hover:bg-slate-50 transition-all">
                Ver Demonstração
              </button>
            </motion.div>
          </div>
        </div>
        
        {/* Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden opacity-20">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-400 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 -right-24 w-96 h-96 bg-indigo-400 rounded-full blur-3xl"></div>
        </div>
      </header>

      {/* Plans Section */}
      <section className="py-24 max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">Planos que cabem no seu condomínio</h2>
          <p className="text-slate-600">Escolha a melhor opção para a sua necessidade.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {PLANS.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={`p-8 rounded-[2.5rem] border ${plan.id === 'enterprise' ? 'border-blue-500 ring-4 ring-blue-50 shadow-xl' : 'border-slate-100 shadow-sm'} bg-white flex flex-col`}
            >
              {plan.id === 'enterprise' && (
                <span className="bg-blue-600 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full w-fit mb-6">Mais Popular</span>
              )}
              <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-black">R${plan.price}</span>
                <span className="text-slate-500 text-sm">/mês</span>
              </div>
              <p className="text-sm text-slate-600 mb-8">{plan.features}</p>
              
              <ul className="space-y-4 mb-10 flex-1">
                <li className="flex items-center gap-3 text-sm">
                  <Check size={18} className="text-emerald-500" />
                  <span>Acesso Moradores</span>
                </li>
                <li className="flex items-center gap-3 text-sm">
                  <Check size={18} className="text-emerald-500" />
                  <span>Boletos e Financeiro</span>
                </li>
                {plan.id !== 'basic' && (
                  <>
                    <li className="flex items-center gap-3 text-sm">
                      <Check size={18} className="text-emerald-500" />
                      <span>Mercado Interno</span>
                    </li>
                    <li className="flex items-center gap-3 text-sm">
                      <Check size={18} className="text-emerald-500" />
                      <span>Gestão de Visitantes</span>
                    </li>
                  </>
                )}
                {plan.id === 'premium' && (
                  <li className="flex items-center gap-3 text-sm">
                    <Check size={18} className="text-emerald-500" />
                    <span>Módulo Meus Pets</span>
                  </li>
                )}
              </ul>

              <button 
                onClick={() => navigate('/login')}
                className={`w-full py-4 rounded-2xl font-bold transition-all ${plan.id === 'enterprise' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 hover:bg-blue-700' : 'bg-slate-900 text-white hover:bg-slate-800'}`}
              >
                Assinar Agora
              </button>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-4 gap-12">
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-6 text-2xl font-bold">
              <Building2 size={32} className="text-blue-500" />
              AiCondo360
            </div>
            <p className="text-slate-400 max-w-md">
              Transformando a convivência em condomínios através da tecnologia e transparência.
            </p>
          </div>
          <div>
            <h4 className="font-bold mb-6">Produto</h4>
            <ul className="space-y-4 text-slate-400 text-sm">
              <li>Funcionalidades</li>
              <li>Planos</li>
              <li>Segurança</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-6">Suporte</h4>
            <ul className="space-y-4 text-slate-400 text-sm">
              <li>Ajuda</li>
              <li>Contato</li>
              <li>Privacidade</li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
};
