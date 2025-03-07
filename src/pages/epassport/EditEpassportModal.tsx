import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { X } from "lucide-react";
import Button from "../../components/Button";
import Input from "../../components/Input";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { PREFECTURES } from "../../constants/prefectures";
import axios from "axios";
import toast from "react-hot-toast";

export default function EditEpassportModal({
  isOpen,
  onClose,
  application,
  getAllEPassportApplication,
}) {
  const [showPrefecture, setShowPrefecture] = useState(application.ghumtiService);
  const [handlers, setHandlers] = useState([]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors },
  } = useForm({
    defaultValues: {
      ...application,
      date: new Date(application.date),
      deadline: new Date(application.deadline),
      amount: application.amount || 0,
      paidAmount: application.paidAmount || 0,
      discount: application.discount || 0,
      dueAmount: application.dueAmount || 0,
      paymentStatus: application.paymentStatus || "Due",
      additionalClients: application.additionalClients || [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "additionalClients",
  });

  const ghumtiService = watch("ghumtiService");
  const amount = watch("amount") || 0;
  const paidAmount = watch("paidAmount") || 0;
  const discount = watch("discount") || 0;
  const dueAmount = amount - (paidAmount + discount);
  const applicationType = watch("applicationType");

  useEffect(() => {
    const fetchHandlers = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_REACT_APP_URL}/api/v1/admin/getAllAdmin`
        );
        setHandlers(response.data.admins || []);
      } catch (error) {
        toast.error("Failed to fetch handlers.");
      }
    };
    fetchHandlers();
  }, []);

  useEffect(() => {
    setValue("dueAmount", dueAmount);
    if (dueAmount <= 0) setValue("paymentStatus", "Paid");
    else if (paidAmount > 0) setValue("paymentStatus", "Partial");
    else setValue("paymentStatus", "Due");
  }, [amount, paidAmount, discount, setValue]);

  const onSubmit = async (data) => {
    const updatedData = {
      ...data,
      dueAmount,
      date: data.date.toISOString(),
      deadline: data.deadline.toISOString(),
      additionalClients: data.additionalClients.map((client) => ({
        name: client.name,
        applicationType: client.applicationType || data.applicationType,
      })),
    };

    try {
      const response = await axios.put(
        `${import.meta.env.VITE_REACT_APP_URL}/api/v1/ePassport/updateEpassport/${application._id}`,
        updatedData
      );
      toast.success(response.data.message || "ePassport updated successfully!");
      onClose();
      getAllEPassportApplication();
    } catch (error) {
      toast.error(error.response?.data?.message || "Error updating application");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Edit ePassport Application</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <div className="space-y-4">
            <h3 className="font-medium border-b pb-2">Client Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                <Input value={application.mobileNo || "N/A"} className="mt-1 bg-gray-50" disabled />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Contact Channel</label>
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

          <div className="space-y-4">
            <h3 className="font-medium border-b pb-2">Application Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Application Type</label>
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
                <label className="block text-sm font-medium text-gray-700">Job Status</label>
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
                <label className="block text-sm font-medium text-gray-700">Data Sent Status</label>
                <select
                  {...register("dataSentStatus")}
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm transition-colors duration-200 placeholder:text-gray-500 focus:border-brand-yellow focus:outline-none focus:ring-2 focus:ring-brand-yellow/20 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500 mt-1"
                >
                  <option value="Not Sent">Not Sent</option>
                  <option value="Sent">Sent</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Handled By</label>
                <select
                  {...register("handledBy")}
                  value={watch("handledBy") || application.handledBy}
                  onChange={(e) => setValue("handledBy", e.target.value)}
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm transition-colors duration-200 placeholder:text-gray-500 focus:border-brand-yellow focus:outline-none focus:ring-2 focus:ring-brand-yellow/20 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500 mt-1"
                >
                  <option value="">Select handler</option>
                  {handlers.map((handler) => (
                    <option key={handler.id} value={handler.name}>
                      {handler.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Date</label>
                <DatePicker
                  selected={watch("date")}
                  onChange={(date) => setValue("date", date)}
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm transition-colors duration-200 placeholder:text-gray-500 focus:border-brand-yellow focus:outline-none focus:ring-2 focus:ring-brand-yellow/20 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500 mt-1"
                  dateFormat="yyyy-MM-dd"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Deadline</label>
                <DatePicker
                  selected={watch("deadline")}
                  onChange={(date) => setValue("deadline", date)}
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
                      if (!e.target.checked) setValue("prefecture", undefined);
                    }}
                    className="rounded border-gray-300 text-brand-yellow focus:ring-brand-yellow"
                  />
                  <span className="text-sm text-gray-700">Ghumti Service</span>
                </label>
              </div>
              {ghumtiService && (
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Prefecture</label>
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
              {fields.length > 0 && (
                <div className="col-span-2 space-y-4">
                  <h4 className="text-sm font-medium text-gray-700">Additional Clients</h4>
                  {fields.map((field, index) => (
                    <div key={field.id} className="flex gap-4 items-end">
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700">Name</label>
                        <Input
                          {...register(`additionalClients.${index}.name`, { required: "Name is required" })}
                          className="mt-1"
                        />
                        {errors.additionalClients?.[index]?.name && (
                          <p className="mt-1 text-sm text-red-600">{errors.additionalClients[index].name.message}</p>
                        )}
                      </div>
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700">Application Type</label>
                        <select
                          {...register(`additionalClients.${index}.applicationType`, { required: "Type is required" })}
                          className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm transition-colors duration-200 placeholder:text-gray-500 focus:border-brand-yellow focus:outline-none focus:ring-2 focus:ring-brand-yellow/20 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500 mt-1"
                        >
                          <option value="">Select type</option>
                          <option value="Newborn Child">Newborn Child</option>
                          <option value="Passport Renewal">Passport Renewal</option>
                          <option value="Lost Passport">Lost Passport</option>
                          <option value="Damaged Passport">Damaged Passport</option>
                          <option value="Travel Document">Travel Document</option>
                          <option value="Birth Registration">Birth Registration</option>
                        </select>
                        {errors.additionalClients?.[index]?.applicationType && (
                          <p className="mt-1 text-sm text-red-600">{errors.additionalClients[index].applicationType.message}</p>
                        )}
                      </div>
                      <Button type="button" variant="outline" onClick={() => remove(index)}>
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              <div className="col-span-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => append({ name: "", applicationType: applicationType })}
                >
                  Add Additional Client
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-medium border-b pb-2">Payment Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Amount (¥)</label>
                <Input
                  type="number"
                  min="0"
                  {...register("amount", { valueAsNumber: true })}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Paid Amount (¥)</label>
                <Input
                  type="number"
                  min="0"
                  {...register("paidAmount", { valueAsNumber: true })}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Discount (¥)</label>
                <Input
                  type="number"
                  min="0"
                  {...register("discount", { valueAsNumber: true })}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Due Amount (¥)</label>
                <Input value={dueAmount} className="mt-1 bg-gray-50" disabled />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Payment Status</label>
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

          <div className="flex justify-end gap-2 mt-4">
            <Button type="button" onClick={onClose} variant="outline">Cancel</Button>
            <Button type="submit">Update Changes</Button>
          </div>
        </form>
      </div>
    </div>
  );
}