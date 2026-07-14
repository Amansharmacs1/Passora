import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { BsEye, BsEyeSlash } from 'react-icons/bs';
import api from '../services/api';
import Input from '../components/Input';
import Button from '../components/Button';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const password = watch('password', '');
  
  const getPasswordStrength = () => {
    let score = 0;
    if (password.length >= 8) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    return score;
  };

  const strength = getPasswordStrength();
  const strengthColors = ['bg-gray-200 dark:bg-gray-700', 'bg-red-500', 'bg-orange-500', 'bg-orange-400', 'bg-primary-500', 'bg-primary-600'];

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await api.post(`/auth/reset-password/${token}`, { password: data.password });
      toast.success('Password reset successfully!', { iconTheme: { primary: '#059669', secondary: '#fff' } });
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
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
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">Create new password</h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Please enter your new password below.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="relative">
            <Input
              label="New Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              {...register('password', { 
                required: 'Password is required',
                pattern: { 
                  value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, 
                  message: 'Must contain 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char' 
                }
              })}
              error={errors.password}
            />
            <button
              type="button"
              className="absolute right-3 top-[38px] text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <BsEyeSlash size={20} /> : <BsEye size={20} />}
            </button>
          </div>

          {password && (
            <div className="mt-2">
              <div className="flex gap-1 h-1.5 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                {[1, 2, 3, 4, 5].map((level) => (
                  <div 
                    key={level} 
                    className={`h-full flex-1 transition-colors duration-300 ${level <= strength ? strengthColors[strength] : 'bg-transparent'}`}
                  />
                ))}
              </div>
              <p className="text-xs text-right mt-1 text-gray-500">
                {strength < 2 ? 'Weak' : strength < 4 ? 'Fair' : strength === 5 ? 'Strong' : ''}
              </p>
            </div>
          )}

          <Input
            label="Confirm New Password"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            {...register('confirmPassword', { 
              required: 'Please confirm your password',
              validate: val => {
                if (watch('password') != val) {
                  return "Your passwords do not match";
                }
              }
            })}
            error={errors.confirmPassword}
          />

          <Button type="submit" variant="primary" className="w-full py-3" isLoading={loading}>
            Reset Password
          </Button>

          <div className="text-center mt-4 text-sm">
            <Link to="/login" className="font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">
              &larr; Back to login
            </Link>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default ResetPassword;
