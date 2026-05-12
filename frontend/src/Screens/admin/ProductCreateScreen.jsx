import { useState } from 'react';
import { Form, Button, Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import FormContainer from '../../Components/FormContainer';
import Loader from '../../Components/Loader';
import {
  useCreateProductMutation,
  useUploadProductImageMutation,
} from '../../slices/productsApiSlice';
import AdminVariantManager from '../../Components/AdminVariantManager';

const ProductCreateScreen = () => {
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

  const navigate = useNavigate();

  const [createProduct, { isLoading }] = useCreateProductMutation();
  const [uploadProductImage] = useUploadProductImageMutation();

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
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  return (
    <FormContainer>
      <Card className='admin-form-card'>
        <div className='admin-form-header'>
          <p className='admin-form-subtitle'>ADMIN PANEL</p>
          <h1 className='admin-form-title'>Create Product</h1>
        </div>

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
              placeholder='Enter Description'
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
            className='admin-submit-btn w-100 mt-3'
            disabled={isLoading}
          >
            Create Product
          </Button>
          {isLoading && <Loader />}
        </Form>
      </Card>
    </FormContainer>
  );
};

export default ProductCreateScreen;
