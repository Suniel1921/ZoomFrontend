import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { startOfDay, subDays, subMonths, startOfYear, isAfter } from "date-fns";
import { safeParse } from "../../../utils/dateUtils";

// Types
interface Task {
  [key: string]: any;
}

interface SalesData {
  total: number;
  paid: number;
  pending: number;
}

interface Tasks {
  applications: Task[];
  japanVisit: Task[];
  translations: Task[];
  designs: Task[];
  epassport: Task[];
  otherServices: Task[];
}

interface Props {
  onTotalSalesUpdate: (total: number) => void;
}

// Helper function to calculate totals for a category
const calculateCategorySales = (
  tasks: Task[],
  dateField: string | null,
  dateRange: { start: Date; end: Date } | null,
  totalField: string | ((task: Task) => number),
  paidField: string | ((task: Task) => number),
  pendingField: string | ((task: Task) => number)
): SalesData => {
  const filteredTasks = dateField && dateRange
    ? tasks.filter((task) => {
        const taskDate = safeParse(task[dateField]);
        return taskDate && isAfter(taskDate, dateRange.start);
      })
    : tasks;

  const totalReducer = (sum: number, task: Task) =>
    sum + (typeof totalField === "function" ? totalField(task) : (task[totalField] || 0));
  const paidReducer = (sum: number, task: Task) =>
    sum + (typeof paidField === "function" ? paidField(task) : (task[paidField] || 0));
  const pendingReducer = (sum: number, task: Task) =>
    sum + (typeof pendingField === "function" ? pendingField(task) : (task[pendingField] || 0));

  const paid = filteredTasks.reduce(paidReducer, 0);
  const pending = filteredTasks.reduce(pendingReducer, 0);
  const total = paid + pending; // Enforce total = paid + pending

  // Fix: Use a fallback instead of undefined 'category'
  console.log(`Category Totals - ${filteredTasks[0]?.modelName || "Unknown"}:`, { total, paid, pending });

  return { total, paid, pending };
};

export default function SalesReport({ onTotalSalesUpdate }: Props) {
  const [period, setPeriod] = useState<"daily" | "weekly" | "monthly" | "yearly" | "lifetime">("daily");
  const [tasks, setTasks] = useState<Tasks>({
    applications: [],
    japanVisit: [],
    translations: [],
    designs: [],
    epassport: [],
    otherServices: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_REACT_APP_URL}/api/v1/appointment/fetchAllModelData`
        );
        if (response.data.success) {
          const data = response.data.allData || {};
          const updatedTasks = {
            applications: data.application || [],
            japanVisit: data.japanVisit || [],
            translations: data.documentTranslation || [],
            designs: data.graphicDesigns || [],
            epassport: data.epassports || [],
            otherServices: data.otherServices || [],
          };
          setTasks(updatedTasks);
          console.log("All Tasks:", updatedTasks);
        } else {
          setError("Failed to fetch data from the API.");
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("An error occurred while fetching sales data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const dateRange = useMemo(() => {
    if (period === "lifetime") return null;
    const end = startOfDay(new Date());
    const ranges: Record<string, Date> = {
      daily: end,
      weekly: subDays(end, 7),
      monthly: subMonths(end, 1),
      yearly: startOfYear(end),
    };
    return { start: ranges[period], end };
  }, [period]);

  const salesData = useMemo(() => {
    const data = {
      applications: calculateCategorySales(
        tasks.applications,
        period === "lifetime" ? null : "submissionDate",
        dateRange,
        (task) => (task.payment?.visaApplicationFee || 0) + (task.payment?.translationFee || 0),
        (task) => task.payment?.paidAmount || 0,
        (task) => {
          const total = (task.payment?.visaApplicationFee || 0) + (task.payment?.translationFee || 0);
          const paid = task.payment?.paidAmount || 0;
          const discount = task.payment?.discount || 0;
          return Math.max(0, total - paid - discount);
        }
      ),
      japanVisit: calculateCategorySales(
        tasks.japanVisit,
        period === "lifetime" ? null : "date",
        dateRange,
        "amount",
        "paidAmount",
        "dueAmount"
      ),
      translations: calculateCategorySales(
        tasks.translations,
        period === "lifetime" ? null : "createdAt",
        dateRange,
        "amount",
        "paidAmount",
        "dueAmount"
      ),
      designs: calculateCategorySales(
        tasks.designs,
        period === "lifetime" ? null : "createdAt",
        dateRange,
        "amount",
        "advancePaid",
        "dueAmount"
      ),
      epassport: calculateCategorySales(
        tasks.epassport,
        period === "lifetime" ? null : "date",
        dateRange,
        "amount",
        "paidAmount",
        "dueAmount"
      ),
      otherServices: calculateCategorySales(
        tasks.otherServices,
        period === "lifetime" ? null : "createdAt",
        dateRange,
        "amount",
        "paidAmount",
        (task) => {
          const total = task.amount || 0;
          const paid = task.paidAmount || 0;
          const discount = task.discount || 0;
          const due = task.dueAmount !== undefined ? task.dueAmount : total - paid - discount;
          return Math.max(0, due);
        }
      ),
    };

    console.log("Sales Data:", data);

    // Adjust totals to enforce consistency
    Object.keys(data).forEach((category) => {
      data[category].total = data[category].paid + data[category].pending;
    });

    return data;
  }, [tasks, dateRange, period]);

  const { totalSales, totalPaid, totalPending } = useMemo(() => {
    const totals = Object.values(salesData).reduce(
      (acc, data) => ({
        totalSales: acc.totalSales + data.total,
        totalPaid: acc.totalPaid + data.paid,
        totalPending: acc.totalPending + data.pending,
      }),
      { totalSales: 0, totalPaid: 0, totalPending: 0 }
    );

    console.log("Aggregate Totals:", totals);

    const expectedTotal = totals.totalPaid + totals.totalPending;
    if (totals.totalSales !== expectedTotal) {
      console.warn(
        `Total mismatch detected! Total Sales: ${totals.totalSales}, Paid + Pending: ${expectedTotal}, Difference: ${
          totals.totalSales - expectedTotal
        }`
      );
    }

    return totals;
  }, [salesData]);

  useEffect(() => {
    onTotalSalesUpdate(totalSales);
  }, [totalSales, onTotalSalesUpdate]);

  if (loading) return <div className="text-center py-10">Loading sales data...</div>;
  if (error) return <div className="text-center py-10 text-red-500">{error}</div>;

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-medium">Sales Report</h3>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Period:</span>
          <select
            value={period}
            onChange={(e) =>
              setPeriod(e.target.value as "daily" | "weekly" | "monthly" | "yearly" | "lifetime")
            }
            className="flex h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm transition-colors duration-200 focus:border-brand-yellow focus:outline-none focus:ring-2 focus:ring-brand-yellow/20 w-40"
          >
            <option value="daily">Today</option>
            <option value="weekly">Last 7 Days</option>
            <option value="monthly">Last 30 Days</option>
            <option value="yearly">This Year</option>
            <option value="lifetime">Lifetime</option>
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
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {category.charAt(0).toUpperCase() +
                    category
                      .slice(1)
                      .replace(/([A-Z])/g, " $1")
                      .trim()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  ¥{data.total.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                  ¥{data.paid.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                  ¥{data.pending.toLocaleString()}
                </td>
              </tr>
            ))}
            <tr className="bg-gray-50 font-medium">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Total</td>
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





