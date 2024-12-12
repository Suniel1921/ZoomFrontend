import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { generateUUID } from '../utils/cryptoPolyfill';
import type { TaskFile } from '../types/googleDrive';

interface FileStore {
  files: TaskFile[];
  addFile: (file: Omit<TaskFile, 'id' | 'uploadedAt'>) => void;
  deleteFile: (id: string) => void;
  getFilesByTask: (taskId: string, taskType: TaskFile['taskType']) => TaskFile[];
  getFilesByClient: (clientId: string) => TaskFile[];
}

export const useFileStore = create<FileStore>()(
  persist(
    (set, get) => ({
      files: [],

      addFile: (file) =>
        set((state) => ({
          files: [
            ...state.files,
            {
              ...file,
              id: generateUUID(),
              uploadedAt: new Date().toISOString(),
            },
          ],
        })),

      deleteFile: (id) =>
        set((state) => ({
          files: state.files.filter((file) => file.id !== id),
        })),

      getFilesByTask: (taskId, taskType) => {
        const { files } = get();
        return files.filter(
          (file) => file.taskId === taskId && file.taskType === taskType
        );
      },

      getFilesByClient: (clientId) => {
        const { files } = get();
        return files.filter((file) => file.clientId === clientId);
      },
    }),
    {
      name: 'file-store',
    }
  )
);