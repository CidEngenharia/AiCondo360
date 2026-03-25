import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Search, 
  Filter, 
  MapPin, 
  Building2, 
  UserPlus, 
  MoreVertical, 
  Mail, 
  Smartphone, 
  ShieldCheck, 
  ChevronRight, 
  Circle,
  Hash,
  Crown,
  Star,
  ShieldPlus,
  Zap,
  CheckCircle2,
  Lock,
  MessageSquare
} from 'lucide-react';
import { FeatureHeader } from '../components/FeatureHeader';

type Resident = {
  id: string;
  name: string;
  unit: string;
  building: string;
  role: 'proprietario' | 'inquilino' | 'sindico' | 'zelador';
  status: 'online' | 'offline' | 'busy';
  avatar?: string;
  phone: string;
  email: string;
};

const RESIDENTS: Resident[] = [
  { id: '1', name: 'Sidney Rodrigues', unit: '1201', building: 'Torre A', role: 'sindico', status: 'online', phone: '(11) 98888-7777', email: 'sidney@condo360.com' },
  { id: '2', name: 'Ana Oliveira', unit: '402', building: 'Torre B', role: 'proprietario', status: 'offline', phone: '(11) 97777-6666', email: 'ana.oliveira@gmail.com' },
  { id: '3', name: 'Marcos Souza', unit: '805', building: 'Torre A', role: 'inquilino', status: 'busy', phone: '(11) 96666-5555', email: 'marcos.souza@yahoo.com' },
  { id: '4', name: 'Zelador Joaquim', unit: 'Térreo', building: 'Administração', role: 'zelador', status: 'online', phone: '(11) 95555-4444', email: 'joaquim@condo360.com' },
  { id: '5', name: 'Carlos Alberto', unit: '1504', building: 'Torre C', role: 'proprietario', status: 'online', phone: '(11) 94444-3333', email: 'carlos.alberto@gmail.com' },
];

