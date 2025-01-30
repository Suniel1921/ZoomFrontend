// ***********WORK LOAD DISTRIBUTE BY HANDLER NAME************
import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import axios from 'axios';

const WorkloadDistribution = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Call the API to fetch data
        const response = await axios.get(`${import.meta.env.VITE_REACT_APP_URL}/api/v1/appointment/fetchAllModelData`);
        const allData = response.data.allData;

        // Process data to calculate workload per client
        const workload = [];
        const clientWorkload = {};

        // Loop through each model (application, japanVisit, documentTranslation)
        allData.application.concat(allData.japanVisit, allData.documentTranslation, allData.otherServices).forEach(item => {
          // const clientId = item.clientId._id;
          const clientId = item.handledBy;
          if (!clientWorkload[clientId]) {
            clientWorkload[clientId] = {
              handledBy: item.handledBy,
              workload: 0,
            };
          }
          // Increase workload for each item assigned to the client
          clientWorkload[clientId].workload += 1;
        });

        // Convert client workload data to an array format suitable for the chart
        for (let clientId in clientWorkload) {
          workload.push({
            name: clientWorkload[clientId].handledBy,
            workload: clientWorkload[clientId].workload,
          });
        }

        setData(workload);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data: ", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h2>Workload Distribution</h2>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="workload" fill="#FEDC00" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default WorkloadDistribution;









