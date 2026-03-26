import React from 'react';
import { motion } from 'motion/react';
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
  Linkedin
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
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

const PricingCard = ({ title, price, features, highlighted = false, delay = 0 }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay }}
    className={`p-10 rounded-[2.5rem] border ${
      highlighted 
        ? 'bg-blue-600 border-blue-400 shadow-[0_32px_64px_-16px_rgba(59,130,246,0.3)]' 
        : 'bg-slate-900/50 border-white/5 backdrop-blur-sm shadow-xl'
    } relative flex flex-col h-full`}
  >
    {highlighted && (
      <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-white text-blue-600 text-[10px] font-black uppercase tracking-widest rounded-full">
        Mais Popular
      </div>
    )}
    <h3 className={`text-xl font-black mb-2 ${highlighted ? 'text-white' : 'text-slate-100'}`}>{title}</h3>
    <div className="flex items-baseline gap-1 mb-6">
      <span className={`text-4xl font-black ${highlighted ? 'text-white' : 'text-slate-100'}`}>R${price}</span>
      <span className={highlighted ? 'text-blue-100' : 'text-slate-500'}>/mês</span>
    </div>
    <div className="space-y-4 mb-8 flex-grow">
      {features.map((feature: string, i: number) => (
        <div key={i} className="flex items-center gap-3">
          <div className={`p-1 rounded-full ${highlighted ? 'bg-white/20 text-white' : 'bg-blue-500/20 text-blue-400'}`}>
            <Check size={12} />
          </div>
          <span className={`text-sm ${highlighted ? 'text-blue-50' : 'text-slate-400'}`}>{feature}</span>
        </div>
      ))}
    </div>
    <button className={`w-full py-4 rounded-2xl font-bold transition-all ${
      highlighted 
        ? 'bg-white text-blue-600 hover:shadow-lg hover:scale-[1.02]' 
        : 'bg-blue-600 text-white hover:bg-blue-500'
    }`}>
      Começar agora
    </button>
  </motion.div>
);

