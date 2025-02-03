import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Lock, Mail, Eye, EyeOff, Zap } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuthGlobally } from '../context/AuthContext';
import CreateClientAccountModal from "./components/CreateClientAccountModal";
import ForgotPasswordModal from "./ForgotPasswordModal";

export default function ClientLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // New loading state
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [auth, setAuthGlobally] = useAuthGlobally();
  const [isCreateAccountModalOpen, setIsCreateAccountModalOpen] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);




// useEffect(() => {
//   const token = localStorage.getItem('token');
//   if (token) {
//     try {
//       const user = JSON.parse(token).user;
//       if (user.role === 'admin' || user.role === 'superadmin') {
//         navigate('/dashboard');
//       } else {
//         navigate('/client-portal');
//       }
//     } catch (err) {
//       console.error("Error parsing token:", err);
//     }
//   }
//   setIsCheckingAuth(false); // Ensure the page is rendered once the check is complete
// }, [navigate]);



useEffect(() => {
  const tokenData = localStorage.getItem('token');
  if (tokenData) {
    try {
      const parsedToken = JSON.parse(tokenData);
      if (parsedToken.user) {
        if (parsedToken.user.role === 'admin' || parsedToken.user.role === 'superadmin') {
          navigate('/dashboard');
        } else {
          navigate('/client-portal');
        }
      }
    } catch (err) {
      console.error("Error parsing token:", err);
    }
  }
  setIsCheckingAuth(false);
}, [navigate]);




