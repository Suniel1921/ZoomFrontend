import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { useAccountTaskGlobally } from "../../context/AccountTaskContext";

const PaymentHistory = ({ selectedClientId }) => {
  const { accountTaskData } = useAccountTaskGlobally();
  const [paymentHistory, setPaymentHistory] = useState([]);

  useEffect(() => {
    const fetchPaymentHistory = () => {
      const allPayments = [];

      // Loop through all available models in accountTaskData
      Object.keys(accountTaskData).forEach((modelKey) => {
        const modelData = accountTaskData[modelKey];

        if (Array.isArray(modelData)) {
          modelData.forEach((item) => {
            // Ensure the clientId matches the selectedClientId
            if (item.clientId?._id === selectedClientId) {              
              if (item) {
                allPayments.push({
                  date: item.createdAt,
                  type: item.type || `${modelKey.charAt(0).toUpperCase() + modelKey.slice(1)} Service`,
                  total: item?.total || item?.amount || item.payment?.visaApplicationFee || 0,
                  paidAmount: item.paidAmount || item.payment?.paidAmount || 0,
                  paymentStatus: item.visaStatus || item.status,
                  model: modelKey, // Track the model the payment came from
                });
              }
            }
          });
        }
      });

      setPaymentHistory(allPayments);
    };





    if (selectedClientId && accountTaskData) {
      fetchPaymentHistory();
    }
  }, [selectedClientId, accountTaskData]);

  const isValidDate = (date: any) => {
    const parsedDate = new Date(date);
    return !isNaN(parsedDate.getTime());
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Model</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {paymentHistory.length > 0 ? (
            paymentHistory.map((payment, index) => {
              const paymentDate = isValidDate(payment.date) ? format(new Date(payment.date), "MMM d, yyyy") : "Invalid Date";
              const modelName = payment.model ? payment.model.charAt(0).toUpperCase() + payment.model.slice(1) : "Unknown Model"; // Ensure model is valid
              return (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{paymentDate}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{payment.type}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>
                      <p>Total: ¥{payment.total?.toLocaleString()}</p>
                      <p className="text-gray-500">Paid: ¥{payment.paidAmount?.toLocaleString()}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${payment.paymentStatus === 'Paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {payment.paymentStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {modelName}
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">No payments found for this client.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default PaymentHistory;
