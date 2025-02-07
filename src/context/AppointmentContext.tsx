

import { createContext, useContext, useState } from 'react';

const AppointmentContext = createContext<any>(null);

const AppointmentProvider = ({ children }: { children: React.ReactNode }) => {
  const [appointmentData, setAppointmentData] = useState<any>([]);

  return (
    <AppointmentContext.Provider value={{ appointmentData, setAppointmentData }}>
      {children}
    </AppointmentContext.Provider>
  );
};

const useAppointmentGlobally = () => useContext(AppointmentContext);

export { AppointmentProvider, useAppointmentGlobally };
