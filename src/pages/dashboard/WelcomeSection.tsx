// components/dashboard/WelcomeSection.tsx
import React from 'react';
import { Sun, Sunset, Moon, Bell } from 'lucide-react';
import TaskAlerts from '../../components/notification/TaskAlerts';

interface WelcomeSectionProps {
  superAdminName: any;
  getDailyMotivation: string;
  deadlineAlerts: TaskAlert[];
  paymentFollowUps: TaskAlert[];
  showAlerts: boolean;
  setShowAlerts: (value: boolean) => void;
}

export const WelcomeSection: React.FC<WelcomeSectionProps> = ({
  superAdminName,
  getDailyMotivation,
  deadlineAlerts,
  paymentFollowUps,
  showAlerts,
  setShowAlerts
}) => {
  const currentHour = new Date().getHours();
  const [greeting, IconComponent] = currentHour < 12
    ? ["Good Morning", Sun]
    : currentHour < 17
    ? ["Good Afternoon", Sunset]
    : ["Good Evening", Moon];

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {greeting}, <span className="inline-block">
              <IconComponent className="w-6 h-6 inline-block" />
            </span>{" "}
            {superAdminName.name || "User"}! <span className="inline-block animate-wave">👋</span>
          </h1>
          <p className="mt-1 text-base text-gray-500">Here's what's happening today</p>
          <p className="mt-1 text-base text-gray-600 italic">{getDailyMotivation}</p>
        </div>
        <div className="text-left sm:text-right flex items-center gap-4">
          <p className="text-lg font-semibold">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
          {(deadlineAlerts.length > 0 || paymentFollowUps.length > 0) && (
            <div className="relative">
              <button
                onClick={() => setShowAlerts(!showAlerts)}
                className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 focus:outline-none relative"
                aria-label="Toggle notifications"
              >
                <Bell className="w-6 h-6 text-gray-600" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  {deadlineAlerts.length + paymentFollowUps.length}
                </span>
              </button>
              {showAlerts && (
                <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg z-10 p-4 animate-slide-in">
                  <TaskAlerts deadlineAlerts={deadlineAlerts} paymentFollowUps={paymentFollowUps} />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
