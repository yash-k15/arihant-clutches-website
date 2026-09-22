import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Offcanvas } from 'react-bootstrap';
import { BsChevronDown } from 'react-icons/bs';

import {
  useGetCategoriesQuery,
  useGetCategoryCountsQuery,
} from '../slices/productsApiSlice';

import '../assets/styles/components/ProductFilters.css';

const ProductFilters = ({
  show,
  onHide,
  keyword,
  category: categorySlug,
  isNewArrival,
  isBestSeller,
  isFeatured,
}) => {
  const location = useLocation();
  const navigate = useNavigate();

  const [availabilityFilter, setAvailabilityFilter] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState([]);

  const [openSections, setOpenSections] = useState({
    availability: false,
    price: false,
    productType: false,
  });

  const [priceRange, setPriceRange] = useState({
    min: 0,
    max: 5000,
  });

  useEffect(() => {
    if (!show) {
      return;
    }

    const params = new URLSearchParams(location.search);

    // Availability
    setAvailabilityFilter(params.get('filter.v.availability') === '1');

    // Price
    const urlMin = params.get('filter.v.price.gte');
    const urlMax = params.get('filter.v.price.lte');

    setPriceRange({
      min: urlMin !== null ? Number(urlMin) : 0,
      max: urlMax !== null ? Number(urlMax) : 5000,
    });

    // Product Type
    if (categorySlug) {
      setSelectedCategories([]);
    } else {
      setSelectedCategories(params.getAll('filter.p.product_type'));
    }
  }, [show, categorySlug, location.search]);

  const { data: categories = [], isLoading: isCategoriesLoading } =
    useGetCategoriesQuery();

  const displayedCategories = categorySlug
    ? categories.filter((item) => item.slug === categorySlug)
    : categories;

  const { data: categoryCounts = {} } = useGetCategoryCountsQuery({
    keyword,
    category: categorySlug,
    isNewArrival,
    isBestSeller,
    isFeatured,
    availability: availabilityFilter ? '1' : undefined,
    priceGte: priceRange.min,
    priceLte: priceRange.max,
  });

  const getPageOnePath = () => {
    return location.pathname
      .replace(/\/page\/\d+$/, '')
      .replace(/\/page\/\d+$/, '');
  };

  const toggleSection = (section) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleApplyFilters = () => {
    const params = new URLSearchParams(location.search);

    // Availability
    if (availabilityFilter) {
      params.set('filter.v.availability', '1');
    } else {
      params.delete('filter.v.availability');
    }

    // Price
    if (priceRange.min > 0) {
      params.set('filter.v.price.gte', priceRange.min);
    } else {
      params.delete('filter.v.price.gte');
    }

    if (priceRange.max < 5000) {
      params.set('filter.v.price.lte', priceRange.max);
    } else {
      params.delete('filter.v.price.lte');
    }

    // Product Type
    params.delete('filter.p.product_type');

    selectedCategories.forEach((categoryName) => {
      params.append('filter.p.product_type', categoryName);
    });

    const queryString = params.toString();

    const pageOnePath = getPageOnePath();

    navigate(`${pageOnePath}${queryString ? `?${queryString}` : ''}`);

    onHide();
  };

  return (
    <Offcanvas
      show={show}
      onHide={onHide}
      placement='end'
      className='products-filter-drawer'
      backdrop={true}
    >
      <Offcanvas.Header closeButton className='products-filter-header'>
        <Offcanvas.Title className='products-filter-title'>
          Filters
        </Offcanvas.Title>
      </Offcanvas.Header>

      <Offcanvas.Body className='products-filter-body'>
        <div className='products-filter-content'>
          <div className='products-filter-section'>
            <button
              type='button'
              className='products-filter-section-header'
              onClick={() => toggleSection('availability')}
              aria-expanded={openSections.availability}
            >
              <span>Availability</span>

              <BsChevronDown
                className={`products-filter-section-arrow ${
                  openSections.availability ? 'open' : ''
                }`}
              />
            </button>
            <div
              className={`products-filter-section-content-wrapper ${
                openSections.availability ? 'open' : ''
              }`}
            >
              <div className='products-filter-section-content'>
                <label className='products-filter-toggle-row'>
                  <button
                    type='button'
                    className={`products-filter-toggle ${
                      availabilityFilter ? 'active' : ''
                    }`}
                    onClick={() => setAvailabilityFilter((prev) => !prev)}
                    aria-pressed={availabilityFilter}
                    aria-label='Toggle in stock filter'
                  >
                    <span className='products-filter-toggle-knob' />
                  </button>

                  <span className='products-filter-toggle-label'>
                    In stock only
                  </span>
                </label>
              </div>
            </div>
          </div>

          <div className='products-filter-section'>
            <button
              type='button'
              className='products-filter-section-header'
              onClick={() => toggleSection('price')}
              aria-expanded={openSections.price}
            >
              <span>Price</span>

              <BsChevronDown
                className={`products-filter-section-arrow ${
                  openSections.price ? 'open' : ''
                }`}
              />
            </button>

            <div
              className={`products-filter-section-content-wrapper ${
                openSections.price ? 'open' : ''
              }`}
            >
              <div className='products-filter-section-content'>
                <div className='products-filter-price-slider'>
                  <div className='products-filter-price-track' />

                  <div
                    className='products-filter-price-range'
                    style={{
                      left: `${(priceRange.min / 5000) * 100}%`,
                      right: `${100 - (priceRange.max / 5000) * 100}%`,
                    }}
                  />

                  <input
                    type='range'
                    min='0'
                    max='5000'
                    value={priceRange.min}
                    onChange={(event) =>
                      setPriceRange((prev) => ({
                        ...prev,
                        min: Math.min(Number(event.target.value), prev.max),
                      }))
                    }
                    className='products-filter-price-input products-filter-price-min'
                    aria-label='Minimum price'
                  />

                  <input
                    type='range'
                    min='0'
                    max='5000'
                    value={priceRange.max}
                    onChange={(event) =>
                      setPriceRange((prev) => ({
                        ...prev,
                        max: Math.max(Number(event.target.value), prev.min),
                      }))
                    }
                    className='products-filter-price-input products-filter-price-max'
                    aria-label='Maximum price'
                  />
                </div>

                <div className='products-filter-price-inputs'>
                  <div className='products-filter-price-box'>
                    <span>₹</span>
                    <input
                      type='number'
                      min='0'
                      max='5000'
                      value={priceRange.min}
                      onChange={(event) => {
                        const value = Math.min(
                          Math.max(Number(event.target.value) || 0, 0),
                          priceRange.max,
                        );

                        setPriceRange((prev) => ({
                          ...prev,
                          min: value,
                        }));
                      }}
                      aria-label='Minimum price'
                    />
                  </div>

                  <span className='products-filter-price-to'>to</span>

                  <div className='products-filter-price-box'>
                    <span>₹</span>
                    <input
                      type='number'
                      min='0'
                      max='5000'
                      value={priceRange.max}
                      onChange={(event) => {
                        const value = Math.min(
                          Math.max(
                            Number(event.target.value) || 0,
                            priceRange.min,
                          ),
                          5000,
                        );

                        setPriceRange((prev) => ({
                          ...prev,
                          max: value,
                        }));
                      }}
                      aria-label='Maximum price'
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className='products-filter-section'>
            <button
              type='button'
              className='products-filter-section-header'
              onClick={() => toggleSection('productType')}
              aria-expanded={openSections.productType}
            >
              <span>Product Type</span>

              <BsChevronDown
                className={`products-filter-section-arrow ${
                  openSections.productType ? 'open' : ''
                }`}
              />
            </button>

            <div
              className={`products-filter-section-content-wrapper ${
                openSections.productType ? 'open' : ''
              }`}
            >
              <div className='products-filter-section-content products-filter-category-list'>
                {isCategoriesLoading ? (
                  <div className='products-filter-category-loading'>
                    Loading...
                  </div>
                ) : (
                  displayedCategories.map((category) => {
                    const isSelected = categorySlug
                      ? category.slug === categorySlug
                      : selectedCategories.includes(category.name);

                    return (
                      <label
                        key={category._id}
                        className={`products-filter-category-option ${
                          isSelected ? 'selected' : ''
                        }`}
                      >
                        <input
                          type='checkbox'
                          checked={isSelected}
                          onChange={() => {
                            if (categorySlug) {
                              return;
                            }

                            setSelectedCategories((prev) =>
                              isSelected
                                ? prev.filter((name) => name !== category.name)
                                : [...prev, category.name],
                            );
                          }}
                        />

                        <span className='products-filter-category-name'>
                          {category.name}
                        </span>

                        <span className='products-filter-category-count'>
                          ({categoryCounts[category.name] || 0})
                        </span>
                      </label>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>

        <div className='products-filter-footer'>
          <button
            type='button'
            className='products-filter-results-btn'
            onClick={handleApplyFilters}
          >
            View Results
          </button>
        </div>
      </Offcanvas.Body>
    </Offcanvas>
  );
};

export default ProductFilters;
