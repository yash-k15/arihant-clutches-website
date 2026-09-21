import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

import '../assets/styles/components/AnnouncementBar.css';

const announcements = [
  {
    text: 'NEED YOUR ORDER URGENTLY?',
    linkText: 'CONTACT US',
    suffix: ' DIRECTLY',
    link: '/contact',
  },
  {
    text: 'ENJOY FREE SHIPPING ON ALL PREPAID ORDERS',
  },
  {
    text: 'SHOP FROM AROUND THE WORLD —',
    linkText: 'INTERNATIONAL SHIPPING',
    link: '/international-orders',
    suffix: ' OPTIONS',
  },
  {
    text: 'PLACING A BULK ORDER? DISCOVER OUR',
    linkText: 'WHOLESALE',
    link: '/wholesale-orders',
    suffix: ' OPTIONS',
  },
];

const AnnouncementBar = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const currentAnnouncement = announcements[currentIndex];

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);

      setTimeout(() => {
        setCurrentIndex(
          (previousIndex) => (previousIndex + 1) % announcements.length,
        );
        setIsAnimating(false);
      }, 300);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const showPrevious = () => {
    setCurrentIndex(
      (previousIndex) =>
        (previousIndex - 1 + announcements.length) % announcements.length,
    );
  };

  const showNext = () => {
    setCurrentIndex(
      (previousIndex) => (previousIndex + 1) % announcements.length,
    );
  };

  return (
    <div className='announcement-bar'>
      <button
        type='button'
        className='announcement-arrow'
        onClick={showPrevious}
        aria-label='Previous announcement'
      >
        <FiChevronLeft />
      </button>

      <div className={`announcement-content ${isAnimating ? 'animating' : ''}`}>
        <span>
          {currentAnnouncement.text}

          {currentAnnouncement.link && (
            <>
              {' '}
              <Link to={currentAnnouncement.link}>
                {currentAnnouncement.linkText}
              </Link>
              {currentAnnouncement.suffix || ''}
            </>
          )}
        </span>
      </div>

      <button
        type='button'
        className='announcement-arrow'
        onClick={showNext}
        aria-label='Next announcement'
      >
        <FiChevronRight />
      </button>
    </div>
  );
};

export default AnnouncementBar;
