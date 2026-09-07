import { createContext, useContext, useState } from 'react';

const CheckoutContext = createContext();

export const CheckoutProvider = ({ children }) => {
  const [showCheckout, setShowCheckout] = useState(false);

  const openCheckout = () => {
    setShowCheckout(true);
  };

  const closeCheckout = () => {
    setShowCheckout(false);
  };

  return (
    <CheckoutContext.Provider
      value={{
        showCheckout,
        openCheckout,
        closeCheckout,
      }}
    >
      {children}
    </CheckoutContext.Provider>
  );
};

export const useCheckout = () => {
  const context = useContext(CheckoutContext);

  if (!context) {
    throw new Error('useCheckout must be used within a CheckoutProvider');
  }

  return context;
};
