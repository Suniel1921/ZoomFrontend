import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { Application } from '../../../types';

interface CountryChartProps {
  applications: Application[];
}

export default function CountryChart({ applications }: CountryChartProps) {
  const data = applications.reduce((acc: { name: string; value: number }[], app) => {
    const existingCountry = acc.find(item => item.name === app.country);
    if (existingCountry) {
      existingCountry.value++;
    } else {
      acc.push({ name: app.country, value: 1 });
    }
    return acc;
  }, [])
  .sort((a, b) => b.value - a.value)
  .slice(0, 5);

  return (
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="value" fill="#FEDC00" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}