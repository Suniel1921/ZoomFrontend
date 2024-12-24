// import { createContext, useContext, useState } from 'react';

// const AccountTaskContext = createContext<any>(null);

// const AccountTaskProvider = ({ children }: { children: React.ReactNode }) => {
//   const [accountTaskData, setAccountTaskData] = useState<any>([]);

//   return (
//     <AccountTaskContext.Provider value={{ accountTaskData, setAccountTaskData }}>
//       {children}
//     </AccountTaskContext.Provider>
//   );
// };

// const useAccountTaskGlobally = () => useContext(AccountTaskContext);

// export { AccountTaskProvider, useAccountTaskGlobally };







// import { createContext, useState, useContext } from 'react';

// interface AccountTaskContextType {
//   accountTaskData: any;
//   setAccountTaskData: React.Dispatch<React.SetStateAction<any>>;
//   selectedClientId: string;
//   setSelectedClientId: React.Dispatch<React.SetStateAction<string>>;
// }

// const AccountTaskContext = createContext<AccountTaskContextType | undefined>(undefined);

// export const useAccountTaskGlobally = () => {
//   const context = useContext(AccountTaskContext);
//   if (!context) {
//     throw new Error('useAccountTaskGlobally must be used within a AccountTaskProvider');
//   }
//   return context;
// };

// export const AccountTaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
//   const [accountTaskData, setAccountTaskData] = useState<any>(null);
//   const [selectedClientId, setSelectedClientId] = useState<string>('');

//   return (
//     <AccountTaskContext.Provider value={{ accountTaskData, setAccountTaskData, selectedClientId, setSelectedClientId }}>
//       {children}
//     </AccountTaskContext.Provider>
//   );
// };





import React, { createContext, useState, useContext } from 'react';

// Define the context type
interface AccountTaskContextType {
  accountTaskData: any; // You can define a more specific type for the task data
  setAccountTaskData: React.Dispatch<React.SetStateAction<any>>;
  selectedClientId: string;
  setSelectedClientId: React.Dispatch<React.SetStateAction<string>>;
}

const AccountTaskContext = createContext<AccountTaskContextType | undefined>(undefined);

export const useAccountTaskGlobally = () => {
  const context = useContext(AccountTaskContext);
  if (!context) {
    throw new Error('useAccountTaskGlobally must be used within a AccountTaskProvider');
  }
  return context;
};

export const AccountTaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [accountTaskData, setAccountTaskData] = useState<any>(null); // Use the appropriate type here
  const [selectedClientId, setSelectedClientId] = useState<string>('');

  return (
    <AccountTaskContext.Provider value={{ accountTaskData, setAccountTaskData, selectedClientId, setSelectedClientId }}>
      {children}
    </AccountTaskContext.Provider>
  );
};