if (isCheckingAuth) {
  return <div>Loading...</div>; // Render a loading spinner or similar UI
}



  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true); // Set loading to true when the request starts

    try {
      const response = await axios.post(`${import.meta.env.VITE_REACT_APP_URL}/api/v1/auth/login`, { email, password });
      if (response.data.success) {
        toast.success(response.data.message);
        setAuthGlobally({
          ...auth,
          user: response.data.user,
          role: response.data.user.role,
          token: response.data.token,
        });
        localStorage.setItem('token', JSON.stringify(response.data));
        axios.defaults.headers.common['Authorization'] = response.data.token;
        navigate(response.data.user.role === 'admin' || response.data.user.role === 'superadmin' ? '/dashboard' : '/client-portal');
      }
    } catch (error) {
      if (error.response && error.response.data && error.response.data.message) {
        toast.error(error.response.data.message);
      }
    } finally {
      setIsLoading(false); // Set loading to false when the request completes
    }
  };

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      {/* Branding - Shows at top on mobile, left side on desktop */}
      <div className="w-full md:w-1/2 bg-black text-white flex flex-col justify-center items-center p-6 md:px-10">
        <div className="max-w-lg text-center py-8 md:py-0">
          <div className="flex justify-center items-center gap-4 mb-8 md:mb-14">
            {/* <span><Zap className="h-8 w-8 md:h-12 md:w-12 text-yellow-500" /></span> */}
            <img className="w-96" src="./logo2.png" alt="" />
            {/* <h1 className="text-3xl md:text-5xl font-bold text-yellow-500">Zoom CRM</h1> */}
          </div>

          <div className="hidden md:block">
            <p className="text-[37px] font-medium mb-8">Transform Your Business with Smart Solutions</p>
            <p className="text-lg leading-relaxed text-gray-400">
              Streamline your customer relationships, boost productivity, and drive growth with our powerful CRM platform.
            </p>
          </div>
        </div>
      </div>

      {/* Login Form */}
      <div className="w-full md:w-1/2 bg-white flex flex-col justify-center px-6 md:px-10 py-8">
        <div className="max-w-md mx-auto w-full">
          <h3 className="text-2xl md:text-3xl font-bold text-black mb-8 text-center">Welcome Back</h3>
          <form onSubmit={handleSubmit} className="space-y-6 w-full">
            <div className="w-full">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-yellow-500 focus:border-yellow-500"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  type={passwordVisible ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-yellow-500 focus:border-yellow-500"
                  placeholder="Enter your password"
                  required
                />
                <div
                  className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                  onClick={() => setPasswordVisible(!passwordVisible)}
                >
                  {passwordVisible ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-black text-yellow-400 py-3 px-4 rounded-lg font-medium hover:bg-gray-900 transition-colors duration-200 flex justify-center items-center"
              disabled={isLoading} // Disable the button when loading
            >
              {isLoading ? (
                <div className="flex items-center">
                  <svg className="animate-spin h-5 w-5 mr-3 text-yellow-400" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
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
              >
                Sign up now
              </button>
            </p>

            <p onClick={() => setModalVisible(true)} className="text-center text-sm text-yellow-600">
              <a className="hover:text-yellow-500 cursor-pointer">
                Forgot Password?
              </a>
            </p>
          </form>
        </div>
      </div>

      {/* Modals */}
      <CreateClientAccountModal
        isOpen={isCreateAccountModalOpen}
        onClose={() => setIsCreateAccountModalOpen(false)}
      />
      <ForgotPasswordModal visible={modalVisible} onClose={() => setModalVisible(false)} />
    </div>
  );
}




        



// *************water wave effect with left and right section***********

// import { useState } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import { Lock, Mail, Zap } from "lucide-react";
// import axios from "axios"; 
// import toast from "react-hot-toast";
// import { useAuthGlobally } from '../context/AuthContext';
// import CreateClientAccountModal from "./components/CreateClientAccountModal";
// import WaterWave from "react-water-wave";
// // import waveImage from "/water.jpg"; 
// // import waveImage from "/water1.jpg"; 
// // import waveImage from "/water2.jpg"; 
// // import waveImage from "/water3.jpg"; 
// // import waveImage from "/water4.jpg"; 
// // import waveImage from "/water5.jpg"; 
// import waveImage from "/water6.jpg"; 


// export default function ClientLogin() {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const navigate = useNavigate();
//   const [error, setError] = useState('');
//   const [auth, setAuthGlobally] = useAuthGlobally();
//   const [isCreateAccountModalOpen, setIsCreateAccountModalOpen] = useState(false);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError('');

//     try {
//       const response = await axios.post(`${import.meta.env.VITE_REACT_APP_URL}/api/v1/auth/login`, { email, password });
//       if (response.data.success) {
//         toast.success(response.data.message);
//         setAuthGlobally({
//           ...auth,
//           user: response.data.user,
//           role: response.data.user.role,
//           token: response.data.token,
//         });
//         localStorage.setItem('token', JSON.stringify(response.data));
//         axios.defaults.headers.common['Authorization'] = response.data.token;
//         navigate(response.data.user.role === 'admin' || response.data.user.role === 'superadmin' ? '/dashboard' : '/client-portal');
//       }
//     } catch (error) {
//       if (error.response) {
//         toast.error(error.response.data.message);
//       }
//     }
//   };

//   return (
//     <div className="flex min-h-screen">
//       {/* Left Side - Branding with Water Wave */}
//       <div className="w-1/2 hidden md:flex">
//         <WaterWave
//           imageUrl={waveImage}
//           style={{ width: "100%", height: "100%" }}
//         >
//           {() => (
//             <div className="text-white flex flex-col justify-center items-center px-10 h-full">
//               <div className="max-w-lg text-center">
//                 <div className="flex justify-center items-center gap-4 mb-14">
//                   <span><Zap className="h-12 w-12 text-yellow-500" /></span>
//                   <h1 className="text-5xl font-bold text-yellow-500">Zoom CRM</h1>
//                 </div>
//                 <p className="text-[37px] font-medium mb-8">
//                   Transform Your Business with Smart Solutions
//                 </p>
//                 <p className="text-lg leading-relaxed text-gray-400 text-lg">
//                   Streamline your customer relationships, boost productivity, and drive growth with our powerful CRM platform.
//                 </p>
//               </div>
//             </div>
//           )}
//         </WaterWave>
//       </div>

//       {/* Right Side - Login Form */}
//       <div className="w-full md:w-1/2 bg-white flex flex-col justify-center px-10">
//         <div className="max-w-md mx-auto">
//           <h3 className="text-3xl font-bold text-black mb-8 text-center">Welcome Back</h3>
//           <form onSubmit={handleSubmit} className="space-y-6 w-full">
//             <div className="w-[444px]">
//               <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
//               <div className="relative">
//                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                   <Mail className="h-5 w-5 text-gray-400" />
//                 </div>
//                 <input
//                   id="email"
//                   type="email"
//                   value={email}
//                   onChange={(e) => setEmail(e.target.value)}
//                   className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-yellow-500 focus:border-yellow-500"
//                   placeholder="Enter your email"
//                   required
//                 />
//               </div>
//             </div>

//             <div>
//               <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">Password</label>
//               <div className="relative">
//                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                   <Lock className="h-5 w-5 text-gray-400" />
//                 </div>
//                 <input
//                   id="password"
//                   type="password"
//                   value={password}
//                   onChange={(e) => setPassword(e.target.value)}
//                   className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-yellow-500 focus:border-yellow-500"
//                   placeholder="Enter your password"
//                   required
//                 />
//               </div>
//             </div>

//             <button
//               type="submit"
//               className="w-full bg-black text-yellow-400 py-3 px-4 rounded-lg font-medium hover:bg-gray-900 transition-colors duration-200"
//             >
//               Sign In
//             </button>

//             <p className="text-center text-sm text-gray-600">
//               Don’t have an account?{" "}
//               <button
//                 type="button"
//                 className="font-medium text-yellow-600 hover:text-yellow-500"
//                 onClick={() => setIsCreateAccountModalOpen(true)} // Open modal
//               >
//                 Sign up now
//               </button>
//             </p>
//           </form>
//         </div>
//       </div>

//       {/* Sign Up Modal */}
//       <CreateClientAccountModal
//         isOpen={isCreateAccountModalOpen}
//         onClose={() => setIsCreateAccountModalOpen(false)}
//       />
//     </div>
//   );
// }















// ***************water wave effect in full page***********



// import { useState } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import { Lock, Mail, Zap } from "lucide-react";
// import axios from "axios";
// import toast from "react-hot-toast";
// import { useAuthGlobally } from "../context/AuthContext";
// import CreateClientAccountModal from "./components/CreateClientAccountModal";
// import WaterWave from "react-water-wave";
// // import waveImage from "/water6.jpg";
// import waveImage from "/water7.jpg";

// export default function ClientLogin() {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const navigate = useNavigate();
//   const [error, setError] = useState("");
//   const [auth, setAuthGlobally] = useAuthGlobally();
//   const [isCreateAccountModalOpen, setIsCreateAccountModalOpen] = useState(false);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError("");

//     try {
//       const response = await axios.post(`${import.meta.env.VITE_REACT_APP_URL}/api/v1/auth/login`, {
//         email,
//         password,
//       });
//       if (response.data.success) {
//         toast.success(response.data.message);
//         setAuthGlobally({
//           ...auth,
//           user: response.data.user,
//           role: response.data.user.role,
//           token: response.data.token,
//         });
//         localStorage.setItem("token", JSON.stringify(response.data));
//         axios.defaults.headers.common["Authorization"] = response.data.token;
//         navigate(
//           response.data.user.role === "admin" || response.data.user.role === "superadmin"
//             ? "/dashboard"
//             : "/client-portal"
//         );
//       }
//     } catch (error) {
//       if (error.response) {
//         toast.error(error.response.data.message);
//       }
//     }
//   };

//   return (
//     <WaterWave imageUrl={waveImage} style={{ width: "100%", height: "100vh" }}>
//       {() => (
//         <div className="flex items-center justify-center min-h-screen bg-black bg-opacity-15">
//           <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
//             <h3 className="text-3xl font-bold text-center text-black mb-8">Welcome Back</h3>
//             <form onSubmit={handleSubmit} className="space-y-6">
//               <div>
//                 <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
//                   Email Address
//                 </label>
//                 <div className="relative">
//                   <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                     <Mail className="h-5 w-5 text-gray-400" />
//                   </div>
//                   <input
//                     id="email"
//                     type="email"
//                     value={email}
//                     onChange={(e) => setEmail(e.target.value)}
//                     className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-yellow-500 focus:border-yellow-500"
//                     placeholder="Enter your email"
//                     required
//                   />
//                 </div>
//               </div>

//               <div>
//                 <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
//                   Password
//                 </label>
//                 <div className="relative">
//                   <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                     <Lock className="h-5 w-5 text-gray-400" />
//                   </div>
//                   <input
//                     id="password"
//                     type="password"
//                     value={password}
//                     onChange={(e) => setPassword(e.target.value)}
//                     className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-yellow-500 focus:border-yellow-500"
//                     placeholder="Enter your password"
//                     required
//                   />
//                 </div>
//               </div>

//               <button
//                 type="submit"
//                 className="w-full bg-black text-yellow-400 py-3 px-4 rounded-lg font-medium hover:bg-gray-900 transition-colors duration-200"
//               >
//                 Sign In
//               </button>

//               <p className="text-center text-sm text-gray-600">
//                 Don’t have an account?{" "}
//                 <button
//                   type="button"
//                   className="font-medium text-yellow-600 hover:text-yellow-500"
//                   onClick={() => setIsCreateAccountModalOpen(true)}
//                 >
//                   Sign up now
//                 </button>
//               </p>
//             </form>
//           </div>

//           {/* Sign Up Modal */}
//           <CreateClientAccountModal
//             isOpen={isCreateAccountModalOpen}
//             onClose={() => setIsCreateAccountModalOpen(false)}
//           />
//         </div>
//       )}
//     </WaterWave>
//   );
// }
