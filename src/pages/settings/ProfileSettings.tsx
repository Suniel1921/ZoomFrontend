// import { useForm } from 'react-hook-form';
// import { zodResolver } from '@hookform/resolvers/zod';
// import { z } from 'zod';
// import Button from '../../components/Button';
// import Input from '../../components/Input';
// import ImageUpload from '../../components/ImageUpload';
// import { useAdminStore } from '../../store/adminStore';
// import { useState } from 'react';

// const profileSchema = z.object({
//   name: z.string().min(1, 'Name is required'),
//   email: z.string().email('Invalid email address'),
//   phone: z.string().min(1, 'Phone number is required'),
//   timeZone: z.string().min(1, 'Time zone is required'),
//   language: z.string().min(1, 'Language is required'),
//   profilePhoto: z.string().optional(),
// });

// type ProfileFormData = z.infer<typeof profileSchema>;

// export default function ProfileSettings() {
//   const [isSuccess, setIsSuccess] = useState(false);
//   const { currentAdmin, updateAdmin } = useAdminStore();
//   const [profilePhoto, setProfilePhoto] = useState<string | undefined>(currentAdmin?.profilePhoto);

//   const {
//     register,
//     handleSubmit,
//     formState: { errors },
//   } = useForm<ProfileFormData>({
//     resolver: zodResolver(profileSchema),
//     defaultValues: {
//       name: currentAdmin?.name || '',
//       email: currentAdmin?.email || '',
//       phone: currentAdmin?.phone || '',
//       timeZone: currentAdmin?.timeZone || 'Asia/Tokyo',
//       language: currentAdmin?.language || 'en',
//       profilePhoto: currentAdmin?.profilePhoto,
//     },
//   });

//   const handleImageUpload = (file: File) => {
//     const reader = new FileReader();
//     reader.onloadend = () => {
//       const base64String = reader.result as string;
//       setProfilePhoto(base64String);
//     };
//     reader.readAsDataURL(file);
//   };

//   const handleImageRemove = () => {
//     setProfilePhoto(undefined);
//   };

//   const onSubmit = (data: ProfileFormData) => {
//     if (currentAdmin) {
//       // Include the profile photo in the update
//       const updatedData = {
//         ...data,
//         profilePhoto,
//         role: currentAdmin.role,
//         permissions: currentAdmin.permissions,
//         status: currentAdmin.status,
//       };

//       updateAdmin(currentAdmin.id, updatedData);
//       setIsSuccess(true);
//       setTimeout(() => setIsSuccess(false), 3000);
//     }
//   };

//   return (
//     <div>
//       <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
//         Profile Information
//       </h3>

//       {isSuccess && (
//         <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-md">
//           Profile updated successfully!
//         </div>
//       )}

//       <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
//         {/* Profile Photo */}
//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-2">
//             Profile Photo
//           </label>
//           <ImageUpload
//             currentImage={profilePhoto}
//             onImageUpload={handleImageUpload}
//             onImageRemove={handleImageRemove}
//           />
//         </div>

//         <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
//           <div>
//             <label className="block text-sm font-medium text-gray-700">
//               Full Name
//             </label>
//             <Input {...register('name')} className="mt-1" />
//             {errors.name && (
//               <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
//             )}
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700">
//               Email
//             </label>
//             <Input {...register('email')} type="email" className="mt-1" />
//             {errors.email && (
//               <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
//             )}
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700">
//               Phone
//             </label>
//             <Input {...register('phone')} type="tel" className="mt-1" />
//             {errors.phone && (
//               <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
//             )}
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700">
//               Time Zone
//             </label>
//             <select
//               {...register('timeZone')}
//               className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-yellow focus:ring-brand-yellow"
//             >
//               <option value="Asia/Tokyo">Asia/Tokyo (UTC+09:00)</option>
//               <option value="America/New_York">America/New_York (UTC-05:00)</option>
//               <option value="Europe/London">Europe/London (UTC+00:00)</option>
//             </select>
//             {errors.timeZone && (
//               <p className="mt-1 text-sm text-red-600">{errors.timeZone.message}</p>
//             )}
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700">
//               Language
//             </label>
//             <select
//               {...register('language')}
//               className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-yellow focus:ring-brand-yellow"
//             >
//               <option value="en">English</option>
//               <option value="ja">Japanese</option>
//               <option value="ne">Nepali</option>
//             </select>
//             {errors.language && (
//               <p className="mt-1 text-sm text-red-600">{errors.language.message}</p>
//             )}
//           </div>
//         </div>

