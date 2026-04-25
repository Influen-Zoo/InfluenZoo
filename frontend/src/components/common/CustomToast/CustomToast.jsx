import React, { useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import './CustomToast.css';

const CustomToast = ({ message, type = 'success', onClose, duration = 3000 }) => {
  useEffect(() => {
    if (duration) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [onClose, duration]);

  const getIcon = () => {
    switch (type) {
      case 'success': return <CheckCircle className="toast-icon success" size={20} />;
      case 'error':
      case 'danger': return <AlertCircle className="toast-icon error" size={20} />;
      case 'warning': return <AlertTriangle className="toast-icon warning" size={20} />;
      default: return <Info className="toast-icon info" size={20} />;
    }
  };

  return (
    <div className={`custom-toast-container ${type}`}>
      <div className="toast-content">
        {getIcon()}
        <span className="toast-message">{message}</span>
        <button className="toast-close-btn" onClick={onClose}>
          <X size={16} />
        </button>
      </div>
      <div className="toast-progress-bar" />
    </div>
  );
};

export default CustomToast;
