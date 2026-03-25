import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Key, Shield, QrCode, Wifi, Smartphone, CheckCircle, Smartphone as PhoneIcon } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

export const DigitalKey: React.FC = () => {
  const [active, setActive] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (active && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0) {
      setActive(false);
      setTimeLeft(30);
    }
    return () => clearInterval(timer);
  }, [active, timeLeft]);

  const handleActivate = () => {
    setActive(true);
    setTimeLeft(30);
    setScanned(false);
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 space-y-8 min-h-[80vh]">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Chave Digital</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">Aproximo o celular do leitor ou use o QR Code</p>
      </div>

      <div className="relative">
        {/* Decorative Rings */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div 
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.1, 0.3] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="w-64 h-64 rounded-full border-2 border-blue-400/30 dark:border-blue-500/20"
          />
          <motion.div 
            animate={{ scale: [1.2, 1, 1.2], opacity: [0.1, 0.3, 0.1] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="absolute w-80 h-80 rounded-full border-2 border-indigo-400/20 dark:border-indigo-500/10"
          />
        </div>

        {/* Main Card/Phone UI */}
        <motion.div 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`relative z-10 w-64 h-96 rounded-[3rem] p-6 shadow-2xl transition-colors duration-500 overflow-hidden ${
            active 
              ? 'bg-gradient-to-br from-blue-600 to-indigo-700' 
              : 'bg-white dark:bg-slate-800 border-4 border-slate-100 dark:border-slate-700'
          }`}
        >
          {/* Phone Top Notch */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 bg-slate-100 dark:bg-slate-700 rounded-b-2xl" />

          <div className="h-full flex flex-col items-center justify-between py-8">
            <div className={`p-4 rounded-2xl ${active ? 'bg-white/20' : 'bg-blue-50 dark:bg-blue-900/30'}`}>
              <Shield className={active ? 'text-white' : 'text-blue-600'} size={32} />
            </div>

            <AnimatePresence mode="wait">
              {!active ? (
                <motion.div
                  key="inactive"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex flex-col items-center gap-4 text-center"
                >
                  <div className="p-8 bg-slate-50 dark:bg-slate-900/50 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                    <QrCode size={80} className="text-slate-300 dark:text-slate-600" />
                  </div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Clique abaixo para ativar sua chave digital</p>
                </motion.div>
              ) : (
                <motion.div
                  key="active"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="flex flex-col items-center gap-6"
                >
                  <div className="p-4 bg-white rounded-3xl shadow-xl">
                    <QRCodeSVG 
                      value={`condo-key-${Date.now()}`} 
                      size={160}
                      level="H"
                      includeMargin={true}
                    />
                  </div>
                  <div className="space-y-1 text-center">
                    <p className="text-white font-bold">Chave Ativa</p>
                    <div className="flex items-center justify-center gap-2 text-blue-100">
                      <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-xs font-mono">Expira em {timeLeft}s</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <button 
              onClick={handleActivate}
              disabled={active}
              className={`w-full py-4 rounded-2xl font-bold transition-all ${
                active 
                  ? 'bg-white/20 text-white cursor-default' 
                  : 'bg-blue-600 text-white shadow-lg shadow-blue-200 dark:shadow-none hover:bg-blue-700'
              }`}
            >
              {active ? 'Transmitindo...' : 'Ativar Chave'}
            </button>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 flex flex-col items-center gap-2 text-center">
          <Wifi className="text-blue-500" size={24} />
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">NFC Ativo</p>
        </div>
        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 flex flex-col items-center gap-2 text-center">
          <Smartphone className="text-emerald-500" size={24} />
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Bluetooth OK</p>
        </div>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-2xl border border-blue-100 dark:border-blue-800 flex items-start gap-4 max-w-sm">
        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-300 shrink-0">
          <CheckCircle size={18} />
        </div>
        <div>
          <h4 className="text-sm font-bold text-blue-900 dark:text-blue-100">Acesso Inteligente</h4>
          <p className="text-xs text-blue-700 dark:text-blue-300">Sua chave é criptografada e expira automaticamente após 30 segundos para sua segurança.</p>
        </div>
      </div>
    </div>
  );
};
