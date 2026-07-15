import { motion } from 'framer-motion';
import { FaGlobe, FaCopy, FaEllipsisV, FaRegStar, FaStar } from 'react-icons/fa';
import { useState } from 'react';
import toast from 'react-hot-toast';

const VaultCard = ({ vault, onClick, onAction }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const copyToClipboard = (e, text, label) => {
    e.stopPropagation();
    if (!text) {
        toast.error(`${label} is empty`);
        return;
    }
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const handleAction = (e, action) => {
    e.stopPropagation();
    setMenuOpen(false);
    onAction(action, vault);
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      onClick={() => onClick(vault)}
      className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md cursor-pointer transition-all relative group"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0">
            {vault.favicon ? (
              <img src={vault.favicon} alt={`${vault.title} icon`} className="w-8 h-8 object-contain" />
            ) : (
              <FaGlobe className="text-gray-400 text-xl" />
            )}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white truncate max-w-[150px] sm:max-w-[180px]">
              {vault.title}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-[150px] sm:max-w-[180px]">
              {vault.username || vault.email || 'No username'}
            </p>
          </div>
        </div>
        
        <button 
            className="p-2 text-gray-400 hover:text-yellow-500 transition-colors"
            onClick={(e) => handleAction(e, 'favorite')}
        >
            {vault.favorite ? <FaStar className="text-yellow-500" /> : <FaRegStar />}
        </button>
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className="px-2.5 py-1 bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-full font-medium text-xs">
          {vault.category}
        </span>
        <span className="text-gray-400 text-xs">
          {new Date(vault.updatedAt || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </span>
      </div>

      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="relative">
          <button 
            onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 bg-white dark:bg-gray-800 shadow-sm"
          >
            <FaEllipsisV />
          </button>
          
          {menuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 z-10 py-2">
              <button onClick={(e) => copyToClipboard(e, vault.username, 'Username')} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Copy Username</button>
              <button onClick={(e) => handleAction(e, 'copyPassword')} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Copy Password</button>
              <div className="border-t border-gray-100 dark:border-gray-700 my-1"></div>
              <button onClick={(e) => handleAction(e, 'edit')} className="w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20">Edit</button>
              {vault.deleted ? (
                  <>
                    <button onClick={(e) => handleAction(e, 'restore')} className="w-full text-left px-4 py-2 text-sm text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20">Restore</button>
                    <button onClick={(e) => handleAction(e, 'permanentDelete')} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">Permanent Delete</button>
                  </>
              ) : (
                  <>
                    <button onClick={(e) => handleAction(e, 'archive')} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                        {vault.archived ? 'Unarchive' : 'Archive'}
                    </button>
                    <button onClick={(e) => handleAction(e, 'delete')} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">Move to Trash</button>
                  </>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default VaultCard;
