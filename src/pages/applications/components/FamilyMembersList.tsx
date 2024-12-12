import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import Button from '../../../components/Button';
import Input from '../../../components/Input';
import type { FamilyMember } from '../../../types';

interface FamilyMembersListProps {
  familyMembers: FamilyMember[];
  onFamilyMembersChange: (members: FamilyMember[]) => void;
}

export default function FamilyMembersList({
  familyMembers,
  onFamilyMembersChange,
}: FamilyMembersListProps) {
  const [newMember, setNewMember] = useState({
    name: '',
    relationship: '',
    includedInApplication: true,
  });

  const handleAddMember = () => {
    if (newMember.name && newMember.relationship) {
      onFamilyMembersChange([
        ...familyMembers,
        {
          ...newMember,
          id: crypto.randomUUID(),
        },
      ]);
      setNewMember({
        name: '',
        relationship: '',
        includedInApplication: true,
      });
    }
  };

  const handleRemoveMember = (id: string) => {
    onFamilyMembersChange(familyMembers.filter(fm => fm.id !== id));
  };

  const handleToggleIncluded = (id: string) => {
    onFamilyMembersChange(
      familyMembers.map(fm =>
        fm.id === id ? { ...fm, includedInApplication: !fm.includedInApplication } : fm
      )
    );
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Input
          placeholder="Name"
          value={newMember.name}
          onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
        />
        <Input
          placeholder="Relationship"
          value={newMember.relationship}
          onChange={(e) => setNewMember({ ...newMember, relationship: e.target.value })}
        />
      </div>
      
      <Button
        type="button"
        onClick={handleAddMember}
        disabled={!newMember.name || !newMember.relationship}
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Family Member
      </Button>

      {familyMembers.length > 0 && (
        <div className="border rounded-lg divide-y">
          {familyMembers.map((familyMember) => (
            <div key={familyMember.id} className="p-3 flex items-center justify-between">
              <div className="flex-1">
                <p className="font-medium">{familyMember.name}</p>
                <p className="text-sm text-gray-500">{familyMember.relationship}</p>
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={familyMember.includedInApplication}
                    onChange={() => handleToggleIncluded(familyMember.id)}
                    className="rounded border-gray-300 text-brand-yellow focus:ring-brand-yellow"
                  />
                  <span className="text-sm">Include in Application</span>
                </label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleRemoveMember(familyMember.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}