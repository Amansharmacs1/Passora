import { useState } from 'react';
import Modal from './Modal';
import Button from './Button';
import vaultService from '../services/vaultService';
import toast from 'react-hot-toast';
import { FaCopy, FaEye, FaEyeSlash } from 'react-icons/fa';

const VaultDetailsModal = ({ isOpen, onClose, vault }) => {
  const [loading, setLoading] = useState(false);
  const [decryptedPassword, setDecryptedPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Reset state when closed
  if (!isOpen && decryptedPassword) {
      setDecryptedPassword('');
      setShowPassword(false);
  }

  const handleRevealPassword = async () => {
    if (decryptedPassword) {
        setShowPassword(!showPassword);
        return;
    }
    
    try {
      setLoading(true);
      const data = await vaultService.getVaultById(vault._id);
      setDecryptedPassword(data.password);
      setShowPassword(true);
    } catch (error) {
      toast.error('Failed to decrypt password');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text, label) => {
    if (!text) {
        toast.error(`No ${label} available`);
        return;
    }
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied!`);
  };

  if (!vault) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={vault.title}>
      <div className="space-y-6">
        
        <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center p-2">
                {vault.favicon ? (
                    <img src={vault.favicon} alt="icon" className="w-full h-full object-contain" />
                ) : (
                    <span className="text-2xl text-gray-400">{vault.title.charAt(0)}</span>
                )}
            </div>
            <div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">{vault.title}</h4>
                {vault.websiteURL && (
                    <a href={vault.websiteURL} target="_blank" rel="noreferrer" className="text-sm text-primary-600 hover:underline">
                        {vault.websiteURL}
                    </a>
                )}
            </div>
        </div>

        <div className="space-y-4">
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl space-y-4">
                
                {/* Username */}
                <div className="flex justify-between items-center">
                    <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Username</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{vault.username || '—'}</p>
                    </div>
                    {vault.username && (
                        <button onClick={() => copyToClipboard(vault.username, 'Username')} className="text-gray-400 hover:text-primary-600 p-2">
                            <FaCopy />
                        </button>
                    )}
                </div>

                {/* Email */}
                <div className="flex justify-between items-center">
                    <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Email</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{vault.email || '—'}</p>
                    </div>
                    {vault.email && (
                        <button onClick={() => copyToClipboard(vault.email, 'Email')} className="text-gray-400 hover:text-primary-600 p-2">
                            <FaCopy />
                        </button>
                    )}
                </div>

                {/* Password */}
                <div className="flex justify-between items-center pt-2 border-t border-gray-200 dark:border-gray-700">
                    <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Password</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white font-mono tracking-wider">
                            {showPassword ? decryptedPassword : '••••••••••••'}
                        </p>
                    </div>
                    <div className="flex space-x-1">
                        <button onClick={handleRevealPassword} disabled={loading} className="text-gray-400 hover:text-primary-600 p-2">
                            {loading ? (
                                <div className="w-4 h-4 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                showPassword ? <FaEyeSlash /> : <FaEye />
                            )}
                        </button>
                        <button 
                            onClick={() => {
                                if (!decryptedPassword) {
                                    handleRevealPassword().then(() => {
                                        if (decryptedPassword) copyToClipboard(decryptedPassword, 'Password');
                                    });
                                } else {
                                    copyToClipboard(decryptedPassword, 'Password');
                                }
                            }} 
                            className="text-gray-400 hover:text-primary-600 p-2"
                        >
                            <FaCopy />
                        </button>
                    </div>
                </div>

            </div>

            {vault.notes && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-xl">
                    <p className="text-xs text-yellow-800 dark:text-yellow-500 uppercase tracking-wider mb-1 font-semibold">Notes</p>
                    <p className="text-sm text-yellow-900 dark:text-yellow-200 whitespace-pre-wrap">{vault.notes}</p>
                </div>
            )}
        </div>

      </div>
    </Modal>
  );
};

export default VaultDetailsModal;
