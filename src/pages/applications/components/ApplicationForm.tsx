import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Button from '../../../components/Button';
import Input from '../../../components/Input';
import SearchableSelect from '../../../components/SearchableSelect';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { countries } from '../../../utils/countries';
import { getHandlers } from '../../../utils/adminHelpers';
import TodoList from '../../../components/TodoList';
import FamilyMembersList from './FamilyMembersList';
import PaymentDetails from './PaymentDetails';
import type { Application, FamilyMember } from '../../../types';

const applicationSchema = z.object({
  // Schema definition remains the same...
});

type ApplicationFormData = z.infer<typeof applicationSchema>;

interface ApplicationFormProps {
  clients: Array<{ id: string; name: string }>;
  initialData?: Application;
  initialFamilyMembers?: FamilyMember[];
  onSubmit: (data: ApplicationFormData, familyMembers: FamilyMember[]) => void;
  onCancel: () => void;
}

export default function ApplicationForm({
  clients,
  initialData,
  initialFamilyMembers = [],
  onSubmit,
  onCancel,
}: ApplicationFormProps) {
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>(initialFamilyMembers);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      ...initialData,
      deadline: initialData?.deadline ? new Date(initialData.deadline) : new Date(),
      todos: initialData?.todos?.map(todo => ({
        ...todo,
        dueDate: todo.dueDate ? new Date(todo.dueDate) : undefined
      })) || [],
    },
  });

  const handleFormSubmit = (data: ApplicationFormData) => {
    onSubmit(data, familyMembers);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
      {/* Client Information */}
      <div className="space-y-4">
        <h3 className="font-medium border-b pb-2">Client Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="col-span-1 md:col-span-3">
            <label className="block text-sm font-medium text-gray-700">Client Name</label>
            <SearchableSelect
              options={clients.map(client => ({
                value: client.id,
                label: client.name
              }))}
              value={watch('clientId')}
              onChange={(value) => setValue('clientId', value)}
              placeholder="Select client"
              className="mt-1"
              error={errors.clientId?.message}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Country</label>
            <select
              {...register('country')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-yellow focus:ring-brand-yellow"
            >
              <option value="">Select country</option>
              {countries.map((country) => (
                <option key={country.code} value={country.name}>
                  {country.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Visa Type</label>
            <select
              {...register('type')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-yellow focus:ring-brand-yellow"
            >
              <option value="Visitor Visa">Visitor Visa</option>
              <option value="Student Visa">Student Visa</option>
            </select>
          </div>
        </div>
      </div>

      {/* Family Applicants */}
      <div className="space-y-4">
        <h3 className="font-medium border-b pb-2">Family Applicants</h3>
        <FamilyMembersList
          familyMembers={familyMembers}
          onFamilyMembersChange={setFamilyMembers}
        />
      </div>

      {/* Documentation */}
      <div className="space-y-4">
        <h3 className="font-medium border-b pb-2">Documentation</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Document Status</label>
            <select
              {...register('documentStatus')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-yellow focus:ring-brand-yellow"
            >
              <option value="Not Yet">Not Yet</option>
              <option value="Few Received">Few Received</option>
              <option value="Fully Received">Fully Received</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Documents to Translate</label>
            <Input
              type="number"
              {...register('documentsToTranslate', { valueAsNumber: true })}
              className="mt-1"
              min="0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Translation Status</label>
            <select
              {...register('translationStatus')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-yellow focus:ring-brand-yellow"
            >
              <option value="Under Process">Under Process</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Document Handling */}
      <div className="space-y-4">
        <h3 className="font-medium border-b pb-2">Document Handling</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Visa Application Handled By</label>
            <select
              {...register('handledBy')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-yellow focus:ring-brand-yellow"
            >
              <option value="">Select handler</option>
              {getHandlers().map((handler) => (
                <option key={handler.id} value={handler.name}>
                  {handler.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Document Translation Handled By</label>
            <select
              {...register('translationHandler')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-yellow focus:ring-brand-yellow"
            >
              <option value="">Select handler</option>
              {getHandlers().map((handler) => (
                <option key={handler.id} value={handler.name}>
                  {handler.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Visa Details */}
      <div className="space-y-4">
        <h3 className="font-medium border-b pb-2">Visa Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Visa Status</label>
            <select
              {...register('visaStatus')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-yellow focus:ring-brand-yellow"
            >
              <option value="Under Review">Under Review</option>
              <option value="Under Process">Under Process</option>
              <option value="Waiting for Payment">Waiting for Payment</option>
              <option value="Completed">Completed</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Application Deadline</label>
            <DatePicker
              selected={watch('deadline')}
              onChange={(date) => setValue('deadline', date as Date)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-yellow focus:ring-brand-yellow"
              dateFormat="yyyy-MM-dd"
            />
          </div>
        </div>
      </div>

      {/* Payment Details */}
      <div className="space-y-4">
        <h3 className="font-medium border-b pb-2">Payment Details</h3>
        <PaymentDetails
          register={register}
          watch={watch}
          setValue={setValue}
          errors={errors}
        />
      </div>

      {/* To-Do List */}
      <div className="space-y-4">
        <h3 className="font-medium border-b pb-2">To-Do List</h3>
        <TodoList
          todos={watch('todos') || []}
          onTodosChange={(newTodos) => setValue('todos', newTodos)}
        />
      </div>

      {/* Notes */}
      <div className="space-y-4">
        <h3 className="font-medium border-b pb-2">Notes</h3>
        <textarea
          {...register('notes')}
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-yellow focus:ring-brand-yellow"
          placeholder="Add any additional notes..."
        />
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {initialData ? 'Update Application' : 'Create Application'}
        </Button>
      </div>
    </form>
  );
}