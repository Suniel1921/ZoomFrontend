

// export const SkeletonWelcome = () => (
//     <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200 animate-pulse">
//       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
//         <div className="space-y-3">
//           <div className="h-6 bg-gray-200 rounded w-48"></div>
//           <div className="h-4 bg-gray-200 rounded w-36"></div>
//         </div>
//         <div className="space-y-2">
//           <div className="h-3 bg-gray-200 rounded w-24"></div>
//           <div className="h-5 bg-gray-200 rounded w-32"></div>
//         </div>
//       </div>
//     </div>
//   )
  
//   export const SkeletonStatsCard = () => (
//     <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 animate-pulse">
//       <div className="flex justify-between items-start">
//         <div className="space-y-3 w-full">
//           <div className="h-4 bg-gray-200 rounded w-24"></div>
//           <div className="h-6 bg-gray-200 rounded w-16"></div>
//           <div className="h-3 bg-gray-200 rounded w-32"></div>
//         </div>
//         <div className="h-8 w-8 bg-gray-200 rounded"></div>
//       </div>
//     </div>
//   )
  
//   export const SkeletonSection = () => (
//     <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200 animate-pulse">
//       <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
//       <div className="space-y-4">
//         {[1, 2].map((i) => (
//           <div key={i} className="flex items-center space-x-4">
//             <div className="h-12 w-12 bg-gray-200 rounded"></div>
//             <div className="flex-1 space-y-2">
//               <div className="h-4 bg-gray-200 rounded w-3/4"></div>
//               <div className="h-3 bg-gray-200 rounded w-1/2"></div>
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   )
  
  



import Skeleton from "react-loading-skeleton"
import "react-loading-skeleton/dist/skeleton.css"

export const SkeletonWelcome = () => (
  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
    <div className="flex justify-between items-start">
      <div className="space-y-2">
        <Skeleton height={28} width={300} />
        <Skeleton height={20} width={200} />
      </div>
      <div className="text-right">
        <Skeleton height={16} width={100} />
        <Skeleton height={24} width={200} />
      </div>
    </div>
  </div>
)

export const SkeletonStatsCard = ({ showChart = false, chartType = "donut" }) => (
  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
    <div className="flex justify-between items-start">
      <div className="space-y-3">
        <Skeleton height={16} width={120} />
        <div className="flex items-baseline gap-2">
          <Skeleton height={32} width={80} />
          <Skeleton height={20} width={60} />
        </div>
      </div>
      {showChart && (
        <div className={chartType === "donut" ? "w-24 h-24" : "w-32 h-24"}>
          {chartType === "donut" ? (
            <Skeleton circle height={96} width={96} />
          ) : (
            <div className="flex items-end justify-between h-full gap-2">
              <Skeleton height={40} width={16} />
              <Skeleton height={60} width={16} />
              <Skeleton height={30} width={16} />
              <Skeleton height={50} width={16} />
            </div>
          )}
        </div>
      )}
    </div>
  </div>
)

export const SkeletonTable = () => (
  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
    <div className="space-y-6">
      <Skeleton height={28} width={200} />

      <div className="flex justify-between mb-6">
        <div className="flex gap-4">
          <Skeleton height={36} width={160} />
          <Skeleton height={36} width={160} />
        </div>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-7 gap-4">
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} height={20} />
          ))}
        </div>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="grid grid-cols-7 gap-4">
            {Array.from({ length: 7 }).map((_, j) => (
              <Skeleton key={j} height={24} />
            ))}
          </div>
        ))}
      </div>
    </div>
  </div>
)

export default function SkeletonDashboard() {
  return (
    <div className="space-y-6 p-6">
      <SkeletonWelcome />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <SkeletonStatsCard />
        <SkeletonStatsCard showChart chartType="donut" />
        <SkeletonStatsCard showChart chartType="bar" />
        <SkeletonStatsCard />
      </div>
      <SkeletonTable />
    </div>
  )
}

