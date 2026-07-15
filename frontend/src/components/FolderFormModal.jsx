import { useState, useContext, useEffect } from 'react';
import Modal from './Modal';
import Button from './Button';
import Input from './Input';
import { useForm } from 'react-hook-form';
import folderService from '../services/folderService';
import toast from 'react-hot-toast';
import { VaultContext } from '../context/VaultContext';

const FolderFormModal = ({ isOpen, onClose, folderToEdit = null }) => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(false);
  const { fetchFolders } = useContext(VaultContext);

  useEffect(() => {
    if (folderToEdit) {
      reset({ name: folderToEdit.name });
    } else {
      reset({ name: '' });
    }
  }, [folderToEdit, reset, isOpen]);

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      if (folderToEdit) {
        await folderService.updateFolder(folderToEdit._id, data);
        toast.success('Folder updated successfully');
      } else {
        await folderService.createFolder(data);
        toast.success('Folder created successfully');
      }
      fetchFolders();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={folderToEdit ? 'Rename Folder' : 'New Folder'}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Folder Name"
          type="text"
          placeholder="e.g. Work, Personal"
          {...register('name', { required: 'Folder name is required' })}
          error={errors.name?.message}
        />
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" isLoading={loading}>
            {folderToEdit ? 'Save' : 'Create'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default FolderFormModal;
