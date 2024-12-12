import { useMemo } from 'react';

interface AmountCellProps {
  amount: number | null | undefined;
  dueAmount: number | null | undefined;
}

export default function AmountCell({ amount, dueAmount }: AmountCellProps) {
  const formattedAmount = useMemo(() => {
    if (typeof amount !== 'number') return '0';
    return amount.toLocaleString();
  }, [amount]);

  const formattedDueAmount = useMemo(() => {
    if (typeof dueAmount !== 'number') return '0';
    return dueAmount.toLocaleString();
  }, [dueAmount]);

  return (
    <div>
      <p className="text-sm">Total: ¥{formattedAmount}</p>
      <p className="text-sm text-gray-500">Due: ¥{formattedDueAmount}</p>
    </div>
  );
}