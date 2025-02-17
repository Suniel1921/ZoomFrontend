

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
  
  





import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

export const SkeletonWelcome = () => (
  <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200 animate-pulse">
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
      <div className="space-y-3">
        <Skeleton height={24} width={192} />
        <Skeleton height={16} width={144} />
      </div>
      <div className="space-y-2">
        <Skeleton height={12} width={96} />
        <Skeleton height={20} width={128} />
      </div>
    </div>
  </div>
)

export const SkeletonStatsCard = () => (
  <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 animate-pulse">
    <div className="flex justify-between items-start">
      <div className="space-y-3 w-full">
        <Skeleton height={16} width={96} />
        <Skeleton height={24} width={64} />
        <Skeleton height={12} width={128} />
      </div>
      <Skeleton circle height={32} width={32} />
    </div>
  </div>
)

export const SkeletonSection = () => (
  <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200 animate-pulse">
    <Skeleton height={24} width={128} className="mb-4" />
    <div className="space-y-4">
      {[1, 2].map((i) => (
        <div key={i} className="flex items-center space-x-4">
          <Skeleton circle height={48} width={48} />
          <div className="flex-1 space-y-2">
            <Skeleton height={16} width="75%" />
            <Skeleton height={12} width="50%" />
          </div>
        </div>
      ))}
    </div>
  </div>
)
