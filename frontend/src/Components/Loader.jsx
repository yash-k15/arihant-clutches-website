import '../assets/styles/components/Loader.css';

const Loader = ({ size = 'default' }) => {
  return (
    <div
      className={`loader-container loader-${size}`}
      role='status'
      aria-live='polite'
    >
      <span className='loader-spinner' aria-hidden='true'></span>
      <span className='visually-hidden'>Loading...</span>
    </div>
  );
};

export default Loader;
