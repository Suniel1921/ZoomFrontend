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
        className={`cursor-pointer border rounded-md bg-white shadow-sm ${className}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="p-2 text-sm">
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
                className="pl-9"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>
          <div className="max-h-60 overflow-auto">
            {filteredOptions.map((option) => (
              <div
                key={option.value}
                className={`p-2 cursor-pointer hover:bg-gray-100 text-sm ${
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











// *********new layout style (while searching client showing client image) (problem is while search client dropdown hide in account and task but not other componnet like epasspwort client))*****


// import { useState, useEffect } from 'react';
// import { Search, User } from 'lucide-react';
// import Input from './Input';

// interface Option {
//   value: string;
//   label: string;
//   clientData?: {
//     profilePhoto?: string;
//   };
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
//   const [searchTerm, setSearchTerm] = useState("");
//   const [filteredOptions, setFilteredOptions] = useState<Option[]>([]);
//   const [showDropdown, setShowDropdown] = useState(false); // Control dropdown visibility

//   useEffect(() => {
//     if (searchTerm.trim() === "") {
//       setFilteredOptions([]);
//       setShowDropdown(false); // Hide dropdown when search term is empty
//       return;
//     }

//     const filtered = options.filter(option =>
//       option.label.toLowerCase().includes(searchTerm.toLowerCase())
//     );
//     setFilteredOptions(filtered);
//     setShowDropdown(true); // Show dropdown when there is a search term
//   }, [searchTerm, options]);

//   return (
//     <div className="relative w-full space-y-2">
//       <div className="relative">
//         <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
//         <Input
//           type="text"
//           placeholder={placeholder}
//           value={searchTerm}
//           onChange={(e) => setSearchTerm(e.target.value)}
//           className={`pl-9 ${className}`}
//         />
//       </div>

//       {/* Show dropdown only when there is a search term */}
//       {showDropdown && searchTerm.trim() !== "" && (
//         <div className="absolute w-full bg-background border rounded-lg shadow-sm z-10">
//           <div className="max-h-60 overflow-auto py-1">
//             {filteredOptions.map((option) => (
//               <div
//                 key={option.value}
//                 className={`flex items-center px-3 py-2 cursor-pointer hover:bg-accent ${value === option.value ? 'bg-accent' : ''}`}
//                 onClick={() => {
//                   onChange(option.value); // Set the selected value
//                   setSearchTerm(option.label); // Set the selected name in the input
//                   setShowDropdown(false); // Hide the dropdown after selection
//                 }}
//               >
//                 <div className="h-8 w-8 mr-3 rounded-full bg-muted flex items-center justify-center overflow-hidden">
//                   {option.clientData?.profilePhoto ? (
//                     <img 
//                       src={option.clientData.profilePhoto} 
//                       alt={option.label}
//                       className="h-full w-full object-cover"
//                     />
//                   ) : (
//                     <User className="h-5 w-5 text-muted-foreground" />
//                   )}
//                 </div>
//                 <span className="text-sm">{option.label}</span>
//               </div>
//             ))}
//             {filteredOptions.length === 0 && (
//               <div className="px-3 py-2 text-center text-sm text-muted-foreground">
//                 No results found
//               </div>
//             )}
//           </div>
//         </div>
//       )}

//       {error && <p className="mt-1 text-sm text-destructive">{error}</p>}
//     </div>
//   );
// }
