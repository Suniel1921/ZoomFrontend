// import { useState, useEffect, useRef } from "react";
// import {
//   Search,
//   User,
//   FileText,
//   Calendar,
//   Languages,
//   CreditCard,
//   Palette,
//   Briefcase,
// } from "lucide-react";
// import { useNavigate } from "react-router-dom";
// import Input from "./Input";
// import axios from "axios";
// import { Flex, Spin } from "antd";
// import { LoadingOutlined } from "@ant-design/icons";

// interface GlobalSearchProps {
//   isOpen: boolean;
//   onClose: () => void;
// }

// export default function GlobalSearch({ isOpen, onClose }: GlobalSearchProps) {
//   const navigate = useNavigate();
//   const searchRef = useRef<HTMLDivElement>(null);
//   const [query, setQuery] = useState("");
//   const [results, setResults] = useState<any>({
//     clients: [],
//     applications: [],
//     japanVisit: [],
//     translations: [],
//     designs: [],
//     epassport: [],
//     otherServices: [],
//     appointments: [],
//   });
//   const [isLoading, setIsLoading] = useState(false);

//   const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;

//   useEffect(() => {
//     const handleClickOutside = (event: MouseEvent) => {
//       if (
//         searchRef.current &&
//         !searchRef.current.contains(event.target as Node)
//       ) {
//         onClose();
//       }
//     };

//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, [onClose]);

//   useEffect(() => {
//     if (query.length >= 1) {
//       setIsLoading(true);
//       const url = `${
//         import.meta.env.VITE_REACT_APP_URL
//       }/api/v1/globalSearch/globalSearch?query=${query.toLowerCase()}`; // Ensure lowercase query here
//       axios
//         .get(url)
//         .then((response) => {
//           setResults(response.data);
//         })
//         .catch((error) => {
//           console.error("Error fetching search results:", error);
//         })
//         .finally(() => {
//           setIsLoading(false);
//         });
//     } else {
//       setResults({
//         clients: [],
//         applications: [],
//         japanVisit: [],
//         translations: [],
//         designs: [],
//         epassport: [],
//         otherServices: [],
//         appointments: [],
//       });
//     }
//   }, [query]);

//   const handleSelect = (type: string, id: string) => {
//     onClose();
//     setQuery("");

//     // Adjusted switch statement to handle different types correctly
//     switch (type) {
//       case "clients":
//         navigate(`/dashboard/clients/${id}`);
//         break;
//       case "applications":
//         navigate(`/dashboard/applications/${id}`);
//         break;
//       case "japanVisit":
//         navigate(`/dashboard/japan-visit/${id}`);
//         break;
//       case "translations":
//         navigate(`/dashboard/translations/${id}`);
//         break;
//       case "designs":
//         navigate(`/dashboard/graphic-design/${id}`);
//         break;
//       case "epassport":
//         navigate(`/dashboard/epassport/${id}`);
//         break;
//       case "otherServices":
//         navigate(`/dashboard/other-services/${id}`);
//         break;
//       case "appointments":
//         navigate(`/dashboard/appointment/${id}`);
//         break;
//       default:
//         break;
//     }
//   };

//   if (!isOpen) return null;

//   const hasResults = Object.values(results).some((arr) => arr.length > 0);

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
//       <div
//         ref={searchRef}
//         className="absolute top-16 left-1/2 -translate-x-1/2 w-full max-w-2xl bg-white shadow-lg rounded-lg"
//       >
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

//           {isLoading ? (
//             <Flex justify="center" align="center" style={{ marginTop: '34px' }}>
//               <Spin indicator={antIcon} style={{ color: "black" }} />
//             </Flex>
//           ) : query.length >= 1 ? (
//             <div className="mt-4 max-h-[calc(100vh-12rem)] overflow-y-auto border-t border-gray-100">
//               <div className="space-y-4 py-2">
//                 {Object.entries(results).map(
//                   ([key, items]) =>
//                     items.length > 0 && (
//                       <div key={key}>
//                         <div className="px-4 py-2 bg-gray-50 text-xs font-medium text-gray-500 uppercase">
//                           {key.replace(/([A-Z])/g, " $1").trim()}
//                         </div>
//                         {items.map((item: any) => (
//                           <button
//                             key={item.id}
//                             onClick={() => handleSelect(key, item.id)}
//                             className="w-full px-4 py-2 flex items-center gap-3 hover:bg-gray-50"
//                           >
//                             {getIcon(key)}
//                             <div className="text-left">
//                               <p className="font-medium">
//                                 {item.clientName || item.name}
//                               </p>
//                               <p className="text-sm text-gray-500">
//                                 {item.details || item.type || ""}
//                               </p>
//                             </div>
//                           </button>
//                         ))}
//                       </div>
//                     )
//                 )}
//                 {!hasResults && (
//                   <div className="px-4 py-6 text-center text-gray-500">
//                     No results found
//                   </div>
//                 )}
//               </div>
//             </div>
//           ) : null}
//         </div>
//       </div>
//     </div>
//   );
// }

