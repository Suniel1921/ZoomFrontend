import React, { useState, useEffect } from 'react';
import { Modal, Input, Button } from 'antd';
import { useAuthGlobally } from '../../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';

const EditProfileModal = ({ isVisible, onClose }) => {
  const [auth, setAuth] = useAuthGlobally();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: ''
  });

  useEffect(() => {
    if (auth?.user) {
      setFormData({
        fullName: auth.user.fullName || '',
        email: auth.user.email || '',
        phone: auth.user.phone || ''
      });
    }
  }, [auth]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      const response = await axios.put(
        `${import.meta.env.VITE_REACT_APP_URL}/api/v1/client/updateClientProfile/${auth?.user?.id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      
      if (response.data.success) {
        toast.success('Profile updated successfully');
        setAuth({ ...auth, user: response.data.updatedClient });
        onClose();
      } else {
        toast.error('Failed to update profile');
      }
    } catch (error) {
      toast.error('Error updating profile');
    }
  };

  return (
    <Modal
      title="Edit Profile"
      open={isVisible}
      onCancel={onClose}
      onOk={handleSubmit}
      // okText="Save"
      footer={null}
      cancelText="Cancel"
    >
      <div>
        <label className="block mb-2">Full Name</label>
        <Input disabled
          name="fullName"
          value={formData.fullName}
          onChange={handleChange}
          className="mb-4"
        />
        <label className="block mb-2">Email</label>
        <Input disabled
          name="email"
          value={formData.email}
          onChange={handleChange}
          className="mb-4"
        />
        <label className="block mb-2">Phone Number</label>
        <Input disabled
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          className="mb-4"
        />
      </div>
    </Modal>
  );
};

export default EditProfileModal;








