import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Tag, Plus, X, Copy, CheckCheck, Shield, RefreshCcw,
  Smartphone, WifiHigh, Clock, Trash2, QrCode, Lock, Unlock
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { FeatureHeader } from '../components/FeatureHeader';

// ─── Types ────────────────────────────────────────────────────────────────────
type TagStatus = 'active' | 'blocked' | 'expired';

interface DigitalTag {
  id: string;
  code: string;
  label: string;
  owner: string;
  unit: string;
  status: TagStatus;
  created_at: string;
  expires_at?: string;
  last_used?: string;
}

interface DigitalTagProps {
  userId?: string;
  condoId?: string;
  userRole?: string;
  unitNumber?: string;
  block?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const generateTagCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const groups: string[] = [];
  for (let i = 0; i < 3; i++) {
    let group = '';
    for (let j = 0; j < 4; j++) {
      group += chars[Math.floor(Math.random() * chars.length)];
    }
    groups.push(group);
  }
  return groups.join('-');
};

const STATUS_LABELS: Record<TagStatus, { label: string; color: string; bg: string }> = {
  active:  { label: 'Ativa',     color: 'text-emerald-600', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
  blocked: { label: 'Bloqueada', color: 'text-rose-600',    bg: 'bg-rose-100 dark:bg-rose-900/30' },
  expired: { label: 'Expirada',  color: 'text-slate-500',   bg: 'bg-slate-100 dark:bg-slate-700' },
};

const MOCK_TAGS: DigitalTag[] = [
  {
    id: '1', code: 'XKQM-4R7J-PLN2', label: 'Tag Principal',
    owner: 'Administrador Demo', unit: '101', status: 'active',
    created_at: new Date(Date.now() - 86400000 * 30).toISOString(),
    last_used: new Date(Date.now() - 3600000).toISOString(),
  },
];

// ─── Component ────────────────────────────────────────────────────────────────
const TagDigital: React.FC<DigitalTagProps> = ({ userId, condoId, userRole, unitNumber = '101', block = 'A' }) => {
  const { user } = useAuth();
  const canManage = userRole === 'admin' || userRole === 'sindico' || userRole === 'global_admin'
    || user?.role === 'admin' || user?.role === 'sindico' || user?.role === 'global_admin';

  const [tags, setTags] = useState<DigitalTag[]>(MOCK_TAGS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [previewCode, setPreviewCode] = useState(generateTagCode());

  const activeCount  = useMemo(() => tags.filter(t => t.status === 'active').length, [tags]);
  const blockedCount = useMemo(() => tags.filter(t => t.status === 'blocked').length, [tags]);

  const handleGenerateNew = () => setPreviewCode(generateTagCode());

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const now = new Date().toISOString();
    const newTag: DigitalTag = {
      id: crypto.randomUUID(),
      code: previewCode,
      label: newLabel.trim() || 'Tag Sem Nome',
      owner: user?.name || 'Morador',
      unit: unitNumber,
      status: 'active',
      created_at: now,
    };
    setTags(prev => [newTag, ...prev]);
    setNewLabel('');
    setPreviewCode(generateTagCode());
    setIsModalOpen(false);
  };

  const handleCopy = (id: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleBlock = (id: string) => {
    setTags(prev => prev.map(t =>
      t.id === id ? { ...t, status: t.status === 'active' ? 'blocked' : 'active' } : t
    ));
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Excluir esta tag de acesso?')) {
      setTags(prev => prev.filter(t => t.id !== id));
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-6 px-4 space-y-8">
      <FeatureHeader
        icon={Tag}
        title="Tag Digital"
        description="Gerencie suas tags de acesso digital ao condomínio. Cada tag é única e gerada pelo sistema."
        color="bg-violet-600"
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Tags Ativas',    value: activeCount,       icon: Shield,    color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/10' },
          { label: 'Bloqueadas',     value: blockedCount,      icon: Lock,      color: 'text-rose-500',    bg: 'bg-rose-50 dark:bg-rose-900/10' },
          { label: 'Total Geradas',  value: tags.length,       icon: Tag,       color: 'text-indigo-500',  bg: 'bg-indigo-50 dark:bg-indigo-900/10' },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
            className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700 shadow-sm flex items-center gap-4"
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${s.bg}`}>
              <s.icon size={22} className={s.color} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{s.label}</p>
              <p className="text-2xl font-black text-slate-900 dark:text-white">{s.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Header da lista */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Minhas Tags de Acesso</h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-5 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-2xl font-bold text-sm transition-all shadow-lg shadow-violet-500/25 active:scale-95"
        >
          <Plus size={18} /> Gerar Nova Tag
        </button>
      </div>

      {/* Lista de tags */}
      {tags.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700">
          <Tag size={48} className="mx-auto mb-4 text-slate-300" />
          <p className="text-slate-500 font-medium">Nenhuma tag gerada ainda.</p>
          <button onClick={() => setIsModalOpen(true)} className="mt-4 px-5 py-2.5 bg-violet-600 text-white rounded-xl text-sm font-bold hover:bg-violet-700 transition-all">
            + Gerar Primeira Tag
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {tags.map(tag => {
              const s = STATUS_LABELS[tag.status];
              const isCopied = copiedId === tag.id;
              return (
                <motion.div
                  key={tag.id}
                  initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
                  className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-5 flex flex-col sm:flex-row sm:items-center gap-4 group"
                >
                  {/* Ícone */}
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${tag.status === 'active' ? 'bg-violet-50 dark:bg-violet-900/20' : 'bg-slate-100 dark:bg-slate-700 grayscale'}`}>
                    <QrCode size={28} className={tag.status === 'active' ? 'text-violet-500' : 'text-slate-400'} />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-black text-slate-900 dark:text-white">{tag.label}</span>
                      <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full ${s.bg} ${s.color}`}>
                        {s.label}
                      </span>
                    </div>

                    {/* Código */}
                    <div className="flex items-center gap-3">
                      <code className={`font-mono text-lg font-black tracking-[0.25em] ${tag.status === 'active' ? 'text-violet-600 dark:text-violet-400' : 'text-slate-400 line-through'}`}>
                        {tag.code}
                      </code>
                      <button
                        onClick={() => handleCopy(tag.id, tag.code)}
                        className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-700 text-slate-400 hover:text-violet-600 hover:bg-violet-50 transition-all"
                        title="Copiar código"
                      >
                        {isCopied ? <CheckCheck size={14} className="text-emerald-500" /> : <Copy size={14} />}
                      </button>
                    </div>

                    <div className="flex items-center gap-4 mt-2 text-[11px] text-slate-400 flex-wrap">
                      <span>Unidade {tag.unit}</span>
                      {tag.last_used && (
                        <span className="flex items-center gap-1"><Clock size={10} /> Uso: {new Date(tag.last_used).toLocaleDateString('pt-BR')}</span>
                      )}
                      <span className="flex items-center gap-1"><WifiHigh size={10} /> Gerada em {new Date(tag.created_at).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </div>

                  {/* Ações */}
                  <div className="flex items-center gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleBlock(tag.id)}
                      className={`p-2.5 rounded-xl transition-all ${tag.status === 'active' ? 'bg-rose-50 dark:bg-rose-900/20 text-rose-500 hover:bg-rose-100' : 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500 hover:bg-emerald-100'}`}
                      title={tag.status === 'active' ? 'Bloquear' : 'Reativar'}
                    >
                      {tag.status === 'active' ? <Lock size={16} /> : <Unlock size={16} />}
                    </button>
                    {canManage && (
                      <button
                        onClick={() => handleDelete(tag.id)}
                        className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Aviso de segurança */}
      <div className="bg-gradient-to-br from-violet-600 to-indigo-700 rounded-3xl p-6 text-white flex items-start gap-4">
        <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center shrink-0">
          <Shield size={24} className="text-white" />
        </div>
        <div>
          <h3 className="font-black text-lg mb-1">Segurança da sua Tag</h3>
          <p className="text-sm text-white/80 leading-relaxed">
            Cada código é único, gerado com criptografia pelo sistema. Nunca compartilhe sua tag. Em caso de perda ou suspeita de uso indevido, bloqueie imediatamente abaixo.
          </p>
          <div className="flex items-center gap-3 mt-3 flex-wrap">
            <div className="flex items-center gap-1.5 text-xs font-bold text-white/70">
              <Smartphone size={12} /> Acesso via Portaria Digital
            </div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-white/70">
              <WifiHigh size={12} /> RFID + QR Code compatível
            </div>
          </div>
        </div>
      </div>

      {/* ─── Modal de geração ─────────────────────────────────────────── */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-950/50 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-black text-slate-900 dark:text-white">Gerar Nova Tag</h2>
                  <p className="text-xs text-slate-400 mt-0.5">Código único gerado automaticamente pelo sistema</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleCreate} className="p-6 space-y-5">

                {/* Preview do código */}
                <div className="bg-gradient-to-br from-violet-50 to-indigo-50 dark:from-violet-900/20 dark:to-indigo-900/20 rounded-2xl p-6 text-center border border-violet-100 dark:border-violet-800">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Código Gerado</p>
                  <code className="text-3xl font-black tracking-[0.3em] text-violet-600 dark:text-violet-400">
                    {previewCode}
                  </code>
                  <div className="mt-4">
                    <button
                      type="button"
                      onClick={handleGenerateNew}
                      className="flex items-center gap-2 mx-auto px-4 py-2 bg-white dark:bg-slate-800 rounded-xl text-sm font-bold text-slate-500 hover:text-violet-600 border border-slate-200 dark:border-slate-700 transition-all hover:border-violet-300"
                    >
                      <RefreshCcw size={14} /> Gerar Outro
                    </button>
                  </div>
                </div>

                {/* Nome da tag */}
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                    Nome / Identificação da Tag
                  </label>
                  <input
                    type="text"
                    value={newLabel}
                    onChange={e => setNewLabel(e.target.value)}
                    placeholder="Ex: Tag do Apartamento 101"
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-sm font-medium dark:text-white focus:ring-2 focus:ring-violet-500/20 border-none"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-xl font-bold hover:bg-slate-200 transition-all">
                    Cancelar
                  </button>
                  <button type="submit" className="flex-[2] py-3 bg-violet-600 text-white rounded-xl font-bold hover:bg-violet-700 transition-all shadow-lg shadow-violet-500/25 active:scale-95 flex items-center justify-center gap-2">
                    <Tag size={16} /> Gerar Tag de Acesso
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

export default TagDigital;
