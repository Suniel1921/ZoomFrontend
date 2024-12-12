import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface GoogleAuthState {
  isAuthenticated: boolean;
  setIsAuthenticated: (status: boolean) => void;
}

export const useGoogleAuthStore = create<GoogleAuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      setIsAuthenticated: (status) => set({ isAuthenticated: status }),
    }),
    {
      name: 'google-auth-store',
    }
  )
);