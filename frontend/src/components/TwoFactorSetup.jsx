import { useState } from 'react';
import Modal from './Modal';
import Button from './Button';
import Input from './Input';
import { useSecurity } from '../context/SecurityContext';
import toast from 'react-hot-toast';

const TwoFactorSetup = ({ isOpen, onClose, onSuccess }) => {
  const [step, setStep] = useState(1);
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [token, setToken] = useState('');
  const [recoveryCodes, setRecoveryCodes] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const { setup2FA, verify2FASetup } = useSecurity();

  const handleStartSetup = async () => {
    setLoading(true);
    try {
      const data = await setup2FA();
      setQrCode(data.qrCode);
      setSecret(data.secret);
      setStep(2);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to start 2FA setup');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!token || token.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      const data = await verify2FASetup(token);
      setRecoveryCodes(data.recoveryCodes);
      setStep(3);
    } catch (error) {
      toast.error('Invalid OTP code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setQrCode('');
    setSecret('');
    setToken('');
    setRecoveryCodes([]);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Setup Two-Factor Authentication">
      <div className="space-y-6">
        
        {step === 1 && (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-full flex items-center justify-center mx-auto text-2xl">
              🛡️
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Enhance Your Security</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Two-factor authentication adds an extra layer of security to your account. You'll need an authenticator app like Google Authenticator or Authy.
            </p>
            <Button onClick={handleStartSetup} className="w-full" disabled={loading}>
              {loading ? 'Starting...' : 'Begin Setup'}
            </Button>
          </div>
        )}

        {step === 2 && (
          <form onSubmit={handleVerify} className="space-y-6">
            <div className="text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Scan this QR code with your authenticator app.
              </p>
              {qrCode ? (
                <div className="bg-white p-4 rounded-xl inline-block border border-gray-200">
                  <img src={qrCode} alt="2FA QR Code" className="w-48 h-48" />
                </div>
              ) : (
                <div className="w-48 h-48 bg-gray-100 animate-pulse mx-auto rounded-xl"></div>
              )}
              
              <div className="mt-4">
                <p className="text-xs text-gray-400 mb-1">Manual Entry Code:</p>
                <code className="text-sm font-mono bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded text-gray-900 dark:text-white">
                  {secret}
                </code>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <Input
                label="Enter 6-digit code"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="000000"
                maxLength={6}
                required
                className="text-center text-lg tracking-widest font-mono"
              />
              <Button type="submit" className="w-full mt-4" disabled={loading || token.length !== 6}>
                {loading ? 'Verifying...' : 'Verify & Enable 2FA'}
              </Button>
            </div>
          </form>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div className="text-center text-green-500 mb-6">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mt-2">2FA Successfully Enabled</h3>
            </div>
            
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-xl border border-yellow-200 dark:border-yellow-900/50">
              <h4 className="text-sm font-bold text-yellow-800 dark:text-yellow-500 mb-2">Save your Recovery Codes</h4>
              <p className="text-xs text-yellow-700 dark:text-yellow-400 mb-4">
                If you lose access to your authenticator app, you can use these codes to log in. Each code can only be used once. Please copy and store them safely!
              </p>
              
              <div className="grid grid-cols-2 gap-2">
                {recoveryCodes.map((code, idx) => (
                  <code key={idx} className="bg-white dark:bg-gray-800 px-2 py-1 rounded text-xs font-mono text-center border border-gray-200 dark:border-gray-700">
                    {code}
                  </code>
                ))}
              </div>
            </div>

            <Button onClick={() => { onSuccess(); handleClose(); }} className="w-full">
              I have saved my codes
            </Button>
          </div>
        )}

      </div>
    </Modal>
  );
};

export default TwoFactorSetup;
