import { useState } from 'react';
import { Offcanvas } from 'react-bootstrap';

import { useGetCategoriesQuery } from '../slices/productsApiSlice';

import '../assets/styles/components/ProductFilters.css';

const ProductFilters = ({ show, onHide }) => {
  const [availabilityFilter, setAvailabilityFilter] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState([]);

  const { data: categories = [], isLoading: isCategoriesLoading } =
    useGetCategoriesQuery();

  const [priceRange, setPriceRange] = useState({
    min: 0,
    max: 5000,
  });

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
        <div className='products-filter-section'>
          <button type='button' className='products-filter-section-header'>
            <span>Availability</span>
            <span>⌃</span>
          </button>

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

        <div className='products-filter-section'>
          <button type='button' className='products-filter-section-header'>
            <span>Price</span>
            <span>⌃</span>
          </button>

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
                      Math.max(Number(event.target.value) || 0, priceRange.min),
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

        <div className='products-filter-section'>
          <button type='button' className='products-filter-section-header'>
            <span>Product Type</span>
            <span>⌃</span>
          </button>

          <div className='products-filter-section-content products-filter-category-list'>
            {isCategoriesLoading ? (
              <div className='products-filter-category-loading'>Loading...</div>
            ) : (
              categories.map((category) => {
                const isSelected = selectedCategories.includes(category.name);

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

                    <span className='products-filter-category-count'>(0)</span>
                  </label>
                );
              })
            )}
          </div>
        </div>

        <div className='products-filter-footer'>
          <button
            type='button'
            className='products-filter-results-btn'
            onClick={onHide}
          >
            View Results
          </button>
        </div>
      </Offcanvas.Body>
    </Offcanvas>
  );
};

export default ProductFilters;
