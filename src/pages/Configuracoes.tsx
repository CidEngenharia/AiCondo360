import React, { useState } from 'react';
import { 
  Camera, Check, X, Bell, Moon, 
  Lock, Settings, ChevronRight,
  Smartphone, Database, Plus,
  Palette, Sun, Layout, Trash2, Eye,
  Shield, Mail, Volume2, Monitor,
  User, CheckCircle2, AlertTriangle,
  History, Cpu, Globe, CreditCard,
  Edit, HardDrive, Zap, Info, Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';

// Shared Components
const SettingsCard: React.FC<{ title: string; subtitle: string; icon: any; children: React.ReactNode; color: string }> = ({ title, subtitle, icon: Icon, children, color }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] p-8 shadow-sm h-full flex flex-col"
  >
    <div className="flex items-center gap-4 mb-8">
      <div className={`p-4 rounded-2xl bg-${color}-50 text-${color}-600 dark:bg-${color}-900/20 shadow-sm`}>
        <Icon size={24} />
      </div>
      <div>
        <h2 className="text-xl font-black text-slate-800 dark:text-white tracking-tight">{title}</h2>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-1">{subtitle}</p>
      </div>
    </div>
    <div className="space-y-2 flex-grow">
      {children}
    </div>
  </motion.div>
);

const SettingItem: React.FC<{ 
  icon: any; 
  label: string; 
  description: string; 
  action?: React.ReactNode; 
  destructive?: boolean;
  onClick?: () => void;
}> = ({ icon: Icon, label, description, action, destructive, onClick }) => (
  <div 
    onClick={onClick}
    className="flex items-center justify-between group cursor-pointer p-4 -mx-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all border border-transparent hover:border-slate-100 dark:hover:border-slate-700"
  >
    <div className="flex items-center gap-4 min-w-0">
      <div className={`p-3 rounded-xl transition-all flex-shrink-0 ${destructive ? 'text-rose-500 bg-rose-50 dark:bg-rose-900/20' : 'text-slate-400 bg-slate-50 dark:bg-slate-800 group-hover:text-blue-500 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20'}`}>
        <Icon size={20} />
      </div>
      <div className="min-w-0">
        <h4 className={`text-sm font-bold truncate ${destructive ? 'text-rose-600' : 'text-slate-800 dark:text-slate-200 uppercase tracking-tight'}`}>{label}</h4>
        <p className="text-xs text-slate-500 dark:text-slate-500 font-medium leading-relaxed truncate">{description}</p>
      </div>
    </div>
    <div className="flex items-center flex-shrink-0 ml-4">
      {action || <ChevronRight size={18} className="text-slate-300 group-hover:text-slate-500 transition-all group-hover:translate-x-1" />}
    </div>
  </div>
);

const CustomToggle: React.FC<{ active: boolean; onChange: () => void }> = ({ active, onChange }) => (
  <div 
    onClick={(e) => { e.stopPropagation(); onChange(); }}
    className={`w-12 h-6 rounded-full relative transition-all cursor-pointer shadow-inner ${active ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-700'}`}
  >
    <motion.div 
      animate={{ x: active ? 26 : 4 }}
      className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-md"
    />
  </div>
);

