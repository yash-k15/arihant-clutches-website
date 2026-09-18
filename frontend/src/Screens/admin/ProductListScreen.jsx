import { useState } from 'react';
import { LinkContainer } from 'react-router-bootstrap';
import { Table, Button, Modal, Form } from 'react-bootstrap';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FaEdit, FaTrash } from 'react-icons/fa';
import Message from '../../Components/Message';
import Loader from '../../Components/Loader';
import { toast } from 'react-toastify';
import {
  useGetProductsQuery,
  useDeleteProductMutation,
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
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

  const {
    data: categories,
    isLoading: categoriesLoading,
    error: categoriesError,
  } = useGetCategoriesQuery();

  const [createCategory, { isLoading: loadingCreateCategory }] =
    useCreateCategoryMutation();

  const [updateCategory, { isLoading: loadingUpdateCategory }] =
    useUpdateCategoryMutation();

  const [deleteCategory, { isLoading: loadingDeleteCategory }] =
    useDeleteCategoryMutation();

  const [deleteProduct, { isLoading: loadingDelete }] =
    useDeleteProductMutation();

  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [categoryName, setCategoryName] = useState('');
  const [editingCategory, setEditingCategory] = useState(null);

  const openCategoryModal = () => {
    setShowCategoryModal(true);
    setCategoryName('');
    setEditingCategory(null);
  };

  const closeCategoryModal = () => {
    setShowCategoryModal(false);
    setCategoryName('');
    setEditingCategory(null);
  };

  const submitCategoryHandler = async (e) => {
    e.preventDefault();

    if (!categoryName.trim()) {
      toast.error('Category name is required');
      return;
    }

    try {
      if (editingCategory) {
        await updateCategory({
          categoryId: editingCategory._id,
          name: categoryName.trim(),
        }).unwrap();

        toast.success('Category updated');
      } else {
        await createCategory({
          name: categoryName.trim(),
        }).unwrap();

        toast.success('Category added');
      }

      setCategoryName('');
      setEditingCategory(null);
    } catch (err) {
      toast.error(err?.data?.message || err.error || 'Something went wrong');
    }
  };

  const editCategoryHandler = (category) => {
    setEditingCategory(category);
    setCategoryName(category.name);
  };

  const deleteCategoryHandler = async (category) => {
    if (
      !window.confirm(`Are you sure you want to delete "${category.name}"?`)
    ) {
      return;
    }

    try {
      await deleteCategory(category._id).unwrap();

      toast.success('Category deleted');
    } catch (err) {
      toast.error(
        err?.data?.message || err.error || 'Unable to delete category',
      );
    }
  };

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

  const getTotalStock = (product) =>
    product.variants.reduce(
      (total, variant) => total + Number(variant.countInStock || 0),
      0,
    );

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

        <div className='admin-products-header-actions'>
          <Button
            className='admin-products-category-btn'
            onClick={openCategoryModal}
          >
            Manage Categories
          </Button>

          <Button
            className='admin-products-create-btn'
            onClick={createProductHandler}
          >
            + New Product
          </Button>
        </div>
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
                        <div className='admin-products-stock-details'>
                          <div
                            className={`admin-products-stock ${
                              getTotalStock(product) > 0
                                ? 'in-stock'
                                : 'out-of-stock'
                            }`}
                          >
                            <span className='admin-products-status-dot' />
                            {getTotalStock(product) > 0
                              ? `${getTotalStock(product)} Total`
                              : 'Out of Stock'}
                          </div>

                          <div className='admin-products-variant-stock'>
                            {product.variants.map((variant) => (
                              <div
                                key={variant._id}
                                className='admin-products-variant-stock-row'
                              >
                                <span>{variant.color}</span>
                                <span>{variant.countInStock}</span>
                              </div>
                            ))}
                          </div>
                        </div>
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

                      <div className='admin-products-stock-details'>
                        <div
                          className={`admin-products-stock ${
                            getTotalStock(product) > 0
                              ? 'in-stock'
                              : 'out-of-stock'
                          }`}
                        >
                          <span className='admin-products-status-dot' />
                          {getTotalStock(product) > 0
                            ? `${getTotalStock(product)} Total`
                            : 'Out of Stock'}
                        </div>

                        <div className='admin-products-variant-stock'>
                          {product.variants.map((variant) => (
                            <div
                              key={variant._id}
                              className='admin-products-variant-stock-row'
                            >
                              <span>{variant.color}</span>
                              <span>{variant.countInStock}</span>
                            </div>
                          ))}
                        </div>
                      </div>
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
      <Modal
        show={showCategoryModal}
        onHide={closeCategoryModal}
        centered
        className='admin-category-modal'
      >
        <Modal.Header closeButton>
          <Modal.Title>Manage Categories</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form onSubmit={submitCategoryHandler}>
            <Form.Group className='admin-category-form-group'>
              <Form.Label>
                {editingCategory ? 'Rename category' : 'Add category'}
              </Form.Label>

              <div className='admin-category-input-row'>
                <Form.Control
                  type='text'
                  placeholder='Enter category name'
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  disabled={loadingCreateCategory || loadingUpdateCategory}
                />

                <Button
                  type='submit'
                  className='admin-category-submit-btn'
                  disabled={loadingCreateCategory || loadingUpdateCategory}
                >
                  {editingCategory ? 'Save' : 'Add'}
                </Button>
              </div>
            </Form.Group>
          </Form>

          <div className='admin-category-list'>
            <h6>Categories</h6>

            {categoriesLoading ? (
              <Loader />
            ) : categoriesError ? (
              <Message variant='danger'>
                {categoriesError?.data?.message || 'Unable to load categories'}
              </Message>
            ) : categories?.length === 0 ? (
              <p className='admin-category-empty'>No categories found.</p>
            ) : (
              categories.map((category) => (
                <div className='admin-category-item' key={category._id}>
                  <span>{category.name}</span>

                  <div className='admin-category-actions'>
                    <Button
                      className='admin-category-edit-btn'
                      onClick={() => editCategoryHandler(category)}
                      disabled={
                        loadingCreateCategory ||
                        loadingUpdateCategory ||
                        loadingDeleteCategory
                      }
                      aria-label={`Edit ${category.name}`}
                      title='Edit category'
                    >
                      <FaEdit />
                    </Button>

                    <Button
                      className='admin-category-delete-btn'
                      onClick={() => deleteCategoryHandler(category)}
                      disabled={
                        loadingCreateCategory ||
                        loadingUpdateCategory ||
                        loadingDeleteCategory
                      }
                      aria-label={`Delete ${category.name}`}
                      title='Delete category'
                    >
                      <FaTrash />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </Modal.Body>

        <Modal.Footer>
          <Button
            className='admin-category-close-btn'
            onClick={closeCategoryModal}
          >
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ProductListScreen;
