import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { FeatureGrid } from '../components/FeatureGrid';
import { TrendingUp, Users, AlertCircle, Cloud, Sun, CloudRain, CloudLightning, Moon, ArrowRight, Star, Calendar } from 'lucide-react';
import { FEATURES, UserRole, PricingPlan } from '../constants';
import { UpgradeBanner } from '../components/UpgradeBanner';
import { BoletoService, AnnouncementService, Boleto, Comunicado } from '../services/supabaseService';

interface DashboardProps {
  userId: string;
  userName: string;
  userRole: UserRole;
  userPlan: PricingPlan;
  condoId: string;
}

export const Dashboard: React.FC<DashboardProps> = ({ userId, userName, userRole, userPlan, condoId }) => {
  const [greeting, setGreeting] = useState('');
  const [currentDate, setCurrentDate] = useState('');
  const [weather, setWeather] = useState({ temp: 24, condition: 'Ensolarado', icon: Sun });
  const [nextBoleto, setNextBoleto] = useState<Boleto | null>(null);
  const [announcements, setAnnouncements] = useState<Comunicado[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
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

    // Mock weather logic
    const mockWeathers = [
      { temp: 28, condition: 'Ensolarado', icon: Sun },
      { temp: 22, condition: 'Nublado', icon: Cloud },
      { temp: 19, condition: 'Chuvoso', icon: CloudRain },
    ];
    setWeather(mockWeathers[Math.floor(Math.random() * mockWeathers.length)]);

    // Fetch Real Data
    const fetchData = async () => {
      try {
        const [boleto, comms] = await Promise.all([
          BoletoService.getNextPendingBoleto(userId),
          AnnouncementService.getRecentAnnouncements(condoId)
        ]);
        setNextBoleto(boleto);
        setAnnouncements(comms);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoadingData(false);
      }
    };

    if (userId && condoId) {
      fetchData();
    } else {
      setLoadingData(false);
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
        
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp size={16} className="text-blue-200" />
              <span className="text-xs font-medium uppercase tracking-wider opacity-80">Próxima Fatura</span>
            </div>
            <p className="text-lg font-bold">
              {nextBoleto ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(nextBoleto.amount) : 'R$ 0,00'}
            </p>
            <p className="text-[10px] opacity-70">
              {nextBoleto ? `Vencimento: ${new Date(nextBoleto.due_date).toLocaleDateString('pt-BR')}` : 'Sem faturas pendentes'}
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle size={16} className="text-amber-300" />
              <span className="text-xs font-medium uppercase tracking-wider opacity-80">Avisos</span>
            </div>
            <p className="text-lg font-bold">{announcements.length} Ativos</p>
            <p className="text-[10px] opacity-70">Mural atualizado</p>
          </div>
        </div>
      </section>

      {/* Upgrade Call to Action */}
      <UpgradeBanner currentPlan={userPlan} />

      {/* Quick Actions Grid */}
      <section>
        <div className="flex items-center justify-between mb-4 px-2">
          <h3 className="font-bold text-slate-800 dark:text-white">Acesso Rápido</h3>
          <button className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline">Ver todos</button>
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
