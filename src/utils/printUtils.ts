import type { Client } from '../types';

export function formatJapaneseAddress(client: Client): string {
  const { address, name, phone } = client;
  
  // Format postal code with 〒
  const postalCode = `〒${address.postalCode.slice(0, 3)}-${address.postalCode.slice(3)}`;
  
  // Combine address parts with proper spacing
  const fullAddress = [
    address.prefecture,
    address.city,
    address.street,
    address.building
  ].filter(Boolean).join(' ');

  // Create the formatted text
  return `${postalCode}
${fullAddress}

${name}

${phone}`;
}

export function downloadAddressFile(content: string, clientName: string): void {
  // Create a Blob with the content
  const blob = new Blob([content], { type: 'text/plain' });
  
  // Create a URL for the Blob
  const url = URL.createObjectURL(blob);
  
  // Create a temporary link element
  const link = document.createElement('a');
  link.href = url;
  link.download = `${clientName}_address.txt`;
  
  // Append link to body, click it, and remove it
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Clean up the URL object
  URL.revokeObjectURL(url);
}