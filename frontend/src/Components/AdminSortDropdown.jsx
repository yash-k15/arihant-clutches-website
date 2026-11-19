import { useEffect, useRef, useState } from 'react';
import { FiChevronDown } from 'react-icons/fi';

import '../assets/styles/components/AdminTableToolbar.css';

const AdminSortDropdown = ({
  value = '',
  options = [],
  onChange,
  isOpen = false,
  onToggle,
}) => {
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);
  const menuRef = useRef(null);
  const [mobileMenuStyle, setMobileMenuStyle] = useState(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onToggle();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onToggle]);

  useEffect(() => {
    if (!isOpen) {
      setMobileMenuStyle(null);
      return;
    }

    const updateMobileMenuPosition = () => {
      if (!window.matchMedia('(max-width: 767px)').matches) {
        setMobileMenuStyle(null);
        return;
      }

      const button = buttonRef.current;
      const menu = menuRef.current;

      if (!button || !menu) return;

      const buttonRect = button.getBoundingClientRect();
      const viewportPadding = 12;
      const viewportWidth = document.documentElement.clientWidth;
      const viewportHeight = window.innerHeight;
      const menuWidth = Math.min(
        Math.max(menu.scrollWidth, 190),
        viewportWidth - viewportPadding * 2,
      );
      const menuHeight = Math.min(
        menu.scrollHeight,
        viewportHeight - viewportPadding * 2,
      );

      const left = Math.max(
        viewportPadding,
        Math.min(buttonRect.right - menuWidth, viewportWidth - menuWidth - viewportPadding),
      );

      const spaceBelow = viewportHeight - buttonRect.bottom - 6;
      const top =
        spaceBelow >= Math.min(menu.scrollHeight, 220)
          ? buttonRect.bottom + 6
          : Math.max(viewportPadding, buttonRect.top - menuHeight - 6);

      setMobileMenuStyle({
        position: 'fixed',
        top,
        left,
        width: menuWidth,
        maxHeight: viewportHeight - viewportPadding * 2,
      });
    };

    updateMobileMenuPosition();

    window.addEventListener('resize', updateMobileMenuPosition);
    window.addEventListener('scroll', updateMobileMenuPosition, true);

    return () => {
      window.removeEventListener('resize', updateMobileMenuPosition);
      window.removeEventListener('scroll', updateMobileMenuPosition, true);
    };
  }, [isOpen, options.length]);

  const selectedOption =
    options.find((option) => option.value === value) || options[0];

  return (
    <div className='admin-sort-dropdown' ref={dropdownRef}>
      <button
        type='button'
        ref={buttonRef}
        className={`admin-sort-button ${isOpen ? 'active' : ''}`}
        onClick={onToggle}
        aria-expanded={isOpen}
      >
        <span>Sort By</span>

        <FiChevronDown className={isOpen ? 'rotated' : ''} />
      </button>

      {isOpen && (
        <div
          ref={menuRef}
          className='admin-sort-menu'
          style={mobileMenuStyle || undefined}
        >
          {options.map((option) => (
            <button
              type='button'
              key={option.value}
              className={
                option.value === selectedOption?.value ? 'selected' : ''
              }
              onClick={() => onChange(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminSortDropdown;
