
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
//             axios.defaults.headers.common['Authorization'] = parseData.token;
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











import axios from "axios";
import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
    const [auth, setAuth] = useState({
        user: null,
        token: '',
    });

    // Fetching user token from localStorage
    useEffect(() => {
        const data = localStorage.getItem('token');
        if (data) {
            const parseData = JSON.parse(data);
            setAuth({
                user: parseData.user,
                token: parseData.token,
            });
            axios.defaults.headers.common['Authorization'] = `Bearer ${parseData.token}`;
        }
    }, []);
    

    return (
        <AuthContext.Provider value={[auth, setAuth]}>
            {children}
        </AuthContext.Provider>
    );
};

// Custom hook
const useAuthGlobally = () => {
    return useContext(AuthContext);
};

export { AuthProvider, AuthContext, useAuthGlobally };
