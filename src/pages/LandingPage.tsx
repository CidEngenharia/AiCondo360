import React from 'react';
import { motion } from 'motion/react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Building2,
  Shield,
  Zap,
  Globe,
  Check,
  ArrowRight,
  Users,
  MessageSquare,
  Calendar,
  Package,
  CreditCard,
  Mail,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  ChevronUp,
  X
} from 'lucide-react';
import { LoginForm } from '../components/LoginForm';

const FeatureCard = ({ icon: Icon, title, description, delay = 0 }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay }}
    className="p-8 rounded-[2rem] bg-slate-900/50 backdrop-blur-xl border border-white/5 hover:border-blue-500/30 transition-all group"
  >
    <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400 mb-6 group-hover:scale-110 transition-transform">
      <Icon size={28} />
    </div>
    <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
    <p className="text-slate-400 leading-relaxed">{description}</p>
  </motion.div>
);

const TestimonialCard = ({ quote, author, role, avatar, delay = 0 }: any) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    whileInView={{ opacity: 1, scale: 1 }}
    viewport={{ once: true }}
    transition={{ delay }}
    className="p-8 rounded-[2.5rem] bg-gradient-to-br from-slate-900 to-slate-950 border border-white/5 relative overflow-hidden"
  >
    <div className="absolute top-0 right-0 p-8 text-6xl font-serif text-blue-500/10 transition-colors">"</div>
    <p className="text-slate-300 leading-relaxed mb-8 relative z-10 italic">"{quote}"</p>
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 rounded-full bg-slate-800 border-2 border-blue-500/20 overflow-hidden">
        <img src={avatar} alt={author} className="w-full h-full object-cover" />
      </div>
      <div>
        <h4 className="text-sm font-bold text-white">{author}</h4>
        <p className="text-xs text-slate-500">{role}</p>
      </div>
    </div>
  </motion.div>
);

const Modal = ({ isOpen, onClose, children }: any) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative bg-slate-900 border border-white/10 rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-2xl"
      >
        <button onClick={onClose} className="absolute top-6 right-6 p-2 text-slate-400 hover:text-white transition-colors">
          <X size={20} />
        </button>
        {children}
      </motion.div>
    </div>
  );
};

const PricingCard = ({ title, price, features, highlighted = false, delay = 0, variant = "slate", stripeLink }: any) => {
  const getVariantStyles = () => {
    switch (variant) {
      case "plan-light": // Essencial
        return "bg-gradient-to-br from-blue-400 to-indigo-500 border-blue-300 shadow-[0_32px_64px_-16px_rgba(96,165,250,0.3)]";
      case "plan-medium": // Profissional
        return "bg-gradient-to-br from-blue-600 to-indigo-800 border-lime-400 shadow-[0_32px_64px_-16px_rgba(59,130,246,0.4)] scale-105 z-10";
      case "plan-dark": // Premium
        return "bg-gradient-to-br from-indigo-900 to-slate-950 border-white/5 shadow-2xl";
      default:
        return "bg-slate-900/50 border-white/5 backdrop-blur-sm shadow-xl";
    }
  };

  const isLightVersion = variant === "plan-light"; // Lightest variant, use clean text

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay }}
      className={`p-10 rounded-[2.5rem] border ${getVariantStyles()} relative flex flex-col h-full`}
    >
      {highlighted && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 font-black uppercase tracking-widest rounded-full text-[10px] bg-white text-blue-600">
          Mais Popular
        </div>
      )}
      <h3 className="text-xl font-black mb-2 text-white">{title}</h3>
      <div className="flex items-baseline gap-1 mb-6">
        <span className="text-4xl font-black text-white">R${price}</span>
        <span className="text-blue-50/70">/mês</span>
      </div>
      <div className="space-y-4 mb-4 flex-grow">
        {features.map((feature: string, i: number) => {
          const isDenied = feature.startsWith('no:');
          const cleanFeature = isDenied ? feature.replace('no:', '') : feature;
          return (
            <div key={i} className="flex items-center gap-3">
              <div className={`p-1 rounded-full ${isDenied ? 'bg-red-500/20 text-red-100' : 'bg-white/20 text-white'}`}>
                {isDenied ? <X size={10} /> : <Check size={12} />}
              </div>
              <span className={`text-sm text-white font-normal ${isDenied ? 'line-through decoration-red-500 decoration-2' : ''}`}>
                {cleanFeature}
              </span>
            </div>
          );
        })}
      </div>
      <button 
        onClick={() => stripeLink && window.open(stripeLink, '_blank')}
        className={`w-full py-4 rounded-2xl font-bold transition-all ${
          isLightVersion 
            ? 'bg-white text-blue-600 hover:shadow-lg hover:scale-[1.02]' 
            : 'bg-blue-600 text-white hover:bg-blue-500'
        }`}>
        Começar agora
      </button>
    </motion.div>
  );
};

