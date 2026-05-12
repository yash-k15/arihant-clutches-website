import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
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

const ProductEditScreen = () => {
  const { id: productId } = useParams();

  const [name, setName] = useState('');
  const [price, setPrice] = useState(0);
  const [image, setImage] = useState('');
  const [images, setImages] = useState([]);
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState('');
  const [countInStock, setCountInStock] = useState(0);
  const [description, setDescription] = useState('');
  const [material, setMaterial] = useState('');
  const [dimensions, setDimensions] = useState('');
  const [weight, setWeight] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [isNewArrival, setIsNewArrival] = useState(false);
  const [isBestSeller, setIsBestSeller] = useState(false);

  const {
    data: product,
    isLoading,
    refetch,
    error,
  } = useGetProductDetailsQuery(productId);

  const [updateProduct, { isLoading: loadingUpdate }] =
    useUpdateProductMutation();

  const [uploadProductImage, { isLoading: loadingUpload }] =
    useUploadProductImageMutation();

  const navigate = useNavigate();

  useEffect(() => {
    if (product) {
      setName(product.name);
      setPrice(product.price);
      setImage(product.image);
      setBrand(product.brand);
      setCategory(product.category);
      setCountInStock(product.countInStock);
      setDescription(product.description);
      setMaterial(product.material || '');
      setDimensions(product.dimensions || '');
      setWeight(product.weight || '');
      setIsFeatured(product.isFeatured || false);
      setIsNewArrival(product.isNewArrival || false);
      setIsBestSeller(product.isBestSeller || false);
    }
  }, [product]);

  const submitHandler = async (e) => {
    e.preventDefault();
    const updatedProduct = {
      productId,
      name,
      price,
      image,
      brand,
      category,
      countInStock,
      description,
      material,
      dimensions,
      weight,
      isFeatured,
      isNewArrival,
      isBestSeller,
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

  const uploadFileHandler = async (e) => {
    const formData = new FormData();
    // formData.append('image', e.target.files[0]);
    // try {
    //   const res = await uploadProductImage(formData).unwrap();
    //   toast.success(res.message);
    //   setImage(res.image);
    // } catch (err) {
    //   toast.error(err?.data?.message || err.error);
    // }

    for (let i = 0; i < e.target.files.length; i++) {
      formData.append('images', e.target.files[i]);
    }

    try {
      const res = await uploadProductImage(formData).unwrap();
      toast.success(res.message);

      // FIRST IMAGE = MAIN IMAGE
      setImage(res.images[0]);

      // ALL IMAGES
      setImages(res.images);
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  return (
    <>
      <Link to='/admin/productlist' className='btn btn-light my-3'>
        Go Back
      </Link>
      <FormContainer>
        <h1>Edit Product</h1>
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

            <Form.Group controlId='price' className='my-2'>
              <Form.Label>Price</Form.Label>
              <Form.Control
                type='number'
                placeholder='Enter Price'
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              ></Form.Control>
            </Form.Group>

            <Form.Group controlId='image' className='my-2'>
              <Form.Label>Image</Form.Label>
              <Form.Control
                type='text'
                placeholder='Enter Image URL'
                value={image}
                onChange={(e) => setImage(e.target.value)}
              ></Form.Control>
              <Form.Control
                type='file'
                multiple
                label='Choose file'
                onChange={uploadFileHandler}
              ></Form.Control>
              {loadingUpload && <Loader />}
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

            <Form.Group controlId='countInStock' className='my-2'>
              <Form.Label>Count In Stock</Form.Label>
              <Form.Control
                type='number'
                placeholder='Enter Count In Stock'
                value={countInStock}
                onChange={(e) => setCountInStock(e.target.value)}
              ></Form.Control>
            </Form.Group>

            <Form.Group controlId='description' className='my-2'>
              <Form.Label>Description</Form.Label>
              <Form.Control
                type='text'
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

            <Button type='submit' variant='primary' className='my-2'>
              Update
            </Button>
          </Form>
        )}
      </FormContainer>
    </>
  );
};

export default ProductEditScreen;
