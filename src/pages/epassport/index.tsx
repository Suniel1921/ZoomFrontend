// import { useState } from 'react';
// import { CreditCard, Plus, Search, Calculator, Upload, Eye, Download } from 'lucide-react';
// import Input from '../../components/Input';
// import Button from '../../components/Button';
// import { useStore } from '../../store';
// import AddEpassportModal from './AddEpassportModal';
// import EditEpassportModal from './EditEpassportModal';
// import HisabKitabModal from '../../components/HisabKitabModal';
// import PDFUploadModal from './PDFUploadModal';
// import PDFPreviewModal from './PDFPreviewModal';
// import DataTable from '../../components/DataTable';
// import type { EpassportApplication } from '../../types';
// import { PREFECTURES } from '../../constants/prefectures';

// const APPLICATION_TYPES = [
//   'Newborn Child',
//   'Passport Renewal',
//   'Lost Passport',
//   'Damaged Passport',
//   'Travel Document',
//   'Birth Registration'
// ] as const;

// export default function EpassportPage() {
//   const [searchQuery, setSearchQuery] = useState('');
//   const [selectedType, setSelectedType] = useState<string>('');
//   const [selectedLocation, setSelectedLocation] = useState<string>('');
//   const [isAddModalOpen, setIsAddModalOpen] = useState(false);
//   const [isEditModalOpen, setIsEditModalOpen] = useState(false);
//   const [isHisabKitabOpen, setIsHisabKitabOpen] = useState(false);
//   const [isPDFUploadOpen, setIsPDFUploadOpen] = useState(false);
//   const [isPDFPreviewOpen, setIsPDFPreviewOpen] = useState(false);
//   const [selectedApplication, setSelectedApplication] = useState<EpassportApplication | null>(null);
  
//   const { epassportApplications, deleteEpassportApplication } = useStore();

//   // Filter applications based on search query and filters
//   const filteredApplications = epassportApplications.filter(app => {
//     const matchesSearch = app.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
//                          app.applicationType?.toLowerCase().includes(searchQuery.toLowerCase());
//     const matchesType = !selectedType || app.applicationType === selectedType;
//     const matchesLocation = !selectedLocation || 
//                           (app.ghumtiService && app.prefecture === selectedLocation);
//     return matchesSearch && matchesType && matchesLocation;
//   });

//   const formatPhoneForViber = (phone: string | undefined | null): string => {
//     if (!phone) return '';
//     return phone.replace(/\D/g, '');
//   };

//   const handleDelete = (id: string) => {
//     if (window.confirm('Are you sure you want to delete this application?')) {
//       deleteEpassportApplication(id);
//     }
//   };

//   const handleDownloadPDF = (application: EpassportApplication) => {
//     if (application.pdfFile?.url) {
//       window.open(application.pdfFile.url, '_blank');
//     }
//   };

