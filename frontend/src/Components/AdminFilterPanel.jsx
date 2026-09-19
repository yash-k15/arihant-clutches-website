import { FiX } from 'react-icons/fi';

import '../assets/styles/components/AdminTableToolbar.css';

const AdminFilterPanel = ({
  show = false,
  onClose,
  onReset,
  onApply,
  filterCount = 0,
  children,
}) => {
  if (!show) {
    return null;
  }

  return (
    <div className='admin-filter-overlay' onClick={onClose}>
      <div className='admin-filter-panel' onClick={(e) => e.stopPropagation()}>
        <div className='admin-filter-header'>
          <div>
            <h3>Filters</h3>

            {filterCount > 0 && (
              <span>
                {filterCount} {filterCount === 1 ? 'filter' : 'filters'} applied
              </span>
            )}
          </div>

          <button
            type='button'
            className='admin-filter-close'
            onClick={onClose}
            aria-label='Close filters'
          >
            <FiX />
          </button>
        </div>

        <div className='admin-filter-body'>{children}</div>

        <div className='admin-filter-footer'>
          <button
            type='button'
            className='admin-filter-reset'
            onClick={onReset}
            disabled={filterCount === 0}
          >
            Reset Filters
          </button>

          <button
            type='button'
            className='admin-filter-apply'
            onClick={onApply}
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminFilterPanel;
