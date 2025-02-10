// import { LucideIcon } from 'lucide-react';

// interface SubStat {
//   label: string;
//   value: number | string;
// }

// interface StatsCardProps {
//   label: string;
//   value: string | number;
//   icon: LucideIcon;
//   trend?: 'up' | 'down';
//   trendValue?: string;
//   subStats?: SubStat[];
// }

// export default function StatsCard({ 
//   label, 
//   value, 
//   icon: Icon,
//   trend, 
//   trendValue,
//   subStats 
// }: StatsCardProps) {
//   return (
//     <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
//       <div className="flex items-center gap-3 mb-4">
//         <div className="p-3 bg-brand-yellow/10 rounded-lg">
//           <Icon className="h-6 w-6 text-brand-black" />
//         </div>
//         <div>
//           <h3 className="text-sm font-medium text-gray-500">{label}</h3>
//           <div className="mt-1 flex items-baseline gap-2">
//             <span className="text-2xl font-semibold text-brand-black">{value}</span>
//             {trend && trendValue && (
//               <span className={`text-sm ${
//                 trend === 'up' ? 'text-green-600' : 'text-red-600'
//               }`}>
//                 {trendValue}
//               </span>
//             )}
//           </div>
//         </div>
//       </div>

//       {subStats && (
//         <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
//           {subStats.map((stat) => (
//             <div key={stat.label}>
//               <p className="text-xs text-gray-500">{stat.label}</p>
//               <p className="text-sm font-medium text-brand-black">{stat.value}</p>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }







// ***********************************chart in four card*******************************





import { DivideIcon as LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, ResponsiveContainer, Tooltip, Cell } from 'recharts';

interface SubStat {
  label: string;
  value: number | string;
  status?: 'completed' | 'cancelled';
}

interface StatsCardProps {
  label: string;
  value: string | number;
  icon: typeof LucideIcon;
  trend?: 'up' | 'down';
  trendValue?: string;
  subStats?: SubStat[];
  chartType?: 'line' | 'area' | 'bar' | 'pie';
  chartData?: any[];
  bgColor?: string;
}

const COLORS = ['#6366f1', '#10b981', '#ef4444', '#f59e0b'];

function StatsCard({ 
  label, 
  value, 
  icon: Icon,
  trend, 
  trendValue,
  subStats,
  chartType,
  chartData,
  bgColor = "bg-brand-yellow/10"
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
                stroke="#6366f1" 
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
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke="#10b981" 
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
            <BarChart data={chartData}>
              <Bar 
                dataKey="value" 
                fill="#fedc00"
                radius={[4, 4, 0, 0]}
                animationDuration={1000}
              />
              <Tooltip 
                contentStyle={{ background: 'white', border: '1px solid #e2e8f0' }}
                labelStyle={{ color: '#64748b' }}
              />
            </BarChart>
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
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ background: 'white', border: '1px solid #e2e8f0' }}
                labelStyle={{ color: '#64748b' }}
              />
            </PieChart>
          </ResponsiveContainer>
        );
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
                <span className={`text-sm ${
                  trend === 'up' ? 'text-green-600' : 'text-red-600'
                }`}>
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
              <p className={`text-sm font-medium ${
                stat.status === 'completed' ? 'text-green-600' : 
                stat.status === 'cancelled' ? 'text-red-600' : 
                'text-brand-black'
              }`}>
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