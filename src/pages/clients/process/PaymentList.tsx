import { useState } from 'react';
import { DollarSign, Edit } from 'lucide-react';
import Button from '../../../components/Button';
import { useTaskManagementStore } from '../../../store/taskManagementStore';
import { useStore } from '../../../store';
import type { ClientProcess, PaymentMilestone } from '../../../types/taskManagement';
import RecordPaymentModal from './RecordPaymentModal';
import EditPaymentModal from './EditPaymentModal';

interface PaymentListProps {
  process: ClientProcess;
}

export default function PaymentList({ process }: PaymentListProps) {
  const [selectedPayment, setSelectedPayment] = useState<PaymentMilestone | null>(null);
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const { updatePayment } = useTaskManagementStore();
  const { 
    applications, 
    japanVisitApplications, 
    translations, 
    graphicDesignJobs, 
    epassportApplications,
    otherServices 
  } = useStore();

  // Get the HisabKitab data based on service type
  const getHisabKitab = () => {
    const templateType = process.templateId.toLowerCase();
    
    if (templateType.includes('us_visa') || templateType.includes('visitor_visa')) {
      const app = applications.find(a => a.clientId === process.clientId);
      return {
        amount: app?.payment?.visaApplicationFee || 0,
        translationFee: app?.payment?.translationFee || 0,
        paidAmount: app?.payment?.paidAmount || 0,
        discount: app?.payment?.discount || 0,
        total: app?.payment?.total || 0
      };
    }
    
    if (templateType.includes('japan_visa')) {
      const app = japanVisitApplications.find(a => a.clientId === process.clientId);
      return {
        amount: app?.amount || 0,
        paidAmount: app?.paidAmount || 0,
        discount: app?.discount || 0,
        total: app?.amount || 0
      };
    }
    
    if (templateType.includes('translation')) {
      const trans = translations.find(t => t.clientId === process.clientId);
      return {
        amount: trans?.amount || 0,
        paidAmount: trans?.amount - (trans?.amount || 0),
        discount: 0,
        total: trans?.amount || 0
      };
    }
    
    if (templateType.includes('design')) {
      const design = graphicDesignJobs.find(d => d.clientId === process.clientId);
      return {
        amount: design?.amount || 0,
        paidAmount: design?.advancePaid || 0,
        discount: 0,
        total: design?.amount || 0
      };
    }
    
    if (templateType.includes('epassport')) {
      const epass = epassportApplications.find(e => e.clientId === process.clientId);
      return {
        amount: epass?.amount || 0,
        paidAmount: epass?.paidAmount || 0,
        discount: epass?.discount || 0,
        total: epass?.amount || 0
      };
    }
    
    if (templateType.includes('other')) {
      const service = otherServices.find(s => s.clientId === process.clientId);
      return {
        amount: service?.amount || 0,
        paidAmount: service?.paidAmount || 0,
        discount: service?.discount || 0,
        total: service?.amount || 0
      };
    }

    return { amount: 0, paidAmount: 0, discount: 0, total: 0, translationFee: 0 };
  };

  const hisabKitab = getHisabKitab();
  const remainingAmount = hisabKitab.total - (hisabKitab.paidAmount + hisabKitab.discount);

  return (
    <div className="space-y-6">
      {/* HisabKitab Summary */}
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <h4 className="text-lg font-medium text-gray-900 mb-4">HisabKitab (Financial Summary)</h4>
        <div className="space-y-3">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">Service Fee:</span>
            <span className="font-medium">¥{hisabKitab.amount.toLocaleString()}</span>
          </div>
          {hisabKitab.translationFee > 0 && (
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Translation Fee:</span>
              <span className="font-medium">¥{hisabKitab.translationFee.toLocaleString()}</span>
            </div>
          )}
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">Total Amount:</span>
            <span className="font-medium">¥{hisabKitab.total.toLocaleString()}</span>
          </div>
          <div className="border-t border-gray-200 my-2"></div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">Paid Amount:</span>
            <span className="font-medium text-green-600">-¥{hisabKitab.paidAmount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">Discount:</span>
            <span className="font-medium text-green-600">-¥{hisabKitab.discount.toLocaleString()}</span>
          </div>
          <div className="border-t border-gray-200 my-2"></div>
          <div className="flex justify-between items-center font-medium">
            <span className="text-gray-900">Due Amount:</span>
            <span className={remainingAmount > 0 ? 'text-red-600' : 'text-green-600'}>
              ¥{remainingAmount.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Payment Milestones */}
      <div className="space-y-4">
        {process.payments.map((payment) => (
          <div
            key={payment.id}
            className="bg-white rounded-lg border border-gray-200 p-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">{payment.name}</h4>
                {payment.requiredForStep && (
                  <p className="text-sm text-gray-500">
                    Required for: {
                      process.steps.find(s => s.id === payment.requiredForStep)?.name
                    }
                  </p>
                )}
              </div>
              <div className="text-right">
                <p className="font-medium">¥{payment.amount.toLocaleString()}</p>
                <p className="text-sm text-gray-500">
                  Paid: ¥{payment.paidAmount.toLocaleString()}
                </p>
              </div>
            </div>

            {/* Payment Status and Actions */}
            <div className="mt-4 flex items-center justify-between">
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                payment.status === 'completed'
                  ? 'bg-green-100 text-green-700'
                  : payment.status === 'partial'
                  ? 'bg-yellow-100 text-yellow-700'
                  : 'bg-gray-100 text-gray-700'
              }`}>
                {payment.status === 'completed'
                  ? 'Paid'
                  : payment.status === 'partial'
                  ? 'Partially Paid'
                  : 'Pending'}
              </span>

              <div className="flex gap-2">
                {payment.status !== 'completed' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedPayment(payment);
                      setIsRecordModalOpen(true);
                    }}
                  >
                    <DollarSign className="h-4 w-4 mr-2" />
                    Record Payment
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedPayment(payment);
                    setIsEditModalOpen(true);
                  }}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Payment
                </Button>
              </div>
            </div>

            {/* Payment History */}
            {payment.paidAt && (
              <div className="mt-2 text-sm text-gray-500">
                Last payment on {new Date(payment.paidAt).toLocaleDateString()}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Modals */}
      {selectedPayment && (
        <>
          <RecordPaymentModal
            isOpen={isRecordModalOpen}
            onClose={() => {
              setIsRecordModalOpen(false);
              setSelectedPayment(null);
            }}
            process={process}
            payment={selectedPayment}
            serviceAmount={hisabKitab.total}
            paidAmount={hisabKitab.paidAmount}
          />
          <EditPaymentModal
            isOpen={isEditModalOpen}
            onClose={() => {
              setIsEditModalOpen(false);
              setSelectedPayment(null);
            }}
            process={process}
            payment={selectedPayment}
            serviceAmount={hisabKitab.total}
            paidAmount={hisabKitab.paidAmount}
          />
        </>
      )}
    </div>
  );
}