import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import type { Application, JapanVisitApplication, Translation, GraphicDesignJob } from '../../../types';

interface VisaTypeChartProps {
  applications: Application[];
  japanVisitApplications: JapanVisitApplication[];
  translations: Translation[];
  graphicDesignJobs: GraphicDesignJob[];
}

const COLORS = ['#FEDC00', '#010101', '#666666', '#999999', '#CCCCCC', '#E5E5E5'];

export default function VisaTypeChart({ 
  applications,
  japanVisitApplications,
  translations,
  graphicDesignJobs,
}: VisaTypeChartProps) {
  const data = [
    { name: 'Visit Visa', value: applications.filter(app => app.type === 'Visitor Visa').length },
    { name: 'Student Visa', value: applications.filter(app => app.type === 'Student Visa').length },
    { name: 'Japan Visit', value: japanVisitApplications.length },
    { name: 'Translations', value: translations.length },
    { name: 'Design Jobs', value: graphicDesignJobs.length },
  ].sort((a, b) => b.value - a.value);

  return (
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}