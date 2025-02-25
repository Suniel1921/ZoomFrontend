import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Mail, Eye, EyeOff } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuthGlobally } from "../context/AuthContext";
import CreateClientAccountModal from "./components/CreateClientAccountModal";
import ForgotPasswordModal from "./ForgotPasswordModal";

const API_URL = import.meta.env.VITE_REACT_APP_URL;

export default function ClientLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  const [isCreateAccountModalOpen, setIsCreateAccountModalOpen] = useState(false);
  const [isForgotPasswordModalOpen, setIsForgotPasswordModalOpen] = useState(false);

  const navigate = useNavigate();
  const [auth, setAuthGlobally] = useAuthGlobally();

  // Check authentication and handle redirects
  useEffect(() => {
    const checkAuth = () => {
      const tokenData = localStorage.getItem("token");
      if (tokenData) {
        try {
          const { user, token } = JSON.parse(tokenData);
          if (user && user.role && token) {
            // Valid token exists, redirect based on role
            const redirectPath =
              user.role === "user" ? "/client-portal" : "/dashboard";
            navigate(redirectPath, { replace: true }); // Replace to avoid stacking history
            return; // Exit early to prevent rendering login page
          } else {
            // Invalid token structure, clear it
            localStorage.removeItem("token");
            setAuthGlobally({ user: null, role: null, token: null });
          }
        } catch (err) {
          console.error("Error parsing token:", err);
          localStorage.removeItem("token"); // Clear invalid token
          setAuthGlobally({ user: null, role: null, token: null });
        }
      }
      // No valid token or token cleared, proceed to show login page
      setIsCheckingAuth(false);
    };

    checkAuth();

    // Fallback timeout to ensure page renders if something goes wrong
    const timeout = setTimeout(() => {
      if (isCheckingAuth) {
        console.warn("Auth check timed out, showing login page");
        setIsCheckingAuth(false);
      }
    }, 3000);

    return () => clearTimeout(timeout);
  }, [navigate, setAuthGlobally]);

  // Handle login form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await axios.post(`${API_URL}/api/v1/auth/login`, {
        email,
        password,
      });
      if (response.data.success) {
        toast.success(response.data.message);
        const authData = {
          user: response.data.user,
          role: response.data.user.role,
          token: response.data.token,
        };
        setAuthGlobally(authData);
        localStorage.setItem("token", JSON.stringify(authData));
        axios.defaults.headers.common["Authorization"] = authData.token;

        const redirectPath =
          authData.role === "admin" || authData.role === "superadmin"
            ? "/dashboard"
            : "/client-portal";
        navigate(redirectPath, { replace: true });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed.");
    } finally {
      setIsLoading(false);
    }
  };

  // Loading state during auth check
  if (isCheckingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <svg
          className="animate-spin h-8 w-8 text-yellow-500"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      </div>
    );
  }

  // Render login UI
  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      {/* Branding Section */}
      <div className="w-full md:w-1/2 bg-black text-white flex flex-col justify-center items-center p-6 md:px-10">
        <div className="max-w-lg text-center py-8 md:py-0">
          <div className="flex justify-center items-center gap-4 mb-8 md:mb-14">
            <img className="w-96" src="./logo2.png" alt="Zoom CRM Logo" />
          </div>
          <div className="hidden md:block">
            <p className="text-[37px] font-medium mb-8">
              Transform Your Business with Smart Solutions
            </p>
            <p className="text-lg leading-relaxed text-gray-400">
              Streamline your customer relationships, boost productivity, and
              drive growth with our powerful CRM platform.
            </p>
          </div>
        </div>
      </div>

      {/* Login Form Section */}
      <div className="w-full md:w-1/2 bg-white flex flex-col justify-center px-6 md:px-10 py-8">
        <div className="max-w-md mx-auto w-full">
          <h3 className="text-2xl md:text-3xl font-bold text-black mb-8 text-center">
            Welcome Back
          </h3>
          <form onSubmit={handleSubmit} className="space-y-6 w-full">
            <div className="w-full">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-yellow-500 focus:border-yellow-500"
                  placeholder="Enter your email"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="password"
                  type={passwordVisible ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-yellow-500 focus:border-yellow-500"
                  placeholder="Enter your password"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  onClick={() => setPasswordVisible(!passwordVisible)}
                >
                  {passwordVisible ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-black text-yellow-400 py-3 px-4 rounded-lg font-medium hover:bg-gray-900 transition-colors duration-200 flex justify-center items-center disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center">
                  <svg
                    className="animate-spin h-5 w-5 mr-3 text-yellow-400"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Signing in...
                </div>
              ) : (
                "Sign In"
              )}
            </button>

            <p className="text-center text-sm text-gray-600">
              Don't have an account?{" "}
              <button
                type="button"
                className="font-medium text-yellow-600 hover:text-yellow-500"
                onClick={() => setIsCreateAccountModalOpen(true)}
                disabled={isLoading}
              >
                Sign up now
              </button>
            </p>

            <p
              onClick={() => setIsForgotPasswordModalOpen(true)}
              className="text-center text-sm text-yellow-600 cursor-pointer hover:text-yellow-500"
            >
              Forgot Password?
            </p>
          </form>
        </div>
      </div>

      {/* Modals */}
      <CreateClientAccountModal
        isOpen={isCreateAccountModalOpen}
        onClose={() => setIsCreateAccountModalOpen(false)}
      />
      <ForgotPasswordModal
        visible={isForgotPasswordModalOpen}
        onClose={() => setIsForgotPasswordModalOpen(false)}
      />
    </div>
  );
}