export const LandingPage: React.FC<{ setUser?: (user: any) => void }> = ({ setUser }) => {
  const navigate = useNavigate();

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
      quote: "Mudou completamente a dinâmica do nosso prédio. A transparência financeira e a facilidade de reservar o salão de festas são os pontos altos.",
      author: "Ricardo Silveira",
      role: "Síndico Executivo",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ricardo"
    },
    {
      quote: "Como morador, me sinto muito mais seguro e informado. Receber notificações de encomendas no celular é uma praticidade sem volta.",
      author: "Juliana Mendes",
      role: "Moradora Bloco B",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Juliana"
    },
    {
      quote: "O suporte é impecável e a plataforma é extremamente rápida. Reduzimos a inadimplência em 40% nos primeiros seis meses.",
      author: "Carlos Alberto",
      role: "Administrador de Condomínios",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos"
    }
  ];

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
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-3 px-4 py-2 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10"
            >
              <div className="w-12 h-12 rounded-xl overflow-hidden border border-white/20 bg-white/5 flex items-center justify-center">
                <img src="/AICondo1_L.fw.png" alt="Logo" className="w-full h-full object-contain" />
              </div>
              <span className="text-sm font-black text-white tracking-widest uppercase">AiCondo<span className="text-blue-500">360</span></span>
            </motion.div>

            <div className="space-y-6">
              <motion.h1 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-5xl md:text-7xl font-black text-white leading-[0.95] tracking-tighter"
              >
                Inteligência <br />
                que Transforma a <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-blue-600 animate-gradient">Vila em Família</span>
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
                {[1,2,3,4].map(i => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-slate-950 bg-slate-800 overflow-hidden shadow-xl">
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=user${i}`} alt="user" />
                  </div>
                ))}
              </div>
              <div>
                <p className="text-white font-bold">+500 Condomínios</p>
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
              Sua gestão, em <span className="text-blue-500">outro patamar.</span>
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
      <section className="py-32 bg-slate-900/30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-8 pr-12">
              <span className="text-blue-500 font-black text-xs uppercase tracking-[0.3em]">DEPOIMENTOS</span>
              <h2 className="text-4xl font-black text-white leading-tight tracking-tight">O que dizem quem já vive o <span className="text-blue-500">Futuro.</span></h2>
              <p className="text-slate-400 font-medium">Histórias reais de transformação digital em condomínios de todo o país.</p>
              <div className="flex items-center gap-4 text-white">
                <div className="flex text-yellow-500">
                  {[1,2,3,4,5].map(i => <Check key={i} size={16} />)}
                </div>
                <span className="font-bold">4.9/5 nas avaliações</span>
              </div>
            </div>
            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8">
              {testimonials.map((t, i) => (
                <TestimonialCard key={i} {...t} delay={i * 0.2} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-32" id="pricing">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-24 space-y-4">
            <span className="text-blue-500 font-black text-xs uppercase tracking-[0.3em]">Investimento</span>
            <h2 className="text-4xl font-black text-white tracking-tight">Planos que acompanham seu <span className="text-blue-500">Crescimento.</span></h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-center">
            <PricingCard 
              title="Basic" 
              price="199,00" 
              features={["Até 50 unidades", "Gestão de moradores", "Mural digital", "Suporte email"]} 
              delay={0.1}
            />
            <PricingCard 
              title="Enterprise" 
              price="299,00" 
              features={["Unidades ilimitadas", "Boletos automáticos", "Assembleias virtuais", "Suporte 24/7", "App Personalizado"]} 
              highlighted={true}
              delay={0.2}
            />
            <PricingCard 
              title="Premium" 
              price="499,99" 
              features={["Customização total", "API aberta", "Integração hardware", "Gerente de conta", "Treinamento presencial"]} 
              delay={0.3}
            />
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[4rem] p-12 md:p-20 relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-48 -mt-48 blur-3xl animate-pulse" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full -ml-32 -mb-32 blur-2xl" />
            
            <div className="relative z-10 max-w-2xl">
              <h2 className="text-4xl md:text-5xl font-black text-white mb-8 tracking-tight">Pronto para a <br /> Revolução 360º?</h2>
              <p className="text-blue-50 text-xl mb-12 font-medium opacity-90">Agende uma demonstração gratuita com nossos especialistas e descubra como podemos ajudar seu condomínio.</p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button className="px-10 py-5 bg-white text-blue-600 font-bold rounded-2xl hover:bg-blue-50 transition-all flex items-center justify-center gap-3 shadow-xl">
                  Agende sua Demo
                  <ArrowRight size={20} />
                </button>
                <button className="px-10 py-5 bg-blue-700/50 text-white font-bold rounded-2xl border border-white/20 hover:bg-blue-700/70 transition-all">
                  Falar com Comercial
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-white/5 pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
            <div className="space-y-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                  <img src="/AICondo1_L.fw.png" alt="Logo" className="w-7 h-7 object-contain" />
                </div>
                <span className="text-lg font-black text-white tracking-widest uppercase">AiCondo<span className="text-blue-500">360</span></span>
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
              <h4 className="text-white font-bold mb-8">Contato</h4>
              <ul className="space-y-6">
                <li className="flex items-start gap-3">
                  <Mail size={18} className="text-blue-500 shrink-0" />
                  <span className="text-slate-500 text-sm">contato@aicondo360.com.br</span>
                </li>
                <li className="flex items-start gap-3">
                  <Phone size={18} className="text-blue-500 shrink-0" />
                  <span className="text-slate-500 text-sm">(11) 4004-3600</span>
                </li>
                <li className="flex items-start gap-3">
                  <MapPin size={18} className="text-blue-500 shrink-0" />
                  <span className="text-slate-500 text-sm">Av. Paulista, 1000 - São Paulo, SP</span>
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
    </div>
  );
};

