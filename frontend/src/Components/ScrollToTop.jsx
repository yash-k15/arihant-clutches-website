import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  const location = useLocation();

  useEffect(() => {
    const currentPath = location.pathname;

    if (currentPath.startsWith('/products/') && location.search) {
      const searchParams = new URLSearchParams(location.search);

      if (searchParams.has('color')) {
        return;
      }
    }

    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'auto',
    });
  }, [location.pathname, location.search]);

  return null;
};

export default ScrollToTop;
