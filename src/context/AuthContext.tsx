
// // import axios from "axios";
// // import { createContext, useContext, useEffect, useState } from "react";

// // const AuthContext = createContext();

// // const AuthProvider = ({ children }) => {
// //     const [auth, setAuth] = useState({
// //         user: null,
// //         token: '',
// //     });

// //     // Fetching user token from localStorage
// //     useEffect(() => {
// //         const data = localStorage.getItem('token');
// //         if (data) {
// //             const parseData = JSON.parse(data);
// //             setAuth({
// //                 user: parseData.user,
// //                 token: parseData.token,
// //             });
// //             axios.defaults.headers.common['Authorization'] = parseData.token;
// //         }
// //     }, []);

// //     return (
// //         <AuthContext.Provider value={[auth, setAuth]}>
// //             {children}
// //         </AuthContext.Provider>
// //     );
// // };

// // // Custom hook
// // const useAuthGlobally = () => {
// //     return useContext(AuthContext);
// // };

// // export { AuthProvider, AuthContext, useAuthGlobally };











// import axios from "axios";
// import { createContext, useContext, useEffect, useState } from "react";

// const AuthContext = createContext();

// const AuthProvider = ({ children }) => {
//     const [auth, setAuth] = useState({
//         user: null,
//         token: '',
//     });

//     // Fetching user token from localStorage
//     useEffect(() => {
//         const data = localStorage.getItem('token');
//         if (data) {
//             const parseData = JSON.parse(data);
//             setAuth({
//                 user: parseData.user,
//                 token: parseData.token,
//             });
//             axios.defaults.headers.common['Authorization'] = `Bearer ${parseData.token}`;
//         }
//     }, []);
    

//     return (
//         <AuthContext.Provider value={[auth, setAuth]}>
//             {children}
//         </AuthContext.Provider>
//     );
// };

// // Custom hook
// const useAuthGlobally = () => {
//     return useContext(AuthContext);
// };

// export { AuthProvider, AuthContext, useAuthGlobally };



// ********once user is logged in then dont redirect on login page fixed code*******





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
