import { Pagination } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';

const Paginate = ({
  pages,
  page,
  isAdmin = false,
  keyword = '',
  collection = '',
  category = '',
}) => {
  return (
    pages > 1 && (
      <Pagination className='custom-pagination'>
        {[...Array(pages).keys()].map((x) => (
          <LinkContainer
            key={x + 1}
            to={
              !isAdmin
                ? keyword
                  ? `/products/search/${keyword}/page/${x + 1}`
                  : collection === 'new-arrivals'
                    ? `/products/new-arrivals/page/${x + 1}`
                    : collection === 'best-sellers'
                      ? `/products/best-sellers/page/${x + 1}`
                      : collection === 'featured'
                        ? `/products/featured/page/${x + 1}`
                        : category
                          ? `/products/category/${category}/page/${x + 1}`
                          : `/products/page/${x + 1}`
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
