import React, { useState, useEffect, useCallback } from 'react';
import './Toast.css';

const Toast = ({ message, type, duration = 3000, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);

  const handleClose = useCallback(() => {
    setIsVisible(false);
    // Wait for animation to complete before calling onClose
    setTimeout(() => {
      if (onClose) onClose();
    }, 300);
  }, [onClose]);

  useEffect(() => {
    // Trigger entrance animation
    setIsVisible(true);
    
    // Auto close after duration
    const timer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, handleClose]);

  if (!message) return null;

  return (
    <div className={`toast ${type} ${isVisible ? 'show' : 'hide'}`}>
      <div className="toast-content">
        {type === 'success' && (
          <svg className="toast-icon" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
            <path fillRule="evenodd" d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12Zm13.707-1.293a1 1 0 0 0-1.414-1.414L11 12.586l-1.793-1.793a1 1 0 0 0-1.414 1.414l2.5 2.5a1 1 0 0 0 1.414 0l4-4Z" clipRule="evenodd"/>
          </svg>
        )}
        {type === 'error' && (
          <svg className="toast-icon" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
            <path fillRule="evenodd" d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12Zm13.707-1.293a1 1 0 0 0-1.414-1.414L11 12.586l-1.793-1.793a1 1 0 0 0-1.414 1.414l2.5 2.5a1 1 0 0 0 1.414 0l4-4Z" clipRule="evenodd"/>
          </svg>
        )}
        <span className="toast-message">{message}</span>
        <button className="toast-close" onClick={handleClose}>
          <svg className="close-icon" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24">
            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18 18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>
    </div>
  );
};

export default Toast;