export const Configuracoes: React.FC = () => {
  const { user } = useAuth();
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  
  const [userInfo, setUserInfo] = useState({
    name: user?.name || 'Sidney Souza',
    role: user?.role === 'syndic' ? 'SÍNDICO GERAL PRO' : user?.role === 'admin' ? 'ADMINISTRADOR GLOBAL' : 'MORADOR TOP 360',
    email: user?.email || 'sidney@andru.ia',
    phone: '+55 (71) 98765-4321',
    avatar: `https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=0066FF&color=fff`
  });

  const [security, setSecurity] = useState({
    twoFactor: true,
    activityLog: false
  });

  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sounds: false
  });

  const [visual, setVisual] = useState({
    darkMode: false,
    compact: true,
    theme: 'blue'
  });

  const [systemInfo, setSystemInfo] = useState({
    version: '3.6.4-PRO+BUILD.2026',
    env: 'Produção Cloud',
    server: 'AWS us-east-1 (Virginia)',
    lastUpdate: 'há 2 dias',
    status: 'Estável'
  });

  const [accountDetails, setAccountDetails] = useState({
    plan: 'Premium Anual - Business',
    expiry: '12 Out, 2026',
    limit: '5.000 Reservas/mês',
    usage: '12%'
  });

  if (!user) return null;

  return (
    <div className="p-6 lg:p-10 space-y-10">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
             <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                <Settings size={22} className="animate-spin-slow text-white" />
             </div>
             <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Configurações</h1>
          </div>
          <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.22em] ml-13 opacity-80">Gestão de Sistema e Conta de Usuário</p>
        </div>
        
        <div className="flex items-center gap-3">
           <button className="flex items-center gap-2 px-5 py-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm hover:translate-y-[-2px] transition-all group">
              <Plus size={16} className="text-blue-600 group-hover:rotate-90 transition-transform" />
              <span className="text-[11px] font-black uppercase text-slate-700 dark:text-slate-200">Criar Novo Recurso</span>
           </button>
           <button className="p-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm hover:text-blue-600 transition-all text-slate-400">
              <History size={20} />
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Card 1: Detalhes da Conta do Usuário */}
        <SettingsCard 
          title="Minha Conta" 
          subtitle="PLANO E GESTÃO DO USUÁRIO" 
          icon={User} 
          color="blue"
        >
          <div className="space-y-6">
            <div className="flex items-center gap-5 p-5 bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] border border-slate-100 dark:border-slate-700">
               <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-md ring-2 ring-white dark:ring-slate-800">
                 <img src={userInfo.avatar} alt="Avatar" className="w-full h-full object-cover" />
               </div>
               <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-black text-slate-900 dark:text-white truncate uppercase tracking-tighter">{userInfo.name}</h3>
                  <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mt-1">ID: #UX-78{user.id.slice(-4)} • {userInfo.role}</p>
               </div>
               <div className="flex gap-1">
                  <button onClick={() => setIsEditingProfile(true)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all"><Edit size={16}/></button>
                  <button className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-all"><Trash2 size={16}/></button>
               </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-5 bg-emerald-50 dark:bg-emerald-900/10 rounded-[1.8rem] border border-emerald-100 dark:border-emerald-800/50">
                 <div className="flex items-center gap-2 mb-2 text-emerald-600 dark:text-emerald-400">
                    <CreditCard size={14} />
                    <span className="text-[9px] font-black uppercase tracking-widest">Plano Atual</span>
                 </div>
                 <p className="text-xs font-black text-slate-800 dark:text-white leading-tight">{accountDetails.plan}</p>
              </div>
              <div className="p-5 bg-blue-50 dark:bg-blue-900/10 rounded-[1.8rem] border border-blue-100 dark:border-blue-800/50">
                 <div className="flex items-center gap-2 mb-2 text-blue-600 dark:text-blue-400">
                    <Zap size={14} />
                    <span className="text-[9px] font-black uppercase tracking-widest">Expiração</span>
                 </div>
                 <p className="text-xs font-black text-slate-800 dark:text-white leading-tight">{accountDetails.expiry}</p>
              </div>
            </div>

            <div className="space-y-4 pt-2">
              <SettingItem 
                icon={Mail} 
                label="E-mail de Login" 
                description={userInfo.email} 
              />
              <SettingItem 
                icon={Smartphone} 
                label="Dispositivos Conectados" 
                description="3 smartphones, 1 tablet" 
                action={<span className="text-[10px] font-black bg-blue-100 dark:bg-blue-900/30 text-blue-600 px-2 py-1 rounded-lg">VER TODOS</span>}
              />
            </div>
          </div>
        </SettingsCard>

        {/* Card 2: Detalhes do Sistema */}
        <SettingsCard 
          title="Info. do Sistema" 
          subtitle="INFRAESTRUTURA E VERSÃO" 
          icon={Cpu} 
          color="amber"
        >
          <div className="space-y-6">
            <div className="p-6 bg-slate-900 dark:bg-black rounded-[2rem] text-white shadow-xl relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000"></div>
               <div className="flex justify-between items-start mb-6">
                  <div>
                    <p className="text-[9px] font-black text-amber-500 uppercase tracking-[0.3em] mb-1">Versão do Core</p>
                    <h3 className="text-2xl font-black tracking-tighter">{systemInfo.version}</h3>
                  </div>
                  <div className="px-3 py-1 bg-amber-500 text-black text-[9px] font-black rounded-lg uppercase tracking-tighter">
                     {systemInfo.status}
                  </div>
               </div>
               
               <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-400">
                     <span className="flex items-center gap-2 font-black uppercase tracking-widest text-[9px]"><Globe size={13} /> Ambiente</span>
                     <span className="text-white text-xs">{systemInfo.env}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-bold text-slate-400">
                     <span className="flex items-center gap-2 font-black uppercase tracking-widest text-[9px]"><Database size={13} /> Banco de Dados</span>
                     <span className="text-white text-xs">Supabase PRO</span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-bold text-slate-400">
                     <span className="flex items-center gap-2 font-black uppercase tracking-widest text-[9px]"><HardDrive size={13} /> Servidor</span>
                     <span className="text-white text-xs">{systemInfo.server}</span>
                  </div>
               </div>
            </div>

            <div className="space-y-4">
              <SettingItem 
                icon={Monitor} 
                label="Atualizações de Software" 
                description={`Última verificação: ${systemInfo.lastUpdate}`} 
                action={<button className="p-2 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-500/20 hover:scale-110 transition-all"><Check size={16} /></button>}
              />
              <SettingItem 
                 icon={Shield} 
                 label="Protocolos de Segurança" 
                 description="SSL/TLS 1.3 Ativo • WAF Camada 7" 
                 action={<CheckCircle2 size={18} className="text-emerald-500" />}
              />
            </div>
            
            <button className="w-full py-4 bg-slate-50 dark:bg-slate-800 text-slate-500 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 border border-dashed border-slate-200 dark:border-slate-700 mt-2">
               <Info size={14} /> Log de Documentação Técnica
            </button>
          </div>
        </SettingsCard>

        {/* Card 3: Notificações & Alertas */}
        <SettingsCard 
          title="Notificações" 
          subtitle="COMO VOCÊ PREFERE SER AVISADO" 
          icon={Bell} 
          color="indigo"
        >
          <div className="space-y-2 pt-2">
              <SettingItem 
                icon={Mail} 
                label="Alertas por E-mail" 
                description="Receba cópias das mensagens no e-mail" 
                action={<CustomToggle active={notifications.email} onChange={() => setNotifications({...notifications, email: !notifications.email})} />}
              />
              <SettingItem 
                icon={Smartphone} 
                label="Notificações Push" 
                description="Alertas em tempo real no mobile" 
                action={<CustomToggle active={notifications.push} onChange={() => setNotifications({...notifications, push: !notifications.push})} />}
              />
              <SettingItem 
                icon={Volume2} 
                label="Som das Notificações" 
                description="Habilitar som para alertas" 
                action={<CustomToggle active={notifications.sounds} onChange={() => setNotifications({...notifications, sounds: !notifications.sounds})} />}
              />
          </div>
        </SettingsCard>

        {/* Card 4: Visual & Interface */}
        <SettingsCard 
          title="Visual & Filtros" 
          subtitle="CONFIGURE O VISUAL DO SISTEMA" 
          icon={Palette} 
          color="emerald"
        >
          <div className="space-y-6 pt-2">
            <div className="space-y-2">
              <SettingItem 
                icon={Moon} 
                label="Modo Escuro" 
                description="Visualize a interface em tons sóbrios" 
                action={<CustomToggle active={visual.darkMode} onChange={() => setVisual({...visual, darkMode: !visual.darkMode})} />}
              />
              <SettingItem 
                icon={Layout} 
                label="Layout Compacto" 
                description="Otimiza o espaço em telas menores" 
                action={<CustomToggle active={visual.compact} onChange={() => setVisual({...visual, compact: !visual.compact})} />}
              />
            </div>

            <div className="flex gap-4 pt-4">
              {['emerald', 'blue', 'purple', 'rose'].map((c) => (
                <button
                  key={c}
                  onClick={() => setVisual({...visual, theme: c})}
                  className={`flex-1 h-10 rounded-2xl transition-all border-4 ${
                    visual.theme === c ? 'border-white dark:border-slate-800 shadow-xl scale-110' : 'border-transparent opacity-60'
                  } bg-${c === 'rose' ? 'rose-500' : c + '-500'} flex items-center justify-center`}
                >
                  {visual.theme === c && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </button>
              ))}
            </div>
          </div>
        </SettingsCard>

      </div>

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {isEditingProfile && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[3rem] p-10 relative z-10 border border-slate-100 dark:border-slate-800 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tight">Editar Perfil</h2>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Atualize suas informações de conta</p>
                </div>
                <button 
                  onClick={() => setIsEditingProfile(false)}
                  className="p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-all"
                >
                  <X size={24} className="text-slate-400" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nome Completo</label>
                  <input 
                    type="text" 
                    value={userInfo.name}
                    onChange={(e) => setUserInfo({...userInfo, name: e.target.value})}
                    className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-6 py-4 text-sm font-bold text-slate-800 dark:text-white"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">E-mail</label>
                  <input 
                    type="email" 
                    value={userInfo.email}
                    onChange={(e) => setUserInfo({...userInfo, email: e.target.value})}
                    className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-6 py-4 text-sm font-bold text-slate-800 dark:text-white"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Telefone</label>
                  <input 
                    type="text" 
                    value={userInfo.phone}
                    onChange={(e) => setUserInfo({...userInfo, phone: e.target.value})}
                    className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-6 py-4 text-sm font-bold text-slate-800 dark:text-white"
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    onClick={() => setIsEditingProfile(false)}
                    className="flex-1 py-5 bg-blue-600 text-white rounded-[2rem] font-black uppercase tracking-[0.2em] text-xs shadow-xl shadow-blue-200 dark:shadow-none hover:scale-[1.02] active:scale-[0.98] transition-all"
                  >
                    Salvar Alterações
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
