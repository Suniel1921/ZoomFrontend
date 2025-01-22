
// // **************NEW CODE**************




// import { useState } from 'react';
// import { useForm } from 'react-hook-form';
// import { zodResolver } from '@hookform/resolvers/zod';
// import { X } from 'lucide-react';
// import Button from '../../components/Button';
// import Input from '../../components/Input';
// import ImageUpload from '../../components/ImageUpload';
// import { useStore } from '../../store';
// import { fetchJapaneseAddress } from '../../services/addressService';
// import { countries } from '../../utils/countries';
// import { createClientSchema } from '../../utils/clientValidation';
// import type { Client, ClientCategory } from '../../types';
// import toast from 'react-hot-toast';
// import axios from 'axios';

// interface EditClientModalProps {
//   isOpen: boolean;
//   onClose: () => void;
//   client: Client;
//   getAllClients: () => void;
// }

// const categories: ClientCategory[] = [
//   'Visit Visa Applicant',
//   'Japan Visit Visa Applicant',
//   'Document Translation',
//   'Student Visa Applicant',
//   'Epassport Applicant',
//   'Japan Visa',
//   'General Consultation',
// ];

// export default function EditClientModal({
//   isOpen,
//   onClose,
//   client,
//   getAllClients,
// }: EditClientModalProps) {
//   const [isSubmitting, setIsSubmitting] = useState(false);

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
//       address: client.address || {},
//       credentials: client.credentials || { password: '' },
//       modeOfContact: client.modeOfContact || [],
//       socialMedia: client.socialMedia || {},
//     },
//   });

//   const postalCode = watch('address.postalCode');
//   const selectedModes = watch('modeOfContact');

//   const handlePostalCodeChange = async () => {
//     if (postalCode?.length === 7) {
//       try {
//         const address = await fetchJapaneseAddress(postalCode);
//         if (address) {
//           setValue('address.prefecture', address.prefecture);
//           setValue('address.city', address.city);
//           setValue('address.street', address.town);
//         }
//       } catch (error) {
//         toast.error('Failed to fetch address. Please check the postal code.');
//         console.error('Failed to fetch address:', error);
//       }
//     }
//   };

//   const handleModeOfContactChange = (mode: string) => {
//     const currentModes = watch('modeOfContact');
//     if (currentModes.includes(mode as any)) {
//       setValue('modeOfContact', currentModes.filter((m) => m !== mode));
//     } else {
//       setValue('modeOfContact', [...currentModes, mode as any]);
//     }
//   };

//   const handleClickUpdate = async () => {
//     const data = {
//       ...watch(),
//     };

//     setIsSubmitting(true);
//     try {
//       const response = await axios.put(
//         `${import.meta.env.VITE_REACT_APP_URL}/api/v1/client/updateClient/${client._id}`,
//         {
//           ...client,
//           ...data,
//           credentials: {
//             ...client.credentials,
//             password: data.password || client.credentials?.password,
//           },
//         },
//         {
//           headers: {
//             'Content-Type': 'application/json',
//           },
//         }
//       );

//       if (response.status !== 200) {
//         throw new Error('Failed to update client');
//       }

//       toast.success('Client updated successfully!');
//       onClose();
//       getAllClients();
//     } catch (error) {
//       console.error('Error updating client:', error);
//       toast.error('Failed to update client. Please try again later.');
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//     <div className="bg-white rounded-lg p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
//       <div className="flex justify-between items-center mb-8">
//         <h2 className="text-2xl font-semibold">Edit Client</h2>
//         <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
//           <X className="h-5 w-5" />
//         </button>
//       </div>

