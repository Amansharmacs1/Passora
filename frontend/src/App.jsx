import { Routes, Route, Outlet } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { VaultProvider } from './context/VaultContext';
import { SecurityProvider } from './context/SecurityContext';
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
import PasswordGenerator from './pages/PasswordGenerator';
import ActivityLog from './pages/ActivityLog';
import SecuritySettings from './pages/SecuritySettings';
import ImportExport from './pages/ImportExport';
import SharedVaultView from './pages/SharedVaultView';

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
        <SecurityProvider>
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
                
                <Route path="share/:token" element={<SharedVaultView />} />
                
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
                <Route path="settings/security" element={
                  <ProtectedRoute>
                    <SecuritySettings />
                  </ProtectedRoute>
                } />
                <Route path="settings/import-export" element={
                  <ProtectedRoute>
                    <ImportExport />
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
                
                <Route path="generator" element={
                  <ProtectedRoute>
                    <PasswordGenerator />
                  </ProtectedRoute>
                } />
                
                <Route path="activity" element={
                  <ProtectedRoute>
                    <ActivityLog />
                  </ProtectedRoute>
                } />

                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </VaultProvider>
        </SecurityProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
