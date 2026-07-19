import { useState } from 'react';
import Modal from './Modal';
import Button from './Button';
import Input from './Input';
import { useSecurity } from '../context/SecurityContext';
import toast from 'react-hot-toast';

const MasterPasswordPrompt = ({ isOpen, onClose, onSuccess, actionText = 'continue' }) => {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { verifyMasterPassword } = useSecurity();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password) {
      toast.error('Please enter your master password');
      return;
    }

    setLoading(true);
    try {
      await verifyMasterPassword(password);
      setPassword('');
      onSuccess();
    } catch (error) {
      console.error('Invalid master password:', error);
      toast.error('Invalid master password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Master Password Required">
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Please enter your Master Password to {actionText}.
        </p>
        
        <Input
          type="password"
          label="Master Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter master password"
          required
        />
        
        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading || !password}>
            {loading ? 'Verifying...' : 'Verify'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default MasterPasswordPrompt;
