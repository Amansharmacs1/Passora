import { useState, useContext, useEffect } from 'react';
import Modal from './Modal';
import Button from './Button';
import Input from './Input';
import { useForm } from 'react-hook-form';
import vaultService from '../services/vaultService';
import toast from 'react-hot-toast';
import { VaultContext } from '../context/VaultContext';
import PasswordStrengthMeter from './PasswordStrengthMeter';
import api from '../services/api';

const VaultFormModal = ({ isOpen, onClose, vaultToEdit = null }) => {
  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm();
  const passwordValue = watch('password', '');
  const [loading, setLoading] = useState(false);
  const { fetchVaults, folders, defaultCategories } = useContext(VaultContext);

  useEffect(() => {
    if (vaultToEdit) {
      reset({
        title: vaultToEdit.title || '',
        websiteURL: vaultToEdit.websiteURL || '',
        username: vaultToEdit.username || '',
        email: vaultToEdit.email || '',
        password: '', // Leave empty for edit unless they want to change it
        category: vaultToEdit.category || 'Others',
        folder: vaultToEdit.folder || '',
        notes: vaultToEdit.notes || '',
      });
    } else {
      reset({
        title: '',
        websiteURL: '',
        username: '',
        email: '',
        password: '',
        category: 'Others',
        folder: '',
        notes: '',
      });
    }
  }, [vaultToEdit, reset, isOpen]);

  const handleGenerate = async () => {
    try {
      const res = await api.post('/password/generate', { length: 16 });
      setValue('password', res.data.password, { shouldValidate: true });
    } catch (err) {
      toast.error('Failed to generate password');
    }
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      
      const payload = { ...data };
      if (!payload.password && vaultToEdit) {
        delete payload.password; // Don't update password if empty during edit
      } else if (!payload.password && !vaultToEdit) {
         toast.error('Password is required');
         setLoading(false);
         return;
      }

      if (!payload.folder) {
         payload.folder = null;
      }

      if (vaultToEdit) {
        await vaultService.updateVault(vaultToEdit._id, payload);
        toast.success('Password updated successfully');
      } else {
        await vaultService.createVault(payload);
        toast.success('Password saved successfully');
      }
      fetchVaults();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={vaultToEdit ? 'Edit Password' : 'Add Password'}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-h-[70vh] overflow-y-auto px-1">
        <Input
          label="Title *"
          type="text"
          placeholder="e.g. Netflix, Google"
          {...register('title', { required: 'Title is required' })}
          error={errors.title?.message}
        />
        
        <Input
          label="Website URL"
          type="url"
          placeholder="https://example.com"
          {...register('websiteURL')}
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Username"
            type="text"
            placeholder="johndoe"
            {...register('username')}
          />
          <Input
            label="Email"
            type="email"
            placeholder="john@example.com"
            {...register('email')}
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {vaultToEdit ? "New Password (leave blank to keep current)" : "Password *"}
            </label>
            <button 
              type="button" 
              onClick={handleGenerate}
              className="text-xs text-primary-600 hover:text-primary-700 dark:text-primary-400"
            >
              Generate Strong Password
            </button>
          </div>
          <input
            type="text"
            className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all dark:text-white"
            placeholder="••••••••"
            {...register('password', { required: vaultToEdit ? false : 'Password is required' })}
          />
          {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>}
          {(passwordValue || !vaultToEdit) && (
            <PasswordStrengthMeter password={passwordValue} />
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Category
            </label>
            <select
              {...register('category')}
              className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all dark:text-white"
            >
              {defaultCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Folder
            </label>
            <select
              {...register('folder')}
              className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all dark:text-white"
            >
              <option value="">None</option>
              {folders.map(folder => (
                <option key={folder._id} value={folder._id}>{folder.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Notes
            </label>
            <textarea
              {...register('notes')}
              rows="3"
              className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all dark:text-white resize-none"
              placeholder="Any additional notes..."
            ></textarea>
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" isLoading={loading}>
            {vaultToEdit ? 'Save Changes' : 'Save Password'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default VaultFormModal;
