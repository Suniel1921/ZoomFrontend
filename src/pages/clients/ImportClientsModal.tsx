import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { X, Upload } from 'lucide-react';
import Button from '../../components/Button';
import axios from 'axios';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { z } from 'zod';
import toast from 'react-hot-toast';

const mappingSchema = z.object({
  name: z.string().min(1, 'Name column is required'),
  email: z.string().optional(),
  phone: z.string().optional(),
  category: z.string().min(1, 'Category column is required'),
  nationality: z.string().optional(),
  address: z.string().optional(),
});

type MappingFormData = z.infer<typeof mappingSchema>;

interface ImportClientsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ImportClientsModal({ isOpen, onClose }: ImportClientsModalProps) {
  const [step, setStep] = useState(1);
  const [fileData, setFileData] = useState<any[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false); // For showing loading state
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<MappingFormData>();

  const handleParseCSV = (file: File) => {
    Papa.parse(file, {
      complete: (result) => {
        handleParseComplete(result.data);
      },
      header: true,
    });
  };

  const handleParseExcel = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
      handleParseComplete(jsonData);
    };
    reader.readAsArrayBuffer(file);
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    const file = e.target.files[0];

    if (!file) {
      return toast.error('Please select a file');
    }

    const formData = new FormData();
    formData.append('csvFile', file);

    try {
      setLoading(true);  // Show loading spinner
      const response = await axios.post(`${import.meta.env.VITE_REACT_APP_URL}/api/v1/client/uploadCsvFile`, formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      toast.success('CSV data imported successfully');
      // Parse file based on file type (CSV or Excel)
      if (file.name.endsWith('.csv')) {
        handleParseCSV(file);
      } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        handleParseExcel(file);
      }
    } catch (err) {
      console.error('Error uploading CSV:', err);
      toast.error('Error importing CSV data');
    } finally {
      setLoading(false);  // Hide loading spinner
    }
  };

  const handleParseComplete = (data: any[]) => {
    if (data.length === 0) return;
    setFileData(data);
    setColumns(Object.keys(data[0]));
    setPreviewData(data.slice(0, 5));
    setStep(2);
  };

  const onSubmit = (mappingData: MappingFormData) => {
    const importedClients = fileData.map((row) => ({
      name: row[mappingData.name],
      email: mappingData.email ? row[mappingData.email] : '',
      phone: mappingData.phone ? row[mappingData.phone] : '',
      category: row[mappingData.category],
      nationality: mappingData.nationality ? row[mappingData.nationality] : '',
      status: 'active',
      address: {
        street: mappingData.address ? row[mappingData.address] : '',
        postalCode: '',
        prefecture: '',
        city: '',
        building: '',
      },
      socialMedia: {},
      modeOfContact: [],
      dateJoined: new Date().toISOString(),
      timeline: [],
    }));

    importedClients.forEach(client => {
      addClient(client); // Assuming addClient is defined elsewhere
    });

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Import Clients</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Step 1: File Upload */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileUpload}
                className="hidden"
              />
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-sm text-gray-600">Click to upload or drag and drop</p>
              <p className="text-xs text-gray-500">CSV or Excel files only</p>
              <Button onClick={() => fileInputRef.current?.click()} className="mt-4">
                Select File
              </Button>
              {loading && <p className="text-sm text-gray-500">Uploading...</p>} {/* Show loading state */}
            </div>
          </div>
        )}

        {/* Step 2: Field Mapping */}
        {step === 2 && (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-6">
              {/* Required Fields */}
              <div>
                <h3 className="font-medium border-b pb-2 mb-4">Required Fields</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Name Column</label>
                    <select
                      {...register('name')}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-yellow focus:ring-brand-yellow"
                    >
                      <option value="">Select Name Column</option>
                      {columns.map((col) => (
                        <option key={col} value={col}>
                          {col}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Category Column</label>
                    <select
                      {...register('category')}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-yellow focus:ring-brand-yellow"
                    >
                      <option value="">Select Category Column</option>
                      {columns.map((col) => (
                        <option key={col} value={col}>
                          {col}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Optional Fields */}
              <div>
                <h3 className="font-medium border-b pb-2 mb-4">Optional Fields</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email Column</label>
                    <select
                      {...register('email')}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-yellow focus:ring-brand-yellow"
                    >
                      <option value="">Select Email Column</option>
                      {columns.map((col) => (
                        <option key={col} value={col}>
                          {col}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone Column</label>
                    <select
                      {...register('phone')}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-yellow focus:ring-brand-yellow"
                    >
                      <option value="">Select Phone Column</option>
                      {columns.map((col) => (
                        <option key={col} value={col}>
                          {col}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Address Column */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Address Column</label>
                <select
                  {...register('address')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-yellow focus:ring-brand-yellow"
                >
                  <option value="">Select Address Column</option>
                  {columns.map((col) => (
                    <option key={col} value={col}>
                      {col}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <Button type="submit" className="w-full">
              Import Clients
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
