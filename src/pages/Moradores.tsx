import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Search, 
  Building2, 
  UserPlus, 
  Mail, 
  Smartphone, 
  ShieldCheck, 
  ChevronRight, 
  Crown,
  Zap,
  MessageSquare,
  X,
  Pencil,
  Trash2,
  FileText
} from 'lucide-react';
import { FeatureHeader } from '../components/FeatureHeader';
import { useAuth } from '../contexts/AuthContext';
import { ProfileService, Profile } from '../services/supabaseService';
import { useEffect } from 'react';

type Resident = {
  id: string;
  name: string;
  unit: string;
  building: string;
  role: 'proprietario' | 'inquilino' | 'sindico' | 'zelador';
  status: 'online' | 'offline' | 'busy';
  phone: string;
  email: string;
};

// RESIDENTS constant removed since we fetch from DB

const RoleBadge = ({ role }: { role: Resident['role'] }) => {
  const styles = {
    sindico: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    proprietario: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    inquilino: 'bg-slate-50 text-slate-600 border-slate-100',
    zelador: 'bg-orange-50 text-orange-600 border-orange-100',
  };

  const labels = {
    sindico: 'Síndico',
    proprietario: 'Proprietário',
    inquilino: 'Inquilino',
    zelador: 'Equipe',
  };

  return (
    <div className={`inline-flex items-center px-2 py-0.5 rounded text-[9px] font-medium border ${styles[role]}`}>
      {labels[role]}
    </div>
  );
};

