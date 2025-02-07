import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface TasksOverviewProps {
  tasks: {
    applications: any[];
    japanVisit: any[];
    translations: any[];
    designs: any[];
    epassport: any[];
    otherServices: any[]; // Added otherServices
  };
}

const COLORS = ['#FEDC00', '#010101', '#666666', '#999999', '#CCCCCC', '#333333'];

export default function TasksOverview({ tasks }: TasksOverviewProps) {
  // Ensure all task arrays exist with defaults
  const {
    applications = [],
    japanVisit = [],
    translations = [],
    designs = [],
    epassport = [],
    otherServices = []
  } = tasks;

  const data = [
    { name: 'Visa Applications', value: applications.length },
    { name: 'Japan Visit', value: japanVisit.length },
    { name: 'Translations', value: translations.length },
    { name: 'Design Jobs', value: designs.length },
    { name: 'ePassport', value: epassport.length },
    { name: 'Other Services', value: otherServices.length }, // Added otherServices
  ].filter(item => item.value > 0);

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h3 className="text-lg font-medium mb-4">Tasks Distribution</h3>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
              label={({ name, value }) => `${name}: ${value}`}
            >
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}