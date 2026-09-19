import { FiChevronDown } from 'react-icons/fi';

import '../assets/styles/components/AdminTableToolbar.css';

const AdminSortDropdown = ({
  value = '',
  options = [],
  onChange,
  isOpen = false,
  onToggle,
}) => {
  const selectedOption =
    options.find((option) => option.value === value) || options[0];

  return (
    <div className='admin-sort-dropdown'>
      <button
        type='button'
        className={`admin-sort-button ${isOpen ? 'active' : ''}`}
        onClick={onToggle}
        aria-expanded={isOpen}
      >
        <span>Sort By</span>

        <FiChevronDown className={isOpen ? 'rotated' : ''} />
      </button>

      {isOpen && (
        <div className='admin-sort-menu'>
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
