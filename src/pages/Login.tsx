import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Building2, ShieldCheck, Globe, ChevronDown, User, Shield, Briefcase, Loader2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { UserRole, PricingPlan } from '../constants';
import { supabase } from '../lib/supabase';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [condo, setCondo] = useState('');
  const [condoId, setCondoId] = useState('');
  const [role, setRole] = useState<UserRole>('resident');
  const [plan, setPlan] = useState<PricingPlan>('basic');
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showCondoDropdown, setShowCondoDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [condos, setCondos] = useState<{ id: string; name: string; plan: PricingPlan; location?: string }[]>([]);

  useEffect(() => {
    async function fetchCondos() {
      const { data, error } = await supabase
        .from('condominios')
        .select('*');
      
      if (!error && data) {
        setCondos(data.map(c => ({
          id: c.id,
          name: c.name,
          plan: c.plan as PricingPlan,
          location: 'Localização Padrão' // No schema real não tinha location, vou deixar fixo ou tirar
        })));
      } else {
        // Fallback for demo if table is empty
        setCondos([
          { id: 'paineiras', name: 'Condomínio Paineiras', plan: 'basic' },
          { id: 'jardim', name: 'Condomínio Jardim', plan: 'enterprise' },
          { id: 'miami', name: 'Condomínio Miami', plan: 'premium' },
        ]);
      }
    }
    fetchCondos();
  }, []);

  const handleCondoSelect = (c: any) => {
    setCondo(c.name);
    setCondoId(c.id);
    setPlan(c.plan);
    setShowCondoDropdown(false);
    setStep(2);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const cleanEmail = email.trim();
      const cleanPassword = password.trim();

      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: cleanPassword,
      });

      if (authError) throw authError;

      // Buscar o perfil do usuário recém autenticado
      const { data: profile } = await supabase
         .from('profiles')
         .select('condominio_id, role')
         .eq('id', data.user.id)
         .maybeSingle();

      const isGlobalAdminProfile = profile?.role === 'global_admin' || profile?.role === 'admin_global';

      // 1. Bloqueio de isolamento: Se não for admin global, proibir login no lugar errado
      if (profile && !isGlobalAdminProfile && role !== 'global_admin') {
         if (profile.condominio_id && condoId && profile.condominio_id !== condoId) {
            await supabase.auth.signOut();
            setError('⚠️ Você está tentando acessar o condomínio errado. Por favor, volte e selecione o seu condomínio correto.');
            setLoading(false);
            return;
         }
      }

      // 2. Opção isolada do Admin: Se for admin global e tiver escolhido um condomínio, salva a escolha
      if ((isGlobalAdminProfile || role === 'global_admin') && condoId) {
         localStorage.setItem('admin_selected_condo', condoId);
      } else {
         localStorage.removeItem('admin_selected_condo'); // Limpa caso use acesso geral
      }

    } catch (err: any) {
      setError(err.message || 'Erro ao realizar login. Verifique suas credenciais.');
      setLoading(false);
    }
  };

  const roles: { id: UserRole; label: string; icon: any }[] = [
    { id: 'resident', label: 'Morador', icon: User },
    { id: 'admin', label: 'Administrador', icon: Shield },
    { id: 'syndic', label: 'Síndico', icon: Briefcase },
  ];

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
          <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4 p-2">
            <img src="/favicon.jpg" alt="AiCondo360 Logo" className="w-12 h-12 object-contain" />
          </div>
          <h1 className="text-2xl font-bold">AiCondo360</h1>
          <p className="text-blue-100 text-sm">Sua vida em condomínio, simplificada.</p>
        </div>

        <div className="p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-sm">
              <AlertCircle size={18} />
              {error}
            </div>
          )}

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
                    className="absolute z-50 w-full mt-2 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden max-h-60 overflow-y-auto"
                  >
                    {condos.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => handleCondoSelect(c)}
                        className="w-full p-4 text-left hover:bg-blue-50 border-b border-slate-50 last:border-0 transition-colors"
                      >
                        <p className="font-bold text-slate-800">{c.name}</p>
                        <p className="text-[10px] text-slate-500 uppercase tracking-wider">{c.location || 'Brasil'} • Plano {c.plan}</p>
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
                onClick={() => {
                  setCondo('Acesso Global');
                  setRole('global_admin');
                  setStep(2);
                }}
                className="w-full p-4 rounded-2xl border border-slate-100 bg-slate-900 text-white flex items-center justify-center gap-3 hover:bg-slate-800 transition-all font-bold"
              >
                <ShieldCheck size={20} />
                Acesso Administrador Global
              </button>
            </div>
          ) : (
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="text-center mb-6">
                <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-1">{condo}</p>
                <h2 className="text-xl font-bold text-slate-800">Identifique-se</h2>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">E-mail</label>
                  <input 
                    type="email" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    className="w-full p-4 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 focus:ring-0 transition-all text-sm outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Senha</label>
                  <div className="relative">
                    <input 
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full p-4 pr-12 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 focus:ring-0 transition-all text-sm outline-none"
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-500 transition-colors"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white p-4 rounded-2xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : 'Entrar no Sistema'}
                {!loading && <ShieldCheck size={20} />}
              </button>

              <div className="flex items-center justify-between pt-2">
                <button type="button" onClick={() => setStep(1)} className="text-xs text-slate-500 font-medium">Voltar</button>
                <button type="button" className="text-xs text-blue-600 font-bold">Esqueci minha senha</button>
              </div>
            </form>
          )}
        </div>
      </motion.div>
      
      <p className="mt-8 text-slate-400 text-[10px] font-medium uppercase tracking-[0.2em]">AiCondo360 SaaS Platform v1.0</p>
    </div>
  );
};
