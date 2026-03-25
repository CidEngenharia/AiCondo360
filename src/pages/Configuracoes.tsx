import React from 'react';
import { Settings, User, Bell, Lock, Shield, CreditCard, HelpCircle, LogOut, ChevronRight, Globe, Moon, Sun, Smartphone, Mail, Eye, EyeOff, Layout, Palette, Database, Trash2, Camera, Cloud, Download, Share2, Info } from 'lucide-react';
import { motion } from 'motion/react';

const Card: React.FC<{ children: React.ReactNode, title: string, description: string, icon: any, color: string }> = ({ children, title, description, icon: Icon, color }) => (
  <section className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col group transition-all hover:border-slate-200 dark:hover:border-slate-600">
    <div className="p-8 border-b border-slate-50 dark:border-slate-700 flex items-center gap-5">
      <div className={`w-12 h-12 rounded-2xl ${color} flex items-center justify-center transition-transform group-hover:scale-110 group-hover:rotate-6`}>
        <Icon size={24} className="text-white" />
      </div>
      <div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">{title}</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest mt-1">{description}</p>
      </div>
    </div>
    <div className="p-8 space-y-6 flex-1">
      {children}
    </div>
  </section>
);

const SettingItem: React.FC<{ icon: any, label: string, description: string, action?: React.ReactNode, destructive?: boolean }> = ({ icon: Icon, label, description, action, destructive }) => (
  <div className="flex items-center justify-between group cursor-pointer p-4 -mx-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-all">
    <div className="flex items-center gap-4">
      <div className={`p-3 rounded-xl transition-all ${destructive ? 'bg-rose-50 text-rose-500 dark:bg-rose-900/20' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 dark:group-hover:bg-blue-900/20 dark:group-hover:text-blue-400'}`}>
        <Icon size={20} />
      </div>
      <div>
        <h4 className={`text-sm font-black ${destructive ? 'text-rose-600' : 'text-slate-800 dark:text-slate-200'}`}>{label}</h4>
        <p className="text-xs text-slate-500 dark:text-slate-500 font-medium leading-relaxed">{description}</p>
      </div>
    </div>
    {action || <ChevronRight size={18} className="text-slate-300 group-hover:text-slate-500 transition-all group-hover:translate-x-1" />}
  </div>
);

