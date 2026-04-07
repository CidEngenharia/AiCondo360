import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, Search, Plus, Trash2, Download, Filter, 
  ExternalLink, Eye, ChevronRight, X, Clock,
  FileSpreadsheet, FileVideo, FileImage, 
  AlertTriangle, CheckCircle2, MoreVertical,
  Briefcase, ShieldCheck, Scale, Loader2, Upload
} from 'lucide-react';
import { DocumentoService } from '../services/supabaseService';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';

interface Document {
  id: string;
  condominio_id: string;
  user_id: string;
  title: string;
  category: string;
  description: string;
  file_url: string;
  created_at: string;
}

export const Documentos: React.FC = () => {
  const { user } = useAuth();
  const [activeCategory, setActiveCategory] = useState<string>('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [newDoc, setNewDoc] = useState({
    title: '',
    category: 'Regimento',
    description: ''
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadingRef = useRef(false);

  const loadDocs = async () => {
    if (!user?.condoId || loadingRef.current) return;
    loadingRef.current = true;
    setLoading(true);
    try {
      const data = await DocumentoService.getCondoDocs(user.condoId);
      setDocuments(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  };

  useEffect(() => {
    if (user?.condoId) {
      loadDocs();
    }
  }, [user?.condoId]);

  const categories = ['Todos', 'Regimento', 'Atas', 'Financeiro', 'Outros'];

  const filteredDocs = documents.filter(doc => {
    const matchesCategory = activeCategory === 'Todos' || doc.category === activeCategory;
    const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         (doc.description && doc.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.condoId) {
      alert("Erro: Condomínio não identificado. Por favor, selecione um condomínio ou refaça o login.");
      return;
    }
    if (!newDoc.title || !user) return;
    if (!selectedFile) {
      alert("Por favor, selecione um arquivo.");
      return;
    }

    setUploading(true);
    try {
      // 1. Upload do arquivo para o Supabase Storage (Bucket "documentos")
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `${user.condoId}/${fileName}`;

      const { error: uploadError, data } = await supabase.storage
        .from('documentos')
        .upload(filePath, selectedFile);

      if (uploadError) {
        throw new Error(`Erro no upload: ${uploadError.message}. Verifique se o bucket 'documentos' existe e é público no Supabase Storage.`);
      }

      // 2. Obter URL Pública
      const { data: publicUrlData } = supabase.storage
        .from('documentos')
        .getPublicUrl(filePath);
      
      const file_url = publicUrlData.publicUrl;

      // 3. Salvar no banco
      const docData: any = {
        condominio_id: user.condoId,
        user_id: user.id, // pode ou não ter restrição dependendo do setup
        title: newDoc.title,
        category: newDoc.category,
        description: newDoc.description || '',
        file_url: file_url,
      };

      await DocumentoService.createDoc(docData);
      loadDocs();
      closeModal();
    } catch (err: any) {
      console.error('[Documentos] Erro detalhado:', err);
      alert(`${err?.message || err?.details || JSON.stringify(err)}`);
    } finally {
      setUploading(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setNewDoc({ title: '', category: 'Regimento', description: '' });
    setSelectedFile(null);
  };

  const handleDelete = async (id: string, fileUrl: string) => {
    if (window.confirm('Deseja realmente excluir este documento?')) {
      try {
        // Tenta remover o arquivo do storage
        if (fileUrl) {
          const filePathMatch = fileUrl.match(/\/documentos\/(.+)$/);
          if (filePathMatch && filePathMatch[1]) {
             await supabase.storage.from('documentos').remove([filePathMatch[1]]);
          }
        }
        await DocumentoService.deleteDoc(id);
        loadDocs();
      } catch (err) {
        console.error(err);
        alert("Erro ao excluir.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950/50 p-4 sm:p-6 lg:p-8">
      {/* Header Interativo Style */}
      <div className="max-w-7xl mx-auto mb-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 text-indigo-500 rounded-full text-xs font-bold uppercase tracking-wider">
              <ShieldCheck size={14} />
              Repositório Oficial
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              Central de <span className="text-indigo-500">Documentos</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 max-w-lg font-medium leading-relaxed">
              Acesse atas, regimentos, balancetes e comunicados oficiais do condomínio com um clique.
            </p>
          </div>

          {user?.role !== 'resident' && (
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center justify-center gap-2 px-8 py-4 bg-indigo-500 text-white rounded-2xl hover:bg-indigo-600 transition-all font-bold shadow-lg shadow-indigo-500/25 active:scale-95 translate-y-0 hover:-translate-y-1"
            >
              <Plus size={22} />
              Novo Documento
            </button>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto space-y-8">
        {/* Barra de Pesquisa e Filtros */}
        <div className="flex flex-col lg:flex-row gap-6 items-center">
          <div className="relative w-full lg:flex-1">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600" size={24} />
            <input 
              type="text" 
              placeholder="Pesquisar por título ou descrição..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-16 pr-6 py-5 bg-white dark:bg-slate-900 border-none rounded-[28px] shadow-sm focus:ring-2 focus:ring-indigo-500/20 transition-all text-lg font-medium dark:text-white dark:placeholder:text-slate-600"
            />
          </div>
          
          <div className="flex gap-2 p-2 bg-white dark:bg-slate-900 rounded-[28px] shadow-sm border border-slate-100 dark:border-slate-800 overflow-x-auto scrollbar-hide w-full lg:w-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-6 py-3 rounded-2xl text-sm font-bold transition-all whitespace-nowrap ${
                  activeCategory === cat
                    ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/20'
                    : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 dark:text-slate-400'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Lista de Documentos */}
        {loading ? (
             <div className="flex flex-col items-center justify-center py-20 grayscale opacity-50">
                <Loader2 className="animate-spin mb-4" size={40} />
                <p className="text-slate-500">Carregando documentos...</p>
             </div>
        ) : filteredDocs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <AnimatePresence mode="popLayout">
              {filteredDocs.map((doc, index) => (
                <motion.div
                  key={doc.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.05 }}
                  className="group relative bg-white dark:bg-slate-900 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 p-5 sm:p-6 rounded-[32px] border border-slate-200 dark:border-slate-800 transition-all hover:shadow-xl hover:shadow-indigo-500/5"
                >
                  <div className="flex items-start gap-4 sm:gap-6">
                    <div className={`shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-3xl flex items-center justify-center transition-transform group-hover:scale-110 shadow-sm ${
                      doc.category === 'Financeiro' ? 'bg-emerald-500/10 text-emerald-500' :
                      doc.category === 'Atas' ? 'bg-amber-500/10 text-amber-500' :
                      doc.category === 'Regimento' ? 'bg-indigo-500/10 text-indigo-500' :
                      'bg-slate-100 dark:bg-slate-800 text-slate-500'
                    }`}>
                      <FileText size={28} />
                    </div>
                    
                    <div className="flex-1 min-w-0 pr-8">
                      <div className="flex flex-wrap gap-2 text-[10px] text-slate-400 font-medium uppercase tracking-widest">
                        <span>{doc.category}</span>
                        <span>•</span>
                        <span>{new Date(doc.created_at).toLocaleDateString()}</span>
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1 group-hover:text-indigo-500 transition-colors truncate">
                        {doc.title}
                      </h3>
                      {doc.description && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-1 leading-relaxed">
                          {doc.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="absolute top-4 right-4 sm:top-5 sm:right-5 flex gap-1">
                    {user?.role !== 'resident' && (
                      <button 
                        onClick={() => handleDelete(doc.id, doc.file_url)}
                        className="p-3 text-slate-300 dark:text-slate-600 hover:text-rose-500 hover:bg-rose-500/10 rounded-2xl transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                    <a 
                      href={doc.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 text-slate-300 dark:text-slate-600 hover:text-indigo-500 hover:bg-indigo-500/10 rounded-2xl transition-all"
                    >
                      <Download size={18} />
                    </a>
                  </div>

                  <div className="mt-8 pt-4 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 last:text-indigo-500/70">
                       <Clock size={12} />
                       REGISTRADO PELO SÍNDICO
                    </div>
                    <a href={doc.file_url} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-indigo-500 hover:text-indigo-600 flex items-center gap-1 group/btn">
                      Ver Online
                      <ChevronRight size={14} className="transition-transform group-hover/btn:translate-x-1" />
                    </a>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-[40px] p-20 text-center border border-slate-200 dark:border-slate-800">
            <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <FileText className="text-slate-200" size={48} />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Nenhum documento encontrado</h3>
            <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              Não existem arquivos nesta categoria ou que correspondam à sua pesquisa.
            </p>
          </div>
        )}
      </div>

      {/* Modal de Upload */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
              className="absolute inset-0 bg-slate-950/40 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-[32px] sm:rounded-[40px] shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh]"
            >
              <div className="p-6 sm:p-8 shrink-0 border-b border-slate-100 dark:border-slate-800">
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
                    <Plus className="text-indigo-500" size={28} />
                    Novo Documento
                  </h2>
                  <button onClick={closeModal} className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all">
                    <X size={24} />
                  </button>
                </div>
                <p className="text-slate-500 dark:text-slate-400 font-medium text-sm sm:text-base">Cadastre um novo arquivo oficial no sistema.</p>
              </div>

              <div className="overflow-y-auto p-6 sm:p-8 shrink min-h-0 custom-scrollbar">
                <form onSubmit={handleUpload} className="space-y-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Título do Arquivo</label>
                    <input 
                      type="text" 
                      required
                      placeholder="Ex: Balancete Março 2024"
                      value={newDoc.title}
                      onChange={(e) => setNewDoc({...newDoc, title: e.target.value})}
                      className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium dark:text-white"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Categoria</label>
                      <select 
                        value={newDoc.category}
                        onChange={(e) => setNewDoc({...newDoc, category: e.target.value})}
                        className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium dark:text-white appearance-none"
                      >
                        {categories.filter(c => c !== 'Todos').map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="flex flex-col">
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Selecione o Arquivo</label>
                      <input 
                        type="file" 
                        ref={fileInputRef}
                        onChange={handleFileSelect}
                        accept=".pdf,.doc,.docx,.xls,.xlsx"
                        className="hidden" 
                      />
                      <button 
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full px-4 py-4 bg-indigo-50 dark:bg-indigo-900/10 border-2 border-dashed border-indigo-200 dark:border-indigo-800 rounded-2xl flex flex-col items-center justify-center gap-1 text-indigo-500 hover:bg-indigo-100 dark:hover:bg-indigo-900/20 transition-all group overflow-hidden"
                      >
                        <Upload className="group-hover:-translate-y-1 transition-transform mb-1 shrink-0" size={20} />
                        <span className="font-bold text-[13px] truncate w-full text-center px-1">
                          {selectedFile ? selectedFile.name : 'Selecionar (PDF/DOC)'}
                        </span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Descrição (Opcional)</label>
                    <textarea 
                      rows={3}
                      placeholder="O que este documento contém?"
                      value={newDoc.description}
                      onChange={(e) => setNewDoc({...newDoc, description: e.target.value})}
                      className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium dark:text-white resize-none"
                    ></textarea>
                  </div>

                  <div className="pt-4 flex gap-4">
                    <button 
                      type="button"
                      onClick={closeModal}
                      disabled={uploading}
                      className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-2xl hover:bg-slate-200 transition-all font-bold disabled:opacity-50"
                    >
                      Cancelar
                    </button>
                    <button 
                      type="submit"
                      disabled={uploading}
                      className="flex-[2] py-4 bg-indigo-500 text-white rounded-2xl hover:bg-indigo-600 transition-all font-bold shadow-lg shadow-indigo-500/25 active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:scale-100"
                    >
                      {uploading ? (
                        <>
                          <Loader2 size={20} className="animate-spin" />
                          Enviando...
                        </>
                      ) : (
                        <>
                          <Plus size={20} />
                          Salvar Arquivo
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
