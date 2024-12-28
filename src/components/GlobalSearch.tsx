// import { useState, useEffect, useRef } from 'react';
// import { Search, User, FileText, Calendar, Languages, CreditCard, Palette, Briefcase } from 'lucide-react';
// import { useNavigate } from 'react-router-dom';
// import { useStore } from '../store';
// import Input from './Input';

// interface GlobalSearchProps {
//   isOpen: boolean;
//   onClose: () => void;
// }

// export default function GlobalSearch({ isOpen, onClose }: GlobalSearchProps) {
//   const navigate = useNavigate();
//   const searchRef = useRef<HTMLDivElement>(null);
//   const [query, setQuery] = useState('');
//   const { 
//     clients, 
//     applications,
//     japanVisitApplications,
//     translations,
//     graphicDesignJobs,
//     epassportApplications,
//     otherServices,
//     appointments 
//   } = useStore();

//   useEffect(() => {
//     const handleClickOutside = (event: MouseEvent) => {
//       if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
//         onClose();
//       }
//     };

//     document.addEventListener('mousedown', handleClickOutside);
//     return () => document.removeEventListener('mousedown', handleClickOutside);
//   }, [onClose]);

//   // Filter results based on query
//   const results = {
//     clients: clients.filter(client => 
//       query && (
//         client.name.toLowerCase().includes(query.toLowerCase()) ||
//         client.email.toLowerCase().includes(query.toLowerCase()) ||
//         client.phone.toLowerCase().includes(query.toLowerCase())
//       )
//     ),
//     applications: applications.filter(app => 
//       query && (
//         app.clientName.toLowerCase().includes(query.toLowerCase()) ||
//         app.type.toLowerCase().includes(query.toLowerCase()) ||
//         app.country.toLowerCase().includes(query.toLowerCase())
//       )
//     ),
//     japanVisit: japanVisitApplications.filter(app => 
//       query && (
//         app.clientName.toLowerCase().includes(query.toLowerCase()) ||
//         app.mobileNo.toLowerCase().includes(query.toLowerCase())
//       )
//     ),
//     translations: translations.filter(trans => 
//       query && (
//         trans.clientName.toLowerCase().includes(query.toLowerCase())
//       )
//     ),
//     designs: graphicDesignJobs.filter(job => 
//       query && (
//         job.clientName.toLowerCase().includes(query.toLowerCase()) ||
//         job.mobileNo.toLowerCase().includes(query.toLowerCase()) ||
//         job.designType.toLowerCase().includes(query.toLowerCase())
//       )
//     ),
//     epassport: epassportApplications.filter(app => 
//       query && (
//         app.clientName.toLowerCase().includes(query.toLowerCase()) ||
//         app.mobileNo.toLowerCase().includes(query.toLowerCase())
//       )
//     ),
//     otherServices: otherServices.filter(service => 
//       query && (
//         service.clientName.toLowerCase().includes(query.toLowerCase()) ||
//         service.mobileNo.toLowerCase().includes(query.toLowerCase()) ||
//         service.serviceTypes.some(type => type.toLowerCase().includes(query.toLowerCase()))
//       )
//     ),
//     appointments: appointments.filter(apt => 
//       query && (
//         apt.clientName.toLowerCase().includes(query.toLowerCase()) ||
//         apt.type.toLowerCase().includes(query.toLowerCase())
//       )
//     )
//   };

//   const hasResults = Object.values(results).some(arr => arr.length > 0);

//   const handleSelect = (type: string, id: string) => {
//     onClose();
//     setQuery('');
    
//     switch(type) {
//       case 'client':
//         navigate(`/dashboard/clients/${id}`);
//         break;
//       case 'application':
//         navigate(`/dashboard/applications/${id}`);
//         break;
//       case 'japan-visit':
//         navigate(`/dashboard/japan-visit/${id}`);
//         break;
//       case 'translation':
//         navigate(`/dashboard/translations/${id}`);
//         break;
//       case 'design':
//         navigate(`/dashboard/graphic-design/${id}`);
//         break;
//       case 'epassport':
//         navigate(`/dashboard/epassport/${id}`);
//         break;
//       case 'other-service':
//         navigate(`/dashboard/other-services/${id}`);
//         break;
//       case 'appointment':
//         navigate(`/dashboard/appointment/${id}`);
//         break;
//     }
//   };

//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
//       <div ref={searchRef} className="absolute top-16 left-1/2 -translate-x-1/2 w-full max-w-2xl bg-white shadow-lg rounded-lg">
//         <div className="p-4">
//           <div className="relative">
//             <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
//             <Input
//               type="search"
//               placeholder="Search..."
//               value={query}
//               onChange={(e) => setQuery(e.target.value)}
//               className="pl-10 pr-4 py-2 text-lg w-full"
//               autoFocus
//             />
//           </div>

