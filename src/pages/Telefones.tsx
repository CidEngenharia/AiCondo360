import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Phone, ShieldAlert, HeartPulse, Building2, Wrench, Siren, FileText, UserCircle, Droplets, Flame } from 'lucide-react';
import { cn } from '../lib/utils';

type ContactCategory = 'emergencia' | 'portaria' | 'manutencao' | 'administracao' | 'servicos';

interface Contact {
  id: string;
  name: string;
  phone: string;
  category: ContactCategory;
  description: string;
  icon: any;
  color: string;
}

const CONTACTS_DB: Contact[] = [
  { id: '1', name: 'Polícia Militar', phone: '190', category: 'emergencia', description: 'Emergências policiais', icon: Siren, color: 'bg-blue-500' },
  { id: '2', name: 'Samu', phone: '192', category: 'emergencia', description: 'Emergências médicas', icon: HeartPulse, color: 'bg-red-500' },
  { id: '3', name: 'Corpo de Bombeiros', phone: '193', category: 'emergencia', description: 'Incêndios e resgates', icon: Flame, color: 'bg-orange-500' },
  { id: '4', name: 'Defesa Civil', phone: '199', category: 'emergencia', description: 'Desastres naturais', icon: ShieldAlert, color: 'bg-yellow-500' },
  { id: '5', name: 'Portaria Principal', phone: '(11) 9999-0001', category: 'portaria', description: 'Atendimento 24h', icon: Building2, color: 'bg-slate-600' },
  { id: '6', name: 'Portaria Serviços', phone: '(11) 9999-0002', category: 'portaria', description: 'Carga e descarga', icon: Building2, color: 'bg-slate-500' },
  { id: '7', name: 'Síndico', phone: '(11) 9999-0003', category: 'administracao', description: 'João Silva', icon: UserCircle, color: 'bg-indigo-500' },
  { id: '8', name: 'Administradora', phone: '(11) 3333-4444', category: 'administracao', description: 'CondoBens Adm', icon: FileText, color: 'bg-indigo-400' },
  { id: '9', name: 'Eletricista (Plantão)', phone: '(11) 98888-1111', category: 'manutencao', description: 'Carlos Elétrica', icon: Wrench, color: 'bg-emerald-500' },
  { id: '10', name: 'Encanador', phone: '(11) 98888-2222', category: 'manutencao', description: 'Hidro Express', icon: Droplets, color: 'bg-cyan-500' },
  { id: '11', name: 'Elevadores', phone: '(11) 3333-5555', category: 'manutencao', description: 'Atlas Manutenção', icon: Wrench, color: 'bg-emerald-600' },
  { id: '12', name: 'Gás (Comgás)', phone: '0800 11 01 97', category: 'servicos', description: 'Vazamentos', icon: Flame, color: 'bg-rose-500' },
  { id: '13', name: 'Enel (Energia)', phone: '0800 72 72 120', category: 'servicos', description: 'Falta de luz', icon: Wrench, color: 'bg-rose-400' },
];

const CATEGORIES: { id: ContactCategory | 'todos'; label: string; icon: any }[] = [
  { id: 'todos', label: 'Todos', icon: Phone },
  { id: 'emergencia', label: 'Emergência', icon: Siren },
  { id: 'portaria', label: 'Portaria', icon: Building2 },
  { id: 'administracao', label: 'Admin', icon: UserCircle },
  { id: 'manutencao', label: 'Manutenção', icon: Wrench },
  { id: 'servicos', label: 'Serviços', icon: ShieldAlert },
];

export const Telefones: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<ContactCategory | 'todos'>('todos');

  const filteredContacts = CONTACTS_DB.filter(contact => {
    const matchesCategory = activeCategory === 'todos' || contact.category === activeCategory;
    const matchesSearch = 
      contact.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      contact.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.phone.includes(searchTerm);
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 pt-6 sm:pt-8 w-full max-w-7xl mx-auto space-y-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Telefones Úteis</h1>
          <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-1">Diretório de contatos importantes do condomínio</p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search Bar */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-3 border border-slate-200 dark:border-slate-700 rounded-2xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow shadow-sm"
            placeholder="Buscar por nome, número ou descrição..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Categories */}
        <div className="flex overflow-x-auto gap-2 pb-2 lg:pb-0 custom-scrollbar fade-edge">
          {CATEGORIES.map(category => {
            const isActive = activeCategory === category.id;
            return (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-3 rounded-2xl font-medium text-sm transition-all whitespace-nowrap shadow-sm",
                  isActive 
                    ? "bg-blue-600 text-white shadow-blue-500/25" 
                    : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700"
                )}
              >
                <category.icon size={16} />
                {category.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Contacts Grid */}
      {filteredContacts.length > 0 ? (
        <motion.div 
          layout
          className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
        >
          <AnimatePresence>
            {filteredContacts.map(contact => (
              <motion.div
                key={contact.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm flex items-start gap-4 hover:shadow-md transition-shadow group"
              >
                <div className={cn("mt-1 w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-inner", contact.color)}>
                  <contact.icon className="text-white" size={24} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-slate-900 dark:text-white truncate">{contact.name}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5 truncate">{contact.description}</p>
                  
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-lg font-bold text-blue-600 dark:text-blue-400 font-mono tracking-tight">{contact.phone}</span>
                    <a 
                      href={`tel:${contact.phone.replace(/[^0-9]/g, '')}`}
                      className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-blue-100 dark:hover:bg-blue-900/50"
                      title="Ligar"
                    >
                      <Phone size={18} />
                    </a>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-20 text-center bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm"
        >
          <div className="w-20 h-20 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mb-6">
            <Phone size={32} className="text-slate-400" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Nenhum telefone encontrado</h3>
          <p className="text-slate-500 dark:text-slate-400 max-w-sm">
            Não encontramos resultados para "{searchTerm}" na categoria selecionada.
          </p>
          <button 
            onClick={() => {
              setSearchTerm('');
              setActiveCategory('todos');
            }}
            className="mt-6 px-6 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
          >
            Limpar filtros
          </button>
        </motion.div>
      )}
    </div>
  );
};

