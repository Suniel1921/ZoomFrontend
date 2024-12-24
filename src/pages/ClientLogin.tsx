import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Lock, Mail, Zap } from "lucide-react";
import axios from "axios"; 
import toast from "react-hot-toast";
import { useAuthGlobally } from '../context/AuthContext';
import CreateClientAccountModal from "./components/CreateClientAccountModal";


export default function ClientLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [auth, setAuthGlobally] = useAuthGlobally();
  const [isCreateAccountModalOpen, setIsCreateAccountModalOpen] = useState(false); 

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

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
      if (error.response) {
        toast.error(error.response.data.message);
      }
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left Side - Branding */}
      <div className="w-1/2 bg-black text-white flex flex-col justify-center items-center px-10 hidden md:flex">
        <div className="max-w-lg text-center">
          <div className="flex justify-center items-center gap-4 mb-14">
            <span><Zap className="h-12 w-12 text-yellow-500" /></span>
            <h1 className="text-5xl font-bold text-yellow-500">Zoom CRM</h1>
          </div>

          <p className="text-[37px] font-medium mb-8">Transform Your Business with Smart Solutions</p>
          <p className="text-lg leading-relaxed text-gray-400 text-lg">
            Streamline your customer relationships, boost productivity, and drive growth with our powerful CRM platform.
          </p>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full md:w-1/2 bg-white flex flex-col justify-center px-10">
        <div className="max-w-md mx-auto">
          <h3 className="text-3xl font-bold text-black mb-8 text-center">Welcome Back</h3>
          <form onSubmit={handleSubmit} className="space-y-6 w-full">
            <div className="w-[444px]">
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
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-yellow-500 focus:border-yellow-500"
                  placeholder="Enter your password"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-black text-yellow-400 py-3 px-4 rounded-lg font-medium hover:bg-gray-900 transition-colors duration-200"
            >
              Sign In
            </button>

            <p className="text-center text-sm text-gray-600">
              Don’t have an account?{" "}
              <button
                type="button"
                className="font-medium text-yellow-600 hover:text-yellow-500"
                onClick={() => setIsCreateAccountModalOpen(true)} // Open modal
              >
                Sign up now
              </button>
            </p>
          </form>
        </div>
      </div>

      {/* Sign Up Modal */}
      <CreateClientAccountModal
        isOpen={isCreateAccountModalOpen}
        onClose={() => setIsCreateAccountModalOpen(false)}
      />
    </div>
  );
}
















// import { useState } from 'react';
// import { useNavigate, Link } from 'react-router-dom';
// import { Lock, Eye, EyeOff } from 'lucide-react';
// import Button from '../components/Button';
// import Input from '../components/Input';
// import axios from 'axios'; // Import axios for API calls
// import CreateClientAccountModal from './components/CreateClientAccountModal';
// import toast from 'react-hot-toast';
// import { useAuthGlobally } from '../context/AuthContext';

// export default function ClientLogin() {
//   const navigate = useNavigate();
//   const [error, setError] = useState('');
//   const [showPassword, setShowPassword] = useState(false);
//   const [isCreateAccountModalOpen, setIsCreateAccountModalOpen] = useState(false);
//   const [auth, setAuth] = useAuthGlobally();
//   const [formData, setFormData] = useState({
//     email: '',
//     password: '',
//     remember: false,
//   });

//   const handleChange = (e: any) => {
//     const { name, value, type, checked } = e.target;
//     setFormData((prev) => ({
//       ...prev,
//       [name]: type === 'checkbox' ? checked : value,
//     }));
//   };

  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   setError('');

  //   try {
  //     // Making API call using axios
  //     const response = await axios.post(`${import.meta.env.VITE_REACT_APP_URL}/api/v1/auth/login`, formData);

  //     // Check if login is successful
  //     if (response.data.success) {
  //       toast.success(response.data.message);
  //       setAuth({
  //         ...auth,
  //         user: response.data.user,
  //         role: response.data.user.role,
  //         token: response.data.token,
  //       });
  //       localStorage.setItem('token', JSON.stringify(response.data));
  //       axios.defaults.headers.common['Authorization'] = response.data.token;

  //       // Redirect based on role
  //       if (response?.data?.user?.role === 'admin') {
  //         navigate('/dashboard');
  //       } else if (response?.data?.user?.role === 'superadmin') {
  //         navigate('/dashboard');
  //       } else {
  //         navigate('/client-portal');
  //       }
  //     }
  //   } catch (error:any) {
  //     if (error.response) {
  //       toast.error(error.response.data.message);
  //     }
  //   }
  // };

