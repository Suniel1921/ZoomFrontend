import { useGoogleAuthStore } from '../store/googleAuthStore';

const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const SCOPES = 'https://www.googleapis.com/auth/drive.file';

export const googleDriveService = {
  async initClient() {
    return new Promise((resolve, reject) => {
      gapi.load('client:auth2', async () => {
        try {
          await gapi.client.init({
            apiKey: API_KEY,
            clientId: CLIENT_ID,
            scope: SCOPES,
            discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest']
          });

          // Listen for sign-in state changes
          gapi.auth2.getAuthInstance().isSignedIn.listen((isSignedIn) => {
            useGoogleAuthStore.getState().setIsAuthenticated(isSignedIn);
          });

          // Handle initial sign-in state
          useGoogleAuthStore.getState().setIsAuthenticated(
            gapi.auth2.getAuthInstance().isSignedIn.get()
          );

          resolve(true);
        } catch (error) {
          console.error('Error initializing Google Drive client:', error);
          reject(error);
        }
      });
    });
  },

  async signIn() {
    if (!gapi.auth2) {
      await this.initClient();
    }
    try {
      const googleAuth = gapi.auth2.getAuthInstance();
      const user = await googleAuth.signIn();
      return user.getAuthResponse(true);
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  },

  async signOut() {
    if (!gapi.auth2) return;
    try {
      const googleAuth = gapi.auth2.getAuthInstance();
      await googleAuth.signOut();
      useGoogleAuthStore.getState().setIsAuthenticated(false);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  },

  async createFolder(name: string, parentId?: string) {
    try {
      const fileMetadata = {
        name,
        mimeType: 'application/vnd.google-apps.folder',
        ...(parentId && { parents: [parentId] })
      };

      const response = await gapi.client.drive.files.create({
        resource: fileMetadata,
        fields: 'id'
      });

      return response.result.id;
    } catch (error) {
      console.error('Error creating folder:', error);
      throw error;
    }
  },

  async uploadFile(file: File, folderId?: string) {
    try {
      // Ensure user is authenticated
      if (!gapi.auth2.getAuthInstance().isSignedIn.get()) {
        await this.signIn();
      }

      const metadata = {
        name: file.name,
        ...(folderId && { parents: [folderId] })
      };

      const form = new FormData();
      form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
      form.append('file', file);

      const accessToken = gapi.auth.getToken().access_token;
      const response = await fetch(
        'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink,webContentLink',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          body: form,
        }
      );

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      return {
        id: result.id,
        name: result.name,
        viewLink: result.webViewLink,
        downloadLink: result.webContentLink
      };
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  },

  async deleteFile(fileId: string) {
    try {
      await gapi.client.drive.files.delete({
        fileId: fileId
      });
    } catch (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
  },

  async listFiles(folderId: string) {
    try {
      const response = await gapi.client.drive.files.list({
        q: `'${folderId}' in parents`,
        fields: 'files(id, name, webViewLink, webContentLink)',
        spaces: 'drive'
      });

      return response.result.files.map(file => ({
        id: file.id,
        name: file.name,
        viewLink: file.webViewLink,
        downloadLink: file.webContentLink
      }));
    } catch (error) {
      console.error('Error listing files:', error);
      throw error;
    }
  }
};