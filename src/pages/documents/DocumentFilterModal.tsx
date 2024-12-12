import { X } from 'lucide-react';
import Button from '../../components/Button';

interface DocumentFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTags: string[];
  setSelectedTags: (tags: string[]) => void;
  selectedTypes: string[];
  setSelectedTypes: (types: string[]) => void;
  selectedCategories: string[];
  setSelectedCategories: (categories: string[]) => void;
}

export default function DocumentFilterModal({
  isOpen,
  onClose,
  selectedTags,
  setSelectedTags,
  selectedTypes,
  setSelectedTypes,
  selectedCategories,
  setSelectedCategories,
}: DocumentFilterModalProps) {
  const documentTypes = ['Visa', 'Financial', 'Translation', 'Contract', 'Other'];
  const categories = ['Application', 'Personal', 'Financial', 'Legal'];
  const commonTags = ['Important', 'Urgent', 'Review Required', 'Approved', 'Expired'];

  const handleTypeToggle = (type: string) => {
    setSelectedTypes(
      selectedTypes.includes(type)
        ? selectedTypes.filter(t => t !== type)
        : [...selectedTypes, type]
    );
  };

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories(
      selectedCategories.includes(category)
        ? selectedCategories.filter(c => c !== category)
        : [...selectedCategories, category]
    );
  };

  const handleTagToggle = (tag: string) => {
    setSelectedTags(
      selectedTags.includes(tag)
        ? selectedTags.filter(t => t !== tag)
        : [...selectedTags, tag]
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Filter Documents</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Document Types */}
          <div>
            <h3 className="font-medium mb-2">Document Types</h3>
            <div className="flex flex-wrap gap-2">
              {documentTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => handleTypeToggle(type)}
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    selectedTypes.includes(type)
                      ? 'bg-brand-yellow text-brand-black'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div>
            <h3 className="font-medium mb-2">Categories</h3>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => handleCategoryToggle(category)}
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    selectedCategories.includes(category)
                      ? 'bg-brand-yellow text-brand-black'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Common Tags */}
          <div>
            <h3 className="font-medium mb-2">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {commonTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => handleTagToggle(tag)}
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    selectedTags.includes(tag)
                      ? 'bg-brand-yellow text-brand-black'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setSelectedTypes([]);
                setSelectedCategories([]);
                setSelectedTags([]);
              }}
            >
              Reset
            </Button>
            <Button onClick={onClose}>Apply Filters</Button>
          </div>
        </div>
      </div>
    </div>
  );
}