import { IoCloseSharp } from 'react-icons/io5';

import '../assets/styles/components/ConfirmationModal.css';

const ConfirmationModal = ({
  show,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  isLoading = false,
  loadingText = 'Processing...',
}) => {
  if (!show) {
    return null;
  }

  return (
    <div
      className='confirmation-modal-backdrop'
      onClick={() => {
        if (!isLoading) {
          onCancel();
        }
      }}
    >
      <div
        className='confirmation-modal'
        role='dialog'
        aria-modal='true'
        aria-labelledby='confirmation-modal-title'
        onClick={(event) => event.stopPropagation()}
      >
        <div className='confirmation-modal-icon'>
          <IoCloseSharp />
        </div>

        <h2 id='confirmation-modal-title'>{title}</h2>

        <p>{message}</p>

        <div className='confirmation-modal-actions'>
          <button
            type='button'
            className='confirmation-modal-cancel'
            onClick={onCancel}
            disabled={isLoading}
          >
            {cancelText}
          </button>

          <button
            type='button'
            className='confirmation-modal-confirm'
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? loadingText : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
