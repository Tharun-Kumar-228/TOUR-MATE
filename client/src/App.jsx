import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { useAuthStore } from './store/authStore';


import Home from './pages/Home';
import UnifiedLogin from './pages/UnifiedLogin';
import Login from './pages/Login';
import Signup from './pages/Signup';


import Dashboard from './pages/user/Dashboard';
import PlanCreate from './pages/user/PlanCreate';
import PlanEdit from './pages/user/PlanEdit';
import PlanView from './pages/user/PlanView';
import History from './pages/user/History';
import Favourites from './pages/user/Favourites';
import Reviews from './pages/user/Reviews';


import OwnerLogin from './pages/owner/OwnerLogin';
import OwnerSignup from './pages/owner/OwnerSignup';
import OwnerDashboard from './pages/owner/OwnerDashboard';
import OwnerAddPlace from './pages/owner/OwnerAddPlace';
import OwnerPlaceDetail from './pages/owner/OwnerPlaceDetail';


function ProtectedRoute({ children, requiredRole = null }) {
  const { user } = useAuthStore();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function App() {
  return (
    <Router future={{ v7_relativeSplatPath: true }}>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<UnifiedLogin />} />
            <Route path="/signup" element={<Signup />} />

            {/* User Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute requiredRole="user">
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/plan"
              element={
                <ProtectedRoute requiredRole="user">
                  <PlanCreate />
                </ProtectedRoute>
              }
            />
            <Route
              path="/plan/edit/:id"
              element={
                <ProtectedRoute requiredRole="user">
                  <PlanEdit />
                </ProtectedRoute>
              }
            />
            <Route
              path="/plan/view/:id"
              element={
                <ProtectedRoute requiredRole="user">
                  <PlanView />
                </ProtectedRoute>
              }
            />
            <Route
              path="/history"
              element={
                <ProtectedRoute requiredRole="user">
                  <History />
                </ProtectedRoute>
              }
            />
            <Route
              path="/favourites"
              element={
                <ProtectedRoute requiredRole="user">
                  <Favourites />
                </ProtectedRoute>
              }
            />
            <Route
              path="/reviews"
              element={
                <ProtectedRoute requiredRole="user">
                  <Reviews />
                </ProtectedRoute>
              }
            />

            {/* Owner Routes */}
            <Route path="/owner/login" element={<OwnerLogin />} />
            <Route path="/owner/signup" element={<OwnerSignup />} />
            <Route
              path="/owner/dashboard"
              element={
                <ProtectedRoute requiredRole="owner">
                  <OwnerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/owner/add-place"
              element={
                <ProtectedRoute requiredRole="owner">
                  <OwnerAddPlace />
                </ProtectedRoute>
              }
            />
            <Route
              path="/owner/places/:id"
              element={
                <ProtectedRoute requiredRole="owner">
                  <OwnerPlaceDetail />
                </ProtectedRoute>
              }
            />

            {/* Catch all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />
        <Toaster position="top-right" />
      </div>
    </Router>
  );
}

export default App;
