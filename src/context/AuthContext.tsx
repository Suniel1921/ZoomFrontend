import axios from "axios";
import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(() => {
    const storedAuth = localStorage.getItem("token");
    if (storedAuth) {
      const parsedData = JSON.parse(storedAuth);
      axios.defaults.headers.common["Authorization"] = `Bearer ${parsedData.token}`;
      return { user: parsedData.user, token: parsedData.token };
    }
    return { user: null, token: "" };
  });

  // Sync auth state with localStorage
  useEffect(() => {
    if (auth.token) {
      localStorage.setItem("token", JSON.stringify(auth));
      axios.defaults.headers.common["Authorization"] = `Bearer ${auth.token}`;
    } else {
      localStorage.removeItem("token");
      delete axios.defaults.headers.common["Authorization"];
    }
  }, [auth]);

  return (
    <AuthContext.Provider value={[auth, setAuth]}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the AuthContext
const useAuthGlobally = () => {
  return useContext(AuthContext);
};

export { AuthProvider, useAuthGlobally };