//       <form className="space-y-10">
//         {/* Profile Photo Section - Centered at top */}
//         <div className="flex flex-col items-center gap-4 mb-10">
//           <div className="relative w-32 h-32">
//             {client.profilePhoto ? (
//               <img
//                 src={client.profilePhoto}
//                 alt="Profile"
//                 className="w-full h-full rounded-full object-cover border-4 border-brand-yellow"
//               />
//             ) : (
//               <div className="w-full h-full rounded-full bg-gray-100 border-4 border-dashed border-gray-300 flex items-center justify-center">
//                 <Upload className="h-8 w-8 text-gray-400" />
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Two Column Layout for Form Fields */}
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
//           <div className="space-y-2">
//             <label className="block text-sm font-medium text-gray-700">Name</label>
//             <Input {...register('name')} className="w-full" />
//             {errors.name && (
//               <p className="text-sm text-red-600">{errors.name.message as string}</p>
//             )}
//           </div>

//           <div className="space-y-2">
//             <label className="block text-sm font-medium text-gray-700">Category</label>
//             <select
//               {...register('category')}
//               className="w-full rounded-md border-gray-300 shadow-sm focus:border-brand-yellow focus:ring-brand-yellow h-10 px-3"
//             >
//               {categories.map((category) => (
//                 <option key={category} value={category}>{category}</option>
//               ))}
//             </select>
//           </div>

//           <div className="space-y-2">
//             <label className="block text-sm font-medium text-gray-700">Email</label>
//             <Input {...register('email')} type="email" className="w-full" />
//             {errors.email && (
//               <p className="text-sm text-red-600">{errors.email.message as string}</p>
//             )}
//           </div>

//           <div className="space-y-2">
//             <label className="block text-sm font-medium text-gray-700">Status</label>
//             <select
//               {...register('status')}
//               className="w-full rounded-md border-gray-300 shadow-sm focus:border-brand-yellow focus:ring-brand-yellow h-10 px-3"
//             >
//               <option value="active">Active</option>
//               <option value="inactive">Inactive</option>
//             </select>
//             {client.status === 'active' && (
//               <p className="text-sm text-gray-500">
//                 Note: Setting status to inactive will disable portal access for this client.
//               </p>
//             )}
//           </div>

//           <div className="space-y-2">
//             <label className="block text-sm font-medium text-gray-700">Phone</label>
//             <Input {...register('phone')} type="tel" className="w-full" />
//             {errors.phone && (
//               <p className="text-sm text-red-600">{errors.phone.message as string}</p>
//             )}
//           </div>

//           <div className="space-y-2">
//             <label className="block text-sm font-medium text-gray-700">Password</label>
//             <Input {...register('password')} type="password" className="w-full" disabled />
//           </div>

//           <div className="space-y-2">
//             <label className="block text-sm font-medium text-gray-700">Nationality</label>
//             <select
//               {...register('nationality')}
//               className="w-full rounded-md border-gray-300 shadow-sm focus:border-brand-yellow focus:ring-brand-yellow h-10 px-3"
//             >
//               <option value="">Select nationality</option>
//               {countries.map((country) => (
//                 <option key={country.code} value={country.name}>{country.name}</option>
//               ))}
//             </select>
//             {errors.nationality && (
//               <p className="text-sm text-red-600">{errors.nationality.message as string}</p>
//             )}
//           </div>

//           <div className="space-y-2">
//             <label className="block text-sm font-medium text-gray-700">Facebook Profile</label>
//             <Input
//               {...register('socialMedia.facebook')}
//               placeholder="Facebook profile URL"
//               className="w-full"
//             />
//           </div>
//         </div>

//         {/* Address Section */}
//         <div className="border-t pt-8">
//           <h3 className="font-medium text-lg mb-6">Address</h3>
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
//             <div className="md:col-span-2 space-y-2">
//               <label className="block text-sm font-medium text-gray-700">Postal Code</label>
//               <div className="relative">
//                 <Input
//                   {...register('postalCode')}
//                   onChange={(e) => {
//                     register('address.postalCode').onChange(e);
//                     handlePostalCodeChange();
//                   }}
//                   placeholder="123-4567"
//                   className="w-full"
//                 />
//               </div>
//             </div>

//             <div className="space-y-2">
//               <label className="block text-sm font-medium text-gray-700">Prefecture</label>
//               <Input {...register('prefecture')} className="w-full" />
//             </div>