//   const columns = [
//     {
//       key: 'clientName',
//       label: 'Client',
//       render: (value: string) => (
//         <div>
//           <p className="font-medium">{value}</p>
//         </div>
//       ),
//     },
//     {
//       key: 'mobileNo',
//       label: 'Contact',
//       render: (value: string | undefined | null) => {
//         if (!value) return <span className="text-gray-400">No contact</span>;
//         return (
//           <a 
//             href={`viber://chat?number=${formatPhoneForViber(value)}`}
//             className="text-brand-black hover:text-brand-yellow"
//           >
//             {value}
//           </a>
//         );
//       },
//     },
//     {
//       key: 'applicationType',
//       label: 'Type',
//       render: (value: string) => (
//         <span className="px-2 py-1 rounded-full text-xs font-medium bg-brand-yellow/10 text-brand-black">
//           {value}
//         </span>
//       ),
//     },
//     {
//       key: 'applicationStatus',
//       label: 'Status',
//       render: (value: string) => (
//         <span className={`px-2 py-1 rounded-full text-xs font-medium ${
//           value === 'Completed' ? 'bg-green-100 text-green-700' :
//           value === 'Cancelled' ? 'bg-red-100 text-red-700' :
//           'bg-blue-100 text-blue-700'
//         }`}>
//           {value}
//         </span>
//       ),
//     },
//     {
//       key: 'amount',
//       label: 'Amount',
//       render: (value: number) => (
//         <span className="text-sm">¥{value?.toLocaleString() ?? 0}</span>
//       ),
//     },
//     {
//       key: 'paymentStatus',
//       label: 'Payment',
//       render: (value: string) => (
//         <span className={`px-2 py-1 rounded-full text-xs font-medium ${
//           value === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
//         }`}>
//           {value}
//         </span>
//       ),
//     },
//     {
//       key: 'id',
//       label: 'Actions',
//       render: (_: string, item: EpassportApplication) => (
//         <div className="flex justify-end gap-2">
//           <Button
//             variant="outline"
//             size="sm"
//             onClick={() => {
//               setSelectedApplication(item);
//               setIsPDFUploadOpen(true);
//             }}
//             title="Upload PDF"
//           >
//             <Upload className="h-4 w-4" />
//           </Button>
//           {item.pdfFile && (
//             <>
//               <Button
//                 variant="outline"
//                 size="sm"
//                 onClick={() => {
//                   setSelectedApplication(item);
//                   setIsPDFPreviewOpen(true);
//                 }}
//                 title="Preview PDF"
//               >
//                 <Eye className="h-4 w-4" />
//               </Button>
//               <Button
//                 variant="outline"
//                 size="sm"
//                 onClick={() => handleDownloadPDF(item)}
//                 title="Download PDF"
//               >
//                 <Download className="h-4 w-4" />
//               </Button>
//             </>
//           )}
//           <Button
//             variant="outline"
//             size="sm"
//             onClick={() => {
//               setSelectedApplication(item);
//               setIsHisabKitabOpen(true);
//             }}
//             title="View HisabKitab"
//           >
//             <Calculator className="h-4 w-4" />
//           </Button>
//           <Button
//             variant="outline"
//             size="sm"
//             onClick={() => {
//               setSelectedApplication(item);
//               setIsEditModalOpen(true);
//             }}
//           >
//             Edit
//           </Button>
//           <Button
//             variant="outline"
//             size="sm"
//             onClick={() => handleDelete(item.id)}
//             className="text-red-500 hover:text-red-700"
//           >
//             Delete
//           </Button>
//         </div>
//       ),
//     },
//   ];

//   return (
//     <div>
//       <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
//         <div className="flex items-center justify-between gap-4">
//           <div className="flex items-center gap-2">
//             <CreditCard className="h-6 w-6 text-gray-400" />
//             <h1 className="text-xl font-semibold text-gray-900">ePassport Applications</h1>
//           </div>
          
//           <div className="flex items-center gap-4">
//             <select
//               value={selectedType}
//               onChange={(e) => setSelectedType(e.target.value)}
//               className="rounded-md border-gray-300 shadow-sm focus:border-brand-yellow focus:ring-brand-yellow"
//             >
//               <option value="">All Types</option>
//               {APPLICATION_TYPES.map((type) => (
//                 <option key={type} value={type}>{type}</option>
//               ))}
//             </select>

//             <select
//               value={selectedLocation}
//               onChange={(e) => setSelectedLocation(e.target.value)}
//               className="rounded-md border-gray-300 shadow-sm focus:border-brand-yellow focus:ring-brand-yellow"
//             >
//               <option value="">All Locations</option>
//               {PREFECTURES.map((prefecture) => (
//                 <option key={prefecture} value={prefecture}>{prefecture}</option>
//               ))}
//             </select>

//             <div className="relative flex-1">
//               <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
//               <Input
//                 type="search"
//                 placeholder="Search applications..."
//                 value={searchQuery}
//                 onChange={(e) => setSearchQuery(e.target.value)}
//                 className="pl-10"
//               />
//             </div>
//             <Button onClick={() => setIsAddModalOpen(true)}>
//               <Plus className="h-4 w-4 mr-2" />
//               New Application
//             </Button>
//           </div>
//         </div>
//       </div>

//       <div className="mt-6">
//         <DataTable
//           columns={columns}
//           data={filteredApplications}
//           searchable={false}
//         />
//       </div>

//       <AddEpassportModal
//         isOpen={isAddModalOpen}
//         onClose={() => setIsAddModalOpen(false)}
//       />

//       {selectedApplication && (
//         <>
//           <EditEpassportModal
//             isOpen={isEditModalOpen}
//             onClose={() => {
//               setIsEditModalOpen(false);
//               setSelectedApplication(null);
//             }}
//             application={selectedApplication}
//           />

//           <HisabKitabModal
//             isOpen={isHisabKitabOpen}
//             onClose={() => {
//               setIsHisabKitabOpen(false);
//               setSelectedApplication(null);
//             }}
//             application={selectedApplication}
//           />

