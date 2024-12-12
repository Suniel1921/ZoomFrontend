import { openDB, IDBPDatabase } from 'idb';

const DB_NAME = 'FileStorage';
const STORE_NAME = 'files';
const DB_VERSION = 1;

async function getDB(): Promise<IDBPDatabase> {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('uploadedAt', 'uploadedAt');
      }
    },
  });
}

export const fileStorageService = {
  async uploadFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = async () => {
        try {
          const db = await getDB();
          const id = crypto.randomUUID();
          
          await db.put(STORE_NAME, {
            id,
            name: file.name,
            type: file.type,
            data: reader.result,
            uploadedAt: new Date().toISOString()
          });
          
          resolve(id);
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  },

  async getFile(id: string): Promise<{ data: string; type: string; name: string } | null> {
    try {
      const db = await getDB();
      const file = await db.get(STORE_NAME, id);
      return file ? { data: file.data, type: file.type, name: file.name } : null;
    } catch (error) {
      console.error('Error getting file:', error);
      return null;
    }
  },

  async deleteFile(id: string): Promise<void> {
    try {
      const db = await getDB();
      await db.delete(STORE_NAME, id);
    } catch (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
  },

  async getFileUrl(id: string): Promise<string> {
    const file = await this.getFile(id);
    if (!file) throw new Error('File not found');
    return file.data;
  }
};