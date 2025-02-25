import { useForm } from "react-hook-form";
import { X } from "lucide-react";
import Button from "../../components/Button";
import Input from "../../components/Input";
import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { DESIGN_TYPES } from "../../constants/designTypes";

interface EditDesignJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  fetchGraphicDesignJobs: () => void;
  job: any; // Replace 'any' with a proper interface if possible
}

interface FormData {
  businessName: string;
  landlineNo: string;
  designType: string;
  handledBy: string;
  address: string;
  amount: number;
  advancePaid: number;
  status: string;
  remarks: string;
  deadline?: string;
  date?: string;
}

export default function EditDesignJobModal({
  isOpen,
  onClose,
  job,
  fetchGraphicDesignJobs,
}: EditDesignJobModalProps) {
  const [handlers, setHandlers] = useState<{ id: string; name: string }[]>([]);

  const { register, handleSubmit, watch, setValue } = useForm<FormData>({
    defaultValues: {
      ...job,
      amount: job.amount || 0,
      advancePaid: job.advancePaid || 0,
    },
  });

  const amount = watch("amount", 0);
  const advancePaid = watch("advancePaid", 0);
  const dueAmount = amount - advancePaid;

  // Automatically update status based on due amount
  useEffect(() => {
    const newStatus = dueAmount === 0 ? "Paid" : "Due";
    setValue("status", newStatus);
  }, [amount, advancePaid, setValue]);

  // Fetch handlers (admins) from the API
  useEffect(() => {
    const fetchHandlers = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_REACT_APP_URL}/api/v1/admin/getAllAdmin`
        );
        setHandlers(response.data.admins || []);
      } catch (error: any) {
        console.error("Failed to fetch handlers:", error);
        toast.error(error.response?.data?.message || "Failed to load handlers.");
      }
    };

    if (isOpen) fetchHandlers();
  }, [isOpen]);

  const onSubmit = async (data: FormData) => {
    try {
      const date = data.date ? new Date(data.date) : new Date();
      const deadline = data.deadline ? new Date(data.deadline) : new Date();

      if (isNaN(date.getTime())) throw new Error("Invalid date");
      if (isNaN(deadline.getTime())) throw new Error("Invalid deadline");

      const response = await axios.put(
        `${import.meta.env.VITE_REACT_APP_URL}/api/v1/graphicDesign/updateGraphicDesign/${job._id}`,
        {
          ...data,
          date: date.toISOString(),
          deadline: deadline.toISOString(),
        }
      );

      toast.success(response.data.message || "Design job updated successfully");
      fetchGraphicDesignJobs();
      onClose();
    } catch (error: any) {
      console.error("Error updating design job:", error);
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to update design job."
      );
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Edit Design Job</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Business Name
              </label>
              <Input {...register("businessName")} className="mt-1" />
            </div>

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
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-yellow focus:ring-brand-yellow"
              >
                {DESIGN_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Handled By
              </label>
              <select
                {...register("handledBy")}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-yellow focus:ring-brand-yellow"
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
                Paid (¥)
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
                Payment Status
              </label>
              <Input
                value={dueAmount === 0 ? "Paid" : "Due"}
                className="mt-1 bg-gray-50"
                disabled
              />
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
            <Button type="submit">Update Changes</Button>
          </div>
        </form>
      </div>
    </div>
  );
}