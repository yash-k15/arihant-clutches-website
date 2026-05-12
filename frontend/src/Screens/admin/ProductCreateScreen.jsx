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

const ProductCreateScreen = () => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [image, setImage] = useState('');
  const [images, setImages] = useState([]);
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState('');
  const [countInStock, setCountInStock] = useState('');
  const [description, setDescription] = useState('');

  const navigate = useNavigate();

  const [createProduct, { isLoading }] = useCreateProductMutation();
  const [uploadProductImage, { isLoading: loadingUpload }] =
    useUploadProductImageMutation();

  const submitHandler = async (e) => {
    e.preventDefault();
    if (
      !name ||
      !price ||
      !image ||
      !brand ||
      !category ||
      !countInStock ||
      !description
    ) {
      toast.error('Please fill all fields');
      return;
    }

    try {
      console.log({
        name,
        price,
        image,
        images,
        brand,
        category,
        countInStock,
        description,
      });
      const createdProduct = await createProduct({
        name,
        price,
        image,
        images,
        brand,
        category,
        countInStock,
        description,
      }).unwrap();

      toast.success('Product created');

      navigate(`/admin/product/${createdProduct.slug}/edit`);
    } catch (err) {
      toast.error(err?.data?.message || err.error);
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
