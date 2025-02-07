import { useState, useEffect } from 'react';
import { Plus, ChevronRight, CheckCircle, AlertTriangle, Trash2 } from 'lucide-react';
import { Modal, Button as AntButton, Button } from 'antd'; 
import CreateProcessModal from './CreateProcessModal';
import ProcessDetails from './ProcessDetails';
import ProcessSummary from './process/ProcessSummary';

interface Task {
  id: string;
  status: string;
}

interface Process {
  _id: string;
  clientName: string;
  status: string;
  stepsCompleted: number;
  totalSteps: number;
  documentsVerified: number;
  totalDocuments: number;
  paymentsCompleted: number;
  totalPayments: number;
  totalAmount: number;
}

interface ProcessFlowTabProps {
  client: {
    id: string; // Client ID
    tasks: Task[]; // Tasks for the client
  };
  allData: {
    application: Process[];
    appointment: Process[];
    documentTranslation: Process[];
    epassports: Process[];
    japanVisit: Process[];
    otherServices: Process[];
    graphicDesigns: Process[];
  };
}

export default function ProcessFlowTab({ client, allData }: ProcessFlowTabProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedProcess, setSelectedProcess] = useState<Process | null>(null);
  const [filteredProcesses, setFilteredProcesses] = useState<{
    name: string;
    data: Process[];
  }[]>([]);

  const [isDetailsModalVisible, setIsDetailsModalVisible] = useState(false);

  // Show Process Details Modal
  const handleProcessDetailsModalOpen = (process: Process) => {
    setSelectedProcess(process);
    setIsDetailsModalVisible(true);
  };

  // Close Process Details Modal
  const handleProcessDetailsModalClose = () => {
    setSelectedProcess(null);
    setIsDetailsModalVisible(false);
  };

  useEffect(() => {
    // Filter processes for the specific client ID and group by category
    const allProcesses = [
      { name: 'Visa Application', data: allData.application },
      { name: 'Appointment', data: allData.appointment },
      { name: 'Document Translation', data: allData.documentTranslation },
      { name: 'ePassports', data: allData.epassports },
      { name: 'Japan Visit', data: allData.japanVisit },
      { name: 'Other Services', data: allData.otherServices },
      { name: 'Graphic Designs', data: allData.graphicDesigns },
    ];

    const clientProcesses = allProcesses.map((category) => ({
      ...category,
      data: category.data.filter((process) => process?.clientId?._id === client), // Filter processes by client ID
    }));

    setFilteredProcesses(clientProcesses);
  }, [client, allData]);

  return (
    <div className="space-y-6">
      {/* Header with Add Button */}
      <div className="flex justify-between items-center">
        <h3 className="font-medium text-gray-900">Process Flows</h3>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Process
        </Button>
      </div>

      {/* No Processes Message */}
      {filteredProcesses.every((category) => category.data.length === 0) && (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No processes found for this client.</p>
        </div>
      )}

      {/* Process List */}
      {filteredProcesses.map((category) =>
        category.data.length > 0 ? (
          <div key={category.name}>
            {/* Display Category Name as Heading */}
            <h4 className="font-medium text-gray-900">{category.name}</h4>

            <div className="space-y-4">
              {/* Process Data */}
              {category.data.map((process) => (
                <div
                  key={process._id}
                  className="bg-white rounded-lg border border-gray-200 hover:border-brand-yellow transition-colors"
                >
                  <div className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">{process?.clientId?.name}</h4>
                        <p className="text-sm text-gray-500">Started on {new Date().toLocaleDateString()}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-blue-600">{process.status}</span>
                        <AntButton
                          variant="outline"
                          size="small"
                          onClick={() => handleProcessDetailsModalOpen(process)} // Open the details modal
                        >
                          <ChevronRight className="h-5 w-5" />
                        </AntButton>
                        <AntButton
                          variant="outline"
                          size="small"
                          onClick={(e) => e.stopPropagation()}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </AntButton>
                      </div>
                    </div>

                    {/* Progress Indicators */}
                    <div className="mt-4 grid grid-cols-4 gap-4">
                      {/* Steps */}
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <div className="text-sm">
                          <p className="font-medium">0 / 5</p>
                          <p className="text-gray-500">Steps Completed</p>
                        </div>
                      </div>

                      {/* Documents */}
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-green-500" />
                        <div className="text-sm">
                          <p className="font-medium">0 / 0</p>
                          <p className="text-gray-500">Documents Verified</p>
                        </div>
                      </div>

                      {/* Payments */}
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-yellow-500" />
                        <div className="text-sm">
                          <p className="font-medium">0 / 1</p>
                          <p className="text-gray-500">Payments Completed</p>
                        </div>
                      </div>

                      {/* Total Amount */}
                      <div className="flex items-center gap-2">
                        <div className="text-sm">
                          <p className="font-medium">¥{process?.amount || process.payment?.visaApplicationFee}</p>
                          <p className="text-gray-500">Total Amount</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null
      )}

      {/* Modals */}
      <CreateProcessModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        client={client}
      />

      {/* Process Details Modal using Ant Design */}
      <Modal
        title={`Process Details for ${selectedProcess?.clientName}`}
        open={isDetailsModalVisible}
        onCancel={handleProcessDetailsModalClose} // Close the modal
        footer={null} // No footer buttons (optional, you can customize this)
        width={1000}
      >
          {/* <ProcessDetails /> */}
          <ProcessSummary client={client} allData={allData}/>
    
      </Modal>
    </div>
  );
}
