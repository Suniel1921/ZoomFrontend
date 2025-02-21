import React, { useEffect, useState, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import axios from "axios";

// Types
interface Task {
  handledBy?: string;
  translationHandler?: string;
  [key: string]: any;
}

interface WorkloadData {
  name: string;
  handledByTasks: number;
  translationTasks: number;
}

// Google-style three-dot spinner CSS
const spinnerStyles = `
  .spinner-container {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 6px;
  }

  .dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    animation: bounce 1.2s infinite ease-in-out;
  }

  .dot:nth-child(1),
  .dot:nth-child(3) {
    background-color: #000;
  }

  .dot:nth-child(2) {
    background-color: #fedc00;
    animation-delay: 0.2s;
  }

  .dot:nth-child(3) {
    animation-delay: 0.4s;
  }

  @keyframes bounce {
    0%, 80%, 100% {
      transform: translateY(0);
    }
    40% {
      transform: translateY(-8px);
    }
  }
`;

export default function WorkloadDistribution() {
  const [data, setData] = useState<WorkloadData[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_REACT_APP_URL}/api/v1/appointment/fetchAllModelData`
        );
        if (response.data.success && response.data.allData) {
          setData(processWorkloadData(response.data.allData));
        } else {
          console.error("No data available from API");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Process workload data
  const processWorkloadData = (allData: {
    application: Task[];
    japanVisit: Task[];
    documentTranslation: Task[];
    otherServices: Task[];
  }): WorkloadData[] => {
    const workloadMap: { [key: string]: { handledByTasks: number; translationTasks: number } } = {};

    // Helper function to increment workload
    const incrementWorkload = (handler: string | undefined, type: "handledBy" | "translation") => {
      if (!handler) return;
      if (!workloadMap[handler]) {
        workloadMap[handler] = { handledByTasks: 0, translationTasks: 0 };
      }
      type === "handledBy" ? workloadMap[handler].handledByTasks++ : workloadMap[handler].translationTasks++;
    };

    // Process each task type
    (allData.application || []).forEach((task) => {
      incrementWorkload(task.handledBy, "handledBy");
      incrementWorkload(task.translationHandler, "translation");
    });

    (allData.japanVisit || []).forEach((task) => incrementWorkload(task.handledBy, "handledBy"));
    (allData.documentTranslation || []).forEach((task) => incrementWorkload(task.handledBy, "handledBy"));
    (allData.otherServices || []).forEach((task) => incrementWorkload(task.handledBy, "handledBy"));

    // Convert to chart data
    return Object.entries(workloadMap).map(([name, counts]) => ({
      name,
      handledByTasks: counts.handledByTasks,
      translationTasks: counts.translationTasks,
    }));
  };

  // Memoized workload data
  const workloadData = useMemo(() => data, [data]);

  // Three-dot spinner component
  const ThreeDotSpinner = () => (
    <div className="spinner-container">
      <div className="dot"></div>
      <div className="dot"></div>
      <div className="dot"></div>
    </div>
  );

  if (loading) {
    return (
      <div className="text-center py-10">
        <style>{spinnerStyles}</style>
        <ThreeDotSpinner />
      </div>
    );
  }

  return (
    <div>
      <style>{spinnerStyles}</style>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={workloadData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip formatter={(value: number) => value.toLocaleString()} />
          <Legend />
          <Bar dataKey="handledByTasks" fill="#000" name="Handled By Tasks" />
          <Bar dataKey="translationTasks" fill="#fedc00" name="Translation Tasks" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

