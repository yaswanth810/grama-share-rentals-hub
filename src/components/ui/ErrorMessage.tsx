
import React from 'react';

interface ErrorMessageProps {
  message: string;
  className?: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, className = '' }) => {
  return (
    <div className={`text-center py-12 ${className}`}>
      <p className="text-gray-600">{message}</p>
    </div>
  );
};

export default ErrorMessage;
