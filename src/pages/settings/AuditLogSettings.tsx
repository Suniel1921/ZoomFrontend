"use client"

import { useState, useEffect } from "react"
import { Download, Filter, Trash2, ChevronLeft, ChevronRight } from "lucide-react"
import Button from "../../components/Button"
import Input from "../../components/Input"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import axios from "axios"

// Define action types and user types
const ACTION_TYPES = ["login", "logout", "create", "update", "delete", "import", "export", "view", "failed_login"]

const USER_TYPES = ["super_admin", "admin", "client"]

// Define labels for actions
const actionLabels = {
  login: "Login",
  logout: "Logout",
  create: "Create",
  update: "Update",
  delete: "Delete",
  import: "Import",
  export: "Export",
  view: "View",
  failed_login: "Failed Login",
}

export default function AuditLogSettings() {
  const [logs, setLogs] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedActions, setSelectedActions] = useState([])
  const [selectedUserTypes, setSelectedUserTypes] = useState([])
  const [dateRange, setDateRange] = useState([null, null])
  const [showFilters, setShowFilters] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const logsPerPage = 10
  const [expandedDetails, setExpandedDetails] = useState({})

  // Fetch logs when the component is mounted or when the page changes
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_REACT_APP_URL}/api/v1/logs/get-audit-log`, {
          params: {
            page: currentPage,
            limit: logsPerPage,
            // Add other filter parameters here
          },
        })
        if (response.data.logs && Array.isArray(response.data.logs)) {
          setLogs(response.data.logs)
          setTotalPages(Math.ceil(response.data.total / logsPerPage))
        } else {
          console.error("Unexpected data format:", response.data)
        }
      } catch (error) {
        console.error("Error fetching audit logs:", error)
      }
    }

    fetchLogs()
  }, [currentPage])

  // Filter logs based on search query, date range, actions, and user types
  const filteredLogs = logs
    .filter((log) => {
      // Apply date range filter
      if (dateRange[0] && new Date(log.timestamp) < dateRange[0]) return false
      if (dateRange[1] && new Date(log.timestamp) > dateRange[1]) return false

      // Apply action type filter
      if (selectedActions.length > 0 && !selectedActions.includes(log.action)) return false

      // Apply user type filter
      if (selectedUserTypes.length > 0 && !selectedUserTypes.includes(log.userType)) return false

      // Apply search query
      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase()
        return log.userName.toLowerCase().includes(searchLower) || log.details.toLowerCase().includes(searchLower)
      }

      return true
    })
    .sort((a, b) => {
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    })

  // Handle CSV export
  const handleExport = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_REACT_APP_URL}/api/v1/logs/exports-logs`, {
        params: { format: "csv" },
        responseType: "blob",
      })

      // Create a download link for the CSV file
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement("a")
      link.href = url
      link.setAttribute("download", `audit-logs-${new Date().toISOString().split("T")[0]}.csv`)
      document.body.appendChild(link)
      link.click()
    } catch (error) {
      console.error("Error exporting logs:", error)
    }
  }

  // Handle clearing all logs
  const handleClearLogs = async () => {
    if (window.confirm("Are you sure you want to clear all audit logs? This action cannot be undone.")) {
      try {
        await axios.delete(`${import.meta.env.VITE_REACT_APP_URL}/api/v1/logs/clear-all-logs`)
        setLogs([]) // Clear local state
      } catch (error) {
        console.error("Error clearing logs:", error)
      }
    }
  }

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage)
  }

  const toggleDetails = (logId) => {
    setExpandedDetails((prev) => ({
      ...prev,
      [logId]: !prev[logId],
    }))
  }

  const renderPageNumbers = () => {
    const pageNumbers = []
    const maxVisiblePages = 5
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2))
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1)
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(
        <Button
          key={i}
          className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
            i === currentPage
              ? "z-10 bg-indigo-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              : "text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-offset-0"
          }`}
          onClick={() => handlePageChange(i)}
        >
          {i}
        </Button>,
      )
    }

    return pageNumbers
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Audit Logs</h3>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
          <Button variant="outline" onClick={handleClearLogs} className="text-red-500 hover:text-red-700">
            <Trash2 className="h-4 w-4 mr-2" />
            Clear Logs
          </Button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Date Range Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Date Range</label>
              <div className="mt-1 flex gap-2">
                <DatePicker
                  selected={dateRange[0]}
                  onChange={(date) => setDateRange([date, dateRange[1]])}
                  selectsStart
                  startDate={dateRange[0]}
                  endDate={dateRange[1]}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-yellow focus:ring-brand-yellow"
                  placeholderText="Start Date"
                />
                <DatePicker
                  selected={dateRange[1]}
                  onChange={(date) => setDateRange([dateRange[0], date])}
                  selectsEnd
                  startDate={dateRange[0]}
                  endDate={dateRange[1]}
                  minDate={dateRange[0]}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-yellow focus:ring-brand-yellow"
                  placeholderText="End Date"
                />
              </div>
            </div>

            {/* Search Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Search</label>
              <Input
                type="search"
                placeholder="Search logs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="mt-1"
              />
            </div>

            {/* Action Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Actions</label>
              <div className="mt-1">
                {ACTION_TYPES.map((action) => (
                  <div key={action} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`action-${action}`}
                      checked={selectedActions.includes(action)}
                      onChange={() => {
                        setSelectedActions((prev) =>
                          prev.includes(action) ? prev.filter((item) => item !== action) : [...prev, action],
                        )
                      }}
                    />
                    <label htmlFor={`action-${action}`} className="ml-2">
                      {actionLabels[action]}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* User Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700">User Type</label>
              <div className="mt-1">
                {USER_TYPES.map((userType) => (
                  <div key={userType} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`userType-${userType}`}
                      checked={selectedUserTypes.includes(userType)}
                      onChange={() => {
                        setSelectedUserTypes((prev) =>
                          prev.includes(userType) ? prev.filter((item) => item !== userType) : [...prev, userType],
                        )
                      }}
                    />
                    <label htmlFor={`userType-${userType}`} className="ml-2">
                      {userType}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Logs Table */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200">
        {logs.length === 0 ? (
          <div className="p-6 text-center text-gray-500">No audit logs available.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Timestamp
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    IP Address
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {logs.map((log) => (
                  <tr key={log._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{log.userName}</div>
                      <div className="text-sm text-gray-500">{log.userType}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          log.action === "login" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {actionLabels[log.action] || log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {expandedDetails[log._id] ? (
                        <div>
                          {typeof log.details === "object" ? JSON.stringify(log.details, null, 2) : log.details}
                          <button
                            onClick={() => toggleDetails(log._id)}
                            className="ml-2 text-indigo-600 hover:text-indigo-900"
                          >
                            See less
                          </button>
                        </div>
                      ) : (
                        <div>
                          {typeof log.details === "object"
                            ? JSON.stringify(log.details).substring(0, 50)
                            : log.details.substring(0, 50)}
                          {(typeof log.details === "object" ? JSON.stringify(log.details) : log.details).length > 50 &&
                            "... "}
                          <button
                            onClick={() => toggleDetails(log._id)}
                            className="ml-2 text-indigo-600 hover:text-indigo-900"
                          >
                            See more
                          </button>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{log.ipAddress}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Improved Pagination */}
      <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
        <div className="flex flex-1 justify-between sm:hidden">
          <Button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Previous
          </Button>
          <Button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Next
          </Button>
        </div>
        <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Showing <span className="font-medium">{(currentPage - 1) * logsPerPage + 1}</span> to{" "}
              <span className="font-medium">{Math.min(currentPage * logsPerPage, logs.length)}</span> of{" "}
              <span className="font-medium">{logs.length}</span> results
            </p>
          </div>
          <div>
            <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
              <Button
                className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <span className="sr-only">Previous</span>
                <ChevronLeft className="h-5 w-5" aria-hidden="true" />
              </Button>
              {renderPageNumbers()}
              <Button
                className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                <span className="sr-only">Next</span>
                <ChevronRight className="h-5 w-5" aria-hidden="true" />
              </Button>
            </nav>
          </div>
        </div>
      </div>
    </div>
  )
}

