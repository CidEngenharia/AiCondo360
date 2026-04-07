import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Bell, Menu, User, Settings, LogOut, Sun, Moon, MessageCircle, X, ChevronRight, Lock, Sparkles, LayoutDashboard, HelpCircle, Building2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AIChat } from './AIChat';
import { FEATURES, UserRole, PricingPlan } from '../constants';
import { cn } from '../lib/utils';
import { CondominioService, Condominio } from '../services/supabaseService';
import { useAuth } from '../hooks/useAuth';

interface LayoutProps {
  children: React.ReactNode;
  condoName: string;
  userName: string;
  onLogout: () => void;
  userRole: UserRole;
  userPlan: PricingPlan;
}

export const Layout: React.FC<LayoutProps> = ({ children, condoName, userName, onLogout, userRole, userPlan }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [condos, setCondos] = useState<Condominio[]>([]);
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (userRole === 'global_admin') {
      CondominioService.getAllCondominios().then(setCondos);
    }
  }, [userRole]);

  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const filteredFeatures = FEATURES.filter(feature => {
    if (userRole === 'global_admin') return true;
    const roleMatch = feature.roles.includes(userRole);
    return roleMatch;
  });

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case 'resident': return 'Morador';
      case 'admin': return 'Administrador';
      case 'syndic': return 'Síndico';
      case 'global_admin': return 'Admin Global';
      default: return 'Usuário';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex transition-colors duration-300">
      {/* Sidebar Overlay (Mobile) */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleSidebar}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[60]"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-[70] w-80 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 transform transition-transform duration-500 ease-in-out shadow-2xl overflow-hidden",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="h-16 flex items-center px-4 border-b border-slate-100 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <button 
                onClick={toggleSidebar}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-all"
              >
                <Menu size={20} className="text-slate-600 dark:text-slate-300" />
              </button>
            </div>
          </div>

          {/* Sidebar Links */}
          <div className="flex-1 overflow-y-auto py-2 px-3 space-y-1 custom-scrollbar">
            <div className="px-3 mb-2 flex items-center justify-between">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Menu Principal</p>
              <span className="text-[8px] font-bold bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded uppercase">{userPlan}</span>
            </div>

            {/* Home/Dashboard Link */}
            <button
              onClick={() => navigate('/')}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group relative",
                location.pathname === '/' 
                  ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400" 
                  : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50"
              )}
            >
              <div className={cn(
                "p-2 rounded-lg transition-colors",
                location.pathname === '/' ? "text-blue-600 dark:text-blue-400" : "text-slate-500 dark:text-slate-400"
              )}>
                <LayoutDashboard size={18} />
              </div>
              <span className="text-sm font-medium flex-1 text-left">Dashboard</span>
            </button>



            {/* Settings Link */}
            <button
              onClick={() => navigate('/settings')}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group relative",
                location.pathname === '/settings' 
                  ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400" 
                  : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50"
              )}
            >
              <div className={cn(
                "p-2 rounded-lg transition-colors",
                location.pathname === '/settings' ? "text-blue-600 dark:text-blue-400" : "text-slate-500 dark:text-slate-400"
              )}>
                <Settings size={18} />
              </div>
              <span className="text-sm font-medium flex-1 text-left">Configurações</span>
            </button>

            <div className="my-4 border-t border-slate-100 dark:border-slate-800" />
            
            <div className="px-3 mb-2">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Funcionalidades</p>
            </div>

            {filteredFeatures.map((feature) => {
              const hasAccess = userRole === 'global_admin' || feature.plans.includes(userPlan);
              const isActive = location.pathname === `/feature/${feature.id}`;
              
              return (
                <button
                  key={feature.id}
                  disabled={!hasAccess}
                  onClick={() => navigate(`/feature/${feature.id}`)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group relative",
                    isActive
                      ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                      : hasAccess 
                        ? "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-blue-600 dark:hover:text-blue-400" 
                        : "text-slate-300 dark:text-slate-600 cursor-not-allowed"
                  )}
                >
                  <div className={cn(
                    "p-2 rounded-lg transition-colors", 
                    isActive
                      ? "text-blue-600 dark:text-blue-400"
                      : hasAccess 
                        ? "text-slate-500 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" 
                        : "text-slate-300 dark:text-slate-600"
                  )}>
                    <feature.icon size={18} />
                  </div>
                  <span className="text-sm font-medium flex-1 text-left">{feature.label}</span>
                  {!hasAccess && (
                    <Lock size={12} className="text-slate-300 dark:text-slate-600" />
                  )}
                </button>
              );
            })}

          {/* Suporte Link */}
          <div className="px-3 pt-4 pb-2 border-t border-slate-100 dark:border-slate-800 mt-4">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Ajuda & Suporte</p>
          </div>
          <a
            href="https://wa.me/5571984184782"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-blue-600 dark:hover:text-blue-400"
          >
            <div className="p-2 rounded-lg transition-colors text-slate-500 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400">
              <HelpCircle size={18} />
            </div>
            <span className="text-sm font-medium flex-1 text-left">Suporte</span>
          </a>

          {/* User Profile & Logout */}
          <div className="pt-4 pb-2 mt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-300 font-bold">
                  {userName.charAt(0)}
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[120px]">{userName}</span>
                  <span className="text-[10px] text-slate-500">{getRoleLabel(userRole)}</span>
                </div>
              </div>
              <button 
                onClick={onLogout}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
              >
                <LogOut size={14} />
                Sair da Conta
              </button>
            </div>
          </div>
        </div>
      </div>
    </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-50 transition-colors">
          <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button 
                onClick={toggleSidebar}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-all"
              >
                <Menu size={20} className="text-slate-600 dark:text-slate-300" />
              </button>
              <img src="/favicon.jpg" alt="AiCondo360 Logo" className="w-10 h-10 object-contain rounded-lg shadow-sm" />
              <div className="flex flex-col min-w-0">
                <h1 className="text-base font-black text-slate-900 dark:text-white leading-none tracking-tighter">AiCondo360</h1>
                <span className="text-[9px] text-blue-600 dark:text-blue-400 font-black uppercase tracking-wider truncate max-w-[150px]">{condoName}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button 
                onClick={toggleDarkMode}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full text-slate-600 dark:text-slate-300 transition-colors"
                title={isDarkMode ? "Modo Dia" : "Modo Noite"}
              >
                {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              
              
              <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full relative">
                <Bell size={20} className="text-slate-600 dark:text-slate-300" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-amber-500 rounded-full border-2 border-white dark:border-slate-800"></span>
              </button>
              <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 mx-1"></div>
              <button 
                onClick={() => navigate('/settings')}
                className="flex items-center gap-2 pl-1 hover:opacity-80 transition-opacity"
              >
                <div className="hidden sm:flex flex-col items-end">
                  <span className="text-xs font-medium text-slate-900 dark:text-white">{userName}</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">{getRoleLabel(userRole)}</span>
                </div>
                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-300 font-bold text-xs">
                  {userName.charAt(0)}
                </div>
              </button>
            </div>
          </div>
        </header>

        {/* Página de Conteúdo */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>

        {/* Botão Flutuante do WhatsApp */}
        <motion.a
          href="https://wa.me/5571984184782"
          target="_blank"
          rel="noopener noreferrer"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-emerald-500 text-white rounded-full shadow-lg shadow-emerald-200 dark:shadow-none flex items-center justify-center hover:bg-emerald-600 transition-colors"
        >
          <MessageCircle size={28} />
        </motion.a>

        <AIChat isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} userName={userName} />
      </div>
    </div>
  );
};
