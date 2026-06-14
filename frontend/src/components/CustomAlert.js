"use client";
import React from 'react';

export default function CustomAlert({ isOpen, message, type = 'error', onClose }) {
  if (!isOpen) return null;

  // Tentukan warna berdasarkan tipe alert (error, success, atau warning)
  const colors = {
    error: { bg: '#2a1a1a', border: '#ff4d4d', icon: '❌', btn: '#ff4d4d' },
    success: { bg: '#1a2a1a', border: '#28a745', icon: '✅', btn: '#28a745' },
    warning: { bg: '#2a251a', border: '#ffc107', icon: '⚠️', btn: '#ffc107' }
  };

  const currentStyle = colors[type] || colors.error;

  return (
    <div style={styles.overlay}>
      <div style={{ ...styles.alertBox, ...{ borderColor: currentStyle.border, backgroundColor: currentStyle.bg } }}>
        <div style={styles.icon}>{currentStyle.icon}</div>
        <p style={styles.message}>{message}</p>
        <button 
          style={{ ...styles.button, backgroundColor: currentStyle.btn }} 
          onClick={onClose}
        >
          Mengerti
        </button>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
    backdropFilter: 'blur(4px)',
  },
  alertBox: {
    width: '90%',
    maxWidth: '400px',
    padding: '24px',
    borderRadius: '16px',
    borderWidth: '1px',
    borderStyle: 'solid',
    textAlign: 'center',
    boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
    animation: 'fadeIn 0.2s ease-out',
  },
  icon: {
    fontSize: '40px',
    marginBottom: '12px',
  },
  message: {
    color: '#ffffff',
    fontSize: '15px',
    lineHeight: '1.5',
    marginBottom: '20px',
  },
  button: {
    color: '#000000',
    fontWeight: '700',
    border: 'none',
    padding: '10px 24px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'opacity 0.2s',
  }
};