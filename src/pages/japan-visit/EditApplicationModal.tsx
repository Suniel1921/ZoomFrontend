import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X } from 'lucide-react';
import Button from '../../components/Button';
import Input from '../../components/Input';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import PaymentSection from './components/PaymentSection';
import { toast } from 'react-hot-toast'; 
import axios from 'axios';  

export default function EditApplicationModal({
  isOpen,
  onClose,
  application,
  clients,
  fetchApplications
}: {
  isOpen: boolean;
  onClose: () => void;
  application: any;
  clients: any;
  fetchApplications: () => void;
}) {
  if (!isOpen) return null;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors }
  } = useForm({
    defaultValues: {
      ...application,
      date: application ? new Date(application.date) : undefined,
      deadline: application ? new Date(application.deadline) : undefined,
      todos: application?.todos?.map(todo => ({
        ...todo,
        id: todo.id || crypto.randomUUID(),
        dueDate: todo.dueDate ? new Date(todo.dueDate) : undefined,
      })) || [],
    },
  });
  const [handlers, setHandlers] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    if (!isOpen) {
      reset();
    }
  }, [isOpen, reset]);

  useEffect(() => {
    const fetchHandlers = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_REACT_APP_URL}/api/v1/admin/getAllAdmin`);
        setHandlers(response.data.admins); 
      } catch (error:any) {
        console.error('Failed to fetch handlers:', error);
        toast.error(error.response.data.message);
      }
    };

    fetchHandlers();
  }, []);

  const onSubmit = async (data: any) => {
    try {
      const applicationData = {
        ...data,
        payment: {
          visaApplicationFee: data.visaApplicationFee,
          translationFee: data.translationFee,
          paidAmount: data.paidAmount,
          discount: data.discount,
        },
      };

      const response = await axios.put(
        `${import.meta.env.VITE_REACT_APP_URL}/api/v1/japanVisit/updateJapanVisitApplication/${application._id}`,
        applicationData
      );

      if (response.data.success) {
        toast.success('Application updated successfully!');
        onClose();
        fetchApplications();
      } else {
        toast.error('Failed to update application.');
      }
    } catch (error) {
      toast.error('Failed to update application. Please try again.');
      console.error('Error updating application:', error);
    }
  };

  // Common input class for consistent styling
  const inputClass = "mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-yellow focus:border-brand-yellow";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Edit Japan Visit Application</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form className="space-y-8" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Project Start Date</label>
                <DatePicker
                  selected={watch('date')}
                  onChange={(date) => setValue('date', date as Date)}
                  className={inputClass}
                  dateFormat="yyyy-MM-dd"
                  minDate={new Date()}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Handled By</label>
                <select
                  {...register("handledBy")}
                  value={watch("handledBy") || application.handledBy}
                  onChange={(e) => setValue("handledBy", e.target.value)}
                  className={inputClass}
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Job Status</label>
                <select
                  {...register('status')}
                  className={inputClass}
                >
                  <option value="Processing">Processing</option>
                  <option value="Waiting for Payment">Waiting for Payment</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Deadline</label>
                <DatePicker
                  selected={watch('deadline')}
                  onChange={(date) => setValue('deadline', date as Date)}
                  className={inputClass}
                  dateFormat="yyyy-MM-dd"
                  minDate={new Date()}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Package</label>
                <select
                  {...register('package')}
                  className={inputClass}
                >
                  <option value="Standard Package">Standard Package</option>
                  <option value="Premium Package">Premium Package</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">No of Applicants</label>
                <Input
                  type="number"
                  min="1"
                  {...register('noOfApplicants', { valueAsNumber: true })}
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Project Reason</label>
                <select
                  {...register('reasonForVisit')}
                  className={inputClass}
                >
                  <option value="General Visit">General Visit</option>
                  <option value="Baby Care">Baby Care</option>
                  <option value="Program Attendance">Program Attendance</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-lg font-medium border-b pb-2">Financial Details</h3>
            <PaymentSection
              register={register}
              watch={watch}
              setValue={setValue}
              errors={errors}
            />
          </div>

          <div className="space-y-6">
            <h3 className="text-lg font-medium border-b pb-2">Notes</h3>
            <div>
              <textarea
                {...register('notes')}
                rows={3}
                className={`${inputClass} resize-none`}
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






