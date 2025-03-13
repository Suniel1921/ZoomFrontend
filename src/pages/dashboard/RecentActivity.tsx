import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import {
  FileText,
  Mail,
  DollarSign,
  Phone,
  BarChart,
  Search,
  XCircle,
} from "lucide-react";
import Button from "../../components/Button";
import Input from "../../components/Input";

interface AuditLog {
  _id: string;
  action: string;
  userType: string;
  userId: string;
  userName: string;
  details: any;
  timestamp: string;
}

const RecentActivity: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

  const limit = 20;

  const fetchRecentActivity = async (pageNum: number, query: string = "") => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_REACT_APP_URL}/api/v1/logs/get-audit-log`,
        {
          params: {
            page: pageNum,
            limit,
            userType: ["admin", "superadmin"], // Fetch both admin and superadmin logs
            searchQuery: query,
          },
        }
      );
      if (response.data.success) {
        setLogs(response.data.logs || []);
        setTotalPages(response.data.pagination?.pages || 1);
      } else {
        throw new Error(response.data.message || "Failed to fetch logs");
      }
    } catch (err) {
      const errorMessage =
        (err as any).response?.data?.message || "Error fetching recent activities";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchRecentActivity(page, searchQuery);
    } else {
      setSearchQuery("");
      setPage(1);
    }
  }, [isOpen, page, searchQuery]); // Added searchQuery to dependencies

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setPage(1);
  };

  const getActionIcon = (details: any, action: string) => {
    if (!details || typeof details !== "object") {
      return {
        icon: <BarChart className="h-5 w-5 text-white" />,
        bgColor: "bg-indigo-500",
      };
    }

    const { path, method } = details;
    const isLoginOrFailedLogin = action.toLowerCase().includes("login");
    if (isLoginOrFailedLogin) return null; // Exclude login and failed_login
    if (path?.includes("67d28b9b176c576d058737ea")) return null; // Exclude specific ID for updateEpassport
    if (path?.includes("67d174cbc74451f40acab723")) return null; // Exclude specific ID for updateDocumentTranslation

    switch (method?.toUpperCase()) {
      case "POST":
        return {
          icon: <FileText className="h-5 w-5 text-white" />,
          bgColor: "bg-green-500",
        };
      case "PUT":
      case "PATCH":
        return {
          icon: <Mail className="h-5 w-5 text-white" />,
          bgColor: "bg-purple-500",
        };
      case "DELETE":
        return {
          icon: <DollarSign className="h-5 w-5 text-white" />,
          bgColor: "bg-yellow-500",
        };
      default:
        return {
          icon: <Phone className="h-5 w-5 text-white" />,
          bgColor: "bg-red-500",
        };
    }
  };

  const getPathHeading = (details: any, action: string) => {
    if (!details || typeof details !== "object" || !details.path) {
      return action; // Use action as heading if path is missing
    }
    const path = details.path.replace(/^\//, ""); // Remove leading slash
    // Check for specific paths
    if (path.includes("updateEpassport")) return "updateEpassport";
    if (path.includes("updateDocumentTranslation")) return "updateDocumentTranslation";
    
    // Automatically strip 24-character IDs (assumed to be 24 based on examples)
    const pathParts = path.split("/");
    const cleanedPath = pathParts
      .filter((part) => !/^[0-9a-fA-F]{24}$/.test(part)) // Remove 24-character IDs
      .join("/");
    return cleanedPath || action; // Fallback to action if path is empty after cleaning
  };

  const formatDetails = (details: any, action: string) => {
    if (!details || typeof details !== "object") {
      return `Action: ${action}`;
    }
    const { path, method, message } = details;
    if (!path) return `Action: ${action} (Method: ${method || "unknown"})`;
    
    // Check for specific paths
    let cleanedPath = path.replace(/^\//, "");
    if (path.includes("updateEpassport")) {
      cleanedPath = "updateEpassport";
    } else if (path.includes("updateDocumentTranslation")) {
      cleanedPath = "updateDocumentTranslation";
    } else {
      // Automatically strip 24-character IDs
      const pathParts = cleanedPath.split("/");
      cleanedPath = pathParts
        .filter((part) => !/^[0-9a-fA-F]{24}$/.test(part)) // Remove 24-character IDs
        .join("/");
    }
    return message || `${cleanedPath || action} (${method || "unknown"})`;
  };

  const getRelativeTime = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMs = now.getTime() - time.getTime();
    const diffInSeconds = Math.floor(diffInMs / 1000);
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInSeconds < 60) return "just now";
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`;
    if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`;
    return time.toLocaleDateString();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Recent Activity</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <XCircle className="h-6 w-6" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              placeholder="Search by username or action..."
              value={searchQuery}
              onChange={handleSearch}
              className="pl-10 w-full border-gray-200 focus:border-blue-500 focus:ring-blue-100 rounded-lg py-2 text-gray-700"
            />
          </div>
        </div>

        {/* Activity List */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <svg
              className="h-8 w-8 text-blue-500 animate-spin"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span className="ml-3 text-gray-600 text-lg">Loading...</span>
          </div>
        ) : error ? (
          <div className="text-center py-12 text-red-600 bg-red-50 rounded-lg">
            <p className="text-lg">{error}</p>
            <Button
              onClick={() => fetchRecentActivity(page, searchQuery)}
              variant="outline"
              className="mt-4"
            >
              Retry
            </Button>
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-12 text-gray-500 text-lg">
            No recent activity found.
          </div>
        ) : (
          <div className="space-y-6">
            {logs
              .map((log) => {
                const iconData = getActionIcon(log.details, log.action);
                return iconData ? { ...log, iconData } : null;
              })
              .filter((log) => log !== null)
              .map((log) => {
                const { icon, bgColor } = log.iconData as { icon: React.ReactNode; bgColor: string };
                return (
                  <div key={log._id} className="flex items-start gap-4">
                    <div className={`rounded-full p-2 ${bgColor}`}>
                      {icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-gray-900">
                        {getPathHeading(log.details, log.action)}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {log.userName} ({log.userType}) - {formatDetails(log.details, log.action)}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {getRelativeTime(log.timestamp)}
                      </p>
                    </div>
                  </div>
                );
              })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center mt-6">
            <Button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              variant="outline"
              className="flex items-center gap-2"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Previous
            </Button>
            <span className="text-sm text-gray-600">Page {page} of {totalPages}</span>
            <Button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              variant="outline"
              className="flex items-center gap-2"
            >
              Next
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentActivity;