// import { useState, useEffect } from 'react';
// import { Search } from 'lucide-react';
// import Input from './Input';

// interface Option {
//   value: string;
//   label: string;
// }

// interface SearchableSelectProps {
//   options: Option[];
//   value: string;
//   onChange: (value: string) => void;
//   placeholder?: string;
//   className?: string;
//   error?: string;
// }

// export default function SearchableSelect({
//   options,
//   value,
//   onChange,
//   placeholder = "Search...",
//   className = "",
//   error
// }: SearchableSelectProps) {
//   const [isOpen, setIsOpen] = useState(false);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [filteredOptions, setFilteredOptions] = useState(options);

//   useEffect(() => {
//     const filtered = options.filter(option =>
//       option.label.toLowerCase().includes(searchTerm.toLowerCase())
//     );
//     setFilteredOptions(filtered);
//   }, [searchTerm, options]);

//   const selectedOption = options.find(opt => opt.value === value);

//   return (
//     <div className="relative">
//       <div
//         className={`cursor-pointer border rounded-md bg-white shadow-sm ${className}`}
//         onClick={() => setIsOpen(!isOpen)}
//       >
//         <div className="p-2 text-sm">
//           {selectedOption ? selectedOption.label : placeholder}
//         </div>
//       </div>

//       {isOpen && (
//         <div className="absolute z-50 w-full mt-1 bg-white rounded-md shadow-lg border border-gray-200">
//           <div className="p-2">
//             <div className="relative">
//               <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
//               <Input
//                 type="text"
//                 placeholder="Search..."
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 className="pl-9"
//                 onClick={(e) => e.stopPropagation()}
//               />
//             </div>
//           </div>
//           <div className="max-h-60 overflow-auto">
//             {filteredOptions.map((option) => (
//               <div
//                 key={option.value}
//                 className={`p-2 cursor-pointer hover:bg-gray-100 text-sm ${
//                   value === option.value ? 'bg-brand-yellow/10' : ''
//                 }`}
//                 onClick={() => {
//                   onChange(option.value);
//                   setIsOpen(false);
//                   setSearchTerm("");
//                 }}
//               >
//                 {option.label}
//               </div>
//             ))}
//             {filteredOptions.length === 0 && (
//               <div className="p-2 text-center text-sm text-gray-500">No results found</div>
//             )}
//           </div>
//         </div>
//       )}
//       {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
//     </div>
//   );
// }








// *********new layout style*****

import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import Input from './Input';

interface Option {
  value: string;
  label: string;
}

interface SearchableSelectProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  error?: string;
}

export default function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = "Search...",
  className = "",
  error
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredOptions, setFilteredOptions] = useState(options);

  useEffect(() => {
    const filtered = options.filter(option =>
      option.label.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredOptions(filtered);
  }, [searchTerm, options]);

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div className="relative">
      <div
        className={`h-10 flex items-center cursor-pointer border rounded-md bg-white shadow-sm focus:border-brand-yellow focus:ring-brand-yellow ${className}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="px-3 py-2 text-sm truncate">
          {selectedOption ? selectedOption.label : placeholder}
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white rounded-md shadow-lg border border-gray-200">
          <div className="p-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-10 pl-9 w-full border-gray-300 focus:border-brand-yellow focus:ring-brand-yellow"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>
          <div className="max-h-60 overflow-auto">
            {filteredOptions.map((option) => (
              <div
                key={option.value}
                className={`px-3 py-2 cursor-pointer hover:bg-gray-100 text-sm ${
                  value === option.value ? 'bg-brand-yellow/10' : ''
                }`}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                  setSearchTerm("");
                }}
              >
                {option.label}
              </div>
            ))}
            {filteredOptions.length === 0 && (
              <div className="p-2 text-center text-sm text-gray-500">No results found</div>
            )}
          </div>
        </div>
      )}
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}