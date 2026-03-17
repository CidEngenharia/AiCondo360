import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Calendar, Clock, MapPin, Users, Plus, Check, ChevronRight, AlertCircle } from 'lucide-react';
import { FeatureHeader } from '../components/FeatureHeader';
import { ReservationService, Reserva } from '../services/supabaseService';

interface Space {
  id: string;
  name: string;
  image: string;
  capacity: number;
  price: number;
  status: 'available' | 'maintenance' | 'busy';
}

const spaces: Space[] = [
  { id: '1', name: 'Salão de Festas Principal', image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80', capacity: 100, price: 150.00, status: 'available' },
  { id: '2', name: 'Espaço Gourmet', image: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&q=80', capacity: 20, price: 80.00, status: 'available' },
  { id: '3', name: 'Churrasqueira A', image: 'https://images.unsplash.com/photo-1534073131343-98282386daff?auto=format&fit=crop&q=80', capacity: 15, price: 50.00, status: 'busy' },
  { id: '4', name: 'Sala de Cinema', image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&q=80', capacity: 12, price: 0.00, status: 'available' },
];

interface ReservasProps {
  userId: string;
  condoId: string;
}

export const Reservas: React.FC<ReservasProps> = ({ userId, condoId }) => {
  const [selectedSpace, setSelectedSpace] = useState<string | null>(null);
  const [myReservations, setMyReservations] = useState<Reserva[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReservations = async () => {
      setLoading(true);
      try {
        const data = await ReservationService.getUserReservations(userId);
        setMyReservations(data);
      } catch (error) {
        console.error('Error fetching reservations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReservations();
  }, [userId]);

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'confirmed': return 'Confirmado';
      case 'pending': return 'Pendente';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'border-emerald-500 text-emerald-600';
      case 'pending': return 'border-amber-500 text-amber-600';
      case 'cancelled': return 'border-red-500 text-red-600';
      default: return 'border-slate-500';
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-6 px-4">
      <FeatureHeader 
        icon={Calendar}
        title="Reservas de Espaços"
        description="Agende salões, churrasqueiras e áreas comuns do seu condomínio com facilidade."
        color="bg-purple-500"
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Reservation List/Grid */}
        <div className="lg:col-span-3 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {spaces.map((space) => (
              <motion.div
                key={space.id}
                whileHover={{ y: -5 }}
                className="bg-white dark:bg-slate-800 rounded-3xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-700 group cursor-pointer"
                onClick={() => setSelectedSpace(space.id)}
              >
                <div className="relative h-48">
                  <img 
                    src={space.image} 
                    alt={space.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute top-4 right-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-800 dark:text-white">
                    {space.status === 'available' ? (
                      <span className="text-emerald-500">Disponível</span>
                    ) : space.status === 'busy' ? (
                      <span className="text-amber-500">Ocupado Hoje</span>
                    ) : (
                      <span className="text-red-500">Manutenção</span>
                    )}
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-lg text-slate-900 dark:text-white group-hover:text-purple-600 transition-colors">{space.name}</h3>
                      <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center gap-1 text-xs text-slate-500">
                          <Users size={14} />
                          <span>Até {space.capacity} pessoas</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-slate-500">
                          <MapPin size={14} />
                          <span>Geral</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-50 dark:border-slate-700">
                    <div>
                      <span className="text-slate-400 text-[10px] font-bold uppercase block">Taxa de Limpeza</span>
                      <span className="text-lg font-black text-slate-900 dark:text-white">
                        {space.price === 0 ? 'Grátis' : `R$ ${space.price.toFixed(2)}`}
                      </span>
                    </div>
                    <button className="flex items-center gap-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 px-4 py-2 rounded-xl text-xs font-bold hover:bg-purple-600 hover:text-white transition-all">
                      Reservar <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Sidebar: My Reservations */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h4 className="font-bold text-slate-900 dark:text-white">Minhas Agendas</h4>
              <button className="p-2 bg-purple-50 dark:bg-purple-900/20 text-purple-600 rounded-xl hover:bg-purple-600 hover:text-white transition-all">
                <Plus size={18} />
              </button>
            </div>

            <div className="space-y-4">
              {loading ? (
                [1, 2].map(id => (
                  <div key={id} className="h-24 bg-slate-50 dark:bg-slate-900/50 rounded-2xl animate-pulse"></div>
                ))
              ) : myReservations.length > 0 ? (
                myReservations.map((res) => (
                  <div key={res.id} className={`p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border-l-4 ${getStatusColor(res.status)}`}>
                    <p className={`text-[10px] font-bold uppercase mb-1`}>{getStatusLabel(res.status)}</p>
                    <h5 className="font-bold text-sm text-slate-800 dark:text-white truncate">{res.area_name}</h5>
                    <div className="flex items-center gap-2 mt-2 text-[10px] text-slate-500">
                      <Calendar size={12} />
                      <span>{new Date(res.reservation_date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' })}</span>
                    </div>
                    {res.start_time && res.end_time && (
                      <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-500">
                        <Clock size={12} />
                        <span>{res.start_time.substring(0, 5)} - {res.end_time.substring(0, 5)}</span>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <div className="bg-slate-50 dark:bg-slate-900 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Calendar size={20} className="text-slate-300" />
                  </div>
                  <p className="text-xs text-slate-500">Você não tem reservas ativas.</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-600 to-indigo-700 p-6 rounded-3xl text-white shadow-xl shadow-purple-500/20">
            <h4 className="font-bold mb-2">Dica de Reserva</h4>
            <p className="text-xs opacity-80 leading-relaxed mb-4">
              Reserve com pelo menos 15 dias de antecedência para garantir a disponibilidade nos fins de semana.
            </p>
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest bg-white/10 p-2 rounded-xl">
              <Check size={14} />
              <span>Regras do Condomínio</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
