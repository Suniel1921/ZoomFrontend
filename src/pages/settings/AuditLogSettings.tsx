// import { useState } from 'react';
// import { Shield, Download, Filter, Calendar, Search, Trash2 } from 'lucide-react';
// import Button from '../../components/Button';
// import Input from '../../components/Input';
// import { useAuditLogStore, type AuditAction, type UserType } from '../../store/auditLogStore';
// import { useAdminStore } from '../../store/adminStore';
// import DatePicker from 'react-datepicker';
// import "react-datepicker/dist/react-datepicker.css";
// import { decrypt } from '../../utils/encryption';

// const ACTION_TYPES: AuditAction[] = [
//   'login',
//   'logout',
//   'create',
//   'update',
//   'delete',
//   'import',
//   'export',
//   'view',
//   'failed_login'
// ];

// const USER_TYPES: UserType[] = ['super_admin', 'admin', 'client'];

// export default function AuditLogSettings() {
//   const { currentAdmin } = useAdminStore();
//   const { logs, exportLogs, setRetentionDays, clearAllLogs } = useAuditLogStore();
  
//   const [searchQuery, setSearchQuery] = useState('');
//   const [selectedActions, setSelectedActions] = useState<AuditAction[]>([]);
//   const [selectedUserTypes, setSelectedUserTypes] = useState<UserType[]>([]);
//   const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
//   const [showFilters, setShowFilters] = useState(false);

//   // Only allow super admin access
//   if (currentAdmin?.role !== 'super_admin') {
//     return (
//       <div className="text-center py-8">
//         <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
//         <h3 className="text-lg font-medium text-gray-900">Access Restricted</h3>
//         <p className="mt-2 text-sm text-gray-500">
//           Only super administrators can access the audit logs.
//         </p>
//       </div>
//     );
//   }

//   const filteredLogs = logs.filter(log => {
//     // Apply date range filter
//     if (dateRange[0] && new Date(log.timestamp) < dateRange[0]) return false;
//     if (dateRange[1] && new Date(log.timestamp) > dateRange[1]) return false;

//     // Apply action type filter
//     if (selectedActions.length > 0 && !selectedActions.includes(log.action)) return false;

//     // Apply user type filter
//     if (selectedUserTypes.length > 0 && !selectedUserTypes.includes(log.userType)) return false;

//     // Apply search query
//     if (searchQuery) {
//       const searchLower = searchQuery.toLowerCase();
//       const decryptedDetails = decrypt(log.details);
//       return (
//         log.userName.toLowerCase().includes(searchLower) ||
//         log.resource.toLowerCase().includes(searchLower) ||
//         decryptedDetails.toLowerCase().includes(searchLower)
//       );
//     }

//     return true;
//   }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

//   const handleExport = () => {
//     exportLogs('csv');
//   };

//   const handleClearLogs = () => {
//     if (window.confirm('Are you sure you want to clear all audit logs? This action cannot be undone.')) {
//       clearAllLogs();
//     }
//   };

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div className="flex justify-between items-center">
//         <h3 className="text-lg font-medium">Audit Logs</h3>
//         <div className="flex gap-2">
//           <Button variant="outline" onClick={handleExport}>
//             <Download className="h-4 w-4 mr-2" />
//             Export CSV
//           </Button>
//           <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
//             <Filter className="h-4 w-4 mr-2" />
//             Filters
//           </Button>
//           <Button 
//             variant="outline" 
//             onClick={handleClearLogs}
//             className="text-red-500 hover:text-red-700"
//           >
//             <Trash2 className="h-4 w-4 mr-2" />
//             Clear Logs
//           </Button>
//         </div>
//       </div>

//       {/* Filters */}
//       {showFilters && (
//         <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <div>
//               <label className="block text-sm font-medium text-gray-700">Date Range</label>
//               <div className="mt-1 flex gap-2">
//                 <DatePicker
//                   selected={dateRange[0]}
//                   onChange={(date) => setDateRange([date, dateRange[1]])}
//                   selectsStart
//                   startDate={dateRange[0]}
//                   endDate={dateRange[1]}
//                   className="block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-yellow focus:ring-brand-yellow"
//                   placeholderText="Start Date"
//                 />
//                 <DatePicker
//                   selected={dateRange[1]}
//                   onChange={(date) => setDateRange([dateRange[0], date])}
//                   selectsEnd
//                   startDate={dateRange[0]}
//                   endDate={dateRange[1]}
//                   minDate={dateRange[0]}
//                   className="block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-yellow focus:ring-brand-yellow"
//                   placeholderText="End Date"
//                 />
//               </div>
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700">Search</label>
//               <Input
//                 type="search"
//                 placeholder="Search logs..."
//                 value={searchQuery}
//                 onChange={(e) => setSearchQuery(e.target.value)}
//                 className="mt-1"
//               />
//             </div>
//           </div>

