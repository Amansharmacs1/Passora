import { useState } from 'react';
import api from '../services/api';
import Button from './Button';
import toast from 'react-hot-toast';
import { FaCloudUploadAlt, FaFileCsv } from 'react-icons/fa';

const ImportWizard = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResults(null);
    }
  };

  const handleImport = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setLoading(true);
    try {
      const response = await api.post('/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setResults(response.data);
      toast.success(response.data.message || 'Import successful');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to import CSV');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setResults(null);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Import Passwords</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        Import your passwords from other password managers like Chrome, Bitwarden, or LastPass using a CSV file.
      </p>

      {!results ? (
        <div className="space-y-6">
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl p-10 text-center hover:border-primary-500 dark:hover:border-primary-500 transition-colors">
            <input 
              type="file" 
              accept=".csv" 
              onChange={handleFileChange} 
              className="hidden" 
              id="csv-upload"
            />
            <label htmlFor="csv-upload" className="cursor-pointer flex flex-col items-center">
              <div className="w-16 h-16 bg-primary-50 dark:bg-primary-900/20 text-primary-600 rounded-full flex items-center justify-center text-3xl mb-4">
                {file ? <FaFileCsv /> : <FaCloudUploadAlt />}
              </div>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {file ? file.name : 'Click to upload CSV file'}
              </span>
              {!file && (
                <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Supported formats: .csv
                </span>
              )}
            </label>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleImport} disabled={!file || loading}>
              {loading ? 'Importing...' : 'Start Import'}
            </Button>
          </div>
        </div>
      ) : (
        <div className="text-center space-y-4 py-8">
          <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-full flex items-center justify-center mx-auto text-4xl mb-4">
            ✓
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Import Complete</h3>
          
          <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 inline-block text-left mx-auto">
            <p className="text-sm text-gray-700 dark:text-gray-300">Total Found: <strong className="text-gray-900 dark:text-white">{results.totalFound}</strong></p>
            <p className="text-sm text-green-700 dark:text-green-500 mt-1">Successfully Imported: <strong>{results.imported}</strong></p>
            <p className="text-sm text-yellow-700 dark:text-yellow-500 mt-1">Duplicates Skipped: <strong>{results.skipped}</strong></p>
          </div>

          <div className="pt-4">
            <Button onClick={handleReset} variant="secondary">
              Import Another File
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImportWizard;
