import { supabase } from './supabase';

export interface Tenant {
  id: string;
  name: string;
  slug: string;
}

/**
 * Gets the tenant slug from the URL path.
 * Format expected: /[tenant-slug]/...
 */
export const getTenantSlugFromUrl = (): string | null => {
  const path = window.location.pathname;
  const parts = path.split('/').filter(Boolean);
  
  // Basic heuristic: check if first part is a potential tenant slug
  // In a robust implementation, this would match against a known list or pattern
  if (parts.length > 0 && parts[0] !== 'dashboard' && parts[0] !== 'login') {
    return parts[0];
  }
  
  return null;
};

/**
 * Fetches all tenants associated with the current user via memberships.
 */
export const getUserTenants = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('memberships')
    .select(`
      tenant_id,
      role,
      tenants (
        id,
        name,
        slug
      )
    `)
    .eq('user_id', user.id);

  if (error) {
    console.error('[TenantLib] Error fetching user tenants:', error);
    return [];
  }

  return data.map(m => ({
    ...(m.tenants as any),
    role: m.role
  }));
};

/**
 * Gets details for a specific tenant by slug.
 */
export const getTenantBySlug = async (slug: string): Promise<Tenant | null> => {
  const { data, error } = await supabase
    .from('tenants')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();

  if (error) {
    console.error('[TenantLib] Error fetching tenant by slug:', error);
    return null;
  }

  return data;
};
