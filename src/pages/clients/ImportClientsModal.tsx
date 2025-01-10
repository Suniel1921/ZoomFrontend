
// ***********Note: data import from csv file without modal ***************


import { useState, useRef } from 'react';
import { X, Upload } from 'lucide-react';
import Button from '../../components/Button';
import axios from 'axios';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import toast from 'react-hot-toast';

export default function ImportClientsModal({ isOpen, onClose,getAllClients }: { isOpen: boolean, onClose: () => void }) {
  const [loading, setLoading] = useState(false); // For showing loading state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileData, setFileData] = useState<any[]>([]);

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
      getAllClients();
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

    // Automatically import clients after parsing the file
    const importedClients = data.map((row) => ({
      name: row.name, // Assuming "name" exists in the CSV/Excel
      category: row.category, // Assuming "category" exists in the CSV/Excel
      status: 'active',
      dateJoined: new Date().toISOString(),
    }));

    importedClients.forEach(client => {
      addClient(client); // Assuming addClient is defined elsewhere
    });

    onClose();  // Close the modal after import
    toast.success('Clients imported successfully'); // Show success toast
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

        {/* File Upload */}
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
      </div>
    </div>
  );
}
