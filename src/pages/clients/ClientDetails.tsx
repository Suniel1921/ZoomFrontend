import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { 
  User, Phone, Mail, MapPin, Calendar, Tag, FileText, 
  MessageCircle, Clock, Plus, Edit, ExternalLink,
  CreditCard 
} from 'lucide-react';
import { format } from 'date-fns';
import { useStore } from '../../store';
import Button from '../../components/Button';
import AddNoteModal from './AddNoteModal';
import AddInteractionModal from './AddInteractionModal';
import TimelineView from './TimelineView';
import ClientTaskTracking from './ClientTaskTracking';

export default function ClientDetails() {
  const { id } = useParams();
  const { clients, applications } = useStore();
  const client = clients.find(c => c.id === id);
  const clientApplications = applications.filter(a => a.clientId === id);

  const [activeTab, setActiveTab] = useState('overview');
  const [isAddNoteModalOpen, setIsAddNoteModalOpen] = useState(false);
  const [isAddInteractionModalOpen, setIsAddInteractionModalOpen] = useState(false);

  if (!client) {
    return <div>Client not found</div>;
  }

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'accounts', label: 'Accounts & Tasks' },
    { id: 'applications', label: 'Applications' },
    { id: 'documents', label: 'Documents' },
    { id: 'interactions', label: 'Interactions' },
    { id: 'timeline', label: 'Timeline' },
  ];

  return (
    <div className="space-y-6">
      {/* Client Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-6">
          {client.profilePhoto ? (
            <img
              src={client.profilePhoto}
              alt={client.name}
              className="h-24 w-24 rounded-full object-cover"
            />
          ) : (
            <div className="h-24 w-24 rounded-full bg-brand-yellow/10 flex items-center justify-center">
              <span className="text-3xl text-brand-black font-medium">
                {client.name.split(' ').map(n => n[0]).join('')}
              </span>
            </div>
          )}

          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">{client.name}</h1>
                <div className="flex items-center gap-4 mt-1 text-gray-500">
                  <span className="flex items-center gap-1">
                    <Mail className="h-4 w-4" />
                    {client.email}
                  </span>
                  <span className="flex items-center gap-1">
                    <Phone className="h-4 w-4" />
                    {client.phone}
                  </span>
                </div>
              </div>
              <Button>
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            </div>

            <div className="flex items-center gap-4 mt-4">
              <span className={`px-2 py-1 rounded-full text-sm font-medium ${
                client.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
              }`}>
                {client.status}
              </span>
              <span className="px-2 py-1 rounded-full text-sm font-medium bg-brand-yellow/10 text-brand-black">
                {client.category}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-brand-yellow text-brand-black'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Basic Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-medium mb-4">Basic Information</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Nationality</p>
                    <p className="font-medium">{client.nationality}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Address</p>
                    <p className="font-medium">
                      {client.address.street}, {client.address.city}
                    </p>
                    <p className="font-medium">
                      {client.address.prefecture} {client.address.postalCode}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Client Since</p>
                    <p className="font-medium">
                      {format(new Date(client.dateJoined), 'MMM d, yyyy')}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-medium mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Button
                  onClick={() => setIsAddNoteModalOpen(true)}
                  className="w-full justify-start"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Note
                </Button>
                <Button
                  onClick={() => setIsAddInteractionModalOpen(true)}
                  className="w-full justify-start"
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Log Interaction
                </Button>
                <Button className="w-full justify-start">
                  <FileText className="h-4 w-4 mr-2" />
                  Upload Document
                </Button>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-medium mb-4">Recent Activity</h3>
              <div className="space-y-4">
                {client.timeline.slice(0, 5).map((event) => (
                  <div key={event.id} className="flex items-start gap-3">
                    <div className="p-2 rounded-full bg-gray-100">
                      <Clock className="h-4 w-4 text-gray-600" />
                    </div>
                    <div>
                      <p className="font-medium">{event.title}</p>
                      <p className="text-sm text-gray-500">
                        {format(new Date(event.date), 'MMM d, yyyy')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'accounts' && (
          <ClientTaskTracking client={client} />
        )}

        {activeTab === 'applications' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-medium">Applications</h3>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Application
              </Button>
            </div>
            <div className="divide-y divide-gray-200">
              {clientApplications.map((app) => (
                <div key={app.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{app.type}</p>
                      <p className="text-sm text-gray-500">{app.country}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`px-2 py-1 rounded-full text-sm font-medium ${
                        app.visaStatus === 'Completed' ? 'bg-green-100 text-green-700' :
                        app.visaStatus === 'Under Process' ? 'bg-blue-100 text-blue-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {app.visaStatus}
                      </span>
                      <Button variant="outline" size="sm">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            {/* Documents content */}
          </div>
        )}

        {activeTab === 'interactions' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            {/* Interactions content */}
          </div>
        )}

        {activeTab === 'timeline' && (
          <TimelineView timeline={client.timeline} />
        )}
      </div>

      <AddNoteModal
        isOpen={isAddNoteModalOpen}
        onClose={() => setIsAddNoteModalOpen(false)}
        clientId={client.id}
      />

      <AddInteractionModal
        isOpen={isAddInteractionModalOpen}
        onClose={() => setIsAddInteractionModalOpen(false)}
        clientId={client.id}
      />
    </div>
  );
}