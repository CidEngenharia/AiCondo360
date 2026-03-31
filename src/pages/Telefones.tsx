import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Phone, ShieldAlert, HeartPulse, Building2, Wrench, Siren,
  FileText, UserCircle, Droplets, Flame, Plus, X, Edit2, Trash2,
  MessageCircle, CheckCircle2
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

type ContactCategory = 'emergencia' | 'portaria' | 'manutencao' | 'administracao' | 'servicos' | 'profissional';

interface Contact {
  id: string;
  name: string;
  phone: string;
  whatsapp?: string;
  isWhatsappActive?: boolean;
  category: ContactCategory;
  description: string;
  isCustom?: boolean;
}

const INITIAL_CONTACTS: Contact[] = [
  { id: '1', name: 'Polícia Militar',       phone: '190',             category: 'emergencia',    description: 'Emergências policiais' },
  { id: '2', name: 'SAMU',                  phone: '192',             category: 'emergencia',    description: 'Emergências médicas' },
  { id: '3', name: 'Corpo de Bombeiros',    phone: '193',             category: 'emergencia',    description: 'Incêndios e resgates' },
  { id: '4', name: 'Defesa Civil',          phone: '199',             category: 'emergencia',    description: 'Desastres naturais' },
  { id: '5', name: 'Portaria Principal',    phone: '(11) 9999-0001',  category: 'portaria',      description: 'Atendimento 24h' },
  { id: '6', name: 'Portaria Serviços',     phone: '(11) 9999-0002',  category: 'portaria',      description: 'Carga e descarga' },
  { id: '7', name: 'Síndico',              phone: '(11) 9999-0003',  category: 'administracao', description: 'João Silva' },
  { id: '8', name: 'Administradora',        phone: '(11) 3333-4444',  category: 'administracao', description: 'CondoBens Adm' },
  { id: '9', name: 'Eletricista (Plantão)', phone: '(11) 98888-1111', category: 'manutencao',    description: 'Carlos Elétrica' },
  { id: '10', name: 'Encanador',            phone: '(11) 98888-2222', category: 'manutencao',    description: 'Hidro Express' },
  { id: '11', name: 'Gás (Comgás)',         phone: '0800 11 01 97',   category: 'servicos',      description: 'Vazamentos' },
  { id: '12', name: 'Enel (Energia)',       phone: '0800 72 72 120',  category: 'servicos',      description: 'Falta de luz' },
];

const CATEGORIES: { id: ContactCategory | 'todos'; label: string }[] = [
  { id: 'todos',        label: 'Todos' },
  { id: 'emergencia',   label: 'Emergência' },
  { id: 'portaria',     label: 'Portaria' },
  { id: 'administracao',label: 'Admin' },
  { id: 'manutencao',   label: 'Manutenção' },
  { id: 'servicos',     label: 'Serviços' },
  { id: 'profissional', label: 'Profissional' },
];

const CATEGORY_COLORS: Record<ContactCategory, string> = {
  emergencia:    'bg-red-500',
  portaria:      'bg-slate-600',
  administracao: 'bg-indigo-500',
  manutencao:    'bg-emerald-500',
  servicos:      'bg-rose-500',
  profissional:  'bg-blue-500',
};

const EMPTY_FORM = { 
  name: '', 
  phone: '', 
  whatsapp: '', 
  isWhatsappActive: false, 
  category: 'administracao' as ContactCategory, 
  description: '' 
};

