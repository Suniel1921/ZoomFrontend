import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Translation {
  id: string;
  clientId: string;
  clientName: string;
  sourceLanguage: string;
  targetLanguage: string;
  targetName: string;
  pages: number;
  amount: number;
  paymentStatus: 'Due' | 'Paid';
  paymentMethod?: 'Counter Cash' | 'Bank Transfer' | 'Credit Card' | 'Paypay' | 'Line Pay';
  handledBy: string;
  deadline: string;
  translationStatus: 'Not Started' | 'Processing' | 'Completed' | 'Delivered';
  deliveryType: 'Office Pickup' | 'Sent on Email' | 'Sent on Viber' | 'Sent on Facebook' | 'By Post';
  notes?: string;
}

interface TranslationStore {
  translations: Translation[];
  addTranslation: (translation: Omit<Translation, 'id'>) => void;
  updateTranslation: (id: string, translation: Partial<Translation>) => void;
  deleteTranslation: (id: string) => void;
}

export const useTranslationStore = create<TranslationStore>()(
  persist(
    (set) => ({
      translations: [],
      
      addTranslation: (translation) =>
        set((state) => ({
          translations: [
            ...state.translations,
            { ...translation, id: crypto.randomUUID() },
          ],
        })),
      
      updateTranslation: (id, updates) =>
        set((state) => ({
          translations: state.translations.map((translation) =>
            translation.id === id
              ? { ...translation, ...updates }
              : translation
          ),
        })),
      
      deleteTranslation: (id) =>
        set((state) => ({
          translations: state.translations.filter(
            (translation) => translation.id !== id
          ),
        })),
    }),
    {
      name: 'translation-store',
    }
  )
);