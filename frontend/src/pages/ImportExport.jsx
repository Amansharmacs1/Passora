import { useState } from 'react';
import Sidebar from '../components/Sidebar';
import ImportWizard from '../components/ImportWizard';
import Button from '../components/Button';
import api from '../services/api';
import toast from 'react-hot-toast';

const ImportExport = () => {
  const [exportPassword, setExportPassword] = useState('');
  const [exporting, setExporting] = useState(false);

  const handleExport = async (format) => {
    if (!exportPassword) {
      toast.error('Master Password required for export');
      return;
    }
    
    setExporting(true);
    try {
      const response = await api.get(`/export/${format}?masterPassword=${encodeURIComponent(exportPassword)}`, {
        responseType: format === 'csv' ? 'blob' : 'json'
      });
      
      let blob;
      if (format === 'csv') {
        blob = new Blob([response.data], { type: 'text/csv' });
      } else {
        blob = new Blob([JSON.stringify(response.data, null, 2)], { type: 'application/json' });
      }

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `passora_export.${format}`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);

      toast.success(`Vault exported as ${format.toUpperCase()}`);
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Export failed. Check your Master Password.');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="flex bg-gray-50 dark:bg-black/50 min-h-[calc(100vh-64px)]">
      <Sidebar />
      <div className="flex-1 p-6 lg:p-8 overflow-y-auto">
        <div className="max-w-3xl mx-auto space-y-8">
          
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Import & Export</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Migrate your data securely in and out of Passora.
            </p>
          </div>

          <ImportWizard />

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Export Vault</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              Exporting your vault will download a file containing all your unencrypted passwords (CSV) or symmetrically encrypted payload (JSON). Keep this file safe!
            </p>

            <div className="space-y-4 max-w-md">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Master Password</label>
                <input 
                  type="password"
                  value={exportPassword}
                  onChange={(e) => setExportPassword(e.target.value)}
                  placeholder="Verify your master password"
                  className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-primary-500 dark:text-white"
                />
              </div>

              <div className="flex space-x-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button variant="secondary" onClick={() => handleExport('csv')} disabled={!exportPassword || exporting} className="flex-1">
                  Export as CSV
                </Button>
                <Button onClick={() => handleExport('json')} disabled={!exportPassword || exporting} className="flex-1">
                  Export as Encrypted JSON
                </Button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ImportExport;
