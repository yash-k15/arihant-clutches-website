import { useEffect, useState } from 'react';
import { Form, Button, Card } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';

import Message from '../../Components/Message';
import Loader from '../../Components/Loader';
import FormContainer from '../../Components/FormContainer';
import AdminVariantManager from '../../Components/AdminVariantManager';

import {
  useCreateProductMutation,
  useUpdateProductMutation,
  useGetProductDetailsQuery,
  useUploadProductImageMutation,
  useDeleteProductImageMutation,
  useGetCategoriesQuery,
} from '../../slices/productsApiSlice';

import '../../assets/styles/components/ProductFormScreen.css';

const ProductFormScreen = () => {
  const { id: productId } = useParams();
  const navigate = useNavigate();

  const isEditMode = Boolean(productId);

  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [material, setMaterial] = useState('');
  const [dimensions, setDimensions] = useState('');
  const [weight, setWeight] = useState('');

  const [isFeatured, setIsFeatured] = useState(false);
  const [isNewArrival, setIsNewArrival] = useState(false);
  const [isBestSeller, setIsBestSeller] = useState(false);

  const [variants, setVariants] = useState([]);

  const {
    data: product,
    isLoading: isLoadingProduct,
    error: productError,
  } = useGetProductDetailsQuery(productId, {
    skip: !isEditMode,
  });

  const {
    data: categories,
    isLoading: isLoadingCategories,
    error: categoriesError,
  } = useGetCategoriesQuery();

  const [createProduct, { isLoading: loadingCreate }] =
    useCreateProductMutation();

  const [updateProduct, { isLoading: loadingUpdate }] =
    useUpdateProductMutation();

  const [uploadProductImage] = useUploadProductImageMutation();
  const [deleteProductImage] = useDeleteProductImageMutation();

  const isSubmitting = loadingCreate || loadingUpdate;

  useEffect(() => {
    if (product && isEditMode) {
      setName(product.name || '');
      setBrand(product.brand || '');
      setCategory(product.category || '');
      setDescription(product.description || '');
      setMaterial(product.material || '');
      setDimensions(product.dimensions || '');
      setWeight(product.weight || '');

      setIsFeatured(product.isFeatured || false);
      setIsNewArrival(product.isNewArrival || false);
      setIsBestSeller(product.isBestSeller || false);

      setVariants(product.variants || []);
    }
  }, [product, isEditMode]);

  const submitHandler = async (e) => {
    e.preventDefault();

    if (!name || !brand || !category || !description) {
      toast.error('Please fill all required fields');
      return;
    }

    if (variants.length === 0) {
      toast.error('Please add at least one variant');
      return;
    }

    const invalidVariant = variants.find(
      (variant) =>
        !variant.color || !variant.price || variant.images.length === 0,
    );

    if (invalidVariant) {
      toast.error('Each variant must have color, price and at least one image');
      return;
    }

    try {
      if (isEditMode) {
        await updateProduct({
          productId,
          name,
          brand,
          category,
          description,
          material,
          dimensions,
          weight,
          isFeatured,
          isNewArrival,
          isBestSeller,
          variants,
        }).unwrap();

        toast.success('Product updated');

        navigate('/admin/productlist');
      } else {
        const createdProduct = await createProduct({
          name,
          brand,
          category,
          description,
          material,
          dimensions,
          weight,
          isFeatured,
          isNewArrival,
          isBestSeller,
          variants,
        }).unwrap();

        toast.success('Product created');

        navigate(`/products/${createdProduct.slug}`);
      }
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  return (
    <div className='admin-product-form-page'>
      <FormContainer>
        <Card className='admin-product-form-card'>
          <div className='admin-product-form-header'>
            <p className='admin-product-form-subtitle'>ADMIN PANEL</p>

            <h1 className='admin-product-form-title'>
              {isEditMode ? 'Edit Product' : 'Create Product'}
            </h1>

            <p className='admin-product-form-description'>
              {isEditMode
                ? 'Update the product information and variants below.'
                : 'Add a new product to your catalog.'}
            </p>
          </div>

          {isEditMode && isLoadingProduct ? (
            <Loader />
          ) : isEditMode && productError ? (
            <Message variant='danger'>
              {productError?.data?.message || productError.error}
            </Message>
          ) : (
            <Form onSubmit={submitHandler}>
              <div className='admin-product-form-section'>
                <h2 className='admin-product-form-section-title'>
                  Basic Information
                </h2>

                <Form.Group
                  controlId='name'
                  className='admin-product-form-group'
                >
                  <Form.Label>Name</Form.Label>
                  <Form.Control
                    type='text'
                    placeholder='Enter product name'
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </Form.Group>

                <Form.Group
                  controlId='brand'
                  className='admin-product-form-group'
                >
                  <Form.Label>Brand</Form.Label>
                  <Form.Control
                    type='text'
                    placeholder='Enter brand'
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                  />
                </Form.Group>

                <Form.Group
                  controlId='category'
                  className='admin-product-form-group'
                >
                  <Form.Label>Category</Form.Label>

                  {isLoadingCategories ? (
                    <Loader />
                  ) : categoriesError ? (
                    <Message variant='danger'>
                      {categoriesError?.data?.message || categoriesError.error}
                    </Message>
                  ) : (
                    <Form.Select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      disabled={isSubmitting}
                    >
                      <option value=''>Select category</option>

                      {categories?.map((categoryItem) => (
                        <option
                          key={categoryItem._id}
                          value={categoryItem.name}
                        >
                          {categoryItem.name}
                        </option>
                      ))}
                    </Form.Select>
                  )}
                </Form.Group>

                <Form.Group
                  controlId='description'
                  className='admin-product-form-group'
                >
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    as='textarea'
                    rows={4}
                    placeholder='Enter product description'
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </Form.Group>
              </div>

              <div className='admin-product-form-divider' />

              <div className='admin-product-form-section'>
                <h2 className='admin-product-form-section-title'>
                  Product Details
                </h2>

                <Form.Group
                  controlId='material'
                  className='admin-product-form-group'
                >
                  <Form.Label>Material</Form.Label>
                  <Form.Control
                    type='text'
                    placeholder='Enter material'
                    value={material}
                    onChange={(e) => setMaterial(e.target.value)}
                  />
                </Form.Group>

                <Form.Group
                  controlId='dimensions'
                  className='admin-product-form-group'
                >
                  <Form.Label>Dimensions</Form.Label>
                  <Form.Control
                    type='text'
                    placeholder='Enter dimensions'
                    value={dimensions}
                    onChange={(e) => setDimensions(e.target.value)}
                  />
                </Form.Group>

                <Form.Group
                  controlId='weight'
                  className='admin-product-form-group'
                >
                  <Form.Label>Weight</Form.Label>
                  <Form.Control
                    type='text'
                    placeholder='Enter weight'
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                  />
                </Form.Group>
              </div>

              <div className='admin-product-form-divider' />

              <div className='admin-product-form-section'>
                <h2 className='admin-product-form-section-title'>
                  Product Visibility
                </h2>

                <Form.Check
                  type='switch'
                  id='featured'
                  label='Featured Product'
                  className='admin-product-form-switch'
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                />

                <Form.Check
                  type='switch'
                  id='newarrival'
                  label='New Arrival'
                  className='admin-product-form-switch'
                  checked={isNewArrival}
                  onChange={(e) => setIsNewArrival(e.target.checked)}
                />

                <Form.Check
                  type='switch'
                  id='bestseller'
                  label='Best Seller'
                  className='admin-product-form-switch'
                  checked={isBestSeller}
                  onChange={(e) => setIsBestSeller(e.target.checked)}
                />
              </div>

              <div className='admin-product-form-divider' />

              <AdminVariantManager
                variants={variants}
                setVariants={setVariants}
                uploadProductImage={uploadProductImage}
                deleteProductImage={deleteProductImage}
                toast={toast}
                productName={name}
              />

              <div className='admin-product-form-actions'>
                <Button
                  type='button'
                  className='admin-product-form-cancel'
                  onClick={() => navigate('/admin/productlist')}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>

                <Button
                  type='submit'
                  className='admin-product-form-submit'
                  disabled={isSubmitting}
                >
                  {isSubmitting
                    ? isEditMode
                      ? 'Updating Product...'
                      : 'Creating Product...'
                    : isEditMode
                      ? 'Update Product'
                      : 'Create Product'}
                </Button>
              </div>
            </Form>
          )}
        </Card>
      </FormContainer>
    </div>
  );
};

export default ProductFormScreen;
