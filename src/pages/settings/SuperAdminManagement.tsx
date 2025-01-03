import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import CreateSuperAdmin from './CreateSuperAdmin'; // Import the CreateSuperAdmin component
import Button from '../../components/Button';

const SuperAdminManagement = () => {
  const [superAdmins, setSuperAdmins] = useState([]);
  const [fetching, setFetching] = useState(true);

  // Fetch all super admins
  const fetchSuperAdmins = async () => {
    setFetching(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_REACT_APP_URL}/api/v1/auth/getSuperAdmin/1` // Update endpoint as needed
      );
      setSuperAdmins(response.data.superAdmins || []); // Adjust based on API response
    } catch (error) {
      console.error(error);
      toast.error('Failed to fetch super admins.');
    } finally {
      setFetching(false);
    }
  };

  // Fetch super admins on mount
  useEffect(() => {
    fetchSuperAdmins();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium leading-6 text-gray-900">Super Admin Management</h3>
        <CreateSuperAdmin fetchSuperAdmins={fetchSuperAdmins} /> {/* Pass fetchSuperAdmins as a prop */}
      </div>

      {fetching ? (
        <div className="text-center py-4">Loading super admins...</div>
      ) : superAdmins.length > 0 ? (
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {superAdmins.map((admin) => (
                <tr key={admin._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {admin.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{admin.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <Button variant="outline" onClick={() => toast('View Details')}>
                      View
                    </Button>
                    <Button variant="danger" onClick={() => toast('Delete Action')}>
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-4">No super admins found.</div>
      )}
    </div>
  );
};

export default SuperAdminManagement;