export const Telefones: React.FC = () => {
  const { user } = useAuth();
  const canManage = user?.role === 'admin' || user?.role === 'sindico' || user?.role === 'global_admin';

  const [contacts, setContacts] = useState<Contact[]>(INITIAL_CONTACTS);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<ContactCategory | 'todos'>('todos');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saved, setSaved] = useState(false);

  const filtered = contacts.filter(c => {
    const matchCat  = activeCategory === 'todos' || c.category === activeCategory;
    const matchText = c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      c.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      c.phone.includes(searchTerm);
    return matchCat && matchText;
  });

  const openNew = () => {
    setEditingContact(null);
    setForm(EMPTY_FORM);
    setIsModalOpen(true);
  };

  const openEdit = (c: Contact) => {
    setEditingContact(c);
    setForm({ 
      name: c.name, 
      phone: c.phone, 
      whatsapp: c.whatsapp || '', 
      isWhatsappActive: !!c.isWhatsappActive,
      category: c.category, 
      description: c.description 
    });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingContact) {
      setContacts(prev => prev.map(c => c.id === editingContact.id ? { ...c, ...form, isCustom: true } : c));
    } else {
      setContacts(prev => [{ id: crypto.randomUUID(), ...form, isCustom: true }, ...prev]);
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Excluir este contato?')) {
      setContacts(prev => prev.filter(c => c.id !== id));
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 w-full max-w-7xl mx-auto space-y-8">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 text-blue-600 rounded-full text-xs font-bold uppercase tracking-wider mb-3">
            <Phone size={13} /> Central de Contatos
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Telefones Úteis
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Diretório de contatos importantes do condomínio
          </p>
        </div>

        {canManage && (
          <button
            onClick={openNew}
            className="flex items-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-sm transition-all shadow-lg shadow-blue-500/25 active:scale-95"
          >
            <Plus size={18} />
            Novo Contato
          </button>
        )}
      </div>

      {/* Feedback de salvo */}
      <AnimatePresence>
        {saved && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2 px-4 py-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-2xl text-sm font-bold"
          >
            <CheckCircle2 size={16} /> Contato salvo com sucesso!
          </motion.div>
        )}
      </AnimatePresence>

      {/* Busca + Filtros */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            className="w-full pl-11 pr-4 py-3 border border-slate-200 dark:border-slate-700 rounded-2xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-sm"
            placeholder="Buscar por nome, número ou descrição..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex overflow-x-auto gap-2 pb-1">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2.5 rounded-2xl font-semibold text-sm transition-all whitespace-nowrap shadow-sm ${
                activeCategory === cat.id
                  ? 'bg-blue-600 text-white shadow-blue-500/25'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 border border-slate-200 dark:border-slate-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grade de contatos */}
      {filtered.length > 0 ? (
        <motion.div layout className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence>
            {filtered.map(contact => (
              <motion.div
                key={contact.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm flex items-start gap-4 hover:shadow-md transition-shadow group"
              >
                <div className={`mt-1 w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-inner ${CATEGORY_COLORS[contact.category]}`}>
                  <Phone className="text-white" size={22} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-slate-900 dark:text-white truncate">{contact.name}</h3>
                    {contact.isCustom && (
                      <span className="shrink-0 text-[9px] font-black uppercase px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 rounded-full">
                        Custom
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5 truncate">{contact.description}</p>

                  <div className="mt-3 flex items-center justify-between gap-2 flex-wrap">
                    <span className="text-base font-bold text-blue-600 dark:text-blue-400 font-mono tracking-tight">
                      {contact.phone}
                    </span>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <a
                        href={`tel:${contact.phone.replace(/[^0-9+]/g, '')}`}
                        className="p-2 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 hover:bg-blue-100 transition-colors"
                        title="Ligar"
                      >
                        <Phone size={15} />
                      </a>
                      {(contact.whatsapp || contact.isWhatsappActive) && (
                        <a
                          href={`https://wa.me/55${(contact.whatsapp || contact.phone).replace(/[^0-9]/g, '')}`}
                          target="_blank" rel="noreferrer"
                          className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 hover:bg-emerald-100 dark:hover:bg-emerald-800/40 transition-colors flex items-center gap-1.5"
                          title="WhatsApp"
                        >
                          <MessageCircle size={15} />
                          {contact.isWhatsappActive && <span className="text-[10px] font-bold">Ativo</span>}
                        </a>
                      )}
                      {canManage && (
                        <>
                          <button
                            onClick={() => openEdit(contact)}
                            className="p-2 rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-500 hover:bg-slate-100 transition-colors"
                          >
                            <Edit2 size={15} />
                          </button>
                          <button
                            onClick={() => handleDelete(contact.id)}
                            className="p-2 rounded-xl bg-rose-50 dark:bg-rose-900/20 text-rose-500 hover:bg-rose-100 transition-colors"
                          >
                            <Trash2 size={15} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700">
          <Phone size={40} className="text-slate-300 mb-4" />
          <h3 className="text-lg font-bold text-slate-700 dark:text-white">Nenhum contato encontrado</h3>
          <button onClick={() => { setSearchTerm(''); setActiveCategory('todos'); }} className="mt-4 text-sm text-blue-600 hover:underline">
            Limpar filtros
          </button>
        </div>
      )}

      {/* Nota de permissão para moradores */}
      {!canManage && (
        <p className="text-center text-xs text-slate-400 dark:text-slate-600">
          Somente administradores e síndico podem adicionar ou editar contatos.
        </p>
      )}

      {/* ─── Modal de cadastro/edição ─────────────────────────────── */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-950/40 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-black text-slate-900 dark:text-white">
                    {editingContact ? 'Editar Contato' : 'Novo Contato'}
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">Visível para todos os moradores</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSave} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Nome *</label>
                  <input
                    required value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    placeholder="Ex: Zelador Geral"
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-sm font-medium dark:text-white focus:ring-2 focus:ring-blue-500/20 border-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Função / Descrição *</label>
                  <input
                    required value={form.description}
                    onChange={e => setForm({ ...form, description: e.target.value })}
                    placeholder="Ex: Responsável pela manutenção"
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-sm font-medium dark:text-white focus:ring-2 focus:ring-blue-500/20 border-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Telefone *</label>
                    <input
                      required value={form.phone}
                      onChange={e => setForm({ ...form, phone: e.target.value })}
                      placeholder="(11) 99999-0000"
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-sm font-medium dark:text-white focus:ring-2 focus:ring-blue-500/20 border-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">WhatsApp</label>
                    <input
                      value={form.whatsapp}
                      onChange={e => setForm({ ...form, whatsapp: e.target.value })}
                      placeholder="(11) 99999-0000"
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-sm font-medium dark:text-white focus:ring-2 focus:ring-emerald-500/20 border-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Categoria</label>
                  <select
                    value={form.category}
                    onChange={e => setForm({ ...form, category: e.target.value as ContactCategory })}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-sm font-medium dark:text-white focus:ring-2 focus:ring-blue-500/20 border-none appearance-none"
                  >
                    <option value="emergencia">Emergência</option>
                    <option value="portaria">Portaria</option>
                    <option value="administracao">Administração</option>
                    <option value="manutencao">Manutenção</option>
                    <option value="servicos">Serviços</option>
                    <option value="profissional">Profissional cadastrado</option>
                  </select>
                </div>

                <div className="flex items-center gap-3 p-4 bg-emerald-50 dark:bg-emerald-900/10 rounded-2xl border border-emerald-100 dark:border-emerald-900/30 cursor-pointer" 
                     onClick={() => setForm({ ...form, isWhatsappActive: !form.isWhatsappActive })}>
                  <div className={`w-10 h-6 rounded-full relative transition-all ${form.isWhatsappActive ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700'}`}>
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${form.isWhatsappActive ? 'right-1' : 'left-1'}`} />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-widest leading-none mb-1">WhatsApp Ativo?</p>
                    <p className="text-[10px] text-emerald-600/70 dark:text-emerald-500/70 font-medium">Habilita o botão de conversa instantânea</p>
                  </div>
                  <MessageCircle size={20} className={form.isWhatsappActive ? 'text-emerald-500' : 'text-slate-300'} />
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-xl font-bold hover:bg-slate-200 transition-all">
                    Cancelar
                  </button>
                  <button type="submit" className="flex-[2] py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/25 active:scale-95">
                    {editingContact ? 'Salvar Alterações' : 'Adicionar Contato'}
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
