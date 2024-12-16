import { LucideIcon } from 'lucide-react';

interface SubStat {
  label: string;
  value: number | string;
}

interface StatsCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: 'up' | 'down';
  trendValue?: string;
  subStats?: SubStat[];
}

export default function StatsCard({ 
  label, 
  value, 
  icon: Icon,
  trend, 
  trendValue,
  subStats 
}: StatsCardProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-3 bg-brand-yellow/10 rounded-lg">
          <Icon className="h-6 w-6 text-brand-black" />
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500">{label}</h3>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-semibold text-brand-black">{value}</span>
            {trend && trendValue && (
              <span className={`text-sm ${
                trend === 'up' ? 'text-green-600' : 'text-red-600'
              }`}>
                {trendValue}
              </span>
            )}
          </div>
        </div>
      </div>

      {subStats && (
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
          {subStats.map((stat) => (
            <div key={stat.label}>
              <p className="text-xs text-gray-500">{stat.label}</p>
              <p className="text-sm font-medium text-brand-black">{stat.value}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}




