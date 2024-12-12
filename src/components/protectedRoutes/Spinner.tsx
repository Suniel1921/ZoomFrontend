import React from 'react';

const Spinner = () => {
  return (
    <div className="flex justify-center items-center">
      <div className="relative w-24 h-24 rounded-full animate-spin">
        {/* Outer Circle */}
        <div className="absolute inset-0 border-4 border-t-4 border-white rounded-full animate-spin-slow"></div>
        {/* Inner Circle */}
        <div className="absolute inset-0 border-4 border-t-4 border-red-500 rounded-full animate-spin-slow-reverse"></div>
      </div>

      {/* Tailwind CSS Spinner Keyframes */}
      <style>
        {`
          @keyframes spin-slow {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          @keyframes spin-slow-reverse {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(-360deg); }
          }

          .animate-spin-slow {
            animation: spin-slow 2s linear infinite;
          }

          .animate-spin-slow-reverse {
            animation: spin-slow-reverse 2s linear infinite;
          }
        `}
      </style>
    </div>
  );
};

export default Spinner;
