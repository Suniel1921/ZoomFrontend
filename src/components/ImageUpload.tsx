// import { useState, useRef } from 'react';
// import { Upload, X } from 'lucide-react';
// import Button from './Button';

// interface ImageUploadProps {
//   currentImage?: string;
//   onImageUpload: (file: File) => void;
//   onImageRemove?: () => void;
// }

// export default function ImageUpload({ currentImage, onImageUpload, onImageRemove }: ImageUploadProps) {
//   const [previewUrl, setPreviewUrl] = useState<string | undefined>(currentImage);
//   const fileInputRef = useRef<HTMLInputElement>(null);

//   const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
//     const file = event.target.files?.[0];
//     if (file) {
//       if (file.size > 5 * 1024 * 1024) { // 5MB limit
//         alert('File size must be less than 5MB');
//         return;
//       }

//       if (!file.type.startsWith('image/')) {
//         alert('Only image files are allowed');
//         return;
//       }

//       const reader = new FileReader();
//       reader.onload = () => {
//         setPreviewUrl(reader.result as string);
//       };
//       reader.readAsDataURL(file);
//       onImageUpload(file);
//     }
//   };

//   const handleRemove = () => {
//     setPreviewUrl(undefined);
//     if (fileInputRef.current) {
//       fileInputRef.current.value = '';
//     }
//     onImageRemove?.();
//   };

//   return (
//     <div className="space-y-4">
//       {previewUrl ? (
//         <div className="relative w-32 h-32">
//           <img
//             src={previewUrl}
//             alt="Profile preview"
//             className="w-full h-full object-cover rounded-full"
//           />
//           <button
//             onClick={handleRemove}
//             className="absolute -top-2 -right-2 p-1 bg-red-100 text-red-600 rounded-full hover:bg-red-200"
//           >
//             <X className="h-4 w-4" />
//           </button>
//         </div>
//       ) : (
//         <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-full flex items-center justify-center bg-gray-50">
//           <Upload className="h-8 w-8 text-gray-400" />
//         </div>
//       )}

//       <input
//         ref={fileInputRef}
//         type="file"
//         accept="image/*"
//         onChange={handleFileSelect}
//         className="hidden"
//       />

//       <Button
//         type="button"
//         variant="outline"
//         onClick={() => fileInputRef.current?.click()}
//       >
//         {previewUrl ? 'Change Photo' : 'Upload Photo'}
//       </Button>
//     </div>
//   );
// }










import { useState, useRef, useEffect } from 'react';
import { Upload, X } from 'lucide-react';
import Button from './Button';

interface ImageUploadProps {
  currentImage?: string;
  onImageUpload: (file: File) => void;
  onImageRemove?: () => void;
}

export default function ImageUpload({ currentImage, onImageUpload, onImageRemove }: ImageUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(currentImage);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Update the previewUrl when currentImage prop changes
    setPreviewUrl(currentImage);
  }, [currentImage]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert('File size must be less than 5MB');
        return;
      }

      if (!file.type.startsWith('image/')) {
        alert('Only image files are allowed');
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
      onImageUpload(file);
    }
  };

  const handleRemove = () => {
    setPreviewUrl(undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onImageRemove?.();
  };

  return (
    <div className="space-y-4">
      {previewUrl ? (
        <div className="relative w-32 h-32">
          <img
            src={previewUrl}
            alt="Profile preview"
            className="w-full h-full object-cover rounded-full"
          />
          <button
            onClick={handleRemove}
            className="absolute -top-2 -right-2 p-1 bg-red-100 text-red-600 rounded-full hover:bg-red-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-full flex items-center justify-center bg-gray-50">
          <Upload className="h-8 w-8 text-gray-400" />
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      <Button
        type="button"
        variant="outline"
        onClick={() => fileInputRef.current?.click()}
      >
        {previewUrl ? 'Change Photo' : 'Upload Photo'}
      </Button>
    </div>
  );
}
