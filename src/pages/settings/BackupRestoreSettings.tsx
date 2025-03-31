import { useState, useEffect } from 'react';
import { Download, Upload, Calendar } from 'lucide-react';
import Button from '../../components/Button';
import Input from '../../components/Input';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function BackupRestoreSettings() {
  const [isScheduled, setIsScheduled] = useState(false);
  const [intervalDays, setIntervalDays] = useState(5);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [hasNewBackup, setHasNewBackup] = useState(false);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);
  const [backupProgress, setBackupProgress] = useState(0);

  const API_URL = import.meta.env.VITE_REACT_APP_URL || 'http://localhost:5000';

  const notifySuccess = (message) => toast.success(message, { duration: 3000 });
  const notifyError = (message) => toast.error(message, { duration: 3000 });

  // Fetch schedule status on mount
  useEffect(() => {
    const fetchScheduleStatus = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/v1/backup/schedule-status`, { timeout: 5000 });
        setIsScheduled(response.data.isScheduled);
        if (response.data.isScheduled && response.data.intervalDays) {
          setIntervalDays(response.data.intervalDays);
        }
      } catch (err) {
        console.error('Error fetching schedule status:', err);
        notifyError('Failed to load backup schedule status.');
      }
    };
    fetchScheduleStatus();
  }, [API_URL]);

  // Polling for new backups when scheduled
  useEffect(() => {
    let interval;
    if (isScheduled) {
      interval = setInterval(async () => {
        try {
          const response = await axios.get(`${API_URL}/api/v1/backup/latest-backup`, { timeout: 5000 });
          if (response.status === 200) {
            setHasNewBackup(true);
          }
        } catch (err) {
          if (axios.isAxiosError(err) && err.response?.status === 404) {
            // No backup yet, ignore silently
          } else {
            console.error('Polling error:', err);
          }
        }
      }, 30000);
    }
    return () => clearInterval(interval);
  }, [isScheduled, API_URL]);

  const handleBackup = async () => {
    setLoading(true);
    setMessage('Creating backup, please wait...');
    setIsBackupModalOpen(true);
    setBackupProgress(0);

    // Simulated progress steps
    const progressSteps = [10, 23, 37, 50, 68, 79, 85, 90, 95, 98]; // Custom percentages
    let stepIndex = 0;

    const progressInterval = setInterval(() => {
      if (stepIndex < progressSteps.length) {
        setBackupProgress(progressSteps[stepIndex]);
        stepIndex++;
      }
    }, 400); // Update every 400ms for a smooth, visible progression

    try {
      const response = await axios.get(`${API_URL}/api/v1/backup//ackup-data`, {
        responseType: 'blob',
        timeout: 30000,
      });

      clearInterval(progressInterval); // Stop the simulation
      setBackupProgress(100); // Jump to 100% on completion

      const blob = new Blob([response.data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      notifySuccess('Backup downloaded successfully!');
    } catch (err) {
      clearInterval(progressInterval);
      console.error('Backup error:', err);
      notifyError(axios.isAxiosError(err) ? err.response?.data?.error || 'Server error.' : 'Network error.');
      setBackupProgress(0); // Reset on error
    } finally {
      setLoading(false);
      setMessage('');
      setTimeout(() => setIsBackupModalOpen(false), 500); // Delay to show 100% or reset
    }
  };

  const handleDownloadLatestBackup = async () => {
    setLoading(true);
    setMessage('Downloading latest scheduled backup...');

    try {
      const response = await axios.get(`${API_URL}/api/v1/backup/latest-backup`, {
        responseType: 'blob',
        timeout: 30000,
      });

      const blob = new Blob([response.data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      notifySuccess('Latest scheduled backup downloaded!');
      setHasNewBackup(false);
    } catch (err) {
      console.error('Download error:', err);
      notifyError(axios.isAxiosError(err) ? err.response?.data?.message || 'No backup available.' : 'Network error.');
    } finally {
      setLoading(false);
      setMessage('');
    }
  };

  const handleRestore = async (event) => {
    setLoading(true);
    setMessage('Restoring backup, please wait...');

    const file = event.target.files?.[0];
    if (!file) {
      setLoading(false);
      setMessage('');
      return;
    }

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const backupData = JSON.parse(e.target?.result);
          const response = await axios.post(`${API_URL}/api/v1/backup/restore`, { data: backupData }, { timeout: 60000 });
          if (response.status === 200) {
            notifySuccess('Data restored successfully! Refreshing page...');
            setTimeout(() => window.location.reload(), 2000);
          }
        } catch (err) {
          console.error('Restore error:', err);
          notifyError(axios.isAxiosError(err) ? err.response?.data?.error || 'Invalid backup data.' : 'Failed to restore backup.');
        } finally {
          setLoading(false);
          setMessage('');
        }
      };
      reader.onerror = () => {
        notifyError('Error reading backup file.');
        setLoading(false);
        setMessage('');
      };
      reader.readAsText(file);
    } catch (err) {
      notifyError('Failed to process restore.');
      setLoading(false);
      setMessage('');
    }
  };

  const updateScheduleBackup = async (newIntervalDays) => {
    if (newIntervalDays < 1) {
      notifyError('Interval days must be at least 1.');
      setIntervalDays(currentIntervalDays || 5);
      return;
    }

    setLoading(true);
    setMessage('Updating backup schedule, please wait...');

    try {
      const response = await axios.post(`${API_URL}/api/v1/backup/schedule`, { intervalDays: newIntervalDays }, { timeout: 10000 });
      notifySuccess(response.data.message);
      setIsScheduled(true);
    } catch (err) {
      console.error('Schedule error:', err);
      notifyError(axios.isAxiosError(err) ? err.response?.data?.error || 'Failed to update schedule.' : 'Network error.');
      setIntervalDays(currentIntervalDays || 5);
    } finally {
      setLoading(false);
      setMessage('');
    }
  };

  const handleScheduleBackup = async () => {
    await updateScheduleBackup(intervalDays);
  };

  const handleStopSchedule = async () => {
    setLoading(true);
    setMessage('Stopping scheduled backup...');

    try {
      const response = await axios.post(`${API_URL}/api/v1/backup/stop-schedule`, {}, { timeout: 10000 });
      notifySuccess(response.data.message);
      setIsScheduled(false);
      setHasNewBackup(false);
    } catch (err) {
      console.error('Stop schedule error:', err);
      notifyError(axios.isAxiosError(err) ? err.response?.data?.error || 'Failed to stop scheduled backup.' : 'Network error.');
    } finally {
      setLoading(false);
      setMessage('');
    }
  };

  const handleIntervalChange = (e) => {
    const newValue = Math.max(1, Number(e.target.value));
    setIntervalDays(newValue);
    if (isScheduled) {
      updateScheduleBackup(newValue);
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium leading-6 text-gray-900">Backup & Restore</h3>

      <div className="bg-white shadow-sm rounded-lg p-6 border border-gray-200">
        <h4 className="text-lg font-medium mb-4">Manual Backup</h4>
        <p className="text-sm text-gray-500 mb-4">
          Create a backup of all system data and download it to your computer.
        </p>
        <Button onClick={handleBackup} disabled={loading}>
          <Download className="h-4 w-4 mr-2" />
          Create Backup
        </Button>
      </div>

      <div className="bg-white shadow-sm rounded-lg p-6 border border-gray-200">
        <h4 className="text-lg font-medium mb-4">Restore Data</h4>
        <p className="text-sm text-gray-500 mb-4">
          Restore system data from a backup file. This will overwrite current data.
        </p>
        <div className="flex items-center gap-4">
          <input
            type="file"
            accept=".json"
            onChange={handleRestore}
            className="hidden"
            id="restore-file"
            disabled={loading}
          />
          <Button onClick={() => document.getElementById('restore-file')?.click()} disabled={loading}>
            <Upload className="h-4 w-4 mr-2" />
            Upload Backup File
          </Button>
        </div>
      </div>

      <div className="bg-white shadow-sm rounded-lg p-6 border border-gray-200">
        <h4 className="text-lg font-medium mb-4">Automated Backup</h4>
        <div className="flex items-center justify-between mb-4">
          <span>Enable Scheduled Backup</span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={isScheduled}
              onChange={(e) => (e.target.checked ? handleScheduleBackup() : handleStopSchedule())}
              disabled={loading}
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand-yellow/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-yellow"></div>
          </label>
        </div>

        {isScheduled && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Backup Interval (Days)</label>
              <Input
                type="number"
                min="1"
                value={intervalDays}
                onChange={handleIntervalChange}
                className="mt-1"
                disabled={loading}
              />
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Calendar className="h-4 w-4" />
              <span>Next backup: {new Date(Date.now() + intervalDays * 24 * 60 * 60 * 1000).toLocaleDateString()}</span>
            </div>
            {hasNewBackup && (
              <div className="mt-4">
                <p className="text-sm text-green-600 mb-2">A new scheduled backup is ready!</p>
                <Button onClick={handleDownloadLatestBackup} disabled={loading}>
                  <Download className="h-4 w-4 mr-2" />
                  Download Latest Backup
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Backup Modal with Progress Bar */}
      {isBackupModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-96">
            <div className="flex flex-col items-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Creating Backup
              </h3>
              <p className="text-sm text-gray-600 text-center mb-4">
                Please wait, we are creating a full database backup. This may take a moment.
              </p>
              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                <div
                  className="bg-[#fcda00] h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${backupProgress}%` }}
                ></div>
              </div>
              <p className="text-sm font-medium text-gray-700">
                {backupProgress}% Complete
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Loading Indicator (optional, kept for other operations) */}
      {loading && !isBackupModalOpen && (
        <div className="bg-blue-100 text-blue-800 p-4 rounded-md mt-4">
          <span className="font-medium">{message}</span>
        </div>
      )}
    </div>
  );
}