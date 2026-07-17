import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import { FaEye, FaEyeSlash, FaCopy, FaShieldAlt } from 'react-icons/fa';
import toast from 'react-hot-toast';

const SharedVaultView = () => {
  const { token } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const fetchShared = async () => {
      try {
        const res = await api.get(`/share/${token}`);
        setData(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load shared password');
      } finally {
        setLoading(false);
      }
    };
    fetchShared();
  }, [token]);

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied!`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-500 rounded-full flex items-center justify-center mx-auto text-2xl mb-4">
            !
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Link Expired or Invalid</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            {error}. The link may have reached its view limit or the owner may have revoked it.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-2xl shadow-xl max-w-md w-full">
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 text-primary-600 rounded-full flex items-center justify-center mx-auto text-xl mb-3">
            <FaShieldAlt />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Secure Share</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Someone shared a secure item with you via Passora.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Title</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">{data.title}</p>
          </div>

          {data.username && (
            <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-900 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Username / Email</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{data.username}</p>
              </div>
              <button onClick={() => copyToClipboard(data.username, 'Username')} className="text-gray-400 hover:text-primary-600 p-2">
                <FaCopy />
              </button>
            </div>
          )}

          <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-900 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Password</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white font-mono tracking-wider">
                {showPassword ? data.password : '••••••••••••'}
              </p>
            </div>
            <div className="flex space-x-1">
              <button onClick={() => setShowPassword(!showPassword)} className="text-gray-400 hover:text-primary-600 p-2">
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
              <button onClick={() => copyToClipboard(data.password, 'Password')} className="text-gray-400 hover:text-primary-600 p-2">
                <FaCopy />
              </button>
            </div>
          </div>

          {data.notes && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-xl border border-yellow-100 dark:border-yellow-900/50">
              <p className="text-xs text-yellow-800 dark:text-yellow-500 uppercase tracking-wider mb-1 font-semibold">Notes</p>
              <p className="text-sm text-yellow-900 dark:text-yellow-200 whitespace-pre-wrap">{data.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SharedVaultView;
