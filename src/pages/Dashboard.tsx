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
    // Function to update UI State
    const updateUIState = () => {
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

      // Simulate real-time weather based on hour
      let currentTemp = 24;
      let currentCondition = 'Ensolarado';
      let currentIcon = Sun;
      
      if (hour >= 6 && hour < 10) {
        currentTemp = 20;
        currentCondition = 'Ameno';
        currentIcon = Sun;
      } else if (hour >= 10 && hour < 16) {
        currentTemp = 28 + Math.floor(Math.random() * 4); // Variety around 28-31
        currentCondition = 'Ensolarado';
        currentIcon = Sun;
      } else if (hour >= 16 && hour < 19) {
        currentTemp = 26;
        currentCondition = 'Ensolarado';
        currentIcon = Sun;
      } else if (hour >= 19 || hour < 6) {
          currentTemp = 22;
          currentCondition = 'Céu Limpo';
          currentIcon = Moon;
      }

      setWeather({ temp: currentTemp, condition: currentCondition, icon: currentIcon });
    };

    // Initial Update
    updateUIState();
    
    // Set interval for every minute
    const interval = setInterval(updateUIState, 60000);

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
        clearInterval(interval);
        if (channelPromise) {
          channelPromise.then(c => c && c.unsubscribe());
        }
      };
    }
    
    return () => clearInterval(interval);
  }, [userId, condoId]);

  const filteredFeatures = FEATURES.filter(feature => {
    if (userRole === 'global_admin') return true;
    return feature.roles.includes(userRole);
  });

  return (
    <div className="p-4 space-y-6">
      {/* Welcome Section */}
      <section className="relative overflow-hidden rounded-[2.5rem] bg-slate-100/50 dark:bg-slate-800/80 p-8 lg:p-12 text-slate-800 dark:text-white shadow-sm border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-300 min-h-[220px] flex flex-col justify-center group">
        {/* Decorative Blurs */}
        <div className="absolute inset-0 opacity-30 pointer-events-none">
          <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-400 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />
        </div>
        
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-5 mix-blend-overlay pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center text-center space-y-6">
          <div className="flex items-center gap-4 bg-emerald-50 dark:bg-emerald-900/20 px-4 py-2 rounded-full border border-emerald-100 dark:border-emerald-800/30">
            <p className="text-emerald-600 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-[0.2em]">{currentDate}</p>
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-200 dark:bg-emerald-700" />
            <div className="flex items-center gap-2">
              <weather.icon size={14} className="text-amber-500" />
              <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">{weather.temp}°C {weather.condition}</span>
            </div>
          </div>

          <h2 className="text-3xl lg:text-4xl font-semibold tracking-tight text-slate-900 dark:text-white max-w-2xl leading-tight">
            {greeting}, {userName}! <br className="hidden md:block" />
            <span className="text-rose-600 dark:text-rose-400 text-base block mt-3 font-semibold brightness-110">Há comunicados ativos em seu Dashboard.</span>
          </h2>
        </div>

        <div className="mt-12 backdrop-blur-sm bg-white/5 p-2 rounded-[2rem] border border-white/10 relative z-10">
        
         <div className="grid grid-cols-2 gap-3">
          <Link to="/feature/boletos" className="bg-emerald-50/30 dark:bg-emerald-900/5 rounded-2xl p-4 border border-emerald-100 dark:border-emerald-800/30 active:scale-95 transition-all hover:bg-emerald-50 dark:hover:bg-emerald-900/10 hover:border-emerald-200">
            <div className="flex items-center gap-2 mb-2 relative">
              <FileText size={16} className="text-emerald-500" />
               {nextBoleto && (
                  <span className="absolute -top-1 -right-1 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                  </span>
               )}
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Financeiro</span>
            </div>
            <p className="text-lg font-bold text-slate-700 dark:text-slate-200">
              {nextBoleto ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(nextBoleto.amount) : 'Painel Financeiro'}
            </p>
            <p className="text-[10px] text-slate-400">
              {nextBoleto ? `Próximo: ${new Date(nextBoleto.due_date).toLocaleDateString('pt-BR')}` : 'Gerenciar boletos e contas'}
            </p>
          </Link>
          <Link to="/feature/comunicados" className="bg-emerald-50/30 dark:bg-emerald-900/5 rounded-2xl p-4 border border-emerald-100 dark:border-emerald-800/30 active:scale-95 transition-all hover:bg-emerald-50 dark:hover:bg-emerald-900/10 hover:border-emerald-200">
            <div className="flex items-center gap-2 mb-2 relative">
              <AlertCircle size={16} className="text-emerald-500" />
               {announcements.length > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                  </span>
                )}
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Avisos</span>
            </div>
            <p className="text-lg font-bold text-slate-700 dark:text-slate-200">{announcements.length} Ativos</p>
            <p className="text-[10px] text-slate-400">Mural atualizado</p>
          </Link>
          <Link to="/feature/reservas" className="bg-emerald-50/30 dark:bg-emerald-900/5 rounded-2xl p-4 border border-emerald-100 dark:border-emerald-800/30 active:scale-95 transition-all hover:bg-emerald-50 dark:hover:bg-emerald-900/10 hover:border-emerald-200">
            <div className="flex items-center gap-2 mb-2 relative">
              <Calendar size={16} className="text-emerald-500" />
              {upcomingReservations.length > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                  </span>
              )}
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Reservas</span>
            </div>
            <p className="text-lg font-bold text-slate-700 dark:text-slate-200">{upcomingReservations.length} Ativas</p>
            <p className="text-[10px] text-slate-400">
              {upcomingReservations.length > 0 
                ? `Próxima: ${new Date(upcomingReservations[0].reservation_date).toLocaleDateString('pt-BR')}` 
                : 'Nenhuma reserva'}
            </p>
          </Link>
          <Link to="/feature/encomendas" className="bg-emerald-50/30 dark:bg-emerald-900/5 rounded-2xl p-4 border border-emerald-100 dark:border-emerald-800/30 active:scale-95 transition-all hover:bg-emerald-50 dark:hover:bg-emerald-900/10 hover:border-emerald-200">
            <div className="flex items-center gap-2 mb-2 relative">
              <Package size={16} className="text-emerald-500" />
              {pendingPackages.length > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                  </span>
               )}
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Encomendas</span>
            </div>
            <p className="text-lg font-bold text-slate-700 dark:text-slate-200">
              {pendingPackages.length} {(userRole === 'admin' || userRole === 'syndic' || userRole === 'global_admin') ? 'Registradas' : 'Pendentes'}
            </p>
            <p className="text-[10px] text-slate-400">
              {(userRole === 'admin' || userRole === 'syndic' || userRole === 'global_admin') 
                ? 'Gerencie entregas' 
                : (pendingPackages.length > 0 ? 'Retire na portaria' : 'Nenhuma pendência')}
            </p>
          </Link>
          <Link to="/feature/visitantes" className="bg-emerald-50/30 dark:bg-emerald-900/5 rounded-2xl p-4 border border-emerald-100 dark:border-emerald-800/30 active:scale-95 transition-all hover:bg-emerald-50 dark:hover:bg-emerald-900/10 hover:border-emerald-200">
            <div className="flex items-center gap-2 mb-2 relative">
              <UserPlus size={16} className="text-emerald-500" />
              {expectedVisitors.length > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                  </span>
               )}
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Visitantes</span>
            </div>
            <p className="text-lg font-bold text-slate-700 dark:text-slate-200">{expectedVisitors.length} Esperados</p>
            <p className="text-[10px] text-slate-400">Liberações ativas</p>
          </Link>
          <Link to="/feature/ocorrencias" className="bg-emerald-50/30 dark:bg-emerald-900/5 rounded-2xl p-4 border border-emerald-100 dark:border-emerald-800/30 active:scale-95 transition-all hover:bg-emerald-50 dark:hover:bg-emerald-900/10 hover:border-emerald-200">
            <div className="flex items-center gap-2 mb-2 relative">
              <ShieldAlert size={16} className="text-emerald-500" />
              {openOcorrencias.length > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                  </span>
              )}
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Ocorrências</span>
            </div>
            <p className="text-lg font-bold text-slate-700 dark:text-slate-200">{openOcorrencias.length} Abertas</p>
            <p className="text-[10px] text-slate-400">Acompanhamento</p>
          </Link>
        </div>
        
        {upcomingAssembleia && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-4 bg-amber-500/20 backdrop-blur-md border border-amber-500/30 rounded-2xl relative z-10"
          >
            <div className="flex items-center gap-3">
              <div className="bg-amber-500 p-2 rounded-xl text-white">
                <Users size={18} />
              </div>
              <div className="flex-1">
                <p className="text-[10px] uppercase font-medium text-amber-200 tracking-wider">Próxima Assembleia</p>
                <h4 className="text-sm font-medium">{upcomingAssembleia.title}</h4>
                <p className="text-xs opacity-80">{new Date(upcomingAssembleia.start_date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', hour: '2-digit', minute: '2-digit' })}</p>
              </div>
              <Link to="/feature/assembleias" className="bg-white text-amber-700 px-3 py-1.5 rounded-lg text-[10px] font-medium">Ver</Link>
            </div>
          </motion.div>
        )}
         </div>
        </section>
        
        {/* Upgrade Call to Action */}
        <UpgradeBanner currentPlan={userPlan} />
        
        {/* Quick Actions Grid */}
        <section>
           <div className="flex items-center justify-between mb-4 px-2">
            <h3 className="font-medium text-slate-800 dark:text-white uppercase text-[10px] font-bold tracking-widest text-slate-400">Acesso Rápido</h3>
            <Link to="/features" className="text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:underline uppercase tracking-widest">Ver todos</Link>
          </div>
          <FeatureGrid features={filteredFeatures} userPlan={userPlan} userRole={userRole} />
        </section>

        {/* Visual Analytics Dashboard (Moved Below) */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12">
          <div className="md:col-span-2 bg-white dark:bg-slate-800 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-700 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="font-bold text-slate-800 dark:text-white text-lg">Fluxo Financeiro</h3>
                <p className="text-xs text-slate-400 font-medium tracking-tight">Receita vs Despesas do mês</p>
              </div>
              <TrendingUp size={20} className="text-emerald-500" />
            </div>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold uppercase tracking-widest px-1">
                  <span className="text-slate-400">Receita Arrecadada</span>
                  <span className="text-emerald-500">R$ 48.450 / 85%</span>
                </div>
                <div className="h-2 w-full bg-slate-100 dark:bg-slate-700/50 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '85%' }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold uppercase tracking-widest px-1">
                  <span className="text-slate-400">Despesas Totais</span>
                  <span className="text-rose-500">R$ 32.780 / 62%</span>
                </div>
                <div className="h-2 w-full bg-slate-100 dark:bg-slate-700/50 rounded-full overflow-hidden">
                  <motion.div 
                   initial={{ width: 0 }}
                   animate={{ width: '62%' }}
                   transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
                   className="h-full bg-gradient-to-r from-rose-400 to-orange-500 rounded-full"
                  />
                </div>
              </div>
              
              <div className="pt-4 grid grid-cols-2 gap-4">
                <div className="p-4 rounded-3xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800">
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Inadimplência</p>
                  <p className="text-lg font-bold text-slate-700 dark:text-slate-200">12%</p>
                  <div className="mt-1 flex items-center gap-1 text-[9px] text-rose-500 font-bold">
                    <span>+2% vs mês anterior</span>
                  </div>
                </div>
                <div className="p-4 rounded-3xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800">
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Saldo Fundo Reserva</p>
                  <p className="text-lg font-bold text-slate-700 dark:text-slate-200">R$ 152k</p>
                  <div className="mt-1 flex items-center gap-1 text-[9px] text-emerald-500 font-bold">
                    <span>+8k este mês</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col items-center justify-between">
            <div className="w-full text-center space-y-1">
              <h3 className="font-bold text-slate-800 dark:text-white text-lg">Ocupação</h3>
              <p className="text-xs text-slate-400 font-medium">Unidades Habitadas</p>
            </div>

            <div className="relative flex items-center justify-center my-4">
              <svg className="w-40 h-40 -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" className="stroke-slate-100 dark:stroke-slate-700/50 stroke-[8]" fill="transparent" />
                <motion.circle 
                  cx="50" cy="50" r="40" 
                  className="stroke-blue-500 stroke-[8]" 
                  fill="transparent"
                  strokeDasharray="251.2"
                  initial={{ strokeDashoffset: 251.2 }}
                  animate={{ strokeDashoffset: 251.2 * (1 - 0.94) }}
                  transition={{ duration: 2, ease: "easeInOut" }}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-slate-800 dark:text-white">94%</span>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Capacidade</span>
              </div>
            </div>

            <div className="w-full space-y-2">
              <div className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-900/40">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Ativas</span>
                </div>
                <span className="text-xs font-bold">148</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-900/40">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-slate-200" />
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Vagas</span>
                </div>
                <span className="text-xs font-bold text-slate-400">12</span>
              </div>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-4 gap-6 pb-12">
          <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-6 border border-slate-100 dark:border-slate-700 shadow-sm">
             <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 rounded-2xl bg-amber-50 text-amber-500 dark:bg-amber-900/20">
                  <Star size={18} />
                </div>
                <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">NPS Condomínio</h4>
             </div>
             <p className="text-2xl font-bold text-slate-800 dark:text-white">4.8</p>
             <div className="mt-2 text-[9px] text-emerald-500 font-bold bg-emerald-50 rounded-lg px-2 py-1 inline-block">Ótimo</div>
          </div>
          
          <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-6 border border-slate-100 dark:border-slate-700 shadow-sm">
             <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 rounded-2xl bg-blue-50 text-blue-500 dark:bg-blue-900/20">
                  <ShieldAlert size={18} />
                </div>
                <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Manutenções</h4>
             </div>
             <p className="text-2xl font-bold text-slate-800 dark:text-white">03</p>
             <div className="mt-2 text-[9px] text-blue-500 font-bold bg-blue-50 rounded-lg px-2 py-1 inline-block">Em dia</div>
          </div>

          <div className="md:col-span-2 bg-gradient-to-br from-slate-800 to-slate-900 rounded-[2.5rem] p-6 text-white relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
             <div className="relative z-10 flex h-full items-center justify-between">
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2">Engajamento Digital</h4>
                  <p className="text-2xl font-bold">88% <span className="text-[10px] font-medium opacity-60 ml-2">App Use</span></p>
                </div>
                <div className="flex items-end gap-1.5 h-12">
                   {[40, 60, 35, 90, 70, 85].map((h, i) => (
                     <motion.div 
                        key={i}
                        initial={{ height: 0 }}
                        animate={{ height: `${h}%` }}
                        transition={{ duration: 1, delay: i * 0.1 }}
                        className="w-1.5 bg-blue-500 rounded-full"
                     />
                   ))}
                </div>
             </div>
          </div>
        </section>

      {/* Marketplace Sneak Peek Removed */}
      {/* Promo Banner Removed */}

    </div>
  );
};
