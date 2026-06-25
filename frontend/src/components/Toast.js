"use client";
import styles from '@/styles/Toast.module.css';

const ICONS = {
  success: '✅',
  error: '❌',
  warning: '⚠️',
};

export default function Toast({ toasts, removeToast }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className={styles.toastContainer}>
      {toasts.map((toast) => {
        const typeClass =
          toast.type === 'success' ? styles.toastSuccess :
          toast.type === 'error' ? styles.toastError :
          styles.toastWarning;

        return (
          <div
            key={toast.id}
            className={`${styles.toast} ${typeClass} ${toast.exiting ? styles.toastExit : ''}`}
            onClick={() => removeToast(toast.id)}
            role="alert"
          >
            <div className={styles.toastIcon}>
              {ICONS[toast.type] || ICONS.success}
            </div>
            <span className={styles.toastMessage}>{toast.message}</span>
            <button
              className={styles.toastClose}
              onClick={(e) => { e.stopPropagation(); removeToast(toast.id); }}
              aria-label="Tutup"
            >
              ✕
            </button>
            {!toast.exiting && <div className={styles.toastProgress} />}
          </div>
        );
      })}
    </div>
  );
}
