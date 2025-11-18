import React from 'react';
// Fix: Added .tsx extension to the import path.
import { WarningIcon } from './Icons.tsx';

interface ErrorMessageProps {
  message: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => {
  return (
    <div className="max-w-2xl mx-auto bg-red-900/20 border border-red-600 text-red-300 px-4 py-3 rounded-lg relative my-8" role="alert">
      <div className="flex items-center">
        <WarningIcon className="h-6 w-6 mr-3 text-red-400" />
        <div>
          <strong className="font-bold">Ocorreu um erro!</strong>
          <span className="block sm:inline ml-2">{message}</span>
        </div>
      </div>
    </div>
  );
};

export default ErrorMessage;
