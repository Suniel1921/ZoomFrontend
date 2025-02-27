// import React, { useState, useEffect } from 'react';
// import axios from 'axios';

// const ManageApp = () => {
//   const [banners, setBanners] = useState([]);
//   const [file, setFile] = useState(null);

//   // Fetch banners
//   useEffect(() => {
//     const fetchBanners = async () => {
//       const response = await axios.get(`${import.meta.env.VITE_REACT_APP_URL}/api/v1/appBanner/getAppBanner`);
//       setBanners(response.data);
//     };
//     fetchBanners();
//   }, []);

//   // Handle file upload
//   const handleUpload = async () => {
//     const formData = new FormData();
//     formData.append('image', file);

//     try {
//       const response = await axios.post(`${import.meta.env.VITE_REACT_APP_URL}/api/v1/appBanner/uploadAppBanner`, formData, {
//         headers: { 'Content-Type': 'multipart/form-data' },
//       });
//       setBanners([...banners, response.data.banner]);
//       setFile(null);
//     } catch (error) {
//       console.error('Error uploading banner:', error);
//     }
//   };

//   // Handle delete banner
//   const handleDelete = async (id) => {
//     try {
//       await axios.delete(`${import.meta.env.VITE_REACT_APP_URL}/api/v1/appBanner/deleteAppBanner/${id}`);
//       setBanners(banners.filter((banner) => banner._id !== id));
//     } catch (error) {
//       console.error('Error deleting banner:', error);
//     }
//   };

//   return (
//     <div>
//       <h1>Manage Banners</h1>
//       <input
//         type="file"
//         accept="image/*"
//         onChange={(e) => setFile(e.target.files[0])}
//       />
//       <button onClick={handleUpload} disabled={!file}>
//         Upload Banner
//       </button>

//       <h2>Existing Banners</h2>
//       {banners.length === 0 ? (
//         <p>No banners available</p>
//       ) : (
//         <ul>
//           {banners.map((banner) => (
//             <li key={banner._id}>
//               <img src={banner.imageUrl} alt="Banner" width={100} />
//               <button onClick={() => handleDelete(banner._id)}>Delete</button>
//             </li>
//           ))}
//         </ul>
//       )}
//     </div>
//   );
// };

// export default ManageApp;















import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { Trash2, Upload, ImagePlus, X, Check, Info } from 'lucide-react';

// Environment variable fallback
const API_BASE_URL = import.meta.env.VITE_REACT_APP_URL || 'https://api.zoomcreatives.jp';

// API functions
const fetchBanners = async () => {
  const response = await axios.get(`${API_BASE_URL}/api/v1/appBanner/getAppBanner`);
  return response.data;
};

const uploadBanner = async (formData) => {
  const response = await axios.post(
    `${API_BASE_URL}/api/v1/appBanner/uploadAppBanner`,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  );
  return response.data;
};

const deleteBanner = async (bannerId) => {
  await axios.delete(`${API_BASE_URL}/api/v1/appBanner/deleteAppBanner/${bannerId}`);
};

// Component for empty state
const EmptyState = () => (
  <div className="flex flex-col items-center justify-center py-12 px-4 animate-fade-in">
    <div className="h-24 w-24 rounded-full bg-gray-200 flex items-center justify-center mb-6">
      <ImagePlus className="h-10 w-10 text-[#232323]" strokeWidth={1.5} />
    </div>
    <h3 className="text-xl font-medium mb-2 text-[#232323]">No banners available</h3>
    <p className="text-[#232323]/70 text-center max-w-md mb-6">
      Upload your first banner image to get started. Your banners will appear here.
    </p>
  </div>
);

