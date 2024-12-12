import { useState } from 'react';
import { useTaskManagementStore } from '../../../store/taskManagementStore';
import Button from '../../../components/Button';
import type { ClientProcess } from '../../../types/taskManagement';

interface ProcessNotesProps {
  process: ClientProcess;
}

export default function ProcessNotes({ process }: ProcessNotesProps) {
  const [note, setNote] = useState(process.notes || '');
  const { updateClientProcess } = useTaskManagementStore();

  const handleSave = () => {
    updateClientProcess(process.id, { notes: note });
  };

  return (
    <div className="space-y-4">
      <h3 className="font-medium">Process Notes</h3>
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        rows={6}
        className="w-full rounded-md border-gray-300 shadow-sm focus:border-brand-yellow focus:ring-brand-yellow"
        placeholder="Add any notes about this process..."
      />
      <div className="flex justify-end">
        <Button onClick={handleSave}>Save Notes</Button>
      </div>
    </div>
  );
}