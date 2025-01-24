// ***********new code********

import React, { useState } from 'react';
import ClientOngoingTask from './ClientOngoingTask'; 
import PreviousTask from './PreviousTask';  
import ClientPayment from './ClientPayment';  

const TasksSection = () => {
  const [activeTab, setActiveTab] = useState<string>('ongoingTasks');

  // Handle Tab Switch
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  // Render Active Tab Content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'ongoingTasks':
        return <ClientOngoingTask />;  // ClientOngoingTask will handle its own data fetching
      case 'previousTasks':
        return <PreviousTask />;  // PreviousTask will handle its own data fetching
      case 'payment':
        return <ClientPayment />;  // ClientPayment will handle its own data fetching
      default:
        return null;
    }
  };

  return (
    <div>
      {/* Tab Buttons */}
      <div className="flex space-x-4 mb-6">
        <button
          onClick={() => handleTabChange('ongoingTasks')}
          className={`px-4 py-2 text-sm font-medium ${activeTab === 'ongoingTasks' ? 'border-b-2 border-yellow-500 text-yellow-500' : 'border-b-2 border-transparent text-gray-700'}`}
        >
          Ongoing Tasks
        </button>
        <button
          onClick={() => handleTabChange('previousTasks')}
          className={`px-4 py-2 text-sm font-medium ${activeTab === 'previousTasks' ? 'border-b-2 border-yellow-500 text-yellow-500' : 'border-b-2 border-transparent text-gray-700'}`}
        >
          Previous Tasks
        </button>
        <button
          onClick={() => handleTabChange('payment')}
          className={`px-4 py-2 text-sm font-medium ${activeTab === 'payment' ? 'border-b-2 border-yellow-500 text-yellow-500' : 'border-b-2 border-transparent text-gray-700'}`}
        >
          Payment
        </button>
      </div>

      {/* Render Active Tab Content */}
      <div className="space-y-4">{renderTabContent()}</div>
    </div>
  );
};

export default TasksSection;