//         <div className="flex justify-end gap-4">
//           <Button type="button" variant="outline">
//             Cancel
//           </Button>
//           <Button type="submit">Save Changes</Button>
//         </div>
//       </form>
//     </div>
//   );
// }













import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Button from '../../components/Button';
import Input from '../../components/Input';
import ImageUpload from '../../components/ImageUpload';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuthGlobally } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const profileSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  // phone: z.string().min(1, 'Phone number is required'),
  timeZone: z.string().min(1, 'Time zone is required'),
  language: z.string().min(1, 'Language is required'),
  profilePhoto: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function ProfileSettings() {
  const [isSuccess, setIsSuccess] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState<string | undefined>();
  const [auth] = useAuthGlobally();
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  });

  useEffect(() => {
    // Fetch current admin data
    const fetchProfile = async () => {
      if (!auth?.user?.id) return; // Ensure auth is available

      try {
        const response = await axios.get(`${import.meta.env.VITE_REACT_APP_URL}/api/v1/auth/getSuperAdmin/${auth.user.id}`);
        const profile = response.data.superAdmin;

        // Set default values for the form
        setValue('name', profile.name);
        setValue('email', profile.email);
        // setValue('phone', profile.phone);
        setValue('timeZone', profile.timeZone || 'Asia/Tokyo');
        setValue('language', profile.language || 'en');
        setProfilePhoto(profile.profilePhoto);
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      }
    };

    fetchProfile();
  }, [auth?.user?.id, setValue]);

  const handleImageUpload = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setProfilePhoto(base64String);
    };
    reader.readAsDataURL(file);
  };

  const handleImageRemove = () => {
    setProfilePhoto(undefined);
  };

  const onSubmit = async (data: ProfileFormData) => {
    if (!auth?.user?.id) return; // Ensure auth is available

    try {
      const updatedData = {
        ...data,
        profilePhoto,
      };

      await axios.put(
        `${import.meta.env.VITE_REACT_APP_URL}/api/v1/auth/updateSuperAdmin/${auth.user.id}`,
        updatedData
      );
      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 3000);
      toast.success("Data Updated Successfully")
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  return (
    <div>
      <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
        Profile Information
      </h3>

      {isSuccess && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-md">
          Profile updated successfully!
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
        {/* Profile Photo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Profile Photo
          </label>
          <ImageUpload
            currentImage={profilePhoto}
            onImageUpload={handleImageUpload}
            onImageRemove={handleImageRemove}
          />
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Full Name
            </label>
            <Input {...register('name')} className="mt-1" />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <Input {...register('email')} type="email" className="mt-1" />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          {/* <div>
            <label className="block text-sm font-medium text-gray-700">
              Phone
            </label>
            <Input {...register('phone')} type="tel" className="mt-1" />
            {errors.phone && (
              <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
            )}
          </div> */}

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Time Zone
            </label>
            <select
              {...register('timeZone')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-yellow focus:ring-brand-yellow"
            >
              <option value="Asia/Tokyo">Asia/Tokyo (UTC+09:00)</option>
              <option value="America/New_York">America/New_York (UTC-05:00)</option>
              <option value="Europe/London">Europe/London (UTC+00:00)</option>
            </select>
            {errors.timeZone && (
              <p className="mt-1 text-sm text-red-600">{errors.timeZone.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Language
            </label>
            <select
              {...register('language')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-yellow focus:ring-brand-yellow"
            >
              <option value="en">English</option>
              <option value="ja">Japanese</option>
              <option value="ne">Nepali</option>
            </select>
            {errors.language && (
              <p className="mt-1 text-sm text-red-600">{errors.language.message}</p>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline">
            Cancel
          </Button>
          <Button type="submit">Save Changes</Button>
        </div>
      </form>
    </div>
  );
}

