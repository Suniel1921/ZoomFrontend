import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X } from "lucide-react";
import Button from "../../components/Button";
import Input from "../../components/Input";
import SearchableSelect from "../../components/SearchableSelect";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import PaymentSection from "./components/PaymentSection";
import axios from "axios";
import toast from "react-hot-toast";
import { addDays } from "date-fns";
import type { ApplicationFormData } from "./types";

const applicationSchema = z.object({
  // Client Information
  clientId: z.string().min(1, "Client is required"),
  mobileNo: z.string(),
  date: z.date({ required_error: "Start date is required" }),
  deadline: z.date({ required_error: "Deadline is required" }),
  handledBy: z.string().min(1, "Handler is required"),
  status: z.string().min(1, "Status is required"),
  package: z.enum(["Standard Package", "Premium Package"], {
    required_error: "Package is required",
  }),
  noOfApplicants: z.number().min(1, "Number of applicants must be at least 1"),
  reasonForVisit: z.enum(
    ["General Visit", "Baby Care", "Program Attendance", "Other"],
    { required_error: "Reason for visit is required" }
  ),
  otherReason: z.string().optional(),
  
  // Financial Details
  amount: z.number().min(0, "Amount must be 0 or greater"),
  paidAmount: z.number().min(0, "Paid amount must be 0 or greater"),
  discount: z.number().min(0, "Discount must be 0 or greater"),
  deliveryCharge: z.number().min(0, "Delivery charge must be 0 or greater"),
  dueAmount: z.number(),
  paymentStatus: z.enum(["Due", "Paid"], {
    required_error: "Payment status is required",
  }),
  paymentMethod: z.enum(
    ["Bank Furicomy", "Counter Cash", "Credit Card", "Paypay", "Line Pay"],
    { required_error: "Payment method is required" }
  ),
  modeOfDelivery: z.enum(
    ["Office Pickup", "PDF", "Normal Delivery", "Blue Letterpack", "Red Letterpack"],
    { required_error: "Mode of delivery is required" }
  ),

  // Additional Information
  // notes: z.string().min(1, "Notes are required").max(500, "Notes must be less than 500 characters"),
});

interface AddApplicationModalProps {
  isOpen: boolean;
  fetchApplications: () => void;
  onClose: () => void;
}