//           <PDFUploadModal
//             isOpen={isPDFUploadOpen}
//             onClose={() => {
//               setIsPDFUploadOpen(false);
//               setSelectedApplication(null);
//             }}
//             application={selectedApplication}
//           />

//           {selectedApplication.pdfFile && (
//             <PDFPreviewModal
//               isOpen={isPDFPreviewOpen}
//               onClose={() => {
//                 setIsPDFPreviewOpen(false);
//                 setSelectedApplication(null);
//               }}
//               pdfUrl={selectedApplication.pdfFile.url}
//               fileName={selectedApplication.pdfFile.name}
//             />
//           )}
//         </>
//       )}
//     </div>
//   );
// }
















// ***************NEW CODE******************


import { useState, useEffect } from 'react';
import { CreditCard, Plus, Search, Calculator, Upload, Eye, Download } from 'lucide-react';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { useStore } from '../../store';
import AddEpassportModal from './AddEpassportModal';
import EditEpassportModal from './EditEpassportModal';
import HisabKitabModal from '../../components/HisabKitabModal';
import PDFUploadModal from './PDFUploadModal';
import PDFPreviewModal from './PDFPreviewModal';
import DataTable from '../../components/DataTable';
import { PREFECTURES } from '../../constants/prefectures';
import axios from 'axios';
import { EpassportApplication } from '../../types';
import toast from 'react-hot-toast';

const APPLICATION_TYPES = [
  'Newborn Child',
  'Passport Renewal',
  'Lost Passport',
  'Damaged Passport',
  'Travel Document',
  'Birth Registration'
] as const;