const RoleBadge = ({ role }: { role: Resident['role'] }) => {
  const styles = {
    sindico: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    proprietario: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
    inquilino: 'bg-slate-500/10 text-slate-500 border-slate-500/20',
    zelador: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
  };

  const icons = {
    sindico: <Crown size={10} />,
    proprietario: <Star size={10} />,
    inquilino: <UserPlus size={10} />,
    zelador: <ShieldPlus size={10} />,
  };

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${styles[role]}`}>
      {icons[role]} {role}
    </div>
  );
};

export const Moradores: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedResident, setSelectedResident] = useState<Resident | null>(null);

  const filteredResidents = RESIDENTS.filter(r => 
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.unit.includes(searchTerm)
  );

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <FeatureHeader 
        icon={Users}
        title="Diretório de Moradores"
        description="Conecte-se com vizinhos, acesse contatos de emergência e visualize a estrutura organizacional do condomínio."
        color="bg-indigo-500"
      />

      <div className="flex flex-col lg:flex-row gap-12">
        {/* Left: Search and List */}
        <div className="lg:col-span-8 flex-1">
          <div className="flex gap-4 mb-10">
            <div className="flex-1 relative">
              <input 
                type="text" 
                placeholder="BUSCAR POR NOME OU APTO..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-16 pr-8 py-6 bg-white dark:bg-slate-800 rounded-full border-2 border-slate-100 dark:border-slate-700 font-bold text-sm text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-500 focus:border-indigo-500 transition-all outline-none"
              />
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600" size={24} />
            </div>
            <button className="px-10 bg-white dark:bg-slate-800 rounded-full border-2 border-slate-100 dark:border-slate-700 flex items-center gap-4 hover:border-indigo-500 transition-all">
              <Filter className="text-slate-400" size={20} />
              <span className="text-xs font-black uppercase tracking-widest text-slate-400">Torre</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <AnimatePresence>
              {filteredResidents.map((resident) => (
                <motion.button
                  key={resident.id}
                  layoutId={resident.id}
                  onClick={() => setSelectedResident(resident)}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  whileHover={{ y: -8 }}
                  className="bg-white dark:bg-slate-800 rounded-[40px] shadow-sm hover:shadow-2xl hover:ring-2 hover:ring-indigo-500/20 border border-slate-50 dark:border-slate-700 p-8 flex items-center gap-6 group text-left"
                >
                  <div className="relative">
                    <div className="w-20 h-20 bg-slate-100 dark:bg-slate-900 rounded-[24px] flex items-center justify-center text-indigo-500 overflow-hidden group-hover:rotate-6 transition-transform">
                      {resident.avatar ? (
                        <img src={resident.avatar} className="w-full h-full object-cover" alt={resident.name} />
                      ) : (
                        <Users size={32} />
                      )}
                    </div>
                    <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-4 border-white dark:border-slate-800 transition-colors ${
                      resident.status === 'online' ? 'bg-emerald-500' : resident.status === 'busy' ? 'bg-rose-500' : 'bg-slate-300'
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h5 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tighter truncate leading-none mb-1">{resident.name}</h5>
                    <div className="flex items-center gap-4 mb-3">
                      <span className="text-[10px] font-black uppercase text-indigo-500 tracking-widest flex items-center gap-1">
                        <Building2 size={12} /> {resident.unit} • {resident.building}
                      </span>
                    </div>
                    <RoleBadge role={resident.role} />
                  </div>
                  <ChevronRight size={24} className="text-slate-200 group-hover:text-indigo-500 group-hover:translate-x-2 transition-all" />
                </motion.button>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Right: Selected Resident Detail / Stats */}
        <div className="lg:w-96 space-y-12">
          {selectedResident ? (
            <motion.div 
              layoutId={selectedResident.id}
              className="bg-slate-900 rounded-[56px] shadow-2xl border border-slate-800 p-12 text-white relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-8">
                <button onClick={() => setSelectedResident(null)} className="text-white/20 hover:text-white">
                  <Lock size={24} />
                </button>
              </div>
              
              <div className="flex flex-col items-center mb-12">
                <div className="w-32 h-32 bg-white/5 rounded-[48px] flex items-center justify-center mb-6 ring-8 ring-indigo-500/10 relative">
                  <Users size={56} className="text-indigo-400" />
                  <div className="absolute inset-0 rounded-[48px] border border-white/10 animate-pulse" />
                </div>
                <h4 className="text-2xl font-black uppercase tracking-tighter text-center mb-2 italic">{selectedResident.name}</h4>
                <RoleBadge role={selectedResident.role} />
              </div>

              <div className="space-y-6">
                <div className="p-6 bg-white/5 rounded-[28px] border border-white/5">
                  <p className="text-[10px] uppercase font-black text-white/30 tracking-widest mb-4">Informações de Contato</p>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-400">
                        <Smartphone size={18} />
                      </div>
                      <span className="text-xs font-bold text-white/80">{selectedResident.phone}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-400">
                        <Mail size={18} />
                      </div>
                      <span className="text-xs font-bold text-white/80">{selectedResident.email}</span>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-black/50 rounded-[28px] border border-white/5">
                   <p className="text-[10px] uppercase font-black text-white/30 tracking-widest mb-4">Localização</p>
                   <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-400">
                      <Building2 size={18} />
                    </div>
                    <span className="text-xs font-bold text-white/80">{selectedResident.building} • Unidade {selectedResident.unit}</span>
                   </div>
                </div>

                <button className="w-full py-6 bg-white text-slate-900 rounded-full font-black uppercase tracking-widest text-[10px] hover:bg-slate-100 transition-all flex items-center justify-center gap-3">
                  <MessageSquare size={16} /> Enviar Mensagem Privada
                </button>
              </div>
            </motion.div>
          ) : (
            <div className="space-y-12">
               {/* Stats / Board */}
               <div className="bg-indigo-600 rounded-[56px] p-12 text-white shadow-2xl relative overflow-hidden group">
                  <Zap size={120} className="absolute -bottom-10 -right-10 opacity-10 group-hover:rotate-12 transition-transform" />
                  <h4 className="text-2xl font-black uppercase tracking-tighter italic mb-8">Administração</h4>
                  <div className="space-y-8">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-indigo-200 uppercase tracking-widest">Total de Unidades</span>
                      <span className="text-2xl font-black">120</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-indigo-200 uppercase tracking-widest">Moradores Ativos</span>
                      <span className="text-2xl font-black">342</span>
                    </div>
                    <div className="w-full h-2 bg-indigo-800 rounded-full overflow-hidden">
                      <div className="w-3/4 h-full bg-white shadow-[0_0_15px_rgba(255,255,255,0.5)]" />
                    </div>
                  </div>
               </div>

               {/* Help Board */}
               <div className="bg-white dark:bg-slate-800 rounded-[56px] p-12 border border-slate-100 dark:border-slate-700 shadow-xl">
                 <h4 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-8 italic">Organograma</h4>
                 <div className="space-y-6">
                    <div className="flex items-center gap-4 p-4 rounded-3xl hover:bg-slate-50 dark:hover:bg-slate-900 transition-all">
                      <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500"><Crown size={24} /></div>
                      <div>
                        <h6 className="text-xs font-black uppercase tracking-widest text-slate-800 dark:text-white">Conselho Fiscal</h6>
                        <p className="text-[10px] font-bold text-slate-400">3 MEMBROS ATIVOS</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 p-4 rounded-3xl hover:bg-slate-50 dark:hover:bg-slate-900 transition-all">
                      <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-500"><ShieldCheck size={24} /></div>
                      <div>
                        <h6 className="text-xs font-black uppercase tracking-widest text-slate-800 dark:text-white">Comitê Segurança</h6>
                        <p className="text-[10px] font-bold text-slate-400">EM OPERAÇÃO 24/7</p>
                      </div>
                    </div>
                 </div>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
