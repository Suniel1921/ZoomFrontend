import axios from 'axios';

export interface AddressResponse {
  prefecture: string;
  city: string;
  town: string;
}

interface JapaneseAddressAPIResponse {
  data: {
    pref: string;
    city: string;
    town: string;
    townKana: string;
    zip: string;
  }[];
}

export async function fetchJapaneseAddress(postalCode: string): Promise<AddressResponse | null> {
  // Remove any non-numeric characters and ensure 7 digits
  const cleanPostalCode = postalCode.replace(/\D/g, '');
  if (cleanPostalCode.length !== 7) {
    return null;
  }

  try {
    const response = await axios.get<JapaneseAddressAPIResponse>(
      `https://api.translate-japanese-address.com/zip/assist/${cleanPostalCode}`
    );

    if (response.data.data && response.data.data.length > 0) {
      const address = response.data.data[0];
      return {
        prefecture: address.pref,
        city: address.city,
        town: address.town,
      };
    }

    return null;
  } catch (error) {
    console.error('Error fetching address:', error instanceof Error ? error.message : 'Unknown error');
    return null;
  }
}