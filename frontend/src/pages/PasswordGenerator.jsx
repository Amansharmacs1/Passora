import { useState, useEffect, useCallback } from 'react';
import { useSecurity } from '../context/SecurityContext';
import PasswordStrengthMeter from '../components/PasswordStrengthMeter';
import { FaCopy, FaSyncAlt } from 'react-icons/fa';
import toast from 'react-hot-toast';
import api from '../services/api';

const PasswordGenerator = () => {
  const { addGeneratedPassword, generatedHistory } = useSecurity();
  const [password, setPassword] = useState('');
  const [length, setLength] = useState(16);
  const [options, setOptions] = useState({
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,
  });

  const generate = useCallback(async () => {
    try {
      // In a pure React app, we could do this locally, but we'll use our new API
      const res = await api.post('/password/generate', {
        length,
        ...options
      });
      setPassword(res.data.password);
      addGeneratedPassword(res.data.password);
    } catch (error) {
      console.error('Failed to generate password:', error);
      toast.error('Failed to generate password');
    }
  }, [length, options, addGeneratedPassword]);

  useEffect(() => {
    generate();
    // eslint-disable-next-line
  }, []);

  const handleCopy = () => {
    if (!password) return;
    navigator.clipboard.writeText(password);
    toast.success('Password copied to clipboard!');
  };

  const handleOptionChange = (option) => {
    setOptions(prev => {
      const next = { ...prev, [option]: !prev[option] };
      // Ensure at least one is selected
      if (!next.uppercase && !next.lowercase && !next.numbers && !next.symbols) {
        toast.error('Must select at least one character type');
        return prev;
      }
      return next;
    });
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Password Generator</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">Generate secure, strong passwords instantly.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Main Output Card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
            <div className="relative">
              <input
                type="text"
                readOnly
                value={password}
                className="w-full text-center text-3xl font-mono py-8 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-2">
                <button 
                  onClick={handleCopy}
                  className="p-3 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  title="Copy"
                >
                  <FaCopy className="text-xl" />
                </button>
                <button 
                  onClick={generate}
                  className="p-3 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  title="Regenerate"
                >
                  <FaSyncAlt className="text-xl" />
                </button>
              </div>
            </div>

            <div className="mt-6">
              <PasswordStrengthMeter password={password} />
            </div>
          </div>

          {/* Controls Card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Customize</h3>
            
            <div className="space-y-6">
              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Password Length</label>
                  <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{length}</span>
                </div>
                <input
                  type="range"
                  min="4"
                  max="64"
                  value={length}
                  onChange={(e) => setLength(Number(e.target.value))}
                  onMouseUp={generate}
                  onTouchEnd={generate}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {Object.keys(options).map((key) => (
                  <label key={key} className="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-xl cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                    <input
                      type="checkbox"
                      checked={options[key]}
                      onChange={() => {
                        handleOptionChange(key);
                        setTimeout(generate, 0); // ensure state is updated
                      }}
                      className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                      {key}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">History</h3>
            {generatedHistory.length > 0 ? (
              <ul className="space-y-3">
                {generatedHistory.map((histPass, idx) => (
                  <li key={idx} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <span className="font-mono text-sm text-gray-600 dark:text-gray-400 truncate max-w-[150px]">
                      {histPass}
                    </span>
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(histPass);
                        toast.success('Copied from history!');
                      }}
                      className="text-gray-400 hover:text-blue-500"
                    >
                      <FaCopy />
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">No passwords generated yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PasswordGenerator;
