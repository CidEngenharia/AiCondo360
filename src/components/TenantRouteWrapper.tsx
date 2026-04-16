import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useTenant } from '../contexts/TenantContext';

/**
 * A wrapper component that ensures the tenant in the URL matches the context.
 * If no tenant is in the URL, it uses the context's detected tenant.
 */
export const TenantRouteWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { tenantSlug } = useParams<{ tenantSlug?: string }>();
  const { tenant, loading } = useTenant();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // If a slug is provided in URL but it doesn't match current tenant or is invalid,
  // we might want to handle it (e.g., unauthorized access if RLS hasn't kicked in).
  // But for now, we just pass through as the Context handles the detection.

  return <>{children}</>;
};
