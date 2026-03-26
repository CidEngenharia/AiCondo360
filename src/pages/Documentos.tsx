import React, { useState, useRef, useCallback } from 'react';
import {
  FileText, Folder, Download, Search, Plus, Eye, Pencil, Trash2,
  X, Upload, AlertTriangle, CheckCircle2, FileArchive, File,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { FeatureHeader } from '../components/FeatureHeader';

// ─── Types ────────────────────────────────────────────────────────────────────
type DocType = 'pdf' | 'doc' | 'xlsx' | 'zip' | 'other';

interface DocFile {
  id: number;
  title: string;
  type: DocType;
  size: string;
  date: string;
  folder: string;
  url?: string;      // object URL for locally uploaded files
  isLocal?: boolean; // uploaded in this session
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getFileType = (name: string): DocType => {
  const ext = name.split('.').pop()?.toLowerCase() ?? '';
  if (ext === 'pdf') return 'pdf';
  if (['doc', 'docx'].includes(ext)) return 'doc';
  if (['xls', 'xlsx'].includes(ext)) return 'xlsx';
  if (['zip', 'rar', '7z'].includes(ext)) return 'zip';
  return 'other';
};

const formatBytes = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const formatDate = (d: Date) =>
  d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });

// ─── Icon per type ────────────────────────────────────────────────────────────
const DocIcon = ({ type, size = 20 }: { type: DocType; size?: number }) => {
  const cls: Record<DocType, string> = {
    pdf: 'text-red-500',
    doc: 'text-blue-500',
    xlsx: 'text-emerald-500',
    zip: 'text-amber-500',
    other: 'text-slate-400',
  };
  const Icon =
    type === 'zip' ? FileArchive :
    type === 'xlsx' ? File :
    FileText;
  return <Icon size={size} className={cls[type]} />;
};

// ─── Initial data ─────────────────────────────────────────────────────────────
const INITIAL_DOCS: DocFile[] = [
  { id: 1, title: 'Regimento Interno 2024', type: 'pdf', size: '2.4 MB', date: '10 Nov 2024', folder: 'Regras' },
  { id: 2, title: 'Ata da Assembleia - Out/2024', type: 'doc', size: '1.1 MB', date: '05 Nov 2024', folder: 'Atas' },
  { id: 3, title: 'Prestação de Contas 09/2024', type: 'pdf', size: '4.5 MB', date: '15 Out 2024', folder: 'Financeiro' },
  { id: 4, title: 'Manual do Proprietário', type: 'pdf', size: '15 MB', date: '10 Jan 2024', folder: 'Geral' },
];

const FOLDERS = ['Regras', 'Atas', 'Financeiro', 'Geral'];

// ─── Sub-components ────────────────────────────────────────────────────────────