export default function AddApplicationModal({
  isOpen,
  onClose,
  fetchApplications,
}: AddApplicationModalProps) {
  const [clients, setClients] = useState<any[]>([]);
  const [handlers, setHandlers] = useState<{ id: string; name: string }[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      date: new Date(),
      deadline: addDays(new Date(), 1),
      package: "Standard Package",
      noOfApplicants: 1,
      amount: 0,
      paidAmount: 0,
      discount: 0,
      deliveryCharge: 0,
      dueAmount: 0,
      paymentStatus: "Due",
      modeOfDelivery: "Office Pickup",
      reasonForVisit: "General Visit",
      status: "Processing",
    },
  });

  const clientId = watch("clientId");
  const selectedClient = clients.find((c) => c._id === clientId);

  // Common styles for form elements
  const inputStyles = "w-full rounded-md border border-gray-300 shadow-sm focus:border-brand-yellow focus:ring-1 focus:ring-brand-yellow h-10 px-3";
  const selectStyles = "w-full rounded-md border border-gray-300 shadow-sm focus:border-brand-yellow focus:ring-1 focus:ring-brand-yellow h-10 px-3";
  const datePickerStyles = "w-full rounded-md border border-gray-300 shadow-sm focus:border-brand-yellow focus:ring-1 focus:ring-brand-yellow h-10 px-3";
  const textareaStyles = "w-full rounded-md border border-gray-300 shadow-sm focus:border-brand-yellow focus:ring-1 focus:ring-brand-yellow p-3 min-h-[100px]";
  const labelStyles = "block text-sm font-medium text-gray-700 mb-1";
  const errorStyles = "text-sm text-red-600 mt-1";

  useEffect(() => {
    const fetchHandlers = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_REACT_APP_URL}/api/v1/admin/getAllAdmin`
        );
        setHandlers(response.data.admins);
      } catch (error: any) {
        console.error("Failed to fetch handlers:", error);
        toast.error(error.response?.data?.message || "Failed to fetch handlers");
      }
    };

    if (isOpen) {
      fetchHandlers();
    }
  }, [isOpen]);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_REACT_APP_URL}/api/v1/client/getClient`
        );
        const clientsData = response.data.clients;
        setClients(Array.isArray(clientsData) ? clientsData : [clientsData]);
      } catch (error) {
        console.error("Error fetching clients:", error);
        setClients([]);
      }
    };

    if (isOpen) {
      fetchClients();
    }
  }, [isOpen]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      const client = clients.find((c) => c._id === data.clientId);
      if (!client) {
        toast.error("Please select a client");
        return;
      }

      const payload = {
        ...data,
        clientName: client.name,
        clientPhone: client.phone,
        submissionDate: new Date().toISOString(),
      };

      const response = await axios.post(
        `${import.meta.env.VITE_REACT_APP_URL}/api/v1/japanVisit/createJapanVisitApplication`,
        payload
      );

      if (response.data.success) {
        reset();
        onClose();
        toast.success("Application created successfully!");
        fetchApplications();
      } else {
        toast.error(response.data.message || "Failed to create application");
      }
    } catch (error: any) {
      console.error("Error creating application:", error);
      toast.error(error.response?.data?.message || "Error creating application");
    }
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">New Japan Visit Application</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-8">
          {/* Client Information Section */}
          <div className="space-y-6">
            <h3 className="text-lg font-medium border-b pb-2">Client Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700">Client *</label>
                <SearchableSelect
                  options={clients.map((client) => ({
                    value: client._id,
                    label: client.name,
                  }))}
                  value={watch("clientId")}
                  onChange={(value) => {
                    setValue("clientId", value);
                    const client = clients.find((c) => c._id === value);
                    if (client) {
                      setValue("mobileNo", client.phone);
                    }
                  }}
                  placeholder="Select client" style={{ paddingLeft: "30px" }} le
                  
                />
                {errors.clientId && (
                  <p className={errorStyles}>{errors.clientId.message}</p>
                )}
              </div>              

              <div className="space-y-1">
                <label className={labelStyles}>Mobile No</label>
                <input
                  value={selectedClient?.phone || ""}
                  className={`${inputStyles} bg-gray-50`}
                  disabled
                />
              </div>

              <div className="space-y-1">
                <label className={labelStyles}>Project Start Date *</label>
                <DatePicker
                  selected={watch("date")}
                  onChange={(date) => setValue("date", date as Date)}
                  className={datePickerStyles}
                  dateFormat="yyyy-MM-dd"
                  minDate={new Date()}
                />
                {errors.date && (
                  <p className={errorStyles}>{errors.date.message}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className={labelStyles}>Handled By *</label>
                <select
                  {...register("handledBy")}
                  className={selectStyles}
                >
                  <option value="">Select handler</option>
                  {handlers.map((handler) => (
                    <option key={handler.id} value={handler.name}>
                      {handler.name}
                    </option>
                  ))}
                </select>
                {errors.handledBy && (
                  <p className={errorStyles}>{errors.handledBy.message}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className={labelStyles}>Job Status *</label>
                <select
                  {...register("status")}
                  className={selectStyles}
                >
                 <option value="Processing">Processing</option>
                  <option value="Waiting for Payment">Waiting for Payment</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
                {errors.status && (
                  <p className={errorStyles}>{errors.status.message}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className={labelStyles}>Deadline *</label>
                <DatePicker
                  selected={watch("deadline")}
                  onChange={(date) => setValue("deadline", date as Date)}
                  className={datePickerStyles}
                  dateFormat="yyyy-MM-dd"
                  minDate={addDays(new Date(), 1)}
                />
                {errors.deadline && (
                  <p className={errorStyles}>{errors.deadline.message}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className={labelStyles}>Package *</label>
                <select
                  {...register("package")}
                  className={selectStyles}
                >
                  <option value="Standard Package">Standard Package</option>
                  <option value="Premium Package">Premium Package</option>
                </select>
                {errors.package && (
                  <p className={errorStyles}>{errors.package.message}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className={labelStyles}>No of Applicants *</label>
                <input
                  type="number"
                  min="1"
                  {...register("noOfApplicants", { valueAsNumber: true })}
                  className={inputStyles}
                />
                {errors.noOfApplicants && (
                  <p className={errorStyles}>{errors.noOfApplicants.message}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className={labelStyles}>Project Reason *</label>
                <select
                  {...register("reasonForVisit")}
                  className={selectStyles}
                >
                  <option value="General Visit">General Visit</option>
                  <option value="Baby Care">Baby Care</option>
                  <option value="Program Attendance">Program Attendance</option>
                  <option value="Other">Other</option>
                </select>
                {errors.reasonForVisit && (
                  <p className={errorStyles}>{errors.reasonForVisit.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Financial Details Section */}
          <div className="space-y-6">
            <h3 className="text-lg font-medium border-b pb-2">Financial Details</h3>
            <PaymentSection
              register={register}
              watch={watch}
              setValue={setValue}
              errors={errors}
              inputStyles={inputStyles}
              selectStyles={selectStyles}
              labelStyles={labelStyles}
              errorStyles={errorStyles}
            />
          </div>

          {/* Notes Section */}
          <div className="space-y-6">
            <h3 className="text-lg font-medium border-b pb-2">Notes</h3>
            <div className="space-y-1">
              <label className={labelStyles}>Notes </label>
              <textarea
                {...register("notes")}
                className={textareaStyles}
                placeholder="Add any additional notes..."
              />
              {errors.notes && (
                <p className={errorStyles}>{errors.notes.message}</p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              Create Application
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

