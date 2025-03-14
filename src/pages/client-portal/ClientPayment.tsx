import React, { useState, useEffect } from 'react';
import axios from 'axios'; // Ensure axios is imported
import { useAuthGlobally } from '../../context/AuthContext';

const ClientPayment = () => {
  const [paymentData, setPaymentData] = useState<any>(null); 
  console.log('client payment is ', paymentData)
  const [loading, setLoading] = useState<boolean>(true); 
  const [error, setError] = useState<string | null>(null); 
  const [auth] = useAuthGlobally(); 

  // Fetch payment data when the component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_REACT_APP_URL}/api/v1/appointment/getAllModelDataByID/${auth?.user?.id}`);

        // Extract all model data without filtering completed tasks
        const allData = response.data.allData;
        const allTasks = Object.keys(allData).flatMap(modelName =>
          allData[modelName].map(task => ({ ...task, modelName }))
        );
        
        setPaymentData(allTasks); 
        setLoading(false);
      } catch (err:any) {
        console.error('Error fetching data:', err);
        const errorMessage =
          err.response?.data?.message || 'Failed to fetch data. Please try again later.';
        setError(errorMessage);
        setLoading(false);
      }
    };

    fetchData();
  }, [auth.user.id]);

  if (loading) {
    return <div>Loading...</div>; 
  }

  if (error) {
    return <div>{error}</div>; 
  }

  return (
    <div>
      {/* <h2>Client Payment Section</h2> */}

      {/* Display the payment data */}
      {paymentData && paymentData.length > 0 ? (
        <div className="space-y-4">
          {paymentData.map((task: any) => (
            <div key={task._id} className="bg-white rounded-lg p-4 relative">
              {/* Display model name with the word "Model" removed */}
              <h4 className="font-medium mb-2">
                {task.modelName.replace('Model', '')} {/* Remove the word "Model" */}
              </h4>

              {/* Display payment status in the top-right corner */}
              <span
                className={`absolute top-2 right-2 px-2 py-1 text-xs rounded-full ${task.paymentStatus === 'Paid' ? 'bg-green-100 text-green-800' : task.paymentStatus === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}
              >
                {task.paymentStatus}
              </span>
   {/* Payment details */}
   <div className="space-y-2 text-sm text-gray-600">
                <p>
                  <span className="font-medium text-gray-800">Amount:</span>{" "}
                  {task.amount || task?.payment?.visaApplicationFee || "N/A"}
                </p>
                <p>
                  <span className="font-medium text-gray-800">Translation Fee:</span>{" "}
                  {task?.payment?.translationFee || 0}
                </p>
                <p>
                  <span className="font-medium text-gray-800">Due Amount:</span>{" "}
                  {task.dueAmount || task?.payment?.total || "0"}
                </p>
                {/* Conditionally render Discount Amount */}
                {(task.discount || task?.payment?.discount) > 0 && (
                  <p>
                    <span className="font-medium text-gray-800">Discount Amount:</span>{" "}
                    {task.discount || task?.payment?.discount}
                  </p>
                )}
                <p>
                  <span className="font-medium text-gray-800">Paid Amount:</span>{" "}
                  {task.paidAmount || task?.payment?.paidAmount || "N/A"}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p>No payment data available.</p> 
      )}
    </div>
  );
};

export default ClientPayment;


// if discount amount is 0 then dont show the discount amount 

