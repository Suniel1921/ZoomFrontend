import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { X } from "lucide-react";
import Button from "../../components/Button";
import Input from "../../components/Input";
import SearchableSelect from "../../components/SearchableSelect";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { PREFECTURES } from "../../constants/prefectures";
import axios from "axios";
import toast from "react-hot-toast";
import { EpassportApplication } from "../../types";

type EpassportFormData = {
  clientId: string;
  mobileNo: string;
  contactChannel: string;
  applicationType: string;
  ghumtiService: boolean;
  prefecture?: string;
  amount: number;
  paidAmount: number;
  dueAmount: number;
  discount: number;
  paymentStatus: string;
  paymentMethod?: string;
  applicationStatus: string;
  dataSentStatus: string;
  handledBy: string;
  date: Date;
  deadline: Date;
  remarks?: string;
};

interface AddEpassportModalProps {
  isOpen: boolean;
  getAllEPassportApplication: () => void;
  onClose: () => void;
}

export default function AddEpassportModal({
  isOpen,
  onClose,
  getAllEPassportApplication,
}: AddEpassportModalProps) {
  const [showPrefecture, setShowPrefecture] = useState(false);
  const [clients, setClients] = useState<any[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<EpassportFormData>({
    defaultValues: {
      ghumtiService: false,
      paymentStatus: "Due",
      applicationStatus: "Processing",
      dataSentStatus: "Not Sent",
      amount: 0,
      paidAmount: 0,
      dueAmount: 0,
      discount: 0,
      date: new Date(),
      deadline: new Date(),
    },
  });

  const ghumtiService = watch("ghumtiService");
  const amount = watch("amount") || 0;
  const paidAmount = watch("paidAmount") || 0;
  const discount = watch("discount") || 0;
  const dueAmount = amount - (paidAmount + discount);
  const [epassportApplications, setEpassportApplications] = useState<
    EpassportApplication[]
  >([]);
  
  const clientId = watch("clientId");
  const selectedClient = clients.find((c) => c._id === clientId);
  const [handlers, setHandlers] = useState<{ id: string; name: string }[]>([]);

  // Fetch the handlers (admins) from the API
  useEffect(() => {
    const fetchHandlers = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_REACT_APP_URL}/api/v1/admin/getAllAdmin`
        );
        setHandlers(response.data.admins || []);
      } catch (error: any) {
        console.error("Failed to fetch handlers:", error);
        toast.error(error.response?.data?.message || "Failed to fetch handlers.");
      }
    };

    fetchHandlers();
  }, []);

  // Fetch all clients
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
          setClients([]);
        });
    }
  }, [isOpen]);

  const onSubmit = async (data: EpassportFormData) => {
    try {
      console.log("Form Data Submitted:", data);

      const client = clients.find((c) => c._id === data.clientId);
      if (!client) {
        toast.error("Please Select Client Name");
        return;
      }

      // Clean up paymentMethod: omit if empty string
      const formData = {
        ...data,
        clientName: client.name,
        mobileNo: client.phone,
        date: data.date.toISOString(),
        deadline: data.deadline.toISOString(),
        dueAmount: amount - (paidAmount + discount),
        paymentMethod: data.paymentMethod === "" ? undefined : data.paymentMethod,
      };

      const response = await axios.post(
        `${import.meta.env.VITE_REACT_APP_URL}/api/v1/ePassport/createEpassport`,
        formData
      );
      if (response.data.success) {
        setEpassportApplications((prevApplications) => [
          ...prevApplications,
          response.data.data,
        ]);
        toast.success(response.data.message || "ePassport application created successfully!");
        reset();
        onClose();
        getAllEPassportApplication();
      }
    } catch (error: any) {
      console.error("Error creating ePassport application:", error.response?.data || error);
      toast.error(error.response?.data?.message || "Error creating application");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">New ePassport Application</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Client Information */}
          <div className="space-y-4">
            <h3 className="font-medium border-b pb-2">Client Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Client
                </label>
                <SearchableSelect
                  options={clients.map((client) => ({
                    value: client._id,
                    label: client.name,
                    clientData: { ...client, profilePhoto: client.profilePhoto },
                  }))}
                  value={watch("clientId")}
                  onChange={(value) => {
                    setValue("clientId", value);
                    const client = clients.find((c) => c._id === value);
                    if (client) {
                      setValue("mobileNo", client.phone);
                    }
                  }}
                  placeholder="Select client"
                  className="mt-1"
                  error={errors.clientId?.message}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Phone Number
                </label>
                <Input
                  value={selectedClient?.mobileNo || selectedClient?.phone || ""}
                  className="mt-1 bg-gray-50"
                  disabled
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Contact Channel
                </label>
                <select
                  {...register("contactChannel")}
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm transition-colors duration-200 placeholder:text-gray-500 focus:border-brand-yellow focus:outline-none focus:ring-2 focus:ring-brand-yellow/20 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500 mt-1"
                >
                  <option value="Viber">Viber</option>
                  <option value="Facebook">Facebook</option>
                  <option value="WhatsApp">WhatsApp</option>
                  <option value="Friend">Friend</option>
                  <option value="Office Visit">Office Visit</option>
                </select>
              </div>
            </div>
          </div>

          {/* Application Details */}
          <div className="space-y-4">
            <h3 className="font-medium border-b pb-2">Application Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Application Type
                </label>
                <select
                  {...register("applicationType")}
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm transition-colors duration-200 placeholder:text-gray-500 focus:border-brand-yellow focus:outline-none focus:ring-2 focus:ring-brand-yellow/20 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500 mt-1"
                >
                  <option value="Newborn Child">Newborn Child</option>
                  <option value="Passport Renewal">Passport Renewal</option>
                  <option value="Lost Passport">Lost Passport</option>
                  <option value="Damaged Passport">Damaged Passport</option>
                  <option value="Travel Document">Travel Document</option>
                  <option value="Birth Registration">Birth Registration</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Handled By
                </label>
                <select
                  {...register("handledBy", {
                    required: "This field is required",
                  })}
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm transition-colors duration-200 placeholder:text-gray-500 focus:border-brand-yellow focus:outline-none focus:ring-2 focus:ring-brand-yellow/20 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500 mt-1"
                >
                  <option value="">Select handler</option>
                  {handlers.map((handler) => (
                    <option key={handler.id} value={handler.name}>
                      {handler.name}
                    </option>
                  ))}
                </select>
                {errors.handledBy && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.handledBy.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Job Status
                </label>
                <select
                  {...register("applicationStatus")}
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm transition-colors duration-200 placeholder:text-gray-500 focus:border-brand-yellow focus:outline-none focus:ring-2 focus:ring-brand-yellow/20 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500 mt-1"
                >
                  <option value="Processing">Processing</option>
                  <option value="Waiting for Payment">Waiting for Payment</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Data Sent Status
                </label>
                <select
                  {...register("dataSentStatus")}
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm transition-colors duration-200 placeholder:text-gray-500 focus:border-brand-yellow focus:outline-none focus:ring-2 focus:ring-brand-yellow/20 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500 mt-1"
                >
                  <option value="Not Sent">Not Sent</option>
                  <option value="Sent">Sent</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Date
                </label>
                <DatePicker
                  selected={watch("date")}
                  onChange={(date) => setValue("date", date as Date)}
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm transition-colors duration-200 placeholder:text-gray-500 focus:border-brand-yellow focus:outline-none focus:ring-2 focus:ring-brand-yellow/20 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500 mt-1"
                  dateFormat="yyyy-MM-dd"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Deadline
                </label>
                <DatePicker
                  selected={watch("deadline")}
                  onChange={(date) => setValue("deadline", date as Date)}
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm transition-colors duration-200 placeholder:text-gray-500 focus:border-brand-yellow focus:outline-none focus:ring-2 focus:ring-brand-yellow/20 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500 mt-1"
                  dateFormat="yyyy-MM-dd"
                />
              </div>

              <div className="col-span-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    {...register("ghumtiService")}
                    onChange={(e) => {
                      setValue("ghumtiService", e.target.checked);
                      setShowPrefecture(e.target.checked);
                      if (!e.target.checked) {
                        setValue("prefecture", undefined);
                      }
                    }}
                    className="rounded border-gray-300 text-brand-yellow focus:ring-brand-yellow"
                  />
                  <span className="text-sm text-gray-700">Ghumti Service</span>
                </label>
              </div>

              {ghumtiService && (
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Prefecture
                  </label>
                  <select
                    {...register("prefecture")}
                    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm transition-colors duration-200 placeholder:text-gray-500 focus:border-brand-yellow focus:outline-none focus:ring-2 focus:ring-brand-yellow/20 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500 mt-1"
                  >
                    <option value="">Select prefecture</option>
                    {PREFECTURES.map((prefecture) => (
                      <option key={prefecture} value={prefecture}>
                        {prefecture}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Payment Details */}
          <div className="space-y-4">
            <h3 className="font-medium border-b pb-2">Payment Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Amount (¥)
                </label>
                <Input
                  type="number"
                  min="0"
                  {...register("amount", {
                    valueAsNumber: true,
                  })}
                  className="mt-1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Paid Amount (¥)
                </label>
                <Input
                  type="number"
                  min="0"
                  {...register("paidAmount", {
                    valueAsNumber: true,
                  })}
                  className="mt-1"
                  onChange={(e) => {
                    const paid = parseFloat(e.target.value) || 0;
                    setValue("paidAmount", paid);
                  }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Discount (¥)
                </label>
                <Input
                  type="number"
                  min="0"
                  {...register("discount", {
                    valueAsNumber: true,
                  })}
                  className="mt-1"
                  onChange={(e) => {
                    const disc = parseFloat(e.target.value) || 0;
                    setValue("discount", disc);
                  }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Due Amount (¥)
                </label>
                <Input
                  type="number"
                  value={dueAmount.toString()}
                  className="mt-1 bg-gray-50"
                  disabled
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Payment Status
                </label>
                <select
                  {...register("paymentStatus")}
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm transition-colors duration-200 placeholder:text-gray-500 focus:border-brand-yellow focus:outline-none focus:ring-2 focus:ring-brand-yellow/20 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500 mt-1"
                >
                  <option value="Due">Due</option>
                  <option value="Partial">Partial</option>
                  <option value="Paid">Paid</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Payment Method <span className="text-gray-500 text-xs">(Optional)</span>
                </label>
                <select
                  {...register("paymentMethod")}
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm transition-colors duration-200 placeholder:text-gray-500 focus:border-brand-yellow focus:outline-none focus:ring-2 focus:ring-brand-yellow/20 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500 mt-1"
                >
                  <option value="">Select payment method</option>
                  <option value="Bank Furicomy">Bank Furikomi</option>
                  <option value="Counter Cash">Counter Cash</option>
                  <option value="Credit Card">Credit Card</option>
                  <option value="Paypay">PayPay</option>
                </select>
              </div>
            </div>
          </div>

          {/* Remarks */}
          <div className="space-y-4">
            <h3 className="font-medium border-b pb-2">Remarks</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Remarks
              </label>
              <textarea
                {...register("remarks")}
                className="flex h-20 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm transition-colors duration-200 placeholder:text-gray-500 focus:border-brand-yellow focus:outline-none focus:ring-2 focus:ring-brand-yellow/20 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500 mt-1"
              />
            </div>
          </div>

          <div className="flex justify-end gap-6">
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Create Application</Button>
          </div>
        </form>
      </div>
    </div>
  );
}