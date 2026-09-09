import { LinkContainer } from 'react-router-bootstrap';
import { Table, Button } from 'react-bootstrap';
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
import { getCloudinaryImage } from '../../utils/cloudinary';
import '../../assets/styles/components/ProductListScreen.css';

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

  const createProductHandler = () => {
    navigate('/admin/product/create');
  };

  const formatPrice = (price) => new Intl.NumberFormat('en-IN').format(price);

  return (
    <div className='admin-products-page'>
      <div className='admin-products-header'>
        <div>
          <p className='admin-products-subtitle'>ADMIN PANEL</p>
          <h1 className='admin-products-title'>Products</h1>
          <p className='admin-products-description'>
            Manage your product catalog
          </p>
        </div>

        <Button
          className='admin-products-create-btn'
          onClick={createProductHandler}
        >
          + New Product
        </Button>
      </div>

      <div className='admin-products-toolbar'>
        <div className='admin-products-search'>
          <input
            type='search'
            placeholder='Search products...'
            aria-label='Search products'
          />
        </div>
      </div>

      <div className='admin-products-content'>
        {loadingDelete && <Loader />}

        {isLoading ? (
          <Loader />
        ) : error ? (
          <Message variant='danger'>{error}</Message>
        ) : (
          <>
            {/* Desktop / Tablet */}
            <div className='admin-products-table-wrapper'>
              <Table responsive className='admin-products-table align-middle'>
                <thead>
                  <tr>
                    <th>IMAGE</th>
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
                          src={getCloudinaryImage(
                            product.variants[0]?.images[0],
                            'w_120,h_120,c_fill,f_auto,q_auto',
                          )}
                          alt={product.name}
                          className='admin-products-image'
                        />
                      </td>

                      <td>
                        <Link
                          to={`/products/${product.slug}`}
                          className='admin-products-name'
                        >
                          {product.name}
                        </Link>
                      </td>

                      <td>
                        <div className='admin-products-variants'>
                          {product.variants.map((variant, index) => (
                            <span
                              key={index}
                              className='admin-products-variant'
                            >
                              {variant.color}
                            </span>
                          ))}
                        </div>
                      </td>

                      <td className='admin-products-price'>
                        ₹{formatPrice(product.variants[0]?.price)}
                      </td>

                      <td>
                        {product.variants[0]?.countInStock > 0 ? (
                          <span className='admin-products-stock in-stock'>
                            <span className='admin-products-status-dot' />
                            In Stock
                          </span>
                        ) : (
                          <span className='admin-products-stock out-of-stock'>
                            <span className='admin-products-status-dot' />
                            Out of Stock
                          </span>
                        )}
                      </td>

                      <td>
                        <span className='admin-products-category'>
                          {product.category}
                        </span>
                      </td>

                      <td>
                        <div className='admin-products-actions'>
                          <LinkContainer
                            to={`/admin/product/${product.slug}/edit`}
                          >
                            <Button
                              variant='light'
                              className='admin-products-edit-btn'
                              aria-label={`Edit ${product.name}`}
                              title='Edit product'
                            >
                              <FaEdit />
                            </Button>
                          </LinkContainer>

                          <Button
                            variant='light'
                            className='admin-products-delete-btn'
                            onClick={() => deleteHandler(product.slug)}
                            aria-label={`Delete ${product.name}`}
                            title='Delete product'
                          >
                            <FaTrash />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>

            {/* Mobile */}
            <div className='admin-products-mobile-list'>
              {data.products.map((product) => (
                <div className='admin-product-card' key={product._id}>
                  <div className='admin-product-card-main'>
                    <img
                      src={getCloudinaryImage(
                        product.variants[0]?.images[0],
                        'w_160,h_160,c_fill,f_auto,q_auto',
                      )}
                      alt={product.name}
                      className='admin-product-card-image'
                    />

                    <div className='admin-product-card-info'>
                      <Link
                        to={`/products/${product.slug}`}
                        className='admin-product-card-name'
                      >
                        {product.name}
                      </Link>

                      <div className='admin-product-card-variants'>
                        {product.variants.map((variant, index) => (
                          <span key={index} className='admin-products-variant'>
                            {variant.color}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className='admin-product-card-details'>
                    <div>
                      <span className='admin-product-card-label'>Price</span>
                      <strong className='admin-products-price'>
                        ₹{formatPrice(product.variants[0]?.price)}
                      </strong>
                    </div>

                    <div>
                      <span className='admin-product-card-label'>Stock</span>

                      {product.variants[0]?.countInStock > 0 ? (
                        <span className='admin-products-stock in-stock'>
                          <span className='admin-products-status-dot' />
                          In Stock
                        </span>
                      ) : (
                        <span className='admin-products-stock out-of-stock'>
                          <span className='admin-products-status-dot' />
                          Out of Stock
                        </span>
                      )}
                    </div>

                    <div>
                      <span className='admin-product-card-label'>Category</span>
                      <span className='admin-products-category'>
                        {product.category}
                      </span>
                    </div>
                  </div>

                  <div className='admin-product-card-actions'>
                    <LinkContainer to={`/admin/product/${product.slug}/edit`}>
                      <Button
                        variant='light'
                        className='admin-product-card-edit-btn'
                      >
                        <FaEdit />
                        <span>Edit</span>
                      </Button>
                    </LinkContainer>

                    <Button
                      variant='light'
                      className='admin-product-card-delete-btn'
                      onClick={() => deleteHandler(product.slug)}
                    >
                      <FaTrash />
                      <span>Delete</span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className='admin-products-pagination'>
              <Paginate pages={data.pages} page={data.page} isAdmin={true} />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ProductListScreen;
