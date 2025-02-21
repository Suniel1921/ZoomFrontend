import React from "react";
import { X } from "lucide-react";
import Button from "../Button";

interface ProfilePhotoModalProps {
  isOpen: boolean;
  onClose: () => void;
  photoUrl: string | undefined;
  clientName: string;
}

const ProfilePhotoModal: React.FC<ProfilePhotoModalProps> = ({
  isOpen,
  onClose,
  photoUrl,
  clientName,
}) => {
  if (!isOpen || !photoUrl) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-4 max-w-lg w-full relative">
        <Button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
        >
          <X className="h-5 w-5" />
        </Button>
        <h2 className="text-lg font-semibold mb-2">{clientName}'s Profile Photo</h2>
        <img
          src={photoUrl}
          alt={clientName}
          className="w-full h-auto rounded-lg object-cover max-h-[70vh]"
        />
      </div>
    </div>
  );
};

export default ProfilePhotoModal;