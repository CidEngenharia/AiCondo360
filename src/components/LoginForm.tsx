import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, ChevronDown, Loader2, AlertCircle, Building2 } from 'lucide-react';
import { UserRole, PricingPlan } from '../constants';
import { supabase } from '../lib/supabase';

interface LoginFormProps {
  onLoginSuccess?: () => void;
  isAdminOnly?: boolean;
  setUser?: (user: any) => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ isAdminOnly = false, setUser }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [condo, setCondo] = useState('');
  const [condoId, setCondoId] = useState('');
  const [role, setRole] = useState<UserRole>('resident');
  const [step, setStep] = useState(isAdminOnly ? 2 : 1);
  const [showCondoDropdown, setShowCondoDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [condos, setCondos] = useState<{ id: string; name: string; plan: PricingPlan; location?: string }[]>([]);

  useEffect(() => {
    if (isAdminOnly) {
      setCondo('Administração Exclusiva');
      setRole('global_admin');
      return;
    }

    async function fetchCondos() {
      try {
        const { data, error } = await supabase
          .from('condominios')
          .select('*');
        
        if (!error && data && data.length > 0) {
          setCondos(data.map(c => ({
            id: c.id,
            name: c.name,
            plan: c.plan as PricingPlan,
            location: c.location || 'Brasil'
          })));
        } else {
          throw new Error('No condos found or error');
        }
      } catch (err) {
        setCondos([
          { id: 'paineiras', name: 'Condomínio Paineiras', plan: 'basic', location: 'São Paulo' },
          { id: 'jardim', name: 'Condomínio Jardim', plan: 'enterprise', location: 'Rio de Janeiro' },
          { id: 'miami', name: 'Condomínio Miami', plan: 'premium', location: 'Maceió' },
        ]);
      }
    }
    fetchCondos();
  }, [isAdminOnly]);

  const handleCondoSelect = (c: any) => {
    setCondo(c.name);
    setCondoId(c.id);
    setShowCondoDropdown(false);
    setStep(2);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Bypass para Demonstrativo/Admin
    if (email === 'admin@aicondo360.com' && password === 'admin123') {
      if (setUser) {
        setUser({
          id: 'admin-demo-id',
          name: 'Administrador Demo',
          email: 'admin@aicondo360.com',
          condo: 'Administração Exclusiva',
          condoId: 'admin-exclusive',
          role: 'global_admin',
          plan: 'premium'
        });
      }
      return;
    }

    if (email === 'morador@morador.com' && password === '123456') {
      if (setUser) {
        setUser({
          id: 'morador-demo-id',
          name: 'Morador Demonstrativo',
          email: 'morador@morador.com',
          condo: 'Condomínio Paineiras',
          condoId: 'paineiras',
          role: 'resident',
          plan: 'basic'
        });
      }
      return;
    }

    if (email === 'sindico@condominio.com' && password === 'sindico123') {
      if (setUser) {
        setUser({
          id: 'sindico-demo-id',
          name: 'Síndico Demonstrativo',
          email: 'sindico@condominio.com',
          condo: 'Condomínio Jardim',
          condoId: 'jardim',
          role: 'syndic',
          plan: 'enterprise'
        });
      }
      return;
    }

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;
    } catch (err: any) {
      setError(err.message || 'Erro ao realizar login. Verifique suas credenciais.');
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      {error && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/30 rounded-2xl flex items-center gap-3 text-red-600 dark:text-red-400 text-sm"
        >
          <AlertCircle size={18} />
          {error}
        </motion.div>
      )}

      <AnimatePresence mode="wait">
        {step === 1 ? (
          <motion.div 
            key="step1"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-6"
          >
            <div className="relative">
              <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 block px-1">Seu Condomínio</label>
              <button 
                onClick={() => setShowCondoDropdown(!showCondoDropdown)}
                className="w-full p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm flex items-center justify-between hover:border-blue-500 dark:hover:border-blue-500/50 transition-all text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl transition-colors ${condo ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                    <Building2 size={18} />
                  </div>
                  <span className={condo ? 'text-slate-900 dark:text-white font-semibold italic' : 'text-slate-400 font-medium italic'}>
                    {condo || 'Selecione onde você mora...'}
                  </span>
                </div>
                <ChevronDown size={20} className={`text-slate-400 transition-transform ${showCondoDropdown ? 'rotate-180' : ''}`} />
              </button>

              {showCondoDropdown && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute z-50 w-full mt-2 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden max-h-60 overflow-y-auto"
                >
                  {condos.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => handleCondoSelect(c)}
                      className="w-full p-4 text-left hover:bg-blue-50 dark:hover:bg-blue-900/20 border-b border-slate-50 dark:border-slate-800 last:border-0 transition-colors"
                    >
                      <p className="font-bold text-slate-800 dark:text-slate-200">{c.name}</p>
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider">{c.location} • Plano {c.plan}</p>
                    </button>
                  ))}
                </motion.div>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.form 
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            onSubmit={handleLogin} 
            className="space-y-5"
          >
            <div className="flex items-center justify-between mb-4 px-1">
              <div>
                <p className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">{condo}</p>
                <h2 className="text-xl font-bold text-slate-800 dark:text-white">Acesse o Sistema</h2>
              </div>
              {!isAdminOnly && (
                <button 
                  type="button" 
                  onClick={() => setStep(1)}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-slate-400"
                >
                  <ChevronDown className="rotate-90" size={18} />
                </button>
              )}
            </div>
            
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase ml-1">E-mail</label>
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="exemplo@email.com"
                  className="w-full p-4 rounded-2xl bg-white/50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 focus:bg-white dark:focus:bg-slate-900 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-sm outline-none dark:text-white"
                />
              </div>
              <div className="space-y-1">
                <div className="flex justify-between items-center px-1">
                  <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">Senha</label>
                  <button type="button" className="text-[10px] text-blue-600 dark:text-blue-400 font-bold uppercase hover:underline">Esqueci</button>
                </div>
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full p-4 rounded-2xl bg-white/50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 focus:bg-white dark:focus:bg-slate-900 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-sm outline-none dark:text-white"
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white p-4 rounded-2xl font-bold shadow-lg shadow-blue-500/20 hover:bg-blue-700 hover:shadow-blue-500/40 transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-70 disabled:cursor-not-allowed group active:scale-[0.98]"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  <span>Entrar</span>
                  <ShieldCheck size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
};
