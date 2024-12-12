import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {Outlet, useNavigate } from 'react-router-dom';
import { useAuthGlobally } from '../../context/AuthContext';
import Spinner from './Spinner';


const ProtectRoute = () => {
    const [ok, setOk] = useState(false);
    const [auth, setAuth] = useAuthGlobally();
    const navigate = useNavigate();

    useEffect(() => {
        const authCheck = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_REACT_APP_URL}/api/v1/auth/protectedRoute`);
                if (response.data.ok) {
                    setOk(true);
                } else {
                    setOk(false);
                }
            } catch (error) {
                console.error('Error checking authentication:', error);
                setOk(false);
            }
        };

        if (auth?.token) {
            authCheck();
        }
    }, [auth?.token]);

    return ok ? <Outlet/> : <Spinner /> 
    // return ok ? <Outlet/> : toast.error('Please Login first')
};

export default ProtectRoute;
