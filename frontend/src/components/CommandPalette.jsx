import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaSearch, FaTimes, FaShieldAlt, FaKey, FaCog, FaUser } from 'react-icons/fa';

const CommandPalette = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const inputRef = useRef(null);

  const actions = [
    { id: 'dashboard', name: 'Go to Dashboard', icon: FaShieldAlt, shortcut: 'G D', path: '/dashboard' },
    { id: 'vault', name: 'Open Vault', icon: FaKey, shortcut: 'G V', path: '/vault' },
    { id: 'generator', name: 'Password Generator', icon: FaKey, shortcut: 'G P', path: '/generator' },
    { id: 'profile', name: 'Profile Settings', icon: FaUser, shortcut: 'G S', path: '/profile' },
    { id: 'security', name: 'Security Settings', icon: FaCog, shortcut: 'G C', path: '/settings/security' },
  ];

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    } else {
      setQuery('');
    }
  }, [isOpen]);

  const handleSelect = (path) => {
    navigate(path);
    setIsOpen(false);
  };

  const filteredActions = actions.filter((action) =>
    action.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-24">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm"
          />

          {/* Palette */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-xl bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden mx-4"
          >
            <div className="flex items-center px-4 border-b border-gray-100 dark:border-gray-700">
              <FaSearch className="text-gray-400" />
              <input
                ref={inputRef}
                type="text"
                className="w-full px-4 py-4 text-gray-900 dark:text-white bg-transparent border-none focus:ring-0 focus:outline-none placeholder-gray-400"
                placeholder="Search commands... (Ctrl+K)"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <FaTimes />
              </button>
            </div>

            <div className="max-h-80 overflow-y-auto p-2">
              {filteredActions.length > 0 ? (
                <ul className="space-y-1">
                  {filteredActions.map((action) => (
                    <li key={action.id}>
                      <button
                        onClick={() => handleSelect(action.path)}
                        className="w-full flex items-center justify-between px-4 py-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-left group"
                      >
                        <div className="flex items-center space-x-3 text-gray-700 dark:text-gray-200">
                          <action.icon className="text-gray-400 group-hover:text-primary-500" />
                          <span>{action.name}</span>
                        </div>
                        <span className="text-xs text-gray-400 border border-gray-200 dark:border-gray-600 rounded px-2 py-1">
                          {action.shortcut}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                  No commands found for "{query}"
                </div>
              )}
            </div>
            
            <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex items-center justify-between text-xs text-gray-500">
                <span>Use <kbd className="font-sans px-1 py-0.5 border rounded bg-white dark:bg-gray-700 dark:border-gray-600">↑</kbd> <kbd className="font-sans px-1 py-0.5 border rounded bg-white dark:bg-gray-700 dark:border-gray-600">↓</kbd> to navigate</span>
                <span><kbd className="font-sans px-1 py-0.5 border rounded bg-white dark:bg-gray-700 dark:border-gray-600">esc</kbd> to close</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CommandPalette;