export default function EpassportPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isHisabKitabOpen, setIsHisabKitabOpen] = useState(false);
  const [isPDFUploadOpen, setIsPDFUploadOpen] = useState(false);
  const [isPDFPreviewOpen, setIsPDFPreviewOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<any | null>(null);
  const [epassportApplications, setEpassportApplications] = useState<EpassportApplication[]>([]);



  


  const getAllEPassportApplication = () => {
    // Fetch ePassport applications when the component mounts
    axios.get(`${import.meta.env.VITE_REACT_APP_URL}/api/v1/ePassport/getAllePassports`)
      .then((response) => {
        if (response.data.success) {
          setEpassportApplications(response.data.data); // Update the state with the fetched data
        }
      })
      .catch((error) => {
        console.error('Error fetching ePassport applications:', error);
      });
  }
  
  useEffect(() => {
    getAllEPassportApplication();    
  }, []);

  

  // Filter applications based on search query and filters
  const filteredApplications = epassportApplications.filter(app => {
    const matchesSearch =
      (app.clientName && app.clientName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (app.applicationType && app.applicationType.toLowerCase().includes(searchQuery.toLowerCase()));
  
    const matchesType = !selectedType || app.applicationType === selectedType;
    const matchesLocation = !selectedLocation || (app.ghumtiService && app.prefecture === selectedLocation);
  
    return matchesSearch && matchesType && matchesLocation;
  });
  
  const formatPhoneForViber = (phone: string | undefined | null): string => {
    if (!phone) return '';
    return phone.replace(/\D/g, '');
  };

  const handleDelete = async (_id: string) => {
    if (window.confirm('Are you sure you want to delete this application?')) {
      try {
        // Send the delete request
        const response = await axios.delete(`${import.meta.env.VITE_REACT_APP_URL}/api/v1/ePassport/deleteEpassport/${_id}`);
        
        // Check if the response was successful
        if (response?.data?.success) {
          // Remove the deleted application from the local state
          // setEpassportApplications((prev) => prev.filter((app) => app.id !== _id));
          toast.success('Application deleted successfully!');
          
          // Fetch the updated list of applications
          getAllEPassportApplication();  // <-- This will refresh the list after delete
        } else {
          toast.error('Failed to delete the application.');
        }
      } catch (error) {
        // Catch and handle any errors during the delete operation
        console.error('Error deleting application:', error);
        toast.error('An error occurred while deleting the application.');
      }
    }
  };
  
  
  const handleDownloadPDF = (application: any) => {
    if (application.pdfFile?.url) {
      window.open(application.pdfFile.url, '_blank');
    }
  };

  const columns = [
    {
      key: 'clientName',
      label: 'Client',
      render: (value: string, item: EpassportApplication) => {
        const clientName = item.clientId?.name || 'Unknown Name';  // Fallback if clientName is undefined
        return (
          <div>
            <p className="font-medium">{clientName}</p>
          </div>
        );
      },
    },
  
  
    {
      key: 'mobileNo',
      label: 'Contact',
      render: (value: string | undefined | null) => {
        if (!value) return <span className="text-gray-400">No contact</span>;
        return (
          <a 
            href={`viber://chat?number=${formatPhoneForViber(value)}`}
            className="text-brand-black hover:text-brand-yellow"
          >
            {value}
          </a>
        );
      },
    },
    {
      key: 'applicationType',
      label: 'Type',
      render: (value: string) => (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-brand-yellow/10 text-brand-black">
          {value}
        </span>
      ),
    },
    {
      key: 'applicationStatus',
      label: 'Status',
      render: (value: string) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          value === 'Completed' ? 'bg-green-100 text-green-700' :
          value === 'Cancelled' ? 'bg-red-100 text-red-700' :
          'bg-blue-100 text-blue-700'
        }`}>
          {value}
        </span>
      ),
    },
    {
      key: 'amount',
      label: 'Amount',
      render: (value: number) => (
        <span className="text-sm">¥{value?.toLocaleString() ?? 0}</span>
      ),
    },
    {
      key: 'paymentStatus',
      label: 'Payment',
      render: (value: string) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          value === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
        }`}>
          {value}
        </span>
      ),
    },
    {
      key: 'id',
      label: 'Actions',
      render: (_: string, item: any) => (
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedApplication(item);
              setIsPDFUploadOpen(true);
            }}
            title="Upload PDF"
          >
            <Upload className="h-4 w-4" />
          </Button>
          {item.pdfFile && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedApplication(item);
                  setIsPDFPreviewOpen(true);
                }}
                title="Preview PDF"
              >
                <Eye className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDownloadPDF(item)}
                title="Download PDF"
              >
                <Download className="h-4 w-4" />
              </Button>
            </>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedApplication(item);
              setIsHisabKitabOpen(true);
            }}
            title="View HisabKitab"
          >
            <Calculator className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedApplication(item);
              setIsEditModalOpen(true);
            }}
          >
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDelete(item._id)}
            className="text-red-500 hover:text-red-700"
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <CreditCard className="h-6 w-6 text-gray-400" />
            <h1 className="text-xl font-semibold text-gray-900">ePassport Applications</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="rounded-md border-gray-300 shadow-sm focus:border-brand-yellow focus:ring-brand-yellow"
            >
              <option value="">All Types</option>
              {APPLICATION_TYPES.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>

            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="rounded-md border-gray-300 shadow-sm focus:border-brand-yellow focus:ring-brand-yellow"
            >
              <option value="">All Locations</option>
              {PREFECTURES.map((prefecture) => (
                <option key={prefecture} value={prefecture}>{prefecture}</option>
              ))}
            </select>

            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="search"
                placeholder="Search applications..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button onClick={() => setIsAddModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Application
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <DataTable
          columns={columns}
          data={filteredApplications}
          searchable={false}
        />
      </div>

      <AddEpassportModal
  isOpen={isAddModalOpen}
  onClose={() => setIsAddModalOpen(false)}
  getAllEPassportApplication={getAllEPassportApplication}  
/>


      {selectedApplication && (
        <>
          <EditEpassportModal
            isOpen={isEditModalOpen}
            onClose={() => {
              setIsEditModalOpen(false);
              setSelectedApplication(null);
            }}
            getAllEPassportApplication={getAllEPassportApplication}
            application={selectedApplication}
          />

          <HisabKitabModal
            isOpen={isHisabKitabOpen}
            onClose={() => {
              setIsHisabKitabOpen(false);
              setSelectedApplication(null);
            }}
            application={selectedApplication}
          />

          <PDFUploadModal
            isOpen={isPDFUploadOpen}
            onClose={() => {
              setIsPDFUploadOpen(false);
              setSelectedApplication(null);
            }}
            application={selectedApplication}
          />

          {selectedApplication.pdfFile && (
            <PDFPreviewModal
              isOpen={isPDFPreviewOpen}
              onClose={() => {
                setIsPDFPreviewOpen(false);
                setSelectedApplication(null);
              }}
              pdfUrl={selectedApplication.pdfFile.url}
              fileName={selectedApplication.pdfFile.name}
            />
          )}
        </>
      )}
    </div>
  );
}
