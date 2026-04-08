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
  MapPin,
  Phone,
  Vote,
  Building2
} from 'lucide-react';

export type UserRole = 'resident' | 'admin' | 'syndic' | 'global_admin';
export type PricingPlan = 'basic' | 'professional' | 'premium';

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
  { id: 'moradores', label: 'Moradores', icon: Users, color: 'bg-emerald-600', category: 'social', roles: ['resident', 'admin', 'syndic', 'global_admin'], plans: ['basic', 'professional', 'premium'] },
  { id: 'boletos', label: 'Financeiro', icon: CreditCard, color: 'bg-emerald-500', category: 'financial', roles: ['resident', 'admin', 'syndic', 'global_admin'], plans: ['professional', 'premium'] },
  { id: 'comunicados', label: 'Mensagens', icon: MessageSquare, color: 'bg-blue-500', category: 'communication', roles: ['resident', 'admin', 'syndic', 'global_admin'], plans: ['basic', 'professional', 'premium'] },
  { id: 'reservas', label: 'Reservas', icon: Calendar, color: 'bg-purple-500', category: 'operations', roles: ['resident', 'admin', 'syndic', 'global_admin'], plans: ['professional', 'premium'] },
  { id: 'ocorrencias', label: 'Ocorrências', icon: ShieldAlert, color: 'bg-red-500', category: 'communication', roles: ['resident', 'admin', 'syndic', 'global_admin'], plans: ['basic', 'professional', 'premium'] },
  { id: 'pets', label: 'Meus Pets', icon: Dog, color: 'bg-rose-500', category: 'social', roles: ['resident', 'admin', 'syndic', 'global_admin'], plans: ['professional', 'premium'] },
  { id: 'encomendas', label: 'Encomendas', icon: Package, color: 'bg-orange-600', category: 'operations', roles: ['resident', 'admin', 'syndic', 'global_admin'], plans: ['basic', 'professional', 'premium'] },
  { id: 'visitantes', label: 'Visitantes', icon: UserPlus, color: 'bg-sky-500', category: 'operations', roles: ['resident', 'admin', 'syndic', 'global_admin'], plans: ['basic', 'professional', 'premium'] },
  { id: 'documentos', label: 'Documentos', icon: FileText, color: 'bg-slate-600', category: 'operations', roles: ['resident', 'admin', 'syndic', 'global_admin'], plans: ['basic', 'professional', 'premium'] },
  { id: 'classificados', label: 'Classificados', icon: ShoppingCart, color: 'bg-indigo-500', category: 'social', roles: ['resident', 'admin', 'syndic', 'global_admin'], plans: ['professional', 'premium'] },
  { id: 'garagem', label: 'Garagem', icon: Car, color: 'bg-zinc-700', category: 'social', roles: ['resident', 'admin', 'syndic', 'global_admin'], plans: ['professional', 'premium'] },
  { id: 'telefones', label: 'Telefones', icon: Phone, color: 'bg-cyan-600', category: 'communication', roles: ['resident', 'admin', 'syndic', 'global_admin'], plans: ['basic', 'professional', 'premium'] },
  { id: 'assembleias', label: 'Assembleias', icon: Vote, color: 'bg-teal-500', category: 'social', roles: ['resident', 'admin', 'syndic', 'global_admin'], plans: ['basic', 'professional', 'premium'] },
  { id: 'manutencao', label: 'Manutenção', icon: Wrench, color: 'bg-amber-600', category: 'operations', roles: ['resident', 'admin', 'syndic', 'global_admin'], plans: ['basic', 'professional', 'premium'] },
  { id: 'condominios', label: 'Condomínios', icon: Building2, color: 'bg-blue-700', category: 'operations', roles: ['global_admin'], plans: ['basic', 'professional', 'premium'] },
];

export const PLANS = [
  { id: 'basic', name: 'Essencial', price: '299', features: 'Funções essenciais' },
  { id: 'professional', name: 'Profissional', price: '399', features: 'Gestão completa' },
  { id: 'premium', name: 'Premium', price: '599', features: 'Todas as funções + Suporte dedicado' },
];
