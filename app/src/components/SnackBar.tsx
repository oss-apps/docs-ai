import classNames from 'classnames';
import React, { useState, useEffect } from 'react';

const Snackbar: React.FC<{ 
    message: string, duration?: number, show: boolean, setShow: (show: boolean) => void, isError: boolean
}> = ({ message, duration = 4000, show, setShow, isError }) => {

  useEffect(() => {
    const timeout = setTimeout(() => {
      setShow(false);
    }, duration);

    return () => clearTimeout(timeout);
  }, [show, duration, setShow]);

  return (
    <div
      className={classNames(`${
        show ? 'opacity-100' : 'opacity-0'
      } fixed bottom-4 left-1/2 flex justify-between transform -translate-x-1/2 px-4 py-2 rounded-md text-sm font-medium transition-opacity duration-300 ease-in-out z-50 min-w-[20rem]`,
			isError? 'bg-red-200 text-red-600' : 'bg-green-200 text-green-800')}
    >
      {message}
      <button onClick={() => setShow(false)}>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};

export default Snackbar;
