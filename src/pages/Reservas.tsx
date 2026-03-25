import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Info, 
  CheckCircle2, 
  ChevronRight, 
  ChevronLeft, 
  Users, 
  ChefHat, 
  Dumbbell, 
  Waves, 
  Music, 
  ShieldCheck, 
  Sparkles, 
  Settings, 
  AlertCircle,
  MoreVertical,
  X,
  CreditCard,
  History,
  Wind,
  Plus
} from 'lucide-react';
import { FeatureHeader } from '../components/FeatureHeader';

type Area = {
  id: string;
  name: string;
  icon: any;
  capacity: number;
  price: string;
  color: string;
  description: string;
  imageUrl: string;
  rules: string[];
};

const AREAS: Area[] = [
  { 
    id: '1', name: 'Churrasqueira Gourmet', icon: ChefHat, capacity: 25, price: 'R$ 150', color: 'bg-orange-500', 
    description: 'Espaço climatizado com churrasqueira profissional e utensílios completos.', 
    imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&q=80',
    rules: ['Proibido som após 22h', 'Máximo 25 pessoas', 'Limpeza inclusa']
  },
  { 
    id: '2', name: 'Salão de Festas Master', icon: Music, capacity: 80, price: 'R$ 450', color: 'bg-indigo-500', 
    description: 'Amplo salão com pista de dança, palco e estrutura para buffet.', 
    imageUrl: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&q=80',
    rules: ['Agendamento 15 dias antes', 'Segurança obrigatória', 'Proibido fumo']
  },
  { 
    id: '3', name: 'Academia VIP', icon: Dumbbell, capacity: 10, price: 'Grátis', color: 'bg-emerald-500', 
    description: 'Equipamentos de última geração e área funcional.', 
    imageUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80',
    rules: ['Uso de toalha obrigatório', 'Máximo 1 hora por dia', 'Idade mín. 16 anos']
  },
  { 
    id: '4', name: 'Piscina & Deck', icon: Waves, capacity: 40, price: 'Grátis', color: 'bg-cyan-500', 
    description: 'Piscina aquecida semi-olímpica e deck molhado com espreguiçadeiras.', 
    imageUrl: 'https://images.unsplash.com/photo-1519449556851-5720b33024e7?w=800&q=80',
    rules: ['Proibido vidro no deck', 'Exame médico atualizado', 'Crianças acompanhadas']
  },
];

const DAYS = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB'];

