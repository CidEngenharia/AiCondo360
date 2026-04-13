import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  Star,
  Check,
  X,
  ArrowLeft,
  Building2,
  Shield,
  CreditCard,
  MessageSquare,
  Calendar,
  Package,
  Car,
  Users,
  Bell,
  ShoppingBag,
  Key,
  ThumbsUp,
  Send,
  Share2,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Review {
  id: number;
  name: string;
  avatar: string;
  rating: number;
  date: string;
  text: string;
  helpful: number;
  role: string;
}

interface Screenshot {
  id: number;
  title: string;
  description: string;
  image: string;
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const screenshots: Screenshot[] = [
  {
    id: 1,
    title: 'Dashboard Inteligente',
    description: 'Painel de controle com visão 360° do condomínio em tempo real.',
    image: '/Ai01.jpeg?v=2',
  },
  {
    id: 2,
    title: 'Gestão de Moradores',
    description: 'Cadastro completo de unidades, moradores, veículos e dependentes.',
    image: '/Ai02.jpeg?v=2',
  },
  {
    id: 3,
    title: 'Controle Financeiro',
    description: 'Emissão de boletos, controle de inadimplência e prestação de contas.',
    image: '/Ai03.jpeg?v=2',
  },
  {
    id: 4,
    title: 'Planos & Funcionalidades',
    description: 'Escolha o plano ideal para o tamanho do seu condomínio.',
    image: '/Ai04.jpeg?v=2',
  },
  {
    id: 5,
    title: 'Segurança & Acesso',
    description: 'Portaria virtual, controle de visitantes e chaves digitais integradas.',
    image: '/Ai05.jpeg?v=2',
  },
];

const plans = [
  {
    name: 'Essencial',
    price: '299,00',
    color: 'from-blue-400 to-blue-600',
    border: 'border-blue-500/30',
    glow: 'shadow-blue-500/20',
    tag: null,
    features: [
      { label: 'Condomínios pequenos', ok: true },
      { label: 'Gestão de moradores', ok: true },
      { label: 'Mural digital', ok: true },
      { label: 'Suporte por e-mail', ok: true },
      { label: 'Gestão de Encomendas', ok: false },
      { label: 'Gestão de Garagem', ok: false },
      { label: 'Dashboard Inteligente', ok: false },
    ],
    stripe: 'https://buy.stripe.com/00w28kfhd9Vq1nc3a2f3a0f',
  },
  {
    name: 'Profissional',
    price: '399,00',
    color: 'from-blue-600 to-indigo-700',
    border: 'border-blue-400/50',
    glow: 'shadow-blue-400/30',
    tag: 'Mais Popular',
    features: [
      { label: 'Até 50 unidades', ok: true },
      { label: 'Gestão de Boletos', ok: true },
      { label: 'Assembleias virtuais', ok: true },
      { label: 'Suporte 24/7', ok: true },
      { label: 'Gestão Global Inteligente', ok: true },
      { label: 'Gestão de Garagem', ok: false },
      { label: 'Marketplace Interno', ok: false },
    ],
    stripe: 'https://buy.stripe.com/bJedR20mj6Jec1QaCuf3a0d',
  },
  {
    name: 'Premium',
    price: '599,00',
    color: 'from-indigo-700 to-slate-800',
    border: 'border-indigo-500/30',
    glow: 'shadow-indigo-500/20',
    tag: 'Completo',
    features: [
      { label: '50+ unidades', ok: true },
      { label: 'Gestão de Boletos', ok: true },
      { label: 'Gestão de Garagem', ok: true },
      { label: 'Encomendas Inteligente', ok: true },
      { label: 'Marketplace Interno', ok: true },
      { label: 'Assembleias virtuais', ok: true },
      { label: 'Suporte 24/7', ok: true },
    ],
    stripe: 'https://buy.stripe.com/dRmcMYc514B63vkaCuf3a0e',
  },
];

const initialReviews: Review[] = [
  {
    id: 1,
    name: 'Carlos Alberto',
    avatar: '/avatars/avatar3.png',
    rating: 5,
    date: '12 de abril de 2026',
    text: 'O suporte é extremamente eficaz. O plano Premium reduziu meu trabalho em 70% com as automações na gestão do condomínio. Hoje não sei o que seria sem essa plataforma!',
    helpful: 47,
    role: 'Síndico Profissional',
  },
  {
    id: 2,
    name: 'Paulo Matiaso',
    avatar: '/avatars/avatar4.png',
    rating: 5,
    date: '3 de março de 2026',
    text: 'A plataforma transformou nossa inadimplência. O controle é total e a paz voltou ao condomínio com as prestações de contas transparentes.',
    helpful: 38,
    role: 'Administrador de Condomínios',
  },
  {
    id: 3,
    name: 'Ana Lima',
    avatar: '/avatars/avatar1.png',
    rating: 4,
    date: '28 de fevereiro de 2026',
    text: 'Interface muito intuitiva, fácil de usar mesmo para quem não tem familiaridade com tecnologia. O módulo de visitantes é excelente! Só sinto falta de um app mobile nativo.',
    helpful: 22,
    role: 'Moradora e Sub-síndica',
  },
  {
    id: 4,
    name: 'Roberto Ferreira',
    avatar: '/avatars/avatar2.png',
    rating: 5,
    date: '15 de janeiro de 2026',
    text: 'Gerencio 3 condomínios e o AiCondo360 centralizou tudo. As assembleias virtuais são um diferencial enorme. Recomendo muito o plano Premium!',
    helpful: 61,
    role: 'Gestor Condominial',
  },
];

// ─── Sub-components ────────────────────────────────────────────────────────────

const StarRating: React.FC<{
  value: number;
  onChange?: (v: number) => void;
  size?: number;
  interactive?: boolean;
}> = ({ value, onChange, size = 20, interactive = false }) => {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          onClick={() => onChange?.(star)}
          onMouseEnter={() => interactive && setHovered(star)}
          onMouseLeave={() => interactive && setHovered(0)}
          className={interactive ? 'cursor-pointer transition-transform hover:scale-110' : 'cursor-default'}
          aria-label={`${star} estrelas`}
        >
          <Star
            size={size}
            className={`transition-colors ${
              star <= (hovered || value) ? 'text-yellow-400 fill-yellow-400' : 'text-slate-600'
            }`}
          />
        </button>
      ))}
    </div>
  );
};

