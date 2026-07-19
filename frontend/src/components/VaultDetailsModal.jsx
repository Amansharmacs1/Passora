import { useState, useEffect } from 'react';
import Modal from './Modal';
import Button from './Button';
import vaultService from '../services/vaultService';
import toast from 'react-hot-toast';
import { FaCopy, FaEye, FaEyeSlash, FaShareAlt } from 'react-icons/fa';
import { useSecurity } from '../context/SecurityContext';
import MasterPasswordPrompt from './MasterPasswordPrompt';
import ShareModal from './ShareModal';

const VaultDetailsModal = ({ isOpen, onClose, vault }) => {
  const [loading, setLoading] = useState(false);
  const [decryptedPassword, setDecryptedPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('details'); // 'details' | 'history'
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const { getPasswordHistory } = useSecurity();
  const [isMasterPromptOpen, setIsMasterPromptOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState(null); // 'reveal' | 'copy'
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // Reset state when closed
  if (!isOpen && (decryptedPassword || activeTab !== 'details')) {
      setDecryptedPassword('');
      setShowPassword(false);
      setActiveTab('details');
      setHistory([]);
  }

  useEffect(() => {
    if (isOpen && activeTab === 'history' && vault && history.length === 0) {
      const loadHistory = async () => {
        setHistoryLoading(true);
        const data = await getPasswordHistory(vault._id);
        setHistory(data);
        setHistoryLoading(false);
      };
      loadHistory();
    }
  }, [isOpen, activeTab, vault, getPasswordHistory, history.length]);

  const executePendingAction = async () => {
    setIsMasterPromptOpen(false);
    if (pendingAction === 'reveal') {
      try {
        setLoading(true);
        const data = await vaultService.getVaultById(vault._id);
        setDecryptedPassword(data.password);
        setShowPassword(true);
      } catch (error) {
        console.error('Failed to decrypt password:', error);
        toast.error('Failed to decrypt password');
      } finally {
        setLoading(false);
      }
      } else if (pendingAction === 'copy') {
      try {
        setLoading(true);
        const data = await vaultService.getVaultById(vault._id);
        setDecryptedPassword(data.password);
        if (data.itemType === 'login') {
            copyToClipboard(data.password, 'Password');
        } else if (data.itemType === 'secure_note') {
            copyToClipboard(data.customData?.content, 'Note Content');
        } else if (data.itemType === 'credit_card') {
            copyToClipboard(data.customData?.cardNumber, 'Card Number');
        } else if (data.itemType === 'identity') {
            copyToClipboard(data.customData?.docNumber, 'Document Number');
        } else if (data.itemType === 'api_key') {
            copyToClipboard(data.customData?.keyValue, 'API Key');
        }
      } catch (error) {
        console.error('Failed to decrypt password:', error);
        toast.error('Failed to decrypt password');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleRevealPassword = async () => {
    if (decryptedPassword) {
        setShowPassword(!showPassword);
        return;
    }
    
    setPendingAction('reveal');
    setIsMasterPromptOpen(true);
  };

  const handleCopyPassword = () => {
    if (decryptedPassword) {
      copyToClipboard(decryptedPassword, 'Password');
    } else {
      setPendingAction('copy');
      setIsMasterPromptOpen(true);
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
    <>
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

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700 mt-4">
          <button 
            className={`flex-1 py-2 text-sm font-medium transition-colors ${activeTab === 'details' ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}`}
            onClick={() => setActiveTab('details')}
          >
            Details
          </button>
          <button 
            className={`flex-1 py-2 text-sm font-medium transition-colors ${activeTab === 'history' ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}`}
            onClick={() => setActiveTab('history')}
          >
            Password History
          </button>
        </div>

        {activeTab === 'details' ? (
          <div className="space-y-4">
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl space-y-4">
                  
                  {vault.itemType === 'login' && (
                    <>
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
                          <button onClick={handleCopyPassword} disabled={loading} className="text-gray-400 hover:text-primary-600 p-2">
                              <FaCopy />
                          </button>
                      </div>
                  </div>
                </>
              )}
                  {vault.itemType === 'secure_note' && (
                    <div className="space-y-2">
                       <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Secure Note</p>
                       <p className="text-sm font-medium text-gray-900 dark:text-white whitespace-pre-wrap blur-sm hover:blur-none transition-all cursor-pointer">
                           Hover to reveal note content
                       </p>
                    </div>
                  )}

                  {vault.itemType === 'credit_card' && vault.customData && (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Cardholder</p>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{vault.customData.cardHolder || '—'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Bank</p>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{vault.customData.bank || '—'}</p>
                        </div>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-gray-200 dark:border-gray-700">
                          <div>
                              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Card Number</p>
                              <p className="text-sm font-medium text-gray-900 dark:text-white font-mono tracking-wider">
                                  {showPassword ? vault.customData.cardNumber : '•••• •••• •••• ••••'}
                              </p>
                          </div>
                          <div className="flex space-x-1">
                              <button onClick={handleRevealPassword} disabled={loading} className="text-gray-400 hover:text-primary-600 p-2">
                                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                              </button>
                              <button onClick={handleCopyPassword} disabled={loading} className="text-gray-400 hover:text-primary-600 p-2">
                                  <FaCopy />
                              </button>
                          </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Expires</p>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{vault.customData.expiry || '—'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">CVV</p>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{showPassword ? vault.customData.cvv : '•••'}</p>
                        </div>
                      </div>
                    </>
                  )}

                  {vault.itemType === 'identity' && vault.customData && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">{vault.customData.docType || 'Document Type'}</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{vault.customData.docNumber || '—'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Full Name</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{vault.customData.fullName || '—'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Date Info</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{vault.customData.dateInfo || '—'}</p>
                      </div>
                    </div>
                  )}

                  {vault.itemType === 'api_key' && vault.customData && (
                     <>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Key Name</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{vault.customData.keyName || '—'}</p>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-gray-200 dark:border-gray-700">
                          <div>
                              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Key Value</p>
                              <p className="text-sm font-medium text-gray-900 dark:text-white font-mono tracking-wider">
                                  {showPassword ? vault.customData.keyValue : '••••••••••••••••'}
                              </p>
                          </div>
                          <div className="flex space-x-1">
                              <button onClick={handleRevealPassword} disabled={loading} className="text-gray-400 hover:text-primary-600 p-2">
                                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                              </button>
                              <button onClick={handleCopyPassword} disabled={loading} className="text-gray-400 hover:text-primary-600 p-2">
                                  <FaCopy />
                              </button>
                          </div>
                      </div>
                     </>
                  )}

              </div>

              {vault.notes && (
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-xl">
                      <p className="text-xs text-yellow-800 dark:text-yellow-500 uppercase tracking-wider mb-1 font-semibold">Notes</p>
                      <p className="text-sm text-yellow-900 dark:text-yellow-200 whitespace-pre-wrap">{vault.notes}</p>
                  </div>
              )}

              <div className="pt-2">
                <Button variant="secondary" onClick={() => setIsShareModalOpen(true)} className="w-full">
                  <FaShareAlt className="inline mr-2" /> Share Password
                </Button>
              </div>
          </div>
        ) : (
          <div className="space-y-4">
            {historyLoading ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">Loading history...</p>
            ) : history.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">No previous passwords found.</p>
            ) : (
              <ul className="space-y-3">
                {history.map((h, idx) => (
                  <li key={idx} className="bg-gray-50 dark:bg-gray-800 p-3 rounded-xl flex justify-between items-center border border-gray-100 dark:border-gray-700">
                    <div>
                      <p className="text-sm font-mono text-gray-900 dark:text-white">
                        {h.password}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Changed: {new Date(h.changedAt).toLocaleString()}
                      </p>
                    </div>
                    <button 
                      onClick={() => copyToClipboard(h.password, 'Previous Password')}
                      className="text-gray-400 hover:text-blue-500 p-2 transition-colors"
                      title="Copy old password"
                    >
                      <FaCopy />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

      </div>
    </Modal>
    <MasterPasswordPrompt 
      isOpen={isMasterPromptOpen}
      onClose={() => setIsMasterPromptOpen(false)}
      onSuccess={executePendingAction}
      actionText={pendingAction === 'reveal' ? 'reveal the password' : 'copy the password'}
    />
    <ShareModal 
      isOpen={isShareModalOpen}
      onClose={() => setIsShareModalOpen(false)}
      vault={vault}
    />
    </>
  );
};

export default VaultDetailsModal;
