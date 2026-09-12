import { Pagination } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';

const Paginate = ({
  pages,
  page,
  isAdmin = false,
  keyword = '',
  collection = '',
  category = '',
  sort = 'latest',
}) => {
  const sortSearch = sort !== 'latest' ? `?sort=${sort}` : '';

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
                      search: sortSearch,
                    }
                  : collection === 'new-arrivals'
                    ? {
                        pathname: `/products/new-arrivals/page/${x + 1}`,
                        search: sortSearch,
                      }
                    : collection === 'best-sellers'
                      ? {
                          pathname: `/products/best-sellers/page/${x + 1}`,
                          search: sortSearch,
                        }
                      : collection === 'featured'
                        ? {
                            pathname: `/products/featured/page/${x + 1}`,
                            search: sortSearch,
                          }
                        : category
                          ? {
                              pathname: `/products/category/${category}/page/${x + 1}`,
                              search: sortSearch,
                            }
                          : {
                              pathname: `/products/page/${x + 1}`,
                              search: sortSearch,
                            }
                : `/admin/productlist/${x + 1}`
            }
          >
            <Pagination.Item active={x + 1 === page}>{x + 1} </Pagination.Item>
          </LinkContainer>
        ))}
      </Pagination>
    )
  );
};

export default Paginate;
