import { Pagination } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { useLocation } from 'react-router-dom';

const Paginate = ({
  pages,
  page,
  isAdmin = false,
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
        {[...Array(pages).keys()].map((x) => (
          <LinkContainer
            key={x + 1}
            to={
              !isAdmin
                ? keyword
                  ? {
                      pathname: `/products/search/${keyword}/page/${x + 1}`,
                      search,
                    }
                  : collection === 'new-arrivals'
                    ? {
                        pathname: `/products/new-arrivals/page/${x + 1}`,
                        search,
                      }
                    : collection === 'best-sellers'
                      ? {
                          pathname: `/products/best-sellers/page/${x + 1}`,
                          search,
                        }
                      : collection === 'featured'
                        ? {
                            pathname: `/products/featured/page/${x + 1}`,
                            search,
                          }
                        : category
                          ? {
                              pathname: `/products/category/${category}/page/${x + 1}`,
                              search,
                            }
                          : {
                              pathname: `/products/page/${x + 1}`,
                              search,
                            }
                : `/admin/productlist/${x + 1}`
            }
          >
            <Pagination.Item active={x + 1 === page}>{x + 1}</Pagination.Item>
          </LinkContainer>
        ))}
      </Pagination>
    )
  );
};

export default Paginate;