//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <div>
//               <label className="block text-sm font-medium text-gray-700">Action Types</label>
//               <div className="mt-2 grid grid-cols-2 gap-2">
//                 {ACTION_TYPES.map((action) => (
//                   <label key={action} className="flex items-center">
//                     <input
//                       type="checkbox"
//                       checked={selectedActions.includes(action)}
//                       onChange={(e) => {
//                         if (e.target.checked) {
//                           setSelectedActions([...selectedActions, action]);
//                         } else {
//                           setSelectedActions(selectedActions.filter(a => a !== action));
//                         }
//                       }}
//                       className="rounded border-gray-300 text-brand-yellow focus:ring-brand-yellow"
//                     />
//                     <span className="ml-2 text-sm text-gray-700">
//                       {action.charAt(0).toUpperCase() + action.slice(1)}
//                     </span>
//                   </label>
//                 ))}
//               </div>
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700">User Types</label>
//               <div className="mt-2 space-y-2">
//                 {USER_TYPES.map((type) => (
//                   <label key={type} className="flex items-center">
//                     <input
//                       type="checkbox"
//                       checked={selectedUserTypes.includes(type)}
//                       onChange={(e) => {
//                         if (e.target.checked) {
//                           setSelectedUserTypes([...selectedUserTypes, type]);
//                         } else {
//                           setSelectedUserTypes(selectedUserTypes.filter(t => t !== type));
//                         }
//                       }}
//                       className="rounded border-gray-300 text-brand-yellow focus:ring-brand-yellow"
//                     />
//                     <span className="ml-2 text-sm text-gray-700">
//                       {type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
//                     </span>
//                   </label>
//                 ))}
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Logs Table */}
//       <div className="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200">
//         <div className="overflow-x-auto">
//           <table className="min-w-full divide-y divide-gray-200">
//             <thead className="bg-gray-50">
//               <tr>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Timestamp
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   User
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Action
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Resource
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Details
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   IP Address
//                 </th>
//               </tr>
//             </thead>
//             <tbody className="bg-white divide-y divide-gray-200">
//               {filteredLogs.map((log) => (
//                 <tr key={log.id} className="hover:bg-gray-50">
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                     {new Date(log.timestamp).toLocaleString()}
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     <div className="text-sm font-medium text-gray-900">{log.userName}</div>
//                     <div className="text-sm text-gray-500">{log.userType}</div>
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     <span className={`px-2 py-1 text-xs font-medium rounded-full ${
//                       log.action === 'failed_login' ? 'bg-red-100 text-red-800' :
//                       log.action === 'login' || log.action === 'logout' ? 'bg-blue-100 text-blue-800' :
//                       log.action === 'create' ? 'bg-green-100 text-green-800' :
//                       log.action === 'delete' ? 'bg-red-100 text-red-800' :
//                       'bg-gray-100 text-gray-800'
//                     }`}>
//                       {log.action}
//                     </span>
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                     {log.resource}
//                   </td>
//                   <td className="px-6 py-4 text-sm text-gray-500">
//                     {decrypt(log.details)}
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                     {log.ipAddress}
//                   </td>
//                 </tr>
//               ))}
//               {filteredLogs.length === 0 && (
//                 <tr>
//                   <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
//                     No audit logs found
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   );
// }













import { useState, useEffect } from "react";
import {
  Shield,
  Download,
  Filter,
  Calendar,
  Search,
  Trash2,
} from "lucide-react";
import Button from "../../components/Button";
import Input from "../../components/Input";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import axios from "axios";
import { AuditAction, AuditLog, UserType } from "../../store/auditLogStore";

const ACTION_TYPES: AuditAction[] = [
  "login",
  "logout",
  "create",   // Ensure "create" is included here
  "update",   // Ensure "update" is included here
  "delete",
  "import",
  "export",
  "view",
  "failed_login",
];

const USER_TYPES: UserType[] = ["super_admin", "admin", "client"];

