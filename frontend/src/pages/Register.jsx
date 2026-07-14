import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { BsEye, BsEyeSlash } from 'react-icons/bs';
import { motion } from 'framer-motion';
import Input from '../components/Input';
import Button from '../components/Button';

const Register = () => {
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const { register: registerUser, loading } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const password = watch('password', '');

  // Simple password strength calculation
  const getPasswordStrength = () => {
    let score = 0;
    if (password.length >= 8) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    return score; // 0 to 5
  };

  const strength = getPasswordStrength();
  const strengthColors = ['bg-gray-200 dark:bg-gray-700', 'bg-red-500', 'bg-orange-500', 'bg-orange-400', 'bg-primary-500', 'bg-primary-600'];

  const onSubmit = async (data) => {
    try {
      await registerUser(data.fullName, data.email, data.password);
      toast.success('Registration successful!', { iconTheme: { primary: '#059669', secondary: '#fff' } });
      navigate('/profile');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to register');
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
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">Create an account</h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500 transition-colors">
              Sign in
            </Link>
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Input
            label="Full Name"
            type="text"
            placeholder="John Doe"
            {...register('fullName', { 
              required: 'Name is required',
              minLength: { value: 3, message: 'Name must be at least 3 characters' }
            })}
            error={errors.fullName}
          />

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
              className="absolute right-3 top-[38px] text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 focus:outline-none"
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
            label="Confirm Password"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            {...register('confirmPassword', { 
              required: 'Please confirm your password',
              validate: val => {
                if (watch('password') != val) {
                  return "Your passwords do no match";
                }
              }
            })}
            error={errors.confirmPassword}
          />

          <div className="flex items-center">
            <input
              id="terms"
              type="checkbox"
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded dark:border-gray-600 dark:bg-gray-700"
              {...register('terms', { required: 'You must accept the terms' })}
            />
            <label htmlFor="terms" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
              I accept the <a href="#" className="text-primary-600 hover:underline">Terms of Service</a>
            </label>
          </div>
          {errors.terms && <p className="text-sm text-red-500 mt-1">{errors.terms.message}</p>}

          <Button type="submit" variant="primary" className="w-full py-3 mt-4" isLoading={loading}>
            Create Account
          </Button>
        </form>
      </motion.div>
    </div>
  );
};

export default Register;
