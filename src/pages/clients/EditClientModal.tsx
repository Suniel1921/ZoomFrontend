// import { useState } from 'react';
// import { useForm } from 'react-hook-form';
// import { zodResolver } from '@hookform/resolvers/zod';
// import { X, Upload } from 'lucide-react';
// import Button from '../../components/Button';
// import Input from '../../components/Input';
// import ImageUpload from '../../components/ImageUpload';
// import { useStore } from '../../store';
// import { fetchJapaneseAddress } from '../../services/addressService';
// import { countries } from '../../utils/countries';
// import { createClientSchema } from '../../utils/clientValidation';
// import type { Client, ClientCategory } from '../../types';
// import toast from 'react-hot-toast';

// interface EditClientModalProps {
//   isOpen: boolean;
//   onClose: () => void;
//   client: Client;
// }

// const categories: ClientCategory[] = [
//   'Visit Visa Applicant',
//   'Japan Visit Visa Applicant',
//   'Document Translation',
//   'Student Visa Applicant',
//   'Epassport Applicant',
//   'Japan Visa',
//   'General Consultation'
// ];

// export default function EditClientModal({
//   isOpen,
//   onClose,
//   client,
// }: EditClientModalProps) {
//   const { updateClient } = useStore();
//   const [isAddressLoading, setIsAddressLoading] = useState(false);

//   const {
//     register,
//     handleSubmit,
//     setValue,
//     watch,
//     formState: { errors },
//   } = useForm({
//     resolver: zodResolver(createClientSchema(client.category, true)),
//     defaultValues: {
//       ...client,
//       password: client.credentials?.password || '',
//       modeOfContact: client.modeOfContact || [],
//     },
//   });

//   const postalCode = watch('address.postalCode');
//   const selectedModes = watch('modeOfContact');

//   const handlePostalCodeChange = async () => {
//     if (postalCode?.length === 7) {
//       setIsAddressLoading(true);
//       try {
//         const address = await fetchJapaneseAddress(postalCode);
//         if (address) {
//           setValue('address.prefecture', address.prefecture);
//           setValue('address.city', address.city);
//           setValue('address.street', address.town);
//         }
//       } catch (error) {
//         console.error('Failed to fetch address:', error);
//       } finally {
//         setIsAddressLoading(false);
//       }
//     }
//   };

//   const handleImageUpload = (file: File) => {
//     const reader = new FileReader();
//     reader.onloadend = () => {
//       setValue('profilePhoto', reader.result as string);
//     };
//     reader.readAsDataURL(file);
//   };

//   const handleModeOfContactChange = (mode: string) => {
//     const currentModes = watch('modeOfContact');
//     if (currentModes.includes(mode as any)) {
//       setValue('modeOfContact', currentModes.filter(m => m !== mode));
//     } else {
//       setValue('modeOfContact', [...currentModes, mode as any]);
//     }
//   };

 

//   const onSubmit = (data: any) => {
//     const response = await axios(`${import.meta.env.VITE_REACT_APP_URL}/api/v1/client/updateClient${client.id}`, {
//     updateClient(client.id, {
//       ...client,
//       ...data,
//       credentials: {
//         ...client.credentials,
//         password: data.password || client.credentials?.password,
//       },
//     });
//     onClose();
//   };

//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//       <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
//         <div className="flex justify-between items-center mb-4">
//           <h2 className="text-xl font-semibold">Edit Client</h2>
//           <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
//             <X className="h-5 w-5" />
//           </button>
//         </div>

//         <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
//           <div className="flex flex-col items-center gap-4">
//             <ImageUpload
//               currentImage={client.profilePhoto}
//               onImageUpload={handleImageUpload}
//               onImageRemove={() => setValue('profilePhoto', undefined)}
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700">Name</label>
//             <Input {...register('name')} className="mt-1" />
//             {errors.name && (
//               <p className="mt-1 text-sm text-red-600">{errors.name.message as string}</p>
//             )}
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700">Category</label>
//             <select
//               {...register('category')}
//               className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-yellow focus:ring-brand-yellow"
//             >
//               {categories.map((category) => (
//                 <option key={category} value={category}>
//                   {category}
//                 </option>
//               ))}
//             </select>
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700">Status</label>
//             <select
//               {...register('status')}
//               className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-yellow focus:ring-brand-yellow"
//             >
//               <option value="active">Active</option>
//               <option value="inactive">Inactive</option>
//             </select>
//             {client.status === 'active' && (
//               <p className="mt-1 text-sm text-gray-500">
//                 Note: Setting status to inactive will disable portal access for this client.
//               </p>
//             )}
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700">Email</label>
//             <Input {...register('email')} type="email" className="mt-1" />
//             {errors.email && (
//               <p className="mt-1 text-sm text-red-600">{errors.email.message as string}</p>
//             )}
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700">Phone</label>
//             <Input {...register('phone')} type="tel" className="mt-1" />
//             {errors.phone && (
//               <p className="mt-1 text-sm text-red-600">{errors.phone.message as string}</p>
//             )}
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700">Password</label>
//             <Input {...register('password')} type="text" className="mt-1" />
//             {errors.password && (
//               <p className="mt-1 text-sm text-red-600">{errors.password.message as string}</p>
//             )}
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700">Nationality</label>
//             <select
//               {...register('nationality')}
//               className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-yellow focus:ring-brand-yellow"
//             >
//               <option value="">Select nationality</option>
//               {countries.map((country) => (
//                 <option key={country.code} value={country.name}>
//                   {country.name}
//                 </option>
//               ))}
//             </select>
//             {errors.nationality && (
//               <p className="mt-1 text-sm text-red-600">{errors.nationality.message as string}</p>
//             )}
//           </div>

