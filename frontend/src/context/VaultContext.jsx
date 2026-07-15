import { createContext, useState, useEffect, useContext } from 'react';
import vaultService from '../services/vaultService';
import folderService from '../services/folderService';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

export const VaultContext = createContext();

export const VaultProvider = ({ children }) => {
  const { user } = useAuth();
  const [vaults, setVaults] = useState([]);
  const [trashVaults, setTrashVaults] = useState([]);
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(false);

  const defaultCategories = ['Social', 'Work', 'Finance', 'Entertainment', 'Shopping', 'Education', 'Gaming', 'Development', 'Travel', 'Others'];

  // Calculate dashboard stats dynamically
  const stats = {
    total: vaults.filter(v => !v.archived && !v.deleted).length,
    favorites: vaults.filter(v => v.favorite && !v.deleted).length,
    archived: vaults.filter(v => v.archived && !v.deleted).length,
    trash: trashVaults.length,
    recentlyAdded: vaults.filter(v => !v.deleted && (new Date() - new Date(v.createdAt) < 7 * 24 * 60 * 60 * 1000)).length,
  };

  const fetchVaults = async () => {
    try {
      setLoading(true);
      const data = await vaultService.getVaults();
      setVaults(data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch vault items');
    } finally {
      setLoading(false);
    }
  };

  const fetchTrashVaults = async () => {
    try {
      const data = await vaultService.getTrashVaults();
      setTrashVaults(data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchFolders = async () => {
    try {
      const data = await folderService.getFolders();
      setFolders(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchVaults();
      fetchFolders();
      fetchTrashVaults();
    } else {
      setVaults([]);
      setFolders([]);
      setTrashVaults([]);
    }
  }, [user]);

  const refreshVaultData = () => {
    fetchVaults();
    fetchTrashVaults();
    fetchFolders();
  };

  return (
    <VaultContext.Provider
      value={{
        vaults,
        trashVaults,
        folders,
        loading,
        stats,
        defaultCategories,
        refreshVaultData,
        fetchVaults,
        fetchTrashVaults,
        fetchFolders,
      }}
    >
      {children}
    </VaultContext.Provider>
  );
};
