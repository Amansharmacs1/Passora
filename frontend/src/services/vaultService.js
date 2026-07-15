import api from './api';

const getVaults = async () => {
  const response = await api.get('/vault');
  return response.data;
};

const getTrashVaults = async () => {
    const response = await api.get('/vault/trash');
    return response.data;
};

const getVaultById = async (id) => {
  const response = await api.get(`/vault/${id}`);
  return response.data;
};

const createVault = async (vaultData) => {
  const response = await api.post('/vault', vaultData);
  return response.data;
};

const updateVault = async (id, vaultData) => {
  const response = await api.put(`/vault/${id}`, vaultData);
  return response.data;
};

const deleteVault = async (id) => {
  const response = await api.delete(`/vault/${id}`);
  return response.data;
};

const archiveVault = async (id) => {
  const response = await api.patch(`/vault/${id}/archive`);
  return response.data;
};

const favoriteVault = async (id) => {
  const response = await api.patch(`/vault/${id}/favorite`);
  return response.data;
};

const restoreVault = async (id) => {
  const response = await api.patch(`/vault/${id}/restore`);
  return response.data;
};

const permanentDeleteVault = async (id) => {
  const response = await api.delete(`/vault/${id}/permanent`);
  return response.data;
};

const searchVaults = async (query) => {
  const response = await api.get(`/vault/search?q=${query}`);
  return response.data;
};

export default {
  getVaults,
  getTrashVaults,
  getVaultById,
  createVault,
  updateVault,
  deleteVault,
  archiveVault,
  favoriteVault,
  restoreVault,
  permanentDeleteVault,
  searchVaults,
};
