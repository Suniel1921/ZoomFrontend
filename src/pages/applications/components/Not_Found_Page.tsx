import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <>
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
        {/* <img src="/logo2.png" alt="" className='w-[12%]' /> */}
      <h1 className="text-3xl md:text-5xl font-bold text-gray-800 mb-4">Oops! Looks like you're lost.</h1>
      <p className="text-gray-600 text-lg md:text-xl mb-6">The page you're looking for doesn't exist.</p>
      <img 
        src="/notfound.png" 
        alt="Page not found" 
        className="max-w-xs md:max-w-sm lg:max-w-md mb-6"
      />
      <Link 
        to="/dashboard" 
        className="text-white bg-yellow-500 hover:bg-yellow-600 font-medium py-2 px-4 rounded shadow-lg"
      >
        Go to Home Page
      </Link>
    </div></>
  );
};

export default NotFoundPage;
