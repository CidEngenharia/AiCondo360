import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Building2, ArrowRight, ShieldCheck, Globe, ChevronDown, User, Shield, Briefcase } from 'lucide-react';
import { UserRole, PricingPlan } from '../constants';

interface LoginProps {
  onLogin: (user: { name: string; condo: string; role: UserRole; plan: PricingPlan }) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [condo, setCondo] = useState('');
  const [role, setRole] = useState<UserRole>('resident');
  const [plan, setPlan] = useState<PricingPlan>('basic');
  const [step, setStep] = useState(1);
  const [showCondoDropdown, setShowCondoDropdown] = useState(false);

  const condos = [
    { id: 'paineiras', name: 'Condomínio Paineiras', location: 'São Paulo, SP', plan: 'basic' as PricingPlan },
    { id: 'jardim', name: 'Condomínio Jardim', location: 'Rio de Janeiro, RJ', plan: 'enterprise' as PricingPlan },
    { id: 'miami', name: 'Condomínio Miami', location: 'Curitiba, PR', plan: 'premium' as PricingPlan },
  ];

  const roles: { id: UserRole; label: string; icon: any }[] = [
    { id: 'resident', label: 'Morador', icon: User },
    { id: 'admin', label: 'Administrador', icon: Shield },
    { id: 'syndic', label: 'Síndico', icon: Briefcase },
  ];

  const handleCondoSelect = (c: typeof condos[0]) => {
    setCondo(c.name);
    setPlan(c.plan);
    setShowCondoDropdown(false);
    setStep(2);
  };

  const handleGlobalAdminLogin = () => {
    onLogin({ 
      name: 'Admin Geral', 
      condo: 'Todos os Condomínios', 
      role: 'global_admin', 
      plan: 'premium' 
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200 overflow-hidden border border-slate-100"
      >
        <div className="bg-blue-600 p-8 text-white text-center relative">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
            <Globe className="w-64 h-64 -ml-20 -mt-20" />
          </div>
          <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Building2 size={32} />
          </div>
          <h1 className="text-2xl font-bold">AiCondo360</h1>
          <p className="text-blue-100 text-sm">Sua vida em condomínio, simplificada.</p>
        </div>

        <div className="p-8">
          {step === 1 ? (
            <div className="space-y-6">
              <div className="relative">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 block">Selecione seu Condomínio</label>
                <button 
                  onClick={() => setShowCondoDropdown(!showCondoDropdown)}
                  className="w-full p-4 rounded-2xl border border-slate-100 bg-slate-50 flex items-center justify-between hover:bg-white hover:border-blue-500 transition-all"
                >
                  <span className={condo ? 'text-slate-900 font-bold' : 'text-slate-400'}>
                    {condo || 'Escolha um condomínio...'}
                  </span>
                  <ChevronDown size={20} className={`text-slate-400 transition-transform ${showCondoDropdown ? 'rotate-180' : ''}`} />
                </button>

                {showCondoDropdown && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute z-50 w-full mt-2 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden"
                  >
                    {condos.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => handleCondoSelect(c)}
                        className="w-full p-4 text-left hover:bg-blue-50 border-b border-slate-50 last:border-0 transition-colors"
                      >
                        <p className="font-bold text-slate-800">{c.name}</p>
                        <p className="text-[10px] text-slate-500 uppercase tracking-wider">{c.location} • Plano {c.plan}</p>
                      </button>
                    ))}
                  </motion.div>
                )}
              </div>

              <div className="relative flex items-center py-2">
                <div className="flex-grow border-t border-slate-100"></div>
                <span className="flex-shrink mx-4 text-slate-300 text-[10px] font-bold uppercase tracking-widest">Ou</span>
                <div className="flex-grow border-t border-slate-100"></div>
              </div>

              <button 
                onClick={handleGlobalAdminLogin}
                className="w-full p-4 rounded-2xl border border-slate-100 bg-slate-900 text-white flex items-center justify-center gap-3 hover:bg-slate-800 transition-all font-bold"
              >
                <ShieldCheck size={20} />
                Acesso Administrador Global
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-1">{condo}</p>
                <h2 className="text-xl font-bold text-slate-800">Selecione seu Perfil</h2>
              </div>
              
              <div className="grid grid-cols-3 gap-3">
                {roles.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => setRole(r.id)}
                    className={`flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all ${role === r.id ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-slate-100 text-slate-400 hover:border-slate-200'}`}
                  >
                    <r.icon size={20} />
                    <span className="text-[10px] font-bold uppercase">{r.label}</span>
                  </button>
                ))}
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">E-mail</label>
                  <input 
                    type="email" 
                    placeholder="seu@email.com"
                    className="w-full p-4 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 focus:ring-0 transition-all text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Senha</label>
                  <input 
                    type="password" 
                    placeholder="••••••••"
                    className="w-full p-4 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 focus:ring-0 transition-all text-sm"
                  />
                </div>
              </div>

              <button 
                onClick={() => onLogin({ name: role === 'resident' ? 'Rogger Castano' : role === 'syndic' ? 'Síndico Silva' : 'Admin Admin', condo, role, plan })}
                className="w-full bg-blue-600 text-white p-4 rounded-2xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
              >
                Entrar no Sistema
                <ShieldCheck size={20} />
              </button>

              <div className="flex items-center justify-between pt-2">
                <button onClick={() => setStep(1)} className="text-xs text-slate-500 font-medium">Voltar</button>
                <button className="text-xs text-blue-600 font-bold">Esqueci minha senha</button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
      
      <p className="mt-8 text-slate-400 text-[10px] font-medium uppercase tracking-[0.2em]">AiCondo360 SaaS Platform v1.0</p>
    </div>
  );
};