// function getIcon(type: string) {
//   switch (type) {
//     case "clients":
//       return <User className="h-4 w-4 text-gray-400" />;
//     case "applications":
//     case "japanVisit":
//       return <FileText className="h-4 w-4 text-gray-400" />;
//     case "translations":
//       return <Languages className="h-4 w-4 text-gray-400" />;
//     case "designs":
//       return <Palette className="h-4 w-4 text-gray-400" />;
//     case "epassport":
//       return <CreditCard className="h-4 w-4 text-gray-400" />;
//     case "otherServices":
//       return <Briefcase className="h-4 w-4 text-gray-400" />;
//     case "appointments":
//       return <Calendar className="h-4 w-4 text-gray-400" />;
//     default:
//       return null;
//   }
// }








import { useState, useEffect, useRef, useCallback } from "react";
import {
  Search,
  User,
  FileText,
  Calendar,
  Languages,
  CreditCard,
  Palette,
  Briefcase,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Input from "./Input";
import axios from "axios";
import { Flex, Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";

interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function GlobalSearch({ isOpen, onClose }: GlobalSearchProps) {
  const navigate = useNavigate();
  const searchRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any>({
    clients: [],
    applications: [],
    japanVisit: [],
    translations: [],
    designs: [],
    epassport: [],
    otherServices: [],
    appointments: [],
  });
  const [isLoading, setIsLoading] = useState(false);

  const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const debounce = (func: Function, delay: number) => {
    let timeoutId: NodeJS.Timeout;
    return (...args: any[]) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  };

  const fetchResults = useCallback(debounce(async (query: string) => {
    if (query.length >= 1) {
      setIsLoading(true);
      const url = `${import.meta.env.VITE_REACT_APP_URL}/api/v1/globalSearch/globalSearch?query=${query.toLowerCase()}`;
      try {
        const response = await axios.get(url);
        setResults(response.data);
      } catch (error) {
        console.error("Error fetching search results:", error);
      } finally {
        setIsLoading(false);
      }
    } else {
      setResults({
        clients: [],
        applications: [],
        japanVisit: [],
        translations: [],
        designs: [],
        epassport: [],
        otherServices: [],
        appointments: [],
      });
    }
  }, 300), []);

  useEffect(() => {
    fetchResults(query);
  }, [query, fetchResults]);

  const handleSelect = (type: string, id: string) => {
    onClose();
    setQuery("");

    switch (type) {
      case "clients":
        navigate(`/dashboard/clients/${id}`);
        break;
      case "applications":
        navigate(`/dashboard/applications/${id}`);
        break;
      case "japanVisit":
        navigate(`/dashboard/japan-visit/${id}`);
        break;
      case "translations":
        navigate(`/dashboard/translations/${id}`);
        break;
      case "designs":
        navigate(`/dashboard/graphic-design/${id}`);
        break;
      case "epassport":
        navigate(`/dashboard/epassport/${id}`);
        break;
      case "otherServices":
        navigate(`/dashboard/other-services/${id}`);
        break;
      case "appointments":
        navigate(`/dashboard/appointment/${id}`);
        break;
      default:
        break;
    }
  };

  if (!isOpen) return null;

  const hasResults = Object.values(results).some((arr) => arr.length > 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
      <div
        ref={searchRef}
        className="absolute top-16 left-1/2 -translate-x-1/2 w-full max-w-2xl bg-white shadow-lg rounded-lg"
      >
        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="search"
              placeholder="Search..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10 pr-4 py-2 text-lg w-full"
              autoFocus
            />
          </div>

          {isLoading ? (
            <Flex justify="center" align="center" style={{ marginTop: '34px' }}>
              <Spin indicator={antIcon} style={{ color: "black" }} />
            </Flex>
          ) : query.length >= 1 ? (
            <div className="mt-4 max-h-[calc(100vh-12rem)] overflow-y-auto border-t border-gray-100">
              <div className="space-y-4 py-2">
                {Object.entries(results).map(
                  ([key, items]) =>
                    items.length > 0 && (
                      <div key={key}>
                        <div className="px-4 py-2 bg-gray-50 text-xs font-medium text-gray-500 uppercase">
                          {key.replace(/([A-Z])/g, " $1").trim()}
                        </div>
                        {items.map((item: any) => (
                          <button
                            key={item.id}
                            onClick={() => handleSelect(key, item.id)}
                            className="w-full px-4 py-2 flex items-center gap-3 hover:bg-gray-50"
                          >
                            {getIcon(key)}
                            <div className="text-left">
                              <p className="font-medium">
                                {item.clientName || item.name}
                              </p>
                              <p className="text-sm text-gray-500">
                                {item.details || item.type || ""}
                              </p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )
                )}
                {!hasResults && (
                  <div className="px-4 py-6 text-center text-gray-500">
                    No results found
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function getIcon(type: string) {
  switch (type) {
    case "clients":
      return <User className="h-4 w-4 text-gray-400" />;
    case "applications":
    case "japanVisit":
      return <FileText className="h-4 w-4 text-gray-400" />;
    case "translations":
      return <Languages className="h-4 w-4 text-gray-400" />;
    case "designs":
      return <Palette className="h-4 w-4 text-gray-400" />;
    case "epassport":
      return <CreditCard className="h-4 w-4 text-gray-400" />;
    case "otherServices":
      return <Briefcase className="h-4 w-4 text-gray-400" />;
    case "appointments":
      return <Calendar className="h-4 w-4 text-gray-400" />;
    default:
      return null;
  }
}