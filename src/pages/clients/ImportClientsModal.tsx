import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Upload } from 'lucide-react';
import Button from '../../components/Button';
import { useStore } from '../../store';
import { useAdminStore } from '../../store/adminStore';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';

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
  const { currentAdmin } = useAdminStore();
  const { addClient } = useStore();
  const [step, setStep] = useState(1);
  const [fileData, setFileData] = useState<any[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<MappingFormData>();

  // Only allow super admin access
  if (currentAdmin?.role !== 'super_admin') {
    return null;
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const fileExt = file.name.split('.').pop()?.toLowerCase();

    if (fileExt === 'csv') {
      Papa.parse(file, {
        complete: (results) => {
          handleParseComplete(results.data);
        },
        header: true,
      });
    } else if (fileExt === 'xlsx' || fileExt === 'xls') {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        handleParseComplete(jsonData);
      };
      reader.readAsBinaryString(file);
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
      addClient(client);
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
              <p className="mt-2 text-sm text-gray-600">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-gray-500">CSV or Excel files only</p>
              <Button
                onClick={() => fileInputRef.current?.click()}
                className="mt-4"
              >
                Select File
              </Button>
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
                    <label className="block text-sm font-medium text-gray-700">
                      Name Column
                    </label>
                    <select
                      {...register('name')}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-yellow focus:ring-brand-yellow"
                    >
                      <option value="">Select column</option>
                      {columns.map((col) => (
                        <option key={col} value={col}>
                          {col}
                        </option>
                      ))}
                    </select>
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Category Column
                    </label>
                    <select
                      {...register('category')}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-yellow focus:ring-brand-yellow"
                    >
                      <option value="">Select column</option>
                      {columns.map((col) => (
                        <option key={col} value={col}>
                          {col}
                        </option>
                      ))}
                    </select>
                    {errors.category && (
                      <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Optional Fields */}
              <div>
                <h3 className="font-medium border-b pb-2 mb-4">Optional Fields</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Email Column
                    </label>
                    <select
                      {...register('email')}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-yellow focus:ring-brand-yellow"
                    >
                      <option value="">Select column (optional)</option>
                      {columns.map((col) => (
                        <option key={col} value={col}>
                          {col}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Phone Column
                    </label>
                    <select
                      {...register('phone')}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-yellow focus:ring-brand-yellow"
                    >
                      <option value="">Select column (optional)</option>
                      {columns.map((col) => (
                        <option key={col} value={col}>
                          {col}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Nationality Column
                    </label>
                    <select
                      {...register('nationality')}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-yellow focus:ring-brand-yellow"
                    >
                      <option value="">Select column (optional)</option>
                      {columns.map((col) => (
                        <option key={col} value={col}>
                          {col}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Address Column
                    </label>
                    <select
                      {...register('address')}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-yellow focus:ring-brand-yellow"
                    >
                      <option value="">Select column (optional)</option>
                      {columns.map((col) => (
                        <option key={col} value={col}>
                          {col}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Preview Section */}
            <div className="space-y-4">
              <h3 className="font-medium border-b pb-2">Preview</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {columns.map((col) => (
                        <th
                          key={col}
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {previewData.map((row, idx) => (
                      <tr key={idx}>
                        {columns.map((col) => (
                          <td
                            key={col}
                            className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                          >
                            {row[col]}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button type="submit">Import Clients</Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}