//             <div className="space-y-2">
//               <label className="block text-sm font-medium text-gray-700">City</label>
//               <Input {...register('city')} className="w-full" />
//             </div>

//             <div className="md:col-span-2 space-y-2">
//               <label className="block text-sm font-medium text-gray-700">Street</label>
//               <Input {...register('street')} className="w-full" />
//             </div>

//             <div className="md:col-span-2 space-y-2">
//               <label className="block text-sm font-medium text-gray-700">Building & Apartment</label>
//               <Input
//                 {...register('building')}
//                 placeholder="Building name, Floor, Unit number"
//                 className="w-full"
//               />
//             </div>
//           </div>
//         </div>

//         {/* Contact Preferences */}
//         <div className="border-t pt-8">
//           <h3 className="font-medium text-lg mb-6">Contact Preferences</h3>
//           <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
//             {(['Direct Call', 'Viber', 'WhatsApp', 'Facebook Messenger'] as const).map((mode) => (
//               <label key={mode} className="flex items-center gap-3 cursor-pointer">
//                 <input
//                   type="checkbox"
//                   checked={selectedModes.includes(mode)}
//                   onChange={() => handleModeOfContactChange(mode)}
//                   className="w-4 h-4 rounded border-gray-300 text-brand-yellow focus:ring-brand-yellow"
//                 />
//                 <span className="text-sm text-gray-700">{mode}</span>
//               </label>
//             ))}
//           </div>
//         </div>

//         {/* Form Actions */}
//         <div className="flex justify-end gap-4 border-t pt-8">
//           <Button type="button" variant="outline" onClick={onClose}>
//             Cancel
//           </Button>
//           <Button
//             onClick={handleClickUpdate}
//             disabled={isSubmitting}
//             loading={isSubmitting}
//           >
//             Update Client
//           </Button>
//         </div>
//       </form>
//     </div>
//   </div>
//   );
// }





