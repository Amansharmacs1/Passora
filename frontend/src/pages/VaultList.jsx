import { useState, useContext, useMemo } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { VaultContext } from '../context/VaultContext';
import Sidebar from '../components/Sidebar';
import VaultCard from '../components/VaultCard';
import VaultFormModal from '../components/VaultFormModal';
import VaultDetailsModal from '../components/VaultDetailsModal';
import FolderFormModal from '../components/FolderFormModal';
import Button from '../components/Button';
import Input from '../components/Input';
import { FaPlus, FaSearch, FaFilter, FaSort } from 'react-icons/fa';
import vaultService from '../services/vaultService';
import folderService from '../services/folderService';
import toast from 'react-hot-toast';

const VaultList = () => {
    const { vaults, trashVaults, refreshVaultData } = useContext(VaultContext);
    const { folderId, categoryName } = useParams();
    const location = useLocation();

    // State for modals
    const [isVaultFormOpen, setIsVaultFormOpen] = useState(false);
    const [isVaultDetailsOpen, setIsVaultDetailsOpen] = useState(false);
    const [isFolderFormOpen, setIsFolderFormOpen] = useState(false);
    
    // State for editing/viewing
    const [selectedVault, setSelectedVault] = useState(null);
    const [selectedFolder, setSelectedFolder] = useState(null);

    // Filter and Sort state
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('newest');

    // Determine current view based on URL
    const isFavorites = location.pathname.includes('/favorites');
    const isArchive = location.pathname.includes('/archive');
    const isTrash = location.pathname.includes('/trash');

    const handleVaultAction = async (action, vault) => {
        try {
            switch(action) {
                case 'edit':
                    setSelectedVault(vault);
                    setIsVaultFormOpen(true);
                    break;
                case 'delete':
                    await vaultService.deleteVault(vault._id);
                    toast.success('Moved to trash');
                    refreshVaultData();
                    break;
                case 'restore':
                    await vaultService.restoreVault(vault._id);
                    toast.success('Restored from trash');
                    refreshVaultData();
                    break;
                case 'permanentDelete':
                    if (window.confirm('Are you sure you want to permanently delete this?')) {
                        await vaultService.permanentDeleteVault(vault._id);
                        toast.success('Permanently deleted');
                        refreshVaultData();
                    }
                    break;
                case 'archive':
                    await vaultService.archiveVault(vault._id);
                    toast.success(vault.archived ? 'Unarchived' : 'Archived');
                    refreshVaultData();
                    break;
                case 'favorite':
                    await vaultService.favoriteVault(vault._id);
                    refreshVaultData();
                    break;
                case 'copyPassword':
                    const data = await vaultService.getVaultById(vault._id);
                    navigator.clipboard.writeText(data.password);
                    toast.success('Password copied');
                    break;
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Action failed');
        }
    };

    const handleFolderDelete = async (id) => {
        if(window.confirm('Are you sure you want to delete this folder? Passwords will not be deleted.')){
            try {
                await folderService.deleteFolder(id);
                toast.success('Folder deleted');
                refreshVaultData();
            } catch(e) {
                toast.error('Failed to delete folder');
            }
        }
    };

    // Filter logic
    const filteredVaults = useMemo(() => {
        let list = isTrash ? trashVaults : vaults;

        // Base filtering based on route
        if (!isTrash) {
            if (isFavorites) list = list.filter(v => v.favorite && !v.deleted && !v.archived);
            else if (isArchive) list = list.filter(v => v.archived && !v.deleted);
            else if (folderId) list = list.filter(v => v.folder === folderId && !v.deleted && !v.archived);
            else if (categoryName) list = list.filter(v => v.category.toLowerCase() === categoryName.toLowerCase() && !v.deleted && !v.archived);
            else list = list.filter(v => !v.deleted && !v.archived);
        }

        // Search query filtering
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            list = list.filter(v => 
                v.title.toLowerCase().includes(q) || 
                (v.username && v.username.toLowerCase().includes(q)) ||
                (v.email && v.email.toLowerCase().includes(q)) ||
                (v.website && v.website.toLowerCase().includes(q)) ||
                (v.tags && v.tags.some(t => t.toLowerCase().includes(q)))
            );
        }

        // Sorting
        return list.sort((a, b) => {
            if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
            if (sortBy === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
            if (sortBy === 'a-z') return a.title.localeCompare(b.title);
            if (sortBy === 'z-a') return b.title.localeCompare(a.title);
            if (sortBy === 'recent') return new Date(b.updatedAt) - new Date(a.updatedAt);
            return 0;
        });

    }, [vaults, trashVaults, isTrash, isFavorites, isArchive, folderId, categoryName, searchQuery, sortBy]);

    const getTitle = () => {
        if (isFavorites) return 'Favorites';
        if (isArchive) return 'Archive';
        if (isTrash) return 'Trash';
        if (folderId) return 'Folder View';
        if (categoryName) return categoryName.charAt(0).toUpperCase() + categoryName.slice(1);
        return 'All Passwords';
    };

    return (
        <div className="flex bg-gray-50 dark:bg-black/50 min-h-[calc(100vh-64px)]">
            <Sidebar 
                onOpenFolderModal={() => { setSelectedFolder(null); setIsFolderFormOpen(true); }}
                onEditFolder={(folder) => { setSelectedFolder(folder); setIsFolderFormOpen(true); }}
                onDeleteFolder={handleFolderDelete}
            />
            
            <div className="flex-1 p-6 lg:p-8 overflow-y-auto">
                <div className="max-w-6xl mx-auto">
                    
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{getTitle()}</h1>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{filteredVaults.length} items</p>
                        </div>
                        <div className="flex items-center space-x-3">
                            <Button onClick={() => { setSelectedVault(null); setIsVaultFormOpen(true); }}>
                                <FaPlus className="mr-2" /> New Password
                            </Button>
                        </div>
                    </div>

                    {/* Toolbar */}
                    <div className="flex flex-col sm:flex-row gap-4 mb-8">
                        <div className="relative flex-1">
                            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input 
                                type="text"
                                placeholder="Search passwords..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all dark:text-white"
                            />
                        </div>
                        <div className="flex items-center space-x-3">
                            <div className="relative flex items-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5">
                                <FaSort className="text-gray-400 mr-2" />
                                <select 
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="bg-transparent border-none text-sm text-gray-700 dark:text-gray-300 outline-none cursor-pointer"
                                >
                                    <option value="newest">Newest</option>
                                    <option value="oldest">Oldest</option>
                                    <option value="a-z">A-Z</option>
                                    <option value="z-a">Z-A</option>
                                    <option value="recent">Recently Updated</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Grid */}
                    {filteredVaults.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {filteredVaults.map(vault => (
                                <VaultCard 
                                    key={vault._id}
                                    vault={vault}
                                    onClick={(v) => { setSelectedVault(v); setIsVaultDetailsOpen(true); }}
                                    onAction={handleVaultAction}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 border-dashed">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 mb-4">
                                <FaShieldAlt className="text-2xl text-gray-400" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No passwords found</h3>
                            <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
                                {searchQuery ? "We couldn't find anything matching your search." : "Get started by adding your first password to the vault."}
                            </p>
                            {!searchQuery && !isTrash && !isArchive && (
                                <Button className="mt-6" onClick={() => { setSelectedVault(null); setIsVaultFormOpen(true); }}>
                                    <FaPlus className="mr-2" /> Add Password
                                </Button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Modals */}
            <VaultFormModal 
                isOpen={isVaultFormOpen} 
                onClose={() => setIsVaultFormOpen(false)} 
                vaultToEdit={selectedVault} 
            />
            
            <VaultDetailsModal
                isOpen={isVaultDetailsOpen}
                onClose={() => setIsVaultDetailsOpen(false)}
                vault={selectedVault}
            />

            <FolderFormModal
                isOpen={isFolderFormOpen}
                onClose={() => setIsFolderFormOpen(false)}
                folderToEdit={selectedFolder}
            />
        </div>
    );
};

export default VaultList;
