import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { FeatureGrid } from '../components/FeatureGrid';
import { TrendingUp, Users, AlertCircle, Cloud, Sun, CloudRain, CloudLightning, Moon, ArrowRight, Star, Calendar, Package, FileText, Key, UserPlus, ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';
import { FEATURES, UserRole, PricingPlan } from '../constants';
import { UpgradeBanner } from '../components/UpgradeBanner';
import { 
  BoletoService, 
  AnnouncementService, 
  ReservationService, 
  PackageService, 
  AssembleiaService,
  MercadoService,
  VisitorService,
  OcorrenciaService,
  Boleto, 
  Comunicado, 
  Reserva, 
  Encomenda,
  Assembleia,
  MercadoItem,
  Visitante,
  Ocorrencia
} from '../services/supabaseService';

interface DashboardProps {
  userId: string;
  userName: string;
  userRole: UserRole;
  userPlan: PricingPlan;
  condoId: string;
  onNavigate: (page: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ userId, userName, userRole, userPlan, condoId, onNavigate }) => {
  const [greeting, setGreeting] = useState('');
  const [currentDate, setCurrentDate] = useState('');
  const [weather, setWeather] = useState({ temp: 24, condition: 'Ensolarado', icon: Sun });
  const [nextBoleto, setNextBoleto] = useState<Boleto | null>(null);
  const [announcements, setAnnouncements] = useState<Comunicado[]>([]);
  const [upcomingReservations, setUpcomingReservations] = useState<Reserva[]>([]);
  const [pendingPackages, setPendingPackages] = useState<Encomenda[]>([]);
  const [upcomingAssembleia, setUpcomingAssembleia] = useState<Assembleia | null>(null);
  const [recentMercadoItems, setRecentMercadoItems] = useState<MercadoItem[]>([]);
  const [expectedVisitors, setExpectedVisitors] = useState<Visitante[]>([]);
  const [openOcorrencias, setOpenOcorrencias] = useState<Ocorrencia[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const fetchData = async () => {
    if (!userId || !condoId) return;
    
    const isAdmin = userRole === 'admin' || userRole === 'syndic' || userRole === 'global_admin';
    
    try {
      const [boleto, comms, reservations, packages, assembleia, mercado, visitors, ocorrencias] = await Promise.all([
        BoletoService.getNextPendingBoleto(userId),
        AnnouncementService.getRecentAnnouncements(condoId),
        isAdmin ? ReservationService.getCondoReservations(condoId) : ReservationService.getUpcomingReservations(userId),
        isAdmin ? PackageService.getCondoPackages(condoId) : PackageService.getPendingPackages(userId),
        AssembleiaService.getUpcomingAssembleia(condoId),
        MercadoService.getRecentItems(condoId),
        isAdmin ? VisitorService.getCondoVisitors(condoId) : VisitorService.getUserVisitors(userId),
        isAdmin ? OcorrenciaService.getCondoOcorrencias(condoId) : OcorrenciaService.getUserOcorrencias(userId)
      ]);
      
      setNextBoleto(boleto);
      setAnnouncements(comms);
      setUpcomingReservations(reservations);
      setPendingPackages(packages);
      setUpcomingAssembleia(assembleia);
      setRecentMercadoItems(mercado);
      setExpectedVisitors(visitors.filter(v => v.status !== 'finalizado'));
      setOpenOcorrencias(ocorrencias.filter(o => o.status !== 'resolved'));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    // Basic UI State
    const now = new Date();
    const hour = now.getHours();
    
    if (hour >= 5 && hour < 12) setGreeting('Bom dia');
    else if (hour >= 12 && hour < 18) setGreeting('Boa tarde');
    else setGreeting('Boa noite');

    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    setCurrentDate(now.toLocaleDateString('pt-BR', options));

    const mockWeathers = [
      { temp: 28, condition: 'Ensolarado', icon: Sun },
      { temp: 22, condition: 'Nublado', icon: Cloud },
      { temp: 19, condition: 'Chuvoso', icon: CloudRain },
    ];
    setWeather(mockWeathers[Math.floor(Math.random() * mockWeathers.length)]);

    // Initial Fetch
    fetchData();

    // Realtime Subscriptions
    if (userId && condoId) {
      let channelPromise: Promise<any> | null = null;
      
      import('../lib/supabase').then(({ supabase }) => {
        const channel = supabase.channel('dashboard-realtime')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'visitantes' }, () => fetchData())
          .on('postgres_changes', { event: '*', schema: 'public', table: 'reservas' }, () => fetchData())
          .on('postgres_changes', { event: '*', schema: 'public', table: 'encomendas' }, () => fetchData())
          .on('postgres_changes', { event: '*', schema: 'public', table: 'comunicados' }, () => fetchData())
          .on('postgres_changes', { event: '*', schema: 'public', table: 'mercado_items' }, () => fetchData())
          .on('postgres_changes', { event: '*', schema: 'public', table: 'boletos' }, () => fetchData())
          .on('postgres_changes', { event: '*', schema: 'public', table: 'ocorrencias' }, () => fetchData())
          .subscribe();
        
        channelPromise = Promise.resolve(channel);
      });

      return () => {
        if (channelPromise) {
          channelPromise.then(c => c && c.unsubscribe());
        }
      };
    }
  }, [userId, condoId]);

  const filteredFeatures = FEATURES.filter(feature => {
    if (userRole === 'global_admin') return true;
    return feature.roles.includes(userRole);
  });

  return (
    <div className="p-4 space-y-6">
      {/* Welcome Section */}
      <section className="bg-gradient-to-br from-blue-600 to-indigo-700 dark:from-slate-800 dark:to-slate-950 rounded-3xl p-6 text-white shadow-lg shadow-blue-200 dark:shadow-none">
        <div className="flex justify-between items-start mb-6">
          <div>
            <p className="text-blue-100 dark:text-slate-400 text-xs font-medium uppercase tracking-widest mb-1">{currentDate}</p>
            <h2 className="text-2xl font-bold">{greeting}, {userName.split(' ')[0]}!</h2>
          </div>
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-2">
              <weather.icon size={24} className="text-amber-300" />
              <span className="text-xl font-bold">{weather.temp}°C</span>
            </div>
            <span className="text-[10px] font-medium opacity-80 uppercase tracking-wider">{weather.condition}</span>
          </div>
        </div>
        
        <div className="flex flex-col gap-4 mb-6">
           <Link 
            to="/feature/digital-key"
            className="w-full bg-white text-blue-700 dark:bg-slate-700 dark:text-white py-4 rounded-2xl flex items-center justify-center gap-3 font-bold shadow-xl shadow-blue-900/20 active:scale-95 transition-transform"
          >
            <div className="bg-blue-100 dark:bg-slate-600 p-2 rounded-lg">
              <Key size={18} className="text-blue-600 dark:text-blue-400" />
            </div>
            Abrir Portas / Chave Digital
          </Link>
        </div>
        
         <div className="grid grid-cols-2 gap-3">
          <Link to="/feature/boletos" className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 active:scale-95 transition-transform">
            <div className="flex items-center gap-2 mb-2">
              <FileText size={16} className="text-blue-200" />
              <span className="text-xs font-medium uppercase tracking-wider opacity-80">Próxima Fatura</span>
            </div>
            <p className="text-lg font-bold">
              {nextBoleto ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(nextBoleto.amount) : 'R$ 0,00'}
            </p>
            <p className="text-[10px] opacity-70">
              {nextBoleto ? `Vencimento: ${new Date(nextBoleto.due_date).toLocaleDateString('pt-BR')}` : 'Sem faturas pendentes'}
            </p>
          </Link>
          <Link to="/feature/comunicados" className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 active:scale-95 transition-transform">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle size={16} className="text-amber-300" />
              <span className="text-xs font-medium uppercase tracking-wider opacity-80">Avisos</span>
            </div>
            <p className="text-lg font-bold">{announcements.length} Ativos</p>
            <p className="text-[10px] opacity-70">Mural atualizado</p>
          </Link>
          <Link to="/feature/reservas" className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 active:scale-95 transition-transform">
            <div className="flex items-center gap-2 mb-2">
              <Calendar size={16} className="text-emerald-300" />
              <span className="text-xs font-medium uppercase tracking-wider opacity-80">Reservas</span>
            </div>
            <p className="text-lg font-bold">{upcomingReservations.length} Ativas</p>
            <p className="text-[10px] opacity-70">
              {upcomingReservations.length > 0 
                ? `Próxima: ${new Date(upcomingReservations[0].reservation_date).toLocaleDateString('pt-BR')}` 
                : 'Nenhuma reserva'}
            </p>
          </Link>
          <Link to="/feature/encomendas" className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 active:scale-95 transition-transform">
            <div className="flex items-center gap-2 mb-2">
              <Package size={16} className="text-purple-300" />
              <span className="text-xs font-medium uppercase tracking-wider opacity-80">Encomendas</span>
            </div>
            <p className="text-lg font-bold">
              {pendingPackages.length} {(userRole === 'admin' || userRole === 'syndic' || userRole === 'global_admin') ? 'Registradas' : 'Pendentes'}
            </p>
            <p className="text-[10px] opacity-70">
              {(userRole === 'admin' || userRole === 'syndic' || userRole === 'global_admin') 
                ? 'Gerencie entregas' 
                : (pendingPackages.length > 0 ? 'Retire na portaria' : 'Nenhuma pendência')}
            </p>
          </Link>
          <Link to="/feature/visitantes" className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 active:scale-95 transition-transform">
            <div className="flex items-center gap-2 mb-2">
              <UserPlus size={16} className="text-sky-300" />
              <span className="text-xs font-medium uppercase tracking-wider opacity-80">Visitantes</span>
            </div>
            <p className="text-lg font-bold">{expectedVisitors.length} Esperados</p>
            <p className="text-[10px] opacity-70">Liberações ativas</p>
          </Link>
          <Link to="/feature/ocorrencias" className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 active:scale-95 transition-transform">
            <div className="flex items-center gap-2 mb-2">
              <ShieldAlert size={16} className="text-red-300" />
              <span className="text-xs font-medium uppercase tracking-wider opacity-80">Ocorrências</span>
            </div>
            <p className="text-lg font-bold">{openOcorrencias.length} Abertas</p>
            <p className="text-[10px] opacity-70">Acompanhamento</p>
          </Link>
        </div>
        
        {upcomingAssembleia && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-4 bg-amber-500/20 backdrop-blur-md border border-amber-500/30 rounded-2xl"
          >
            <div className="flex items-center gap-3">
              <div className="bg-amber-500 p-2 rounded-xl text-white">
                <Users size={18} />
              </div>
              <div className="flex-1">
                <p className="text-[10px] uppercase font-bold text-amber-200 tracking-wider">Próxima Assembleia</p>
                <h4 className="text-sm font-bold">{upcomingAssembleia.title}</h4>
                <p className="text-xs opacity-80">{new Date(upcomingAssembleia.start_date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', hour: '2-digit', minute: '2-digit' })}</p>
              </div>
              <Link to="/feature/assembleias" className="bg-white text-amber-700 px-3 py-1.5 rounded-lg text-[10px] font-bold">Ver</Link>
            </div>
          </motion.div>
        )}
      </section>


      {/* Upgrade Call to Action */}
      <UpgradeBanner currentPlan={userPlan} />

      {/* Quick Actions Grid */}
      <section>
         <div className="flex items-center justify-between mb-4 px-2">
          <h3 className="font-bold text-slate-800 dark:text-white">Acesso Rápido</h3>
          <Link to="/features" className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline">Ver todos</Link>
        </div>
        <FeatureGrid features={filteredFeatures} userPlan={userPlan} userRole={userRole} />
      </section>

      {/* Feed Section */}
      <section className="space-y-4">
        <h3 className="font-bold text-slate-800 dark:text-white px-2">Mural de Avisos</h3>
        <div className="space-y-3">
          {announcements.length > 0 ? (
            announcements.map((announcement) => (
              <motion.div 
                key={announcement.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex gap-4"
              >
                <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-700 flex-shrink-0 flex items-center justify-center text-slate-400 dark:text-slate-500">
                  <Users size={24} />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">{announcement.title}</h4>
                    <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500">
                      {new Date(announcement.created_at).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                    {announcement.content}
                  </p>
                </div>
              </motion.div>
            ))
          ) : (
            <p className="text-center text-slate-500 text-xs py-4">Nenhum comunicado recente.</p>
          )}
        </div>
      </section>

      {/* Marketplace Sneak Peek */}
      {recentMercadoItems.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between mb-4 px-2">
            <h3 className="font-bold text-slate-800 dark:text-white">Classificados</h3>
            <Link to="/feature/classificados" className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline">Ver todos</Link>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide px-2">
            {recentMercadoItems.map((item) => (
              <motion.div 
                key={item.id}
                className="min-w-[160px] bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden"
              >
                {item.image_url ? (
                  <img src={item.image_url} alt={item.title} className="w-full h-24 object-cover" />
                ) : (
                  <div className="w-full h-24 bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-400">
                    <TrendingUp size={24} />
                  </div>
                )}
                <div className="p-3">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-white truncate">{item.title}</h4>
                  <p className="text-[10px] text-blue-600 dark:text-blue-400 font-bold mt-1">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.price)}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Promo Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 p-6">
        <div className="relative z-10">
          <span className="inline-block px-2 py-1 rounded-md bg-emerald-500 text-white text-[10px] font-bold uppercase mb-2">Oferta Exclusiva</span>
          <h4 className="text-lg font-bold text-emerald-900 dark:text-emerald-100 mb-1">5% de desconto</h4>
          <p className="text-xs text-emerald-700 dark:text-emerald-300 mb-4">Na linha de itens para decoração no Mercado Interno.</p>
          <button className="bg-emerald-600 dark:bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-lg shadow-emerald-200 dark:shadow-none">Aproveitar</button>
        </div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-200/30 dark:bg-emerald-400/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
      </section>

    </div>
  );
};
