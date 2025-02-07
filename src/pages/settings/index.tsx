import { useState, useEffect } from 'react';
import { 
  Settings, 
  User, 
  Bell, 
  Shield, 
  FileText, 
  Database,
  Activity, 
  ClipboardEditIcon,
  AmpersandIcon
} from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import ProfileSettings from './ProfileSettings';
import NotificationSettings from './NotificationSettings';
import SecuritySettings from './SecuritySettings';
import AdminSettings from './AdminSettings';
import ProcessTemplatesTab from './ProcessTemplatesTab';
import BackupRestoreSettings from './BackupRestoreSettings';
import AuditLogSettings from './AuditLogSettings';
import CreateSuperAdmin from './CreateSuperAdmin';
import { useAuthGlobally } from '../../context/AuthContext';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');
  const [auth] = useAuthGlobally();

  const baseTabs = auth.user.role === 'superadmin' 
  ? [
      { id: 'profile', label: 'Profile', icon: User },
      { id: 'notifications', label: 'Notifications', icon: Bell },
      { id: 'security', label: 'Security', icon: Shield },
      { id: 'admins', label: 'Admin Management', icon: User },
      { id: 'templates', label: 'Process Templates', icon: FileText },
      { id: 'Create_Super_Admin', label: 'Create Super Admin', icon: ClipboardEditIcon },
      { id: 'backup', label: 'Backup & Restore', icon: Database },
      { id: 'audit', label: 'Audit Logs', icon: Activity }
    ]
  : [
      { id: 'profile', label: 'Profile', icon: User },
      { id: 'notifications', label: 'Notifications', icon: Bell },
      { id: 'security', label: 'Security', icon: Shield }
    ];


  //show all tabs
  const tabs = baseTabs;

  return (
    <div>
      <PageHeader
        title="Settings"
        icon={Settings}
      />

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-4 border-b-2 text-sm font-medium ${
                  activeTab === tab.id
                    ? 'border-brand-yellow text-brand-black'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-5 w-5" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'profile' && <ProfileSettings />}
          {activeTab === 'notifications' && <NotificationSettings />}
          {activeTab === 'security' && <SecuritySettings />}
          {activeTab === 'admins' && <AdminSettings />}
          {activeTab === 'templates' && <ProcessTemplatesTab />}
          {activeTab === 'backup' && <BackupRestoreSettings />}
          {activeTab === 'audit' && <AuditLogSettings />}
          {activeTab === 'Create_Super_Admin' && <CreateSuperAdmin />}
        </div>
      </div>
    </div>
  );
}


