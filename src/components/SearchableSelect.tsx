import { useState, useEffect, useCallback, useMemo } from "react";
import { Search, User } from 'lucide-react';
import { FixedSizeList as List } from "react-window";
import Input from "./Input";
import { useDebounce } from "../hooks/useDebounce";
import type { Option, SearchableSelectProps } from "./types";
import { ErrorBoundary } from "react-error-boundary";

const ITEM_HEIGHT = 50;
const MAX_ITEMS_WITHOUT_VIRTUALIZATION = 50;

const OptionItem = ({ option, searchTerm, onSelect, isSelected }) => (
  <div
    className={`flex items-center px-3 py-2 cursor-pointer hover:bg-accent ${
      isSelected ? "bg-accent" : ""
    }`}
    onClick={() => onSelect(option)}
  >
    <div className="h-8 w-8 mr-3 rounded-full bg-muted flex items-center justify-center overflow-hidden">
      {option.clientData?.profilePhoto ? (
        <img
          src={option.clientData.profilePhoto || "/placeholder.svg"}
          alt={option.label}
          className="h-full w-full object-cover"
        />
      ) : (
        <User className="h-5 w-5 text-muted-foreground" />
      )}
    </div>
    <div className="flex flex-col">
      <span className="text-sm font-medium">{highlightMatch(option.label, searchTerm)}</span>
    </div>
  </div>
);

const highlightMatch = (text: string, searchTerm: string) => {
  if (!searchTerm.trim()) return text;

  const regex = new RegExp(`(${searchTerm})`, "gi");

  return text.split(regex).map((part, index) =>
    regex.test(part) ? (
      <mark key={index} className="bg-yellow-200 text-gray-900">
        {part}
      </mark>
    ) : (
      part
    )
  );
};

export default function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = "Search by name...",
  className = "",
  error,
}: SearchableSelectProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const filteredAndSortedOptions = useMemo(() => {
    if (!debouncedSearchTerm.trim()) return [];

    const searchTermLower = debouncedSearchTerm.toLowerCase();

    return options
      .map((option) => {
        const nameLower = option.label.toLowerCase();
        const nameMatch = nameLower.includes(searchTermLower);

        let score = 0;
        if (nameLower === searchTermLower) score += 100;
        else if (nameLower.startsWith(searchTermLower)) score += 50;
        else if (nameMatch) score += 25;

        return { ...option, score, nameMatch };
      })
      .filter((option) => option.nameMatch)
      .sort((a, b) => b.score - a.score);
  }, [debouncedSearchTerm, options]);

  const selectedOption = useMemo(() => options.find((option) => option.value === value), [options, value]);

  useEffect(() => {
    if (selectedOption) {
      setSearchTerm(selectedOption.label);
    }
  }, [selectedOption]);

  const handleOptionSelect = useCallback(
    (option: Option) => {
      onChange(option.value);
      setSearchTerm(option.label);
      setShowDropdown(false);
    },
    [onChange]
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(".searchable-select")) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const renderOptionsList = () => {
    if (filteredAndSortedOptions.length <= MAX_ITEMS_WITHOUT_VIRTUALIZATION) {
      return filteredAndSortedOptions.map((option) => (
        <OptionItem
          key={option.value}
          option={option}
          searchTerm={debouncedSearchTerm}
          onSelect={handleOptionSelect}
          isSelected={value === option.value}
        />
      ));
    }

    return (
      <List
        height={300}
        itemCount={filteredAndSortedOptions.length}
        itemSize={ITEM_HEIGHT}
        width="100%"
      >
        {({ index, style }) => (
          <div style={style}>
            <OptionItem
              option={filteredAndSortedOptions[index]}
              searchTerm={debouncedSearchTerm}
              onSelect={handleOptionSelect}
              isSelected={value === filteredAndSortedOptions[index].value}
            />
          </div>
        )}
      </List>
    );
  };

  return (
    <div className="relative w-full space-y-2 searchable-select">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setShowDropdown(true);
          }}
          onFocus={() => setShowDropdown(true)}
          className={`pl-9 ${className}`}
        />
      </div>

      {showDropdown && (
        <div className="absolute w-full bg-background border rounded-lg shadow-sm z-10">
          <ErrorBoundary fallback={<div>An error occurred. Please try again.</div>}>
            <div className="max-h-60 overflow-auto py-1">
              {filteredAndSortedOptions.length > 0 ? (
                renderOptionsList()
              ) : (
                debouncedSearchTerm.trim() !== "" && (
                  <div className="px-3 py-2 text-center text-sm text-muted-foreground">No results found</div>
                )
              )}
            </div>
          </ErrorBoundary>
        </div>
      )}

      {error && <p className="mt-1 text-sm text-destructive">{error}</p>}
    </div>
  );
}
