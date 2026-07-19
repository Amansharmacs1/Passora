import { useState } from 'react';
import Modal from './Modal';
import Button from './Button';
import Input from './Input';
import { useSecurity } from '../context/SecurityContext';
import toast from 'react-hot-toast';
import { FaCopy, FaLink } from 'react-icons/fa';

const ShareModal = ({ isOpen, onClose, vault }) => {
  const [expiresIn, setExpiresIn] = useState(24);
  const [maxViews, setMaxViews] = useState(1);
  const [shareLink, setShareLink] = useState('');
  const [loading, setLoading] = useState(false);
  const { createShare } = useSecurity();

  const handleGenerate = async () => {
    if (!vault) return;
    setLoading(true);
    try {
      const data = await createShare(vault._id, expiresIn, maxViews);
      const link = `${window.location.origin}/share/${data.token}`;
      setShareLink(link);
      toast.success('Share link generated!');
    } catch (error) {
      console.error('Failed to generate share link:', error);
      toast.error('Failed to generate share link');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareLink);
    toast.success('Link copied to clipboard!');
  };

  const handleClose = () => {
    setShareLink('');
    setExpiresIn(24);
    setMaxViews(1);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Secure Share">
      <div className="space-y-6">
        {!shareLink ? (
          <>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Generate a secure, one-time link to share <span className="font-semibold text-gray-900 dark:text-white">{vault?.title}</span>.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Expiration Time</label>
                <select 
                  value={expiresIn} 
                  onChange={(e) => setExpiresIn(Number(e.target.value))}
                  className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-primary-500 dark:text-white"
                >
                  <option value={1}>1 Hour</option>
                  <option value={24}>24 Hours</option>
                  <option value={168}>7 Days</option>
                  <option value={720}>30 Days</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Maximum Views</label>
                <select 
                  value={maxViews} 
                  onChange={(e) => setMaxViews(Number(e.target.value))}
                  className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-primary-500 dark:text-white"
                >
                  <option value={1}>1 View (One-time link)</option>
                  <option value={5}>5 Views</option>
                  <option value={10}>10 Views</option>
                  <option value={0}>Unlimited Views</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button type="button" variant="secondary" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="button" onClick={handleGenerate} disabled={loading}>
                {loading ? 'Generating...' : 'Generate Link'}
              </Button>
            </div>
          </>
        ) : (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-full flex items-center justify-center mx-auto text-2xl mb-4">
              <FaLink />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Link Ready</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Share this link securely. Anyone with this link can view the password until it expires or reaches its view limit.
            </p>
            
            <div className="relative">
              <Input 
                value={shareLink}
                readOnly
                className="pr-12 bg-gray-50 dark:bg-gray-900"
              />
              <button 
                onClick={copyToClipboard}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary-600 p-1"
                title="Copy Link"
              >
                <FaCopy />
              </button>
            </div>

            <Button onClick={handleClose} className="w-full mt-4">
              Done
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default ShareModal;
