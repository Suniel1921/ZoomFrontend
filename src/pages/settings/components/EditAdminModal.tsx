// import { useState } from 'react';
// import { useForm } from 'react-hook-form';
// import { zodResolver } from '@hookform/resolvers/zod';
// import { z } from 'zod';
// import { X, Eye, EyeOff } from 'lucide-react';
// import Button from '../../../components/Button';
// import Input from '../../../components/Input';
// import { useAdminStore } from '../../../store/adminStore';
// import { generateStrongPassword } from '../../../utils/passwordGenerator';
// import type { Admin } from '../../../types/admin';

// const adminSchema = z.object({
//   name: z.string().min(1, 'Name is required'),
//   email: z.string().email('Invalid email address'),
//   role: z.enum(['admin', 'manager']),
//   status: z.enum(['active', 'inactive']),
//   password: z.string().optional(),
// });

// type AdminFormData = z.infer<typeof adminSchema>;

// interface EditAdminModalProps {
//   isOpen: boolean;
//   onClose: () => void;
//   admin: Admin;
// }

// export default function EditAdminModal({
//   isOpen,
//   onClose,
//   admin,
// }: EditAdminModalProps) {
//   const { updateAdmin } = useAdminStore();
//   const [showPassword, setShowPassword] = useState(false);
//   const [generatedPassword, setGeneratedPassword] = useState('');

//   const {
//     register,
//     handleSubmit,
//     setValue,
//     formState: { errors },
//   } = useForm<AdminFormData>({
//     resolver: zodResolver(adminSchema),
//     defaultValues: {
//       name: admin.name,
//       email: admin.email,
//       role: admin.role === 'super_admin' ? 'admin' : admin.role,
//       status: admin.status,
//       password: '',
//     },
//   });

//   const handleGeneratePassword = () => {
//     const password = generateStrongPassword();
//     setGeneratedPassword(password);
//     setValue('password', password);
//   };

//   const onSubmit = (data: AdminFormData) => {
//     updateAdmin(admin.id, {
//       ...data,
//       password: data.password || admin.password, // Keep existing password if not changed
//     });
//     onClose();
//   };

//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//       <div className="bg-white rounded-lg p-6 w-full max-w-md">
//         <div className="flex justify-between items-center mb-4">
//           <h2 className="text-xl font-semibold">Edit Admin</h2>
//           <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
//             <X className="h-5 w-5" />
//           </button>
//         </div>

//         <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
//           <div>
//             <label className="block text-sm font-medium text-gray-700">Name</label>
//             <Input {...register('name')} className="mt-1" />
//             {errors.name && (
//               <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
//             )}
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700">Email</label>
//             <Input {...register('email')} type="email" className="mt-1" />
//             {errors.email && (
//               <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
//             )}
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700">Role</label>
//             <select
//               {...register('role')}
//               className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-yellow focus:ring-brand-yellow"
//               disabled={admin.role === 'super_admin'}
//             >
//               <option value="admin">Admin</option>
//               <option value="manager">Manager</option>
//             </select>
//             <p className="mt-1 text-sm text-gray-500">
//               Admin: Full access except Reports
//               <br />
//               Manager: Limited access, no Applications or Reports
//             </p>
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700">Status</label>
//             <select
//               {...register('status')}
//               className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-yellow focus:ring-brand-yellow"
//               disabled={admin.role === 'super_admin'}
//             >
//               <option value="active">Active</option>
//               <option value="inactive">Inactive</option>
//             </select>
//           </div>

//           <div>
//             <div className="flex justify-between items-center">
//               <label className="block text-sm font-medium text-gray-700">
//                 Change Password
//               </label>
//               <button
//                 type="button"
//                 onClick={handleGeneratePassword}
//                 className="text-sm text-brand-black hover:text-brand-yellow"
//               >
//                 Generate Strong Password
//               </button>
//             </div>
//             <div className="mt-1 relative">
//               <Input
//                 {...register('password')}
//                 type={showPassword ? "text" : "password"}
//                 className="pr-10"
//                 placeholder="Leave blank to keep current password"
//                 value={generatedPassword}
//                 onChange={(e) => setGeneratedPassword(e.target.value)}
//               />
//               <button
//                 type="button"
//                 className="absolute inset-y-0 right-0 pr-3 flex items-center"
//                 onClick={() => setShowPassword(!showPassword)}
//               >
//                 {showPassword ? (
//                   <EyeOff className="h-4 w-4 text-gray-400" />
//                 ) : (
//                   <Eye className="h-4 w-4 text-gray-400" />
//                 )}
//               </button>
//             </div>
//             {errors.password && (
//               <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
//             )}
//           </div>

//           <div className="flex justify-end gap-2">
//             <Button type="button" variant="outline" onClick={onClose}>
//               Cancel
//             </Button>
//             <Button type="submit">Save Changes</Button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }


















import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Eye, EyeOff } from 'lucide-react';
import Button from '../../../components/Button';
import Input from '../../../components/Input';
import { generateStrongPassword } from '../../../utils/passwordGenerator';
import axios from 'axios';
import toast from 'react-hot-toast';  // For showing notifications
import type { Admin } from '../../../types/admin';

const adminSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  role: z.enum(['admin', 'manager']),
  status: z.enum(['active', 'inactive']),
  password: z.string().optional(),
});

type AdminFormData = z.infer<typeof adminSchema>;

interface EditAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  admin: Admin;
  fetchAdmins : () => void;
}

export default function EditAdminModal({
  isOpen,
  onClose,
  admin,
  fetchAdmins
}: EditAdminModalProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState('');
  
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<AdminFormData>({
    resolver: zodResolver(adminSchema),
    defaultValues: {
      name: admin.name,
      email: admin.email,
      role: admin.role === 'super_admin' ? 'admin' : admin.role,
      status: admin.status,
      password: '',
    },
  });

  const handleGeneratePassword = () => {
    const password = generateStrongPassword();
    setGeneratedPassword(password);
    setValue('password', password);
  };

  const onSubmit = async (data: AdminFormData) => {
    try {
      const updatedData = {
        ...data,
        password: data.password || admin.password, // Retain the current password if not updated
      };

      // Make API call to update the admin details
      const response = await axios.put(`${import.meta.env.VITE_REACT_APP_URL}/api/v1/admin/updateAdmin/${admin._id}`, updatedData);
      if (response.status === 200) {
        fetchAdmins();
        toast.success('Admin updated successfully.');
        onClose();  // Close the modal after successful update
      }
    } catch (error) {
      console.error('Failed to update admin:', error);
      toast.error('Failed to update admin.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Edit Admin</h2>
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
            <label className="block text-sm font-medium text-gray-700">Role</label>
            <select
              {...register('role')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-yellow focus:ring-brand-yellow"
              disabled={admin.role === 'super_admin'}
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
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-yellow focus:ring-brand-yellow"
              disabled={admin.role === 'super_admin'}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div>
            <div className="flex justify-between items-center">
              <label className="block text-sm font-medium text-gray-700">
                Change Password
              </label>
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
                placeholder="Leave blank to keep current password"
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

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