import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X, Upload } from 'lucide-react';
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
  const [postalCodeError, setPostalCodeError] = useState('');

  const parsedModeOfContact = client.modeOfContact?.[0] ? 
    client.modeOfContact[0].replace(/[\[\]"]/g, '').split(',') : 
    [];
    
  const parsedSocialMedia = client.socialMedia?.[0] ? 
    JSON.parse(client.socialMedia[0]) : 
    { facebook: '' };

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
      // credentials: client.credentials || { password: '' },
      modeOfContact: parsedModeOfContact,
      socialMedia: parsedSocialMedia,
    },
  });

  const postalCode = watch('address.postalCode');
  const selectedModes = watch('modeOfContact') || [];

  const validatePostalCode = (value: string) => {
    const cleanValue = value.replace(/[^0-9]/g, '');
    if (cleanValue.length !== 7) {
      setPostalCodeError('Postal code must be exactly 7 digits');
      return false;
    }
    setPostalCodeError('');
    return true;
  };

  const handlePostalCodeChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    register('address.postalCode').onChange(e);
    
    if (validatePostalCode(value) && value.length === 7) {
      try {
        const address = await fetchJapaneseAddress(value);
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
    const currentModes = watch('modeOfContact') || [];
    if (currentModes.includes(mode)) {
      setValue('modeOfContact', currentModes.filter((m) => m !== mode));
    } else {
      setValue('modeOfContact', [...currentModes, mode]);
    }
  };

  const handleClickUpdate = async () => {
    if (postalCode && !validatePostalCode(postalCode)) {
      return;
    }

    const formData = watch();
    
    const data = {
      ...formData,
      modeOfContact: [JSON.stringify(formData.modeOfContact)],
      socialMedia: [JSON.stringify(formData.socialMedia)],
    };

    setIsSubmitting(true);
    try {
      const response = await axios.put(
        `${import.meta.env.VITE_REACT_APP_URL}/api/v1/client/updateClient/${client._id}`,
        data,
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

  const selectClassName = "w-full rounded-md border border-gray-300 shadow-sm focus:border-brand-yellow focus:ring focus:ring-brand-yellow focus:ring-opacity-50 h-10 px-3";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-semibold">Edit Client</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form className="space-y-10">
          {/* Profile Photo Section */}
          <div className="flex flex-col items-center gap-4 mb-10">
            <div className="relative w-32 h-32">
              {client.profilePhoto ? (
                <img
                  src={client.profilePhoto}
                  alt="Profile"
                  className="w-full h-full rounded-full object-cover border-4 border-brand-yellow"
                />
              ) : (
                <div className="w-full h-full rounded-full bg-gray-100 border-4 border-dashed border-gray-300 flex items-center justify-center">
                  <Upload className="h-8 w-8 text-gray-400" />
                </div>
              )}
            </div>
          </div>

          {/* Two Column Layout for Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <Input {...register('name')} className="w-full" />
              {errors.name && (
                <p className="text-sm text-red-600">{errors.name.message as string}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Category</label>
              <select
                {...register('category')}
                className={selectClassName}
              >
                {categories.map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <Input {...register('email')} type="email" className="w-full" />
              {errors.email && (
                <p className="text-sm text-red-600">{errors.email.message as string}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <select
                {...register('status')}
                className={selectClassName}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              {client.status === 'active' && (
                <p className="text-sm text-gray-500">
                  Note: Setting status to inactive will disable portal access for this client.
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Phone</label>
              <Input {...register('phone')} type="tel" className="w-full" />
              {errors.phone && (
                <p className="text-sm text-red-600">{errors.phone.message as string}</p>
              )}
            </div>

            {/* <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <Input {...register('password')} type="password" className="w-full" disabled />
            </div> */}

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Nationality</label>
              <select
                {...register('nationality')}
                className={selectClassName}
              >
                <option value="">Select nationality</option>
                {countries.map((country) => (
                  <option key={country.code} value={country.name}>{country.name}</option>
                ))}
              </select>
              {errors.nationality && (
                <p className="text-sm text-red-600">{errors.nationality.message as string}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Facebook Profile</label>
              <Input
                {...register('socialMedia.facebook')}
                placeholder="Facebook profile URL"
                className="w-full"
              />
            </div>
          </div>

          {/* Address Section */}
          <div className="border-t pt-8">
            <h3 className="font-medium text-lg mb-6">Address</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <div className="md:col-span-2 space-y-2">
                <label className="block text-sm font-medium text-gray-700">Postal Code</label>
                <div className="relative">
                  <Input
                    {...register('postalCode')}
                    onChange={handlePostalCodeChange}
                    placeholder="1234567 (7 digits)"
                    maxLength={7}
                    className="w-full"
                  />
                </div>
                {postalCodeError && (
                  <p className="text-sm text-red-600">{postalCodeError}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Prefecture</label>
                <Input {...register('prefecture')} className="w-full" />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">City</label>
                <Input {...register('city')} className="w-full" />
              </div>

              <div className="md:col-span-2 space-y-2">
                <label className="block text-sm font-medium text-gray-700">Street</label>
                <Input {...register('street')} className="w-full" />
              </div>

              <div className="md:col-span-2 space-y-2">
                <label className="block text-sm font-medium text-gray-700">Building & Apartment</label>
                <Input
                  {...register('building')}
                  placeholder="Building name, Floor, Unit number"
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* Contact Preferences */}
          <div className="border-t pt-8">
            <h3 className="font-medium text-lg mb-6">Contact Preferences</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {(['Direct Call', 'Viber', 'WhatsApp', 'Facebook Messenger'] as const).map((mode) => (
                <label key={mode} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedModes.includes(mode)}
                    onChange={() => handleModeOfContactChange(mode)}
                    className="w-4 h-4 rounded border-gray-300 text-brand-yellow focus:ring-brand-yellow"
                  />
                  <span className="text-sm text-gray-700">{mode}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-4 border-t pt-8">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleClickUpdate}
              disabled={isSubmitting}
              loading={isSubmitting}
            >
              Update Client
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}