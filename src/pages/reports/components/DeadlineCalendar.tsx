import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, parseISO, isSameDay } from 'date-fns';

interface DeadlineCalendarProps {
  tasks: {
    applications: any[];
    japanVisit: any[];
    translations: any[];
    designs: any[];
    epassport: any[];
  };
}

export default function DeadlineCalendar({ tasks }: DeadlineCalendarProps) {
  const currentDate = new Date();
  const start = startOfMonth(currentDate);
  const end = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start, end });

  // Combine all tasks
  const allTasks = [
    ...tasks.applications.map(t => ({ ...t, type: 'Visa Application' })),
    ...tasks.japanVisit.map(t => ({ ...t, type: 'Japan Visit' })),
    ...tasks.translations.map(t => ({ ...t, type: 'Translation' })),
    ...tasks.designs.map(t => ({ ...t, type: 'Design' })),
    ...tasks.epassport.map(t => ({ ...t, type: 'ePassport' })),
  ];

  const getTasksForDay = (date: Date) => {
    return allTasks.filter(task => {
      const deadline = parseISO(task.deadline);
      return isSameDay(deadline, date);
    });
  };

  return (
    <div className="grid grid-cols-7 gap-1">
      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
        <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
          {day}
        </div>
      ))}

      {days.map((day, index) => {
        const tasksForDay = getTasksForDay(day);
        const hasDeadlines = tasksForDay.length > 0;

        return (
          <div
            key={index}
            className={`
              min-h-24 p-2 border rounded-lg
              ${!isSameMonth(day, currentDate) ? 'bg-gray-50' : 'bg-white'}
              ${isToday(day) ? 'border-brand-yellow' : 'border-gray-200'}
              ${hasDeadlines ? 'border-l-4 border-l-brand-yellow' : ''}
            `}
          >
            <div className="text-sm font-medium text-gray-500">
              {format(day, 'd')}
            </div>
            <div className="mt-1 space-y-1">
              {tasksForDay.slice(0, 3).map((task, i) => (
                <div
                  key={i}
                  className="text-xs p-1 rounded bg-brand-yellow/10 text-brand-black truncate"
                  title={`${task.type}: ${task.clientName}`}
                >
                  {task.type}
                </div>
              ))}
              {tasksForDay.length > 3 && (
                <div className="text-xs text-gray-500 text-center">
                  +{tasksForDay.length - 3} more
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}