import { LinkContainer } from 'react-router-bootstrap';
import { Table, Button, Row, Col } from 'react-bootstrap';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FaEdit, FaTrash } from 'react-icons/fa';
import Message from '../../Components/Message';
import Loader from '../../Components/Loader';
import { toast } from 'react-toastify';
import {
  useGetProductsQuery,
  // useCreateProductMutation,
  useDeleteProductMutation,
} from '../../slices/productsApiSlice';
import Paginate from '../../Components/Paginate';

const ProductListScreen = () => {
  const { pageNumber } = useParams();
  const navigate = useNavigate();

  const { data, isLoading, error, refetch } = useGetProductsQuery({
    pageNumber,
  });

  // const [createProduct, { isLoading: loadingCreate }] =
  //   useCreateProductMutation();

  const [deleteProduct, { isLoading: loadingDelete }] =
    useDeleteProductMutation();

  const deleteHandler = async (slug) => {
    if (window.confirm('Are you sure?')) {
      try {
        await deleteProduct(slug);
        toast.success('Product Deleted');
        refetch();
      } catch (err) {
        toast.error(err?.data?.message || err.error);
      }
    }
  };

  const createProductHandler = async () => {
    navigate('/admin/product/create');
  };

  return (
    <>
      <div className='admin-page-header'>
        <Row className='align-items-center'>
          <Col>
            <h1>Products</h1>
          </Col>
          <Col className='text-end'>
            <Button className='admin-create-btn' onClick={createProductHandler}>
              + New Product
            </Button>
          </Col>
        </Row>
      </div>

      {loadingDelete && <Loader />}
      {isLoading ? (
        <Loader />
      ) : error ? (
        <Message variant='danger'>{error}</Message>
      ) : (
        <>
          <Table responsive className='admin-table align-middle'>
            <thead>
              <tr>
                <th>IMAGE</th>
                {/* <th>ID</th> */}
                <th>NAME</th>
                <th>STYLES</th>
                <th>PRICE</th>
                <th>STOCK</th>
                <th>CATEGORY</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {data.products.map((product) => (
                <tr key={product._id}>
                  <td>
                    <img
                      src={product.variants[0]?.images[0]}
                      alt={product.name}
                      className='admin-product-image'
                    />
                  </td>
                  {/* <td>{product._id}</td> */}
                  <td className='admin-product-name'>
                    <Link to={`/products/${product.slug}`}>{product.name}</Link>
                  </td>
                  <td>
                    <div className='admin-variant-list'>
                      {product.variants.map((variant, index) => (
                        <span key={index} className='admin-variant-badge'>
                          {variant.color}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td>₹{product.variants[0]?.price}</td>
                  <td>
                    {product.variants[0]?.countInStock > 0 ? (
                      <span className='stock-badge in-stock-badge'>
                        In Stock
                      </span>
                    ) : (
                      <span className='stock-badge out-stock-badge'>
                        Out of Stock
                      </span>
                    )}
                  </td>
                  <td>{product.category}</td>
                  <td className='admin-actions'>
                    <LinkContainer to={`/admin/product/${product.slug}/edit`}>
                      <Button
                        variant='light'
                        className='admin-action-btn edit-btn'
                      >
                        <FaEdit />
                      </Button>
                    </LinkContainer>
                    <Button
                      variant='danger'
                      className='admin-action-btn delete-btn'
                      onClick={() => deleteHandler(product.slug)}
                    >
                      <FaTrash />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          <Paginate pages={data.pages} page={data.page} isAdmin={true} />
        </>
      )}
    </>
  );
};

export default ProductListScreen;
