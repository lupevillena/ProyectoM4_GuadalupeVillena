import React from 'react';

interface LoadingSpinnerProps {
  message?: string;
  fullScreen?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = 'Cargando...',
  fullScreen = false,
}) => {
  return (
    <div
      className={`spinner-container ${fullScreen ? 'spinner-fullscreen' : ''}`}
      role="status"
      aria-live="polite"
    >
      <div className="spinner" aria-hidden="true" />
      {message && <p className="spinner-message">{message}</p>}
    </div>
  );
};

