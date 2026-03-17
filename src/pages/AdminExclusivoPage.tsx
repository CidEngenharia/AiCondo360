import React from 'react';
import { motion } from 'motion/react';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { LoginForm } from '../components/LoginForm';

export const AdminExclusivoPage: React.FC<{ setUser?: (user: any) => void }> = ({ setUser }) => {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-slate-950">
      {/* Dark background with subtle grid or pattern */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:24px_24px]" />
      <div className="absolute inset-0 bg-gradient-to-b from-blue-600/5 to-transparent" />

      <div className="relative z-10 w-full max-w-lg px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex flex-col items-center text-center space-y-4"
        >
          <div className="w-16 h-16 bg-blue-600/20 rounded-2xl flex items-center justify-center text-blue-500 border border-blue-500/30">
            <ShieldAlert size={32} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white uppercase tracking-tighter">Painel de Administração Global</h1>
            <p className="text-slate-400 text-sm">Acesso restrito para desenvolvedores e equipe AiCondo360</p>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white/95 dark:bg-slate-900/90 backdrop-blur-xl rounded-[2.5rem] shadow-2xl border border-white/10 p-8 md:p-10"
        >
          <LoginForm isAdminOnly={true} setUser={setUser} />
        </motion.div>

        <motion.button 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          onClick={() => navigate('/')}
          className="mt-8 mx-auto flex items-center gap-2 text-slate-500 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest"
        >
          <ArrowLeft size={14} />
          Voltar para o Início
        </motion.button>
      </div>
    </div>
  );
};
