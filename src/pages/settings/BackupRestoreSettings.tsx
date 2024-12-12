import { useState } from 'react';
import { Download, Upload, Shield, Calendar } from 'lucide-react';
import Button from '../../components/Button';
import Input from '../../components/Input';
import { useStore } from '../../store';
import { useAdminStore } from '../../store/adminStore';
import { useTaskManagementStore } from '../../store/taskManagementStore';
import { useNoteStore } from '../../store/noteStore';
import { useFileStore } from '../../store/fileStore';
import { useServiceRequestStore } from '../../store/serviceRequestStore';

interface BackupRestoreSettingsProps {}

export default function BackupRestoreSettings() {
  const { currentAdmin } = useAdminStore();
  const [isScheduled, setIsScheduled] = useState(false);
  const [backupFrequency, setBackupFrequency] = useState('daily');
  const [backupTime, setBackupTime] = useState('00:00');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Get all store states and their setters
  const mainStore = useStore.getState();
  const adminStore = useAdminStore.getState();
  const taskStore = useTaskManagementStore.getState();
  const noteStore = useNoteStore.getState();
  const fileStore = useFileStore.getState();
  const serviceRequestStore = useServiceRequestStore.getState();

  // Get all store setters
  const setMainStore = useStore.setState;
  const setAdminStore = useAdminStore.setState;
  const setTaskStore = useTaskManagementStore.setState;
  const setNoteStore = useNoteStore.setState;
  const setFileStore = useFileStore.setState;
  const setServiceRequestStore = useServiceRequestStore.setState;

  if (currentAdmin?.role !== 'super_admin') {
    return (
      <div className="text-center py-8">
        <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900">Access Restricted</h3>
        <p className="mt-2 text-sm text-gray-500">
          Only super administrators can access backup and restore functionality.
        </p>
      </div>
    );
  }

  const handleBackup = () => {
    try {
      // Combine all store data
      const backupData = {
        timestamp: new Date().toISOString(),
        version: '1.0',
        data: {
          main: {
            clients: mainStore.clients,
            applications: mainStore.applications,
            japanVisitApplications: mainStore.japanVisitApplications,
            translations: mainStore.translations,
            graphicDesignJobs: mainStore.graphicDesignJobs,
            epassportApplications: mainStore.epassportApplications,
            otherServices: mainStore.otherServices,
            appointments: mainStore.appointments,
          },
          admin: {
            admins: adminStore.admins,
            permissions: adminStore.permissions,
          },
          tasks: {
            templates: taskStore.templates,
            clientProcesses: taskStore.clientProcesses,
          },
          notes: {
            notes: noteStore.notes,
          },
          files: {
            files: fileStore.files,
          },
          serviceRequests: {
            requests: serviceRequestStore.requests,
          },
        },
      };

      // Create and download backup file
      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setSuccess('Backup created successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Failed to create backup. Please try again.');
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleRestore = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const backupData = JSON.parse(e.target?.result as string);

          // Validate backup data structure
          if (!backupData.version || !backupData.data) {
            throw new Error('Invalid backup file format');
          }

          // Restore data to each store
          if (backupData.data.main) {
            setMainStore({
              clients: backupData.data.main.clients || [],
              applications: backupData.data.main.applications || [],
              japanVisitApplications: backupData.data.main.japanVisitApplications || [],
              translations: backupData.data.main.translations || [],
              graphicDesignJobs: backupData.data.main.graphicDesignJobs || [],
              epassportApplications: backupData.data.main.epassportApplications || [],
              otherServices: backupData.data.main.otherServices || [],
              appointments: backupData.data.main.appointments || [],
            });
          }

          if (backupData.data.admin) {
            setAdminStore({
              admins: backupData.data.admin.admins || [],
              permissions: backupData.data.admin.permissions || [],
            });
          }

          if (backupData.data.tasks) {
            setTaskStore({
              templates: backupData.data.tasks.templates || [],
              clientProcesses: backupData.data.tasks.clientProcesses || [],
            });
          }

          if (backupData.data.notes) {
            setNoteStore({
              notes: backupData.data.notes.notes || [],
            });
          }

          if (backupData.data.files) {
            setFileStore({
              files: backupData.data.files.files || [],
            });
          }

          if (backupData.data.serviceRequests) {
            setServiceRequestStore({
              requests: backupData.data.serviceRequests.requests || [],
            });
          }

          setSuccess('Data restored successfully! Please refresh the page.');
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        } catch (err) {
          setError('Failed to restore backup. Invalid file format.');
        }
      };
      reader.readAsText(file);
    } catch (err) {
      setError('Failed to restore backup. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium leading-6 text-gray-900">
        Backup & Restore
      </h3>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
          {success}
        </div>
      )}

      {/* Manual Backup */}
      <div className="bg-white shadow-sm rounded-lg p-6 border border-gray-200">
        <h4 className="text-lg font-medium mb-4">Manual Backup</h4>
        <p className="text-sm text-gray-500 mb-4">
          Create a backup of all system data. The backup file can be used to restore the system to this point in time.
        </p>
        <Button onClick={handleBackup}>
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
          <Button onClick={() => document.getElementById('restore-file')?.click()}>
            <Upload className="h-4 w-4 mr-2" />
            Upload Backup File
          </Button>
        </div>
      </div>

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