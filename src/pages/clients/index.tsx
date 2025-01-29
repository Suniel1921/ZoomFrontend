import { useState, useMemo, useEffect } from "react";
import {
  Users,
  Plus,
  Pencil,
  Trash2,
  Mail,
  Phone,
  Upload,
  Eye,
} from "lucide-react";
import Input from "../../components/Input";
import Button from "../../components/Button";
import { useAdminStore } from "../../store/adminStore";
import AddClientModal from "./AddClientModal";
import EditClientModal from "./EditClientModal";
import ImportClientsModal from "./ImportClientsModal";
import PrintAddressButton from "../../components/PrintAddressButton";
import CategoryBadge from "../../components/CategoryBadge";
import axios from "axios";
import type { Client, ClientCategory } from "../../types";
import toast from "react-hot-toast";
import CSVUpload from "./CSVUpload";
import { useAuthGlobally } from "../../context/AuthContext";

export default function ClientsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<
    ClientCategory | "all"
  >("all");
  const [selectedStatus, setSelectedStatus] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
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

  const getAllClients = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_REACT_APP_URL}/api/v1/client/getClient`
      );
      console.log("client data is ", response)
      if (response.data.success) {
        setClients(response.data.clients);
        console.log("client data is", response);
        // toast.success('client fetched successfully');
      } else {
        throw new Error("Unexpected response format");
      }
    } catch (error: any) {
      if (error.response) {
        toast.error(error.response.data.message);
        setError("Failed to fetch clients.");
      }
    }
  };

  useEffect(() => {
    getAllClients();
  }, []);

  const filteredClients = useMemo(() => {
    if (!Array.isArray(clients)) return [];
    return clients.filter(
      (client) =>
        (selectedCategory === "all" || client.category === selectedCategory) &&
        (selectedStatus === "all" || client.status === selectedStatus) &&
        (searchQuery === "" ||
          client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          client.email.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [clients, selectedCategory, selectedStatus, searchQuery]);

  const handleDeletes = async (_id: string) => {
    if (window.confirm("Are you sure you want to delete this client?")) {
      try {
        const response = await axios.delete(
          `${
            import.meta.env.VITE_REACT_APP_URL
          }/api/v1/client/deleteClient/${_id}`
        );
        toast.success(response.data.message);
        getAllClients();
      } catch (error) {
        toast.error("Failed to delete client.");
      }
    }
  };

  // const formatPhoneForViber = (phone: string) => phone.replace(/\D/g, '');
  const formatPhoneForViber = (phone: string) => {
    if (!phone) {
      return ""; // Return an empty string if phone is undefined or null
    }
    return phone.replace(/\D/g, ""); // Only apply .replace if phone is defined
  };

  const downloadClientDetails = (client: Client) => {
    // Format the client details as a string
    const clientDetails = `
    〒${client.postalCode}
    ${client.prefecture}, ${client.city}, ${client.street} ${client.building}
    ${client.name}様
    ${client.phone}
    `;

    // Create a Blob object with the formatted details
    const blob = new Blob([clientDetails], { type: "text/plain" });

    // Create an anchor element to trigger the file download
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${client.name}_details.txt`;

    // Programmatically click the link to trigger the download
    link.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Users className="h-6 w-6 text-gray-400" />
            <h1 className="text-xl font-semibold text-gray-900">Clients</h1>
          </div>

          <div className="flex items-center gap-4">
            <select
              value={selectedCategory}
              onChange={(e) =>
                setSelectedCategory(e.target.value as ClientCategory | "all")
              }
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
              onChange={(e) =>
                setSelectedStatus(
                  e.target.value as "all" | "active" | "inactive"
                )
              }
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
            {/* ******testing csv file****** */}
            <div>
              {/* <CSVUpload/> */}
              {/* <ImportClientsModal/> */}
            </div>

            <div className="flex gap-2">
              <Button onClick={() => setIsAddModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                New Client
              </Button>

              <Button
                variant="outline"
                onClick={() => setIsImportModalOpen(true)}
              >
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
          {!loading && !error && filteredClients.length === 0 && (
            <div className="text-center py-4">No clients found.</div>
          )}

          {!loading && !error && filteredClients.length > 0 && (
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
                {filteredClients.map((client) => (
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
      href={`viber://chat?number=${formatPhoneForViber(client.phone)}`}
      className="text-brand-black hover:text-brand-yellow"
    >
      {client.phone.length > 10 ? `${client.phone.slice(0, 10)}...` : client.phone}
    </a>
  </span>
</div>

                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <CategoryBadge category={client.category || 'import from CSV file'} />
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
