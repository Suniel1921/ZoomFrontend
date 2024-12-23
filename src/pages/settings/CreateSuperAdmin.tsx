import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast'; // for showing notifications

const CreateSuperAdmin = () => {
  // Define state for the form fields
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });

  const [loading, setLoading] = useState(false); // To track loading state

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // Start loading

    try {
      // Make API call to create super admin
      const response = await axios.post(`${import.meta.env.VITE_REACT_APP_URL}/api/v1/auth/createSuperAdmin`,formData
      );
      
      if (response.data.success) {
        toast.success('Super admin created successfully!');
        // Optionally, reset form or navigate to another page
        setFormData({ name: '', email: '', password: '' });
      }
    } catch (error) {
      toast.error('Failed to create super admin. Please try again.');
    } finally {
      setLoading(false); // Stop loading
    }
  };

  return (
    <div className="p-6 max-w-lg mx-auto bg-white shadow-lg rounded-lg">
      <h3 className="text-xl font-semibold text-center mb-6 text-[#fedc00]">Create Super Admin</h3>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-black">
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
            className="mt-2 block w-full border-[#fedc00] rounded-md shadow-sm focus:ring-[#fedc00] focus:border-[#fedc00] py-3 text-black"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-black">
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
            className="mt-2 block w-full border-[#fedc00] rounded-md shadow-sm focus:ring-[#fedc00] focus:border-[#fedc00] py-3 text-black"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-black">
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
            className="mt-2 block w-full border-[#fedc00] rounded-md shadow-sm focus:ring-[#fedc00] focus:border-[#fedc00] py-3 text-black"
          />
        </div>

        <div className="text-center">
          <button
            type="submit"
            disabled={loading}
            className="mt-4 w-full py-3 bg-[#fedc00] text-black rounded-md hover:bg-yellow-600 transition disabled:bg-gray-400"
          >
            {loading ? 'Creating...' : 'Create Super Admin'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateSuperAdmin;
