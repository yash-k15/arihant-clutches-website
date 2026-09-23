import { useEffect, useRef, useState } from 'react';
import { Form } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { FaTimes } from 'react-icons/fa';
import { BsSearch } from 'react-icons/bs';

const SearchBox = () => {
  const navigate = useNavigate();
  const { keyword: urlKeyword } = useParams();

  const [keyword, setKeyword] = useState(urlKeyword || '');
  const [isOpen, setIsOpen] = useState(false);

  const triggerRef = useRef(null);
  const panelRef = useRef(null);
  const inputRef = useRef(null);

  const [searchTop, setSearchTop] = useState(0);

  useEffect(() => {
    if (!isOpen) return;

    const updateSearchPosition = () => {
      const isMobile = window.innerWidth <= 767.98;

      const header = document.querySelector(
        isMobile ? '.mobile-header' : '.header-top',
      );

      if (header) {
        setSearchTop(header.getBoundingClientRect().bottom);
      }
    };

    updateSearchPosition();

    window.addEventListener('resize', updateSearchPosition);

    return () => {
      window.removeEventListener('resize', updateSearchPosition);
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      const clickedTrigger = triggerRef.current?.contains(event.target);

      const clickedPanel = panelRef.current?.contains(event.target);

      if (!clickedTrigger && !clickedPanel) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  const submitHandler = (e) => {
    e.preventDefault();

    if (keyword.trim()) {
      const searchKeyword = keyword.trim();

      setKeyword('');
      setIsOpen(false);

      navigate(`/products/search/${searchKeyword}`);
    } else {
      setIsOpen(false);
      navigate('/products');
    }
  };

  const closeSearch = () => {
    setIsOpen(false);
  };

  const searchOverlay = isOpen
    ? createPortal(
        <>
          <div
            className='search-backdrop'
            style={{ top: `${searchTop}px` }}
            onClick={closeSearch}
            aria-hidden='true'
          />

          <div
            className='search-panel'
            ref={panelRef}
            style={{ top: `${searchTop}px` }}
          >
            <Form onSubmit={submitHandler} className='search-form'>
              <BsSearch className='search-field-icon' />

              <Form.Control
                ref={inputRef}
                type='text'
                name='q'
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder='SEARCH PRODUCTS...'
                className='search-input'
                aria-label='Search products'
              />

              <button
                type='button'
                className='search-close'
                aria-label='Close search'
                onClick={closeSearch}
              >
                <FaTimes />
              </button>
            </Form>
          </div>
        </>,
        document.body,
      )
    : null;

  return (
    <>
      <div className='search-container'>
        <button
          ref={triggerRef}
          type='button'
          className='search-trigger'
          aria-label='Search products'
          aria-expanded={isOpen}
          onClick={() => setIsOpen((prev) => !prev)}
        >
          <BsSearch />
        </button>
      </div>

      {searchOverlay}
    </>
  );
};

export default SearchBox;
