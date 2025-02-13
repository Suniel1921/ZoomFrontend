

import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const ClientTableSkeleton = () => {
    return (
        <div>
            {/* Skeleton for table header */}
            <Skeleton height={50} width="100%" className="mb-4" />

            {/* Skeleton for table rows */}
            {[...Array(12)].map((_, i) => (
                <div key={i} className="mb-2">
                    <Skeleton height={50} />
                </div>
            ))}
        </div>
    );
};

export default ClientTableSkeleton;