//           {query.length >= 2 && (
//             <div className="mt-4 max-h-[calc(100vh-12rem)] overflow-y-auto border-t border-gray-100">
//               <div className="space-y-4 py-2">
//                 {results.clients.length > 0 && (
//                   <div>
//                     <div className="px-4 py-2 bg-gray-50 text-xs font-medium text-gray-500 uppercase">
//                       Clients
//                     </div>
//                     {results.clients.map((client) => (
//                       <button
//                         key={client.id}
//                         onClick={() => handleSelect('client', client.id)}
//                         className="w-full px-4 py-2 flex items-center gap-3 hover:bg-gray-50"
//                       >
//                         <User className="h-4 w-4 text-gray-400" />
//                         <div className="text-left">
//                           <p className="font-medium">{client.name}</p>
//                           <p className="text-sm text-gray-500">{client.phone}</p>
//                         </div>
//                       </button>
//                     ))}
//                   </div>
//                 )}

//                 {results.applications.length > 0 && (
//                   <div>
//                     <div className="px-4 py-2 bg-gray-50 text-xs font-medium text-gray-500 uppercase">
//                       Visa Applications
//                     </div>
//                     {results.applications.map((app) => (
//                       <button
//                         key={app.id}
//                         onClick={() => handleSelect('application', app.id)}
//                         className="w-full px-4 py-2 flex items-center gap-3 hover:bg-gray-50"
//                       >
//                         <FileText className="h-4 w-4 text-gray-400" />
//                         <div className="text-left">
//                           <p className="font-medium">{app.clientName}</p>
//                           <p className="text-sm text-gray-500">
//                             {app.type} • {app.country}
//                           </p>
//                         </div>
//                       </button>
//                     ))}
//                   </div>
//                 )}

//                 {results.japanVisit.length > 0 && (
//                   <div>
//                     <div className="px-4 py-2 bg-gray-50 text-xs font-medium text-gray-500 uppercase">
//                       Japan Visit
//                     </div>
//                     {results.japanVisit.map((app) => (
//                       <button
//                         key={app.id}
//                         onClick={() => handleSelect('japan-visit', app.id)}
//                         className="w-full px-4 py-2 flex items-center gap-3 hover:bg-gray-50"
//                       >
//                         <FileText className="h-4 w-4 text-gray-400" />
//                         <div className="text-left">
//                           <p className="font-medium">{app.clientName}</p>
//                           <p className="text-sm text-gray-500">{app.mobileNo}</p>
//                         </div>
//                       </button>
//                     ))}
//                   </div>
//                 )}

//                 {results.translations.length > 0 && (
//                   <div>
//                     <div className="px-4 py-2 bg-gray-50 text-xs font-medium text-gray-500 uppercase">
//                       Translations
//                     </div>
//                     {results.translations.map((trans) => (
//                       <button
//                         key={trans.id}
//                         onClick={() => handleSelect('translation', trans.id)}
//                         className="w-full px-4 py-2 flex items-center gap-3 hover:bg-gray-50"
//                       >
//                         <Languages className="h-4 w-4 text-gray-400" />
//                         <div className="text-left">
//                           <p className="font-medium">{trans.clientName}</p>
//                           <p className="text-sm text-gray-500">
//                             {trans.sourceLanguage} → {trans.targetLanguage}
//                           </p>
//                         </div>
//                       </button>
//                     ))}
//                   </div>
//                 )}

//                 {results.designs.length > 0 && (
//                   <div>
//                     <div className="px-4 py-2 bg-gray-50 text-xs font-medium text-gray-500 uppercase">
//                       Design Jobs
//                     </div>
//                     {results.designs.map((job) => (
//                       <button
//                         key={job.id}
//                         onClick={() => handleSelect('design', job.id)}
//                         className="w-full px-4 py-2 flex items-center gap-3 hover:bg-gray-50"
//                       >
//                         <Palette className="h-4 w-4 text-gray-400" />
//                         <div className="text-left">
//                           <p className="font-medium">{job.clientName}</p>
//                           <p className="text-sm text-gray-500">{job.designType}</p>
//                         </div>
//                       </button>
//                     ))}
//                   </div>
//                 )}

//                 {results.epassport.length > 0 && (
//                   <div>
//                     <div className="px-4 py-2 bg-gray-50 text-xs font-medium text-gray-500 uppercase">
//                       ePassport
//                     </div>
//                     {results.epassport.map((app) => (
//                       <button
//                         key={app.id}
//                         onClick={() => handleSelect('epassport', app.id)}
//                         className="w-full px-4 py-2 flex items-center gap-3 hover:bg-gray-50"
//                       >
//                         <CreditCard className="h-4 w-4 text-gray-400" />
//                         <div className="text-left">
//                           <p className="font-medium">{app.clientName}</p>
//                           <p className="text-sm text-gray-500">{app.mobileNo}</p>
//                         </div>
//                       </button>
//                     ))}
//                   </div>
//                 )}

