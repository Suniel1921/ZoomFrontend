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
            <div key={task._id} className="bg-white rounded-lg p-4">
              {/* Display model name with the word "Model" removed */}
              <h4 className="font-medium">
                {task.modelName.replace('Model', '')} {/* Remove the word "Model" */}
              </h4>
              <p className="text-sm text-gray-500">Amount: {task.amount || task?.payment?.visaApplicationFee} </p>
              <p className="text-sm text-gray-500">translationFee: {task?.payment?.translationFee || 0} </p>
              <p className="text-sm text-gray-500">Payment Method: {task.paymentMethod}</p>
              <p className="text-sm text-gray-500">Payment Status: {task.paymentStatus}</p>
              <p className="text-sm text-gray-500">Due Amount: {task.dueAmount || task?.payment?.total}</p>
              <p className="text-sm text-gray-500">Paid Amount: {task.paidAmount || task?.payment?.paidAmount}</p>
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
