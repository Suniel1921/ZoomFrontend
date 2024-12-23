

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



// **************BOTH CONTEXT ARE OK AND WORKING **************




// import { createContext, useContext, useEffect, useState } from 'react';

// const AppointmentContext = createContext<any>(null);

// const AppointmentProvider = ({ children }: { children: React.ReactNode }) => {
//   const [appointmentData, setAppointmentData] = useState<any[]>(() => {
//     // Retrieve appointments from localStorage on initial load
//     const storedData = localStorage.getItem('appointments');
//     return storedData ? JSON.parse(storedData) : [];
//   });

//   useEffect(() => {
//     // Update localStorage whenever appointmentData changes
//     localStorage.setItem('appointments', JSON.stringify(appointmentData));
//   }, [appointmentData]);

//   return (
//     <AppointmentContext.Provider value={{ appointmentData, setAppointmentData }}>
//       {children}
//     </AppointmentContext.Provider>
//   );
// };

// const useAppointmentGlobally = () => useContext(AppointmentContext);

// export { AppointmentProvider, useAppointmentGlobally };
