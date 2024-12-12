import { useGoogleAuthStore } from '../store/googleAuthStore';

export const googleAuthService = {
  async initGoogleAuth() {
    return new Promise((resolve, reject) => {
      gapi.load('client:auth2', async () => {
        try {
          await gapi.client.init({
            apiKey: import.meta.env.VITE_GOOGLE_API_KEY,
            clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID,
            scope: 'https://www.googleapis.com/auth/drive.file',
          });
          resolve(true);
        } catch (error) {
          reject(error);
        }
      });
    });
  },

  async signIn() {
    if (!gapi.auth2) {
      await this.initGoogleAuth();
    }
    const authInstance = gapi.auth2.getAuthInstance();
    const user = await authInstance.signIn();
    const authResponse = user.getAuthResponse(true);
    useGoogleAuthStore.getState().setTokens(authResponse);
    return authResponse;
  },

  async signOut() {
    if (!gapi.auth2) {
      await this.initGoogleAuth();
    }
    const authInstance = gapi.auth2.getAuthInstance();
    await authInstance.signOut();
    useGoogleAuthStore.getState().clearTokens();
  },

  isSignedIn() {
    if (!gapi.auth2) return false;
    const authInstance = gapi.auth2.getAuthInstance();
    return authInstance.isSignedIn.get();
  },
};