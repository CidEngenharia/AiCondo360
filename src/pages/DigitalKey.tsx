import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Key, Smartphone, Share2, History, ChevronRight, ShieldCheck, RefreshCcw, Lock, Clock, MapPin } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { cn } from '../lib/utils';

// Helper component for generic card
const ActionCard: React.FC<{ icon: any, label: string, onClick: () => void, colorClass: string }> = ({ icon: Icon, label, onClick, colorClass }) => (
  <button 
    onClick={onClick}
    className="flex flex-col items-center justify-center bg-white dark:bg-slate-800 p-4 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-all group"
  >
    <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-2 text-white transition-transform group-hover:scale-110", colorClass)}>
      <Icon size={24} />
    </div>
    <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{label}</span>
  </button>
);

interface DigitalKeyProps {
  userId: string;
  condoId: string;
  unitNumber: string;
  block: string;
}

export const DigitalKey: React.FC<DigitalKeyProps> = ({ userId, condoId, unitNumber, block }) => {
  const [activeTab, setActiveTab] = useState<'access' | 'visitor' | 'history'>('access');
  const [qrValue, setQrValue] = useState('');
  const [timeLeft, setTimeLeft] = useState(60);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeKey, setActiveKey] = useState<string | null>(null);

  // Function to generate dynamic QR Code for Resident Access
  const generateNewKey = () => {
    setIsRefreshing(true);
    // Mimic real key generation with unique timestamp
    const timestamp = Math.floor(Date.now() / 1000);
    const newKey = `resident|${userId}|${condoId}|${timestamp}`;
    setQrValue(newKey);
    setTimeLeft(60);
    setTimeout(() => setIsRefreshing(false), 800);
  };

  useEffect(() => {
    generateNewKey();
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          generateNewKey();
          return 60;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const history = [
    { title: 'Entrada Portaria', time: '14:22', date: 'Hoje', icon: MapPin },
    { title: 'Entrada Bloco A', time: '14:23', date: 'Hoje', icon: Smartphone },
    { title: 'Entrada Garagem', time: '08:15', date: 'Hoje', icon: Smartphone },
    { title: 'Entrada Portaria', time: '18:10', date: 'Ontem', icon: MapPin },
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] pb-10">
      {/* Header Segment Control */}
      <div className="px-6 pt-6 pb-4">
        <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-2xl">
          <button 
            onClick={() => setActiveTab('access')}
            className={cn(
              "flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2",
              activeTab === 'access' ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm" : "text-slate-500 dark:text-slate-400"
            )}
          >
            <Key size={14} /> Meu Acesso
          </button>
          <button 
            onClick={() => setActiveTab('visitor')}
            className={cn(
              "flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2",
              activeTab === 'visitor' ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm" : "text-slate-500 dark:text-slate-400"
            )}
          >
            <Share2 size={14} /> Convidar
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={cn(
              "flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2",
              activeTab === 'history' ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm" : "text-slate-500 dark:text-slate-400"
            )}
          >
            <History size={14} /> Histórico
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 px-6 overflow-y-auto custom-scrollbar">
        <AnimatePresence mode="wait">
          {activeTab === 'access' && (
            <motion.div 
              key="access"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center py-6"
            >
              {/* Resident ID Card Visual */}
              <div className="w-full bg-gradient-to-br from-indigo-600 to-blue-700 rounded-3xl p-6 text-white shadow-xl shadow-blue-200 dark:shadow-none mb-8 relative overflow-hidden">
                <div className="relative z-10 flex flex-col items-center">
                  <div className="w-20 h-20 rounded-full border-4 border-white/30 bg-white/20 flex items-center justify-center mb-4 backdrop-blur-md">
                    <Smartphone size={40} className="text-white" />
                  </div>
                  <h2 className="text-xl font-bold mb-1">Acesso AiCondo 360</h2>
                  <p className="text-blue-100 text-sm opacity-80 uppercase tracking-widest font-medium">Unidade {unitNumber} • Bloco {block}</p>
                </div>
                {/* Decorative bits */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-400/20 rounded-full -ml-8 -mb-8 blur-xl"></div>
              </div>

              {/* QR CODE DISPLAY */}
              <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] shadow-xl border-4 border-slate-50 dark:border-slate-700 flex flex-col items-center relative mb-6">
                <div className={cn("transition-opacity duration-300", isRefreshing ? "opacity-30 scale-95" : "opacity-100 scale-100")}>
                  <QRCodeSVG 
                    value={qrValue} 
                    size={220} 
                    includeMargin={false}
                    fgColor="#1e293b" // Slate-800
                    level="H"
                  />
                </div>
                
                {isRefreshing && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <motion.div 
                      animate={{ rotate: 360 }}
                      transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                      className="text-blue-600 dark:text-blue-400"
                    >
                      <RefreshCcw size={40} />
                    </motion.div>
                  </div>
                )}

                {/* Status indicator overlay */}
                <div className="absolute -bottom-4 bg-emerald-500 text-white px-5 py-2 rounded-2xl shadow-lg flex items-center gap-2 border-4 border-white dark:border-slate-800">
                  <ShieldCheck size={18} />
                  <span className="text-xs font-extrabold uppercase tracking-widest">Ativo</span>
                </div>
              </div>

              {/* Progress timer */}
              <div className="w-full max-w-[240px] mb-10 text-center">
                <div className="flex justify-between items-end mb-2 px-1">
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Código dinâmico</span>
                  <span className="text-sm font-black text-slate-700 dark:text-slate-200 tabular-nums">{timeLeft}s</span>
                </div>
                <div className="h-2 w-full bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: '100%' }}
                    animate={{ width: `${(timeLeft / 60) * 100}%` }}
                    transition={{ duration: 1, ease: 'linear' }}
                    className={cn(
                      "h-full rounded-full transition-colors duration-500",
                      timeLeft > 20 ? "bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.3)]" : "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.3)]"
                    )}
                  />
                </div>
              </div>

              {/* Buttons Row */}
              <div className="grid grid-cols-2 gap-4 w-full">
                <button className="flex items-center justify-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-4 px-6 rounded-2xl text-sm font-bold shadow-lg transition-transform active:scale-95">
                  < smartphone size={18} /> Abrir Remoto
                </button>
                <button 
                  onClick={generateNewKey}
                  className="flex items-center justify-center gap-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 py-4 px-6 rounded-2xl text-sm font-bold shadow-sm transition-transform active:scale-95 hover:bg-slate-50"
                >
                  <RefreshCcw size={18} /> Atualizar
                </button>
              </div>
            </motion.div>
          )}

          {activeTab === 'visitor' && (
            <motion.div 
              key="visitor"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="py-6 space-y-6"
            >
              <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/40 p-5 rounded-3xl flex gap-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400 flex-shrink-0">
                  <Smartphone size={24} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">Convite Rápido</h3>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">Envie uma chave temporária para seu convidado por WhatsApp ou SMS.</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <ActionCard 
                  icon={Share2} 
                  label="Compartilhar" 
                  onClick={() => {}} 
                  colorClass="bg-blue-600" 
                />
                <ActionCard 
                  icon={Clock} 
                  label="Agendar" 
                  onClick={() => {}} 
                  colorClass="bg-purple-600" 
                />
                <ActionCard 
                  icon={Lock} 
                  label="Recorrente" 
                  onClick={() => {}} 
                  colorClass="bg-emerald-600" 
                />
                <ActionCard 
                  icon={Smartphone} 
                  label="Via Telefone" 
                  onClick={() => {}} 
                  colorClass="bg-amber-600" 
                />
              </div>

              <div className="pt-4">
                <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4 px-1">Chaves Ativas</h4>
                <div className="space-y-3">
                  {[1, 2].map((i) => (
                    <div key={i} className="bg-white dark:bg-slate-800 p-4 rounded-3xl border border-slate-100 dark:border-slate-700 flex items-center justify-between shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 font-bold">
                          {i === 1 ? 'JO' : 'MA'}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900 dark:text-white">{i === 1 ? 'João Oliver' : 'Maria Silva'}</p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400">Válido até 18:00 de hoje</p>
                        </div>
                      </div>
                      <ChevronRight size={18} className="text-slate-300" />
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'history' && (
            <motion.div 
              key="history"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="py-6"
            >
              <div className="bg-white dark:bg-slate-800 rounded-[2rem] border border-slate-100 dark:border-slate-700 p-2 shadow-sm overflow-hidden">
                {history.map((item, idx) => (
                  <div key={idx} className={cn(
                    "p-4 flex items-center gap-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors",
                    idx !== history.length - 1 && "border-bottom border-slate-50 dark:border-slate-700"
                  )}>
                    <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400 flex-shrink-0">
                      <item.icon size={18} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-slate-900 dark:text-white">{item.title}</p>
                      <p className="text-[10px] text-slate-500">Unidade {unitNumber} • Bloco {block}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-200">{item.time}</p>
                      <p className="text-[10px] text-slate-400">{item.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Safety Banner */}
      <div className="mt-4 px-6">
        <div className="bg-slate-50 dark:bg-slate-900/30 p-4 rounded-2xl flex items-center justify-center gap-2">
          <ShieldCheck size={14} className="text-emerald-500" />
          <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-widest">Conexão segura end-to-end</span>
        </div>
      </div>
    </div>
  );
};

export default DigitalKey;
