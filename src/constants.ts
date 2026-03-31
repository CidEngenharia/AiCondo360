import { 
  Package, 
  FileText, 
  Calendar, 
  MessageSquare, 
  Megaphone, 
  ShieldAlert, 
  Wrench, 
  ShoppingCart, 
  Users, 
  Dog, 
  Car, 
  CreditCard, 
  Search, 
  LayoutDashboard,
  ClipboardList,
  BarChart3,
  UserPlus,
  Handshake,
  MapPin,
  Phone,
  Vote
} from 'lucide-react';

export type UserRole = 'resident' | 'admin' | 'syndic' | 'global_admin';
export type PricingPlan = 'basic' | 'enterprise' | 'premium';

export interface Feature {
  id: string;
  label: string;
  icon: any;
  color: string;
  category: 'communication' | 'financial' | 'operations' | 'social';
  roles: UserRole[];
  plans: PricingPlan[];
}

export const FEATURES: Feature[] = [
  { id: 'boletos', label: 'Financeiro', icon: CreditCard, color: 'bg-emerald-500', category: 'financial', roles: ['resident', 'admin', 'syndic'], plans: ['basic', 'enterprise', 'premium'] },
  { id: 'comunicados', label: 'Mensagens', icon: MessageSquare, color: 'bg-blue-500', category: 'communication', roles: ['resident', 'admin', 'syndic'], plans: ['basic', 'enterprise', 'premium'] },
  { id: 'reservas', label: 'Reservas', icon: Calendar, color: 'bg-purple-500', category: 'operations', roles: ['resident', 'admin', 'syndic'], plans: ['basic', 'enterprise', 'premium'] },
  { id: 'ocorrencias', label: 'Ocorrências', icon: ShieldAlert, color: 'bg-red-500', category: 'communication', roles: ['resident', 'admin', 'syndic'], plans: ['basic', 'enterprise', 'premium'] },
  { id: 'pets', label: 'Meus Pets', icon: Dog, color: 'bg-rose-500', category: 'social', roles: ['resident', 'admin', 'syndic'], plans: ['premium'] },
  { id: 'encomendas', label: 'Encomendas', icon: Package, color: 'bg-orange-600', category: 'operations', roles: ['resident', 'admin', 'syndic'], plans: ['enterprise', 'premium'] },
  { id: 'visitantes', label: 'Visitantes', icon: UserPlus, color: 'bg-sky-500', category: 'operations', roles: ['resident', 'admin', 'syndic'], plans: ['enterprise', 'premium'] },
  { id: 'documentos', label: 'Documentos', icon: FileText, color: 'bg-slate-600', category: 'operations', roles: ['resident', 'admin', 'syndic'], plans: ['basic', 'enterprise', 'premium'] },
  { id: 'mercado', label: 'Classificados', icon: ShoppingCart, color: 'bg-indigo-500', category: 'social', roles: ['resident', 'admin', 'syndic'], plans: ['enterprise', 'premium'] },
  { id: 'veiculos', label: 'Garagem', icon: Car, color: 'bg-zinc-700', category: 'social', roles: ['resident', 'admin', 'syndic'], plans: ['enterprise', 'premium'] },
  { id: 'telefones', label: 'Telefones', icon: Phone, color: 'bg-cyan-600', category: 'communication', roles: ['resident', 'admin', 'syndic'], plans: ['basic', 'enterprise', 'premium'] },
  { id: 'assembleias', label: 'Assembleias', icon: Vote, color: 'bg-teal-500', category: 'social', roles: ['resident', 'admin', 'syndic'], plans: ['basic', 'enterprise', 'premium'] },
];

export const PLANS = [
  { id: 'basic', name: 'Basic', price: '199', features: 'Funções básicas' },
  { id: 'enterprise', name: 'Enterprise', price: '250', features: 'Funções intermediárias' },
  { id: 'premium', name: 'Premium', price: '399', features: 'Todas as funções do AiCondo360' },
];
