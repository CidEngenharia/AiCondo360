import React from 'react';
import { FileText, Folder, File, Download, MoreVertical, Search, Filter } from 'lucide-react';
import { motion } from 'framer-motion';

const DOCS = [
  { id: 1, title: 'Regimento Interno 2024', type: 'pdf', size: '2.4 MB', date: '10 Nov 2024', folder: 'Regras' },
  { id: 2, title: 'Ata da Assembleia - Out/2024', type: 'doc', size: '1.1 MB', date: '05 Nov 2024', folder: 'Atas' },
  { id: 3, title: 'Prestação de Contas 09/2024', type: 'pdf', size: '4.5 MB', date: '15 Out 2024', folder: 'Financeiro' },
  { id: 4, title: 'Manual do Proprietário', type: 'pdf', size: '15 MB', date: '10 Jan 2024', folder: 'Geral' },
];

const FOLDERS = ['Regras', 'Atas', 'Financeiro', 'Geral'];

export const Documentos: React.FC = () => {
  return (
    <div className="p-4 sm:p-6 lg:p-8 pt-6 w-full max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Documentos</h1>
          <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-1">
            Arquivos e normas importantes do condomínio
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Buscar documentos..." 
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:text-white"
          />
        </div>
        <button className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
          <Filter size={18} />
        </button>
      </div>

      <div className="space-y-6">
        <div>
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-4">Pastas</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {FOLDERS.map((f, i) => (
              <motion.div 
                key={f}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-blue-500 hover:shadow-md transition-all cursor-pointer group flex items-center gap-3"
              >
                <div className="p-2 bg-blue-50 dark:bg-blue-500/10 text-blue-500 rounded-lg group-hover:scale-110 transition-transform">
                  <Folder size={20} className="fill-blue-500/20" />
                </div>
                <span className="font-medium text-slate-700 dark:text-slate-200">{f}</span>
              </motion.div>
            ))}
          </div>
        </div>

        <div>
           <h2 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-4">Recentes</h2>
           <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
             <div className="overflow-x-auto">
               <table className="w-full text-left border-collapse">
                 <thead>
                   <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
                     <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Nome</th>
                     <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden sm:table-cell">Pasta</th>
                     <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">Tamanho</th>
                     <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden sm:table-cell">Modificado em</th>
                     <th className="px-6 py-4 w-10"></th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                   {DOCS.map((doc) => (
                     <tr key={doc.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group cursor-pointer">
                       <td className="px-6 py-4">
                         <div className="flex items-center gap-3">
                           <FileText size={20} className={doc.type === 'pdf' ? 'text-red-500' : 'text-blue-500'} />
                           <span className="font-medium text-slate-900 dark:text-white">{doc.title}</span>
                         </div>
                       </td>
                       <td className="px-6 py-4 hidden sm:table-cell text-sm text-slate-600 dark:text-slate-400">
                         {doc.folder}
                       </td>
                       <td className="px-6 py-4 hidden md:table-cell text-sm text-slate-500">
                         {doc.size}
                       </td>
                       <td className="px-6 py-4 hidden sm:table-cell text-sm text-slate-500">
                         {doc.date}
                       </td>
                       <td className="px-6 py-4">
                         <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity justify-end">
                           <button className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-md">
                             <Download size={16} />
                           </button>
                         </div>
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
};

