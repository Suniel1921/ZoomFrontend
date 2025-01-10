import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Plus, Edit, Trash2, Shield } from "lucide-react";
import Button from "../../components/Button";

const CreateSuperAdmin = () => {
  const [superAdmins, setSuperAdmins] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  console.log('super admin data is', superAdmins)

  // Fetch all super admins
  const fetchSuperAdmins = async () => {
    setFetching(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_REACT_APP_URL}/api/v1/superAdmin/getAllSuperAdmins`
      );
      setSuperAdmins(response.data.superAdmins || []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch super admins.");
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchSuperAdmins();
  }, []);

  // Handle form input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle form submission to create a new super admin
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_REACT_APP_URL}/api/v1/superAdmin/createSuperAdmin`,
        formData
      );

      if (response.data.success) {
        toast.success("Super admin created successfully!");
        setFormData({ name: "", email: "", password: "" });
        setIsModalOpen(false); // Close modal after success
        fetchSuperAdmins(); // Refresh the list
      }
    } catch (error) {
      toast.error("Failed to create super admin. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle admin deletion
  const handleDelete = async (admin) => {
    if (window.confirm(`Are you sure you want to delete ${admin.name}?`)) {
      try {
        await axios.delete(
          `${import.meta.env.VITE_REACT_APP_URL}/api/v1/superAdmin/deleteSuperAdmin/${
            admin._id
          }`
        );
        toast.success("Super admin deleted successfully.");
        fetchSuperAdmins();
      } catch (error) {
        console.error(error);
        toast.error("Failed to delete super admin.");
      }
    }
  };

  return (
    <div className="space-y-8">
      {/* Card Layout for Super Admin Management */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <div className="px-6 py-5">
          <h3 className="text-lg font-medium text-gray-900">
            Super Admin Management
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Manage your super admins here
          </p>
        </div>
        <div className="px-6 py-4 flex justify-end">
          {/* Add Super Admin Button */}
          <Button
            onClick={() => setIsModalOpen(true)}
            className="bg-black text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Super Admin
          </Button>
        </div>
        {/* Super Admin List Table */}
        {fetching ? (
          <div className="px-6 py-4">Loading super admins...</div>
        ) : superAdmins.length > 0 ? (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Admin
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th> */}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Login
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {superAdmins.map((admin) => (
                <tr key={admin._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-yellow-100 rounded-full flex items-center justify-center overflow-hidden">
                        {admin.superAdminPhoto ? (
                          <img
                            className="w-full h-full object-cover rounded-full"
                            src={admin.superAdminPhoto}
                            alt="Admin Photo"
                          />
                        ) : (
                          <span className="text-black font-medium">
                            {admin.name[0]}
                          </span>
                        )}
                      </div>

                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {admin.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {admin.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-black">
                      {admin.role}
                    </span>
                  </td>
                  {/* <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        admin.status === "active"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {admin.status}
                    </span>
                  </td> */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {admin.lastLogin
                      ? new Date(admin.lastLogin).toLocaleString()
                      : "Never"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-2">
                      {/* <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          // Set selected admin and open permissions modal
                        }}
                      >
                        <Shield className="h-4 w-4" />
                      </Button> */}
                      {/* <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          // Set selected admin and open edit modal
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button> */}
                      {admin.role !== "super_admin" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(admin)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="px-6 py-4">No super admins found.</div>
        )}
      </div> 

      {/* Modal for adding a new super admin */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900">
              Add Super Admin
            </h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700"
                >
                  Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Enter Name"
                  className="mt-2 block w-full border-gray-300 rounded-md shadow-sm focus:ring-yellow-500 focus:border-yellow-500 py-2 px-3"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="Enter Email"
                  className="mt-2 block w-full border-gray-300 rounded-md shadow-sm focus:ring-yellow-500 focus:border-yellow-500 py-2 px-3"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700"
                >
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="Enter Password"
                  className="mt-2 block w-full border-gray-300 rounded-md shadow-sm focus:ring-yellow-500 focus:border-yellow-500 py-2 px-3"
                />
              </div>

              <div className="mt-4 flex justify-end space-x-2">
                <Button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="bg-gray-300"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-[#fedc00] text-black"
                >
                  {loading ? "Creating..." : "Create Admin"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateSuperAdmin;
