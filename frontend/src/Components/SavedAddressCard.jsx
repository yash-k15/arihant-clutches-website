import { FiMoreVertical } from 'react-icons/fi';

const SavedAddressCard = ({
  address,
  onEdit,
  onDelete,
  showMenu,
  onToggleMenu,
  isDeleting = false,
}) => {
  return (
    <div className='saved-address-card'>
      <div className='saved-address-header'>
        <div className='saved-address-heading'>
          <div className='saved-address-name-row'>
            <h4>{address.fullName}</h4>

            {address.isDefault && (
              <span className='saved-address-default'>Default</span>
            )}
          </div>

          <p className='saved-address-phone'>{address.phone}</p>
        </div>

        <div className='saved-address-menu-wrapper'>
          <button
            type='button'
            className='saved-address-menu-button'
            onClick={() => onToggleMenu(address._id)}
            aria-label='Address options'
            aria-expanded={showMenu}
          >
            <FiMoreVertical />
          </button>

          {showMenu && (
            <div className='saved-address-menu'>
              <button type='button' onClick={() => onEdit(address)}>
                Edit
              </button>

              <button
                type='button'
                onClick={() => onDelete(address._id)}
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className='saved-address-details'>
        <p>{address.addressLine1}</p>

        {address.addressLine2 && <p>{address.addressLine2}</p>}

        <p>
          {address.city}, {address.state} - {address.postalCode}
        </p>
      </div>
    </div>
  );
};

export default SavedAddressCard;
