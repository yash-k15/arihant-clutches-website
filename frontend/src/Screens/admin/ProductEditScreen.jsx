import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Form, Button } from 'react-bootstrap';
import Message from '../../Components/Message';
import Loader from '../../Components/Loader';
import FormContainer from '../../Components/FormContainer';
import { toast } from 'react-toastify';
import {
  useUpdateProductMutation,
  useGetProductDetailsQuery,
  useUploadProductImageMutation,
} from '../../slices/productsApiSlice';
import AdminVariantManager from '../../Components/AdminVariantManager';
import BackButton from '../../Components/BackButton';

const ProductEditScreen = () => {
  const { id: productId } = useParams();

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
    isLoading,
    refetch,
    error,
  } = useGetProductDetailsQuery(productId);

  const [updateProduct, { isLoading: loadingUpdate }] =
    useUpdateProductMutation();

  const [uploadProductImage] = useUploadProductImageMutation();

  const navigate = useNavigate();

  useEffect(() => {
    if (product) {
      setName(product.name);
      setBrand(product.brand);
      setCategory(product.category);
      setDescription(product.description);
      setMaterial(product.material || '');
      setDimensions(product.dimensions || '');
      setWeight(product.weight || '');
      setIsFeatured(product.isFeatured || false);
      setIsNewArrival(product.isNewArrival || false);
      setIsBestSeller(product.isBestSeller || false);
      setVariants(product.variants || []);
    }
  }, [product]);

  const submitHandler = async (e) => {
    e.preventDefault();
    const updatedProduct = {
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
    };

    const result = await updateProduct(updatedProduct);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success('Product updated');
      refetch();
      navigate('/admin/productlist');
    }
  };

  return (
    <>
      <BackButton />
      <FormContainer>
        <div className='auth-card'>
          <p className='auth-subtitle'>WELCOME ADMIN</p>
          <h1 className='auth-title'>Edit Product</h1>
          {loadingUpdate && <Loader />}

          {isLoading ? (
            <Loader />
          ) : error ? (
            <Message variant='danger'>{error.data.message}</Message>
          ) : (
            <Form onSubmit={submitHandler}>
              <Form.Group controlId='name' className='my-2'>
                <Form.Label>Name</Form.Label>
                <Form.Control
                  type='text'
                  placeholder='Enter Name'
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                ></Form.Control>
              </Form.Group>

              <Form.Group controlId='brand' className='my-2'>
                <Form.Label>Brand</Form.Label>
                <Form.Control
                  type='text'
                  placeholder='Enter Brand'
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                ></Form.Control>
              </Form.Group>

              <Form.Group controlId='category' className='my-2'>
                <Form.Label>Category</Form.Label>
                <Form.Control
                  type='text'
                  placeholder='Enter Category'
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                ></Form.Control>
              </Form.Group>

              <Form.Group controlId='description' className='my-2'>
                <Form.Label>Description</Form.Label>
                <Form.Control
                  type='text'
                  as='textarea'
                  placeholder='Enter description'
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                ></Form.Control>
              </Form.Group>

              <hr className='my-4' />
              <h5 className='admin-section-title'>Product Details</h5>

              <Form.Group controlId='material' className='my-2'>
                <Form.Label>Material</Form.Label>
                <Form.Control
                  type='text'
                  placeholder='Enter Material'
                  value={material}
                  onChange={(e) => setMaterial(e.target.value)}
                ></Form.Control>
              </Form.Group>

              <Form.Group controlId='dimension' className='my-2'>
                <Form.Label>Dimension</Form.Label>
                <Form.Control
                  type='text'
                  placeholder='Enter Dimension'
                  value={dimensions}
                  onChange={(e) => setDimensions(e.target.value)}
                ></Form.Control>
              </Form.Group>

              <Form.Group controlId='weight' className='my-2'>
                <Form.Label>Weight</Form.Label>
                <Form.Control
                  type='text'
                  placeholder='Enter Weight'
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                ></Form.Control>
              </Form.Group>

              <hr className='my-4' />

              <h5 className='admin-section-title'>Product Visibility</h5>

              <Form.Check
                type='switch'
                id='featured'
                label='Featured Product'
                className='my-3 admin-switch'
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
              />

              <Form.Check
                type='switch'
                id='newarrival'
                label='New Arrival'
                className='my-3 admin-switch'
                checked={isNewArrival}
                onChange={(e) => setIsNewArrival(e.target.checked)}
              />

              <Form.Check
                type='switch'
                id='bestseller'
                label='Best Seller'
                className='my-3 admin-switch'
                checked={isBestSeller}
                onChange={(e) => setIsBestSeller(e.target.checked)}
              />

              <AdminVariantManager
                variants={variants}
                setVariants={setVariants}
                uploadProductImage={uploadProductImage}
                toast={toast}
              />

              <Button
                type='submit'
                variant='primary'
                className='admin-create-btn'
              >
                Update
              </Button>
            </Form>
          )}
        </div>
      </FormContainer>
    </>
  );
};

export default ProductEditScreen;