//                 {results.otherServices.length > 0 && (
//                   <div>
//                     <div className="px-4 py-2 bg-gray-50 text-xs font-medium text-gray-500 uppercase">
//                       Other Services
//                     </div>
//                     {results.otherServices.map((service) => (
//                       <button
//                         key={service.id}
//                         onClick={() => handleSelect('other-service', service.id)}
//                         className="w-full px-4 py-2 flex items-center gap-3 hover:bg-gray-50"
//                       >
//                         <Briefcase className="h-4 w-4 text-gray-400" />
//                         <div className="text-left">
//                           <p className="font-medium">{service.clientName}</p>
//                           <p className="text-sm text-gray-500">
//                             {service.serviceTypes.join(', ')}
//                           </p>
//                         </div>
//                       </button>
//                     ))}
//                   </div>
//                 )}

//                 {results.appointments.length > 0 && (
//                   <div>
//                     <div className="px-4 py-2 bg-gray-50 text-xs font-medium text-gray-500 uppercase">
//                       Appointments
//                     </div>
//                     {results.appointments.map((apt) => (
//                       <button
//                         key={apt.id}
//                         onClick={() => handleSelect('appointment', apt.id)}
//                         className="w-full px-4 py-2 flex items-center gap-3 hover:bg-gray-50"
//                       >
//                         <Calendar className="h-4 w-4 text-gray-400" />
//                         <div className="text-left">
//                           <p className="font-medium">{apt.clientName}</p>
//                           <p className="text-sm text-gray-500">{apt.type}</p>
//                         </div>
//                       </button>
//                     ))}
//                   </div>
//                 )}

//                 {!hasResults && query.length >= 2 && (
//                   <div className="px-4 py-6 text-center text-gray-500">
//                     No results found
//                   </div>
//                 )}
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }














import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Input from './Input';

interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function GlobalSearch({ isOpen, onClose }: GlobalSearchProps) {
  const navigate = useNavigate();
  const searchRef = useRef<HTMLDivElement>(null);

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Close search when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  // Fetch search results on query change
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const fetchResults = async () => {
      setLoading(true);
      setError(null);

      try {
        const url = `${import.meta.env.VITE_REACT_APP_URL}/api/v1/appointment/globalSearch?query=${query}`;
        console.log('API Request URL:', url); // Log the request URL for debugging

        const response = await axios.get(url);

        console.log('API Response:', response.data); // Log the response data

        // Combine results from all models
        const allResults = [
          ...response.data.clients || [],
          ...response.data.applications || [],
          ...response.data.documentTranslations || [],
          ...response.data.ePassports || [],
          ...response.data.graphicDesigns || [],
          ...response.data.japanVisits || [],
          ...response.data.otherServices || [],
        ];

        if (allResults.length > 0) {
          setResults(allResults);
        } else {
          setResults([]); // No results found
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to fetch search results. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    const debounceTimeout = setTimeout(fetchResults, 300); // Debounce API calls
    return () => clearTimeout(debounceTimeout);
  }, [query]);

  const handleResultClick = (result: any) => {
    navigate(`/details/${result._id}`);
    onClose();
  };

  const renderResult = (result: any) => {
    if (result.name) {
      return result.name; // Display the name if it exists in the client object
    }

    if (result.category) {
      return result.category; // Display the category if it's an application or other model
    }

    return 'Unknown'; // Fallback for unknown results
  };

  return (
    isOpen && (
      <div
        ref={searchRef}
        className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center"
      >
        <div className="bg-white rounded-lg shadow-lg w-3/4 md:w-1/2 p-6">
          <div className="flex items-center mb-4">
            <Search className="mr-2 text-gray-500" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search..."
              className="w-full"
            />
          </div>
          {loading && <p>Loading...</p>}
          {error && <p className="text-red-500">{error}</p>}
          {!loading && results.length === 0 && query && (
            <p>No results found for "{query}"</p>
          )}
          <ul>
            {results.map((result) => (
              <li
                key={result._id}
                onClick={() => handleResultClick(result)}
                className="cursor-pointer py-2 px-4 hover:bg-gray-100"
              >
                {renderResult(result)} {/* Dynamically render the result based on the model */}
              </li>
            ))}
          </ul>
          <button
            onClick={onClose}
            className="mt-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Close
          </button>
        </div>
      </div>
    )
  );
}
