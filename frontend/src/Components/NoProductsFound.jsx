import '../assets/styles/components/NoProductsFound.css';

const NoProductsFound = () => {
  return (
    <div className='no-products-found'>
      <h2>No products found</h2>

      <p>Try adjusting or removing some filters to see more products.</p>
    </div>
  );
};

export default NoProductsFound;
