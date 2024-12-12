import { Printer } from 'lucide-react';
import Button from './Button';
import { formatJapaneseAddress, downloadAddressFile } from '../utils/printUtils';
import type { Client } from '../types';

interface PrintAddressButtonProps {
  client: Client;
}

export default function PrintAddressButton({ client }: PrintAddressButtonProps) {
  const handlePrint = () => {
    const formattedAddress = formatJapaneseAddress(client);
    downloadAddressFile(formattedAddress, client.name);
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handlePrint}
      title="Print Address"
    >
      <Printer className="h-4 w-4" />
    </Button>
  );
}