// Component for file upload
const FileUpload = ({ onFileChange, file, isUploading }) => {
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }

    const fileReader = new FileReader();
    fileReader.onload = () => {
      setPreviewUrl(fileReader.result);
    };
    fileReader.readAsDataURL(file);
  }, [file]);

  return (
    <div className="mb-8 w-full max-w-xl mx-auto animate-fade-up">
      <p className="text-sm text-[#232323]/70 mb-2 font-medium">Upload Banner</p>
      <div
        className={`border-2 border-dashed p-4 rounded-lg text-center transition-colors duration-200 ${
          file ? 'border-[#fcda00]' : 'border-[#232323]/30 hover:border-[#232323]/50'
        }`}
      >
        <input
          type="file"
          accept="image/*"
          onChange={(e) => onFileChange(e.target.files?.[0] || null)}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={isUploading}
        />
        {previewUrl ? (
          <div className="relative w-full">
            <img
              src={previewUrl}
              alt="Preview"
              className="h-40 object-contain mx-auto rounded-md"
            />
            <button
              onClick={(e) => {
                e.stopPropagation();
                onFileChange(null);
              }}
              className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full transform translate-x-1/2 -translate-y-1/2 hover:bg-red-600 transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="mx-auto h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center transition-colors duration-200 hover:bg-gray-200">
              <Upload className="h-5 w-5 text-[#232323] hover:text-[#fcda00] transition-colors" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-[#232323]">Drag & drop or click to upload</p>
              <p className="text-xs text-[#232323]/70">
                Supported formats: PNG, JPG, GIF (max 5MB)
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Banner card component
const BannerCard = ({ banner, onDelete, isDeleting }) => {
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <div className="border border-[#232323]/20 rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow animate-scale-in">
      <div className="overflow-hidden rounded-md mb-2">
        <img
          src={banner.imageUrl}
          alt="Banner"
          loading="lazy"
          className="w-full h-auto object-cover transform hover:scale-105 transition-transform duration-200"
        />
      </div>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-[#232323] truncate">
            Banner {banner._id.slice(-6)}
          </p>
          <p className="text-xs text-[#232323]/70">
            {new Date(banner.createdAt || Date.now()).toLocaleDateString()}
          </p>
        </div>
        {showConfirm ? (
          <div className="flex space-x-2">
            <button
              onClick={() => setShowConfirm(false)}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Cancel"
            >
              <X size={16} className="text-[#232323]" />
            </button>
            <button
              onClick={() => {
                onDelete(banner._id);
                setShowConfirm(false);
              }}
              className="p-2 rounded-full bg-red-50 hover:bg-red-100 text-red-500 transition-colors"
              aria-label="Confirm delete"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <div className="h-4 w-4 rounded-full border-2 border-red-300 border-t-red-500 animate-spin" />
              ) : (
                <Check size={16} />
              )}
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowConfirm(true)}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Delete banner"
          >
            <Trash2 size={16} className="text-[#232323] hover:text-red-500 transition-colors" />
          </button>
        )}
      </div>
    </div>
  );
};

// Main component
const ManageApp = () => {
  const [banners, setBanners] = useState([]);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // Fetch banners
  useEffect(() => {
    const getBanners = async () => {
      try {
        const data = await fetchBanners();
        setBanners(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching banners:', err);
        setError('Failed to fetch banners');
        setLoading(false);
      }
    };
    getBanners();
  }, []);

  // Handle file change
  const handleFileChange = (selectedFile) => {
    setFile(selectedFile);
  };

  // Handle upload
  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const data = await uploadBanner(formData);
      setBanners((prev) => [...prev, data.banner]); // Assuming response.data.banner is the new banner
      setFile(null);
      toast.success('Banner uploaded successfully');
    } catch (error) {
      console.error('Error uploading banner:', error);
      toast.error('Failed to upload banner');
    } finally {
      setIsUploading(false);
    }
  };

  // Handle delete
  const handleDelete = async (bannerId) => {
    setDeletingId(bannerId);
    try {
      await deleteBanner(bannerId);
      setBanners((prev) => prev.filter((banner) => banner._id !== bannerId));
      toast.success('Banner deleted successfully');
    } catch (error) {
      console.error('Error deleting banner:', error);
      toast.error('Failed to delete banner');
    } finally {
      setDeletingId(null);
    }
  };

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 animate-fade-in">
        <div className="text-center max-w-md px-4">
          <div className="h-20 w-20 mx-auto mb-6 rounded-full bg-red-50 flex items-center justify-center">
            <Info className="h-10 w-10 text-red-500" />
          </div>
          <h1 className="text-2xl font-medium mb-3 text-[#232323]">Something went wrong</h1>
          <p className="text-[#232323]/70 mb-6">
            There was an error loading your banners. Please try again later or contact support.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-[#fcda00] text-[#232323] px-4 py-2 rounded-md hover:bg-[#e6c700] transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-12 md:py-16 max-w-6xl mx-auto animate-fade-in">
      <div className="max-w-xl mx-auto text-center mb-10">
        <div className="inline-block rounded-full bg-[#fcda00]/20 px-3 py-1 text-xs font-medium text-[#232323] mb-4">
          Banner Management
        </div>
        <h1 className="text-3xl md:text-4xl font-semibold mb-3 text-[#232323]">
          Manage Your Banners
        </h1>
        <p className="text-[#232323]/70 max-w-md mx-auto">
          Upload, view, and manage banner images for your application interface.
        </p>
      </div>

      <FileUpload onFileChange={handleFileChange} file={file} isUploading={isUploading} />

      <div className="flex justify-center mb-12">
        <button
          onClick={handleUpload}
          disabled={!file || isUploading}
          className={`bg-[#fcda00] text-[#232323] px-6 py-2 rounded-md flex items-center justify-center min-w-40 transition-colors ${
            !file || isUploading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#e6c700]'
          }`}
        >
          {isUploading ? (
            <>
              <div className="mr-2 h-4 w-4 rounded-full border-2 border-[#232323]/30 border-t-[#232323] animate-spin" />
              Uploading...
            </>
          ) : (
            'Upload Banner'
          )}
        </button>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-medium mb-6 text-center text-[#232323]">
          {loading ? 'Loading banners...' : 'Your Banners'}
        </h2>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="border border-[#232323]/20 rounded-lg p-4 bg-white shadow-sm animate-pulse"
              >
                <div className="w-full h-40 bg-gray-200 rounded-md shimmer-effect"></div>
                <div className="flex items-center justify-between mt-2">
                  <div>
                    <div className="h-4 w-24 bg-gray-200 rounded shimmer-effect"></div>
                    <div className="h-3 w-16 bg-gray-200 rounded mt-1 shimmer-effect"></div>
                  </div>
                  <div className="h-8 w-8 bg-gray-200 rounded-full shimmer-effect"></div>
                </div>
              </div>
            ))}
          </div>
        ) : banners.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {banners.map((banner) => (
              <BannerCard
                key={banner._id}
                banner={banner}
                onDelete={handleDelete}
                isDeleting={deletingId === banner._id}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageApp;
