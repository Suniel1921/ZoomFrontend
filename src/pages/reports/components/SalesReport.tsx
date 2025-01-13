import { useState, useEffect } from 'react';
import axios from 'axios';
import { startOfDay, subDays, subMonths, startOfYear, isAfter } from 'date-fns';
import { safeParse } from '../../../utils/dateUtils';

export default function SalesReport() {
  const [period, setPeriod] = useState('daily');
  const [tasks, setTasks] = useState({
    applications: [],
    japanVisit: [],
    translations: [],
    designs: [],
    epassport: [],
    otherServices: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch data from the API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_REACT_APP_URL}/api/v1/appointment/fetchAllModelData`);
        if (response.data.success) {
          const data = response.data.allData;
          console.log('sale report data is', data)
          setTasks({
            applications: data.application || [],
            japanVisit: data.japanVisit || [],
            translations: data.documentTranslation || [],
            designs: data.graphicDesigns || [],
            epassport: data.epassports || [],
            otherServices: data.otherServices || [],
          }); 
        } else {
          setError('Failed to fetch data from the API.');
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('An error occurred while fetching data.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Get date range based on selected period
  const getDateRange = () => {
    const end = startOfDay(new Date());
    let start = end;

    switch (period) {
      case 'daily':
        start = end;
        break;
      case 'weekly':
        start = subDays(end, 7);
        break;
      case 'monthly':
        start = subMonths(end, 1);
        break;
      case 'yearly':
        start = startOfYear(end);
        break;
      default:
        start = end;
    }

    return { start, end };
  };

  const dateRange = getDateRange();

  // Filter tasks by date range
  const filterTasksByDate = (tasks: any[], dateField: string) => {
    if (!Array.isArray(tasks)) return [];
    return tasks.filter(task => {
      const taskDate = safeParse(task[dateField]);
      return taskDate && isAfter(taskDate, dateRange.start);
    });
  };

  // Calculate total sales and pending payments for each category
  const salesData = {
    applications: {
      total: filterTasksByDate(tasks.applications, 'submissionDate')
        .reduce((sum, app) => sum + (app.payment?.visaApplicationFee || 0), 0),
      paid: filterTasksByDate(tasks.applications, 'submissionDate')
        .reduce((sum, app) => sum + (app.payment?.paidAmount || 0), 0),
      pending: filterTasksByDate(tasks.applications, 'submissionDate')
        .reduce((sum, app) => {
          const total = app.payment?.visaApplicationFee || 0;
          const paid = app.payment?.paidAmount || 0;
          const discount = app.payment?.discount || 0;
          return sum + (total - paid - discount);
        }, 0),
    },
    japanVisit: {
      total: filterTasksByDate(tasks.japanVisit, 'date')
        .reduce((sum, app) => sum + (app.amount || 0), 0),
      paid: filterTasksByDate(tasks.japanVisit, 'date')
        .filter(app => app.paymentStatus === 'Paid')
        .reduce((sum, app) => sum + (app.paidAmount || 0), 0),
      pending: filterTasksByDate(tasks.japanVisit, 'date')
        // .filter(app => app.paymentStatus === 'Due')
        .reduce((sum, app) => sum + (app.dueAmount || 0), 0),
    },
    translations: {
      total: filterTasksByDate(tasks.translations, 'createdAt')
        .reduce((sum, trans) => sum + (trans.amount || 0), 0),
      paid: filterTasksByDate(tasks.translations, 'createdAt')
        .filter(trans => trans.paymentStatus === 'Paid')
        .reduce((sum, trans) => sum + (trans.amount || 0), 0),
      pending: filterTasksByDate(tasks.translations, 'createdAt')
        .filter(trans => trans.paymentStatus === 'Due')
        .reduce((sum, trans) => sum + (trans.amount || 0), 0),
    },
    designs: {
      total: filterTasksByDate(tasks.designs, 'createdAt')
        .reduce((sum, job) => sum + (job.amount || 0), 0),
      paid: filterTasksByDate(tasks.designs, 'createdAt')
        // .filter(job => job.paymentStatus === 'Paid')
        .reduce((sum, job) => sum + (job.advancePaid || 0), 0),
      pending: filterTasksByDate(tasks.designs, 'createdAt')
        .filter(job => job.paymentStatus === 'Due')
        .reduce((sum, job) => sum + (job.dueAmount || 0), 0),
    },
    epassport: {
      total: filterTasksByDate(tasks.epassport, 'date')
        .reduce((sum, app) => sum + (app.amount || 0), 0),
      paid: filterTasksByDate(tasks.epassport, 'date')
        // .filter(app => app.paymentStatus === 'Paid') 
        .reduce((sum, app) => sum + (app.paidAmount || 0), 0),
      pending: filterTasksByDate(tasks.epassport, 'date')
        .filter(app => app.paymentStatus === 'Due')
        .reduce((sum, app) => sum + (app.dueAmount || 0), 0),
    },
    otherServices: {
      total: filterTasksByDate(tasks.otherServices, 'createdAt')
        .reduce((sum, service) => sum + (service.amount || 0), 0),
      paid: filterTasksByDate(tasks.otherServices, 'createdAt')
        // .filter(service => service.paymentStatus === 'Paid')
        .reduce((sum, service) => sum + (service.paidAmount || 0), 0),
      pending: filterTasksByDate(tasks.otherServices, 'createdAt')
        .filter(service => service.paymentStatus === 'Due')
        .reduce((sum, service) => sum + (service.dueAmount || 0), 0),
    },
  };

  const totalSales = Object.values(salesData).reduce((sum, data) => sum + data.total, 0);
  const totalPaid = Object.values(salesData).reduce((sum, data) => sum + data.paid, 0);
  const totalPending = Object.values(salesData).reduce((sum, data) => sum + data.pending, 0);

  if (loading) {
    return <div className="text-center py-10">Loading...</div>;
  }

  if (error) {
    return <div className="text-center py-10 text-red-500">{error}</div>;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-medium">Sales Report</h3>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Period:</span>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="rounded-md border-gray-300 shadow-sm focus:border-brand-yellow focus:ring-brand-yellow text-sm"
          >
            <option value="daily">Today</option>
            <option value="weekly">Last 7 Days</option>
            <option value="monthly">Last 30 Days</option>
            <option value="yearly">This Year</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Paid Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Pending Amount
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {Object.entries(salesData).map(([category, data]) => (
              <tr key={category} className="hover:bg-gray-50">
                {/* <h2>{JSON.stringify(salesData.applications.paid)}</h2> */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm font-medium text-gray-900">
                    {category
                      .charAt(0)
                      .toUpperCase() +
                      category.slice(1)
                        .replace(/([A-Z])/g, ' $1')}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-900">
                    ¥{data.total.toLocaleString()}
                  </span>
                  
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-green-600">
                    ¥{data.paid.toLocaleString()}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-red-600">
                    ¥{data.pending.toLocaleString()}
                  </span>
                </td>
              </tr>
            ))}
            <tr className="bg-gray-50 font-medium">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                Total
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                ¥{totalSales.toLocaleString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                ¥{totalPaid.toLocaleString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                ¥{totalPending.toLocaleString()}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}






// **************showing total amount in card******

// import { useState, useEffect } from 'react';
// import axios from 'axios';
// import { startOfDay, subDays, subMonths, startOfYear, isAfter } from 'date-fns';
// import { safeParse } from '../../../utils/dateUtils';

// export default function SalesReport({ onTotalSalesUpdate }) {
//   const [period, setPeriod] = useState('daily');
//   const [tasks, setTasks] = useState({
//     applications: [],
//     japanVisit: [],
//     translations: [],
//     designs: [],
//     epassport: [],
//     otherServices: [],
//   });
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   // Fetch data from the API
//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const response = await axios.get(`${import.meta.env.VITE_REACT_APP_URL}/api/v1/appointment/fetchAllModelData`);
//         if (response.data.success) {
//           const data = response.data.allData;
//           console.log('sale report data is', data)
//           setTasks({
//             applications: data.application || [],
//             japanVisit: data.japanVisit || [],
//             translations: data.documentTranslation || [],
//             designs: data.graphicDesigns || [],
//             epassport: data.epassports || [],
//             otherServices: data.otherServices || [],
//           }); 
//         } else {
//           setError('Failed to fetch data from the API.');
//         }
//       } catch (err) {
//         console.error('Error fetching data:', err);
//         setError('An error occurred while fetching data.');
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, []);

//   // Get date range based on selected period
//   const getDateRange = () => {
//     const end = startOfDay(new Date());
//     let start = end;

//     switch (period) {
//       case 'daily':
//         start = end;
//         break;
//       case 'weekly':
//         start = subDays(end, 7);
//         break;
//       case 'monthly':
//         start = subMonths(end, 1);
//         break;
//       case 'yearly':
//         start = startOfYear(end);
//         break;
//       default:
//         start = end;
//     }

//     return { start, end };
//   };

//   const dateRange = getDateRange();

//   // Filter tasks by date range
//   const filterTasksByDate = (tasks: any[], dateField: string) => {
//     if (!Array.isArray(tasks)) return [];
//     return tasks.filter(task => {
//       const taskDate = safeParse(task[dateField]);
//       return taskDate && isAfter(taskDate, dateRange.start);
//     });
//   };

//   // Calculate total sales and pending payments for each category
//   const salesData = {
//     applications: {
//       total: filterTasksByDate(tasks.applications, 'submissionDate')
//         .reduce((sum, app) => sum + (app.payment?.visaApplicationFee || 0), 0),
//       paid: filterTasksByDate(tasks.applications, 'submissionDate')
//         .reduce((sum, app) => sum + (app.payment?.paidAmount || 0), 0),
//       pending: filterTasksByDate(tasks.applications, 'submissionDate')
//         .reduce((sum, app) => {
//           const total = app.payment?.visaApplicationFee || 0;
//           const paid = app.payment?.paidAmount || 0;
//           const discount = app.payment?.discount || 0;
//           return sum + (total - paid - discount);
//         }, 0),
//     },
//     japanVisit: {
//       total: filterTasksByDate(tasks.japanVisit, 'date')
//         .reduce((sum, app) => sum + (app.amount || 0), 0),
//       paid: filterTasksByDate(tasks.japanVisit, 'date')
//         .filter(app => app.paymentStatus === 'Paid')
//         .reduce((sum, app) => sum + (app.paidAmount || 0), 0),
//       pending: filterTasksByDate(tasks.japanVisit, 'date')
//         .reduce((sum, app) => sum + (app.dueAmount || 0), 0),
//     },
//     translations: {
//       total: filterTasksByDate(tasks.translations, 'createdAt')
//         .reduce((sum, trans) => sum + (trans.amount || 0), 0),
//       paid: filterTasksByDate(tasks.translations, 'createdAt')
//         .filter(trans => trans.paymentStatus === 'Paid')
//         .reduce((sum, trans) => sum + (trans.amount || 0), 0),
//       pending: filterTasksByDate(tasks.translations, 'createdAt')
//         .filter(trans => trans.paymentStatus === 'Due')
//         .reduce((sum, trans) => sum + (trans.amount || 0), 0),
//     },
//     designs: {
//       total: filterTasksByDate(tasks.designs, 'createdAt')
//         .reduce((sum, job) => sum + (job.amount || 0), 0),
//       paid: filterTasksByDate(tasks.designs, 'createdAt')
//         .reduce((sum, job) => sum + (job.advancePaid || 0), 0),
//       pending: filterTasksByDate(tasks.designs, 'createdAt')
//         .filter(job => job.paymentStatus === 'Due')
//         .reduce((sum, job) => sum + (job.dueAmount || 0), 0),
//     },
//     epassport: {
//       total: filterTasksByDate(tasks.epassport, 'date')
//         .reduce((sum, app) => sum + (app.amount || 0), 0),
//       paid: filterTasksByDate(tasks.epassport, 'date')
//         .reduce((sum, app) => sum + (app.paidAmount || 0), 0),
//       pending: filterTasksByDate(tasks.epassport, 'date')
//         .filter(app => app.paymentStatus === 'Due')
//         .reduce((sum, app) => sum + (app.dueAmount || 0), 0),
//     },
//     otherServices: {
//       total: filterTasksByDate(tasks.otherServices, 'createdAt')
//         .reduce((sum, service) => sum + (service.amount || 0), 0),
//       paid: filterTasksByDate(tasks.otherServices, 'createdAt')
//         .reduce((sum, service) => sum + (service.paidAmount || 0), 0),
//       pending: filterTasksByDate(tasks.otherServices, 'createdAt')
//         .filter(service => service.paymentStatus === 'Due')
//         .reduce((sum, service) => sum + (service.dueAmount || 0), 0),
//     },
//   };

//   const totalSales = Object.values(salesData).reduce((sum, data) => sum + data.total, 0);
//   const totalPaid = Object.values(salesData).reduce((sum, data) => sum + data.paid, 0);
//   const totalPending = Object.values(salesData).reduce((sum, data) => sum + data.pending, 0);

//   // Update parent component with total sales whenever it changes
//   useEffect(() => {
//     onTotalSalesUpdate(totalSales);
//   }, [totalSales, onTotalSalesUpdate]);

//   if (loading) {
//     return <div className="text-center py-10">Loading...</div>;
//   }

//   if (error) {
//     return <div className="text-center py-10 text-red-500">{error}</div>;
//   }

//   return (
//     <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
//       <div className="flex justify-between items-center mb-6">
//         <h3 className="text-lg font-medium">Sales Report</h3>
//         <div className="flex items-center gap-2">
//           <span className="text-sm text-gray-500">Period:</span>
//           <select
//             value={period}
//             onChange={(e) => setPeriod(e.target.value)}
//             className="rounded-md border-gray-300 shadow-sm focus:border-brand-yellow focus:ring-brand-yellow text-sm"
//           >
//             <option value="daily">Today</option>
//             <option value="weekly">Last 7 Days</option>
//             <option value="monthly">Last 30 Days</option>
//             <option value="yearly">This Year</option>
//           </select>
//         </div>
//       </div>

//       <div className="overflow-x-auto">
//         <table className="min-w-full divide-y divide-gray-200">
//           <thead className="bg-gray-50">
//             <tr>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                 Category
//               </th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                 Total Amount
//               </th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                 Paid Amount
//               </th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                 Pending Amount
//               </th>
//             </tr>
//           </thead>
//           <tbody className="bg-white divide-y divide-gray-200">
//             {Object.entries(salesData).map(([category, data]) => (
//               <tr key={category} className="hover:bg-gray-50">
//                 <td className="px-6 py-4 whitespace-nowrap">
//                   <span className="text-sm font-medium text-gray-900">
//                     {category
//                       .charAt(0)
//                       .toUpperCase() +
//                       category.slice(1)
//                         .replace(/([A-Z])/g, ' $1')}
//                   </span>
//                 </td>
//                 <td className="px-6 py-4 whitespace-nowrap">
//                   <span className="text-sm text-gray-900">
//                     ¥{data.total.toLocaleString()}
//                   </span>
//                 </td>
//                 <td className="px-6 py-4 whitespace-nowrap">
//                   <span className="text-sm text-green-600">
//                     ¥{data.paid.toLocaleString()}
//                   </span>
//                 </td>
//                 <td className="px-6 py-4 whitespace-nowrap">
//                   <span className="text-sm text-red-600">
//                     ¥{data.pending.toLocaleString()}
//                   </span>
//                 </td>
//               </tr>
//             ))}
//             <tr className="bg-gray-50 font-medium">
//               <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                 Total
//               </td>
//               <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                 ¥{totalSales.toLocaleString()}
//               </td>
//               <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
//                 ¥{totalPaid.toLocaleString()}
//               </td>
//               <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
//                 ¥{totalPending.toLocaleString()}
//               </td>
//             </tr>
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }