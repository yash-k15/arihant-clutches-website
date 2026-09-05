import { createContext, useContext, useState } from 'react';
import CartDrawer from './CartDrawer.jsx';

const CartDrawerContext = createContext();

export const CartDrawerProvider = ({ children }) => {
  const [showCartDrawer, setShowCartDrawer] = useState(false);

  const openCart = () => {
    setShowCartDrawer(true);
  };

  const closeCart = () => {
    setShowCartDrawer(false);
  };

  return (
    <CartDrawerContext.Provider
      value={{
        openCart,
        closeCart,
      }}
    >
      {children}

      <CartDrawer show={showCartDrawer} onHide={closeCart} />
    </CartDrawerContext.Provider>
  );
};

export const useCartDrawer = () => {
  const context = useContext(CartDrawerContext);

  if (!context) {
    throw new Error('useCartDrawer must be used within a CartDrawerProvider');
  }

  return context;
};
