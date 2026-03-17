import React from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, ArrowRight, Building2, Shield, Zap, Globe, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { LoginForm } from '../components/LoginForm';

export const LandingPage: React.FC<{ setUser?: (user: any) => void }> = ({ setUser }) => {
  const navigate = useNavigate();

  const benefits = [
    { icon: Building2, text: "Gestão completa de unidades e moradores" },
    { icon: Shield, text: "Segurança e monitoramento de acesso" },
    { icon: Zap, text: "Automação de processos e boletos" },
    { icon: Globe, text: "Comunicação em tempo real" }
  ];

  return (
    <div className="relative min-h-screen w-full flex flex-col md:flex-row overflow-hidden bg-slate-950 font-['Inter']">
      {/* Background Image with Parallax effect if possible, or just fixed */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-[20s] ease-linear hover:scale-110"
        style={{ backgroundImage: 'url("/bg-login.png")' }}
      />
      
      {/* Overlays */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950/90 via-slate-900/60 to-transparent md:bg-gradient-to-r md:from-slate-950 md:via-slate-950/80 md:to-transparent" />
      <div className="absolute inset-0 backdrop-blur-[2px]" />

      {/* Main Content Container */}
      <div className="relative z-10 flex flex-col md:flex-row w-full max-w-7xl mx-auto px-6 py-12 md:py-0 items-center justify-between gap-12">
        
        {/* Left Side: Presentation */}
        <div className="w-full md:w-1/2 text-white space-y-8 flex flex-col justify-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 group"
          >
            <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center p-2 border border-white/20 group-hover:border-blue-500/50 transition-colors">
              <img src="/favicon.jpg" alt="Logo" className="w-full h-full object-contain" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white/90">AiCondo<span className="text-blue-500">360</span></h1>
          </motion.div>

          <div className="space-y-6">
            <motion.h2 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="text-4xl md:text-6xl font-black tracking-tight leading-[1.1]"
            >
              A Nova Era da <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Vida em Condomínio</span>
            </motion.h2>

            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-lg text-slate-300 max-w-lg leading-relaxed font-light"
            >
              Software inteligente para uma gestão 360º. Mais transparência para o síndico, mais comodidade para o morador.
            </motion.p>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
          >
            {benefits.map((item, i) => (
              <div key={i} className="flex items-center gap-3 p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-colors">
                <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400">
                  <item.icon size={18} />
                </div>
                <span className="text-sm font-medium text-slate-200">{item.text}</span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Right Side: Login Form Card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, x: 50 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full md:w-[440px] bg-white/95 dark:bg-slate-950/80 backdrop-blur-xl rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] border border-white/20 dark:border-slate-800/50 p-8 md:p-10"
        >
          <LoginForm setUser={setUser} />
          
          <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800 flex flex-col items-center gap-4">
            <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">Ainda não usa o AiCondo360 no seu condomínio?</p>
            <button 
              onClick={() => {
                alert("Redirecionando para nossos planos... \n\nAtualmente operando em modo experimental. Para mais informações, contate nosso suporte.");
              }}
              className="group text-blue-600 dark:text-blue-400 font-bold text-sm flex items-center gap-2 hover:gap-3 transition-all"
            >
              Conheça nossos planos experimentais
              <ArrowRight size={16} />
            </button>
          </div>
        </motion.div>
      </div>

      {/* Subtle Admin Link */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 md:left-6 md:translate-x-0 z-10">
        <button 
          onClick={() => navigate('/admin-exclusivo')}
          className="text-[10px] text-slate-500 hover:text-blue-400 font-bold uppercase tracking-widest transition-colors opacity-30 hover:opacity-100 p-2"
        >
          Acesso Administrador Exclusivo
        </button>
      </div>

      {/* Floating Sparkles/Particles (SVG) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <svg className="absolute w-full h-full opacity-30" viewBox="0 0 100 100" preserveAspectRatio="none">
          <circle cx="20" cy="30" r="0.1" fill="white" className="animate-pulse" />
          <circle cx="80" cy="10" r="0.1" fill="white" className="animate-pulse delay-700" />
          <circle cx="50" cy="80" r="0.1" fill="white" className="animate-pulse delay-1000" />
        </svg>
      </div>
    </div>
  );
};
