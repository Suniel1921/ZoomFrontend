import { useForm } from "react-hook-form";
import { X } from "lucide-react";
import Button from "../../components/Button";
import Input from "../../components/Input";
import SearchableSelect from "../../components/SearchableSelect";
import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { DESIGN_TYPES } from "../../constants/designTypes";

interface EditDesignJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  fetchGraphicDesignJobs: () => void;
  job: any; // You can replace 'any' with a more specific type if needed
}

export default function EditDesignJobModal({
  isOpen,
  onClose,
  job,
  fetchGraphicDesignJobs,
}: EditDesignJobModalProps) {
  const [clients, setClients] = useState<any[]>([]);

  const { register, handleSubmit, watch, setValue } = useForm({
    defaultValues: {
      ...job,
    },
  });

  const amount = watch("amount") || 0;
  const advancePaid = watch("advancePaid") || 0;
  const dueAmount = amount - advancePaid;

  const clientId = watch("clientId");
  const selectedClient = clients.find((c) => c.id === clientId);

  const [handlers, setHandlers] = useState<{ id: string; name: string }[]>([]);

  // Fetch the handlers (admins) from the API
  useEffect(() => {
    const fetchHandlers = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_REACT_APP_URL}/api/v1/admin/getAllAdmin`
        );
        setHandlers(response.data.admins);
      } catch (error: any) {
        console.error("Failed to fetch handlers:", error);
        toast.error(error.response.data.message);
      }
    };

    fetchHandlers();
  }, []);

  //get all clients list in drop down
  useEffect(() => {
    if (isOpen) {
      axios
        .get(`${import.meta.env.VITE_REACT_APP_URL}/api/v1/client/getClient`)
        .then((response) => {
          const clientsData = response?.data?.clients;
          setClients(Array.isArray(clientsData) ? clientsData : [clientsData]);
        })
        .catch((error) => {
          console.error("Error fetching clients:", error);
          setClients([]); // Set clients to an empty array in case of error
        });
    }
  }, [isOpen]);

  const onSubmit = (data: any) => {
    // Directly use the clientId from the form data
    const clientId = data.clientId;

    // Ensure that 'deadline' is valid, if provided
    let deadline;
    if (data.deadline) {
      deadline = new Date(data.deadline);
      if (isNaN(deadline.getTime())) {
        console.error("Invalid deadline:", data.deadline);
        deadline = new Date(); // Fallback to current date if invalid
      }
    } else {
      deadline = new Date(); // Default to current date if no deadline
    }

    // Ensure that 'date' is valid, if provided
    let date;
    if (data.date) {
      date = new Date(data.date);
      if (isNaN(date.getTime())) {
        console.error("Invalid date:", data.date);
        date = new Date(); // Fallback to current date if invalid
      }
    } else {
      date = new Date(); // Default to current date if no date
    }

    // Send the update request to the backend
    axios
      .put(
        `${
          import.meta.env.VITE_REACT_APP_URL
        }/api/v1/graphicDesign/updateGraphicDesign/${job._id}`,
        {
          ...data,
          date: date.toISOString(), // Ensure valid date format
          deadline: deadline.toISOString(), // Ensure valid deadline format
        }
      )
      .then((response) => {
        console.log("Design job updated successfully", response.data);
        toast.success(response.data.message);
        fetchGraphicDesignJobs(); // Fetch updated graphic design jobs
        onClose(); // Close the modal after successful update
      })
      .catch((error: any) => {
        console.error("Error updating design job:", error);
        const errorMessage =
          error.response?.data?.message ||
          "An unexpected error occurred. Please try again later.";
        toast.error(errorMessage);
      });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Edit Design Job</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            {/* <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700">Client</label>
              <SearchableSelect
                options={clients.map(client => ({
                  value: client.id,
                  label: client.name
                }))}
                value={watch('clientId')}
                onChange={(value) => {
                  setValue('clientId', value);
                  const client = clients.find(c => c.id === value);
                  if (client) {
                    setValue('mobileNo', client.phone);
                  }
                }}
                placeholder="Select client"
                className="mt-1"
              />
            </div> */}

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Business Name
              </label>
              <Input {...register("businessName")} className="mt-1" />
            </div>

            {/* <div>
              <label className="block text-sm font-medium text-gray-700">Mobile Number</label>
              <Input 
                value={selectedClient?.phone || ''}
                className="mt-1 bg-gray-50" 
                disabled 
              />
            </div> */}

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Landline Number
              </label>
              <Input {...register("landlineNo")} className="mt-1" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Design Type
              </label>
              <select
                {...register("designType")}
                className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm transition-colors duration-200 placeholder:text-gray-500 focus:border-brand-yellow focus:outline-none focus:ring-2 focus:ring-brand-yellow/20 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500 mt-1"
              >
                {DESIGN_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* Handled By */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Handled By
              </label>
              <select
                {...register("handledBy")}
                value={watch("handledBy") || fetchGraphicDesignJobs.handledBy} // Ensure the initial value is set
                onChange={(e) => setValue("handledBy", e.target.value)} // Sync changes with the form
                className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm transition-colors duration-200 placeholder:text-gray-500 focus:border-brand-yellow focus:outline-none focus:ring-2 focus:ring-brand-yellow/20 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500 mt-1"
              >
                <option value="">Select handler</option>
                {handlers.map((handler) => (
                  <option key={handler.id} value={handler.id}>
                    {handler.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700">
                Address
              </label>
              <Input {...register("address")} className="mt-1" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Amount (¥)
              </label>
              <Input
                type="number"
                min="0"
                {...register("amount", { valueAsNumber: true })}
                className="mt-1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Advance Paid (¥)
              </label>
              <Input
                type="number"
                min="0"
                {...register("advancePaid", { valueAsNumber: true })}
                className="mt-1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Due Amount (¥)
              </label>
              <Input
                type="number"
                value={dueAmount}
                className="mt-1 bg-gray-50"
                disabled
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Job Status
              </label>
              <select
                {...register("status")}
                className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm transition-colors duration-200 placeholder:text-gray-500 focus:border-brand-yellow focus:outline-none focus:ring-2 focus:ring-brand-yellow/20 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500 mt-1"
              >
                <option value="Processing">Processing</option>
                <option value="Waiting for Payment">Waiting for Payment</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700">
                Remarks
              </label>
              <textarea
                {...register("remarks")}
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-yellow focus:ring-brand-yellow"
                placeholder="Add any additional notes..."
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