/** Overlay modal wrapper */
const Modal = ({ open, onClose, children }: { open: boolean; onClose: () => void; children: React.ReactNode }) => (
  <AnimatePresence>
    {open && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="relative w-full max-w-lg bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {children}
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

/** Upload Modal */
const UploadModal = ({
  open,
  onClose,
  onUpload,
}: {
  open: boolean;
  onClose: () => void;
  onUpload: (files: FileList, folder: string) => void;
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [folder, setFolder] = useState(FOLDERS[0]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files.length) setSelectedFiles(e.dataTransfer.files);
  }, []);

  const handleSubmit = () => {
    if (selectedFiles) {
      onUpload(selectedFiles, folder);
      setSelectedFiles(null);
      onClose();
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <div className="p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white">Enviar Documento</h3>
            <p className="text-sm text-slate-500 mt-1">PDF, DOC, XLSX ou ZIP — máx. 50 MB</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
            <X size={18} className="text-slate-500" />
          </button>
        </div>

        {/* Drop zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
            dragging
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10'
              : 'border-slate-200 dark:border-slate-600 hover:border-blue-400 hover:bg-slate-50 dark:hover:bg-slate-700/50'
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            multiple
            className="hidden"
            onChange={(e) => e.target.files && setSelectedFiles(e.target.files)}
          />
          <Upload size={32} className={`mx-auto mb-3 ${dragging ? 'text-blue-500' : 'text-slate-400'}`} />
          {selectedFiles ? (
            <div className="space-y-1">
              {Array.from<File>(selectedFiles).map((file, i) => (
                <p key={i} className="text-sm font-bold text-slate-700 dark:text-slate-200 truncate">{file.name}</p>
              ))}
            </div>
          ) : (
            <>
              <p className="font-bold text-slate-700 dark:text-slate-300">Clique ou arraste arquivos aqui</p>
              <p className="text-xs text-slate-400 mt-1">Suporta múltiplos arquivos</p>
            </>
          )}
        </div>

        {/* Folder picker */}
        <div className="mt-4">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Pasta de destino</label>
          <select
            value={folder}
            onChange={(e) => setFolder(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          >
            {FOLDERS.map((f) => <option key={f}>{f}</option>)}
          </select>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 py-3 rounded-2xl border border-slate-200 dark:border-slate-600 text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all">
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={!selectedFiles}
            className="flex-1 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold transition-all"
          >
            Enviar
          </button>
        </div>
      </div>
    </Modal>
  );
};

/** Edit Modal */
const EditModal = ({
  open,
  onClose,
  doc,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  doc: DocFile | null;
  onSave: (updated: DocFile) => void;
}) => {
  const [title, setTitle] = useState(doc?.title ?? '');
  const [folder, setFolder] = useState(doc?.folder ?? FOLDERS[0]);

  React.useEffect(() => {
    if (doc) { setTitle(doc.title); setFolder(doc.folder); }
  }, [doc]);

  if (!doc) return null;

  return (
    <Modal open={open} onClose={onClose}>
      <div className="p-6">
        <div className="flex justify-between items-start mb-6">
          <h3 className="text-lg font-black text-slate-900 dark:text-white">Editar Documento</h3>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
            <X size={18} className="text-slate-500" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Nome do arquivo</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Pasta</label>
            <select
              value={folder}
              onChange={(e) => setFolder(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            >
              {FOLDERS.map((f) => <option key={f}>{f}</option>)}
            </select>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 py-3 rounded-2xl border border-slate-200 dark:border-slate-600 text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all">
            Cancelar
          </button>
          <button
            onClick={() => { onSave({ ...doc, title: title.trim() || doc.title, folder }); onClose(); }}
            className="flex-1 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all"
          >
            Salvar
          </button>
        </div>
      </div>
    </Modal>
  );
};

/** View Modal */
const ViewModal = ({
  open,
  onClose,
  doc,
}: {
  open: boolean;
  onClose: () => void;
  doc: DocFile | null;
}) => {
  if (!doc) return null;
  return (
    <Modal open={open} onClose={onClose}>
      <div className="p-6">
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-slate-100 dark:bg-slate-700 rounded-xl">
              <DocIcon type={doc.type} size={24} />
            </div>
            <div>
              <h3 className="font-black text-slate-900 dark:text-white leading-tight">{doc.title}</h3>
              <p className="text-xs text-slate-500 mt-0.5">{doc.size} · {doc.date}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
            <X size={18} className="text-slate-500" />
          </button>
        </div>

        <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-8 flex flex-col items-center justify-center min-h-[220px] text-center gap-4 border border-slate-200 dark:border-slate-700">
          {doc.url ? (
            doc.type === 'pdf' ? (
              <iframe src={doc.url} title={doc.title} className="w-full h-64 rounded-xl border-0" />
            ) : (
              <>
                <DocIcon type={doc.type} size={48} />
                <p className="text-sm text-slate-500 font-medium">Visualização não disponível para este tipo de arquivo.</p>
                <a
                  href={doc.url}
                  download={doc.title}
                  className="mt-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-xl transition-all"
                >
                  Baixar arquivo
                </a>
              </>
            )
          ) : (
            <>
              <DocIcon type={doc.type} size={48} />
              <p className="text-sm text-slate-500 font-medium">Pré-visualização disponível apenas para arquivos enviados nesta sessão.</p>
            </>
          )}
        </div>

        <div className="grid grid-cols-3 gap-3 mt-4 text-center">
          {[
            { label: 'Pasta', value: doc.folder },
            { label: 'Tamanho', value: doc.size },
            { label: 'Data', value: doc.date },
          ].map(({ label, value }) => (
            <div key={label} className="bg-slate-50 dark:bg-slate-900 rounded-xl p-3 border border-slate-100 dark:border-slate-700">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</p>
              <p className="text-sm font-bold text-slate-700 dark:text-slate-200 mt-0.5 truncate">{value}</p>
            </div>
          ))}
        </div>

        <div className="flex gap-3 mt-5">
          <button onClick={onClose} className="flex-1 py-3 rounded-2xl border border-slate-200 dark:border-slate-600 text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 transition-all">
            Fechar
          </button>
          {doc.url && (
            <a
              href={doc.url}
              download={doc.title}
              className="flex-1 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm text-center transition-all flex items-center justify-center gap-2"
            >
              <Download size={16} /> Baixar
            </a>
          )}
        </div>
      </div>
    </Modal>
  );
};

/** Delete Confirm Modal */
const DeleteModal = ({
  open,
  onClose,
  doc,
  onConfirm,
}: {
  open: boolean;
  onClose: () => void;
  doc: DocFile | null;
  onConfirm: () => void;
}) => (
  <Modal open={open} onClose={onClose}>
    <div className="p-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-500/10 flex items-center justify-center mx-auto mb-4">
        <AlertTriangle size={28} className="text-red-500" />
      </div>
      <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2">Excluir Documento</h3>
      <p className="text-sm text-slate-500">
        Tem certeza que deseja excluir <span className="font-bold text-slate-700 dark:text-slate-300">"{doc?.title}"</span>? Esta ação não pode ser desfeita.
      </p>
      <div className="flex gap-3 mt-6">
        <button onClick={onClose} className="flex-1 py-3 rounded-2xl border border-slate-200 dark:border-slate-600 text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 transition-all">
          Cancelar
        </button>
        <button onClick={() => { onConfirm(); onClose(); }} className="flex-1 py-3 rounded-2xl bg-red-500 hover:bg-red-600 text-white font-bold transition-all">
          Excluir
        </button>
      </div>
    </div>
  </Modal>
);

// ─── Toast ────────────────────────────────────────────────────────────────────
const Toast = ({ message, onDone }: { message: string; onDone: () => void }) => {
  React.useEffect(() => {
    const t = setTimeout(onDone, 2500);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 40 }}
      className="fixed bottom-6 right-6 z-[100] flex items-center gap-3 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl text-sm font-bold"
    >
      <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
      {message}
    </motion.div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
export const Documentos: React.FC = () => {
  const [docs, setDocs] = useState<DocFile[]>(INITIAL_DOCS);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFolder, setActiveFolder] = useState<string | null>(null);

  const [uploadOpen, setUploadOpen] = useState(false);
  const [viewDoc, setViewDoc]       = useState<DocFile | null>(null);
  const [editDoc, setEditDoc]       = useState<DocFile | null>(null);
  const [deleteDoc, setDeleteDoc]   = useState<DocFile | null>(null);
  const [toast, setToast]           = useState<string | null>(null);

  const nextId = useRef(INITIAL_DOCS.length + 1);

  // Filtered list
  const filtered = docs.filter((d) => {
    const matchSearch = d.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchFolder = !activeFolder || d.folder === activeFolder;
    return matchSearch && matchFolder;
  });

  // Folder counts
  const folderCount = (f: string) => docs.filter((d) => d.folder === f).length;

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleUpload = (files: FileList, folder: string) => {
    const newDocs: DocFile[] = Array.from(files).map((file) => ({
      id: nextId.current++,
      title: file.name.replace(/\.[^/.]+$/, ''), // strip extension for title
      type: getFileType(file.name),
      size: formatBytes(file.size),
      date: formatDate(new Date()),
      folder,
      url: URL.createObjectURL(file),
      isLocal: true,
    }));
    setDocs((prev) => [...newDocs, ...prev]);
    setToast(`${newDocs.length} arquivo(s) enviado(s) com sucesso!`);
  };

  const handleSave = (updated: DocFile) => {
    setDocs((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
    setToast('Documento atualizado!');
  };

  const handleDelete = () => {
    if (!deleteDoc) return;
    if (deleteDoc.url) URL.revokeObjectURL(deleteDoc.url);
    setDocs((prev) => prev.filter((d) => d.id !== deleteDoc.id));
    setToast('Documento excluído.');
  };

  const handleDownload = (doc: DocFile) => {
    if (doc.url) {
      const a = document.createElement('a');
      a.href = doc.url;
      a.download = doc.title;
      a.click();
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="p-4 sm:p-6 lg:p-8 pt-6 w-full max-w-7xl mx-auto space-y-8">
      <FeatureHeader
        icon={FileText}
        title="Documentos"
        description="Arquivos e normas importantes do condomínio. Faça upload, visualize, edite e exclua documentos."
        color="bg-indigo-600"
      >
        <button
          onClick={() => setUploadOpen(true)}
          className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-indigo-600/20 active:scale-[0.98]"
        >
          <Plus size={20} />
          <span>Novo Documento</span>
        </button>
      </FeatureHeader>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Buscar documentos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:text-white"
          />
        </div>
        {activeFolder && (
          <button
            onClick={() => setActiveFolder(null)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-sm font-bold border border-indigo-200 dark:border-indigo-500/30 hover:bg-indigo-100 transition-all"
          >
            {activeFolder} <X size={14} />
          </button>
        )}
      </div>

      {/* Folders */}
      <div>
        <h2 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-4">Pastas</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {FOLDERS.map((f, i) => (
            <motion.button
              key={f}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => setActiveFolder(activeFolder === f ? null : f)}
              className={`p-4 rounded-xl border transition-all flex items-center gap-3 text-left ${
                activeFolder === f
                  ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 shadow-md'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-blue-500 hover:shadow-md'
              }`}
            >
              <div className={`p-2 rounded-lg transition-colors ${activeFolder === f ? 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400' : 'bg-blue-50 dark:bg-blue-500/10 text-blue-500'}`}>
                <Folder size={20} className="fill-current opacity-20" />
              </div>
              <div>
                <span className="font-semibold text-slate-700 dark:text-slate-200 text-sm block">{f}</span>
                <span className="text-xs text-slate-400">{folderCount(f)} arquivo(s)</span>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Document table */}
      <div>
        <h2 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-4">
          {activeFolder ? `Pasta: ${activeFolder}` : 'Todos os Documentos'}
          <span className="ml-2 text-slate-400 font-normal normal-case text-xs">({filtered.length})</span>
        </h2>
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Nome</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden sm:table-cell">Pasta</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">Tamanho</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden sm:table-cell">Modificado em</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                <AnimatePresence>
                  {filtered.map((doc) => (
                    <motion.tr
                      key={doc.id}
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group cursor-pointer"
                      onClick={() => setViewDoc(doc)}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <DocIcon type={doc.type} />
                          <div>
                            <span className="font-medium text-slate-900 dark:text-white text-sm block">{doc.title}</span>
                            {doc.isLocal && (
                              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-full">novo</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 hidden sm:table-cell text-sm text-slate-600 dark:text-slate-400">{doc.folder}</td>
                      <td className="px-6 py-4 hidden md:table-cell text-sm text-slate-500">{doc.size}</td>
                      <td className="px-6 py-4 hidden sm:table-cell text-sm text-slate-500">{doc.date}</td>
                      <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-1 justify-end">
                          <button
                            title="Visualizar"
                            onClick={() => setViewDoc(doc)}
                            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-lg transition-all"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            title="Editar"
                            onClick={() => setEditDoc(doc)}
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-all"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            title="Baixar"
                            onClick={() => handleDownload(doc)}
                            disabled={!doc.url}
                            className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            <Download size={16} />
                          </button>
                          <button
                            title="Excluir"
                            onClick={() => setDeleteDoc(doc)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-all"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>

            {filtered.length === 0 && (
              <div className="py-16 text-center">
                <FileText size={40} className="mx-auto text-slate-200 dark:text-slate-600 mb-4" />
                <p className="text-slate-400 font-medium">Nenhum documento encontrado.</p>
                <button
                  onClick={() => setUploadOpen(true)}
                  className="mt-4 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-xl transition-all"
                >
                  Enviar Documento
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <UploadModal open={uploadOpen} onClose={() => setUploadOpen(false)} onUpload={handleUpload} />
      <ViewModal open={!!viewDoc} onClose={() => setViewDoc(null)} doc={viewDoc} />
      <EditModal open={!!editDoc} onClose={() => setEditDoc(null)} doc={editDoc} onSave={handleSave} />
      <DeleteModal open={!!deleteDoc} onClose={() => setDeleteDoc(null)} doc={deleteDoc} onConfirm={handleDelete} />

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <React.Fragment key={toast}>
            <Toast message={toast} onDone={() => setToast(null)} />
          </React.Fragment>
        )}
      </AnimatePresence>
    </div>
  );
};
