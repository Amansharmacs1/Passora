import { Suspense, lazy } from 'react';
import { Routes, Route, Outlet } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { VaultProvider } from './context/VaultContext';
import { SecurityProvider } from './context/SecurityContext';
import { Toaster } from 'react-hot-toast';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import CommandPalette from './components/CommandPalette';

const Landing = lazy(() => import('./pages/Landing'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const Profile = lazy(() => import('./pages/Profile'));
const Settings = lazy(() => import('./pages/Settings'));
const NotFound = lazy(() => import('./pages/NotFound'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const VaultList = lazy(() => import('./pages/VaultList'));
const PasswordGenerator = lazy(() => import('./pages/PasswordGenerator'));
const ActivityLog = lazy(() => import('./pages/ActivityLog'));
const SecuritySettings = lazy(() => import('./pages/SecuritySettings'));
const ImportExport = lazy(() => import('./pages/ImportExport'));
const SharedVaultView = lazy(() => import('./pages/SharedVaultView'));

const Loader = () => (
  <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
    <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
  </div>
);

const Layout = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <CommandPalette />
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
            <Suspense fallback={<Loader />}>
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
            </Suspense>
          </VaultProvider>
        </SecurityProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
