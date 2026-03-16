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
  Phone
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
  { id: 'boletos', label: 'Boletos (2ª via)', icon: CreditCard, color: 'bg-blue-500', category: 'financial', roles: ['resident', 'admin', 'syndic'], plans: ['basic', 'enterprise', 'premium'] },
  { id: 'comunicados', label: 'Comunicados', icon: Megaphone, color: 'bg-orange-500', category: 'communication', roles: ['admin', 'syndic'], plans: ['basic', 'enterprise', 'premium'] },
  { id: 'reservas', label: 'Reservas', icon: Calendar, color: 'bg-purple-500', category: 'operations', roles: ['resident', 'admin', 'syndic'], plans: ['basic', 'enterprise', 'premium'] },
  { id: 'encomendas', label: 'Encomendas', icon: Package, color: 'bg-amber-600', category: 'operations', roles: ['resident', 'admin', 'syndic'], plans: ['enterprise', 'premium'] },
  { id: 'ocorrencias', label: 'Ocorrências', icon: ShieldAlert, color: 'bg-red-500', category: 'communication', roles: ['admin', 'syndic'], plans: ['basic', 'enterprise', 'premium'] },
  { id: 'documentos', label: 'Documentos', icon: FileText, color: 'bg-slate-600', category: 'operations', roles: ['admin', 'syndic'], plans: ['basic', 'enterprise', 'premium'] },
  { id: 'manutencao', label: 'Manutenção', icon: Wrench, color: 'bg-cyan-600', category: 'operations', roles: ['admin', 'syndic'], plans: ['enterprise', 'premium'] },
  { id: 'mercado', label: 'Mercado Interno', icon: ShoppingCart, color: 'bg-emerald-500', category: 'social', roles: ['resident', 'admin', 'syndic'], plans: ['enterprise', 'premium'] },
  { id: 'assembleia', label: 'Assembleia Virtual', icon: Users, color: 'bg-indigo-600', category: 'communication', roles: ['admin', 'syndic'], plans: ['enterprise', 'premium'] },
  { id: 'pets', label: 'Meus Pets', icon: Dog, color: 'bg-rose-500', category: 'social', roles: ['resident', 'admin', 'syndic'], plans: ['premium'] },
  { id: 'veiculos', label: 'Veículos', icon: Car, color: 'bg-zinc-700', category: 'social', roles: ['resident', 'admin', 'syndic'], plans: ['enterprise', 'premium'] },
  { id: 'achados', label: 'Achados e Perdidos', icon: Search, color: 'bg-teal-500', category: 'social', roles: ['resident', 'admin', 'syndic'], plans: ['basic', 'enterprise', 'premium'] },
  { id: 'enquetes', label: 'Enquetes', icon: ClipboardList, color: 'bg-violet-500', category: 'communication', roles: ['resident', 'admin', 'syndic'], plans: ['basic', 'enterprise', 'premium'] },
  { id: 'consumo', label: 'Consumo', icon: BarChart3, color: 'bg-lime-600', category: 'financial', roles: ['resident', 'admin', 'syndic'], plans: ['premium'] },
  { id: 'visitantes', label: 'Visitantes', icon: UserPlus, color: 'bg-sky-500', category: 'operations', roles: ['resident', 'admin', 'syndic'], plans: ['enterprise', 'premium'] },
  { id: 'acordos', label: 'Acordos', icon: Handshake, color: 'bg-emerald-600', category: 'financial', roles: ['syndic'], plans: ['enterprise', 'premium'] },
  { id: 'unidades', label: 'Unidades', icon: MapPin, color: 'bg-stone-600', category: 'operations', roles: ['admin', 'syndic'], plans: ['basic', 'enterprise', 'premium'] },
  { id: 'contatos', label: 'Contatos Úteis', icon: Phone, color: 'bg-blue-600', category: 'communication', roles: ['resident', 'admin', 'syndic'], plans: ['basic', 'enterprise', 'premium'] },
  { id: 'mural', label: 'Mural de Avisos', icon: LayoutDashboard, color: 'bg-blue-400', category: 'communication', roles: ['resident', 'admin', 'syndic'], plans: ['basic', 'enterprise', 'premium'] },
];

export const PLANS = [
  { id: 'basic', name: 'Basic', price: '199', features: 'Funções básicas' },
  { id: 'enterprise', name: 'Enterprise', price: '250', features: 'Funções intermediárias' },
  { id: 'premium', name: 'Premium', price: '399', features: 'Todas as funções do AiCondo360' },
];
