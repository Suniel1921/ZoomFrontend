
// fell free to change this code and make its beauty 

// import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
// import type { Admin } from '../../../types/admin';

// interface WorkloadDistributionProps {
//   tasks: {
//     applications: any[];
//     japanVisit: any[];
//     translations: any[];
//     designs: any[];
//     epassport: any[];
//     otherServices: any[]; // Added otherServices
//   };
//   handlers: Admin[];
// }

// const COLORS = {
//   applications: '#FEDC00',
//   japanVisit: '#010101',
//   translations: '#666666',
//   designs: '#999999',
//   epassport: '#CCCCCC',
//   otherServices: '#333333', // Added color for otherServices
// };

// export default function WorkloadDistribution({ tasks, handlers }: WorkloadDistributionProps) {
//   // Ensure all task arrays exist with defaults
//   const {
//     applications = [],
//     japanVisit = [],
//     translations = [],
//     designs = [],
//     epassport = [],
//     otherServices = []
//   } = tasks;

//   const data = handlers
//     .filter(handler => handler.role !== 'super_admin')
//     .map(handler => {
//       const handlerTasks = {
//         applications: applications.filter(t => t.handledBy === handler.name).length,
//         japanVisit: japanVisit.filter(t => t.handledBy === handler.name).length,
//         translations: translations.filter(t => t.handledBy === handler.name).length,
//         designs: designs.filter(t => t.handledBy === handler.name).length,
//         epassport: epassport.filter(t => t.handledBy === handler.name).length,
//         otherServices: otherServices.filter(t => t.handledBy === handler.name).length, // Added otherServices
//       };

//       return {
//         name: handler.name,
//         total: Object.values(handlerTasks).reduce((a, b) => a + b, 0),
//         ...handlerTasks,
//       };
//     })
//     .filter(handler => handler.total > 0)
//     .sort((a, b) => b.total - a.total);

//   return (
//     <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
//       <h3 className="text-lg font-medium mb-4">Workload Distribution</h3>
//       <div className="h-[300px]">
//         <ResponsiveContainer width="100%" height="100%">
//           <BarChart data={data}>
//             <CartesianGrid strokeDasharray="3 3" />
//             <XAxis dataKey="name" />
//             <YAxis />
//             <Tooltip />
//             <Legend />
//             <Bar 
//               dataKey="applications" 
//               stackId="a" 
//               fill={COLORS.applications} 
//               name="Visa Applications" 
//             />
//             <Bar 
//               dataKey="japanVisit" 
//               stackId="a" 
//               fill={COLORS.japanVisit} 
//               name="Japan Visit" 
//             />
//             <Bar 
//               dataKey="translations" 
//               stackId="a" 
//               fill={COLORS.translations} 
//               name="Translations" 
//             />
//             <Bar 
//               dataKey="designs" 
//               stackId="a" 
//               fill={COLORS.designs} 
//               name="Design Jobs" 
//             />
//             <Bar 
//               dataKey="epassport" 
//               stackId="a" 
//               fill={COLORS.epassport} 
//               name="ePassport" 
//             />
//             <Bar 
//               dataKey="otherServices" 
//               stackId="a" 
//               fill={COLORS.otherServices} 
//               name="Other Services" 
//             />
//           </BarChart>
//         </ResponsiveContainer>
//       </div>
//     </div>
//   );
// }

















import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

import type { Admin } from '../../../types/admin';

interface WorkloadDistributionProps {
  handlers: Admin[];
}

const COLORS = {
  application: '#FEDC00',
  japanVisit: '#010101',
  documentTranslation: '#666666',
  graphicDesigns: '#999999',
  epassports: '#CCCCCC',
  otherServices: '#333333',
};

export default function WorkloadDistribution({ handlers }: WorkloadDistributionProps) {
  const [workloadData, setWorkloadData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchWorkloadData() {
      try {
        const response = await fetch('http://localhost:3000/api/v1/appointment/fetchAllModelData');
        if (!response.ok) {
          throw new Error('Failed to fetch workload data');
        }
        const { allData } = await response.json();

        // Map API data to the expected tasks structure
        const tasks = {
          applications: allData.application || [],
          japanVisit: allData.japanVisit || [],
          translations: allData.documentTranslation || [],
          designs: allData.graphicDesigns || [],
          epassport: allData.epassports || [],
          otherServices: allData.otherServices || [],
        };

        // Process handler data
        const processedData = handlers
          .map((handler) => {
            const taskCounts = {
              application: tasks.applications.filter((task) => task.handledBy === handler.name).length,
              japanVisit: tasks.japanVisit.filter((task) => task.handledBy === handler.name).length,
              documentTranslation: tasks.translations.filter((task) => task.handledBy === handler.name).length,
              graphicDesigns: tasks.designs.filter((task) => task.handledBy === handler.name).length,
              epassports: tasks.epassport.filter((task) => task.handledBy === handler.name).length,
              otherServices: tasks.otherServices.filter((task) => task.handledBy === handler.name).length,
            };

            return {
              name: handler.name,
              total: Object.values(taskCounts).reduce((sum, count) => sum + count, 0),
              ...taskCounts,
            };
          })
          .filter((data) => data.total > 0) // Include handlers with tasks
          .sort((a, b) => b.total - a.total); // Sort by workload

        setWorkloadData(processedData);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError(err.message || 'An error occurred while fetching data');
        setLoading(false);
      }
    }

    fetchWorkloadData();
  }, [handlers]);

  if (loading) {
    return <p>Loading workload distribution...</p>;
  }

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h3 className="text-lg font-medium mb-4">Workload Distribution</h3>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={workloadData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            {Object.keys(COLORS).map((taskKey) => (
              <Bar
                key={taskKey}
                dataKey={taskKey}
                stackId="a"
                fill={COLORS[taskKey as keyof typeof COLORS]}
                name={taskKey
                  .replace(/([A-Z])/g, ' $1')
                  .replace(/^./, (str) => str.toUpperCase())} // Format task names
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
