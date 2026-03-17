import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { LandingPage } from './pages/LandingPage';
import { AdminExclusivoPage } from './pages/AdminExclusivoPage';
import { Configuracoes } from './pages/Configuracoes';
import { Boletos } from './pages/Boletos';
import { Reservas } from './pages/Reservas';
import { Comunicados } from './pages/Comunicados';
import { Mural } from './pages/Mural';
import { FeatureDetail } from './pages/FeatureDetail';
import { Encomendas } from './pages/Encomendas';
import { Assembleias } from './pages/Assembleias';
import { useAuth } from './hooks/useAuth';
import { PricingPlan } from './constants';

export default function App() {
  const { user, loading, logout, setUser } = useAuth();

  const handlePlanChange = (plan: PricingPlan) => {
    if (user) {
      setUser({ ...user, plan });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route 
          path="/login" 
          element={user ? <Navigate to="/" /> : <LandingPage setUser={setUser} />} 
        />
        <Route 
          path="/admin-exclusivo" 
          element={user ? <Navigate to="/" /> : <AdminExclusivoPage setUser={setUser} />} 
        />
        <Route 
          path="/settings" 
          element={
            user ? (
              <Layout 
                condoName={user.condo} 
                userName={user.name} 
                onLogout={logout}
                userRole={user.role}
                userPlan={user.plan}
              >
                <Configuracoes 
                  userPlan={user.plan}
                  userName={user.name}
                  onPlanChange={handlePlanChange}
                />
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          } 
        />
        <Route 
          path="/feature/boletos" 
          element={
            user ? (
              <Layout 
                condoName={user.condo} 
                userName={user.name} 
                onLogout={logout}
                userRole={user.role}
                userPlan={user.plan}
              >
                <Boletos userId={user.id} />
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          } 
        />
        <Route 
          path="/feature/reservas" 
          element={
            user ? (
              <Layout 
                condoName={user.condo} 
                userName={user.name} 
                onLogout={logout}
                userRole={user.role}
                userPlan={user.plan}
              >
                <Reservas userId={user.id} condoId={user.condoId} />
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          } 
        />
        <Route 
          path="/feature/encomendas" 
          element={
            user ? (
              <Layout 
                condoName={user.condo} 
                userName={user.name} 
                onLogout={logout}
                userRole={user.role}
                userPlan={user.plan}
              >
                <Encomendas userId={user.id} />
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          } 
        />
        <Route 
          path="/feature/comunicados" 
          element={
            user ? (
              <Layout 
                condoName={user.condo} 
                userName={user.name} 
                onLogout={logout}
                userRole={user.role}
                userPlan={user.plan}
              >
                <Comunicados userId={user.id} />
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          } 
        />
        <Route 
          path="/feature/mural" 
          element={
            user ? (
              <Layout 
                condoName={user.condo} 
                userName={user.name} 
                onLogout={logout}
                userRole={user.role}
                userPlan={user.plan}
              >
                <Mural />
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          } 
        />
        <Route 
          path="/feature/assembleias" 
          element={
            user ? (
              <Layout 
                condoName={user.condo} 
                userName={user.name} 
                onLogout={logout}
                userRole={user.role}
                userPlan={user.plan}
              >
                <Assembleias userId={user.id} condoId={user.condoId} />
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          } 
        />
        <Route 
          path="/feature/:id" 
          element={
            user ? (
              <Layout 
                condoName={user.condo} 
                userName={user.name} 
                onLogout={logout}
                userRole={user.role}
                userPlan={user.plan}
              >
                <FeatureDetail />
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          } 
        />
        <Route 
          path="/" 
          element={
            user ? (
              <Layout 
                condoName={user.condo} 
                userName={user.name} 
                onLogout={logout}
                userRole={user.role}
                userPlan={user.plan}
              >
                <Dashboard 
                  userId={user.id}
                  userName={user.name} 
                  userRole={user.role}
                  userPlan={user.plan}
                  condoId={user.condoId}
                />
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          } 
        />
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}