//           <div className="space-y-4">
//             <h3 className="font-medium">Address</h3>
//             <div className="grid grid-cols-2 gap-4">
//               <div className="col-span-2">
//                 <label className="block text-sm font-medium text-gray-700">
//                   Postal Code
//                 </label>
//                 <Input
//                   {...register('address.postalCode')}
//                   onChange={(e) => {
//                     register('address.postalCode').onChange(e);
//                     handlePostalCodeChange();
//                   }}
//                   placeholder="1000001"
//                   className="mt-1"
//                 />
//                 {errors.address?.postalCode && (
//                   <p className="mt-1 text-sm text-red-600">
//                     {errors.address.postalCode.message as string}
//                   </p>
//                 )}
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700">
//                   Prefecture
//                 </label>
//                 <Input
//                   {...register('address.prefecture')}
//                   className="mt-1"
//                   disabled={isAddressLoading}
//                 />
//                 {errors.address?.prefecture && (
//                   <p className="mt-1 text-sm text-red-600">
//                     {errors.address.prefecture.message as string}
//                   </p>
//                 )}
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700">City</label>
//                 <Input
//                   {...register('address.city')}
//                   className="mt-1"
//                   disabled={isAddressLoading}
//                 />
//                 {errors.address?.city && (
//                   <p className="mt-1 text-sm text-red-600">
//                     {errors.address.city.message as string}
//                   </p>
//                 )}
//               </div>

//               <div className="col-span-2">
//                 <label className="block text-sm font-medium text-gray-700">Street</label>
//                 <Input
//                   {...register('address.street')}
//                   className="mt-1"
//                   disabled={isAddressLoading}
//                 />
//                 {errors.address?.street && (
//                   <p className="mt-1 text-sm text-red-600">
//                     {errors.address.street.message as string}
//                   </p>
//                 )}
//               </div>

//               <div className="col-span-2">
//                 <label className="block text-sm font-medium text-gray-700">
//                   Building & Apartment
//                 </label>
//                 <Input
//                   {...register('address.building')}
//                   placeholder="Building name, Floor, Unit number"
//                   className="mt-1"
//                 />
//               </div>
//             </div>
//           </div>

//           <div className="space-y-4">
//             <h3 className="font-medium">Contact Preferences</h3>
//             <div className="space-y-2">
//               {(['Direct Call', 'Viber', 'WhatsApp', 'Facebook Messenger'] as const).map((mode) => (
//                 <label key={mode} className="flex items-center gap-2">
//                   <input
//                     type="checkbox"
//                     checked={selectedModes.includes(mode)}
//                     onChange={() => handleModeOfContactChange(mode)}
//                     className="rounded border-gray-300 text-brand-yellow focus:ring-brand-yellow"
//                   />
//                   <span className="text-sm text-gray-700">{mode}</span>
//                 </label>
//               ))}
//             </div>
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700">Facebook Profile</label>
//             <Input
//               {...register('socialMedia.facebook')}
//               placeholder="Facebook profile URL"
//               className="mt-1"
//             />
//           </div>

//           <div className="flex justify-end gap-2">
//             <Button type="button" variant="outline" onClick={onClose}>
//               Cancel
//             </Button>
//             {/* <Button type="submit">Save Changes</Button> */}
//             <Button onClick={handleClickUpdate} disabled={isSubmitting}>
//               {isSubmitting ? 'Updating...' : 'Update Changes'}
//             </Button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }






// **************NEW CODE**************




import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X } from 'lucide-react';
import Button from '../../components/Button';
import Input from '../../components/Input';
import ImageUpload from '../../components/ImageUpload';
import { useStore } from '../../store';
import { fetchJapaneseAddress } from '../../services/addressService';
import { countries } from '../../utils/countries';
import { createClientSchema } from '../../utils/clientValidation';
import type { Client, ClientCategory } from '../../types';
import toast from 'react-hot-toast';
import axios from 'axios';

interface EditClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: Client;
  getAllClients: () => void;
}

const categories: ClientCategory[] = [
  'Visit Visa Applicant',
  'Japan Visit Visa Applicant',
  'Document Translation',
  'Student Visa Applicant',
  'Epassport Applicant',
  'Japan Visa',
  'General Consultation',
];

