import * as React from 'react';

export const Loading: React.FC<{ text?: string }> = ({ text = 'Loading...' }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      <p className="mt-4 text-sm text-gray-600">{text}</p>
    </div>
  );
};

export const LoadingSpinner: React.FC = () => {
  return (
    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current"></div>
  );
};