//   return (
//     <div className="min-h-screen flex flex-col bg-gradient-to-b from-brand-yellow/10 to-white">
//       {/* Header */}
//       <header className="bg-brand-black text-white">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
//           <Link to="/" className="flex items-center">
//             <span className="text-2xl font-bold text-brand-yellow">Zoom Creatives</span>
//           </Link>
//           <Button
//             onClick={() => setIsCreateAccountModalOpen(true)}
//             variant="outline"
//             className="text-white border-white hover:bg-white hover:text-brand-black"
//           >
//             Create Account
//           </Button>
//         </div>
//       </header>

//       {/* Main Content */}
//       <div className="flex-grow flex flex-col justify-center py-12 sm:px-6 lg:px-8">
//         <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
//           <h1 className="text-4xl md:text-5xl font-bold text-brand-black mb-3">Zoom Creatives</h1>
//           {/* <h2 className="text-xl md:text-2xl text-brand-black/80 mb-16">Client's Hub</h2> */}
//         </div>

//         <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
//           <div className="bg-white py-8 px-4 shadow-lg sm:rounded-lg sm:px-10 border border-brand-yellow/20">
//             <div className="text-center mb-6">
//               <h3 className="text-2xl font-bold text-brand-black">Client Login</h3>
//             </div>

//             {error && (
//               <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
//                 {error}
//               </div>
//             )}

//             <form className="space-y-6" onSubmit={handleSubmit}>
//               <div>
//                 <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email address</label>
//                 <div className="mt-1">
//                   <Input
//                     id="email"
//                     name="email"
//                     type="email"
//                     autoComplete="email"
//                     required
//                     value={formData.email}
//                     onChange={handleChange}
//                     placeholder="Enter your email"
//                     className="border-brand-yellow/30 focus:border-brand-yellow focus:ring-brand-yellow"
//                   />
//                 </div>
//               </div>

//               <div>
//                 <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
//                 <div className="mt-1 relative">
//                   <Input
//                     id="password"
//                     name="password"
//                     type={showPassword ? "text" : "password"}
//                     autoComplete="current-password"
//                     required
//                     value={formData.password}
//                     onChange={handleChange}
//                     placeholder="Enter your password"
//                     className="border-brand-yellow/30 focus:border-brand-yellow focus:ring-brand-yellow pr-10"
//                   />
//                   <button
//                     type="button"
//                     className="absolute inset-y-0 right-0 pr-3 flex items-center"
//                     onClick={() => setShowPassword(!showPassword)}
//                   >
//                     {showPassword ? (
//                       <EyeOff className="h-4 w-4 text-gray-400" />
//                     ) : (
//                       <Eye className="h-4 w-4 text-gray-400" />
//                     )}
//                   </button>
//                 </div>
//               </div>

//               <div className="flex items-center justify-between">
//                 <div className="flex items-center">
//                   <input
//                     id="remember"
//                     name="remember"
//                     type="checkbox"
//                     checked={formData.remember}
//                     onChange={handleChange}
//                     className="h-4 w-4 rounded border-brand-yellow/30 text-brand-yellow focus:ring-brand-yellow"
//                   />
//                   <label htmlFor="remember" className="ml-2 block text-sm text-gray-900">
//                     Remember me
//                   </label>
//                 </div>

//                 <div className="text-sm">
//                   <Link
//                     to="/forgot-password"
//                     className="font-medium text-brand-black hover:text-brand-yellow"
//                   >
//                     Forgot password?
//                   </Link>
//                 </div>
//               </div>

//               <Button
//                 type="submit"
//                 className="w-full bg-brand-black hover:bg-brand-yellow hover:text-brand-black transition-colors"
//               >
//                 <Lock className="h-4 w-4 mr-2" />
//                 Sign in
//               </Button>
//             </form>
//           </div>

