import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import SessionList from '../components/SessionList';
import Button from '../components/Button';
import TwoFactorSetup from '../components/TwoFactorSetup';
import MasterPasswordPrompt from '../components/MasterPasswordPrompt';
import toast from 'react-hot-toast';
import { useSecurity } from '../context/SecurityContext';
import { FaKey, FaTrash } from 'react-icons/fa';

const SecuritySettings = () => {
  const [is2FASetupOpen, setIs2FASetupOpen] = useState(false);
  const [isMasterPromptOpen, setIsMasterPromptOpen] = useState(false);
  const [masterAction, setMasterAction] = useState(''); // 'setup' | 'change' | 'remove'
  const [masterPasswordInput, setMasterPasswordInput] = useState('');
  
  const { setupMasterPassword, disable2FA, passkeys, fetchPasskeys, registerPasskey, deletePasskey } = useSecurity();
  const [is2FAEnabled, setIs2FAEnabled] = useState(false); // In a real app, this should come from user profile API

  useEffect(() => {
    fetchPasskeys();
  }, [fetchPasskeys]);

  const handleRegisterPasskey = async () => {
    try {
      await registerPasskey();
      toast.success('Passkey registered successfully');
      fetchPasskeys();
    } catch (error) {
      toast.error(error.message || 'Failed to register passkey');
    }
  };

  const handleDeletePasskey = async (id) => {
    if (window.confirm('Are you sure you want to delete this passkey?')) {
      try {
        await deletePasskey(id);
        toast.success('Passkey deleted');
        fetchPasskeys();
      } catch (error) {
        console.error('Failed to delete passkey:', error);
        toast.error('Failed to delete passkey');
      }
    }
  };

  const handleMasterSuccess = () => {
    setIsMasterPromptOpen(false);
    toast.success('Action successful!');
  };

  const handleEnable2FA = () => {
    setIs2FASetupOpen(true);
  };

  const handleDisable2FA = async () => {
    const pwd = window.prompt("Enter your account password to disable 2FA:");
    if (!pwd) return;

    try {
      await disable2FA(pwd, '');
      toast.success('2FA Disabled');
      setIs2FAEnabled(false);
    } catch (e) {
      console.error('Failed to disable 2FA:', e);
      toast.error('Failed to disable 2FA');
    }
  };

  const handleSetupMaster = async () => {
    if (!masterPasswordInput) return;
    try {
      await setupMasterPassword(masterPasswordInput);
      toast.success('Master Password configured!');
      setMasterPasswordInput('');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to setup Master Password');
    }
  };

  return (
    <div className="flex bg-gray-50 dark:bg-black/50 min-h-[calc(100vh-64px)]">
      <Sidebar />
      <div className="flex-1 p-6 lg:p-8 overflow-y-auto">
        <div className="max-w-4xl mx-auto space-y-8">
          
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Security Settings</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Manage your account security, sessions, and multi-factor authentication.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Master Password Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Master Password</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                Your Master Password provides an extra layer of encryption. It is required to view, export, or share passwords.
              </p>
              
              <div className="space-y-4">
                <input 
                  type="password"
                  placeholder="Enter a strong master password"
                  value={masterPasswordInput}
                  onChange={(e) => setMasterPasswordInput(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-primary-500 dark:text-white"
                />
                <div className="flex space-x-3">
                  <Button onClick={handleSetupMaster} disabled={!masterPasswordInput}>Set Password</Button>
                  <Button variant="secondary" onClick={() => { setMasterAction('remove'); setIsMasterPromptOpen(true); }}>Remove</Button>
                </div>
              </div>
            </div>

            {/* 2FA Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Two-Factor Authentication</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                  Protect your account with TOTP (Time-based One-Time Password) using Google Authenticator or Authy.
                </p>
              </div>
              <div>
                {is2FAEnabled ? (
                  <Button variant="danger" onClick={handleDisable2FA} className="w-full">
                    Disable 2FA
                  </Button>
                ) : (
                  <Button onClick={handleEnable2FA} className="w-full">
                    Setup 2FA
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Passkeys Panel */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Passkeys (WebAuthn)</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Log in securely using your device's biometrics (Touch ID, Face ID) or security keys.
                </p>
              </div>
              <Button onClick={handleRegisterPasskey}>Register Passkey</Button>
            </div>
            
            {passkeys.length > 0 ? (
              <div className="space-y-3">
                {passkeys.map(pk => (
                  <div key={pk._id} className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 text-primary-600 rounded-full flex items-center justify-center">
                        <FaKey />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white">{pk.deviceName}</h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Added: {new Date(pk.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleDeletePasskey(pk._id)}
                      className="text-red-500 hover:text-red-600 p-2"
                      title="Delete Passkey"
                    >
                      <FaTrash />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
                No passkeys registered yet.
              </div>
            )}
          </div>

          {/* Sessions Panel */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <SessionList />
          </div>

        </div>
      </div>

      <TwoFactorSetup 
        isOpen={is2FASetupOpen} 
        onClose={() => setIs2FASetupOpen(false)} 
        onSuccess={() => { setIs2FAEnabled(true); setIs2FASetupOpen(false); }}
      />

      <MasterPasswordPrompt 
        isOpen={isMasterPromptOpen}
        onClose={() => setIsMasterPromptOpen(false)}
        onSuccess={handleMasterSuccess}
        actionText={masterAction === 'remove' ? 'remove it' : 'verify it'}
      />
    </div>
  );
};

export default SecuritySettings;
