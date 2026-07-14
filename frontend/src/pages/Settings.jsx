import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import api from '../services/api';
import Input from '../components/Input';
import Button from '../components/Button';
import Modal from '../components/Modal';

const Settings = () => {
  const { logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm();

  const onChangePassword = async (data) => {
    setLoading(true);
    try {
      await api.put('/user/change-password', {
        oldPassword: data.oldPassword,
        newPassword: data.newPassword
      });
      toast.success('Password changed successfully!');
      reset();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const onDeleteAccount = async () => {
    try {
      await api.delete('/user/delete-account');
      toast.success('Account deleted successfully');
      logout();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete account');
      setDeleteModalOpen(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-8">
      
      {/* Preferences Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass p-8 rounded-2xl shadow-xl"
      >
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Preferences</h2>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Theme</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Toggle between light and dark mode</p>
          </div>
          <button
            onClick={toggleTheme}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${theme === 'dark' ? 'bg-primary-600' : 'bg-gray-200'}`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${theme === 'dark' ? 'translate-x-6' : 'translate-x-1'}`}
            />
          </button>
        </div>
      </motion.div>

      {/* Security Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass p-8 rounded-2xl shadow-xl"
      >
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Security</h2>
        <form onSubmit={handleSubmit(onChangePassword)} className="space-y-6 max-w-md">
          <Input
            label="Current Password"
            type="password"
            {...register('oldPassword', { required: 'Current password is required' })}
            error={errors.oldPassword}
          />
          <Input
            label="New Password"
            type="password"
            {...register('newPassword', { 
              required: 'New password is required',
              pattern: { 
                value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, 
                message: 'Must contain 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char' 
              }
            })}
            error={errors.newPassword}
          />
          <Input
            label="Confirm New Password"
            type="password"
            {...register('confirmNewPassword', { 
              required: 'Please confirm your new password',
              validate: val => {
                if (watch('newPassword') != val) {
                  return "Passwords do not match";
                }
              }
            })}
            error={errors.confirmNewPassword}
          />
          <Button type="submit" variant="primary" isLoading={loading}>
            Change Password
          </Button>
        </form>
      </motion.div>

      {/* Danger Zone Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="border border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-900/10 p-8 rounded-2xl shadow-xl"
      >
        <h2 className="text-2xl font-bold text-red-600 dark:text-red-500 mb-6">Danger Zone</h2>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Delete Account</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xl">
              Once you delete your account, there is no going back. Please be certain. All your data will be permanently erased.
            </p>
          </div>
          <Button 
            variant="outline" 
            className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white dark:hover:bg-red-600"
            onClick={() => setDeleteModalOpen(true)}
          >
            Delete Account
          </Button>
        </div>
      </motion.div>

      <Modal 
        isOpen={deleteModalOpen} 
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Account"
      >
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-300">
            Are you absolutely sure you want to delete your account? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-4 mt-6">
            <Button variant="ghost" onClick={() => setDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="primary" 
              className="bg-red-600 hover:bg-red-700"
              onClick={onDeleteAccount}
            >
              Yes, delete my account
            </Button>
          </div>
        </div>
      </Modal>

    </div>
  );
};

export default Settings;