//           {/* Admin Portal Link */}
//           {/* <div className="mt-8 text-center">
//             <p className="text-gray-600">Are you an administrator?</p>
//             <Link
//               to="/login"
//               className="mt-2 inline-block text-lg font-medium text-brand-black hover:text-brand-yellow"
//             >
//               Access Admin Portal →
//             </Link>
//           </div> */}
//         </div>
//       </div>

//       {/* Footer */}
//       <footer className="bg-brand-black text-white mt-auto">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
//           <div className="flex flex-col md:flex-row justify-between items-center gap-4">
//             <p className="text-sm text-white">
//               © {new Date().getFullYear()} Zoom Creatives. All Rights Reserved.
//             </p>
//             <a
//               href="https://zoomcreatives.jp/privacy-policy/"
//               target="_blank"
//               rel="noopener noreferrer"
//               className="text-sm text-white hover:text-brand-yellow"
//             >
//               Privacy Policy
//             </a>
//           </div>
//         </div>
//       </footer>

//       <CreateClientAccountModal
//         isOpen={isCreateAccountModalOpen}
//         onClose={() => setIsCreateAccountModalOpen(false)}
//       />
//     </div>
//   );
// }

// *****************************************3d animation*****************************************

// import { useState, useEffect } from 'react';
// import { useNavigate, Link } from 'react-router-dom';
// import { Lock, Eye, EyeOff } from 'lucide-react';
// import Button from '../components/Button';
// import Input from '../components/Input';
// import axios from 'axios'; // Import axios for API calls
// import CreateClientAccountModal from './components/CreateClientAccountModal';
// import toast from 'react-hot-toast';
// import { useAuthGlobally } from '../context/AuthContext';

// export default function ClientLogin() {
//   const navigate = useNavigate();
//   const [error, setError] = useState('');
//   const [showPassword, setShowPassword] = useState(false);
//   const [isCreateAccountModalOpen, setIsCreateAccountModalOpen] = useState(false);
//   const [auth, setAuth] = useAuthGlobally();
//   const [formData, setFormData] = useState({
//     email: '',
//     password: '',
//     remember: false,
//   });

//   const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

//   // Mouse move event handler for 3D effect
//   useEffect(() => {
//     const handleMouseMove = (e) => {
//       const { clientX: x, clientY: y } = e;
//       setMousePosition({ x, y });
//     };

//     // Attach the event listener
//     document.addEventListener('mousemove', handleMouseMove);

//     // Clean up event listener on unmount
//     return () => {
//       document.removeEventListener('mousemove', handleMouseMove);
//     };
//   }, []);

//   const { x, y } = mousePosition;
//   const centerX = window.innerWidth / 2;
//   const centerY = window.innerHeight / 2;
//   const deltaX = (x - centerX) / centerX;
//   const deltaY = (y - centerY) / centerY;

//   const transformStyle = {
//     transform: `perspective(1000px) rotateX(${deltaY * 10}deg) rotateY(${deltaX * 10}deg)`,
//     transition: 'transform 0.1s ease-out',
//   };

//   const handleChange = (e) => {
//     const { name, value, type, checked } = e.target;
//     setFormData((prev) => ({
//       ...prev,
//       [name]: type === 'checkbox' ? checked : value,
//     }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError('');

//     try {
//       // Making API call using axios
//       const response = await axios.post(`${import.meta.env.VITE_REACT_APP_URL}/api/v1/auth/login`, formData);

//       // Check if login is successful
//       if (response.data.success) {
//         toast.success(response.data.message);
//         setAuth({
//           ...auth,
//           user: response.data.user,
//           role: response.data.user.role,
//           token: response.data.token,
//         });
//         localStorage.setItem('token', JSON.stringify(response.data));
//         axios.defaults.headers.common['Authorization'] = response.data.token;

//         // Redirect based on role
//         if (response?.data?.user?.role === 'admin') {
//           navigate('/dashboard');
//         } else if (response?.data?.user?.role === 'superadmin') {
//           navigate('/dashboard');
//         } else {
//           navigate('/client-portal');
//         }
//       }
//     } catch (error) {
//       if (error.response) {
//         toast.error(error.response.data.message);
//       }
//     }
//   };

