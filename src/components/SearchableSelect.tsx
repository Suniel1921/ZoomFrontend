// import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
// import { Search, User } from "lucide-react";
// import { FixedSizeList as List } from "react-window";
// import Input from "./Input";
// import { useDebounce } from "../hooks/useDebounce";
// import type { Option, SearchableSelectProps } from "./types";
// import { ErrorBoundary } from "react-error-boundary";

// // Constants
// const ITEM_HEIGHT = 50; // Adjust if needed for phone number
// const MAX_ITEMS_WITHOUT_VIRTUALIZATION = 50;
// const DROPDOWN_HEIGHT = 300;

// // Types
// interface OptionItemProps {
//   option: Option;
//   searchTerm: string;
//   onSelect: (option: Option) => void;
//   isSelected: boolean;
//   isHighlighted: boolean;
// }

// // Components
// const OptionItem: React.FC<OptionItemProps> = ({
//   option,
//   searchTerm,
//   onSelect,
//   isSelected,
//   isHighlighted,
// }) => {
//   const highlightMatch = (text: string, term: string) => {
//     if (!term.trim()) return text;
//     const regex = new RegExp(`(${term})`, "gi");
//     return text.split(regex).map((part, index) =>
//       regex.test(part) ? (
//         <mark
//           key={index}
//           className="bg-yellow-200 text-gray-900 font-semibold px-0.5 rounded"
//         >
//           {part}
//         </mark>
//       ) : (
//         part
//       )
//     );
//   };

//   return (
//     <div
//       className={`flex items-center px-3 py-2 cursor-pointer transition-colors duration-150 ${
//         isSelected
//           ? "bg-accent text-accent-foreground"
//           : isHighlighted
//           ? "bg-gray-100"
//           : "hover:bg-gray-50"
//       }`}
//       onClick={() => onSelect(option)}
//     >
//       <div className="h-8 w-8 mr-3 rounded-full bg-muted flex items-center justify-center overflow-hidden">
//         {option.clientData?.profilePhoto ? (
//           <img
//             src={option.clientData.profilePhoto || "/placeholder.svg"}
//             alt={option.label}
//             className="h-full w-full object-cover"
//             onError={(e) => (e.currentTarget.src = "/placeholder.svg")}
//           />
//         ) : (
//           <User className="h-5 w-5 text-muted-foreground" />
//         )}
//       </div>
//       <div className="flex-1">
//         <span className="text-sm font-medium block">
//           {highlightMatch(option.label, searchTerm)}
//         </span>
//         {option.clientData?.phone && (
//           <span className="text-xs text-gray-500 block mt-0.5">
//             {option.clientData.phone}
//           </span>
//         )}
//       </div>
//     </div>
//   );
// };

// const NoResults: React.FC = () => (
//   <div className="px-3 py-2 text-center text-sm text-muted-foreground">
//     No results found
//   </div>
// );

// const Loading: React.FC = () => (
//   <div className="flex items-center justify-center px-3 py-2">
//     <svg
//       className="animate-spin h-5 w-5 text-[#FEDC00]"
//       xmlns="http://www.w3.org/2000/svg"
//       fill="none"
//       viewBox="0 0 24 24"
//     >
//       <circle
//         className="opacity-25"
//         cx="12"
//         cy="12"
//         r="10"
//         stroke="currentColor"
//         strokeWidth="4"
//       />
//       <path
//         className="opacity-75"
//         fill="currentColor"
//         d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
//       />
//     </svg>
//   </div>
// );

// export default function SearchableSelect({
//   options,
//   value,
//   onChange,
//   placeholder = "Search by name...",
//   className = "",
//   error,
// }: SearchableSelectProps) {
//   const [searchTerm, setSearchTerm] = useState("");
//   const [showDropdown, setShowDropdown] = useState(false);
//   const [highlightedIndex, setHighlightedIndex] = useState(-1);
//   const [isSearching, setIsSearching] = useState(false); // New loading state
//   const debouncedSearchTerm = useDebounce(searchTerm, 300);
//   const wrapperRef = useRef<HTMLDivElement>(null);
//   const listRef = useRef<any>(null);

