import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
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

  const normalizedType = type === 'danger' ? 'error' : type;

  const getIcon = () => {
    switch (type) {
      case 'success': return <CheckCircle className="toast-icon success" size={22} />;
      case 'error':
      case 'danger': return <AlertCircle className="toast-icon error" size={22} />;
      case 'warning': return <AlertTriangle className="toast-icon warning" size={22} />;
      default: return <Info className="toast-icon info" size={22} />;
    }
  };

  const getTitle = () => {
    switch (normalizedType) {
      case 'success': return 'Success';
      case 'error': return 'Action needed';
      case 'warning': return 'Heads up';
      default: return 'Notification';
    }
  };

  const toast = (
    <motion.div
      className={`custom-toast-container ${normalizedType}`}
      role="status"
      aria-live="polite"
      initial={{ opacity: 0, y: -18, scale: 0.96, filter: 'blur(8px)' }}
      animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
      exit={{ opacity: 0, y: -12, scale: 0.98, filter: 'blur(6px)' }}
      transition={{ type: 'spring', stiffness: 420, damping: 32, mass: 0.8 }}
      style={{ '--toast-duration': `${duration}ms` }}
    >
      <div className="toast-glow" />
      <div className="toast-content">
        <div className="toast-icon-shell">
          {getIcon()}
        </div>
        <div className="toast-copy">
          <span className="toast-title">{getTitle()}</span>
          <span className="toast-message">{message}</span>
        </div>
        <button className="toast-close-btn" onClick={onClose}>
          <X size={16} />
        </button>
      </div>
      <div className="toast-progress-bar" />
    </motion.div>
  );

  return createPortal(toast, document.body);
};

export default CustomToast;
