import { useEffect, useState } from 'react';
import { Form, Button, Card } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';

import Message from '../../Components/Message';
import Loader from '../../Components/Loader';
import FormContainer from '../../Components/FormContainer';
import AdminVariantManager from '../../Components/AdminVariantManager';

import {
  useCreateProductMutation,
  useUpdateProductMutation,
  useAdjustVariantStockMutation,
  useGetProductDetailsQuery,
  useUploadProductImageMutation,
  useUploadProductVideoMutation,
  useDeleteProductVideoMutation,
  useGetCategoriesQuery,
  useCleanupUnusedProductImageMutation,
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

  const [removedImageUrls, setRemovedImageUrls] = useState([]);
  const [uploadedImageUrls, setUploadedImageUrls] = useState([]);

  const [video, setVideo] = useState({
    url: '',
    publicId: '',
  });

  const [originalVideo, setOriginalVideo] = useState({
    url: '',
    publicId: '',
  });

  const [uploadedVideoIds, setUploadedVideoIds] = useState([]);

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

  const [adjustVariantStock] = useAdjustVariantStockMutation();

  const [uploadProductImage] = useUploadProductImageMutation();

  const [cleanupUnusedProductImage] = useCleanupUnusedProductImageMutation();

  const [uploadProductVideo, { isLoading: isUploadingVideo }] =
    useUploadProductVideoMutation();

  const [deleteProductVideo, { isLoading: isDeletingVideo }] =
    useDeleteProductVideoMutation();

  const isSubmitting =
    loadingCreate || loadingUpdate || isUploadingVideo || isDeletingVideo;

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

      setRemovedImageUrls([]);
      setUploadedImageUrls([]);

      const productVideo = product.video || {
        url: '',
        publicId: '',
      };

      setVideo(productVideo);
      setOriginalVideo(productVideo);
      setUploadedVideoIds([]);
    }
  }, [product, isEditMode]);

  const handleVideoUpload = async (e) => {
    const file = e.target.files[0];

    if (!file) return;

    if (file.type !== 'video/mp4') {
      toast.warning('Please select an MP4 video');
      e.target.value = '';
      return;
    }

    const formData = new FormData();

    formData.append('video', file);
    formData.append('productName', name);

    try {
      const res = await uploadProductVideo(formData).unwrap();

      setVideo(res.video);

      setUploadedVideoIds((prev) => [...prev, res.video.publicId]);

      toast.success('Video uploaded successfully');
    } catch (error) {
      toast.error(error?.data?.message || 'Video upload failed');
    } finally {
      e.target.value = '';
    }
  };

  const handleVideoRemove = () => {
    setVideo({
      url: '',
      publicId: '',
    });
  };

  const cleanupUnusedVideos = async (videoIds) => {
    const uniqueVideoIds = [...new Set(videoIds)];

    await Promise.all(
      uniqueVideoIds.map((publicId) => deleteProductVideo(publicId).unwrap()),
    );
  };

  const cleanupUnusedImages = async (imageUrls) => {
    const uniqueImageUrls = [...new Set(imageUrls)];

    await Promise.all(
      uniqueImageUrls.map((imageUrl) =>
        cleanupUnusedProductImage(imageUrl).unwrap(),
      ),
    );
  };

  const handleCancel = async () => {
    if (uploadedImageUrls.length > 0) {
      try {
        await cleanupUnusedImages(uploadedImageUrls);
      } catch (error) {
        console.error('Failed to clean up uploaded product images:', error);
      }
    }

    if (uploadedVideoIds.length > 0) {
      try {
        await cleanupUnusedVideos(uploadedVideoIds);
      } catch (error) {
        console.error('Failed to clean up uploaded product videos:', error);
      }
    }

    navigate('/admin/productlist');
  };

  const submitHandler = async (e) => {
    e.preventDefault();

    if (!name || !brand || !category || !description) {
      toast.warning('Please fill all required fields');
      return;
    }

    if (variants.length === 0) {
      toast.warning('Please add at least one variant');
      return;
    }

    const invalidVariant = variants.find(
      (variant) =>
        !variant.color || !variant.price || variant.images.length === 0,
    );

    if (invalidVariant) {
      toast.warning(
        'Each variant must have color, price and at least one image',
      );
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
          video,
        }).unwrap();

        const currentImageUrls = variants.flatMap(
          (variant) => variant.images || [],
        );

        const unusedUploadedImages = uploadedImageUrls.filter(
          (imageUrl) => !currentImageUrls.includes(imageUrl),
        );

        if (unusedUploadedImages.length > 0) {
          try {
            await cleanupUnusedImages(unusedUploadedImages);
          } catch (error) {
            console.error(
              'Some unused uploaded product images could not be deleted:',
              error,
            );
          }
        }

        if (removedImageUrls.length > 0) {
          try {
            await cleanupUnusedImages(removedImageUrls);
          } catch (error) {
            console.error(
              'Some removed product images could not be deleted:',
              error,
            );
          }
        }

        const videosToDelete = uploadedVideoIds.filter(
          (publicId) => publicId !== video.publicId,
        );

        if (
          originalVideo.publicId &&
          originalVideo.publicId !== video.publicId
        ) {
          videosToDelete.push(originalVideo.publicId);
        }

        if (videosToDelete.length > 0) {
          try {
            await cleanupUnusedVideos(videosToDelete);
          } catch (error) {
            console.error(
              'Some unused product videos could not be deleted:',
              error,
            );
          }
        }

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
          video,
        }).unwrap();

        toast.success('Product created');

        navigate(`/products/${createdProduct.slug}`);
      }
    } catch (err) {
      if (uploadedImageUrls.length > 0) {
        try {
          await cleanupUnusedImages(uploadedImageUrls);
        } catch (cleanupError) {
          console.error(
            'Failed to clean up uploaded product images:',
            cleanupError,
          );
        }
      }

      if (uploadedVideoIds.length > 0) {
        try {
          await cleanupUnusedVideos(uploadedVideoIds);
        } catch (cleanupError) {
          console.error(
            'Failed to clean up uploaded product videos:',
            cleanupError,
          );
        }
      }

      toast.error(err?.data?.message || err.error || 'Unable to save product');
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

              <div className='admin-product-form-section'>
                <h2 className='admin-product-form-section-title'>
                  Product Video
                </h2>

                {video.url ? (
                  <div className='admin-product-form-video'>
                    <video src={video.url} controls preload='metadata' />

                    <div className='admin-product-form-video-actions'>
                      <Form.Group controlId='product-video'>
                        <Form.Label
                          className='admin-product-form-video-replace'
                          aria-disabled={isUploadingVideo || isDeletingVideo}
                        >
                          {isUploadingVideo ? 'Uploading...' : 'Replace Video'}

                          <Form.Control
                            type='file'
                            accept='video/mp4,.mp4'
                            onChange={handleVideoUpload}
                            disabled={isUploadingVideo || isDeletingVideo}
                            hidden
                          />
                        </Form.Label>
                      </Form.Group>

                      <Button
                        type='button'
                        className='admin-product-form-video-remove'
                        onClick={handleVideoRemove}
                        disabled={isUploadingVideo || isDeletingVideo}
                      >
                        {isDeletingVideo ? 'Removing...' : 'Remove Video'}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Form.Group controlId='product-video'>
                    <Form.Label>Upload Product Video</Form.Label>

                    <Form.Control
                      type='file'
                      accept='video/mp4,.mp4'
                      onChange={handleVideoUpload}
                      disabled={isUploadingVideo || isDeletingVideo}
                    />

                    <Form.Text>
                      MP4 videos only. Upload one video for this product.
                    </Form.Text>
                  </Form.Group>
                )}
              </div>

              <AdminVariantManager
                variants={variants}
                setVariants={setVariants}
                uploadProductImage={uploadProductImage}
                adjustVariantStock={adjustVariantStock}
                toast={toast}
                productName={name}
                productSlug={product?.slug || productId}
                isEditMode={isEditMode}
                uploadedImageUrls={uploadedImageUrls}
                setRemovedImageUrls={setRemovedImageUrls}
                setUploadedImageUrls={setUploadedImageUrls}
              />

              <div className='admin-product-form-actions'>
                <Button
                  type='button'
                  className='admin-product-form-cancel'
                  onClick={handleCancel}
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
