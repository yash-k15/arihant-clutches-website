import { FiFilter, FiSearch, FiSliders } from 'react-icons/fi';

import '../assets/styles/components/AdminTableToolbar.css';

const AdminTableToolbar = ({
  searchValue = '',
  onSearchChange,
  searchPlaceholder = 'Search...',
  onFilterClick,
  onSortClick,
  filterCount = 0,
  sortLabel = 'Sort By',
}) => {
  return (
    <div className='admin-table-toolbar'>
      <div className='admin-table-search'>
        <FiSearch className='admin-table-search-icon' />

        <input
          type='search'
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={searchPlaceholder}
          aria-label={searchPlaceholder}
        />
      </div>

      <div className='admin-table-toolbar-actions'>
        {onFilterClick && (
          <button
            type='button'
            className={`admin-table-toolbar-btn ${
              filterCount > 0 ? 'active' : ''
            }`}
            onClick={onFilterClick}
          >
            <FiFilter />
            <span>Filter</span>

            {filterCount > 0 && (
              <span className='admin-table-filter-count'>{filterCount}</span>
            )}
          </button>
        )}

        {onSortClick && (
          <button
            type='button'
            className='admin-table-toolbar-btn'
            onClick={onSortClick}
          >
            <FiSliders />
            <span>{sortLabel}</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default AdminTableToolbar;
