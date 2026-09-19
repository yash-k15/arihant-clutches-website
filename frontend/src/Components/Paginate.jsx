import { Pagination } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { useLocation } from 'react-router-dom';

const Paginate = ({
  pages,
  page,
  isAdmin = false,
  adminPath = 'productlist',
  keyword = '',
  collection = '',
  category = '',
  sort = 'latest',
  isClientSide = false,
  onPageChange,
}) => {
  const location = useLocation();

  const search = location.search;

  return (
    pages > 1 && (
      <Pagination className='custom-pagination'>
        {[...Array(pages).keys()].map((x) => {
          const pageNumber = x + 1;

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
            <LinkContainer
              key={pageNumber}
              to={
                !isAdmin
                  ? keyword
                    ? {
                        pathname: `/products/search/${keyword}/page/${pageNumber}`,
                        search,
                      }
                    : collection === 'new-arrivals'
                      ? {
                          pathname: `/products/new-arrivals/page/${pageNumber}`,
                          search,
                        }
                      : collection === 'best-sellers'
                        ? {
                            pathname: `/products/best-sellers/page/${pageNumber}`,
                            search,
                          }
                        : collection === 'featured'
                          ? {
                              pathname: `/products/featured/page/${pageNumber}`,
                              search,
                            }
                          : category
                            ? {
                                pathname: `/products/category/${category}/page/${pageNumber}`,
                                search,
                              }
                            : {
                                pathname: `/products/page/${pageNumber}`,
                                search,
                              }
                  : {
                      pathname: `/admin/${adminPath}/${pageNumber}`,
                      search,
                    }
              }
            >
              <Pagination.Item active={pageNumber === page}>
                {pageNumber}
              </Pagination.Item>
            </LinkContainer>
          );
        })}
      </Pagination>
    )
  );
};

export default Paginate;
