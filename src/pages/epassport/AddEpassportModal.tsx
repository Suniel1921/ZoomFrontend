import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { X } from "lucide-react";
import Button from "../../components/Button";
import Input from "../../components/Input";
import SearchableSelect from "../../components/SearchableSelect";
import { useAdminStore } from "../../store/adminStore";
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
  const { admins } = useAdminStore();
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
      applicationStatus: "Details Pending",
      dataSentStatus: "Not Sent",
      amount: 0,
      paidAmount: 0,
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
  // const handlers = admins.filter(admin => admin.role !== 'super_admin');

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
        setHandlers(response.data.admins);
      } catch (error: any) {
        console.error("Failed to fetch handlers:", error);
        toast.error(error.response.data.message);
      }
    };

    fetchHandlers();
  }, []);

  //get all client

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

  const onSubmit = async (data: EpassportFormData) => {
    try {
      console.log("Form Data Submitted:", data);

      const client = clients.find((c) => c._id === data.clientId);
      if (!client) {
        // console.error('Client not found');
        toast.error("Please Select Client Name");
        return;
      }

      const formData = {
        ...data,
        clientName: client.name,
        date: data.date.toISOString(),
        deadline: data.deadline.toISOString(),
      };

      // console.log('Final Form Data:', formData);

      const response = await axios.post(
        `${
          import.meta.env.VITE_REACT_APP_URL
        }/api/v1/ePassport/createEpassport`,
        formData
      );
      console.log(response);

      if (response.data.success) {
        setEpassportApplications((prevApplications) => [
          ...prevApplications,
          response.data.data,
        ]);
        console.log(
          "Epassport application created successfully:",
          response.data
        );
        toast.success(response.data.message);
        reset();
        onClose();
        getAllEPassportApplication();
      }
    } catch (error: any) {
      console.error(
        "Error creating ePassport application:",
        error.response || error
      );
      toast.error("Error creating application");
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
                  }))}
                  value={watch("clientId")}
                  onChange={(value) => {
                    setValue("clientId", value);
                    const client = clients.find((c) => c._id === value);
                    if (client) {
                      // console.log('client is',client)
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
                  Mobile No
                </label>
                <Input
                  value={selectedClient?.phone || ""}
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
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-yellow focus:ring-brand-yellow"
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
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-yellow focus:ring-brand-yellow"
                >
                  <option value="Newborn Child">Newborn Child</option>
                  <option value="Passport Renewal">Passport Renewal</option>
                  <option value="Lost Passport">Lost Passport</option>
                  <option value="Damaged Passport">Damaged Passport</option>
                  <option value="Travel Document">Travel Document</option>
                  <option value="Birth Registration">Birth Registration</option>
                </select>
              </div>

              {/*Handled By */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Handled By
                </label>
                <select
                  {...register("handledBy", {
                    required: "This field is required",
                  })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-yellow focus:ring-brand-yellow p-2 mb-4"
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
                  Application Status
                </label>
                <select
                  {...register("applicationStatus")}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-yellow focus:ring-brand-yellow"
                >
                  <option value="Details Pending">Details Pending</option>
                  <option value="Ready to Process">Ready to Process</option>
                  <option value="Under Progress">Under Progress</option>
                  <option value="Cancelled">Cancelled</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Data Sent Status
                </label>
                <select
                  {...register("dataSentStatus")}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-yellow focus:ring-brand-yellow"
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
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-yellow focus:ring-brand-yellow"
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
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-yellow focus:ring-brand-yellow"
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
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-yellow focus:ring-brand-yellow"
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
                  {...register("amount", { valueAsNumber: true })}
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
                  {...register("paidAmount", { valueAsNumber: true })}
                  className="mt-1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Discount (¥)
                </label>
                <Input
                  type="number"
                  min="0"
                  {...register("discount", { valueAsNumber: true })}
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
                <select
                  {...register("paymentStatus")}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-yellow focus:ring-brand-yellow"
                >
                  <option value="Due">Due</option>
                  <option value="Paid">Paid</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Payment Method
                </label>
                <select
                  {...register("paymentMethod")}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-yellow focus:ring-brand-yellow"
                >
                  <option value="Bank Furicomy">Bank Furicomy</option>
                  <option value="Counter Cash">Counter Cash</option>
                  <option value="Credit Card">Credit Card</option>
                  <option value="Paypay">Paypay</option>
                  <option value="Line Pay">Line Pay</option>
                </select>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-4">
            <h3 className="font-medium border-b pb-2">Notes</h3>
            <div>
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
            <Button type="submit">Create Application</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