export const Reservas: React.FC = () => {
  const [selectedArea, setSelectedArea] = useState<Area | null>(null);
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleBooking = () => {
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      setSelectedArea(null);
      setSelectedDate(null);
    }, 2500);
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <FeatureHeader 
        icon={Calendar}
        title="Reservas de Espaços"
        description="Agende salões, churrasqueiras, academias e muito mais. Transparência total na disponibilidade do condomínio."
        color="bg-emerald-500"
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-12">
        {/* Left: Areas List */}
        <div className="lg:col-span-4 space-y-6">
          <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
            <Settings size={16} /> Configurações de Espaços
          </h4>
          {AREAS.map((area) => (
            <motion.button
              key={area.id}
              onClick={() => setSelectedArea(area)}
              whileHover={{ x: 8 }}
              className={`w-full text-left p-8 rounded-[40px] border-2 transition-all group relative overflow-hidden ${
                selectedArea?.id === area.id 
                ? `${area.color} border-${area.color.split('-')[1]}-600 text-white shadow-2xl` 
                : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-6 relative z-10">
                <div className={`w-16 h-16 rounded-[24px] flex items-center justify-center transition-transform ${
                  selectedArea?.id === area.id ? 'bg-white/20' : 'bg-slate-50 dark:bg-slate-900 group-hover:rotate-12'
                }`}>
                  <area.icon size={32} />
                </div>
                <div>
                  <h5 className="text-xl font-black uppercase tracking-tighter leading-none mb-2">{area.name}</h5>
                  <div className="flex items-center gap-3 opacity-60 font-black text-[10px] uppercase tracking-widest">
                    <span className="flex items-center gap-1"><Users size={12} /> {area.capacity} Max</span>
                    <span className="flex items-center gap-1"><CreditCard size={12} /> {area.price}</span>
                  </div>
                </div>
              </div>
            </motion.button>
          ))}
        </div>

        {/* Right: Booking Details & Calendar Placeholder */}
        <div className="lg:col-span-8">
          <AnimatePresence mode="wait">
            {!selectedArea ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-full bg-slate-50 dark:bg-slate-900/50 rounded-[56px] border-4 border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-center p-12"
              >
                <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-300 mb-8 border border-white dark:border-slate-700 shadow-xl">
                  <Plus size={48} />
                </div>
                <h4 className="text-3xl font-black text-slate-300 uppercase tracking-tighter">Selecione um Espaço</h4>
                <p className="text-sm font-bold text-slate-400 mt-4 max-w-sm uppercase tracking-widest">Escolha o local do seu evento para visualizar a disponibilidade no calendário.</p>
              </motion.div>
            ) : (
              <motion.div
                key={selectedArea.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-white dark:bg-slate-800 rounded-[56px] shadow-2xl border border-slate-100 dark:border-slate-700 overflow-hidden flex flex-col"
              >
                {/* Header Image */}
                <div className="h-72 relative">
                  <img src={selectedArea.imageUrl} className="w-full h-full object-cover" alt={selectedArea.name} />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent opacity-80" />
                  <div className="absolute bottom-10 left-10 text-white">
                    <h3 className="text-4xl font-black uppercase tracking-tighter leading-none mb-2 italic drop-shadow-lg">{selectedArea.name}</h3>
                    <p className="text-xs font-bold uppercase tracking-widest opacity-80 leading-none">{selectedArea.description}</p>
                  </div>
                </div>

                {/* Calendar Placeholder */}
                <div className="p-12">
                  <div className="flex justify-between items-center mb-10">
                    <h5 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tighter">Maio de 2025</h5>
                    <div className="flex gap-4">
                      <button className="p-4 bg-slate-100 dark:bg-slate-900 rounded-2xl hover:bg-slate-200"><ChevronLeft size={20} /></button>
                      <button className="p-4 bg-slate-100 dark:bg-slate-900 rounded-2xl hover:bg-slate-200"><ChevronRight size={20} /></button>
                    </div>
                  </div>

                  <div className="grid grid-cols-7 gap-4 mb-12">
                    {DAYS.map(day => (
                      <div key={day} className="text-center text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest">{day}</div>
                    ))}
                    {Array.from({ length: 14 }).map((_, i) => (
                      <button
                        key={i}
                        disabled={i < 5}
                        onClick={() => setSelectedDate(i + 1)}
                        className={`aspect-square rounded-[24px] flex items-center justify-center text-sm font-black border-2 transition-all active:scale-95 ${
                          i < 5 
                          ? 'bg-red-50 text-red-100 border-red-50 cursor-not-allowed opacity-30 strike-through' 
                          : selectedDate === i + 1 
                          ? 'bg-emerald-500 text-white border-emerald-600 shadow-xl' 
                          : 'bg-white dark:bg-slate-900 text-slate-500 border-slate-50 dark:border-slate-700 hover:border-emerald-500'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>

                  <div className="flex flex-col md:flex-row gap-12 p-10 bg-slate-50 dark:bg-slate-900 rounded-[40px] border border-slate-100 dark:border-slate-800">
                    <div className="flex-1">
                      <h6 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                        <ShieldCheck size={16} className="text-emerald-500" /> Regras do Local
                      </h6>
                      <ul className="space-y-4">
                        {selectedArea.rules.map((rule, idx) => (
                          <li key={idx} className="flex items-start gap-4 text-xs font-bold text-slate-600 dark:text-slate-400">
                            <span className="w-2 h-2 bg-emerald-500 rounded-full mt-1.5 flex-shrink-0" />
                            {rule}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="flex flex-col justify-end">
                      <button 
                        disabled={!selectedDate || isSuccess}
                        onClick={handleBooking}
                        className={`px-12 py-6 rounded-[28px] text-sm font-black uppercase tracking-widest transition-all w-full md:w-auto overflow-hidden relative ${
                          selectedDate 
                          ? 'bg-slate-900 text-white hover:bg-black shadow-2xl active:scale-95' 
                          : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                        }`}
                      >
                        <span className="relative z-10">
                          {isSuccess ? 'Reservado!' : 'Agendar Agora'}
                        </span>
                        {isSuccess && (
                          <motion.div 
                            initial={{ x: '-100%' }}
                            animate={{ x: '100%' }}
                            transition={{ duration: 1 }}
                            className="absolute inset-0 bg-emerald-500 z-0"
                          />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Booking History / My Reservations */}
      <div className="bg-slate-900 p-12 rounded-[56px] border border-slate-800 shadow-2xl">
        <div className="flex justify-between items-center mb-10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-emerald-500/10 rounded-[28px] flex items-center justify-center text-emerald-500 border border-emerald-500/20">
              <History size={32} />
            </div>
            <div>
              <h4 className="text-2xl font-black text-white uppercase tracking-tighter italic">Meus Agendamentos</h4>
              <p className="text-[10px] uppercase tracking-widest font-black text-emerald-500/70">Acompanhe suas reservas futuras e passadas</p>
            </div>
          </div>
          <button className="p-4 bg-white/5 text-white/40 rounded-full hover:bg-white/10 transition-colors">
            <MoreVertical size={24} />
          </button>
        </div>

        <div className="flex items-center gap-6 p-8 bg-black/50 rounded-[32px] border border-white/5 group hover:border-emerald-500/30 transition-all">
          <div className="w-20 h-20 bg-orange-500 rounded-[24px] flex items-center justify-center text-white ring-8 ring-orange-500/10 group-hover:rotate-12 transition-transform">
            <ChefHat size={40} />
          </div>
          <div className="flex-1">
            <h5 className="text-xl font-black text-white uppercase tracking-tighter leading-none mb-1">Churrasqueira Gourmet</h5>
            <p className="text-xs font-bold text-white/40 uppercase tracking-widest mb-3 flex items-center gap-2">
              <Calendar size={12} className="text-orange-500" /> Sábado, 24 de Maio de 2025
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-lg text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">
              <CheckCircle2 size={12} /> Confirmado & Pago
            </div>
          </div>
          <div className="hidden md:flex flex-col items-end gap-2">
            <span className="text-sm font-black text-white tracking-widest">R$ 150,00</span>
            <button className="text-[10px] font-black uppercase text-rose-500 tracking-widest hover:underline">Cancelar Reserva</button>
          </div>
        </div>
      </div>
    </div>
  );
};
