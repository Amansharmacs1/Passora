import { Routes, Route, Outlet } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { VaultProvider } from './context/VaultContext';
import { Toaster } from 'react-hot-toast';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';
import Dashboard from './pages/Dashboard';
import VaultList from './pages/VaultList';

const Layout = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <VaultProvider>
          <Toaster 
          position="top-right"
          toastOptions={{
            className: 'dark:bg-gray-800 dark:text-white',
            style: {
              background: 'var(--card-bg)',
              color: 'var(--text-color)',
              backdropFilter: 'blur(12px)',
            }
          }}
        />
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Landing />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="forgot-password" element={<ForgotPassword />} />
            <Route path="reset-password/:token" element={<ResetPassword />} />
            
            {/* Protected Routes */}
            <Route path="profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
            <Route path="settings" element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            } />
            
            <Route path="dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="vault" element={
              <ProtectedRoute>
                <VaultList />
              </ProtectedRoute>
            } />
            <Route path="vault/favorites" element={
              <ProtectedRoute>
                <VaultList />
              </ProtectedRoute>
            } />
            <Route path="vault/archive" element={
              <ProtectedRoute>
                <VaultList />
              </ProtectedRoute>
            } />
            <Route path="vault/trash" element={
              <ProtectedRoute>
                <VaultList />
              </ProtectedRoute>
            } />
            <Route path="vault/category/:categoryName" element={
              <ProtectedRoute>
                <VaultList />
              </ProtectedRoute>
            } />
            <Route path="vault/folder/:folderId" element={
              <ProtectedRoute>
                <VaultList />
              </ProtectedRoute>
            } />

            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
        </VaultProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
