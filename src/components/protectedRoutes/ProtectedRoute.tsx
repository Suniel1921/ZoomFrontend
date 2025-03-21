import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuthGlobally } from '../../context/AuthContext';
import Spinner from './Spinner';

const ProtectRoute = () => {
  const [ok, setOk] = useState(false);
  const [auth, setAuth] = useAuthGlobally();
  const [loading, setLoading] = useState(true); // Add a loading state
  const navigate = useNavigate();

  useEffect(() => {
    const authCheck = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_REACT_APP_URL}/api/v1/auth/protectedRoute`,
          {
            headers: {
              Authorization: `Bearer ${auth?.token}`, // Include token in the request
            },
          }
        );
        if (response.data.ok) {
          setOk(true);
        } else {
          setOk(false);
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
        setOk(false);
      } finally {
        setLoading(false); // Set loading to false after check
      }
    };

    if (auth?.token) {
      authCheck();
    } else {
      setLoading(false); // No token, stop loading and set ok to false
    }
  }, [auth?.token]);

  // Handle loading state
  if (loading) {
    return <Spinner />;
  }

  // Redirect to login if not authenticated
  if (!ok) {
    navigate('/client-login');
    return null; // Avoid rendering anything until redirection completes
  }

  return <Outlet />;
};

export default ProtectRoute;
