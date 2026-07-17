import { useState } from 'react';
import Modal from './Modal';
import Button from './Button';
import Input from './Input';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const TwoFactorVerify = ({ isOpen, userId, onSuccess, onCancel }) => {
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const { verify2FA } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) return;

    setLoading(true);
    try {
      await verify2FA(userId, token);
      onSuccess();
    } catch (error) {
      toast.error('Invalid code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onCancel} title="Two-Factor Authentication">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="text-center space-y-2">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Enter the 6-digit code from your authenticator app or a recovery code.
          </p>
        </div>

        <Input
          label="Authentication Code"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="000000"
          required
          className="text-center text-xl tracking-widest font-mono"
        />

        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading || !token}>
            {loading ? 'Verifying...' : 'Verify'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default TwoFactorVerify;
