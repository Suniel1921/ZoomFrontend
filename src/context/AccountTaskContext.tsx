import { createContext, useContext, useState } from 'react';

const AccountTaskContext = createContext<any>(null);

const AccountTaskProvider = ({ children }: { children: React.ReactNode }) => {
  const [accountTaskData, setAccountTaskData] = useState<any>([]);

  return (
    <AccountTaskContext.Provider value={{ accountTaskData, setAccountTaskData }}>
      {children}
    </AccountTaskContext.Provider>
  );
};

const useAccountTaskGlobally = () => useContext(AccountTaskContext);

export { AccountTaskProvider, useAccountTaskGlobally };