import { DivideIcon as LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  ResponsiveContainer, 
  Tooltip, 
  Cell,
  ComposedChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Legend
} from 'recharts';

interface SubStat {
  label: string;
  value: number | string;
  status?: 'completed' | 'cancelled' | 'pending' | 'in-progress' | 'active' | 'total';
}

interface StatsCardProps {
  label: string;
  value: string | number;
  icon: typeof LucideIcon;
  trend?: 'up' | 'down';
  trendValue?: string;
  subStats?: SubStat[];
  chartType?: 'line' | 'area' | 'bar' | 'pie' | 'graph';
  chartData?: any[];
  bgColor?: string;
  chartColor?: string;
}

const COLORS = {
  primary: '#6366f1',
  success: '#10b981',
  danger: '#ef4444',
  warning: '#f59e0b',
  info: '#3b82f6',
  pending: '#f59e0b',
  inProgress: '#6366f1',
  completed: '#10b981',
  active: '#3b82f6',
  total: '#64748b',
  average: '#9333ea'
};

function StatsCard({ 
  label, 
  value, 
  icon: Icon,
  trend, 
  trendValue,
  subStats,
  chartType,
  chartData,
  bgColor = "#fcda00",
  chartColor
}: StatsCardProps) {
  const renderChart = () => {
    if (!chartData) return null;

    const commonProps = {
      width: "100%",
      height: 80,
      margin: { top: 5, right: 5, bottom: 5, left: 5 }
    };

    switch (chartType) {
      case 'line':
        return (
          <ResponsiveContainer {...commonProps}>
            <LineChart data={chartData}>
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke={COLORS.primary}
                strokeWidth={2} 
                dot={false}
                animationDuration={1000}
              />
              <Tooltip 
                contentStyle={{ background: 'white', border: '1px solid #e2e8f0' }}
                labelStyle={{ color: '#64748b' }}
              />
            </LineChart>
          </ResponsiveContainer>
        );

      case 'area':
        return (
          <ResponsiveContainer {...commonProps}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS.info} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={COLORS.info} stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS.total} stopOpacity={0.2}/>
                  <stop offset="95%" stopColor={COLORS.total} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <Area 
                type="monotone" 
                dataKey="total" 
                stroke={COLORS.total}
                fill="url(#colorTotal)"
                animationDuration={1000}
              />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke={COLORS.info}
                fill="url(#colorValue)"
                animationDuration={1000}
              />
              <Tooltip 
                contentStyle={{ background: 'white', border: '1px solid #e2e8f0' }}
                labelStyle={{ color: '#64748b' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'bar':
        return (
          <ResponsiveContainer {...commonProps}>
            <ComposedChart data={chartData}>
              <Bar 
                dataKey="value" 
                fill={chartColor || COLORS.primary}
                radius={[4, 4, 0, 0]}
                animationDuration={1000}
              />
              <Line
                type="monotone"
                dataKey="average"
                stroke={COLORS.average}
                strokeWidth={2}
                strokeDasharray="3 3"
                dot={false}
              />
              <Tooltip 
                contentStyle={{ background: 'white', border: '1px solid #e2e8f0' }}
                labelStyle={{ color: '#64748b' }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        );

      case 'pie':
        return (
          <ResponsiveContainer {...commonProps}>
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={20}
                outerRadius={35}
                animationDuration={1000}
              >
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={
                      entry.name === 'Active' ? COLORS.primary :
                      entry.name === 'Completed' ? COLORS.success :
                      COLORS.danger
                    } 
                  />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ background: 'white', border: '1px solid #e2e8f0' }}
                labelStyle={{ color: '#64748b' }}
              />
            </PieChart>
          </ResponsiveContainer>
        );

      case 'graph':
        return (
          <ResponsiveContainer {...commonProps}>
            <ComposedChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 10 }}
                interval={1}
              />
              <YAxis hide />
              <Tooltip
                contentStyle={{ background: 'white', border: '1px solid #e2e8f0' }} 
                labelStyle={{ color: '#64748b' }}
              />
              <Area
                type="monotone"
                dataKey="total"
                stroke={COLORS.total}
                fill={`${COLORS.total}20`}
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="completed"
                stroke={COLORS.success}
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="inProgress"
                stroke={COLORS.inProgress}
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="pending"
                stroke={COLORS.pending}
                strokeWidth={2}
                dot={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        );
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600';
      case 'cancelled':
        return 'text-red-600';
      case 'pending':
        return 'text-yellow-600';
      case 'in-progress':
        return 'text-blue-600';
      case 'active':
        return 'text-blue-600';
      case 'total':
        return 'text-gray-600';
      default:
        return 'text-brand-black';
    }
  };

  return (
    <div className={`bg-white p-6 rounded-lg shadow-sm border border-gray-200 transition-all duration-300 hover:shadow-md`}>
      <div className="flex items-center gap-3 mb-4">
        <div className={`p-3 ${bgColor} rounded-lg transition-colors duration-300`}>
          <Icon className="h-6 w-6 text-brand-black" />
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500">{label}</h3>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-semibold text-brand-black">{value}</span>
            {trend && trendValue && (
              <div className="flex items-center gap-1">
                {trend === 'up' ? 
                  <TrendingUp className="w-4 h-4 text-green-600" /> : 
                  <TrendingDown className="w-4 h-4 text-red-600" />
                }
                <span className={`text-sm ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                  {trendValue}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {chartData && (
        <div className="mt-4 -mx-2">
          {renderChart()}
        </div>
      )}

      {subStats && (
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100 mt-4">
          {subStats.map((stat) => (
            <div key={stat.label} className="flex flex-col">
              <p className="text-xs text-gray-500">{stat.label}</p>
              <p className={`text-sm font-medium ${getStatusColor(stat.status)}`}>
                {stat.value}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default StatsCard;