import api from './api';

const getFolders = async () => {
  const response = await api.get('/folders');
  return response.data;
};

const createFolder = async (folderData) => {
  const response = await api.post('/folders', folderData);
  return response.data;
};

const updateFolder = async (id, folderData) => {
  const response = await api.put(`/folders/${id}`, folderData);
  return response.data;
};

const deleteFolder = async (id) => {
  const response = await api.delete(`/folders/${id}`);
  return response.data;
};

export default {
  getFolders,
  createFolder,
  updateFolder,
  deleteFolder,
};
