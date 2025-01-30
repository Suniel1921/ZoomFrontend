
// **********new layout***********



import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X } from "lucide-react";
import Button from "../../components/Button";
import Input from "../../components/Input";
import SearchableSelect from "../../components/SearchableSelect";
import { useStore } from "../../store";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { countries } from "../../utils/countries";
import { getHandlers } from "../../utils/adminHelpers";
import TodoList from "../../components/TodoList";
import PaymentDetails from "./components/PaymentDetails";
import type { Application, FamilyMember } from "../../types";
import axios from "axios";
import toast from "react-hot-toast";
import FamilyMembersList from "./components/FamilyMembersList";

interface EditApplicationModalProps {
  isOpen: boolean;
  getAllApplication: () => void;
  onClose: () => void;
  application: Application;
}

export default function EditApplicationModal({
  isOpen,
  onClose,
  application,
  getAllApplication,
}: EditApplicationModalProps) {
  const { clients, updateApplication } = useStore();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ApplicationFormData>({
    // resolver: zodResolver(applicationSchema),
    defaultValues: {
      ...application,
      deadline: new Date(application.deadline),
      payment: {
        visaApplicationFee: application.payment?.visaApplicationFee || 0,
        translationFee: application.payment?.translationFee || 0,
        paidAmount: application.payment?.paidAmount || 0,
        discount: application.payment?.discount || 0,
      },
      todos:
        application.todos?.map((todo) => ({
          ...todo,
          id: todo.id || crypto.randomUUID(),
          dueDate: todo.dueDate ? new Date(todo.dueDate) : undefined,
        })) || [],
    },
  });
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [handlers, setHandlers] = useState<{ id: string; name: string }[]>([]);

  // Fetch the handlers (admins) from the API
  useEffect(() => {
    const fetchHandlers = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_REACT_APP_URL}/api/v1/admin/getAllAdmin`
        );
        setHandlers(response.data.admins); // Assuming the response has an array of handlers
      } catch (error) {
        console.error("Failed to fetch handlers:", error);
      }
    };

    fetchHandlers();
  }, []);

  // Set family members on modal open
  // useEffect(() => {
  //   if (application.familyMembers) {
  //     setFamilyMembers(application.familyMembers);
  //   }
  // }, [application]);

  // Set default values for handledBy and translationHandler when application changes
  useEffect(() => {
    if (application.handledBy) setValue("handledBy", application.handledBy);
    if (application.translationHandler)
      setValue("translationHandler", application.translationHandler);
    if (application.familyMembers) setFamilyMembers(application.familyMembers);
  }, [application, setValue]);

  const handleFamilyMembersChange = (updatedMembers) => {
    setFamilyMembers(updatedMembers);
  };

  const onSubmit = async (data: any) => {
    console.log("Submitting data:", data);
    try {
      // const client = clients.find((c) => c.id === data.clientId);

      // Prepare data to send to the API
      const updateData = {
        ...data,
        // clientName: client?.name || application.clientName, // Ensure clientName is updated if changed
        payment: {
          ...data.payment,
        },
      };

      // Call the API to update the application
      const response = await axios.put(
        `${
          import.meta.env.VITE_REACT_APP_URL
        }/api/v1/visaApplication/updateVisaApplication/${application._id}`,
        updateData
      );

      if (response.data.success) {
        // console.log('Application updated:', response.data);
        toast.success(response.data.message);
        updateApplication(application.id, response.data.data); // Update the local state in the store
        onClose(); // Close the modal
        getAllApplication();
      }
    } catch (error: any) {
      if (error.response) {
        toast.error(error.response.data.message);
      }
      console.error("Failed to update application:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
  <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-xl font-semibold">Edit Application</h2>
      <button
        onClick={onClose}
        className="text-gray-500 hover:text-gray-700"
      >
        <X className="h-5 w-5" />
      </button>
    </div>

    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Client and Application Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Visa Type
          </label>
          <select
            {...register("type")}
            className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm transition-colors duration-200 placeholder:text-gray-500 focus:border-brand-yellow focus:outline-none focus:ring-2 focus:ring-brand-yellow/20 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500 mt-1"
          >
            <option value="Visitor Visa">Visitor Visa</option>
            <option value="Student Visa">Student Visa</option>
          </select>
          {errors.type && (
            <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Country
          </label>
          <select
            {...register("country")}
            className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm transition-colors duration-200 placeholder:text-gray-500 focus:border-brand-yellow focus:outline-none focus:ring-2 focus:ring-brand-yellow/20 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500 mt-1"
          >
            <option value="">Select country</option>
            {countries.map((country) => (
              <option key={country.code} value={country.name}>
                {country.name}
              </option>
            ))}
          </select>
          {errors.country && (
            <p className="mt-1 text-sm text-red-600">{errors.country.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Application Deadline
          </label>
          <DatePicker
            selected={watch("deadline")}
            onChange={(date) => setValue("deadline", date as Date)}
            className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm transition-colors duration-200 placeholder:text-gray-500 focus:border-brand-yellow focus:outline-none focus:ring-2 focus:ring-brand-yellow/20 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500 mt-1"
            dateFormat="yyyy-MM-dd"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Visa Application Handled By
          </label>
          <select
            {...register("handledBy")}
            value={watch("handledBy") || application.handledBy}
            onChange={(e) => setValue("handledBy", e.target.value)}
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

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Translation Handled By
          </label>
          <select
            {...register("translationHandler")}
            value={watch("translationHandler") || application.translationHandler}
            onChange={(e) => setValue("translationHandler", e.target.value)}
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

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Document Status
          </label>
          <select
            {...register("documentStatus")}
            className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm transition-colors duration-200 placeholder:text-gray-500 focus:border-brand-yellow focus:outline-none focus:ring-2 focus:ring-brand-yellow/20 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500 mt-1"
          >
            <option value="Not Yet">Not Yet</option>
            <option value="Few Received">Few Received</option>
            <option value="Fully Received">Fully Received</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Documents to Translate
          </label>
          <Input
            type="number"
            {...register("documentsToTranslate", { valueAsNumber: true })}
            className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm transition-colors duration-200 placeholder:text-gray-500 focus:border-brand-yellow focus:outline-none focus:ring-2 focus:ring-brand-yellow/20 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500 mt-1"
            min="0"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Job Status
          </label>
          <select
            {...register("visaStatus")}
            className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm transition-colors duration-200 placeholder:text-gray-500 focus:border-brand-yellow focus:outline-none focus:ring-2 focus:ring-brand-yellow/20 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500 mt-1"
            
          >
            {/* <option value="Under Review">Under Review</option> */}
            <option value="Processing">Processing</option>
            <option value="Waiting for Payment">Waiting for Payment</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Translation Status
          </label>
          <select
            {...register("translationStatus")}
            className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm transition-colors duration-200 placeholder:text-gray-500 focus:border-brand-yellow focus:outline-none focus:ring-2 focus:ring-brand-yellow/20 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500 mt-1"
          >
            <option value="Under Process">Under Process</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Payment Details Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium border-b pb-2">Payment Details</h3>
        <PaymentDetails
          register={register}
          watch={watch}
          setValue={setValue}
          errors={errors}
        />
      </div>

      {/* Family Members Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium border-b pb-2">Family Members</h3>
        <FamilyMembersList
          familyMembers={familyMembers}
          onFamilyMembersChange={handleFamilyMembersChange}
        />
      </div>

      {/* To-Do List Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium border-b pb-2">To-Do List</h3>
        <TodoList
          todos={watch("todos") || []}
          onTodosChange={(newTodos) => setValue("todos", newTodos)}
        />
      </div>

      {/* Notes Section */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Notes
        </label>
        <textarea
          {...register("notes")}
          rows={3}
          className="w-full px-3 py-2 rounded-md border-gray-300 shadow-sm focus:border-brand-yellow focus:ring-brand-yellow resize-none"
          placeholder="Add any additional notes..."
        />
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-4 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit">Update Application</Button>
      </div>
    </form>
  </div>
</div>
   

  );
}


