import { createContext, useContext, useState } from 'react';
import AuthModal from './AuthModal.jsx';

const AuthModalContext = createContext();

export const AuthModalProvider = ({ children }) => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [onAuthSuccess, setOnAuthSuccess] = useState(null);

  const openAuth = (callback = null) => {
    setOnAuthSuccess(() => callback);
    setShowAuthModal(true);
  };

  const closeAuthModal = () => {
    setShowAuthModal(false);
    setOnAuthSuccess(null);
  };

  const handleAuthSuccess = () => {
    const callback = onAuthSuccess;

    setShowAuthModal(false);
    setOnAuthSuccess(null);

    if (callback) {
      callback();
    }
  };

  return (
    <AuthModalContext.Provider
      value={{
        openAuth,
        closeAuthModal,
        handleAuthSuccess,
      }}
    >
      {children}

      <AuthModal
        show={showAuthModal}
        onHide={closeAuthModal}
        onSuccess={handleAuthSuccess}
      />
    </AuthModalContext.Provider>
  );
};

export const useAuthModal = () => {
  const context = useContext(AuthModalContext);

  if (!context) {
    throw new Error('useAuthModal must be used within an AuthModalProvider');
  }

  return context;
};