const RatingBar: React.FC<{ stars: number; count: number; total: number }> = ({ stars, count, total }) => {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="text-slate-400 w-3 text-right">{stars}</span>
      <Star size={12} className="text-yellow-400 fill-yellow-400 shrink-0" />
      <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1, delay: 0.3 }}
          className="h-full bg-yellow-400 rounded-full"
        />
      </div>
      <span className="text-slate-500 w-6 text-xs">{count}</span>
    </div>
  );
};

// ─── Screenshot Card (real image) ─────────────────────────────────────────────
const ScreenshotCard: React.FC<{ shot: Screenshot; active?: boolean }> = ({ shot, active }) => (
  <div
    className={`relative shrink-0 w-[200px] sm:w-[260px] rounded-[2.5rem] overflow-hidden border transition-all duration-300 cursor-pointer ${
      active ? 'border-blue-500/60 scale-[1.02] shadow-2xl shadow-blue-500/30' : 'border-white/10 hover:border-white/20'
    }`}
  >
    <img
      src={shot.image}
      alt={shot.title}
      className="w-full h-full object-cover"
      style={{ aspectRatio: '9/16' }}
    />
    
    {/* Clean gradient overlay for depth */}
    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-40" />

    {/* Active indicator badge */}
    {active && (
      <motion.div 
        layoutId="active-badge"
        className="absolute top-4 right-4 px-2 py-0.5 rounded-full bg-blue-500 text-[8px] font-black text-white uppercase tracking-tighter"
      >
        Live
      </motion.div>
    )}

    {/* Reflection/Shine effect */}
    <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-transparent pointer-events-none" />
  </div>
);

