import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { FaFingerprint } from 'react-icons/fa';
import { motion } from 'framer-motion';
import Input from '../components/Input';
import Button from '../components/Button';

const Login = () => {
  const { register, handleSubmit, formState: { errors }, watch } = useForm();
  const { login, loginWithPasskey, verify2FA, loading, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const [show2FA, setShow2FA] = useState(false);
  const [tempUserId, setTempUserId] = useState(null);
  const [twoFactorToken, setTwoFactorToken] = useState('');

  // Redirect if already logged in
  if (user) {
    return <Navigate to={from} replace />;
  }

  const onSubmit = async (data) => {
    try {
      const res = await login(data.email, data.password);
      if (res && res.requires2FA) {
        setTempUserId(res.userId);
        setShow2FA(true);
        toast.success('Please enter your 2FA code');
      } else {
        toast.success('Logged in successfully!');
        navigate(from, { replace: true });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to login');
    }
  };

  const handle2FASubmit = async (e) => {
    e.preventDefault();
    if (!twoFactorToken) return;
    try {
      await verify2FA(tempUserId, twoFactorToken);
      toast.success('Logged in successfully!');
      navigate(from, { replace: true });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid 2FA code');
    }
  };

  const handlePasskeyLogin = async () => {
    const email = watch('email');
    try {
      await loginWithPasskey(email);
      toast.success('Biometric login successful!');
      navigate(from, { replace: true });
    } catch (error) {
      toast.error(error.message || 'Passkey authentication failed');
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-gray-50 dark:bg-gray-900">
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass p-8 rounded-2xl w-full max-w-md shadow-xl"
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">Welcome back</h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Don't have an account?{' '}
            <Link to="/register" className="font-medium text-primary-600 hover:text-primary-500 transition-colors">
              Sign up
            </Link>
          </p>
        </div>

        {show2FA ? (
          <form onSubmit={handle2FASubmit} className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Two-Factor Authentication</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Enter the 6-digit code from your authenticator app.</p>
            </div>
            <Input
              label="Authentication Code"
              type="text"
              placeholder="000000"
              value={twoFactorToken}
              onChange={(e) => setTwoFactorToken(e.target.value)}
              required
            />
            <Button type="submit" variant="primary" className="w-full py-3" isLoading={loading}>
              Verify & Login
            </Button>
            <button 
              type="button" 
              onClick={() => { setShow2FA(false); setTempUserId(null); }}
              className="w-full text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 mt-4"
            >
              Back to login
            </button>
          </form>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Input
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              {...register('email', { 
                required: 'Email is required',
                pattern: { value: /^\S+@\S+\.\S+$/, message: 'Invalid email format' }
              })}
              error={errors.email}
            />

            <div className="relative">
              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                {...register('password', { required: 'Password is required' })}
                error={errors.password}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded dark:border-gray-600 dark:bg-gray-700"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <Link to="/forgot-password" className="font-medium text-primary-600 hover:text-primary-500 transition-colors">
                  Forgot your password?
                </Link>
              </div>
            </div>

            <Button type="submit" variant="primary" className="w-full py-3" isLoading={loading}>
              Sign in
            </Button>
            
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 rounded">Or continue with</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handlePasskeyLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-primary-500 rounded-lg shadow-sm bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 hover:bg-primary-100 dark:hover:bg-primary-900/40 transition-colors"
            >
              <FaFingerprint size={20} />
              <span className="font-medium">Continue with Passkey (Biometrics)</span>
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
};

export default Login;
