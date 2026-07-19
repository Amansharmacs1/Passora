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
        itemType: vaultToEdit.itemType || 'login',
        websiteURL: vaultToEdit.websiteURL || '',
        username: vaultToEdit.username || '',
        email: vaultToEdit.email || '',
        password: '', // Leave empty for edit unless they want to change it
        customData: vaultToEdit.customData || {},
        category: vaultToEdit.category || 'Others',
        folder: vaultToEdit.folder || '',
        notes: vaultToEdit.notes || '',
      });
    } else {
      reset({
        title: '',
        itemType: 'login',
        websiteURL: '',
        username: '',
        email: '',
        password: '',
        customData: {},
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
    } catch (error) {
      console.error('Failed to generate password:', error);
      toast.error('Failed to generate password');
    }
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      
      const payload = { ...data };
      const currentItemType = payload.itemType;
      
      if (currentItemType === 'login') {
        if (!payload.password && vaultToEdit) {
          delete payload.password;
        } else if (!payload.password && !vaultToEdit) {
           toast.error('Password is required');
           setLoading(false);
           return;
        }
      } else {
        delete payload.password; // Notes, cards, etc don't use this top-level password
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
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Title *"
            type="text"
            placeholder="e.g. Netflix, Google"
            {...register('title', { required: 'Title is required' })}
            error={errors.title?.message}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Item Type
            </label>
            <select
              {...register('itemType')}
              disabled={!!vaultToEdit} // Cannot change type after creation
              className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all dark:text-white disabled:opacity-50"
            >
              <option value="login">Login</option>
              <option value="secure_note">Secure Note</option>
              <option value="credit_card">Credit Card</option>
              <option value="identity">Identity</option>
              <option value="api_key">API Key</option>
            </select>
          </div>
        </div>
        
        {watch('itemType') === 'login' && (
          <>
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
                {...register('password', { required: (watch('itemType') === 'login' && !vaultToEdit) ? 'Password is required' : false })}
              />
              {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>}
              {(passwordValue || !vaultToEdit) && (
                <PasswordStrengthMeter password={passwordValue} />
              )}
            </div>
          </>
        )}

        {watch('itemType') === 'secure_note' && (
          <div>
             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Secure Note Content</label>
             <textarea
               {...register('customData.content')}
               rows="5"
               className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all dark:text-white"
               placeholder="Write your secret notes here..."
             ></textarea>
          </div>
        )}

        {watch('itemType') === 'credit_card' && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Cardholder Name" type="text" {...register('customData.cardHolder')} />
              <Input label="Bank Name" type="text" {...register('customData.bank')} />
            </div>
            <Input label="Card Number" type="text" placeholder="XXXX XXXX XXXX XXXX" {...register('customData.cardNumber')} />
            <div className="grid grid-cols-2 gap-4">
              <Input label="Expiration Date (MM/YY)" type="text" placeholder="MM/YY" {...register('customData.expiry')} />
              <Input label="CVV / CVC" type="password" placeholder="123" {...register('customData.cvv')} />
            </div>
          </>
        )}

        {watch('itemType') === 'identity' && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Document Type</label>
                <select {...register('customData.docType')} className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg">
                  <option value="Passport">Passport</option>
                  <option value="Driver License">Driver License</option>
                  <option value="SSN">SSN / National ID</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <Input label="Document Number" type="text" {...register('customData.docNumber')} />
            </div>
            <Input label="Full Name on ID" type="text" {...register('customData.fullName')} />
            <Input label="Date of Birth / Issue Date" type="text" {...register('customData.dateInfo')} />
          </>
        )}

        {watch('itemType') === 'api_key' && (
          <>
            <Input label="API / SSH Key Name" type="text" placeholder="e.g. AWS Production Key" {...register('customData.keyName')} />
            <div>
               <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Key Value</label>
               <textarea
                 {...register('customData.keyValue')}
                 rows="3"
                 className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg font-mono text-sm"
                 placeholder="Paste your key here"
               ></textarea>
            </div>
          </>
        )}

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
