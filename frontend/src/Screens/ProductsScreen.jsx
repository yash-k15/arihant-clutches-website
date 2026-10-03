import { Row, Col } from 'react-bootstrap';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import Product from '../Components/Product';
import Loader from '../Components/Loader';
import Message from '../Components/Message';
import Paginate from '../Components/Paginate';
import {
  BsGridFill,
  BsGrid3X3GapFill,
  BsGrid3X3,
  BsFilter,
  BsChevronDown,
  BsChevronUp,
} from 'react-icons/bs';

import { useGetProductsQuery } from '../slices/productsApiSlice';

import ProductFilters from '../Components/ProductFilters';
import AppliedFilters from '../Components/AppliedFilters';
import NoProductsFound from '../Components/NoProductsFound';

import Meta from '../Components/Meta.jsx';

import '../assets/styles/components/ProductsScreen.css';

const ProductsScreen = () => {
  const [view, setView] = useState('medium');
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const sortRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sortRef.current && !sortRef.current.contains(event.target)) {
        setIsSortOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const { pageNumber, keyword, category } = useParams();

  const location = useLocation();
  const navigate = useNavigate();

  const searchParams = new URLSearchParams(location.search);

  const sort = searchParams.get('sort') || 'latest';

  const availability = searchParams.get('filter.v.availability');

  const priceGte = searchParams.get('filter.v.price.gte');

  const priceLte = searchParams.get('filter.v.price.lte');

  const productTypes = searchParams.getAll('filter.p.product_type');

  const hasPriceFilter = priceGte !== null || priceLte !== null;

  const filterCount =
    (availability === '1' ? 1 : 0) +
    (hasPriceFilter ? 1 : 0) +
    productTypes.length;

  const sortOptions = [
    { value: 'latest', label: 'Latest' },
    { value: 'price-asc', label: 'Price, low to high' },
    { value: 'price-desc', label: 'Price, high to low' },
    { value: 'rating', label: 'Average rating' },
  ];

  const isNewArrivals = location.pathname.startsWith('/products/new-arrivals');
  const isBestSellers = location.pathname.startsWith('/products/best-sellers');
  const isFeatured = location.pathname.startsWith('/products/featured');

  const getSeoData = () => {
    if (isNewArrivals) {
      return {
        title: 'New Arrivals | Arihant Clutches',
        description:
          'Explore the latest clutch and handbag arrivals from Arihant Clutches.',
        canonical: 'https://arihantclutches.com/products/new-arrivals',
      };
    }

    if (isBestSellers) {
      return {
        title: 'Best Selling Clutches | Arihant Clutches',
        description:
          'Shop the best selling clutches and handbags from Arihant Clutches.',
        canonical: 'https://arihantclutches.com/products/best-sellers',
      };
    }

    if (isFeatured) {
      return {
        title: 'Featured Clutches | Arihant Clutches',
        description:
          'Explore featured clutches and handbags from Arihant Clutches.',
        canonical: 'https://arihantclutches.com/products/featured',
      };
    }

    if (category) {
      const categoryName = category
        .replace(/-/g, ' ')
        .replace(/\b\w/g, (char) => char.toUpperCase());

      return {
        title: `${categoryName} | Arihant Clutches`,
        description: `Shop ${categoryName.toLowerCase()} from Arihant Clutches.`,
        canonical: `https://arihantclutches.com/products/category/${category}`,
      };
    }

    return {
      title: 'Shop Clutches & Handbags | Arihant Clutches',
      description:
        'Shop elegant clutches and handbags from Arihant Clutches. Discover stylish designs for every occasion.',
      canonical: 'https://arihantclutches.com/products',
    };
  };

  const seo = getSeoData();

  const seoCanonical = pageNumber
    ? `${seo.canonical}/page/${pageNumber}`
    : seo.canonical;

  const hasFilters =
    availability !== null ||
    hasPriceFilter ||
    productTypes.length > 0 ||
    sort !== 'latest' ||
    keyword;

  const { data, isLoading, isFetching } = useGetProductsQuery({
    keyword,
    pageNumber,
    category,
    isNewArrival: isNewArrivals,
    isBestSeller: isBestSellers,
    isFeatured,
    sort,
    availability,
    priceGte,
    priceLte,
    productTypes: category ? [] : productTypes,
  });

  const getColumnSizes = () => {
    switch (view) {
      case 'small':
        return {
          xs: 12, // Mobile -> 1
          md: 6, // Tablet -> 2
          lg: 4, // Desktop -> 3
        };

      case 'medium':
        return {
          xs: 6, // 2 columns
          md: 4, // 3 columns
          lg: 3, // 4 columns
        };

      case 'large':
        return {
          xs: 6, // Mobile -> 2
          md: 3, // Tablet -> 4
          lg: 2, // Desktop -> 6
        };

      default:
        return {
          xs: 6,
          md: 4,
          lg: 3,
        };
    }
  };

  const col = getColumnSizes();

  return (
    <>
      <Meta
        title={seo.title}
        description={seo.description}
        canonical={seoCanonical}
        noindex={Boolean(hasFilters)}
      />
      <div className='products-toolbar'>
        <div className='products-view-toggle'>
          <button
            type='button'
            className={`products-view-btn ${view === 'small' ? 'active' : ''}`}
            onClick={() => setView('small')}
            aria-label='3 products per row'
          >
            <BsGridFill />
          </button>

          <button
            type='button'
            className={`products-view-btn ${view === 'medium' ? 'active' : ''}`}
            onClick={() => setView('medium')}
            aria-label='4 products per row'
          >
            <BsGrid3X3GapFill />
          </button>

          <button
            type='button'
            className={`products-view-btn products-view-large ${
              view === 'large' ? 'active' : ''
            }`}
            onClick={() => setView('large')}
            aria-label='6 products per row'
          >
            <BsGrid3X3 />
          </button>
        </div>

        <div className='products-toolbar-actions'>
          <button
            type='button'
            className='products-filter-btn'
            onClick={() => setIsFilterOpen(true)}
          >
            <BsFilter />
            <span>Filter{filterCount > 0 ? ` (${filterCount})` : ''}</span>
          </button>

          <div className='products-sort' ref={sortRef}>
            <button
              type='button'
              className={`products-sort-btn ${isSortOpen ? 'open' : ''}`}
              onClick={() => setIsSortOpen((prev) => !prev)}
              aria-expanded={isSortOpen}
              aria-haspopup='listbox'
            >
              <span>Sort By</span>
              {isSortOpen ? <BsChevronUp /> : <BsChevronDown />}
            </button>

            {isSortOpen && (
              <div
                className='products-sort-overlay'
                onClick={() => setIsSortOpen(false)}
              >
                <div
                  className='products-sort-menu'
                  role='listbox'
                  onClick={(event) => event.stopPropagation()}
                >
                  <div className='products-sort-menu-header'>
                    <span>SORT BY</span>

                    <button
                      type='button'
                      className='products-sort-close'
                      onClick={() => setIsSortOpen(false)}
                      aria-label='Close sort menu'
                    >
                      ×
                    </button>
                  </div>

                  <div className='products-sort-options'>
                    {sortOptions.map((option) => (
                      <button
                        key={option.value}
                        type='button'
                        className={`products-sort-option ${
                          sort === option.value ? 'active' : ''
                        }`}
                        onClick={() => {
                          const params = new URLSearchParams(location.search);

                          if (option.value === 'latest') {
                            params.delete('sort');
                          } else {
                            params.set('sort', option.value);
                          }

                          const queryString = params.toString();

                          const pageOnePath = location.pathname.replace(
                            /\/page\/\d+$/,
                            '',
                          );

                          navigate(
                            `${pageOnePath}${
                              queryString ? `?${queryString}` : ''
                            }`,
                          );

                          setIsSortOpen(false);
                        }}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <ProductFilters
        show={isFilterOpen}
        onHide={() => setIsFilterOpen(false)}
        keyword={keyword}
        category={category}
        isNewArrival={isNewArrivals}
        isBestSeller={isBestSellers}
        isFeatured={isFeatured}
      />

      <AppliedFilters />

      {isLoading || isFetching ? (
        <Loader />
      ) : !data ? (
        <Message variant='danger'>Unable to load products.</Message>
      ) : data.products.length === 0 ? (
        <NoProductsFound />
      ) : (
        <Row className='g-4'>
          {data.products.map((product) => (
            <Col
              key={product._id}
              xs={col.xs}
              md={col.md}
              lg={col.lg}
              className={view === 'small' ? 'products-single-column' : ''}
            >
              <Product product={product} />
            </Col>
          ))}
        </Row>
      )}

      {!isLoading && !isFetching && data && (
        <Paginate
          pages={data.pages}
          page={data.page}
          collection={
            isNewArrivals
              ? 'new-arrivals'
              : isBestSellers
                ? 'best-sellers'
                : isFeatured
                  ? 'featured'
                  : ''
          }
          category={category}
          keyword={keyword}
          sort={sort}
        />
      )}
    </>
  );
};

export default ProductsScreen;
