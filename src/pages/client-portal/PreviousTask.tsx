import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuthGlobally } from '../../context/AuthContext';
import Confetti from 'react-confetti';

const PreviousTask = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [auth] = useAuthGlobally();
  const [showConfetti, setShowConfetti] = useState(false); // State to control confetti

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_REACT_APP_URL}/api/v1/appointment/getAllModelDataByID/${auth.user.id}`
        );

        // Extract and combine all model data with model names
        const allData = response.data.allData;
        const allTasks = Object.keys(allData).flatMap(modelName =>
          allData[modelName].map(task => ({ ...task, modelName }))
        );

        // Filter tasks where all steps are completed
        const completedTasks = allTasks.filter(task =>
          task.steps.every(step => step.status === 'completed')
        );

        setTasks(completedTasks);
        setLoading(false);

        // Check if all tasks are completed and trigger confetti
        if (completedTasks.length === allTasks.length) {
          // setShowConfetti(true);

          // Hide the confetti after 2 seconds
          setTimeout(() => {
            // setShowConfetti(false);
          }, 4000);
        }
      } catch (err: any) {
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
      {/* Render confetti when all tasks are completed */}
      {showConfetti && <Confetti />}

      {tasks.length > 0 ? (
        <div className="space-y-4">
          {tasks.map(task => (
            <div key={task._id} className="bg-white rounded-lg p-4">
              <h4 className="font-medium">
                {task.modelName.replace('Model', '')} {/* Remove the word "Model" */}
              </h4>
              <p className="text-sm text-gray-500">Completed</p>
            </div>
          ))}
        </div>
      ) : (
        <p>No completed tasks.</p>
      )}
    </div>
  );
};

export default PreviousTask;









