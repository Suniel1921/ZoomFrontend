import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X } from 'lucide-react';
import Button from '../../components/Button';
import Input from '../../components/Input';
import { useStore } from '../../store';
import { fetchJapaneseAddress } from '../../services/addressService';
import type { Client } from '../../types';

const profileSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(1, 'Phone number is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  address: z.object({
    postalCode: z.string().min(7, 'Postal code must be 7 digits'),
    prefecture: z.string().min(1, 'Prefecture is required'),
    city: z.string().min(1, 'City is required'),
    street: z.string().min(1, 'Street is required'),
    building: z.string().optional(),
  }),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: Client;
}

export default function EditProfileModal({
  isOpen,
  onClose,
  client,
}: EditProfileModalProps) {
  const { updateClient } = useStore();
  const [isAddressLoading, setIsAddressLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      ...client,
      password: client.credentials?.password || '',
    },
  });

  const postalCode = watch('address.postalCode');

  const handlePostalCodeChange = async () => {
    if (postalCode?.length === 7) {
      setIsAddressLoading(true);
      try {
        const address = await fetchJapaneseAddress(postalCode);
        if (address) {
          setValue('address.prefecture', address.prefecture);
          setValue('address.city', address.city);
          setValue('address.street', address.town);
        }
      } catch (error) {
        console.error('Failed to fetch address:', error);
      } finally {
        setIsAddressLoading(false);
      }
    }
  };

  const onSubmit = (data: ProfileFormData) => {
    updateClient(client.id, {
      ...data,
      credentials: {
        ...client.credentials,
        password: data.password,
      },
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Edit Profile</h2>
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
            <label className="block text-sm font-medium text-gray-700">Phone</label>
            <Input {...register('phone')} type="tel" className="mt-1" />
            {errors.phone && (
              <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <Input {...register('password')} type="text" className="mt-1" />
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
            )}
          </div>

          <div className="space-y-4">
            <h3 className="font-medium">Address</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700">
                  Postal Code
                </label>
                <Input
                  {...register('address.postalCode')}
                  onChange={(e) => {
                    register('address.postalCode').onChange(e);
                    handlePostalCodeChange();
                  }}
                  placeholder="1000001"
                  className="mt-1"
                />
                {errors.address?.postalCode && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.address.postalCode.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Prefecture
                </label>
                <Input
                  {...register('address.prefecture')}
                  className="mt-1"
                  disabled={isAddressLoading}
                />
                {errors.address?.prefecture && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.address.prefecture.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">City</label>
                <Input
                  {...register('address.city')}
                  className="mt-1"
                  disabled={isAddressLoading}
                />
                {errors.address?.city && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.address.city.message}
                  </p>
                )}
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700">Street</label>
                <Input
                  {...register('address.street')}
                  className="mt-1"
                  disabled={isAddressLoading}
                />
                {errors.address?.street && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.address.street.message}
                  </p>
                )}
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700">
                  Building & Apartment
                </label>
                <Input
                  {...register('address.building')}
                  placeholder="Building name, Floor, Unit number"
                  className="mt-1"
                />
              </div>
            </div>
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