//   return (
//     <div className="min-h-screen flex flex-col bg-gradient-to-b from-brand-yellow/10 to-white" style={transformStyle}>
//       {/* Header */}
//       <header className="bg-brand-black text-white">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
//           <Link to="/" className="flex items-center">
//             <span className="text-2xl font-bold text-brand-yellow">Zoom Creatives</span>
//           </Link>
//           <Button
//             onClick={() => setIsCreateAccountModalOpen(true)}
//             variant="outline"
//             className="text-white border-white hover:bg-white hover:text-brand-black"
//           >
//             Create Account
//           </Button>
//         </div>
//       </header>

//       {/* Main Content */}
//       <div className="flex-grow flex flex-col justify-center py-12 sm:px-6 lg:px-8">
//         <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
//           <h1 className="text-4xl md:text-5xl font-bold text-brand-black mb-3">Zoom Creatives</h1>
//         </div>

//         <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
//           <div className="bg-white py-8 px-4 shadow-lg sm:rounded-lg sm:px-10 border border-brand-yellow/20">
//             <div className="text-center mb-6">
//               <h3 className="text-2xl font-bold text-brand-black">Client Login</h3>
//             </div>

//             {error && (
//               <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
//                 {error}
//               </div>
//             )}

//             <form className="space-y-6" onSubmit={handleSubmit}>
//               <div>
//                 <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email address</label>
//                 <div className="mt-1">
//                   <Input
//                     id="email"
//                     name="email"
//                     type="email"
//                     autoComplete="email"
//                     required
//                     value={formData.email}
//                     onChange={handleChange}
//                     placeholder="Enter your email"
//                     className="border-brand-yellow/30 focus:border-brand-yellow focus:ring-brand-yellow"
//                   />
//                 </div>
//               </div>

//               <div>
//                 <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
//                 <div className="mt-1 relative">
//                   <Input
//                     id="password"
//                     name="password"
//                     type={showPassword ? "text" : "password"}
//                     autoComplete="current-password"
//                     required
//                     value={formData.password}
//                     onChange={handleChange}
//                     placeholder="Enter your password"
//                     className="border-brand-yellow/30 focus:border-brand-yellow focus:ring-brand-yellow pr-10"
//                   />
//                   <button
//                     type="button"
//                     className="absolute inset-y-0 right-0 pr-3 flex items-center"
//                     onClick={() => setShowPassword(!showPassword)}
//                   >
//                     {showPassword ? (
//                       <EyeOff className="h-4 w-4 text-gray-400" />
//                     ) : (
//                       <Eye className="h-4 w-4 text-gray-400" />
//                     )}
//                   </button>
//                 </div>
//               </div>

//               <div className="flex items-center justify-between">
//                 <div className="flex items-center">
//                   <input
//                     id="remember"
//                     name="remember"
//                     type="checkbox"
//                     checked={formData.remember}
//                     onChange={handleChange}
//                     className="h-4 w-4 rounded border-brand-yellow/30 text-brand-yellow focus:ring-brand-yellow"
//                   />
//                   <label htmlFor="remember" className="ml-2 block text-sm text-gray-900">
//                     Remember me
//                   </label>
//                 </div>

//                 <div className="text-sm">
//                   <Link
//                     to="/forgot-password"
//                     className="font-medium text-brand-black hover:text-brand-yellow"
//                   >
//                     Forgot password?
//                   </Link>
//                 </div>
//               </div>

//               <Button
//                 type="submit"
//                 className="w-full bg-brand-black hover:bg-brand-yellow hover:text-brand-black transition-colors"
//               >
//                 <Lock className="h-4 w-4 mr-2" />
//                 Sign in
//               </Button>
//             </form>
//           </div>
//         </div>
//       </div>

//       {/* Footer */}
//       <footer className="bg-brand-black text-white mt-auto">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
//           <div className="flex flex-col md:flex-row justify-between items-center gap-4">
//             <p className="text-sm text-white">
//               © {new Date().getFullYear()} Zoom Creatives. All Rights Reserved.
//             </p>
//             <a
//               href="https://zoomcreatives.jp/privacy-policy/"
//               target="_blank"
//               rel="noopener noreferrer"
//               className="text-sm text-white hover:text-brand-yellow"
//             >
//               Privacy Policy
//             </a>
//           </div>
//         </div>
//       </footer>

//       <CreateClientAccountModal
//         isOpen={isCreateAccountModalOpen}
//         onClose={() => setIsCreateAccountModalOpen(false)}
//       />
//     </div>
//   );
// }