export const Moradores: React.FC = () => {
  const { user } = useAuth();
  const [residentsList, setResidentsList] = useState<Resident[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedResident, setSelectedResident] = useState<Resident | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingResident, setEditingResident] = useState<Resident | null>(null);

  const filteredResidents = residentsList.filter(r => 
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.unit.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const fetchResidents = async () => {
    if (!user?.condoId) return;
    try {
      setLoading(true);
      const profiles = await ProfileService.getCondoResidents(user.condoId);
      
      const mapped: Resident[] = profiles.map(p => ({
        id: p.id,
        name: p.full_name || 'Sem Nome',
        unit: p.unit || 'S/N',
        building: p.building || 'Geral',
        role: (p.role === 'resident' || p.role === 'morador') ? 'inquilino' : 
              (p.role === 'syndic' || p.role === 'sindico') ? 'sindico' : 'proprietario',
        status: 'online',
        phone: p.phone || '(00) 00000-0000',
        email: p.email || ''
      }));
      
      setResidentsList(mapped);
    } catch (err) {
      console.error('Error loading residents:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResidents();
  }, [user?.condoId]);

  const totalUnits = Array.from(new Set(residentsList.map(r => `${r.building}-${r.unit}`))).length;
  const totalResidents = residentsList.length;

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Tem certeza que deseja remover o morador ${name}?`)) {
      try {
        await ProfileService.deleteProfile(id);
        setResidentsList(prev => prev.filter(r => r.id !== id));
        setSelectedResident(null);
      } catch (err) {
        console.error('Error deleting resident:', err);
        alert('Erro ao remover morador do banco de dados.');
      }
    }
  };

  const handleOpenEdit = (resident: Resident) => {
    setEditingResident(resident);
    setShowAddModal(true);
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const condoId = user?.condoId || '';
    if (!condoId || condoId.trim() === '' || condoId === 'undefined') {
      alert("⚠️ Erro crítico: O seu Condomínio não está selecionado ou carregado. Se você for Admin Global, selecione um condomínio no topo da página. Se for Síndico, seu perfil pode estar corrompido.");
      return;
    }

    const formData = new FormData(e.currentTarget);
    
    const residentData: Partial<Profile> = {
      full_name: formData.get('name') as string,
      building: formData.get('building') as string,
      unit: formData.get('unit') as string,
      role: formData.get('role') as any,
      phone: formData.get('phone') as string,
      email: formData.get('email') as string,
      condominio_id: condoId
    };

    try {
      setLoading(true);
      if (editingResident) {
        await ProfileService.updateProfile(editingResident.id, residentData);
      } else {
        // Generate a random UUID for the profile (will be linked to auth later via Supabase Dashboard)
        residentData.id = crypto.randomUUID();
        
        console.log("[Moradores] Salvando perfil com condomínio ID:", residentData.condominio_id);
        await ProfileService.createProfile(residentData);

        // Inform admin about next steps for user login setup
        const tempPassword = `Condo${residentData.unit}@360`;
        alert(
          `✅ Morador cadastrado com sucesso!\n\n` +
          `Para permitir o acesso ao aplicativo, acesse o Painel do Supabase:\n` +
          `Authentication > Users > Invite user\n\n` +
          `Email: ${residentData.email}\n` +
          `Sugestão de senha provisória: ${tempPassword}\n\n` +
          `(O ID do perfil foi criado. Vincule ao usuário Auth pelo mesmo ID após o invite.)`
        );
      }
      
      await fetchResidents();
      setShowAddModal(false);
      setEditingResident(null);
    } catch (err: any) {
      console.error('Error saving resident:', err);
      let errorMsg = err.message || 'Erro desconhecido';
      if (err.code === '23503') {
         errorMsg = `O condomínio ID (${user?.condoId}) não foi encontrado no banco de dados. Se você for Admin Global, selecione um condomínio no topo.`;
      }
      alert(`⚠️ Erro ao salvar morador: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <FeatureHeader 
        icon={Users}
        title="Moradores"
        description="Diretório de residentes e contatos do condomínio."
        color="bg-slate-500"
      />

      <div className="flex flex-col lg:flex-row gap-8 mt-8">
        <div className="flex-1">
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="flex-1 relative">
              <input 
                type="text" 
                placeholder="Buscar morador ou apt/casa..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-normal focus:border-indigo-500 outline-none transition-all"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => {
                  alert("Gerando relatório detalhado de moradores por unidade...");
                  // Aqui entraria a lógica de exportação PDF/Excel
                }}
                className="px-4 py-3 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center gap-2 hover:bg-slate-50 transition-all shadow-sm"
                title="Gerar Relatório"
              >
                <FileText size={18} />
                <span className="text-sm font-normal hidden md:inline">Relatório</span>
              </button>
              <button 
                onClick={() => setShowAddModal(true)}
                className="px-4 py-3 bg-indigo-600 text-white rounded-xl flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-sm shrink-0"
              >
                <UserPlus size={18} />
                <span className="text-sm font-normal hidden sm:inline">Novo Morador</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {loading ? (
              <div className="col-span-full py-10 flex flex-col items-center justify-center gap-3">
                <div className="w-8 h-8 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
                <p className="text-xs text-slate-400 font-medium uppercase tracking-widest">Carregando moradores...</p>
              </div>
            ) : (
              <AnimatePresence>
                {filteredResidents.map((resident) => (
                  <motion.button
                    key={resident.id}
                    layoutId={resident.id}
                    onClick={() => setSelectedResident(resident)}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 p-4 flex items-center gap-3 group text-left hover:border-indigo-300 transition-all shadow-sm"
                  >
                    <div className="flex-1 min-w-0">
                      <h5 className="text-sm font-normal text-slate-900 dark:text-white truncate">{resident.name}</h5>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] text-slate-500 flex items-center gap-1 font-normal">
                          <Building2 size={10} /> {resident.unit} • {resident.building}
                        </span>
                        <RoleBadge role={resident.role} />
                      </div>
                    </div>
                    <ChevronRight size={14} className="text-slate-300 group-hover:text-indigo-500 transition-all" />
                  </motion.button>
                ))}
              </AnimatePresence>
            )}
            {!loading && filteredResidents.length === 0 && (
              <div className="col-span-full py-16 text-center">
                <Users size={40} className="text-slate-200 mx-auto mb-4" />
                <p className="text-slate-400 text-sm font-normal">Nenhum morador encontrado.</p>
              </div>
            )}
          </div>
        </div>

        <div className="lg:w-80">
          {selectedResident ? (
            <motion.div 
              layoutId={selectedResident.id}
              className="bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 text-slate-900 dark:text-white relative hover:border-indigo-400 transition-colors shadow-sm"
            >
              <div className="absolute top-4 right-4 flex items-center gap-2">
                <button 
                  onClick={() => handleOpenEdit(selectedResident)}
                  className="p-2 text-slate-400 hover:text-indigo-500 transition-colors bg-white dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700 shadow-sm"
                  title="Editar"
                >
                  <Pencil size={14} />
                </button>
                <button 
                  onClick={() => handleDelete(selectedResident.id, selectedResident.name)}
                  className="p-2 text-slate-400 hover:text-rose-500 transition-colors bg-white dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700 shadow-sm"
                  title="Excluir"
                >
                  <Trash2 size={14} />
                </button>
                <button 
                  onClick={() => setSelectedResident(null)}
                  className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
              
              <div className="mb-6">
                <h4 className="text-base font-normal mb-1">{selectedResident.name}</h4>
                <RoleBadge role={selectedResident.role} />
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                  <p className="text-[9px] uppercase font-bold text-slate-400 tracking-wider mb-2">Contato</p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Smartphone size={14} className="text-slate-400" />
                      <span className="text-xs text-slate-600 dark:text-slate-300 font-normal">{selectedResident.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail size={14} className="text-slate-400" />
                      <span className="text-xs text-slate-600 dark:text-slate-300 truncate font-normal">{selectedResident.email}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                   <p className="text-[9px] uppercase font-bold text-slate-400 tracking-wider mb-2">Unidade</p>
                   <div className="flex items-center gap-2">
                    <Building2 size={14} className="text-slate-400" />
                    <span className="text-xs text-slate-600 dark:text-slate-300 font-normal">{selectedResident.building} • {selectedResident.unit}</span>
                   </div>
                </div>

                <a 
                  href={`https://wa.me/${selectedResident.phone.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium text-xs transition-all flex items-center justify-center gap-2 shadow-sm shadow-emerald-500/20"
                >
                  <MessageSquare size={16} /> WhatsApp
                </a>
              </div>
            </motion.div>
          ) : (
            <div className="space-y-4">
               <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm transition-all group hover:border-indigo-200">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Administração</h4>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500 font-normal tracking-tight">Unidades</span>
                      <span className="font-medium text-emerald-600">{totalUnits}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500 font-normal tracking-tight">Moradores</span>
                      <span className="font-medium text-emerald-600">{totalResidents}</span>
                    </div>
                  </div>
               </div>

               <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm transition-all hover:border-indigo-300">
                 <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Estrutura</h4>
                 <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-emerald-50 dark:bg-emerald-500/10 rounded-lg flex items-center justify-center text-emerald-500"><Crown size={16} /></div>
                      <div>
                        <p className="text-xs font-normal text-slate-800 dark:text-white">Síndico do Bloco</p>
                        <p className="text-[9px] text-slate-400 uppercase font-medium">Gestão Principal</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-indigo-50 dark:bg-indigo-500/10 rounded-lg flex items-center justify-center text-indigo-500"><ShieldCheck size={16} /></div>
                      <div>
                        <p className="text-xs font-normal text-slate-800 dark:text-white">Segurança 24h</p>
                        <p className="text-[9px] text-slate-400 uppercase font-medium">Operacional</p>
                      </div>
                    </div>
                 </div>
               </div>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
              className="absolute inset-0 bg-slate-900/20 backdrop-blur-[2px]" 
              onClick={() => setShowAddModal(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} 
              className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-6 w-full max-w-sm relative z-10 border border-slate-100 dark:border-slate-800"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-base font-normal text-slate-900 dark:text-white">
                  {editingResident ? 'Editar Morador' : 'Adicionar Morador'}
                </h3>
                <button 
                  onClick={() => { setShowAddModal(false); setEditingResident(null); }} 
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X size={18} />
                </button>
              </div>
              <form className="space-y-4" onSubmit={handleSave}>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-slate-400 tracking-tight">Nome Completo</label>
                  <input 
                    name="name"
                    defaultValue={editingResident?.name}
                    required 
                    className="w-full bg-slate-50 dark:bg-slate-800 rounded-xl px-4 py-2.5 text-xs font-normal border border-transparent focus:border-indigo-400 outline-none transition-all dark:text-white" 
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-slate-400 tracking-tight">Torre/Casa</label>
                    <input 
                      name="building"
                      defaultValue={editingResident?.building}
                      placeholder="Ex: Torre A ou Casa 01"
                      required 
                      className="w-full bg-slate-50 dark:bg-slate-800 rounded-xl px-4 py-2.5 text-xs font-normal border border-transparent focus:border-indigo-400 outline-none transition-all dark:text-white" 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-slate-400 tracking-tight">Apt/Casa</label>
                    <input 
                      name="unit"
                      defaultValue={editingResident?.unit}
                      placeholder="Ex: 101"
                      required 
                      className="w-full bg-slate-50 dark:bg-slate-800 rounded-xl px-4 py-2.5 text-xs font-normal border border-transparent focus:border-indigo-400 outline-none transition-all dark:text-white" 
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-slate-400 tracking-tight">Telefone/Zap</label>
                    <input 
                      name="phone"
                      defaultValue={editingResident?.phone}
                      placeholder="(00) 00000-0000"
                      required 
                      className="w-full bg-slate-50 dark:bg-slate-800 rounded-xl px-4 py-2.5 text-xs font-normal border border-transparent focus:border-indigo-400 outline-none transition-all dark:text-white" 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-slate-400 tracking-tight">E-mail</label>
                    <input 
                      name="email"
                      type="email"
                      defaultValue={editingResident?.email}
                      placeholder="email@exemplo.com"
                      required 
                      className="w-full bg-slate-50 dark:bg-slate-800 rounded-xl px-4 py-2.5 text-xs font-normal border border-transparent focus:border-indigo-400 outline-none transition-all dark:text-white" 
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-slate-400 tracking-tight">Perfil</label>
                  <select 
                    name="role"
                    defaultValue={editingResident?.role || 'proprietario'}
                    className="w-full bg-slate-50 dark:bg-slate-800 rounded-xl px-4 py-2.5 text-xs font-normal border border-transparent focus:border-indigo-400 outline-none transition-all dark:text-white cursor-pointer appearance-none"
                  >
                    <option value="proprietario">Proprietário (Residente)</option>
                    <option value="inquilino">Inquilino (Residente)</option>
                    <option value="sindico">Síndico</option>
                  </select>
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <button 
                    type="button" 
                    onClick={() => { setShowAddModal(false); setEditingResident(null); }} 
                    className="px-4 py-2 text-xs font-normal text-slate-500"
                  >
                    Cancelar
                  </button>
                  <button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded-xl text-xs font-medium hover:bg-indigo-700 transition-all shadow-sm">
                    {editingResident ? 'Atualizar' : 'Salvar'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
