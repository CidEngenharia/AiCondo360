import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Megaphone, MessageCircle, Heart, Share2, Plus, Image as ImageIcon, MapPin, MoreHorizontal, Loader2, Trash2, Edit2, CheckCircle2, AlertCircle } from 'lucide-react';
import { FeatureHeader } from '../components/FeatureHeader';
import { MuralService, MuralPost, MuralComment } from '../services/supabaseService';
import { useAuth } from '../hooks/useAuth';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const Mural: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const [posts, setPosts] = useState<MuralPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostStatus, setNewPostStatus] = useState<'ativo' | 'pendente' | 'finalizado'>('ativo');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingPost, setEditingPost] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  
  const [activeComments, setActiveComments] = useState<string | null>(null);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [comments, setComments] = useState<Record<string, MuralComment[]>>({});
  const [newCommentContent, setNewCommentContent] = useState<Record<string, string>>({});
  const [submittingComment, setSubmittingComment] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading) {
      if (user?.condoId) {
        loadPosts();
      } else {
        setLoading(false);
      }
    }
  }, [user, authLoading]);

  const loadPosts = async () => {
    if (!user?.condoId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await MuralService.getPosts(user.condoId);
      setPosts(data || []);
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!user || !newPostContent.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const data = await MuralService.createPost({
        condominio_id: user.condoId,
        author_id: user.id,
        author_name: user.name,
        author_role: user.role,
        content: newPostContent,
        category: 'announcement',
        status: newPostStatus,
        author_avatar: `https://ui-avatars.com/api/?name=${user.name}&background=random`
      });
      setNewPostContent('');
      setNewPostStatus('ativo');
      loadPosts();
    } catch (error: any) {
      console.error('Error creating post:', error);
      alert('Não foi possível salvar a alteração. O Banco de Dados recusou: ' + (error.message || 'Erro desconhecido. A coluna status pode estar ausente no banco Supabase.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este aviso?')) return;
    try {
      await MuralService.deletePost(postId);
      setPosts(posts.filter(p => p.id !== postId));
      setActiveMenu(null);
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  const handleUpdateStatus = async (postId: string, newStatus: 'ativo' | 'pendente' | 'finalizado') => {
    try {
      await MuralService.updatePost(postId, { status: newStatus });
      setPosts(posts.map(p => p.id === postId ? { ...p, status: newStatus } : p));
      setActiveMenu(null);
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleEditSubmit = async (postId: string) => {
    if (!editContent.trim()) return;
    try {
      await MuralService.updatePost(postId, { content: editContent });
      setPosts(posts.map(p => p.id === postId ? { ...p, content: editContent } : p));
      setEditingPost(null);
    } catch (error) {
      console.error('Error editing post:', error);
    }
  };

  const handleLike = async (postId: string, currentLikes: number) => {
    try {
      await MuralService.likePost(postId, currentLikes);
      setPosts(posts.map(p => p.id === postId ? { ...p, likes_count: currentLikes + 1 } : p));
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const toggleComments = async (postId: string) => {
    if (activeComments === postId) {
      setActiveComments(null);
      return;
    }

    setActiveComments(postId);
    if (!comments[postId]) {
      try {
        const postComments = await MuralService.getComments(postId);
        setComments(prev => ({ ...prev, [postId]: postComments }));
      } catch (error) {
        console.error('Error loading comments:', error);
      }
    }
  };

  const handleCommentSubmit = async (postId: string) => {
    const content = newCommentContent[postId];
    if (!user || !content?.trim() || submittingComment) return;

    setSubmittingComment(postId);
    try {
      const comment = await MuralService.createComment({
        post_id: postId,
        author_id: user.id,
        author_name: user.name,
        author_role: user.role,
        content: content,
        author_avatar: `https://ui-avatars.com/api/?name=${user.name}&background=random`
      });

      setComments(prev => ({
        ...prev,
        [postId]: [...(prev[postId] || []), comment]
      }));
      setNewCommentContent(prev => ({ ...prev, [postId]: '' }));
      
      // Update comment count locally
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, comments_count: (p.comments_count || 0) + 1 } : p));
    } catch (error) {
      console.error('Error submitting comment:', error);
    } finally {
      setSubmittingComment(null);
    }
  };

  const canCreatePost = ['syndic', 'admin', 'Síndico', 'Administrador'].includes(user?.role || '');

  return (
    <div className="max-w-4xl mx-auto py-6 px-4">
      <FeatureHeader 
        icon={Megaphone}
        title="Mural de Avisos"
        description="Fique por dentro das novidades, interaja com vizinhos e acompanhe a vida no condomínio."
        color="bg-amber-500"
      />

      {/* Post Composer - Only for Syndic/Admin */}
      {canCreatePost ? (
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 mb-8">
          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 border-2 border-slate-100">
              <img src={user ? `https://ui-avatars.com/api/?name=${user.name}&background=random` : "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=facearea&facepad=2&w=128&h=128&q=80"} alt="Me" />
            </div>
            <div className="flex-1">
              <textarea 
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                placeholder="O que você deseja comunicar aos moradores?"
                className="w-full bg-slate-50 dark:bg-slate-900/50 border-none rounded-2xl p-4 text-sm font-medium italic focus:ring-2 focus:ring-amber-500/20 outline-none resize-none transition-all h-24"
              />
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-2">
                  <button className="p-2 text-slate-500 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-xl transition-all flex items-center gap-2">
                    <ImageIcon size={18} />
                    <span className="text-[10px] font-bold uppercase">Foto</span>
                  </button>
                  <button className="p-2 text-slate-500 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-xl transition-all flex items-center gap-2">
                    <MapPin size={18} />
                    <span className="text-[10px] font-bold uppercase">Local</span>
                  </button>
                </div>
                <div className="flex items-center gap-3">
                  <select
                    value={newPostStatus}
                    onChange={(e) => setNewPostStatus(e.target.value as any)}
                    className="bg-slate-100 dark:bg-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 rounded-lg px-3 py-2 outline-none border-none focus:ring-2 focus:ring-amber-500/20"
                  >
                    <option value="ativo">Ativo</option>
                    <option value="pendente">Pendente</option>
                    <option value="finalizado">Finalizado</option>
                  </select>
                  <button 
                    onClick={handleSubmit}
                    disabled={!newPostContent.trim() || isSubmitting}
                    className="bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all"
                  >
                    {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : 'Publicar'} <Plus size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 rounded-2xl p-4 mb-8">
          <p className="text-xs font-bold text-amber-700 dark:text-amber-400 flex items-center gap-2">
            <Megaphone size={14} /> APENAS O SÍNDICO PODE CRIAR NOVOS AVISOS. VOCÊ PODE INTERAGIR RESPONDENDO AOS AVISOS EXISTENTES.
          </p>
        </div>
      )}

      {/* Feed */}
      <div className="space-y-6">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
          </div>
        ) : (
          posts.map((post) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden border border-slate-100">
                      <img src={post.author_avatar || `https://ui-avatars.com/api/?name=${post.author_name}&background=random`} alt={post.author_name} />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-slate-900 dark:text-white leading-tight">{post.author_name}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-[9px] font-black tracking-tighter uppercase px-1.5 py-0.5 rounded ${['syndic', 'admin', 'Síndico', 'Administrador'].includes(post.author_role || '') ? 'bg-amber-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'}`}>
                          {post.author_role === 'syndic' ? 'Síndico' : post.author_role === 'admin' ? 'Administrador' : post.author_role}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400">• {formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: ptBR })}</span>
                        {post.status && (
                          <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full flex items-center gap-1 ${
                            post.status === 'ativo' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                            post.status === 'pendente' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                            'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                          }`}>
                            {post.status === 'ativo' && <CheckCircle2 size={10} />}
                            {post.status === 'pendente' && <AlertCircle size={10} />}
                            {post.status === 'finalizado' && <CheckCircle2 size={10} />}
                            {post.status}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  {canCreatePost && (
                    <div className="relative">
                      <button 
                        onClick={() => setActiveMenu(activeMenu === post.id ? null : post.id)}
                        className="p-2 text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl transition-colors"
                      >
                        <MoreHorizontal size={20} />
                      </button>
                      
                      {activeMenu === post.id && (
                        <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 z-10 overflow-hidden">
                          <div className="p-2 space-y-1">
                            <p className="px-3 py-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</p>
                            <button onClick={() => handleUpdateStatus(post.id, 'ativo')} className={`w-full text-left px-3 py-2 text-xs font-bold rounded-lg flex items-center gap-2 ${post.status === 'ativo' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'}`}>
                              <CheckCircle2 size={14} /> Ativo
                            </button>
                            <button onClick={() => handleUpdateStatus(post.id, 'pendente')} className={`w-full text-left px-3 py-2 text-xs font-bold rounded-lg flex items-center gap-2 ${post.status === 'pendente' ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'}`}>
                              <AlertCircle size={14} /> Pendente
                            </button>
                            <button onClick={() => handleUpdateStatus(post.id, 'finalizado')} className={`w-full text-left px-3 py-2 text-xs font-bold rounded-lg flex items-center gap-2 ${post.status === 'finalizado' ? 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'}`}>
                              <CheckCircle2 size={14} /> Finalizado
                            </button>
                            <div className="h-px bg-slate-100 dark:bg-slate-700 my-1"></div>
                            <button onClick={() => { setEditingPost(post.id); setEditContent(post.content); setActiveMenu(null); }} className="w-full text-left px-3 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg flex items-center gap-2">
                              <Edit2 size={14} /> Editar Aviso
                            </button>
                            <button onClick={() => handleDeletePost(post.id)} className="w-full text-left px-3 py-2 text-xs font-bold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg flex items-center gap-2">
                              <Trash2 size={14} /> Excluir Aviso
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {editingPost === post.id ? (
                  <div className="mb-4">
                    <textarea 
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900/50 border border-amber-500/30 rounded-2xl p-4 text-sm font-medium italic focus:ring-2 focus:ring-amber-500/20 outline-none resize-none transition-all h-24 mb-3"
                    />
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => setEditingPost(null)} className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-all">Cancelar</button>
                      <button onClick={() => handleEditSubmit(post.id)} className="px-4 py-2 text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 rounded-xl transition-all">Salvar Alterações</button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium mb-4 italic whitespace-pre-line">
                    {post.content}
                  </p>
                )}

                {post.image_url && (
                  <div className="rounded-2xl overflow-hidden mb-4 border border-slate-100 dark:border-slate-700">
                    <img src={post.image_url} alt="Post content" className="w-full h-auto" />
                  </div>
                )}

                <div className="flex items-center gap-6 pt-4 border-t border-slate-50 dark:border-slate-700">
                  <button 
                    onClick={() => handleLike(post.id, post.likes_count)}
                    className="flex items-center gap-2 text-slate-500 hover:text-rose-500 transition-colors"
                  >
                    <Heart size={18} fill={post.likes_count > 0 ? 'currentColor' : 'none'} className={post.likes_count > 0 ? 'text-rose-500' : ''} />
                    <span className="text-xs font-bold">{post.likes_count}</span>
                  </button>
                  <button 
                    onClick={() => toggleComments(post.id)}
                    className={`flex items-center gap-2 transition-colors ${activeComments === post.id ? 'text-amber-500' : 'text-slate-500 hover:text-blue-500'}`}
                  >
                    <MessageCircle size={18} />
                    <span className="text-xs font-bold">{post.comments_count}</span>
                  </button>
                  <button className="flex items-center gap-2 text-slate-500 hover:text-emerald-500 transition-colors ml-auto">
                    <Share2 size={18} />
                  </button>
                </div>

                {activeComments === post.id && (
                  <div className="mt-6 pt-6 border-t border-slate-50 dark:border-slate-700 space-y-4">
                    {/* Comment List */}
                    <div className="space-y-4">
                      {comments[post.id]?.map((comment) => (
                        <div key={comment.id} className="flex gap-3">
                          <div className="w-8 h-8 rounded-full overflow-hidden border border-slate-100 flex-shrink-0">
                            <img src={comment.author_avatar || `https://ui-avatars.com/api/?name=${comment.author_name}&background=random`} alt={comment.author_name} />
                          </div>
                          <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-3 flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <h5 className="text-[11px] font-black text-slate-900 dark:text-white">{comment.author_name}</h5>
                              <span className="text-[9px] font-bold text-slate-400">{formatDistanceToNow(new Date(comment.created_at), { addSuffix: true, locale: ptBR })}</span>
                            </div>
                            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                              {comment.content}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* New Comment Input */}
                    <div className="flex gap-3 pt-2">
                      <div className="w-8 h-8 rounded-full overflow-hidden border border-slate-100 flex-shrink-0">
                        <img src={user ? `https://ui-avatars.com/api/?name=${user.name}&background=random` : ""} alt="Me" />
                      </div>
                      <div className="flex-1 relative">
                        <textarea 
                          value={newCommentContent[post.id] || ''}
                          onChange={(e) => setNewCommentContent(prev => ({ ...prev, [post.id]: e.target.value }))}
                          placeholder="Escreva sua resposta..."
                          className="w-full bg-slate-50 dark:bg-slate-900/50 border-none rounded-xl p-3 pr-12 text-xs font-medium focus:ring-2 focus:ring-amber-500/20 outline-none resize-none transition-all h-10"
                        />
                        <button 
                          onClick={() => handleCommentSubmit(post.id)}
                          disabled={!newCommentContent[post.id]?.trim() || !!submittingComment}
                          className="absolute right-2 bottom-1.5 p-1 text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-all disabled:opacity-50"
                        >
                          {submittingComment === post.id ? <Loader2 size={16} className="animate-spin" /> : <MessageCircle size={16} />}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};
