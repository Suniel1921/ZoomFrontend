import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuthGlobally } from '../../context/AuthContext';

const PreviousTask = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [auth, setAuth] = useAuthGlobally();

  // Fetch data for tasks when the component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_REACT_APP_URL}/api/v1/appointment/getAllModelDataByID/${auth.user.id}`
        );
    
        console.log('API Response:', response.data);
    
        // Extract arrays from response.data.allData
        const { ApplicationModel = [], GraphicDesignModel = [], OtherServiceModel = [] } =
          response.data.allData;
    
        // Combine all tasks into a single array
        const allTasks = [...ApplicationModel, ...GraphicDesignModel, ...OtherServiceModel];
    
        // Filter tasks where all steps have status 'completed'
        const completedTasks = allTasks.filter(task =>
          task.steps.every(step => step.status === 'completed')
        );
    
        setTasks(completedTasks);
        setLoading(false);
      } catch (err) {
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
    return <div>Loading...</div>; // Loading state
  }

  if (error) {
    return <div>{error}</div>; // Error state
  }

  return (
    <div>
      <h1>Completed Tasks</h1>
      {tasks.length > 0 ? (
        <div className="space-y-4">
          {tasks.map((task) => (
            <div key={task._id} className="bg-white rounded-lg p-4">
              <h4 className="font-medium">{task?.type || task?.applicationType}</h4>
              <h3>{task.country}</h3>
              <p className="text-sm text-gray-500">All Steps Completed</p>
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









// import React, { useEffect, useState } from 'react';
// import axios from 'axios';
// import { useAuthGlobally } from '../../context/AuthContext';

// const PreviousTask = () => {
//   const [tasks, setTasks] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [auth] = useAuthGlobally();

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const response = await axios.get(
//           `${import.meta.env.VITE_REACT_APP_URL}/api/v1/appointment/getAllModelDataByID/${auth.user.id}`
//         );

//         // Extract and combine all model data with model names
//         const allData = response.data.allData;
//         const allTasks = Object.keys(allData).flatMap(modelName =>
//           allData[modelName].map(task => ({ ...task, modelName }))
//         );

//         // Filter tasks where all steps are completed
//         const completedTasks = allTasks.filter(task =>
//           task.steps.every(step => step.status === 'completed')
//         );

//         setTasks(completedTasks);
//         setLoading(false);
//       } catch (err:any) {
//         console.error('Error fetching data:', err);
//         const errorMessage =
//           err.response?.data?.message || 'Failed to fetch data. Please try again later.';
//         setError(errorMessage);
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, [auth.user.id]);

//   if (loading) {
//     return <div>Loading...</div>;
//   }

//   if (error) {
//     return <div>{error}</div>;
//   }

//   return (
//     <div>
//       {/* <h1>Completed Tasks</h1> */}
//       {tasks.length > 0 ? (
//         <div className="space-y-4">
//           {tasks.map(task => (
//             <div key={task._id} className="bg-white rounded-lg p-4">
//               <h4 className="font-medium">
//                 {task.modelName.replace('Model', '')} {/* Remove the word "Model" */}
//               </h4>
//               {/* <h3>{task.type || task.applicationType}</h3> */}
//               {/* <p>{task.country}</p> */}
//               <p className="text-sm text-gray-500">Completed</p>
//             </div>
//           ))}
//         </div>
//       ) : (
//         <p>No completed tasks.</p>
//       )}
//     </div>
//   );
// };

// export default PreviousTask;
