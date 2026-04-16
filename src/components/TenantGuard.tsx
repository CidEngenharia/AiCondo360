import React from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { useTenant } from '../contexts/TenantContext';

interface TenantGuardProps {
  children: React.ReactNode;
}

export const TenantGuard: React.FC<TenantGuardProps> = ({ children }) => {
  const { tenant, loading, isGlobalAdmin, userTenants } = useTenant();
  const { tenantSlug } = useParams();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // If no slug is provided, and we are logged in, redirect to the preferred slug
  if (!tenantSlug && tenant) {
    return <Navigate to={`/${tenant.slug}`} replace />;
  }

  // If slug is provided, check access
  if (tenantSlug) {
    if (isGlobalAdmin) return <>{children}</>;

    const hasAccess = userTenants.some(t => t.slug === tenantSlug);
    if (!hasAccess) {
      // Redirect to the first tenant they have access to, or login
      if (userTenants.length > 0) {
        return <Navigate to={`/${userTenants[0].slug}`} replace />;
      }
      return <Navigate to="/login" replace />;
    }
  }

  return <>{children}</>;
};
