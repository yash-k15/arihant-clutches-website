import { useLocation, useNavigate } from 'react-router-dom';

import { BsXLg } from 'react-icons/bs';

import { useGetCategoriesQuery } from '../slices/productsApiSlice';

import '../assets/styles/components/AppliedFilters.css';

const AppliedFilters = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { data: categories = [] } = useGetCategoriesQuery();

  const searchParams = new URLSearchParams(location.search);

  const availability = searchParams.get('filter.v.availability');

  const priceGte = searchParams.get('filter.v.price.gte');

  const priceLte = searchParams.get('filter.v.price.lte');

  const productTypes = searchParams.getAll('filter.p.product_type');

  const hasPriceFilter = priceGte !== null || priceLte !== null;

  const hasFilters =
    availability === '1' || hasPriceFilter || productTypes.length > 0;

  if (!hasFilters) {
    return null;
  }

  const removeFilter = (filterType, value = null) => {
    const params = new URLSearchParams(location.search);

    switch (filterType) {
      case 'availability':
        params.delete('filter.v.availability');
        break;

      case 'price':
        params.delete('filter.v.price.gte');
        params.delete('filter.v.price.lte');
        break;

      case 'productType': {
        const remainingTypes = params
          .getAll('filter.p.product_type')
          .filter((type) => type !== value);

        params.delete('filter.p.product_type');

        remainingTypes.forEach((type) => {
          params.append('filter.p.product_type', type);
        });

        break;
      }

      default:
        break;
    }

    const queryString = params.toString();

    navigate(`${location.pathname}${queryString ? `?${queryString}` : ''}`);
  };

  const clearAll = () => {
    const params = new URLSearchParams(location.search);

    params.delete('filter.v.availability');
    params.delete('filter.v.price.gte');
    params.delete('filter.v.price.lte');
    params.delete('filter.p.product_type');

    const queryString = params.toString();

    navigate(`${location.pathname}${queryString ? `?${queryString}` : ''}`);
  };

  const getCategoryName = (slugOrName) => {
    const category = categories.find(
      (item) => item.name === slugOrName || item.slug === slugOrName,
    );

    return category?.name || slugOrName;
  };

  return (
    <div className='applied-filters'>
      <div className='applied-filters-list'>
        {availability === '1' && (
          <button
            type='button'
            className='applied-filter'
            onClick={() => removeFilter('availability')}
          >
            <span>Availability: In stock</span>
            <BsXLg />
          </button>
        )}

        {hasPriceFilter && (
          <button
            type='button'
            className='applied-filter'
            onClick={() => removeFilter('price')}
          >
            <span>
              Price: ₹{Number(priceGte || 0).toLocaleString('en-IN')} - ₹
              {Number(priceLte || 5000).toLocaleString('en-IN')}
            </span>
            <BsXLg />
          </button>
        )}

        {productTypes.map((productType) => (
          <button
            key={productType}
            type='button'
            className='applied-filter'
            onClick={() => removeFilter('productType', productType)}
          >
            <span>Product type: {getCategoryName(productType)}</span>
            <BsXLg />
          </button>
        ))}
      </div>

      <button
        type='button'
        className='applied-filters-clear'
        onClick={clearAll}
      >
        Clear all
      </button>
    </div>
  );
};

export default AppliedFilters;