// *****************below code redirect dashbaord if login and above code not redirect but in mobile above code is working and below code not fix this later*************************








// import { useState, useEffect } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import { Lock, Mail, Eye, EyeOff } from "lucide-react";
// import axios from "axios";
// import toast from "react-hot-toast";
// import { useAuthGlobally } from "../context/AuthContext";
// import CreateClientAccountModal from "./components/CreateClientAccountModal";
// import ForgotPasswordModal from "./ForgotPasswordModal";

// const API_URL = import.meta.env.VITE_REACT_APP_URL;

// export default function ClientLogin() {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [passwordVisible, setPasswordVisible] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);
//   const [isCheckingAuth, setIsCheckingAuth] = useState(true);

//   const [isCreateAccountModalOpen, setIsCreateAccountModalOpen] = useState(false);
//   const [isForgotPasswordModalOpen, setIsForgotPasswordModalOpen] = useState(false);

//   const navigate = useNavigate();
//   const [auth, setAuthGlobally] = useAuthGlobally();

//   // Check authentication and handle redirects
//   useEffect(() => {
//     const checkAuth = () => {
//       const tokenData = localStorage.getItem("token");
//       if (tokenData) {
//         try {
//           const { user, token } = JSON.parse(tokenData);
//           if (user && user.role && token) {
//             // If user is already authenticated, redirect based on role
//             const redirectPath =
//               user.role === "user" ? "/client-portal" : "/dashboard";
//             navigate(redirectPath, { replace: true }); // Use replace to avoid stacking history
//             return;
//           } else {
//             // Invalid token structure, clear it and show login
//             localStorage.removeItem("token");
//             setAuthGlobally({ user: null, role: null, token: null });
//           }
//         } catch (err) {
//           console.error("Error parsing token:", err);
//           localStorage.removeItem("token"); // Clear invalid token
//           setAuthGlobally({ user: null, role: null, token: null });
//         }
//       }
//       setIsCheckingAuth(false); // No token or invalid token, show login page
//     };

//     checkAuth();

//     // Fallback timeout to prevent infinite loading
//     const timeout = setTimeout(() => {
//       if (isCheckingAuth) {
//         console.warn("Auth check timed out, showing login page");
//         setIsCheckingAuth(false);
//       }
//     }, 3000);

//     return () => clearTimeout(timeout);
//   }, [navigate, setAuthGlobally]);

//   // Handle login form submission
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setIsLoading(true);

//     try {
//       const response = await axios.post(`${API_URL}/api/v1/auth/login`, {
//         email,
//         password,
//       });
//       if (response.data.success) {
//         toast.success(response.data.message);
//         const authData = {
//           user: response.data.user,
//           role: response.data.user.role,
//           token: response.data.token,
//         };
//         setAuthGlobally(authData);
//         localStorage.setItem("token", JSON.stringify(authData));
//         axios.defaults.headers.common["Authorization"] = authData.token;

//         const redirectPath =
//           authData.role === "admin" || authData.role === "superadmin"
//             ? "/dashboard"
//             : "/client-portal";
//         navigate(redirectPath, { replace: true });
//       }
//     } catch (error) {
//       toast.error(error.response?.data?.message || "Login failed.");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // Loading state during auth check
//   if (isCheckingAuth) {
//     return (
//       <div className="flex min-h-screen items-center justify-center bg-white">
//         <svg
//           className="animate-spin h-8 w-8 text-yellow-500"
//           viewBox="0 0 24 24"
//         >
//           <circle
//             className="opacity-25"
//             cx="12"
//             cy="12"
//             r="10"
//             stroke="currentColor"
//             strokeWidth="4"
//           />
//           <path
//             className="opacity-75"
//             fill="currentColor"
//             d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
//           />
//         </svg>
//       </div>
//     );
//   }

