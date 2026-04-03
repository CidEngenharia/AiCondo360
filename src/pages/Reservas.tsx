import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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
  Plus,
  Star
} from 'lucide-react';
import { FeatureHeader } from '../components/FeatureHeader';
import { ReservationService, Reserva as IReserva } from '../services/supabaseService';

interface ReservasProps {
  userId: string;
  condoId: string;
}

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
  { 
    id: '5', name: 'Quadra de Futebol', icon: Star, capacity: 12, price: 'Grátis', color: 'bg-blue-600', 
    description: 'Quadra poliesportiva com grama sintética e iluminação led.', 
    imageUrl: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&q=80',
    rules: ['Uso de calçado adequado', 'Horário: 08h às 22h', 'Reserva de 1 hora']
  },
];

const DAYS = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB'];

export const Reservas: React.FC<ReservasProps> = ({ userId, condoId }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedArea, setSelectedArea] = useState<Area | null>(null);
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [reservations, setReservations] = useState<IReserva[]>([]);
  const [condoReservations, setCondoReservations] = useState<IReserva[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCalendar, setShowCalendar] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const loadingRef = React.useRef(false);

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    setSelectedDate(null);
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    setSelectedDate(null);
  };

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  React.useEffect(() => {
    if (userId && condoId) {
      fetchReservations();
    }
  }, [userId, condoId]);

  const fetchReservations = async () => {
    if (!userId || !condoId || loadingRef.current) return;
    
    loadingRef.current = true;
    setLoading(true);
    console.log("[Reservas] Fetching reservations for user:", userId, "condo:", condoId);
    try {
      const uRes = await ReservationService.getUserReservations(userId);
      setReservations(uRes);
      const cRes = await ReservationService.getCondoReservations(condoId);
      setCondoReservations(cRes);
    } catch (error) {
      console.error('[Reservas] Error details:', error);
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  };

  const isDayReserved = (day: number) => {
    if (!selectedArea) return false;
    const year = currentDate.getFullYear();
    const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
    const dateStr = `${year}-${month}-${day.toString().padStart(2, '0')}`;
    return condoReservations.some(r => r.area_name === selectedArea.name && r.reservation_date.startsWith(dateStr));
  };

  const handleBooking = async () => {
    if (!selectedArea || !selectedDate) return;
    
    if (isDayReserved(selectedDate)) {
      setBookingError("já existe agendamentos ativos para essa data");
      setTimeout(() => setBookingError(null), 3000);
      return;
    }

    setLoading(true);
    try {
        const year = currentDate.getFullYear();
        const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
        const dateStr = `${year}-${month}-${selectedDate.toString().padStart(2, '0')}`;
        await ReservationService.createReserva({
            condominio_id: condoId,
            user_id: userId,
            area_name: selectedArea.name,
            reservation_date: dateStr,
            start_time: '12:00:00',
            end_time: '22:00:00',
            status: 'confirmed'
        });
        setIsSuccess(true);
        fetchReservations();
        setTimeout(() => {
            setIsSuccess(false);
            setSelectedArea(null);
            setSelectedDate(null);
            setShowCalendar(false);
        }, 2000);
    } catch (error: any) {
        console.error('Error booking:', error);
        alert('Erro ao reservar: ' + (error?.message || 'Erro de permissão ou dados inválidos. Verifique se seu perfil está completo.'));
    } finally {
        setLoading(false);
    }
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
              whileHover={{ x: 4 }}
              className={`w-full text-left p-4 rounded-3xl border transition-all group relative overflow-hidden ${
                selectedArea?.id === area.id 
                ? `${area.color} border-slate-200 text-white shadow-lg` 
                : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 hover:border-slate-200'
              }`}
            >
              <div className="flex items-center gap-4 relative z-10">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform ${
                  selectedArea?.id === area.id ? 'bg-white/20' : 'bg-slate-50 dark:bg-slate-900 group-hover:rotate-6'
                }`}>
                  <area.icon size={24} />
                </div>
                <div>
                  <h5 className="text-sm font-bold uppercase tracking-tight leading-none mb-1">{area.name}</h5>
                  <div className="flex items-center gap-3 opacity-60 font-medium text-[9px] uppercase tracking-wider">
                    <span className="flex items-center gap-1"><Users size={10} /> {area.capacity} Max</span>
                    <span className="flex items-center gap-1"><CreditCard size={10} /> {area.price}</span>
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
                className="min-h-[400px] flex-1 bg-slate-50/50 dark:bg-slate-900/30 rounded-[40px] border-2 border-dashed border-slate-200 dark:border-slate-800/50 flex flex-col items-center justify-center text-center p-8 lg:p-12"
              >
                <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-200 mb-6 border border-slate-100 dark:border-slate-700 shadow-sm">
                  <Star size={32} strokeWidth={1} />
                </div>
                <h4 className="text-xl font-black text-slate-300 dark:text-slate-700 uppercase tracking-tighter leading-none mb-3">Selecione um Espaço</h4>
                <p className="text-[10px] font-bold text-slate-400 max-w-[200px] uppercase tracking-widest leading-relaxed">
                  Escolha um dos locais ao lado para gerenciar datas e disponibilidade.
                </p>
              </motion.div>
            ) : (
              <motion.div
                key={selectedArea.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden flex flex-col max-w-[360px] w-full mx-auto lg:ml-0 xl:mx-auto"
              >
                {/* Header Image minimalista */}
                <div className="h-28 relative group cursor-pointer" onClick={() => setShowCalendar(!showCalendar)}>
                  <img src={selectedArea.imageUrl} className="w-full h-full object-cover" alt={selectedArea.name} />
                  <div className="absolute inset-0 bg-slate-900/40 group-hover:bg-slate-900/50 transition-colors" />
                  <div className="absolute inset-0 flex flex-col justify-end p-4">
                    <h3 className="text-base font-bold text-white uppercase tracking-tight leading-none mb-1">{selectedArea.name}</h3>
                    <p className="text-[9px] font-medium text-white/80 uppercase tracking-widest leading-none truncate">{selectedArea.description}</p>
                  </div>
                  <div className="absolute top-3 right-3 p-1.5 bg-black/30 rounded-full backdrop-blur-sm text-white">
                    {showCalendar ? <X size={12} /> : <Calendar size={12} />}
                  </div>
                </div>

                {/* Calendar Dropdown Area */}
                <AnimatePresence>
                  {showCalendar && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden bg-white dark:bg-slate-800"
                    >
                      <div className="p-5">
                        <div className="flex justify-between items-center mb-4">
                          <h5 className="text-sm font-bold text-slate-800 dark:text-white capitalize">
                            {currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                          </h5>
                          <div className="flex gap-1">
                            <button onClick={prevMonth} className="p-1 text-rose-500 hover:bg-rose-50 rounded"><ChevronLeft size={16} /></button>
                            <button onClick={nextMonth} className="p-1 text-rose-500 hover:bg-rose-50 rounded"><ChevronRight size={16} /></button>
                          </div>
                        </div>

                        <div className="grid grid-cols-7 gap-y-2 mb-6">
                          {DAYS.map(day => (
                            <div key={day} className="text-center text-[9px] font-bold text-slate-400 mb-1">{day}</div>
                          ))}
                          
                          {/* Empty spaces for the first week */}
                          {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                            <div key={`empty-${i}`} />
                          ))}

                          {Array.from({ length: daysInMonth }).map((_, i) => {
                            const day = i + 1;
                            const isReserved = isDayReserved(day);
                            
                            const today = new Date();
                            const isPast = new Date(currentDate.getFullYear(), currentDate.getMonth(), day) < new Date(today.getFullYear(), today.getMonth(), today.getDate());

                            return (
                              <div key={i} className="flex justify-center">
                                <button
                                  disabled={isPast}
                                  onClick={() => setSelectedDate(day)}
                                  className={`w-8 h-8 rounded-full flex items-center justify-center text-[13px] transition-colors relative ${
                                    isReserved
                                    ? 'text-slate-400 cursor-not-allowed group' 
                                    : isPast
                                    ? 'text-slate-200 cursor-not-allowed opacity-40' 
                                    : selectedDate === day 
                                    ? 'bg-rose-500 text-white font-bold' 
                                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                                  }`}
                                >
                                  {isReserved ? (
                                    <X size={16} className="text-rose-500" />
                                  ) : day}
                                  {isReserved && (
                                    <div className="absolute bottom-[-20px] left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[8px] py-0.5 px-1.5 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none z-20 transition-opacity">
                                      Ocupado
                                    </div>
                                  )}
                                </button>
                              </div>
                            );
                          })}
                        </div>
                        
                        <AnimatePresence>
                          {bookingError && (
                            <motion.div 
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0 }}
                              className="mb-4 p-2 bg-rose-50 text-rose-600 text-[9px] font-bold uppercase tracking-widest rounded-lg flex items-center gap-1.5"
                            >
                              <AlertCircle size={12} /> {bookingError}
                            </motion.div>
                          )}
                        </AnimatePresence>

                        <div className="flex flex-col gap-3 p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                          <div>
                            <h6 className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                              <ShieldCheck size={10} className="text-emerald-500" /> Regras Básicas
                            </h6>
                            <ul className="space-y-1">
                              {selectedArea.rules.slice(0, 2).map((rule, idx) => (
                                <li key={idx} className="flex items-center gap-1.5 text-[9px] font-medium text-slate-600 dark:text-slate-400">
                                  <span className="w-1 h-1 bg-emerald-500 rounded-full flex-shrink-0" />
                                  {rule}
                                </li>
                              ))}
                            </ul>
                          </div>
                          
                          <button 
                            disabled={!selectedDate || isSuccess}
                            onClick={handleBooking}
                            className={`py-2.5 mt-1 rounded-lg text-[9px] font-bold uppercase tracking-widest transition-all w-full relative ${
                              selectedDate 
                              ? 'bg-slate-900 text-white hover:bg-black active:scale-95' 
                              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                            }`}
                          >
                            {isSuccess ? 'Reservado!' : 'Confirmar Data'}
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                
                {!showCalendar && (
                  <div className="p-4 bg-slate-50/50 dark:bg-slate-900/20 text-center">
                    <button 
                      onClick={() => setShowCalendar(true)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-lg text-[9px] font-bold uppercase tracking-widest text-slate-600 hover:text-slate-900 transition-colors shadow-sm w-full justify-center"
                    >
                      <Calendar size={12} /> Selecionar Data
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Booking History / My Reservations */}
      <div className="bg-white dark:bg-slate-800 p-8 lg:p-12 rounded-[48px] border border-slate-100 dark:border-slate-700 shadow-xl shadow-slate-100 dark:shadow-none">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 border border-emerald-500/20">
              <History size={28} />
            </div>
            <div>
              <h4 className="text-xl font-bold text-slate-800 dark:text-white uppercase tracking-tight">Meus Agendamentos Ativos</h4>
              <p className="text-[9px] uppercase tracking-widest font-bold text-slate-400">Acompanhe suas próximas datas reservadas</p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <div className="inline-flex items-center gap-1 px-3 py-1 bg-slate-50 dark:bg-slate-900 rounded-full border border-slate-100 dark:border-slate-800 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              <Plus size={10} /> Gerar Relatórios:
            </div>
            <button 
              onClick={() => alert('Gerando relatório de 7 dias...')}
              className="px-4 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl text-[9px] font-bold uppercase tracking-widest hover:bg-blue-100 transition-all border border-blue-100 dark:border-blue-800"
            >
              Próximos 7 Dias
            </button>
            <button 
              onClick={() => alert('Gerando relatório de 15 dias...')}
              className="px-4 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl text-[9px] font-bold uppercase tracking-widest hover:bg-indigo-100 transition-all border border-indigo-100 dark:border-indigo-800"
            >
              Próximos 15 Dias
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {reservations.length > 0 ? (
            reservations.map(res => (
              <div key={res.id} className="flex items-center gap-5 p-6 bg-slate-50 dark:bg-slate-900/50 rounded-3xl border border-slate-100 dark:border-slate-800 group hover:border-emerald-200 dark:hover:border-emerald-900/30 transition-all">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white ring-4 ring-white dark:ring-slate-800 group-hover:scale-105 transition-transform ${
                  res.area_name.includes('Churrasqueira') ? 'bg-orange-500 shadow-orange-100' : 
                  res.area_name.includes('Salão') ? 'bg-indigo-500 shadow-indigo-100' :
                  res.area_name.includes('Academia') ? 'bg-emerald-500 shadow-emerald-100' : 
                  res.area_name.includes('Quadra') ? 'bg-blue-600 shadow-blue-100' : 'bg-cyan-500 shadow-cyan-100'
                }`}>
                  {res.area_name.includes('Churrasqueira') ? <ChefHat size={32} /> : 
                   res.area_name.includes('Salão') ? <Music size={32} /> :
                   res.area_name.includes('Academia') ? <Dumbbell size={32} /> : 
                   res.area_name.includes('Quadra') ? <Star size={32} /> : <Waves size={32} />}
                </div>
                <div className="flex-1 min-w-0">
                  <h5 className="text-base font-bold text-slate-800 dark:text-white uppercase tracking-tight leading-none mb-1">{res.area_name}</h5>
                  <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Calendar size={12} className="text-emerald-500" /> {new Date(res.reservation_date).toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-3">
                  <div className={`px-3 py-1 rounded-full text-[8px] font-bold uppercase tracking-widest border ${
                    res.status === 'confirmed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                  }`}>
                    {res.status === 'confirmed' ? 'Auditado v.12' : 'Pendente'}
                  </div>
                  <button 
                    onClick={async () => {
                      if (window.confirm('Cancelar esta reserva?')) {
                        await ReservationService.deleteReserva(res.id);
                        fetchReservations();
                      }
                    }}
                    className="text-[9px] font-bold uppercase text-rose-500 tracking-wider hover:text-rose-700 transition-colors"
                  >
                    Remover
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-10 bg-slate-50/50 dark:bg-slate-900/30 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
              <History size={32} className="mx-auto text-slate-200 mb-2" />
              <p className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.2em]">Sem atividades recentes</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
