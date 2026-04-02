import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { LandingPage } from './pages/LandingPage';
import { AdminExclusivoPage } from './pages/AdminExclusivoPage';
import { Configuracoes } from './pages/Configuracoes';
import { Boletos } from './pages/Boletos';
import Financeiro from './pages/Financeiro';
import { Reservas } from './pages/Reservas';
import { Comunicados } from './pages/Comunicados';
import { FeatureDetail } from './pages/FeatureDetail';
import { Encomendas } from './pages/Encomendas';
import { Assembleias } from './pages/Assembleias';
import { Ocorrencias } from './pages/Ocorrencias';
import { Visitantes } from './pages/Visitantes';
import { Documentos } from './pages/Documentos';
import { Garagem } from './pages/Garagem';
import { Telefones } from './pages/Telefones';
import { Agendamentos } from './pages/Agendamentos';
import { Animais } from './pages/Animais';
import { Classificados } from './pages/Classificados';
import { Moradores } from './pages/Moradores';
import { useAuth } from './hooks/useAuth';
import { PricingPlan } from './constants';

export default function App() {
  const { user, loading, logout, setUser } = useAuth();

  const handlePlanChange = (plan: PricingPlan) => {
    if (user) {
      setUser({ ...user, plan });
    }
  };
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
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
                <Financeiro />
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
                <Encomendas userId={user.id} userRole={user.role} condoId={user.condoId} />
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
          path="/feature/ocorrencias" 
          element={
            user ? (
              <Layout 
                condoName={user.condo} 
                userName={user.name} 
                onLogout={logout}
                userRole={user.role}
                userPlan={user.plan}
              >
                <Ocorrencias userId={user.id} condoId={user.condoId} userRole={user.role} />
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          } 
        />
        <Route 
          path="/feature/visitantes" 
          element={
            user ? (
              <Layout 
                condoName={user.condo} 
                userName={user.name} 
                onLogout={logout}
                userRole={user.role}
                userPlan={user.plan}
              >
                <Visitantes userId={user.id} condoId={user.condoId} userRole={user.role} />
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          } 
        />
        <Route 
          path="/feature/documentos" 
          element={
            user ? (
              <Layout 
                condoName={user.condo} 
                userName={user.name} 
                onLogout={logout}
                userRole={user.role}
                userPlan={user.plan}
              >
                <Documentos />
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          } 
        />
        <Route 
          path="/feature/garagem" 
          element={
            user ? (
              <Layout 
                condoName={user.condo} 
                userName={user.name} 
                onLogout={logout}
                userRole={user.role}
                userPlan={user.plan}
              >
                <Garagem userId={user.id} condoId={user.condoId} userRole={user.role} />
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          } 
        />
        <Route 
          path="/feature/telefones" 
          element={
            user ? (
              <Layout 
                condoName={user.condo} 
                userName={user.name} 
                onLogout={logout}
                userRole={user.role}
                userPlan={user.plan}
              >
                <Telefones />
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          } 
        />
        <Route 
          path="/feature/agendamentos" 
          element={
            user ? (
              <Layout 
                condoName={user.condo} 
                userName={user.name} 
                onLogout={logout}
                userRole={user.role}
                userPlan={user.plan}
              >
                <Agendamentos />
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          } 
        />
        <Route 
          path="/feature/moradores" 
          element={
            user ? (
              <Layout 
                condoName={user.condo} 
                userName={user.name} 
                onLogout={logout}
                userRole={user.role}
                userPlan={user.plan}
              >
                <Moradores />
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          } 
        />
        <Route 
          path="/feature/classificados" 
          element={
            user ? (
              <Layout 
                condoName={user.condo} 
                userName={user.name} 
                onLogout={logout}
                userRole={user.role}
                userPlan={user.plan}
              >
                <Classificados />
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          } 
        />
        <Route 
          path="/feature/mercado" 
          element={<Navigate to="/feature/classificados" />} 
        />
        <Route 
          path="/feature/pets" 
          element={
            user ? (
              <Layout 
                condoName={user.condo} 
                userName={user.name} 
                onLogout={logout}
                userRole={user.role}
                userPlan={user.plan}
              >
                <Animais />
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          } 
        />
        <Route 
          path="/feature/visitantes" 
          element={
            user ? (
              <Layout 
                condoName={user.condo} 
                userName={user.name} 
                onLogout={logout}
                userRole={user.role}
                userPlan={user.plan}
              >
                <Visitantes userId={user.id} condoId={user.condoId} userRole={user.role} />
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          } 
        />
        <Route 
          path="/feature/veiculos" 
          element={
            user ? (
              <Layout 
                condoName={user.condo} 
                userName={user.name} 
                onLogout={logout}
                userRole={user.role}
                userPlan={user.plan}
              >
                <Garagem userId={user.id} condoId={user.condoId} userRole={user.role} />
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
                  onNavigate={(page) => navigate(`/feature/${page}`)}
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
  );
}