export const LandingPage: React.FC<{ setUser?: (user: any) => void }> = ({ setUser }) => {
  const navigate = useNavigate();
  const [isDemoModalOpen, setIsDemoModalOpen] = React.useState(false);

  const mainFeatures = [
    { icon: Building2, title: "Gestão Unificada", description: "Controle total de unidades, moradores e veículos em uma única interface intuitiva." },
    { icon: Shield, title: "Segurança 360", description: "Monitoramento de acesso, chaves digitais e controle rigoroso de visitantes e entregas." },
    { icon: CreditCard, title: "Financeiro Ágil", description: "Emissão automática de boletos, controle de inadimplência e prestação de contas transparente." },
    { icon: MessageSquare, title: "Comunicação Eficiente", description: "Mural digital, comunicados push e assembleias virtuais para engajamento real." },
    { icon: Calendar, title: "Reservas Online", description: "Agendamento simples de áreas comuns com controle automático de regras e horários." },
    { icon: Package, title: "Gestão de Encomendas", description: "Notificações automáticas para moradores e controle seguro na portaria." }
  ];

  const testimonials = [
    {
      quote: "O suporte é extremamente eficaz, o plano Premium reduziu meu trabalho em 70% com as automações na Gestão do Condomínio, hoje não sei o que seria de mim sem essa plataforma aqui no Condomínio.",
      author: "Carlos Alberto",
      role: "Administrador de Condomínios",
      avatar: "/avatars/avatar3.png"
    },
    {
      quote: "A plataforma transformou nossa inadimplência. O controle é total e a paz voltou ao condomínio com as prestações de contas transparentes.",
      author: "Paulo Matiaso",
      role: "Administrador de Condomínios",
      avatar: "/avatars/avatar4.png"
    }
  ];

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="bg-slate-950 min-h-screen selection:bg-blue-500/30">
      {/* Hero & Login Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 pb-12 overflow-hidden">
        {/* Background Background */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-[60s] scale-110 animate-slow-zoom"
          style={{ backgroundImage: 'url("/bg-home-hero.png")' }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/90 via-slate-950/60 to-slate-950" />
        <div className="absolute inset-0 backdrop-blur-[1px]" />

        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          {/* Left: Branding & Message */}
          <div className="space-y-12">
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex flex-col items-start w-fit"
              >
                <img
                  src="/AICondo_Full_v2.png"
                  alt="Logo AiCondo360"
                  className="h-20 md:h-[100px] w-auto object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-500 ml-2"
                />
              </motion.div>
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-5xl md:text-7xl font-black text-white leading-[0.95] tracking-tighter"
              >
                Inteligência <br />
                que Transforma <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-blue-600 animate-gradient">Condomínios em Família</span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-lg text-slate-400 max-w-lg leading-relaxed font-medium"
              >
                A plataforma definitiva para gestão condominial moderna. Automatize tarefas, aumente a segurança e conecte pessoas com tecnologia de ponta.
              </motion.p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex items-center gap-8"
            >
              <div className="flex -space-x-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-slate-950 bg-slate-800 overflow-hidden shadow-xl">
                    <img src={`/avatars/avatar${i}.png`} alt="user" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
              <div>
                <p className="text-white font-bold">+500 Moradores</p>
                <p className="text-slate-500 text-xs">Transformando a gestão no Brasil</p>
              </div>
            </motion.div>
          </div>

          {/* Right: Login Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, rotateY: -10 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            transition={{ duration: 0.8, ease: "circOut" }}
            className="lg:justify-self-end w-full max-w-[440px]"
          >
            <div className="bg-white dark:bg-slate-900 border border-white/20 dark:border-slate-800 rounded-[3rem] p-10 shadow-[0_64px_96px_-16px_rgba(0,0,0,0.6)] backdrop-blur-2xl">
              <LoginForm setUser={setUser} />
              <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800 text-center space-y-4">
                <p className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest">Acesso Síndico & Administrador</p>
                <button
                  onClick={() => navigate('/admin-exclusivo')}
                  className="w-full py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-bold text-sm hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Shield size={16} className="text-blue-500" />
                  Painel de Gestão Avançada
                </button>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 text-slate-500"
        >
          <div className="w-6 h-10 border-2 border-slate-700 rounded-full flex justify-center p-1">
            <div className="w-1 h-2 bg-blue-500 rounded-full" />
          </div>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section className="py-32 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-24 space-y-4">
            <motion.span
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-blue-500 font-black text-xs uppercase tracking-[0.3em]"
            >
              Funcionalidades 360
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl font-black text-white tracking-tight"
            >
              Abrangência que alcançam <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-blue-600 animate-gradient">todas as áreas.</span>
            </motion.h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {mainFeatures.map((feature, i) => (
              <FeatureCard key={i} {...feature} delay={i * 0.1} />
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="pt-20 pb-32 bg-slate-900/30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12 space-y-4">
            <span className="text-blue-500 font-black text-xs uppercase tracking-[0.3em]">DEPOIMENTOS</span>
            <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight">O que dizem quem já vive o <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-blue-600 animate-gradient">Futuro.</span></h2>
            <p className="text-slate-400 font-medium max-w-2xl mx-auto">Histórias reais de transformação digital em condomínios de todo o país.</p>
            <div className="flex items-center justify-center gap-4 text-white">
              <div className="flex text-yellow-500">
                {[1, 2, 3, 4, 5].map(i => <Check key={i} size={16} />)}
              </div>
              <span className="font-bold">4.9/5 nas avaliações</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {testimonials.map((t, i) => (
              <TestimonialCard key={i} {...t} delay={i * 0.2} />
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="pt-20 pb-32" id="pricing">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16 space-y-2">
            <span className="text-blue-500 font-black text-xs uppercase tracking-[0.3em]">Investimento</span>
            <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight">Planos que acompanham seu <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-blue-600 animate-gradient">Crescimento.</span></h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-center lg:px-4">
            <PricingCard
              title="Essencial"
              price="299,00"
              features={[
                "Condomínios Pequenos", 
                "Gestão de moradores simples", 
                "Mural digital", 
                "Suporte email",
                "no:Gestão de Encomendas",
                "no:Gestão de garagem",
                "no:Dashboard inteligente"
              ]}
              variant="plan-light"
              stripeLink="https://buy.stripe.com/00w28kfhd9Vq1nc3a2f3a0f"
              delay={0.1}
            />
            <PricingCard
              title="Profissional"
              price="399,00"
              features={[
                "Até 50 unidades", 
                "Gestão de Boletos", 
                "Assembleias virtuais", 
                "Suporte 24/7", 
                "Gestão Global Inteligente"
              ]}
              highlighted={true}
              variant="plan-medium"
              stripeLink="https://buy.stripe.com/bJedR20mj6Jec1QaCuf3a0d"
              delay={0.2}
            />
            <PricingCard
              title="Premium"
              price="599,00"
              features={[
                "50+ unidades", 
                "Gestão de Boletos",
                "Gestão de Garagem",
                "Gestão de Encomendas Inteligente",
                "Marketplace Interno",
                "Assembleias virtuais", 
                "Suporte 24/7"
              ]}
              variant="plan-dark"
              stripeLink="https://buy.stripe.com/dRmcMYc514B63vkaCuf3a0e"
              delay={0.3}
            />
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-32 relative overflow-hidden bg-slate-950">
        <div className="absolute inset-0 bg-gradient-to-b from-[#1a2b4b] to-[#0f172a]" />
        <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_50%_-30%,rgba(59,130,246,0.5),transparent)]" />
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center max-w-4xl mx-auto space-y-12 py-12">
            <h2 className="text-4xl md:text-6xl font-black tracking-tight leading-tight">
              <span className="text-white">Pronto para a </span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-blue-600 animate-gradient">Revolução 360º?</span>
            </h2>
            <p className="text-blue-100/80 text-xl font-medium max-w-2xl mx-auto leading-relaxed">
              Agende uma demonstração gratuita com nossos especialistas e transforme sua gestão.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center pt-8">
              <button
                onClick={() => setIsDemoModalOpen(true)}
                className="px-12 py-5 bg-white text-[#0f172a] font-black rounded-full hover:bg-blue-50 transition-all flex items-center justify-center gap-3 shadow-[0_20px_50px_rgba(59,130,246,0.3)] hover:scale-105 active:scale-95"
              >
                Agende sua Demo
                <ArrowRight size={20} />
              </button>
              <button
                onClick={() => window.open('https://wa.me/5571984184782', '_blank')}
                className="px-12 py-5 bg-blue-600/20 text-white font-bold rounded-full border border-white/20 hover:bg-blue-600/40 backdrop-blur-md transition-all shadow-xl hover:scale-105 active:scale-95"
              >
                Falar com Comercial
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Selection Modal */}
      <Modal isOpen={isDemoModalOpen} onClose={() => setIsDemoModalOpen(false)}>
        <div className="p-8 md:p-10">
          <h3 className="text-2xl font-black text-white mb-2">Solicitar Orçamento</h3>
          <p className="text-slate-400 text-sm mb-8">Preencha os dados abaixo e entraremos em contato.</p>

          <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); alert('Solicitação enviada com sucesso!'); setIsDemoModalOpen(false); }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">E-mail</label>
                <input type="email" required className="w-full bg-slate-800 border border-white/5 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none transition-colors" placeholder="seu@email.com" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Telefone</label>
                <input type="tel" required className="w-full bg-slate-800 border border-white/5 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none transition-colors" placeholder="(00) 00000-0000" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Quantos moradores tem no condomínio?</label>
              <select required className="w-full bg-slate-800 border border-white/5 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none transition-colors appearance-none">
                <option value="">Selecione...</option>
                <option value="1-50">Até 50 unidades</option>
                <option value="51-150">51 a 150 unidades</option>
                <option value="151-300">151 a 300 unidades</option>
                <option value="300+">Acima de 300 unidades</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Funcionalidade mais desejada?</label>
              <select required className="w-full bg-slate-800 border border-white/5 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none transition-colors appearance-none">
                <option value="">Selecione...</option>
                <option value="financeiro">Gestão Financeira</option>
                <option value="seguranca">Segurança e Acesso</option>
                <option value="comunicacao">Comunicação e Mural</option>
                <option value="encomendas">Controle de Encomendas</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Principal problema enfrentado?</label>
              <textarea rows={2} required className="w-full bg-slate-800 border border-white/5 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none transition-colors resize-none" placeholder="Ex: Inadimplência, falta de organização..." />
            </div>

            <button type="submit" className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-500/20">
              Solicitar Orçamento
            </button>
          </form>
        </div>
      </Modal>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-white/5 pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
            <div className="space-y-8">
              <div className="flex items-center mb-8">
                <img src="/AICondo_Full_v2.png" alt="Logo AiCondo360" className="h-28 md:h-36 w-auto object-contain hover:scale-110 transition-transform drop-shadow-xl" />
              </div>
              <p className="text-slate-500 text-sm leading-relaxed">Software de gestão inteligente que conecta síndicos e moradores em uma experiência 360º.</p>
              <div className="flex gap-4">
                <a href="#" className="p-2 rounded-lg bg-slate-900 text-slate-400 hover:text-blue-500 transition-colors"><Facebook size={18} /></a>
                <a href="#" className="p-2 rounded-lg bg-slate-900 text-slate-400 hover:text-blue-500 transition-colors"><Twitter size={18} /></a>
                <a href="#" className="p-2 rounded-lg bg-slate-900 text-slate-400 hover:text-blue-500 transition-colors"><Instagram size={18} /></a>
                <a href="#" className="p-2 rounded-lg bg-slate-900 text-slate-400 hover:text-blue-500 transition-colors"><Linkedin size={18} /></a>
              </div>
            </div>

            <div>
              <h4 className="text-white font-bold mb-8">Plataforma</h4>
              <ul className="space-y-4">
                <li><a href="#" className="text-slate-500 text-sm hover:text-white transition-colors">Funcionalidades</a></li>
                <li><a href="#" className="text-slate-500 text-sm hover:text-white transition-colors">Segurança</a></li>
                <li><a href="#" className="text-slate-500 text-sm hover:text-white transition-colors">Planos</a></li>
                <li><a href="#" className="text-slate-500 text-sm hover:text-white transition-colors">Suporte</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold mb-8">Empresa</h4>
              <ul className="space-y-4">
                <li><a href="#" className="text-slate-500 text-sm hover:text-white transition-colors">Sobre Nós</a></li>
                <li><a href="#" className="text-slate-500 text-sm hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="text-slate-500 text-sm hover:text-white transition-colors">Carreiras</a></li>
                <li><a href="#" className="text-slate-500 text-sm hover:text-white transition-colors">Termos de Uso</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold mb-8 flex items-center justify-between">
                Contato
                <button
                  onClick={scrollToTop}
                  className="p-2 rounded-full bg-slate-900 border border-white/5 text-blue-500 hover:bg-slate-800 transition-all"
                  aria-label="Voltar para o topo"
                >
                  <ChevronUp size={20} />
                </button>
              </h4>
              <ul className="space-y-6">
                <li className="flex items-start gap-3">
                  <Mail size={18} className="text-blue-500 shrink-0 mt-0.5" />
                  <a href="mailto:cidengenharia@gmail.com" className="text-slate-500 text-sm hover:text-white transition-colors">cidengenharia@gmail.com</a>
                </li>
                <li className="flex items-start gap-3">
                  <Phone size={18} className="text-blue-500 shrink-0 mt-0.5" />
                  <a href="https://wa.me/5571984184782" target="_blank" rel="noopener noreferrer" className="text-slate-500 text-sm hover:text-white transition-colors">(71) 984184782</a>
                </li>
                <li className="flex items-start gap-3">
                  <MapPin size={18} className="text-blue-500 shrink-0 mt-0.5" />
                  <span className="text-slate-500 text-sm">Cajazeiras - Salvador, BA</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-slate-600 text-xs">© 2024 AiCondo360 - Cid Engenharia. Todos os direitos reservados.</p>
            <div className="flex gap-8">
              <a href="#" className="text-slate-600 text-xs hover:text-white transition-colors">Privacidade</a>
              <a href="#" className="text-slate-600 text-xs hover:text-white transition-colors">Cookies</a>
              <a href="#" className="text-slate-600 text-xs hover:text-white transition-colors">Status</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating WhatsApp Button */}
      <a
        href="https://wa.me/5571984184782"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 w-14 h-14 bg-[#25D366] text-white rounded-full flex items-center justify-center shadow-[0_8px_30px_rgb(37,211,102,0.4)] hover:scale-110 active:scale-95 transition-all z-50 group border-2 border-transparent hover:border-white/20"
        aria-label="Fale conosco no WhatsApp"
      >
        <svg viewBox="0 0 24 24" className="w-8 h-8 fill-current drop-shadow-md" xmlns="http://www.w3.org/2000/svg">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.888-.788-1.489-1.761-1.663-2.06-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
        </svg>
      </a>
    </div>
  );
};