//   // Memoized selected option
//   const selectedOption = useMemo(
//     () => options.find((opt) => opt.value === value),
//     [options, value]
//   );

//   // Sync search term with selected value and manage spinner
//   useEffect(() => {
//     if (!showDropdown && selectedOption) {
//       setSearchTerm(selectedOption.label);
//       setIsSearching(false); // Reset spinner when dropdown closes
//     } else if (searchTerm.trim() && showDropdown) {
//       setIsSearching(true); // Show spinner while searching
//     }
//   }, [selectedOption, showDropdown, searchTerm]);

//   // Reset spinner when search results are ready
//   useEffect(() => {
//     if (debouncedSearchTerm.trim()) {
//       // Simulate search completion (you could add async logic here if fetching data)
//       setIsSearching(false);
//     }
//   }, [debouncedSearchTerm]);

//   // Close dropdown on outside click
//   useEffect(() => {
//     const handleClickOutside = (event: MouseEvent) => {
//       if (
//         wrapperRef.current &&
//         !wrapperRef.current.contains(event.target as Node)
//       ) {
//         setShowDropdown(false);
//         setHighlightedIndex(-1);
//         setIsSearching(false);
//       }
//     };
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, []);

//   // Memoized filtered and sorted options
//   const filteredAndSortedOptions = useMemo(() => {
//     if (!debouncedSearchTerm.trim()) return [];

//     const searchTermLower = debouncedSearchTerm.toLowerCase();
//     return options
//       .map((option) => {
//         const nameLower = option.label.toLowerCase();
//         const nameMatch = nameLower.includes(searchTermLower);
//         let score = 0;
//         if (nameLower === searchTermLower) score = 100;
//         else if (nameLower.startsWith(searchTermLower)) score = 50;
//         else if (nameMatch) score = 25;

//         return { ...option, score, nameMatch };
//       })
//       .filter((option) => option.nameMatch)
//       .sort((a, b) => b.score - a.score || a.label.localeCompare(b.label));
//   }, [debouncedSearchTerm, options]);

//   // Handlers
//   const handleOptionSelect = useCallback(
//     (option: Option) => {
//       onChange(option.value);
//       setSearchTerm(option.label);
//       setShowDropdown(false);
//       setHighlightedIndex(-1);
//       setIsSearching(false);
//     },
//     [onChange]
//   );

//   const handleKeyDown = useCallback(
//     (e: React.KeyboardEvent) => {
//       if (!showDropdown) return;

//       switch (e.key) {
//         case "ArrowDown":
//           e.preventDefault();
//           setHighlightedIndex((prev) =>
//             Math.min(prev + 1, filteredAndSortedOptions.length - 1)
//           );
//           break;
//         case "ArrowUp":
//           e.preventDefault();
//           setHighlightedIndex((prev) => Math.max(prev - 1, -1));
//           break;
//         case "Enter":
//           e.preventDefault();
//           if (
//             highlightedIndex >= 0 &&
//             filteredAndSortedOptions[highlightedIndex]
//           ) {
//             handleOptionSelect(filteredAndSortedOptions[highlightedIndex]);
//           }
//           break;
//         case "Escape":
//           setShowDropdown(false);
//           setHighlightedIndex(-1);
//           setIsSearching(false);
//           break;
//       }

//       if (listRef.current && highlightedIndex >= 0) {
//         listRef.current.scrollToItem(highlightedIndex, "smart");
//       }
//     },
//     [showDropdown, highlightedIndex, filteredAndSortedOptions, handleOptionSelect]
//   );

//   // Render options list
//   const renderOptionsList = useCallback(() => {
//     if (filteredAndSortedOptions.length === 0 && debouncedSearchTerm.trim()) {
//       return <NoResults />;
//     }

