import { useState, useContext } from 'react';
import { 
    FaShieldAlt, 
    FaStar, 
    FaArchive, 
    FaTrash, 
    FaFolder, 
    FaTags,
    FaPlus,
    FaEllipsisV,
    FaTachometerAlt,
    FaKey,
    FaHistory,
    FaLock,
    FaFileExport
} from 'react-icons/fa';
import { VaultContext } from '../context/VaultContext';
import { motion, AnimatePresence } from 'framer-motion';
import { NavLink } from 'react-router-dom';

const Sidebar = ({ onOpenFolderModal, onEditFolder, onDeleteFolder }) => {
    const { folders, defaultCategories, stats } = useContext(VaultContext);
    const [openDropdown, setOpenDropdown] = useState(null);

    const navLinkClasses = ({ isActive }) =>
        `flex items-center justify-between px-4 py-2.5 rounded-xl transition-all ${
            isActive
                ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 font-medium'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
        }`;

    return (
        <div className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 h-[calc(100vh-64px)] overflow-y-auto hidden md:block">
            <div className="p-4 space-y-6">
                
                {/* Main Navigation */}
                <div className="space-y-1">
                    <NavLink to="/dashboard" className={navLinkClasses}>
                        <div className="flex items-center space-x-3">
                            <FaTachometerAlt className="text-lg" />
                            <span>Security Dashboard</span>
                        </div>
                    </NavLink>
                    <NavLink to="/vault" end className={navLinkClasses}>
                        <div className="flex items-center space-x-3">
                            <FaShieldAlt className="text-lg" />
                            <span>All Items</span>
                        </div>
                        <span className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">{stats.total}</span>
                    </NavLink>
                    <NavLink to="/vault/favorites" className={navLinkClasses}>
                        <div className="flex items-center space-x-3">
                            <FaStar className="text-lg" />
                            <span>Favorites</span>
                        </div>
                        <span className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">{stats.favorites}</span>
                    </NavLink>
                    <NavLink to="/vault/archive" className={navLinkClasses}>
                        <div className="flex items-center space-x-3">
                            <FaArchive className="text-lg" />
                            <span>Archive</span>
                        </div>
                        <span className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">{stats.archived}</span>
                    </NavLink>
                    <NavLink to="/vault/trash" className={navLinkClasses}>
                        <div className="flex items-center space-x-3">
                            <FaTrash className="text-lg" />
                            <span>Trash</span>
                        </div>
                        <span className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">{stats.trash}</span>
                    </NavLink>
                </div>

                {/* Tools */}
                <div>
                    <div className="px-4 mb-2">
                        <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Tools
                        </h4>
                    </div>
                    <div className="space-y-1">
                        <NavLink to="/generator" className={navLinkClasses}>
                            <div className="flex items-center space-x-3">
                                <FaKey className="text-lg text-primary-500" />
                                <span>Generator</span>
                            </div>
                        </NavLink>
                        <NavLink to="/activity" className={navLinkClasses}>
                            <div className="flex items-center space-x-3">
                                <FaHistory className="text-lg text-primary-500" />
                                <span>Activity Log</span>
                            </div>
                        </NavLink>
                        <NavLink to="/settings/security" className={navLinkClasses}>
                            <div className="flex items-center space-x-3">
                                <FaLock className="text-lg text-primary-500" />
                                <span>Security Settings</span>
                            </div>
                        </NavLink>
                        <NavLink to="/settings/import-export" className={navLinkClasses}>
                            <div className="flex items-center space-x-3">
                                <FaFileExport className="text-lg text-primary-500" />
                                <span>Import / Export</span>
                            </div>
                        </NavLink>
                    </div>
                </div>

                {/* Folders */}
                <div>
                    <div className="flex items-center justify-between px-4 mb-2">
                        <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Folders
                        </h4>
                        <button 
                            onClick={onOpenFolderModal}
                            className="text-gray-400 hover:text-primary-600 transition-colors p-1"
                        >
                            <FaPlus size={12} />
                        </button>
                    </div>
                    <div className="space-y-1">
                        {folders.map(folder => (
                            <NavLink key={folder._id} to={`/vault/folder/${folder._id}`} className={navLinkClasses}>
                                <div className="flex items-center space-x-3 truncate">
                                    <FaFolder className="text-lg flex-shrink-0 text-yellow-500" />
                                    <span className="truncate">{folder.name}</span>
                                </div>
                                <div className="relative flex-shrink-0">
                                    <button 
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            setOpenDropdown(openDropdown === folder._id ? null : folder._id);
                                        }}
                                        className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                    >
                                        <FaEllipsisV size={12} />
                                    </button>
                                    
                                    {openDropdown === folder._id && (
                                        <div className="absolute right-0 mt-1 w-32 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-100 dark:border-gray-700 z-10 py-1">
                                            <button 
                                                onClick={(e) => { e.preventDefault(); onEditFolder(folder); setOpenDropdown(null); }}
                                                className="w-full text-left px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                                            >
                                                Rename
                                            </button>
                                            <button 
                                                onClick={(e) => { e.preventDefault(); onDeleteFolder(folder._id); setOpenDropdown(null); }}
                                                className="w-full text-left px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </NavLink>
                        ))}
                    </div>
                </div>

                {/* Categories */}
                <div>
                    <div className="px-4 mb-2">
                        <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Categories
                        </h4>
                    </div>
                    <div className="space-y-1">
                        {defaultCategories.map(cat => (
                            <NavLink key={cat} to={`/vault/category/${cat.toLowerCase()}`} className={navLinkClasses}>
                                <div className="flex items-center space-x-3">
                                    <FaTags className="text-lg text-primary-500" />
                                    <span>{cat}</span>
                                </div>
                            </NavLink>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Sidebar;
