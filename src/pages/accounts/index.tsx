import { useEffect, useState, useCallback, useMemo } from 'react';
import { CreditCard, UserPlus } from 'lucide-react';
import SearchableSelect from '../../components/SearchableSelect';
import Button from '../../components/Button';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import axios from 'axios';
import ClientTaskTracking from '../clients/ClientTaskTracking';
import { useAccountTaskGlobally } from '../../context/AccountTaskContext';

export default function AccountsPage() {
  const navigate = useNavigate();
  const [clientsForDropdown, setClientsForDropdown] = useState<any[]>([]);
  const { accountTaskData, setAccountTaskData, selectedClientId, setSelectedClientId } = useAccountTaskGlobally();
  const [isLoading, setIsLoading] = useState(false);

  // Memoize the API URL
  const apiUrl = useMemo(() => import.meta.env.VITE_REACT_APP_URL, []);

  // Fetch all model data with error handling and loading state
  const getAllModelData = useCallback(async (clientId: string = '') => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${apiUrl}/api/v1/appointment/fetchAllModelData`, {
        params: { clientId },
      });
      
      if (response.data.success) {
        setAccountTaskData(response.data.allData);
        extractClients(response.data.allData);
      } else {
        toast.error('Failed to fetch data');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'An error occurred while fetching data';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [apiUrl, setAccountTaskData]);

  // Optimize client extraction with useMemo
  const extractClients = useCallback((allData: any) => {
    const uniqueClientsMap = new Map();

    Object.values(allData).forEach((modelData: any[]) => {
      if (Array.isArray(modelData)) {
        modelData.forEach(item => {
          const clientId = item.clientId?._id;
          if (clientId && item.clientId.name && !uniqueClientsMap.has(clientId)) {
            uniqueClientsMap.set(clientId, {
              value: clientId,
              label: item.clientId.name,
              clientData: item.clientId
            });
          }
        });
      }
    });

    setClientsForDropdown(Array.from(uniqueClientsMap.values()));
  }, []);

  useEffect(() => {
    getAllModelData();
  }, [getAllModelData]);

  useEffect(() => {
    if (selectedClientId) {
      getAllModelData(selectedClientId);
    }
  }, [selectedClientId, getAllModelData]);

  // Memoize selected client data
  const selectedClient = useMemo(() => {
    if (!selectedClientId || !accountTaskData) return null;
    
    return Object.values(accountTaskData)
      .flat()
      .find(item => item.clientId?._id === selectedClientId)?.clientId || null;
  }, [selectedClientId, accountTaskData]);

  const getInitials = useCallback((name: string) => {
    return name.split(' ').map(word => word[0]).join('').toUpperCase();
  }, []);

  // if (isLoading) {
  //   return <div className="flex items-center justify-center h-screen">Loading...</div>;
  // }

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <CreditCard className="h-6 w-6 text-gray-400" />
            <h1 className="text-xl font-semibold text-gray-900">Accounts & Tasks</h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-96">
              <SearchableSelect
                options={clientsForDropdown}
                value={selectedClientId}
                onChange={setSelectedClientId}
                placeholder="Search client..."
              />
            </div>
            <Button onClick={() => navigate('/dashboard/clients', { state: { openAddModal: true } })}>
              <UserPlus className="h-4 w-4 mr-2" />
              Add Client
            </Button>
          </div>
        </div>
      </div>

      {selectedClient ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {selectedClient.profilePhoto ? (
                  <img
                    src={selectedClient.profilePhoto}
                    alt={selectedClient.name}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-12 w-12 rounded-full bg-brand-yellow/10 flex items-center justify-center">
                    <span className="text-xl text-brand-black font-medium">
                      {getInitials(selectedClient.name)}
                    </span>
                  </div>
                )}
                <div>
                  <h2 className="text-lg font-semibold">{selectedClient.name}</h2>
                  <p className="text-sm text-gray-500">{selectedClient.email}</p>
                </div>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  selectedClient.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                }`}
              >
                {selectedClient.status}
              </span>
            </div>
          </div>

          <div className="p-6">
            <ClientTaskTracking client={selectedClient} getAllModelData={getAllModelData} />
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Select a Client</h2>
          <p className="text-gray-500">Search and select a client to view their accounts and tasks details.</p>
        </div>
      )}
    </div>
  );
}