//     if (isSearching) {
//       return <Loading />;
//     }

//     if (filteredAndSortedOptions.length <= MAX_ITEMS_WITHOUT_VIRTUALIZATION) {
//       return filteredAndSortedOptions.map((option, index) => (
//         <OptionItem
//           key={option.value}
//           option={option}
//           searchTerm={debouncedSearchTerm}
//           onSelect={handleOptionSelect}
//           isSelected={value === option.value}
//           isHighlighted={index === highlightedIndex}
//         />
//       ));
//     }

//     return (
//       <List
//         height={DROPDOWN_HEIGHT}
//         itemCount={filteredAndSortedOptions.length}
//         itemSize={ITEM_HEIGHT}
//         width="100%"
//         ref={listRef}
//       >
//         {({ index, style }) => (
//           <div style={style}>
//             <OptionItem
//               option={filteredAndSortedOptions[index]}
//               searchTerm={debouncedSearchTerm}
//               onSelect={handleOptionSelect}
//               isSelected={value === filteredAndSortedOptions[index].value}
//               isHighlighted={index === highlightedIndex}
//             />
//           </div>
//         )}
//       </List>
//     );
//   }, [
//     filteredAndSortedOptions,
//     debouncedSearchTerm,
//     handleOptionSelect,
//     value,
//     highlightedIndex,
//     isSearching,
//   ]);

//   return (
//     <div
//       ref={wrapperRef}
//       className={`relative w-full space-y-2 searchable-select ${className}`}
//     >
//       <div className="relative">
//         <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
//         <Input
//           type="text"
//           placeholder={placeholder}
//           value={searchTerm}
//           onChange={(e) => {
//             setSearchTerm(e.target.value);
//             setShowDropdown(true);
//             setIsSearching(true); // Show spinner on input change
//           }}
//           onFocus={() => setShowDropdown(true)}
//           onKeyDown={handleKeyDown}
//           className={`pl-9 ${error ? "border-destructive" : ""}`} // Removed pr-10 for spinner space
//         />
//       </div>

//       {showDropdown && (
//         <div className="absolute w-full bg-background border rounded-lg shadow-sm z-10 overflow-hidden">
//           <ErrorBoundary
//             fallback={
//               <div className="px-3 py-2 text-sm text-red-500">
//                 An error occurred. Please try again.
//               </div>
//             }
//           >
//             <div className="max-h-[300px] overflow-auto py-1">
//               {renderOptionsList()}
//             </div>
//           </ErrorBoundary>
//         </div>
//       )}

//       {error && <p className="text-sm text-destructive">{error}</p>}
//     </div>
//   );
// }





// ****************above code are working fine (below code work is search using client Id)************************


import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { Search, User } from "lucide-react";
import { FixedSizeList as List } from "react-window";
import Input from "./Input";
import { useDebounce } from "../hooks/useDebounce";
import type { Option, SearchableSelectProps } from "./types";
import { ErrorBoundary } from "react-error-boundary";

// Constants
const ITEM_HEIGHT = 50;
const MAX_ITEMS_WITHOUT_VIRTUALIZATION = 50;
const DROPDOWN_HEIGHT = 300;

// Types
interface OptionItemProps {
  option: Option;
  searchTerm: string;
  onSelect: (option: Option) => void;
  isSelected: boolean;
  isHighlighted: boolean;
}

interface ExtendedOption extends Option {
  clientData?: {
    _id?: string;
    profilePhoto?: string;
    phone?: string;
  };
}

