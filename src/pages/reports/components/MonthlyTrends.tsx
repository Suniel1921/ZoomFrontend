import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format, startOfMonth, endOfMonth, eachMonthOfInterval } from 'date-fns';
import { safeParse } from '../../../utils/dateUtils';
import type { Application, JapanVisitApplication, Translation, GraphicDesignJob } from '../../../types';

interface MonthlyTrendsProps {
  applications: Application[];
  japanVisitApplications: JapanVisitApplication[];
  translations: Translation[];
  graphicDesignJobs: GraphicDesignJob[];
  period: string;
  dateRange: {
    start: Date;
    end: Date;
  };
}

export default function MonthlyTrends({ 
  applications, 
  japanVisitApplications,
  translations,
  graphicDesignJobs,
  period, 
  dateRange 
}: MonthlyTrendsProps) {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    const months = eachMonthOfInterval({
      start: dateRange.start,
      end: dateRange.end
    });

    const monthlyData = months.map(month => {
      const monthStart = startOfMonth(month);
      const monthEnd = endOfMonth(month);

      // Filter items for the current month
      const monthApplications = applications.filter(app => {
        const appDate = safeParse(app.submissionDate);
        return appDate && appDate >= monthStart && appDate <= monthEnd;
      });

      const monthJapanVisit = japanVisitApplications.filter(app => {
        const appDate = safeParse(app.date);
        return appDate && appDate >= monthStart && appDate <= monthEnd;
      });

      const monthTranslations = translations.filter(trans => {
        const transDate = safeParse(trans.createdAt);
        return transDate && transDate >= monthStart && transDate <= monthEnd;
      });

      const monthDesigns = graphicDesignJobs.filter(job => {
        const jobDate = safeParse(job.createdAt);
        return jobDate && jobDate >= monthStart && jobDate <= monthEnd;
      });

      // Calculate revenue
      const visaRevenue = monthApplications.reduce((total, app) => total + (app.payment?.total || 0), 0);
      const japanVisitRevenue = monthJapanVisit.reduce((total, app) => total + app.amount, 0);
      const translationRevenue = monthTranslations.reduce((total, trans) => total + trans.amount, 0);
      const designRevenue = monthDesigns.reduce((total, job) => total + job.amount, 0);

      return {
        name: format(month, 'MMM yyyy'),
        'Visa Applications': monthApplications.length,
        'Japan Visit': monthJapanVisit.length,
        'Translations': monthTranslations.length,
        'Design Jobs': monthDesigns.length,
        'Total Revenue': visaRevenue + japanVisitRevenue + translationRevenue + designRevenue,
      };
    });

    setData(monthlyData);
  }, [applications, japanVisitApplications, translations, graphicDesignJobs, dateRange, period]);

  return (
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis yAxisId="left" />
          <YAxis yAxisId="right" orientation="right" />
          <Tooltip />
          <Legend />
          <Line yAxisId="left" type="monotone" dataKey="Visa Applications" stroke="#FEDC00" />
          <Line yAxisId="left" type="monotone" dataKey="Japan Visit" stroke="#010101" />
          <Line yAxisId="left" type="monotone" dataKey="Translations" stroke="#666666" />
          <Line yAxisId="left" type="monotone" dataKey="Design Jobs" stroke="#999999" />
          <Line yAxisId="right" type="monotone" dataKey="Total Revenue" stroke="#4CAF50" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}