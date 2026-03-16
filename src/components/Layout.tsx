import React, { useState, useEffect } from 'react';
import { Bell, Menu, User, Settings, LogOut, Sun, Moon, MessageCircle, X, ChevronRight, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { FEATURES, UserRole, PricingPlan } from '../constants';
import { cn } from '../lib/utils';

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
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[60] lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-[70] w-72 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-auto",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="h-16 flex items-center justify-between px-6 border-b border-slate-100 dark:border-slate-700">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
                <Menu size={18} />
              </div>
              <span className="font-bold text-slate-900 dark:text-white">AiCondo360</span>
            </div>
            <button onClick={toggleSidebar} className="lg:hidden p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
              <X size={20} className="text-slate-500" />
            </button>
          </div>

          {/* Sidebar Links */}
          <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1 custom-scrollbar">
            <div className="px-3 mb-2 flex items-center justify-between">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Menu Principal</p>
              <span className="text-[8px] font-bold bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded uppercase">{userPlan}</span>
            </div>
            
            {filteredFeatures.map((feature) => {
              const hasAccess = userRole === 'global_admin' || feature.plans.includes(userPlan);
              
              return (
                <button
                  key={feature.id}
                  disabled={!hasAccess}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group relative",
                    hasAccess 
                      ? "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-blue-600 dark:hover:text-blue-400" 
                      : "text-slate-300 dark:text-slate-600 cursor-not-allowed"
                  )}
                >
                  <div className={cn(
                    "p-2 rounded-lg transition-colors", 
                    hasAccess 
                      ? "text-slate-500 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" 
                      : "text-slate-300 dark:text-slate-600"
                  )}>
                    <feature.icon size={18} />
                  </div>
                  <span className="text-sm font-medium flex-1 text-left">{feature.label}</span>
                  {!hasAccess ? (
                    <Lock size={12} className="text-slate-300 dark:text-slate-600" />
                  ) : (
                    <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-slate-100 dark:border-slate-700">
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
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-50 transition-colors">
          <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button 
                onClick={toggleSidebar}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg lg:hidden"
              >
                <Menu size={20} className="text-slate-600 dark:text-slate-300" />
              </button>
              <div className="flex flex-col">
                <h1 className="text-sm font-bold text-slate-900 dark:text-white leading-none">AiCondo360</h1>
                <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold uppercase tracking-wider truncate max-w-[150px]">{condoName}</span>
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
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-800"></span>
              </button>
              <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 mx-1"></div>
              <div className="hidden sm:flex items-center gap-2 pl-1">
                <div className="flex flex-col items-end">
                  <span className="text-xs font-medium text-slate-900 dark:text-white">{userName}</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">{getRoleLabel(userRole)}</span>
                </div>
                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-300 font-bold text-xs">
                  {userName.charAt(0)}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>

        {/* WhatsApp Floating Button */}
        <motion.a
          href="https://wa.me/5500000000000"
          target="_blank"
          rel="noopener noreferrer"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="fixed bottom-20 right-6 z-50 w-14 h-14 bg-emerald-500 text-white rounded-full shadow-lg shadow-emerald-200 dark:shadow-none flex items-center justify-center hover:bg-emerald-600 transition-colors"
        >
          <MessageCircle size={28} />
        </motion.a>

        {/* Bottom Navigation (Mobile) */}
        <nav className="lg:hidden bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 px-6 py-3 flex justify-between items-center sticky bottom-0 transition-colors">
          <button className="flex flex-col items-center gap-1 text-blue-600 dark:text-blue-400">
            <Menu size={20} />
            <span className="text-[10px] font-medium">Início</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-slate-400 dark:text-slate-500">
            <Bell size={20} />
            <span className="text-[10px] font-medium">Avisos</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-slate-400 dark:text-slate-500">
            <Settings size={20} />
            <span className="text-[10px] font-medium">Ajustes</span>
          </button>
          <button 
            onClick={toggleSidebar}
            className="flex flex-col items-center gap-1 text-slate-400 dark:text-slate-500"
          >
            <Menu size={20} />
            <span className="text-[10px] font-medium">Menu</span>
          </button>
        </nav>
      </div>
    </div>
  );
};
