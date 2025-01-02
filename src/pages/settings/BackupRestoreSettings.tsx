import { useState } from 'react';
import { Download, Upload, Calendar } from 'lucide-react';
import Button from '../../components/Button';
import Input from '../../components/Input';
import axios from 'axios';
import toast from 'react-hot-toast'; // Import toast from react-hot-toast

export default function BackupRestoreSettings() {
  const [isScheduled, setIsScheduled] = useState(false);
  const [backupFrequency, setBackupFrequency] = useState('daily');
  const [backupTime, setBackupTime] = useState('00:00');
  const [loading, setLoading] = useState(false); // State to track loading status
  const [message, setMessage] = useState(''); // State to show the current loading message

  // Success toast notification
  const notifySuccess = (message: string) => {
    toast.success(message, { duration: 3000 });
  };

  // Error toast notification
  const notifyError = (message: string) => {
    toast.error(message, { duration: 3000 });
  };

  const handleBackup = async () => {
    setLoading(true); // Start loading
    setMessage('Please wait, backup is in progress...'); // Show loading message

    try {
      const response = await axios.get(`${import.meta.env.VITE_REACT_APP_URL}/api/v1/backup/backup`);
      const blob = new Blob([JSON.stringify(response.data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      notifySuccess('Backup created successfully!');
    } catch (err) {
      notifyError('Failed to create backup. Please try again.');
    } finally {
      setLoading(false); // Stop loading
      setMessage(''); // Clear the loading message
    }
  };

  const handleRestore = async (event: React.ChangeEvent<HTMLInputElement>) => {
    setLoading(true); // Start loading
    setMessage('Please wait, restore is in progress...'); // Show loading message

    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const backupData = JSON.parse(e.target?.result as string);
          const response = await axios.post(`${import.meta.env.VITE_REACT_APP_URL}/api/v1/backup/restore`, { data: backupData });

          if (response.status === 200) {
            notifySuccess('Data restored successfully! Please refresh the page.');
            setTimeout(() => {
              window.location.reload();
            }, 2000);
          } else {
            notifyError('Failed to restore backup. Invalid file format.');
          }
        } catch (err) {
          notifyError('Failed to restore backup. Invalid file format.');
        }
      };
      reader.readAsText(file);
    } catch (err) {
      notifyError('Failed to restore backup. Please try again.');
    } finally {
      setLoading(false); // Stop loading
      setMessage(''); // Clear the loading message
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium leading-6 text-gray-900">
        Backup & Restore
      </h3>

      {/* Manual Backup */}
      <div className="bg-white shadow-sm rounded-lg p-6 border border-gray-200">
        <h4 className="text-lg font-medium mb-4">Manual Backup</h4>
        <p className="text-sm text-gray-500 mb-4">
          Create a backup of all system data. The backup file can be used to restore the system to this point in time.
        </p>
        <Button onClick={handleBackup} disabled={loading}>
          <Download className="h-4 w-4 mr-2" />
          Create Backup
        </Button>
      </div>

      {/* Restore */}
      <div className="bg-white shadow-sm rounded-lg p-6 border border-gray-200">
        <h4 className="text-lg font-medium mb-4">Restore Data</h4>
        <p className="text-sm text-gray-500 mb-4">
          Restore system data from a backup file. This will replace all current data with the backup data.
        </p>
        <div className="flex items-center gap-4">
          <input
            type="file"
            accept=".json"
            onChange={handleRestore}
            className="hidden"
            id="restore-file"
          />
          <Button onClick={() => document.getElementById('restore-file')?.click()} disabled={loading}>
            <Upload className="h-4 w-4 mr-2" />
            Upload Backup File
          </Button>
        </div>
      </div>

      {/* Loading Message */}
      {loading && (
        <div className="bg-yellow-100 text-yellow-800 p-4 rounded-md mt-4">
          <span className="font-medium">{message}</span>
        </div>
      )}

      {/* Automated Backup */}
      <div className="bg-white shadow-sm rounded-lg p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-medium">Automated Backup</h4>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={isScheduled}
              onChange={(e) => setIsScheduled(e.target.checked)}
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand-yellow/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-yellow"></div>
          </label>
        </div>

        {isScheduled && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Frequency</label>
              <select
                value={backupFrequency}
                onChange={(e) => setBackupFrequency(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-yellow focus:ring-brand-yellow"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Time</label>
              <Input
                type="time"
                value={backupTime}
                onChange={(e) => setBackupTime(e.target.value)}
                className="mt-1"
              />
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Calendar className="h-4 w-4" />
              <span>Next backup: {new Date().toLocaleDateString()} at {backupTime}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}



// note : -- remaining work on Automated Backup backend controller done