export default function AuditLogSettings() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedActions, setSelectedActions] = useState<AuditAction[]>([]);
  const [selectedUserTypes, setSelectedUserTypes] = useState<UserType[]>([]);
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
  const [showFilters, setShowFilters] = useState(false);

  // Fetch logs when component is mounted
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_REACT_APP_URL}/api/v1/logs/get-audit-log`
        );
        console.log(response.data); // Check the response
        if (response.data.logs && Array.isArray(response.data.logs)) {
          setLogs(response.data.logs);
        } else {
          console.error("Unexpected data format:", response.data);
        }
      } catch (error) {
        console.error("Error fetching audit logs:", error);
      }
    };

    fetchLogs();
  }, []);

  const filteredLogs = logs
    .filter((log) => {
      // Apply date range filter
      if (dateRange[0] && new Date(log.timestamp) < dateRange[0]) return false;
      if (dateRange[1] && new Date(log.timestamp) > dateRange[1]) return false;

      // Apply action type filter
      if (selectedActions.length > 0 && !selectedActions.includes(log.action))
        return false;

      // Apply user type filter
      if (selectedUserTypes.length > 0 && !selectedUserTypes.includes(log.userType))
        return false;

      // Apply search query
      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase();
        return (
          log.userName.toLowerCase().includes(searchLower) ||
          log.resource.toLowerCase().includes(searchLower) ||
          log.details.toLowerCase().includes(searchLower) // No decryption here
        );
      }

      return true;
    })
    .sort((a, b) => {
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });

  const handleExport = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_REACT_APP_URL}/api/v1/logs/exports-logs`,
        {
          params: { format: "csv" },
          responseType: "blob",
        }
      );

      // Create a download link for the CSV file
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `audit-logs-${new Date().toISOString().split("T")[0]}.csv`
      );
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      console.error("Error exporting logs:", error);
    }
  };

  const handleClearLogs = async () => {
    if (
      window.confirm(
        "Are you sure you want to clear all audit logs? This action cannot be undone."
      )
    ) {
      try {
        await axios.delete(
          `${import.meta.env.VITE_REACT_APP_URL}/api/v1/logs/clear-all-logs`
        );
        setLogs([]); // Clear local state
      } catch (error) {
        console.error("Error clearing logs:", error);
      }
    }
  };

  const actionLabels = {
    login: "Login",
    logout: "Logout",
    create: "Create",   // Correct label for "create"
    update: "Update",   // Correct label for "update"
    delete: "Delete",
    import: "Import",
    export: "Export",
    view: "View",
    failed_login: "Failed Login",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Audit Logs</h3>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
          <Button
            variant="outline"
            onClick={handleClearLogs}
            className="text-red-500 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear Logs
          </Button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Date Range
              </label>
              <div className="mt-1 flex gap-2">
                <DatePicker
                  selected={dateRange[0]}
                  onChange={(date) => setDateRange([date, dateRange[1]])}
                  selectsStart
                  startDate={dateRange[0]}
                  endDate={dateRange[1]}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-yellow focus:ring-brand-yellow"
                  placeholderText="Start Date"
                />
                <DatePicker
                  selected={dateRange[1]}
                  onChange={(date) => setDateRange([dateRange[0], date])}
                  selectsEnd
                  startDate={dateRange[0]}
                  endDate={dateRange[1]}
                  minDate={dateRange[0]}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-yellow focus:ring-brand-yellow"
                  placeholderText="End Date"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Search
              </label>
              <Input
                type="search"
                placeholder="Search logs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="mt-1"
              />
            </div>

            {/* Action Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Actions
              </label>
              <div className="mt-1">
                {ACTION_TYPES.map((action) => (
                  <div key={action} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`action-${action}`}
                      checked={selectedActions.includes(action)}
                      onChange={() => {
                        setSelectedActions((prev) =>
                          prev.includes(action)
                            ? prev.filter((item) => item !== action)
                            : [...prev, action]
                        );
                      }}
                    />
                    <label htmlFor={`action-${action}`} className="ml-2">
                      {actionLabels[action]} {/* Ensure this renders properly */}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* User Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                User Type
              </label>
              <div className="mt-1">
                {USER_TYPES.map((userType) => (
                  <div key={userType} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`userType-${userType}`}
                      checked={selectedUserTypes.includes(userType)}
                      onChange={() => {
                        setSelectedUserTypes((prev) =>
                          prev.includes(userType)
                            ? prev.filter((item) => item !== userType)
                            : [...prev, userType]
                        );
                      }}
                    />
                    <label htmlFor={`userType-${userType}`} className="ml-2">
                      {userType}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Logs Table */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200">
        {filteredLogs.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No audit logs available.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Timestamp
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Resource
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    IP Address
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {log.userName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {log.userType}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          log.action === "login"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {actionLabels[log.action] ||
                          log.action.charAt(0).toUpperCase() +
                            log.action.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {log.resource}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {typeof log.details === "object"
                        ? JSON.stringify(log.details)
                        : log.details}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {log.ipAddress}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
