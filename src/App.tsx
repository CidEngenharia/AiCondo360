import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Login } from './pages/Login';
import { LandingPage } from './pages/LandingPage';
import { UserRole, PricingPlan } from './constants';

export default function App() {
  const [user, setUser] = useState<{ name: string; condo: string; role: UserRole; plan: PricingPlan } | null>(null);

  const handleLogin = (userData: { name: string; condo: string; role: UserRole; plan: PricingPlan }) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
  };

  return (
    <Router>
      <Routes>
        <Route path="/landing" element={<LandingPage />} />
        <Route 
          path="/login" 
          element={user ? <Navigate to="/" /> : <Login onLogin={handleLogin} />} 
        />
        <Route 
          path="/" 
          element={
            user ? (
              <Layout 
                condoName={user.condo} 
                userName={user.name} 
                onLogout={handleLogout}
                userRole={user.role}
                userPlan={user.plan}
              >
                <Dashboard 
                  userName={user.name} 
                  userRole={user.role}
                  userPlan={user.plan}
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
