import { useState, useRef } from "react";
import { X, Upload } from "lucide-react";
import Button from "../../components/Button";
import axios from "axios";
import Papa from "papaparse";
import toast from "react-hot-toast";

export default function ImportClientsModal({
  isOpen,
  onClose,
  getAllClients,
}: { isOpen: boolean; onClose: () => void; getAllClients: () => void }) {
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
  
    if (!file) {
      return toast.error("Please select a file");
    }
  
    try {
      Papa.parse(file, {
        complete: async (results) => {
          const csvData = results.data.map(row => row.join(',')).join('\n');
          console.log("CSV Data:", csvData); // Debugging
  
          const response = await axios.post(
            `${import.meta.env.VITE_REACT_APP_URL}/api/v1/client/uploadCsvFile`,
            { csvData },
            {
              headers: {
                "Content-Type": "application/json",
              },
              withCredentials: true,
            }
          );
  
          if (response.data.success) {
            getAllClients();
            toast.success("CSV data imported successfully");
          }
        },
        header: false,
      });
    } catch (err) {
      // console.error("Error uploading CSV:", err);
      toast.error("Error importing CSV data");
    }
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
            {loading && <p className="text-sm text-gray-500">Uploading...</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

