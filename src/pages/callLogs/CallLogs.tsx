import React, { useState, useEffect } from 'react';
import { PlusCircle, Loader2, Save, AlertCircle } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

interface CallLog {
  _id: string;
  name: string;
  phone: string;
  purpose: string;
  followUp : string;
  handler: string;
  remarks: 'Done' | 'Working on it' | 'Stuck' | 'Complete';
  date: string;
  createdAt: string;
  updatedAt: string;
}

interface NewCallLog {
  name: string;
  phone: string;
  purpose: string;
  handler: string;
  followUp: string;
  remarks: 'Done' | 'Working on it' | 'Stuck' | 'Complete';
  date: string;
}

const INITIAL_NEW_ROW: NewCallLog = {
  name: '',
  phone: '',
  purpose: '',
  handler: '',
  followUp : 'No',
  remarks: 'Working on it',
  date: '',
};

const CallLogs: React.FC = () => {
  const [rows, setRows] = useState<CallLog[]>([]);
  const [newRow, setNewRow] = useState<NewCallLog>(INITIAL_NEW_ROW);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [handlers, setHandlers] = useState<{ id: string; name: string }[]>([]);

  // Fetch Call Logs
  const fetchCallLogs = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem('token') || '{}');
      const token = userData.token;
      
      if (!token) {
        throw new Error('Token not found. Please log in again.');
      }

      const response = await fetch(`${import.meta.env.VITE_REACT_APP_URL}/api/v1/callLogs/get-all-call-logs`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message);
      }

      const responseData = await response.json();
      setRows(responseData.callLogs || []);
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch call logs';
      setError(message);
      toast.error(message);
    }
  };

  useEffect(() => {
    fetchCallLogs();
  }, []);

  // Update Call Log
  const handleInputChange = async (
    id: string,
    field: keyof Omit<CallLog, '_id'>,
    value: string
  ) => {
    setRows((prevRows) =>
      prevRows.map((row) =>
        row._id === id ? { ...row, [field]: value } : row
      )
    );

    try {
      setLoading(true);
      const userData = JSON.parse(localStorage.getItem('token') || '{}');
      const token = userData?.token;

      if (!token) {
        throw new Error('Please login first');
      }

      const response = await fetch(
        `${import.meta.env.VITE_REACT_APP_URL}/api/v1/callLogs/update-callLogs/${id}`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ [field]: value }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message);
      }

      const responseData = await response.json();
      if (!responseData.success) {
        throw new Error(responseData.message);
      }
    //   toast.success('Updated successfully');
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update call log';
      setError(message);
    //   toast.error(message);
      fetchCallLogs();
    } finally {
      setLoading(false);
    }
  };

  // Add New Call Log
  const handleNewRowChange = (field: keyof NewCallLog, value: string) => {
    setNewRow((prev) => ({ ...prev, [field]: value }));
  };

  const addNewRow = async () => {
    if (!newRow.name || !newRow.phone || !newRow.purpose || !newRow.handler || !newRow.followUp) {
      const message = 'Please fill in all required fields';
      setError(message);
      toast.error(message);
      return;
    }

    try {
      setLoading(true);
      const userData = JSON.parse(localStorage.getItem('token') || '{}');
      const token = userData?.token;

      if (!token) {
        throw new Error('Please login first');
      }

      const response = await fetch(
        `${import.meta.env.VITE_REACT_APP_URL}/api/v1/callLogs/create-callLogs`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newRow),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message);
      }

      const responseData = await response.json();
      if (responseData.success) {
        setRows((prevRows) => [...prevRows, responseData.callLogs]);
        setNewRow(INITIAL_NEW_ROW);
        setError(null);
        toast.success('Call log added successfully');
      } else {
        throw new Error(responseData.message);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to add new row';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch handlers
  useEffect(() => {
    const fetchHandlers = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_REACT_APP_URL}/api/v1/admin/getAllAdmin`
        );
        setHandlers(response.data.admins);
      } catch (error: any) {
        console.error("Failed to fetch handlers:", error);
        toast.error(error.response?.data?.message || 'Failed to fetch handlers');
      }
    };

    fetchHandlers();
  }, []);

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Call Logs</h1>
        {loading && (
          <div className="flex items-center text-gray-500">
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Saving changes...
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 flex items-center">
          <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Purpose</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Handler</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Follow UP</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Remarks</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            <tr className="bg-gray-50">
              <td className="px-6 py-4">
                <input
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={newRow.name}
                  onChange={(e) => handleNewRowChange('name', e.target.value)}
                  placeholder="Name"
                />
              </td>
              <td className="px-6 py-4">
                <input
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={newRow.phone}
                  onChange={(e) => handleNewRowChange('phone', e.target.value)}
                  placeholder="Phone"
                  type="tel"
                />
              </td>
              <td className="px-6 py-4">
                <input
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={newRow.purpose}
                  onChange={(e) => handleNewRowChange('purpose', e.target.value)}
                  placeholder="Purpose"
                />
              </td>
              <td className="px-6 py-4">
                <select
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={newRow.handler}
                  onChange={(e) => handleNewRowChange('handler', e.target.value)}
                >
                  <option value="">Select handler</option>
                  {handlers.map((handler) => (
                    <option key={handler.id} value={handler.name}>
                      {handler.name}
                    </option>
                  ))}
                </select>
              </td>



                  
              {/* follow UP */}
              <td className="px-6 py-4">
                <select
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={newRow.followUp}
                  onChange={(e) => handleNewRowChange('followUp', e.target.value as CallLog['followUp'])}
                >
                  <option value="No">No</option>
                  <option value="Yes">Yes</option>
                </select>
              </td> 

              
              <td className="px-6 py-4">
                <select
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={newRow.remarks}
                  onChange={(e) => handleNewRowChange('remarks', e.target.value as CallLog['remarks'])}
                >
                  <option value="Done">Done</option>
                  <option value="Working on it">Working on it</option>
                  <option value="Stuck">Stuck</option>
                  <option value="Complete">Complete</option>
                </select>
              </td>

              <td></td>
      

           


              <td className="px-6 py-4">
                <button
                  onClick={addNewRow}
                  disabled={loading}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-black, bg-[#fedc00] hover:bg-yellow-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50"
                >
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Add New
                </button>
              </td>

              {/*Date*/}
              {/* <td className="px-6 py-4">
                    {format(new Date(newRow.value), 'yyyy-MM-dd HH:mm:ss')}
                  </td> */}

             


            </tr>
            {rows.map((row) => (
              <tr key={row._id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <input
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={row.name}
                    onChange={(e) => handleInputChange(row._id, 'name', e.target.value)}
                  />
                </td>
                <td className="px-6 py-4">
                  <input
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={row.phone}
                    onChange={(e) => handleInputChange(row._id, 'phone', e.target.value)}
                    type="tel"
                  />
                </td>
                <td className="px-6 py-4">
                  <input
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={row.purpose}
                    onChange={(e) => handleInputChange(row._id, 'purpose', e.target.value)}
                  />
                </td>
                <td className="px-6 py-4">
                  <select
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={row.handler}
                    onChange={(e) => handleInputChange(row._id, 'handler', e.target.value)}
                  >
                    {handlers.map((handler) => (
                      <option key={handler.id} value={handler.name}>
                        {handler.name}
                      </option>
                    ))}
                  </select>
                </td>
               
              {/* follow UP */}
              <td className="px-6 py-4">
                <select
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={row.followUp}
                  onChange={(e) => handleInputChange(row._id, 'followUp', e.target.value as CallLog['followUp'])}
                >
                  <option value="No">No</option>
                  <option value="Yes">Yes</option>
                </select>
              </td> 

                <td className="px-6 py-4">
                  <select
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={row.remarks}
                    onChange={(e) => handleInputChange(row._id, 'remarks', e.target.value as CallLog['remarks'])}
                  >
                    <option value="Done">Done</option>
                    <option value="Working on it">Working on it</option>
                    <option value="Stuck">Stuck</option>
                    <option value="Complete">Complete</option>
                  </select>
                 </td>


                 <td className="px-6 py-4">
                    {format(new Date(row.createdAt), 'yyyy-MM-dd HH:mm:ss')}
                  </td>
                

              
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-2">
                    <Save className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-500">Auto-saving</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table> 
      </div>
    </div>
  );
};

export default CallLogs;