const OptionItem: React.FC<OptionItemProps> = ({
  option,
  searchTerm,
  onSelect,
  isSelected,
  isHighlighted,
}) => {
  const highlightMatch = (text: string, term: string) => {
    if (!term.trim()) return text;
    const regex = new RegExp(`(${term})`, "gi");
    return text.split(regex).map((part, index) =>
      regex.test(part) ? (
        <mark
          key={index}
          className="bg-yellow-200 text-gray-900 font-semibold px-0.5 rounded"
        >
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  const extendedOption = option as ExtendedOption;
  const optionId = extendedOption.clientData?._id || "";
  const lastFourDigits = optionId ? optionId.slice(-4) : "N/A";

  return (
    <div
      className={`flex items-center px-3 py-2 cursor-pointer transition-colors duration-150 ${
        isSelected
          ? "bg-accent text-accent-foreground"
          : isHighlighted
          ? "bg-gray-100"
          : "hover:bg-gray-50"
      }`}
      onClick={() => onSelect(option)}
    >
      <div className="h-8 w-8 mr-3 rounded-full bg-muted flex items-center justify-center overflow-hidden">
        {extendedOption.clientData?.profilePhoto ? (
          <img
            src={extendedOption.clientData.profilePhoto || "/placeholder.svg"}
            alt={option.label}
            className="h-full w-full object-cover"
            onError={(e) => (e.currentTarget.src = "/placeholder.svg")}
          />
        ) : (
          <User className="h-5 w-5 text-muted-foreground" />
        )}
      </div>
      <div className="flex-1">
        <span className="text-sm font-medium block">
          {highlightMatch(option.label, searchTerm)}
        </span>
        <div className="flex gap-2">
          {optionId && (
            <span className="text-xs text-gray-500 block mt-0.5">
              ID: {highlightMatch(lastFourDigits, searchTerm)}
            </span>
          )}
          {extendedOption.clientData?.phone && (
            <span className="text-xs text-gray-500 block mt-0.5">
              {extendedOption.clientData.phone}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

const NoResults: React.FC<{ message?: string }> = ({ message = "Sorry, client not found" }) => (
  <div className="px-3 py-2 text-center text-sm text-muted-foreground">
    {message}
  </div>
);

const Loading: React.FC = () => (
  <div className="flex items-center justify-center px-3 py-2">
    <svg
      className="animate-spin h-5 w-5 text-[#FEDC00]"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  </div>
);

export default function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = "Search by name or ID (last 4 digits)...",
  className = "",
  error,
}: SearchableSelectProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [isSearching, setIsSearching] = useState(false);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<any>(null);

  useEffect(() => {
    console.log("Options received:", options);
  }, [options]);

  const selectedOption = useMemo(
    () => options.find((opt) => opt.value === value),
    [options, value]
  );

  useEffect(() => {
    if (!showDropdown && selectedOption) {
      setSearchTerm(selectedOption.label);
      setIsSearching(false);
    } else if (searchTerm.trim() && showDropdown) {
      setIsSearching(true);
    }
  }, [selectedOption, showDropdown, searchTerm]);

  useEffect(() => {
    if (debouncedSearchTerm.trim()) {
      setIsSearching(false);
      console.log("Debounced search term:", debouncedSearchTerm);
      console.log("Filtered options:", filteredAndSortedOptions);
    }
  }, [debouncedSearchTerm]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
        setHighlightedIndex(-1);
        setIsSearching(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredAndSortedOptions = useMemo(() => {
    if (!debouncedSearchTerm.trim()) return options; // Show all options if no search term

    const searchTermLower = debouncedSearchTerm.toLowerCase();
    return options
      .map((option) => {
        const extendedOption = option as ExtendedOption;
        const nameLower = option.label.toLowerCase();
        const id = extendedOption.clientData?._id || "";
        const lastFourDigits = id ? id.slice(-4).toLowerCase() : "";
        const nameMatch = nameLower.includes(searchTermLower);
        const idMatch = lastFourDigits.includes(searchTermLower);
        let score = 0;

        if (nameLower === searchTermLower) score += 100;
        else if (nameLower.startsWith(searchTermLower)) score += 50;
        else if (nameMatch) score += 25;

        if (lastFourDigits === searchTermLower) score += 100;
        else if (lastFourDigits.startsWith(searchTermLower)) score += 75;
        else if (idMatch) score += 30;

        return { ...option, score, nameMatch, idMatch };
      })
      .filter((option) => option.nameMatch || option.idMatch)
      .sort((a, b) => b.score - a.score || a.label.localeCompare(b.label));
  }, [debouncedSearchTerm, options]);

  const handleOptionSelect = useCallback(
    (option: Option) => {
      onChange(option.value);
      setSearchTerm(option.label);
      setShowDropdown(false);
      setHighlightedIndex(-1);
      setIsSearching(false);
    },
    [onChange]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!showDropdown) return;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setHighlightedIndex((prev) =>
            Math.min(prev + 1, filteredAndSortedOptions.length - 1)
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setHighlightedIndex((prev) => Math.max(prev - 1, -1));
          break;
        case "Enter":
          e.preventDefault();
          if (
            highlightedIndex >= 0 &&
            filteredAndSortedOptions[highlightedIndex]
          ) {
            handleOptionSelect(filteredAndSortedOptions[highlightedIndex]);
          }
          break;
        case "Escape":
          setShowDropdown(false);
          setHighlightedIndex(-1);
          setIsSearching(false);
          break;
      }

      if (listRef.current && highlightedIndex >= 0) {
        listRef.current.scrollToItem(highlightedIndex, "smart");
      }
    },
    [showDropdown, highlightedIndex, filteredAndSortedOptions, handleOptionSelect]
  );

  const renderOptionsList = useCallback(() => {
    if (debouncedSearchTerm.trim() && filteredAndSortedOptions.length === 0) {
      return <NoResults message="Sorry, client not found" />;
    }

    if (isSearching) {
      return <Loading />;
    }

    if (filteredAndSortedOptions.length <= MAX_ITEMS_WITHOUT_VIRTUALIZATION) {
      return filteredAndSortedOptions.map((option, index) => (
        <OptionItem
          key={option.value}
          option={option}
          searchTerm={debouncedSearchTerm}
          onSelect={handleOptionSelect}
          isSelected={value === option.value}
          isHighlighted={index === highlightedIndex}
        />
      ));
    }

    return (
      <List
        height={DROPDOWN_HEIGHT}
        itemCount={filteredAndSortedOptions.length}
        itemSize={ITEM_HEIGHT}
        width="100%"
        ref={listRef}
      >
        {({ index, style }) => (
          <div style={style}>
            <OptionItem
              option={filteredAndSortedOptions[index]}
              searchTerm={debouncedSearchTerm}
              onSelect={handleOptionSelect}
              isSelected={value === filteredAndSortedOptions[index].value}
              isHighlighted={index === highlightedIndex}
            />
          </div>
        )}
      </List>
    );
  }, [
    filteredAndSortedOptions,
    debouncedSearchTerm,
    handleOptionSelect,
    value,
    highlightedIndex,
    isSearching,
  ]);

  return (
    <div
      ref={wrapperRef}
      className={`relative w-full space-y-2 searchable-select ${className}`}
    >
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setShowDropdown(true);
            setIsSearching(true);
            if (!e.target.value.trim()) onChange(null); // Clear selection if input is empty
          }}
          onFocus={() => setShowDropdown(true)}
          onKeyDown={handleKeyDown}
          className={`pl-9 ${error ? "border-destructive" : ""}`}
        />
      </div>

      {showDropdown && (
        <div className="absolute w-full bg-background border rounded-lg shadow-sm z-10 overflow-hidden">
          <ErrorBoundary
            fallback={
              <div className="px-3 py-2 text-sm text-red-500">
                An error occurred. Please try again.
              </div>
            }
          >
            <div className="max-h-[300px] overflow-auto py-1">
              {renderOptionsList()}
            </div>
          </ErrorBoundary>
        </div>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}