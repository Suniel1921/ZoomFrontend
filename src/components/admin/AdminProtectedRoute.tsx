
// import React, { useEffect, useState } from 'react';
// import { Outlet, useNavigate } from 'react-router-dom';
// import axios from 'axios';
// import { useAuthGlobally } from '../../context/AuthContext';
// import Spinner from '../protectedRoutes/Spinner';

// const AdminRoute = () => {
//   const [auth] = useAuthGlobally();
//   const [ok, setOk] = useState(false);
//   const [loading, setLoading] = useState(true);
//   const navigate = useNavigate();

//   useEffect(() => {
//     const authCheck = async () => {
//       if (!auth?.token) {
//         console.error('No token found, redirecting to login');
//         navigate('/client-login');
//         return;
//       }

//       // Set token for axios
//       axios.defaults.headers.common['Authorization'] = `Bearer ${auth.token}`;

//       // Check admin status
//       try {
//         const response = await axios.get(`${import.meta.env.VITE_REACT_APP_URL}/api/v1/auth/admin`);
//         if (response?.data?.ok) {
//           setOk(true);
//         } else {
//           console.error('Not an admin, redirecting');
//           navigate('/client-login');
//         }
//       } catch (error) {
//         console.error('Error during admin check:', error);
//         navigate('/client-login');
//       } finally {
//         setLoading(false);
//       }
//     };

//     if (auth.token) {
//       authCheck(); // Trigger the auth check if token exists
//     } else {
//       setLoading(false); // Set loading to false when no token exists
//     }
//   }, [auth?.token, navigate]);

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center min-h-screen">
//         <Spinner />
//       </div>
//     );
//   }

//   if (!ok) {
//     // Check if user is an admin before rendering children
//     return null;
//   }

//   return <Outlet />;
// };

// export default AdminRoute;








//navigate /client-login  if not admin (above code is also working fine but not navigate)
import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuthGlobally } from '../../context/AuthContext';
import Spinner from '../protectedRoutes/Spinner';

const AdminRoute = () => {
  const [auth] = useAuthGlobally();
  const [ok, setOk] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const authCheck = async () => {
      if (!auth?.token) {
        console.error('No token found, redirecting to login');
        navigate('/client-login');
        return;
      }

      // Set token for axios
      axios.defaults.headers.common['Authorization'] = `Bearer ${auth.token}`;

      // Check admin status
      try {
        const response = await axios.get(`${import.meta.env.VITE_REACT_APP_URL}/api/v1/auth/admin`);
        if (response?.data?.ok) {
          setOk(true);
        } else {
          console.error('Not an admin, redirecting');
          navigate('/client-login');
        }
      } catch (error) {
        console.error('Error during admin check:', error);
        navigate('/client-login');
      } finally {
        setLoading(false);
      }
    };

    if (auth.token) {
      authCheck(); // Trigger the auth check if token exists
    } else {
      setLoading(false); // Set loading to false when no token exists
    }
  }, [auth?.token, navigate]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner />
      </div>
    );
  }

  if (!ok) {
    // Redirect to login if not admin
    navigate('/client-login');
    return null; // Render nothing while redirecting
  }

  return <Outlet />;
};

export default AdminRoute;