// ─── Main Page ─────────────────────────────────────────────────────────────────
export const FuncionalidadesPage: React.FC = () => {
  const navigate = useNavigate();
  const carouselRef = useRef<HTMLDivElement>(null);
  const [activeSlide, setActiveSlide] = useState(0);
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReview, setNewReview] = useState({ name: '', role: '', rating: 0, text: '' });
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [helpedIds, setHelpedIds] = useState<Set<number>>(new Set());

  const avgRating = reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;
  const ratingCounts = [5, 4, 3, 2, 1].map((s) => ({ stars: s, count: reviews.filter((r) => r.rating === s).length }));

  // Scroll carousel
  const scrollTo = (index: number) => {
    if (!carouselRef.current) return;
    const card = carouselRef.current.children[index] as HTMLElement;
    if (card) {
      card.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
    setActiveSlide(index);
  };

  const scrollPrev = () => scrollTo(Math.max(0, activeSlide - 1));
  const scrollNext = () => scrollTo(Math.min(screenshots.length - 1, activeSlide + 1));

  // Track scroll position for active dot
  useEffect(() => {
    const el = carouselRef.current;
    if (!el) return;
    const handler = () => {
      const cardWidth = el.scrollWidth / screenshots.length;
      const idx = Math.round(el.scrollLeft / cardWidth);
      setActiveSlide(Math.min(idx, screenshots.length - 1));
    };
    el.addEventListener('scroll', handler, { passive: true });
    return () => el.removeEventListener('scroll', handler);
  }, []);

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReview.rating || !newReview.name.trim() || !newReview.text.trim()) return;
    const review: Review = {
      id: Date.now(),
      name: newReview.name,
      role: newReview.role || 'Usuário AiCondo360',
      avatar: `/avatars/avatar${Math.ceil(Math.random() * 4)}.png`,
      rating: newReview.rating,
      date: new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' }),
      text: newReview.text,
      helpful: 0,
    };
    setReviews((prev) => [review, ...prev]);
    setNewReview({ name: '', role: '', rating: 0, text: '' });
    setShowReviewForm(false);
    setSubmitSuccess(true);
    setTimeout(() => setSubmitSuccess(false), 3000);
  };

  const handleHelpful = (id: number) => {
    if (helpedIds.has(id)) return;
    setHelpedIds((prev) => new Set(prev).add(id));
    setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, helpful: r.helpful + 1 } : r)));
  };

  return (
    <div className="min-h-screen text-white selection:bg-blue-500/30 relative">

      {/* ── Background (igual landing page) ──────────────────────── */}
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url("/bg-home-hero.png")' }}
      />
      <div className="fixed inset-0 bg-gradient-to-b from-slate-950/92 via-slate-950/80 to-slate-950" />
      <div className="fixed inset-0 backdrop-blur-[1px]" />

      {/* ── Content ──────────────────────────────────────────────── */}
      <div className="relative z-10">

        {/* ── Top Nav ─────────────────────────────────────────────── */}
        <header className="sticky top-0 z-50 bg-slate-950/60 backdrop-blur-xl border-b border-white/5">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-xl hover:bg-white/5 text-slate-400 hover:text-white transition-all"
              aria-label="Voltar"
            >
              <ArrowLeft size={20} />
            </button>

            {/* Spacer */}
            <div className="flex-1" />

            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({ title: 'AiCondo360', url: window.location.href });
                } else {
                  navigator.clipboard.writeText(window.location.href);
                }
              }}
              className="p-2 rounded-xl hover:bg-white/5 text-slate-400 hover:text-white transition-all"
              aria-label="Compartilhar"
            >
              <Share2 size={20} />
            </button>
          </div>
        </header>

        <main className="max-w-5xl mx-auto px-4 sm:px-6 pb-20">

          {/* ── Hero App Info ────────────────────────────────────── */}
          <section className="py-8 space-y-5">
            {/* Logo — mesmo tamanho da LandingPage */}
            <motion.img
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              src="/AICondo_Full_v2.png"
              alt="Logo AiCondo360"
              className="h-20 md:h-[100px] w-auto object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-500"
            />

            {/* Action buttons */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-wrap gap-4"
            >
              <button
                onClick={() => navigate('/login')}
                className="px-10 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-full text-base transition-all hover:scale-105 active:scale-95 shadow-xl shadow-blue-600/30"
              >
                Acessar Agora
              </button>
              <a
                href="https://wa.me/5571984184782"
                target="_blank"
                rel="noopener noreferrer"
                className="px-10 py-3.5 bg-white/5 hover:bg-white/10 text-white font-bold rounded-full text-base transition-all border border-white/20 hover:border-white/30"
              >
                Falar com Comercial
              </a>
            </motion.div>

          </section>

          {/* ── Screenshot Carousel ──────────────────────────────── */}
          <section className="py-10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black text-white">Capturas de Tela</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={scrollPrev}
                  disabled={activeSlide === 0}
                  className="w-9 h-9 rounded-full bg-slate-800/80 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-white transition-all border border-white/5"
                  aria-label="Anterior"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  onClick={scrollNext}
                  disabled={activeSlide === screenshots.length - 1}
                  className="w-9 h-9 rounded-full bg-slate-800/80 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-white transition-all border border-white/5"
                  aria-label="Próximo"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>

            {/* Scroll container */}
            <div
              ref={carouselRef}
              className="flex gap-4 overflow-x-auto pb-4 scroll-smooth snap-x snap-mandatory"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {screenshots.map((shot, i) => (
                <div key={shot.id} className="snap-center" onClick={() => setActiveSlide(i)}>
                  <ScreenshotCard shot={shot} active={activeSlide === i} />
                </div>
              ))}
            </div>

            {/* Dot indicators */}
            <div className="flex justify-center gap-1.5 mt-4">
              {screenshots.map((_, i) => (
                <button
                  key={i}
                  onClick={() => scrollTo(i)}
                  aria-label={`Ir para screenshot ${i + 1}`}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === activeSlide ? 'w-6 bg-blue-500' : 'w-1.5 bg-slate-600 hover:bg-slate-400'
                  }`}
                />
              ))}
            </div>

            {/* Active slide description */}
            <motion.div
              key={activeSlide}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-8 text-center max-w-sm mx-auto min-h-[80px]"
            >
              <h3 className="text-xl font-black text-white tracking-tight">{screenshots[activeSlide].title}</h3>
              <p className="text-slate-400 text-sm mt-2 leading-relaxed px-4">
                {screenshots[activeSlide].description}
              </p>
            </motion.div>

            {/* ── Feature Tags (Moved here) ────────────────────────── */}
            <div className="flex flex-wrap justify-center gap-2 py-8 mt-4 border-t border-white/5">
              {[
                { icon: Shield, label: 'Portaria' },
                { icon: CreditCard, label: 'Financeiro' },
                { icon: Bell, label: 'Mensagens' },
                { icon: Calendar, label: 'Reservas' },
                { icon: Package, label: 'Encomendas' },
                { icon: Key, label: 'Acesso' },
                { icon: Car, label: 'Garagem' },
                { icon: ShoppingBag, label: 'Shopping' },
              ].map(({ icon: Icon, label }) => (
                <span
                  key={label}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/60 text-slate-300 text-xs font-bold border border-white/5 backdrop-blur-sm hover:border-blue-500/30 transition-all"
                >
                  <Icon size={14} className="text-blue-400" />
                  {label}
                </span>
              ))}
            </div>
          </section>

          {/* ── Description ──────────────────────────────────────── */}
          <section className="py-8 border-t border-white/5">
            <h2 className="text-lg font-black text-white mb-4">Sobre o AiCondo360</h2>
            <div className="text-slate-400 text-sm leading-relaxed space-y-3">
              <p>
                O <span className="text-white font-semibold">AiCondo360</span> é a plataforma definitiva para gestão
                condominial moderna. Desenvolvida com tecnologia de ponta, responsiva, que se adapta todos os tamanhos de
                dispositivos e que conecta síndicos, administradores e moradores em uma experiência 360° totalmente
                digital.
              </p>
              <p>
                Automatize cobranças, gerencie visitantes, controle encomendas, realize assembleias virtuais e muito
                mais — tudo em um único ambiente seguro e intuitivo.
              </p>
            </div>

            {/* Feature grid quick-view */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-6">
              {[
                { icon: Building2, label: 'Gestão Unificada', desc: 'Tudo em um lugar' },
                { icon: Shield, label: 'Segurança 360°', desc: 'Acesso controlado' },
                { icon: CreditCard, label: 'Financeiro Ágil', desc: 'Boletos automáticos' },
                { icon: MessageSquare, label: 'Comunicação', desc: 'Mural + push' },
                { icon: Calendar, label: 'Reservas', desc: 'Áreas comuns' },
                { icon: Users, label: 'Moradores', desc: 'Cadastro completo' },
              ].map(({ icon: Icon, label, desc }) => (
                <div
                  key={label}
                  className="p-4 rounded-2xl bg-slate-900/60 border border-white/5 hover:border-blue-500/20 transition-colors backdrop-blur-sm"
                >
                  <Icon size={20} className="text-blue-400 mb-2" />
                  <p className="text-white text-xs font-bold">{label}</p>
                  <p className="text-slate-500 text-[10px] mt-0.5">{desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* ── Planos ───────────────────────────────────────────── */}
          <section className="py-8 border-t border-white/5" id="planos">
            <div className="mb-8">
              <span className="text-blue-500 font-black text-xs uppercase tracking-[0.3em]">Investimento</span>
              <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
                Planos que acompanham seu{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">
                  Crescimento
                </span>
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {plans.map((plan, i) => (
                <motion.div
                  key={plan.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className={`relative rounded-3xl border ${plan.border} p-6 flex flex-col shadow-xl ${plan.glow} bg-gradient-to-br ${plan.color}`}
                >
                  {plan.tag && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-white text-blue-700 text-[10px] font-black uppercase tracking-widest shadow-md">
                      {plan.tag}
                    </div>
                  )}

                  <h3 className="text-lg font-black text-white">{plan.name}</h3>
                  <div className="flex items-baseline gap-1 mt-1 mb-5">
                    <span className="text-3xl font-black text-white">R${plan.price}</span>
                    <span className="text-white/60 text-sm">/mês</span>
                  </div>

                  <ul className="space-y-2.5 flex-1 mb-5">
                    {plan.features.map((f) => (
                      <li key={f.label} className="flex items-center gap-2">
                        <div
                          className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${
                            f.ok ? 'bg-white/20' : 'bg-red-500/20'
                          }`}
                        >
                          {f.ok ? (
                            <Check size={10} className="text-white" />
                          ) : (
                            <X size={10} className="text-red-300" />
                          )}
                        </div>
                        <span
                          className={`text-xs font-medium ${
                            f.ok ? 'text-white' : 'text-white/40 line-through decoration-red-400'
                          }`}
                        >
                          {f.label}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <a
                    href={plan.stripe}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full py-3 rounded-2xl bg-white text-blue-700 font-black text-sm text-center hover:bg-blue-50 transition-all hover:scale-[1.02] active:scale-95"
                  >
                    Começar agora
                  </a>
                </motion.div>
              ))}
            </div>
          </section>

          {/* ── Ratings & Reviews ────────────────────────────────── */}
          <section className="py-8 border-t border-white/5" id="avaliacoes">
            <h2 className="text-lg font-black text-white mb-6">Classificações e Avaliações</h2>

            {/* Summary */}
            <div className="flex flex-col sm:flex-row gap-8 mb-8 p-6 rounded-3xl bg-slate-900/50 border border-white/5 backdrop-blur-sm">
              {/* Big number */}
              <div className="flex flex-col items-center justify-center sm:w-40 shrink-0">
                <span className="text-7xl font-black text-white leading-none">{avgRating.toFixed(1)}</span>
                <StarRating value={Math.round(avgRating)} size={20} />
                <span className="text-slate-500 text-xs mt-2">{reviews.length} avaliações</span>
              </div>

              {/* Bars */}
              <div className="flex-1 space-y-2">
                {ratingCounts.map(({ stars, count }) => (
                  <RatingBar key={stars} stars={stars} count={count} total={reviews.length} />
                ))}
              </div>
            </div>

            {/* Submit success toast */}
            <AnimatePresence>
              {submitSuccess && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mb-4 p-4 rounded-2xl bg-green-900/50 border border-green-500/30 text-green-400 text-sm font-medium flex items-center gap-2"
                >
                  <Check size={16} /> Avaliação enviada com sucesso! Obrigado pelo feedback.
                </motion.div>
              )}
            </AnimatePresence>

            {/* Write review button */}
            <button
              onClick={() => setShowReviewForm((v) => !v)}
              className="mb-6 flex items-center gap-2 px-5 py-3 rounded-full bg-blue-600/15 hover:bg-blue-600/25 border border-blue-500/30 text-blue-400 font-bold text-sm transition-all"
            >
              <Star size={16} className="fill-blue-400" />
              {showReviewForm ? 'Cancelar' : 'Escrever uma avaliação'}
            </button>

            {/* Review form */}
            <AnimatePresence>
              {showReviewForm && (
                <motion.form
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  onSubmit={handleSubmitReview}
                  className="mb-8 p-6 rounded-3xl bg-slate-900/70 border border-white/10 overflow-hidden backdrop-blur-sm"
                >
                  <h3 className="text-white font-black mb-5">Sua avaliação</h3>

                  <div className="space-y-4">
                    {/* Star picker */}
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2">
                        Sua nota *
                      </label>
                      <StarRating
                        value={newReview.rating}
                        onChange={(v) => setNewReview((p) => ({ ...p, rating: v }))}
                        size={32}
                        interactive
                      />
                      {newReview.rating > 0 && (
                        <p className="text-blue-400 text-xs mt-1 font-medium">
                          {['', 'Péssimo', 'Ruim', 'Regular', 'Bom', 'Excelente!'][newReview.rating]}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-1.5">
                          Seu nome *
                        </label>
                        <input
                          type="text"
                          required
                          value={newReview.name}
                          onChange={(e) => setNewReview((p) => ({ ...p, name: e.target.value }))}
                          placeholder="Ex: João Silva"
                          className="w-full bg-slate-800 border border-white/5 rounded-xl px-4 py-3 text-white text-sm focus:border-blue-500 outline-none transition-colors placeholder:text-slate-600"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-1.5">
                          Cargo / perfil
                        </label>
                        <input
                          type="text"
                          value={newReview.role}
                          onChange={(e) => setNewReview((p) => ({ ...p, role: e.target.value }))}
                          placeholder="Ex: Síndico, Morador..."
                          className="w-full bg-slate-800 border border-white/5 rounded-xl px-4 py-3 text-white text-sm focus:border-blue-500 outline-none transition-colors placeholder:text-slate-600"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-1.5">
                        Comentário *
                      </label>
                      <textarea
                        required
                        rows={4}
                        value={newReview.text}
                        onChange={(e) => setNewReview((p) => ({ ...p, text: e.target.value }))}
                        placeholder="Conte sua experiência com o AiCondo360..."
                        className="w-full bg-slate-800 border border-white/5 rounded-xl px-4 py-3 text-white text-sm focus:border-blue-500 outline-none transition-colors resize-none placeholder:text-slate-600"
                      />
                    </div>

                    <button
                      type="submit"
                      className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-full text-sm transition-all hover:scale-105 active:scale-95 shadow-lg shadow-blue-600/30"
                    >
                      <Send size={15} />
                      Enviar avaliação
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>

            {/* Review list */}
            <div className="space-y-4">
              {reviews.map((review, i) => (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="p-5 rounded-3xl bg-slate-900/50 border border-white/5 hover:border-white/10 transition-colors backdrop-blur-sm"
                >
                  {/* Header */}
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-slate-800 border-2 border-blue-500/20 overflow-hidden shrink-0">
                      <img
                        src={review.avatar}
                        alt={review.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(review.name)}&background=1e293b&color=60a5fa&bold=true`;
                        }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-white font-bold text-sm truncate">{review.name}</span>
                        <span className="text-slate-600 text-xs shrink-0">{review.date}</span>
                      </div>
                      <p className="text-slate-500 text-xs">{review.role}</p>
                      <div className="mt-1">
                        <StarRating value={review.rating} size={13} />
                      </div>
                    </div>
                  </div>

                  {/* Text */}
                  <p className="text-slate-300 text-sm leading-relaxed">{review.text}</p>

                  {/* Helpful */}
                  <div className="flex items-center gap-3 mt-4">
                    <span className="text-slate-600 text-xs">Você achou isso útil?</span>
                    <button
                      onClick={() => handleHelpful(review.id)}
                      disabled={helpedIds.has(review.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                        helpedIds.has(review.id)
                          ? 'bg-blue-500/15 border-blue-500/30 text-blue-400'
                          : 'bg-slate-800 border-transparent text-slate-400 hover:text-white hover:border-white/10'
                      }`}
                    >
                      <ThumbsUp size={12} />
                      Sim ({review.helpful})
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

          {/* ── CTA Footer ───────────────────────────────────────── */}
          <section className="py-8 mt-4 rounded-3xl bg-gradient-to-br from-blue-900/40 to-indigo-900/30 border border-blue-500/20 text-center px-8 backdrop-blur-sm">
            <h2 className="text-xl sm:text-2xl font-black text-white mb-2">
              Pronto para a gestão inteligente?
            </h2>
            <p className="text-slate-400 text-sm mb-6">
              Comece hoje mesmo e transforme seu condomínio com tecnologia 360°.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => navigate('/login')}
                className="px-8 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-full transition-all hover:scale-105 active:scale-95 shadow-lg shadow-blue-600/30"
              >
                Acessar Plataforma
              </button>
              <a
                href="https://wa.me/5571984184782"
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-3.5 bg-white/5 hover:bg-white/10 text-white font-bold rounded-full border border-white/10 transition-all"
              >
                Falar com Especialista
              </a>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};
