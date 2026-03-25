import React, { useState } from 'react';
import { 
  User, Mail, Phone, MapPin, Calendar, Shield, 
  Camera, Edit2, Check, X, Bell, Moon, 
  Lock, CreditCard, Award, Heart, Star, 
  Zap, Settings, LogOut, ChevronRight,
  Briefcase, Home, Hash, Info, ExternalLink,
  Smartphone, Github, Linkedin, Globe, Database
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../hooks/useAuth';

const ProfileCard = ({ title, children, icon: Icon, color }: { title: string, children: React.ReactNode, icon: any, color: string }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white dark:bg-slate-800 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 shadow-xl shadow-slate-200/50 dark:shadow-none overflow-hidden group transition-all"
  >
    <div className="p-8 border-b border-slate-50 dark:border-slate-700 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-2xl ${color} flex items-center justify-center text-white shadow-lg shadow-${color.split('-')[1]}-200 dark:shadow-none`}>
          <Icon size={24} />
        </div>
        <div>
          <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">{title}</h3>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Gerenciar informações</p>
        </div>
      </div>
      <button className="p-2.5 bg-slate-50 dark:bg-slate-700 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-xl transition-all hover:scale-110">
        <Edit2 size={16} />
      </button>
    </div>
    <div className="p-8">
      {children}
    </div>
  </motion.div>
);

const InfoItem = ({ label, value, icon: Icon, subValue }: { label: string, value: string, icon: any, subValue?: string }) => (
  <div className="flex items-center gap-5 p-4 rounded-3xl hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-all group cursor-pointer border border-transparent hover:border-slate-100 dark:hover:border-slate-800">
    <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center text-slate-400 group-hover:text-blue-600 group-hover:border-blue-100 dark:group-hover:border-blue-900/50 shadow-sm transition-all group-hover:scale-110">
      <Icon size={20} />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{label}</p>
      <h4 className="text-base font-bold text-slate-900 dark:text-white truncate">{value}</h4>
      {subValue && <p className="text-xs text-slate-500 font-medium">{subValue}</p>}
    </div>
    <ChevronRight size={16} className="text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-all group-hover:translate-x-1" />
  </div>
);

const Badge = ({ children, color }: { children: React.ReactNode, color: string }) => (
  <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${color} shadow-sm`}>
    {children}
  </span>
);

export const Profile: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  if (!user) return null;

  return (
    <div className="min-h-screen bg-transparent p-6 lg:p-10">
      {/* Header com Banner e Perfil */}
      <div className="relative mb-12">
        {/* Banner Decorativo */}
        <div className="h-64 lg:h-80 w-full rounded-[3rem] bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 relative overflow-hidden shadow-2xl shadow-blue-200/50 dark:shadow-none">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-10 left-10 w-64 h-64 bg-white rounded-full blur-3xl" />
            <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-400 rounded-full blur-3xl" />
          </div>
          
          {/* Grid pattern overlay */}
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 mix-blend-overlay" />
          
          <div className="absolute bottom-0 left-0 right-0 p-8 lg:p-12 flex flex-col lg:flex-row lg:items-end justify-between gap-8 translate-y-8 lg:translate-y-12">
            <div className="flex flex-col lg:flex-row items-center gap-8">
              <div className="relative group">
                <div className="absolute -inset-2 bg-white/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="w-32 h-32 lg:w-44 lg:h-44 rounded-[2.5rem] border-[6px] border-white dark:border-slate-900 overflow-hidden shadow-2xl ring-4 ring-blue-500/20 relative z-10 bg-slate-100">
                  <img 
                    src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=2563eb&color=fff&size=256`} 
                    alt={user.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <button className="absolute inset-0 bg-black/40 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all backdrop-blur-sm">
                    <Camera size={24} />
                  </button>
                </div>
              </div>
              
              <div className="text-center lg:text-left z-20 space-y-2">
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3">
                  <h1 className="text-4xl lg:text-5xl font-black text-white tracking-tight drop-shadow-md">{user.name}</h1>
                  <Badge color="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 backdrop-blur-md">Conectado</Badge>
                </div>
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 text-blue-100/80 font-bold uppercase tracking-widest text-xs lg:text-sm">
                  <span className="flex items-center gap-2"><MapPin size={16} /> {user.condo}</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-white/30" />
                  <span className="flex items-center gap-2 text-white"><Award size={16} /> {user.role === 'admin' ? 'Síndico Geral' : 'Morador'}</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-white/30" />
                  <span className="flex items-center gap-2 text-amber-400 font-black"><Star size={16} fill="currentColor" /> Plano {user.plan}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-center gap-3 z-20">
              <button className="px-8 py-4 bg-white text-blue-600 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl transition-all hover:scale-105 active:scale-95 hover:bg-blue-50">
                Editar Perfil
              </button>
              <button className="p-4 bg-white/10 hover:bg-white/20 text-white rounded-2xl backdrop-blur-md transition-all hover:scale-105 active:scale-95 border border-white/20">
                <Settings size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mt-20">
        
        {/* Sidebar Tabs */}
        <div className="lg:col-span-3 space-y-4">
          {[
            { id: 'overview', label: 'Visão Geral', icon: User },
            { id: 'security', label: 'Segurança', icon: Shield },
            { id: 'billing', label: 'Financeiro', icon: CreditCard },
            { id: 'notifications', label: 'Notificações', icon: Bell },
            { id: 'preferences', label: 'Preferências', icon: Smartphone }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-4 p-5 rounded-[2rem] transition-all border outline-none ${
                activeTab === tab.id 
                ? 'bg-blue-600 text-white border-blue-500 shadow-xl shadow-blue-200 dark:shadow-none scale-105' 
                : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-100 dark:border-slate-700 hover:border-blue-200 dark:hover:border-blue-900/50 hover:bg-slate-50 dark:hover:bg-slate-900/50'
              }`}
            >
              <tab.icon size={20} className={activeTab === tab.id ? 'animate-pulse' : ''} />
              <span className="font-black text-sm uppercase tracking-widest">{tab.label}</span>
              {activeTab === tab.id && <motion.div layoutId="activeTab" className="ml-auto w-2 h-2 bg-white rounded-full" />}
            </button>
          ))}
          
          <div className="pt-6">
            <button className="w-full flex items-center gap-4 p-5 rounded-[2rem] bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/30 hover:bg-rose-100 transition-all font-black text-sm uppercase tracking-widest">
              <LogOut size={20} />
              Sair da Conta
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-9 space-y-8">
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-8"
              >
                <ProfileCard title="Informações Pessoais" icon={User} color="bg-blue-600">
                  <div className="space-y-2">
                    <InfoItem label="Nome Completo" value={user.name} icon={User} />
                    <InfoItem label="E-mail Principal" value={user.email} icon={Mail} subValue="Verificado em 12 Jan 2024" />
                    <InfoItem label="WhatsApp / Celular" value="+55 (11) 98765-4321" icon={Smartphone} />
                    <InfoItem label="Data de Nascimento" value="24 de Outubro, 1992" icon={Calendar} />
                  </div>
                </ProfileCard>

                <ProfileCard title="Dados de Residência" icon={Home} color="bg-indigo-600">
                  <div className="space-y-2">
                    <InfoItem label="Condomínio" value={user.condo} icon={Briefcase} />
                    <InfoItem label="Bloco / Torre" value="Torre A - London" icon={Hash} />
                    <InfoItem label="Apartamento / Casa" value="Unidade 142 • 14º Andar" icon={MapPin} />
                    <InfoItem label="Membro desde" value="Fevereiro de 2023" icon={Calendar} />
                  </div>
                </ProfileCard>

                <ProfileCard title="Conexões Sociais" icon={Globe} color="bg-violet-600">
                  <div className="space-y-2">
                    <InfoItem label="LinkedIn" value="linkedin.com/in/sidneysouza" icon={Linkedin} />
                    <InfoItem label="GitHub" value="github.com/sidneydev" icon={Github} />
                    <InfoItem label="Website Pessoal" value="www.souzadesign.com" icon={ExternalLink} />
                  </div>
                </ProfileCard>

                <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-[2.5rem] p-10 text-white relative overflow-hidden flex flex-col justify-between shadow-2xl">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                  <div className="relative z-10">
                    <Zap className="text-amber-400 mb-6" size={40} fill="currentColor" />
                    <h3 className="text-3xl font-black tracking-tight mb-2">Plano ProAtivo</h3>
                    <p className="text-slate-400 text-sm font-medium mb-8">Você possui acesso a todos os recursos premium do AiCondo360.</p>
                    
                    <ul className="space-y-3 mb-10">
                      {['Assembléias Virtuais', 'Chaves Digitais Ilimitadas', 'Suporte Prioritário 24/7', 'IA de Gestão Financeira'].map((feature, i) => (
                        <li key={i} className="flex items-center gap-3 text-xs font-black uppercase tracking-[0.15em] text-slate-300">
                          <Check size={14} className="text-emerald-400" /> {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <button className="relative z-10 w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-blue-500/20 active:scale-95">
                    Gerenciar Assinatura
                  </button>
                </div>
              </motion.div>
            )}

            {activeTab === 'security' && (
              <motion.div
                key="security"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-8"
              >
                <ProfileCard title="Acesso e Senha" icon={Lock} color="bg-rose-600">
                  <div className="space-y-6">
                    <div className="p-6 bg-slate-50 dark:bg-slate-900/50 rounded-3xl border border-slate-100 dark:border-slate-800">
                      <p className="text-xs text-slate-500 font-medium mb-4">Sua senha foi alterada pela última vez há 45 dias. Recomendamos trocar a cada 90 dias.</p>
                      <button className="w-full py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-50 transition-all">
                        Alterar Senha do Sistema
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-emerald-50 dark:bg-emerald-900/10 rounded-3xl border border-emerald-100 dark:border-emerald-900/20">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-white">
                          <Shield size={20} />
                        </div>
                        <div>
                          <p className="text-sm font-black text-emerald-900 dark:text-emerald-400">Verificação em Duas Etapas</p>
                          <p className="text-[10px] text-emerald-600/70 font-bold uppercase">Ativado</p>
                        </div>
                      </div>
                      <div className="w-12 h-6 bg-emerald-500 rounded-full relative shadow-inner">
                        <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
                      </div>
                    </div>
                  </div>
                </ProfileCard>

                <ProfileCard title="Dispositivos Conectados" icon={Smartphone} color="bg-slate-900">
                   <div className="space-y-4">
                      {[
                        { name: 'iPhone 15 Pro Max', location: 'São Paulo, Brasil', active: true, icon: Smartphone },
                        { name: 'MacBook Pro 14"', location: 'São Paulo, Brasil', active: false, icon: Globe },
                        { name: 'iPad Air', location: 'São Paulo, Brasil', active: false, icon: Smartphone }
                      ].map((dev, i) => (
                        <div key={i} className="flex items-center gap-4 p-4 rounded-3xl hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-all border border-slate-50 dark:border-slate-800">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${dev.active ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-400'}`}>
                            <dev.icon size={18} />
                          </div>
                          <div className="flex-1">
                            <h4 className="text-sm font-black text-slate-900 dark:text-white">{dev.name}</h4>
                            <p className="text-[10px] text-slate-400 font-bold uppercase">{dev.location} {dev.active && '• ATUAL'}</p>
                          </div>
                          <button className="text-[10px] font-black text-rose-500 uppercase tracking-widest hover:underline">Revogar</button>
                        </div>
                      ))}
                   </div>
                </ProfileCard>
              </motion.div>
            )}
            
            {/* Fallback for other tabs */}
            {(activeTab !== 'overview' && activeTab !== 'security') && (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-20 text-center border border-slate-100 dark:border-slate-700"
              >
                <div className="w-20 h-20 rounded-3xl bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-slate-300 mx-auto mb-6">
                  <Database size={40} />
                </div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-2">Conteúdo em Desenvolvimento</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm mx-auto font-medium">Estamos aprimorando esta seção para oferecer a melhor experiência possível. Volte em breve!</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Profile;
