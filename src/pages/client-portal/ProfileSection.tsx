import { useState } from 'react';
import { User, Mail, Phone, MapPin } from 'lucide-react';
import Button from '../../components/Button';
import EditProfileModal from './EditProfileModal';
import type { Client } from '../../types';

interface ProfileSectionProps {
  client: Client;
}

export default function ProfileSection({ client }: ProfileSectionProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center gap-2 mb-6">
        <User className="h-6 w-6 text-gray-400" />
        <h2 className="text-xl font-semibold">Profile Information</h2>
      </div>

      <div className="flex items-center gap-6 mb-6">
        {client.profilePhoto ? (
          <img
            src={client.profilePhoto}
            alt={client.name}
            className="h-24 w-24 rounded-full object-cover"
          />
        ) : (
          <div className="h-24 w-24 rounded-full bg-brand-yellow/10 flex items-center justify-center">
            <span className="text-3xl text-brand-black font-medium">
              {client.name.split(' ').map(n => n[0]).join('')}
            </span>
          </div>
        )}

        <div className="flex-1">
          <h3 className="text-xl font-semibold">{client.name}</h3>
          <div className="mt-2 space-y-1">
            <div className="flex items-center gap-2 text-gray-600">
              <Mail className="h-4 w-4" />
              <span>{client.email}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Phone className="h-4 w-4" />
              <span>{client.phone}</span>
            </div>
          </div>
        </div>

        <Button variant="outline" onClick={() => setIsEditModalOpen(true)}>
          Edit Profile
        </Button>
      </div>

      <div className="space-y-4">
        <div className="flex items-start gap-2">
          <MapPin className="h-5 w-5 text-gray-400 mt-1" />
          <div>
            <p className="text-sm text-gray-500">Address</p>
            <p className="font-medium">
              {client.address.street}, {client.address.city}
            </p>
            <p className="font-medium">
              {client.address.prefecture} {client.address.postalCode}
            </p>
          </div>
        </div>
      </div>

      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        client={client}
      />
    </div>
  );
}