//   // Render login UI
//   return (
//     <div className="flex min-h-screen flex-col md:flex-row">
//       {/* Branding Section */}
//       <div className="w-full md:w-1/2 bg-black text-white flex flex-col justify-center items-center p-6 md:px-10">
//         <div className="max-w-lg text-center py-8 md:py-0">
//           <div className="flex justify-center items-center gap-4 mb-8 md:mb-14">
//             <img className="w-96" src="./logo2.png" alt="Zoom CRM Logo" />
//           </div>
//           <div className="hidden md:block">
//             <p className="text-[37px] font-medium mb-8">
//               Transform Your Business with Smart Solutions
//             </p>
//             <p className="text-lg leading-relaxed text-gray-400">
//               Streamline your customer relationships, boost productivity, and
//               drive growth with our powerful CRM platform.
//             </p>
//           </div>
//         </div>
//       </div>

//       {/* Login Form Section */}
//       <div className="w-full md:w-1/2 bg-white flex flex-col justify-center px-6 md:px-10 py-8">
//         <div className="max-w-md mx-auto w-full">
//           <h3 className="text-2xl md:text-3xl font-bold text-black mb-8 text-center">
//             Welcome Back
//           </h3>
//           <form onSubmit={handleSubmit} className="space-y-6 w-full">
//             <div className="w-full">
//               <label
//                 htmlFor="email"
//                 className="block text-sm font-medium text-gray-700 mb-2"
//               >
//                 Email Address
//               </label>
//               <div className="relative">
//                 <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
//                 <input
//                   id="email"
//                   type="email"
//                   value={email}
//                   onChange={(e) => setEmail(e.target.value)}
//                   className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-yellow-500 focus:border-yellow-500"
//                   placeholder="Enter your email"
//                   required
//                   disabled={isLoading}
//                 />
//               </div>
//             </div>

//             <div>
//               <label
//                 htmlFor="password"
//                 className="block text-sm font-medium text-gray-700 mb-2"
//               >
//                 Password
//               </label>
//               <div className="relative">
//                 <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
//                 <input
//                   id="password"
//                   type={passwordVisible ? "text" : "password"}
//                   value={password}
//                   onChange={(e) => setPassword(e.target.value)}
//                   className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-yellow-500 focus:border-yellow-500"
//                   placeholder="Enter your password"
//                   required
//                   disabled={isLoading}
//                 />
//                 <button
//                   type="button"
//                   className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
//                   onClick={() => setPasswordVisible(!passwordVisible)}
//                 >
//                   {passwordVisible ? (
//                     <EyeOff className="h-5 w-5" />
//                   ) : (
//                     <Eye className="h-5 w-5" />
//                   )}
//                 </button>
//               </div>
//             </div>

//             <button
//               type="submit"
//               className="w-full bg-black text-yellow-400 py-3 px-4 rounded-lg font-medium hover:bg-gray-900 transition-colors duration-200 flex justify-center items-center disabled:opacity-50"
//               disabled={isLoading}
//             >
//               {isLoading ? (
//                 <div className="flex items-center">
//                   <svg
//                     className="animate-spin h-5 w-5 mr-3 text-yellow-400"
//                     viewBox="0 0 24 24"
//                   >
//                     <circle
//                       className="opacity-25"
//                       cx="12"
//                       cy="12"
//                       r="10"
//                       stroke="currentColor"
//                       strokeWidth="4"
//                     />
//                     <path
//                       className="opacity-75"
//                       fill="currentColor"
//                       d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
//                     />
//                   </svg>
//                   Signing in...
//                 </div>
//               ) : (
//                 "Sign In"
//               )}
//             </button>

//             <p className="text-center text-sm text-gray-600">
//               Don&apos;t have an account?{" "}
//               <button
//                 type="button"
//                 className="font-medium text-yellow-600 hover:text-yellow-500"
//                 onClick={() => setIsCreateAccountModalOpen(true)}
//                 disabled={isLoading}
//               >
//                 Sign up now
//               </button>
//             </p>

//             <p
//               onClick={() => setIsForgotPasswordModalOpen(true)}
//               className="text-center text-sm text-yellow-600 cursor-pointer hover:text-yellow-500"
//             >
//               Forgot Password?
//             </p>
//           </form>
//         </div>
//       </div>

//       {/* Modals */}
//       <CreateClientAccountModal
//         isOpen={isCreateAccountModalOpen}
//         onClose={() => setIsCreateAccountModalOpen(false)}
//       />
//       <ForgotPasswordModal
//         visible={isForgotPasswordModalOpen}
//         onClose={() => setIsForgotPasswordModalOpen(false)}
//       />
//     </div>
//   );
// }