import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { X, Clock } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Button from "../../components/Button";
import Input from "../../components/Input";
import SearchableSelect from "../../components/SearchableSelect";
import axios from "axios";
import toast from "react-hot-toast";

type AppointmentFormData = {
  clientId: string;
  type: string;
  date: Date;
  time: string;
  duration: number;
  meetingType: "physical" | "online";
  location?: string;
  meetingLink?: string;
  notes?: string;
  sendReminder: boolean;
  reminderType?: "email" | "sms" | "both";
  isRecurring: boolean;
  recurringFrequency?: "weekly" | "monthly";
  recurringEndDate?: Date;
  handledBy: string; // Changed to string for name instead of ID
};

interface AddAppointmentModalProps {
  isOpen: boolean;
  fetchAppointments: () => void;
  onClose: () => void;
  selectedDate?: Date | null;
  selectedTime?: string;
  appointment?: {
    clientId: string;
    type: string;
    meetingType: "physical" | "online";
    location?: string;
    meetingLink?: string;
    notes?: string;
  } | null;
}

export default function AddAppointmentModal({
  isOpen,
  onClose,
  selectedDate,
  selectedTime,
  appointment,
  fetchAppointments,
}: AddAppointmentModalProps) {
  const [clients, setClients] = useState<any[]>([]);
  const [handlers, setHandlers] = useState<{ id: string; name: string }[]>([]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<AppointmentFormData>({
    defaultValues: {
      date: selectedDate || new Date(),
      time: selectedTime || "10:00",
      duration: 60,
      sendReminder: true,
      reminderType: "email",
      isRecurring: false,
      ...(appointment && {
        clientId: appointment.clientId,
        type: appointment.type,
        meetingType: appointment.meetingType,
        location: appointment.location,
        meetingLink: appointment.meetingLink,
        notes: appointment.notes,
      }),
    },
  });

  const meetingType = watch("meetingType");
  const sendReminder = watch("sendReminder");
  const isRecurring = watch("isRecurring");
  const recurringFrequency = watch("recurringFrequency");
  const recurringEndDate = watch("recurringEndDate");

  // Common styles for form elements
  const selectStyles = "w-full rounded-md border border-gray-300 shadow-sm focus:border-brand-yellow focus:ring-1 focus:ring-brand-yellow h-10 px-3";
  const labelStyles = "block text-sm font-medium text-gray-700 mb-1";
  const errorStyles = "text-sm text-red-600 mt-1";


  
  useEffect(() => {
    const fetchHandlers = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_REACT_APP_URL}/api/v1/admin/getAllAdmin`
        );
        setHandlers(response.data.admins.map((admin: any) => ({
          id: admin._id,
          name: admin.name,
        })));
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

  const onSubmit = async (data: AppointmentFormData) => {
    if (!data.clientId) {
      return; // Prevent form submission if no client is selected
    }

    const client = clients.find((c) => c._id === data.clientId);
    if (!client) return;
    
    // Find the handler object based on the selected name
    const handler = handlers.find((h) => h.name === data.handledBy);

    const appointmentData = {
      ...data,
      clientName: client.name,
      email: client.email,
      phone: client.phone,
      status: "Scheduled",
      handledBy: data.handledBy, // This will now be the name
    };

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_REACT_APP_URL}/api/v1/appointment/createAppointment`,
        {
          ...appointmentData,
          date: data.date.toISOString(),
          isRecurring: data.isRecurring,
          recurringFrequency: data.isRecurring ? data.recurringFrequency : null,
          recurringEndDate: data.isRecurring
            ? data.recurringEndDate?.toISOString()
            : null,
        }
      );

      if (response.data.success) {
        reset();
        onClose();
        fetchAppointments();
        toast.success(response.data.message);
      } else {
        console.error("Failed to create appointment:", response.data.message);
        toast.error(response.data.message);
      }
    } catch (error: any) {
      console.error("Error creating appointment:", error);
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Schedule Appointment</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
              />
              {errors.clientId && (
                <p className="text-sm text-red-500 mt-1">Client is required</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Type
              </label>
              <select
                {...register("type", {
                  required: "Appointment type is required",
                })}
                className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm transition-colors duration-200 placeholder:text-gray-500 focus:border-brand-yellow focus:outline-none focus:ring-2 focus:ring-brand-yellow/20 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500 mt-1"
              >
                <option value="">Select type</option>
                <option value="Visit Visa Consultation">
                  Visit Visa Consultation
                </option>
                <option value="Student Visa Consultation">
                  Student Visa Consultation
                </option>
                <option value="Document Review">Document Review</option>
                <option value="General Consultation">
                  General Consultation
                </option>
                <option value="Follow-up Meeting">Follow-up Meeting</option>
              </select>
              {errors.type && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.type.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Date
              </label>
              <DatePicker
                selected={watch("date")}
                onChange={(date) => setValue("date", date as Date)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-yellow focus:ring-brand-yellow"
                dateFormat="MMMM d, yyyy"
                minDate={new Date()}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Time
              </label>
              <div className="mt-1 relative">
                <Input
                  type="time"
                  {...register("time")}
                  className="block w-full"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Duration (minutes)
              </label>
              <select
                {...register("duration", { valueAsNumber: true })}
                className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm transition-colors duration-200 placeholder:text-gray-500 focus:border-brand-yellow focus:outline-none focus:ring-2 focus:ring-brand-yellow/20 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500 mt-1"
              >
                <option value={15}>15 minutes</option>
                <option value={30}>30 minutes</option>
                <option value={45}>45 minutes</option>
                <option value={60}>1 hour</option>
                <option value={90}>1.5 hours</option>
                <option value={120}>2 hours</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Meeting Type
              </label>
              <select
                {...register("meetingType")}
                className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm transition-colors duration-200 placeholder:text-gray-500 focus:border-brand-yellow focus:outline-none focus:ring-2 focus:ring-brand-yellow/20 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500 mt-1"
              >
                <option value="physical">Physical Meeting</option>
                <option value="online">Online Meeting</option>
              </select>
            </div>

            {meetingType === "physical" && (
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700">
                  Location
                </label>
                <Input
                  {...register("location")}
                  placeholder="Enter meeting location"
                  className="mt-1"
                />
              </div>
            )}

            {meetingType === "online" && (
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700">
                  Meeting Link
                </label>
                <Input
                  {...register("meetingLink")}
                  placeholder="Enter online meeting link"
                  className="mt-1"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Notes
              </label>
              <textarea
                {...register("notes")}
                className="flex h-20 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm transition-colors duration-200 placeholder:text-gray-500 focus:border-brand-yellow focus:outline-none focus:ring-2 focus:ring-brand-yellow/20 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500 mt-1"
                rows={3}
              />
            </div>

            <div className="flex items-center mt-4">
              <input
                type="checkbox"
                {...register("sendReminder")}
                className="h-4 w-4 rounded border-gray-300 text-brand-yellow focus:ring-brand-yellow"
              />
              <label className="ml-2 text-sm font-medium text-gray-700">
                Send reminder
              </label>
            </div>

            {sendReminder && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700">
                  Reminder Type
                </label>
                <select
                  {...register("reminderType")}
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm transition-colors duration-200 placeholder:text-gray-500 focus:border-brand-yellow focus:outline-none focus:ring-2 focus:ring-brand-yellow/20 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500 mt-1"
                >
                  <option value="email">Email</option>
                  <option value="sms">SMS</option>
                  <option value="both">Both</option>
                </select>
              </div>
            )}

            <div className="space-y-1">
              <label className={labelStyles}>Handled By *</label>
              <select
                {...register("handledBy", { required: "Handler is required" })}
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

            <div className="mt-4 flex items-center">
              <input
                type="checkbox"
                {...register("isRecurring")}
                className="h-4 w-4 rounded border-gray-300 text-brand-yellow focus:ring-brand-yellow"
              />
              <label className="ml-2 text-sm font-medium text-gray-700">
                Recurring Appointment
              </label>
            </div>

            {isRecurring && (
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Frequency
                  </label>
                  <select
                    {...register("recurringFrequency")}
                    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm transition-colors duration-200 placeholder:text-gray-500 focus:border-brand-yellow focus:outline-none focus:ring-2 focus:ring-brand-yellow/20 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500 mt-1"
                  >
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    End Date
                  </label>
                  <DatePicker
                    selected={recurringEndDate}
                    onChange={(date) => setValue("recurringEndDate", date)}
                    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm transition-colors duration-200 placeholder:text-gray-500 focus:border-brand-yellow focus:outline-none focus:ring-2 focus:ring-brand-yellow/20 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500 mt-1"
                    dateFormat="MMMM d, yyyy"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 flex justify-end space-x-4">
            <Button type="button" onClick={onClose} variant="secondary">
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Save Appointment
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}