export default function EditClientModal({
  isOpen,
  onClose,
  client,
  getAllClients,
}: EditClientModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(createClientSchema(client.category, true)),
    defaultValues: {
      ...client,
      address: client.address || {},
      credentials: client.credentials || { password: '' },
      modeOfContact: client.modeOfContact || [],
      socialMedia: client.socialMedia || {},
    },
  });

  const postalCode = watch('address.postalCode');
  const selectedModes = watch('modeOfContact');

  const handlePostalCodeChange = async () => {
    if (postalCode?.length === 7) {
      try {
        const address = await fetchJapaneseAddress(postalCode);
        if (address) {
          setValue('address.prefecture', address.prefecture);
          setValue('address.city', address.city);
          setValue('address.street', address.town);
        }
      } catch (error) {
        toast.error('Failed to fetch address. Please check the postal code.');
        console.error('Failed to fetch address:', error);
      }
    }
  };

  const handleModeOfContactChange = (mode: string) => {
    const currentModes = watch('modeOfContact');
    if (currentModes.includes(mode as any)) {
      setValue('modeOfContact', currentModes.filter((m) => m !== mode));
    } else {
      setValue('modeOfContact', [...currentModes, mode as any]);
    }
  };

  const handleClickUpdate = async () => {
    const data = {
      ...watch(),
    };

    setIsSubmitting(true);
    try {
      const response = await axios.put(
        `${import.meta.env.VITE_REACT_APP_URL}/api/v1/client/updateClient/${client._id}`,
        {
          ...client,
          ...data,
          credentials: {
            ...client.credentials,
            password: data.password || client.credentials?.password,
          },
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.status !== 200) {
        throw new Error('Failed to update client');
      }

      toast.success('Client updated successfully!');
      onClose();
      getAllClients();
    } catch (error) {
      console.error('Error updating client:', error);
      toast.error('Failed to update client. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Edit Client</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <Input {...register('name')} className="mt-1" />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message as string}</p>
            )}
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Category</label>
            <select
              {...register('category')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-yellow focus:ring-brand-yellow"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <select
              {...register('status')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-yellow focus:ring-brand-yellow"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            {client.status === 'active' && (
              <p className="mt-1 text-sm text-gray-500">
                Note: Setting status to inactive will disable portal access for this client.
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <Input {...register('email')} type="email" className="mt-1" />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email.message as string}</p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Phone</label>
            <Input {...register('phone')} type="tel" className="mt-1" />
            {errors.phone && (
              <p className="mt-1 text-sm text-red-600">{errors.phone.message as string}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <Input {...register('password')} type="password" className="mt-1" disabled/>
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password.message as string}</p>
            )}
          </div>

          {/* Nationality */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Nationality</label>
            <select
              {...register('nationality')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-yellow focus:ring-brand-yellow"
            >
              <option value="">Select nationality</option>
              {countries.map((country) => (
                <option key={country.code} value={country.name}>
                  {country.name}
                </option>
              ))}
            </select>
            {errors.nationality && (
              <p className="mt-1 text-sm text-red-600">{errors.nationality.message as string}</p>
            )}
          </div>

          {/* Address */}
          <div className="space-y-4">
            <h3 className="font-medium">Address</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700">Postal Code</label>
                <Input
                  {...register('postalCode')}
                  onChange={(e) => {
                    register('address.postalCode').onChange(e);
                    handlePostalCodeChange();
                  }}
                  placeholder="1000001"
                  className="mt-1"
                />
                {errors.address?.postalCode && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.address.postalCode.message as string}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Prefecture</label>
                <Input
                  {...register('prefecture')}
                  className="mt-1"
                  disabled={false}
                />
                {errors.address?.prefecture && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.address.prefecture.message as string}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">City</label>
                <Input
                  {...register('city')}
                  className="mt-1"
                  disabled={false}
                />
                {errors.address?.city && (
                  <p className="mt-1 text-sm text-red-600">{errors.address.city.message as string}</p>
                )}
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700">Street</label>
                <Input
                  {...register('street')}
                  className="mt-1"
                  disabled={false}
                />
                {errors.address?.street && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.address.street.message as string}
                  </p>
                )}
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700">Building & Apartment</label>
                <Input
                  {...register('building')}
                  placeholder="Building name, Floor, Unit number"
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          {/* Mode of Contact */}
          <div className="space-y-4">
            <h3 className="font-medium">Contact Preferences</h3>
            <div className="space-y-2">
              {(['Direct Call', 'Viber', 'WhatsApp', 'Facebook Messenger'] as const).map((mode) => (
                <label key={mode} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedModes.includes(mode)}
                    onChange={() => handleModeOfContactChange(mode)}
                    className="form-checkbox"
                  />
                  {mode}
                </label>
              ))}
            </div>
          </div>

          {/* Social Media */}
          <div className="space-y-4">
            <h3 className="font-medium">Social Media</h3>
            <div className="space-y-2">
              <Input {...register('socialMedia.facebook')} placeholder="Facebook URL" className="mt-1" />
            </div>
          </div>

          {/* Submit Button */}
          <div className="mt-6">
            <Button
              onClick={handleClickUpdate}
              disabled={isSubmitting}
              loading={isSubmitting}
              className="w-full"
            >
              Update Client
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}


