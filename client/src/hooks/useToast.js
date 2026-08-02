import { toast } from 'react-toastify';

/**
 * Custom hook wrapping react-toastify for consistent toast notifications.
 * @returns {{ showSuccess, showError, showInfo, showWarning }}
 */
const useToast = () => {
  const defaultOptions = {
    position: 'top-right',
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  };

  const showSuccess = (message) => toast.success(message, defaultOptions);
  const showError = (message) => toast.error(message, { ...defaultOptions, autoClose: 5000 });
  const showInfo = (message) => toast.info(message, defaultOptions);
  const showWarning = (message) => toast.warn(message, { ...defaultOptions, autoClose: 4000 });

  return { showSuccess, showError, showInfo, showWarning };
};

export default useToast;
