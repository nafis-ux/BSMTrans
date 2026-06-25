"use client";
import { useState, useCallback, useRef } from 'react';

let toastIdCounter = 0;

export default function useToast() {
  const [toasts, setToasts] = useState([]);
  const timersRef = useRef({});

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.map(t => t.id === id ? { ...t, exiting: true } : t));
    // Hapus dari DOM setelah animasi exit selesai (400ms)
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
      if (timersRef.current[id]) {
        clearTimeout(timersRef.current[id]);
        delete timersRef.current[id];
      }
    }, 400);
  }, []);

  const showToast = useCallback((message, type = 'success', duration = 4000) => {
    const id = ++toastIdCounter;
    const newToast = { id, message, type, exiting: false };

    setToasts(prev => [...prev, newToast]);

    // Auto-dismiss
    timersRef.current[id] = setTimeout(() => {
      removeToast(id);
    }, duration);

    return id;
  }, [removeToast]);

  return { toasts, showToast, removeToast };
}