const Toggle: React.FC<{ active: boolean }> = ({ active }) => (
  <div className={`w-12 h-6 rounded-full relative transition-all cursor-pointer shadow-inner ${active ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-700'}`}>
    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-md ${active ? 'right-1' : 'left-1'}`} />
  </div>
);

export const Configuracoes: React.FC = () => {
  return (
    <div className="p-6 lg:p-10 space-y-10">
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-2 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Configurações do Sistema</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-bold uppercase tracking-widest text-xs">Ajuste sua experiência conforme suas necessidades.</p>
        </div>
        <div className="flex items-center gap-4">
           <button className="flex items-center gap-2 px-6 py-3 bg-slate-900 dark:bg-slate-700 text-white rounded-2xl text-sm font-bold shadow-xl transition-all hover:scale-105 active:scale-95">Salvar Alterações</button>
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <Card title="Perfil do Administrador" description="Informações pessoais e visibilidade" icon={User} color="bg-blue-600">
           <div className="flex flex-col items-center gap-6 p-6 mb-4 bg-slate-50 dark:bg-slate-900/30 rounded-3xl border border-slate-100 dark:border-slate-800/50">
              <div className="relative group">
                 <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="Admin" className="w-28 h-28 rounded-3xl object-cover shadow-2xl transition-all group-hover:scale-105" />
                 <button className="absolute -bottom-2 -right-2 p-2.5 bg-blue-600 text-white rounded-xl shadow-xl transition-all hover:scale-110 active:scale-95 group-hover:-translate-y-1"><Camera size={18} /></button>
              </div>
              <div className="text-center">
                 <h4 className="text-xl font-black text-slate-900 dark:text-white">Sidney Souza</h4>
                 <p className="text-xs text-blue-600 font-black uppercase tracking-widest mt-1">Síndico Geral PRO</p>
              </div>
           </div>
           
           <div className="space-y-2">
              <SettingItem icon={Mail} label="E-mail de Contato" description="sidney.souza@condo360.com" />
              <SettingItem icon={Smartphone} label="Telefone Verificado" description="+55 (11) 98765-4321" />
              <SettingItem icon={Globe} label="Idioma do Sistema" description="Português (Brasil)" />
           </div>
        </Card>

        <Card title="Segurança & Acesso" description="Proteja sua conta e permissões" icon={Shield} color="bg-rose-600">
           <div className="space-y-2">
              <SettingItem icon={Lock} label="Alterar Senha" description="Senha alterada pela última vez há 45 dias" />
              <SettingItem icon={Smartphone} label="Autenticação em Duas Etapas" description="Adicione uma camada extra de segurança" action={<Toggle active={true} />} />
              <SettingItem icon={Eye} label="Log de Atividades Públicas" description="Controle quem pode ver seu status online" action={<Toggle active={false} />} />
              <div className="h-px bg-slate-100 dark:bg-slate-700 my-4" />
              <SettingItem icon={Trash2} label="Excluir Minha Conta" description="Atenção: Esta ação é irreversível" destructive={true} />
           </div>
        </Card>

        <Card title="Notificações & Alertas" description="Como você prefere ser avisado" icon={Bell} color="bg-indigo-600">
           <div className="space-y-4">
              <div className="flex flex-col gap-1 px-2 mb-2">
                 <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">Avisos do Condomínio</h4>
                 <p className="text-xs text-slate-500 font-medium">Controle mensagens críticas do dia a dia.</p>
              </div>
              <SettingItem icon={Mail} label="Alertas Complementares por E-mail" description="Receba cópias das mensagens no e-mail" action={<Toggle active={true} />} />
              <SettingItem icon={Smartphone} label="Notificações Push (Mobile)" description="Alertas em tempo real no seu smartphone" action={<Toggle active={true} />} />
              <SettingItem icon={Bell} label="Som das Notificações" description="Habilitar som para alertas importantes" action={<Toggle active={false} />} />
           </div>
        </Card>

        <Card title="Personalização do Dashboard" description="Configure o visual do sistema" icon={Palette} color="bg-emerald-600">
           <div className="space-y-4">
              <div className="flex flex-col gap-1 px-2 mb-2">
                 <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">Interface Visual</h4>
                 <p className="text-xs text-slate-500 font-medium">Ajuste de acordo com seu ambiente.</p>
              </div>
              <SettingItem icon={Moon} label="Modo Escuro (Dark Mode)" description="Visualize a interface com tons mais sobrios" action={<Toggle active={false} />} />
              <SettingItem icon={Layout} label="Layout Compacto" description="Otimiza o espaço para resoluções menores" action={<Toggle active={true} />} />
              <SettingItem icon={Database} label="Configuração de Armazenamento" description="Gerenciar arquivos e cache local" />
              
              <div className="h-px bg-slate-100 dark:bg-slate-700 my-4" />
              
              <div className="grid grid-cols-4 gap-4 px-4 pb-4">
                 {[
                   { hex: '#16a34a', label: 'Verde' },
                   { hex: '#2563eb', label: 'Azul', active: true },
                   { hex: '#7c3aed', label: 'Roxo' },
                   { hex: '#f97316', label: 'Laranja' },
                 ].map((color, i) => (
                    <button key={i} className={`h-12 rounded-2xl flex items-center justify-center transition-all ${color.active ? 'ring-4 ring-offset-4 ring-slate-100 dark:ring-slate-700 shadow-xl' : 'hover:scale-110 active:scale-95 opacity-60 hover:opacity-100'}`} style={{ backgroundColor: color.hex }}>
                       {color.active && <div className="w-2 h-2 bg-white rounded-full" />}
                    </button>
                 ))}
              </div>
              <p className="text-center text-[10px] font-black text-slate-400 uppercase tracking-widest pt-2">Selecione sua cor de destaque principal</p>
           </div>
        </Card>
      </div>
      
      <footer className="pt-8 flex flex-col md:flex-row items-center justify-between gap-6 border-t border-slate-100 dark:border-slate-800 text-slate-400">
         <div className="flex items-center gap-6">
            <button className="flex items-center gap-2 hover:text-slate-600 dark:hover:text-slate-200 transition-all text-xs font-black uppercase tracking-widest"><HelpCircle size={14}/> Central de Ajuda</button>
            <button className="flex items-center gap-2 hover:text-slate-600 dark:hover:text-slate-200 transition-all text-xs font-black uppercase tracking-widest"><Info size={14}/> Termos & Privacidade</button>
         </div>
         <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">AiCondo360 - Version 2.4.0 • Enterprise Edition</p>
      </footer>
    </div>
  );
};

