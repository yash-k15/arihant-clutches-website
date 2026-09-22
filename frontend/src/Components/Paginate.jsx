import { Pagination } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { useLocation } from 'react-router-dom';

import '../assets/styles/components/Paginate.css';

const Paginate = ({
  pages,
  page,
  isAdmin = false,
  adminPath = 'productlist',
  keyword = '',
  collection = '',
  category = '',
  isClientSide = false,
  onPageChange,
}) => {
  const location = useLocation();

  const search = location.search;

  const getPageItems = () => {
    // Show every page when the total is small.
    if (pages <= 7) {
      return Array.from({ length: pages }, (_, index) => index + 1);
    }

    // Near the beginning.
    // Example:
    // < 1 2 3 (4) 5 6 ... 24 >
    if (page <= 4) {
      return [
        ...Array.from({ length: page + 2 }, (_, index) => index + 1),
        'ellipsis-right',
        pages,
      ];
    }

    // Near the end.
    // Example:
    // < 1 ... 19 20 (21) 22 23 24 >
    if (page >= pages - 3) {
      return [
        1,
        'ellipsis-left',
        ...Array.from(
          { length: pages - (page - 2) },
          (_, index) => page - 2 + index,
        ),
      ];
    }

    // Middle.
    // Example:
    // < 1 ... 3 4 (5) 6 7 ... 24 >
    return [
      1,
      'ellipsis-left',
      page - 2,
      page - 1,
      page,
      page + 1,
      page + 2,
      'ellipsis-right',
      pages,
    ];
  };

  const pageItems = getPageItems();

  const getPageLink = (pageNumber) => {
    if (isAdmin) {
      return {
        pathname: `/admin/${adminPath}/${pageNumber}`,
        search,
      };
    }

    if (keyword) {
      return {
        pathname: `/products/search/${keyword}/page/${pageNumber}`,
        search,
      };
    }

    if (collection === 'new-arrivals') {
      return {
        pathname: `/products/new-arrivals/page/${pageNumber}`,
        search,
      };
    }

    if (collection === 'best-sellers') {
      return {
        pathname: `/products/best-sellers/page/${pageNumber}`,
        search,
      };
    }

    if (collection === 'featured') {
      return {
        pathname: `/products/featured/page/${pageNumber}`,
        search,
      };
    }

    if (category) {
      return {
        pathname: `/products/category/${category}/page/${pageNumber}`,
        search,
      };
    }

    return {
      pathname: `/products/page/${pageNumber}`,
      search,
    };
  };

  const renderPage = (pageNumber) => {
    if (isClientSide) {
      return (
        <Pagination.Item
          key={pageNumber}
          active={pageNumber === page}
          onClick={() => onPageChange(pageNumber)}
        >
          {pageNumber}
        </Pagination.Item>
      );
    }

    return (
      <LinkContainer key={pageNumber} to={getPageLink(pageNumber)}>
        <Pagination.Item active={pageNumber === page}>
          {pageNumber}
        </Pagination.Item>
      </LinkContainer>
    );
  };

  const renderPrevious = () => {
    if (page <= 1) {
      return <Pagination.Prev disabled className='custom-pagination-arrow' />;
    }

    if (isClientSide) {
      return (
        <Pagination.Prev
          className='custom-pagination-arrow'
          onClick={() => onPageChange(page - 1)}
        />
      );
    }

    return (
      <LinkContainer to={getPageLink(page - 1)}>
        <Pagination.Prev className='custom-pagination-arrow' />
      </LinkContainer>
    );
  };

  const renderNext = () => {
    if (page >= pages) {
      return <Pagination.Next disabled className='custom-pagination-arrow' />;
    }

    if (isClientSide) {
      return (
        <Pagination.Next
          className='custom-pagination-arrow'
          onClick={() => onPageChange(page + 1)}
        />
      );
    }

    return (
      <LinkContainer to={getPageLink(page + 1)}>
        <Pagination.Next className='custom-pagination-arrow' />
      </LinkContainer>
    );
  };

  if (pages <= 1) {
    return null;
  }

  return (
    <Pagination className='custom-pagination'>
      {renderPrevious()}

      {pageItems.map((item) => {
        if (typeof item === 'string') {
          return (
            <Pagination.Ellipsis
              key={item}
              disabled
              className='custom-pagination-ellipsis'
            />
          );
        }

        return renderPage(item);
      })}

      {renderNext()}
    </Pagination>
  );
};

export default Paginate;
