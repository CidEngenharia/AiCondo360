import React from 'react';
import { Mail, MessageSquare, Send, Search, Filter, Phone, Video, Info, MoreVertical, Plus, CheckCircle2, Star, Clock, Trash2, ArrowLeft, MoreHorizontal, User, Layout, List } from 'lucide-react';
import { motion } from 'motion/react';

const MensagensPage: React.FC = () => {
  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-80px)] overflow-hidden">
      <aside className="w-full lg:w-96 bg-white dark:bg-slate-800 border-r border-slate-100 dark:border-slate-700 flex flex-col">
        <div className="p-8 border-b border-slate-100 dark:border-slate-700 space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Mensagens</h1>
            <button className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl shadow-lg transition-all hover:scale-110 active:scale-95">
              <Plus size={20} />
            </button>
          </div>
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Buscar conversas..." 
              className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700 py-3.5 pl-12 pr-4 rounded-2xl text-sm font-bold text-slate-800 dark:text-white outline-none focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/10 focus:border-blue-500 transition-all font-medium"
            />
          </div>
          <div className="flex gap-2 pt-2 overflow-x-auto no-scrollbar">
             {['Tudo', 'Moradores', 'Adm', 'Suporte'].map((tab, i) => (
                <button key={i} className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${i === 0 ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}>{tab}</button>
             ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar py-4 px-2 space-y-1">
          {[
            { name: 'Ricardo Santos (Bloco A)', msg: 'Boa tarde, Sidney! Consegue verificar se a piscina está aberta?', time: '14:20', active: true, unread: 2, avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' },
            { name: 'Helena Oliveira (Bloco B)', msg: 'Obrigada pela ajuda com o carregamento do carro elétrico.', time: 'Ontem', active: false, unread: 0, avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' },
            { name: 'Grupo de Segurança', msg: 'Ronda finalizada com sucesso. Sem intercorrências.', time: 'Ontem', active: false, unread: 0, avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' },
            { name: 'Manutenção Preventiva', msg: 'O orçamento para a pintura da fachada foi aprovado.', time: '2 dias', active: false, unread: 0, avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' },
            { name: 'Fábio Souza (Bloco C)', msg: 'O barulho no andar de cima persistiu durante a madrugada.', time: '3 dias', active: false, unread: 0, avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' },
          ].map((chat, i) => (
            <motion.div
              key={i}
              whileHover={{ x: 5 }}
              whileTap={{ scale: 0.98 }}
              className={`p-4 rounded-3xl flex items-center gap-4 cursor-pointer transition-all ${chat.active ? 'bg-blue-50/50 dark:bg-blue-900/10' : 'hover:bg-slate-50 dark:hover:bg-slate-900/50'}`}
            >
              <div className="relative">
                <img src={chat.avatar} alt={chat.name} className="w-14 h-14 rounded-2xl object-cover shadow-md border-2 border-white dark:border-slate-800" />
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white dark:border-slate-800 rounded-full" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-0.5">
                  <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 truncate">{chat.name}</h3>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{chat.time}</span>
                </div>
                <div className="flex justify-between items-center gap-2">
                   <p className="text-xs text-slate-500 dark:text-slate-400 truncate leading-relaxed">{chat.msg}</p>
                   {chat.unread > 0 && (
                      <span className="bg-blue-600 text-white text-[10px] font-black min-w-[20px] h-5 px-1.5 flex items-center justify-center rounded-lg shadow-lg shadow-blue-200 dark:shadow-none">
                         {chat.unread}
                      </span>
                   )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </aside>

      <main className="flex-1 bg-slate-50 dark:bg-slate-900/40 flex flex-col relative overflow-hidden">
         <div className="h-20 flex-none bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-b border-slate-100 dark:border-slate-700 px-8 flex items-center justify-between z-10 sticky top-0">
            <div className="flex items-center gap-4">
               <div className="flex items-center gap-4 group cursor-pointer transition-all">
                  <div className="relative">
                    <img 
                      src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" 
                      className="w-12 h-12 rounded-2xl object-cover shadow-sm transition-transform group-hover:scale-105" 
                      alt="Active" 
                    />
                    <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-white dark:border-slate-800 rounded-full" />
                  </div>
                  <div>
                     <h2 className="text-base font-black text-slate-900 dark:text-white leading-none">Ricardo Santos</h2>
                     <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest transition-opacity group-hover:opacity-80">Ativo Agora • Bloco A, Apto 42</span>
                  </div>
               </div>
            </div>
            <div className="flex items-center gap-2">
               <button className="p-3 bg-slate-50 dark:bg-slate-700/50 text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 rounded-2xl transition-all shadow-sm"><Phone size={18} /></button>
               <button className="p-3 bg-slate-50 dark:bg-slate-700/50 text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 rounded-2xl transition-all shadow-sm"><Video size={18} /></button>
               <div className="w-px h-8 bg-slate-100 dark:bg-slate-700 mx-2" />
               <button className="p-3 bg-slate-50 dark:bg-slate-700/50 text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 rounded-2xl transition-all shadow-sm"><Info size={18} /></button>
            </div>
         </div>

         <div className="flex-1 overflow-y-auto p-10 space-y-8 no-scrollbar scroll-smooth">
            <div className="flex flex-col items-center gap-4 py-6">
               <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" className="w-20 h-20 rounded-3xl shadow-xl ring-4 ring-white dark:ring-slate-800" alt="Profile" />
               <div className="text-center">
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">Ricardo Santos</h3>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Sua conversa começou em 12 de Junho, 2023</p>
               </div>
               <div className="px-5 py-1.5 bg-slate-100 dark:bg-slate-800/80 rounded-full text-[10px] font-black text-slate-400 uppercase tracking-widest">Ontem</div>
            </div>

            <div className="flex items-start gap-4">
               <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" className="w-9 h-9 rounded-xl object-cover" alt="Sender" />
               <div className="flex flex-col gap-1.5 max-w-[70%] group">
                  <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl rounded-tl-none shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col gap-2 relative">
                     <p className="text-sm font-medium text-slate-700 dark:text-slate-200 leading-relaxed text-[15px]">Boa tarde, Sidney! Tudo bem? Consegue verificar se a piscina está aberta hoje?</p>
                     <div className="flex justify-end gap-2 items-center opacity-0 group-hover:opacity-100 transition-opacity absolute -right-12 top-2">
                        <button className="p-1.5 text-slate-400 hover:text-blue-500 transition-all"><Star size={14}/></button>
                        <button className="p-1.5 text-slate-400 hover:text-blue-500 transition-all"><MessageSquare size={14}/></button>
                     </div>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1">14:20 <CheckCircle2 size={10} className="text-blue-500" /></span>
               </div>
            </div>

            <div className="flex items-end justify-end gap-4">
               <div className="flex flex-col gap-1.5 max-w-[70%] items-end group">
                  <div className="bg-blue-600 p-5 rounded-3xl rounded-br-none shadow-xl shadow-blue-100 dark:shadow-none flex flex-col gap-2 relative transition-all group-hover:bg-blue-700">
                     <p className="text-sm font-bold text-white leading-relaxed text-[15px]">Olá, Ricardo! Tudo ótimo por aqui. Sim, a piscina já está liberada para uso até as 22h hoje.</p>
                     <div className="flex justify-end items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity absolute -left-12 top-2">
                        <button className="p-1.5 text-slate-400 hover:text-blue-500 transition-all"><Star size={14}/></button>
                     </div>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mr-1">14:25 • Entregue</span>
               </div>
            </div>

            <div className="flex items-start gap-4">
               <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" className="w-9 h-9 rounded-xl object-cover" alt="Sender" />
               <div className="flex flex-col gap-1.5 max-w-[70%] group">
                  <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl rounded-tl-none shadow-sm border border-slate-100 dark:border-slate-700">
                     <p className="text-sm font-medium text-slate-700 dark:text-slate-200 text-[15px]">Maravilha! Vou avisar os pequenos. Muito obrigado pela atenção.</p>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">14:26</span>
               </div>
            </div>
            
            <div className="h-20" />
         </div>

         <div className="p-8 bg-white/50 dark:bg-slate-800/50 backdrop-blur-xl border-t border-slate-100 dark:border-slate-700 sticky bottom-0 z-10">
            <div className="relative flex items-center transition-all">
               <div className="absolute left-4 flex items-center gap-2">
                  <button className="p-2 text-slate-400 hover:text-blue-600 transition-all bg-slate-50 dark:bg-slate-700/50 rounded-xl"><Plus size={18} /></button>
               </div>
               <input 
                  type="text" 
                  placeholder="Escreva sua mensagem aqui..." 
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 py-4 pl-16 pr-20 rounded-2xl text-[15px] font-bold text-slate-800 dark:text-white outline-none focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/20 focus:border-blue-500 transition-all"
               />
               <div className="absolute right-4">
                  <button className="bg-blue-600 hover:bg-blue-700 text-white p-2.5 rounded-xl shadow-lg transition-all hover:scale-110 active:scale-95 flex items-center justify-center">
                     <Send size={18} />
                  </button>
               </div>
            </div>
         </div>
      </main>
    </div>
  );
};

export default MensagensPage;
