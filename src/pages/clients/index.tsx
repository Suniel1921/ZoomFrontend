
import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
  Users,
  Plus,
  Pencil,
  Trash2,
  Mail,
  Phone,
  Upload,
  Eye,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Input from "../../components/Input";
import Button from "../../components/Button";
import AddClientModal from "./AddClientModal";
import EditClientModal from "./EditClientModal";
import ImportClientsModal from "./ImportClientsModal";
import PrintAddressButton from "../../components/PrintAddressButton";
import CategoryBadge from "../../components/CategoryBadge";
import axios from "axios";
import type { Client, ClientCategory } from "../../types";
import toast from "react-hot-toast";
import { useAuthGlobally } from "../../context/AuthContext";

const ITEMS_PER_PAGE = 20;

export default function ClientsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<ClientCategory | "all">("all");
  const [selectedStatus, setSelectedStatus] = useState<"all" | "active" | "inactive">("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [allClients, setAllClients] = useState<Client[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [auth] = useAuthGlobally();

  const categories: ClientCategory[] = [
    "Visit Visa Applicant",
    "Japan Visit Visa Applicant",
    "Document Translation",
    "Student Visa Applicant",
    "Epassport Applicant",
    "Japan Visa",
    "General Consultation",
  ];

  const getAllClients = useCallback(async (forceRefresh = false) => {
    try {
      setLoading(true)
      const response = await axios.get(`${import.meta.env.VITE_REACT_APP_URL}/api/v1/client/getClient`, {
        params: { forceRefresh },
      })
      if (response.data.success) {
        setAllClients(response.data.clients)
      } else {
        throw new Error("Unexpected response format")
      }
    } catch (error: any) {
      if (error.response) {
        toast.error(error.response.data.message)
        setError("Failed to fetch clients.")
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    getAllClients()
  }, [getAllClients])




  // Helper function to calculate relevance score
  const calculateRelevanceScore = useCallback((client: Client, query: string) => {
    const lowercaseQuery = query.toLowerCase()
    let score = 0

    if (client.name.toLowerCase() === lowercaseQuery) {
      score += 100 // Exact match for name
    } else if (client.name.toLowerCase().startsWith(lowercaseQuery)) {
      score += 75 // Name starts with query
    } else if (client.name.toLowerCase().includes(lowercaseQuery)) {
      score += 50 // Name contains query
    }

    if (client.email.toLowerCase().includes(lowercaseQuery)) {
      score += 25 // Email contains query
    }

    if (client.phone.includes(query)) {
      score += 25 // Phone contains query
    }

    return score
  }, [])

  // Memoized filtered and sorted clients based on search, category, and status
  const filteredAndSortedClients = useMemo(() => {
    return allClients
      .filter((client) => {
        const matchesCategory = selectedCategory === "all" || client.category === selectedCategory
        const matchesStatus = selectedStatus === "all" || client.status === selectedStatus
        const matchesSearch =
          searchQuery === "" ||
          (client.name && client.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (client.email && client.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (client.phone && client.phone.includes(searchQuery))

        return matchesCategory && matchesStatus && matchesSearch
      })
      .sort((a, b) => {
        if (searchQuery) {
          return calculateRelevanceScore(b, searchQuery) - calculateRelevanceScore(a, searchQuery)
        }
        return 0 // Don't change order if no search query
      })
  }, [allClients, selectedCategory, selectedStatus, searchQuery, calculateRelevanceScore])

  // Calculate pagination
  const totalPages = Math.ceil(filteredAndSortedClients.length / ITEMS_PER_PAGE)
  const paginatedClients = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredAndSortedClients.slice(startIndex, startIndex + ITEMS_PER_PAGE)
  }, [filteredAndSortedClients, currentPage])

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, selectedCategory, selectedStatus])





  const handleDeletes = async (_id: string) => {
    if (window.confirm("Are you sure you want to delete this client?")) {
      try {
        const response = await axios.delete(
          `${import.meta.env.VITE_REACT_APP_URL}/api/v1/client/deleteClient/${_id}`
        );
        toast.success(response.data.message);
        getAllClients();
      } catch (error) {
        toast.error("Failed to delete client.");
      }
    }
  };

  const formatPhoneForViber = (phone: string) => {
    if (!phone) return "";
    return phone.replace(/\D/g, "");
  };

  const downloadClientDetails = useCallback((client: Client) => {
    const clientDetails = `
    〒${client.postalCode}
    ${client.prefecture}, ${client.city}, ${client.street} ${client.building}
    ${client.name}様
    ${client.phone}
    `;
    const blob = new Blob([clientDetails], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${client.name}_details.txt`;
    link.click();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Users className="h-6 w-6 text-gray-400" />
            <h1 className="text-xl font-semibold text-gray-900">
              Clients ({filteredAndSortedClients.length} total)
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as ClientCategory | "all")}
              className="flex h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm transition-colors duration-200 placeholder:text-gray-500 focus:border-brand-yellow focus:outline-none focus:ring-2 focus:ring-brand-yellow/20 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500 w-64"
            >
              <option value="all">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as "all" | "active" | "inactive")}
              className="flex h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm transition-colors duration-200 placeholder:text-gray-500 focus:border-brand-yellow focus:outline-none focus:ring-2 focus:ring-brand-yellow/20 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500 w-64"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>

            <div className="relative">
              <Input
                type="search"
                placeholder="Search clients..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64"
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={() => setIsAddModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                New Client
              </Button>

              <Button variant="outline" onClick={() => setIsImportModalOpen(true)}>
                <Upload className="h-4 w-4 mr-2" />
                Import
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Clients List */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200">
        <div className="overflow-x-auto">
          {loading && (
            <div className="text-center py-4">Loading clients...</div>
          )}
          {error && (
            <div className="text-center py-4 text-red-500">{error}</div>
          )}
          {!loading && !error && filteredAndSortedClients.length === 0 && (
            <div className="text-center py-4">No clients found.</div>
          )}

          {!loading && !error && filteredAndSortedClients.length > 0 && (
            <>
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedClients.map((client) => (
                    <tr key={client._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          {client.profilePhoto ? (
                            <img
                              src={client.profilePhoto}
                              alt={client.name}
                              className="h-10 w-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-brand-yellow/10 flex items-center justify-center">
                              <span className="text-brand-black font-medium">
                                {client.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </span>
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-brand-black">
                              {client.name}
                            </p>
                            <p className="text-sm text-gray-500">
                              {client.nationality}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-gray-400" />
                            <span>{client.email}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-gray-400" />
                            <span>
                              <a
                                href={`viber://chat?number=${formatPhoneForViber(
                                  client.phone
                                )}`}
                                className="text-brand-black hover:text-brand-yellow"
                              >
                                {client.phone.length > 10
                                  ? `${client.phone.slice(0, 11)}...`
                                  : client.phone}
                              </a>
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <CategoryBadge
                          category={client.category || "import from CSV file"}
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            client.status === "active"
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {client.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          <PrintAddressButton client={client} />
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => downloadClientDetails(client)}
                            className="text-yellow-500 hover:text-yellow-700"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedClient(client);
                              setIsEditModalOpen(true);
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>

                          {auth.user.role === "superadmin" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeletes(client._id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination */}
              <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200">
                <div className="flex-1 flex justify-between sm:hidden">
                  <Button
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    variant="outline"
                  >
                    Previous
                  </Button>
                  <Button
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    variant="outline"
                  >
                    Next
                  </Button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing{" "}
                      <span className="font-medium">
                        {(currentPage - 1) * ITEMS_PER_PAGE + 1}
                      </span>{" "}
                      to{" "}
                      <span className="font-medium">
                        {Math.min(currentPage * ITEMS_PER_PAGE, filteredAndSortedClients.length)}
                      </span>{" "}
                      of{" "}
                      <span className="font-medium">{filteredAndSortedClients.length}</span>{" "}
                      results
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      variant="outline"
                      size="sm"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    <Button
                      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      variant="outline"
                      size="sm"
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Modals */}
      <AddClientModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        getAllClients={getAllClients}
      />

      {selectedClient && (
        <EditClientModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedClient(null);
          }}
          getAllClients={getAllClients}
          client={selectedClient}
        />
      )}

      <ImportClientsModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        getAllClients={getAllClients}
      />
    </div>
  );
}

