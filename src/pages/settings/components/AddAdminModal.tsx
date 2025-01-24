import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Eye, EyeOff } from 'lucide-react';
import Button from '../../../components/Button';
import Input from '../../../components/Input';
import { useAdminStore } from '../../../store/adminStore';
import { generateStrongPassword } from '../../../utils/passwordGenerator';
import axios from 'axios';
import toast from 'react-hot-toast';

const adminSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['admin', 'manager']),
  status: z.enum(['active', 'inactive']),
});

type AdminFormData = z.infer<typeof adminSchema>;

interface AddAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  fetchAdmins : () => void;
}

export default function AddAdminModal({ isOpen, onClose , fetchAdmins}: AddAdminModalProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState('');

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<AdminFormData>({
    resolver: zodResolver(adminSchema),
    defaultValues: {
      role: 'manager',
      status: 'active',
    },
  });

  const handleGeneratePassword = () => {
    const password = generateStrongPassword();
    setGeneratedPassword(password);
    setValue('password', password);
  };

  const onSubmit = async (data: AdminFormData) => {
    try {
      // Make the API call to create an admin
      const response = await axios.post(`${import.meta.env.VITE_REACT_APP_URL}/api/v1/admin/createAdmin`, {
        ...data,
        permissions: [],
      });
  
      if (response.status === 201) {
        toast.success('Admin created successfully!');
        fetchAdmins();
        reset(); // Reset form fields
        setGeneratedPassword(''); 
        onClose(); // Close the modal
      } else {
        toast.error('Failed to create admin. Please try again.');
      }
    } catch (error) {
      console.error(error);
      toast.error('An error occurred while creating the admin.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Add New Admin</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <Input {...register('name')} className="mt-1" />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <Input {...register('email')} type="email" className="mt-1" />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          <div>
            <div className="flex justify-between items-center">
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <button
                type="button"
                onClick={handleGeneratePassword}
                className="text-sm text-brand-black hover:text-brand-yellow"
              >
                Generate Strong Password
              </button>
            </div>
            <div className="mt-1 relative">
              <Input
                {...register('password')}
                type={showPassword ? "text" : "password"}
                className="pr-10"
                value={generatedPassword}
                onChange={(e) => setGeneratedPassword(e.target.value)}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Role</label>
            <select
              {...register('role')}
              className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm transition-colors duration-200 placeholder:text-gray-500 focus:border-brand-yellow focus:outline-none focus:ring-2 focus:ring-brand-yellow/20 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500 mt-1"
            >
              <option value="admin">Admin</option>
              <option value="manager">Manager</option>
            </select>
            <p className="mt-1 text-sm text-gray-500">
              Admin: Full access except Reports
              <br />
              Manager: Limited access, no Applications or Reports
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <select
              {...register('status')}
              className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm transition-colors duration-200 placeholder:text-gray-500 focus:border-brand-yellow focus:outline-none focus:ring-2 focus:ring-brand-yellow/20 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500 mt-1"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Add Admin</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

