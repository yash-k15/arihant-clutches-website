import { FiFilter, FiSearch } from 'react-icons/fi';
import AdminSortDropdown from './AdminSortDropdown';

const AdminTableToolbar = ({
  searchValue = '',
  onSearchChange,
  searchPlaceholder = 'Search...',
  onFilterClick,
  filterCount = 0,

  sortValue = '',
  sortOptions = [],
  sortOpen = false,
  onSortToggle,
  onSortChange,
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

        {sortOptions.length > 0 && (
          <AdminSortDropdown
            value={sortValue}
            options={sortOptions}
            isOpen={sortOpen}
            onToggle={onSortToggle}
            onChange={onSortChange}
          />
        )}
      </div>
    </div>
  );
};

export default AdminTableToolbar;
