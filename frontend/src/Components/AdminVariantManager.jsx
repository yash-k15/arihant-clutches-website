import { useState } from 'react';
import { Card, Row, Col, Form, Button } from 'react-bootstrap';
import { getCloudinaryImage } from '../utils/cloudinary';

import '../assets/styles/components/AdminVariantManager.css';

const AdminVariantManager = ({
  variants,
  setVariants,
  uploadProductImage,
  deleteProductImage,
  toast,
  productName,
}) => {
  const [draggedImage, setDraggedImage] = useState(null);

  // ADD VARIANT
  const addVariantHandler = () => {
    setVariants([
      ...variants,
      {
        color: '',
        countInStock: 0,
        images: [],
      },
    ]);
  };

  // REMOVE VARIANT
  const removeVariantHandler = (index) => {
    const updatedVariants = [...variants];

    updatedVariants.splice(index, 1);

    setVariants(updatedVariants);
  };

  // UPDATE VARIANT FIELD
  const updateVariantField = (index, field, value) => {
    const updatedVariants = [...variants];

    updatedVariants[index] = {
      ...updatedVariants[index],
      [field]: value,
    };

    setVariants(updatedVariants);
  };

  // UPLOAD VARIANT IMAGES
  const uploadVariantImagesHandler = async (e, index) => {
    const formData = new FormData();

    for (let i = 0; i < e.target.files.length; i++) {
      formData.append('images', e.target.files[i]);
    }

    // send product name
    formData.append('productName', productName || 'temp');

    // send current variant color
    formData.append('color', variants[index]?.color || 'default');

    try {
      const res = await uploadProductImage(formData).unwrap();

      const updatedVariants = [...variants];

      updatedVariants[index] = {
        ...updatedVariants[index],
        images: [
          ...(updatedVariants[index].images || []),
          ...(res.images || []),
        ],
      };

      setVariants(updatedVariants);

      // Clear selected files
      e.target.value = '';

      toast.success('Variant images uploaded');
    } catch (err) {
      toast.error(
        err?.data?.message || err.error || 'Unable to upload variant images',
      );
    }
  };

  // Drag and Drop Images
  const handleDragStart = (variantIndex, imageIndex) => {
    setDraggedImage({
      variantIndex,
      imageIndex,
    });
  };

  const handleDrop = (variantIndex, targetIndex) => {
    if (!draggedImage) return;

    if (draggedImage.variantIndex !== variantIndex) {
      return;
    }

    const updatedVariants = [...variants];

    const updatedImages = [...updatedVariants[variantIndex].images];

    const [movedImage] = updatedImages.splice(draggedImage.imageIndex, 1);

    updatedImages.splice(targetIndex, 0, movedImage);

    updatedVariants[variantIndex] = {
      ...updatedVariants[variantIndex],
      images: updatedImages,
    };

    setVariants(updatedVariants);

    setDraggedImage(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  // REMOVE VARIANT IMAGE
  const removeVariantImageHandler = async (variantIndex, imageUrl) => {
    try {
      await deleteProductImage(imageUrl).unwrap();

      const updatedVariants = [...variants];

      updatedVariants[variantIndex] = {
        ...updatedVariants[variantIndex],
        images: updatedVariants[variantIndex].images.filter(
          (img) => img !== imageUrl,
        ),
      };

      setVariants(updatedVariants);

      toast.success('Image Removed');
    } catch (err) {
      toast.error(err?.data?.message || err.error || 'Unable to remove image');
    }
  };

  return (
    <>
      <hr className='my-4' />

      <div className='d-flex justify-content-between align-items-center mb-3'>
        <h5 className='admin-section-title mb-0'>Product Variants</h5>

        <Button
          type='button'
          className='admin-add-btn'
          onClick={addVariantHandler}
        >
          + Add Variant
        </Button>
      </div>

      {variants.map((variant, index) => (
        <Card key={index} className='variant-card mb-4'>
          <Card.Body>
            <div className='d-flex justify-content-between align-items-center mb-3'>
              <h6 className='mb-0'>Variant #{index + 1}</h6>

              <Button
                type='button'
                size='sm'
                className='admin-delete-soft-btn'
                onClick={() => removeVariantHandler(index)}
              >
                Remove
              </Button>
            </div>

            <Row>
              <Col md={6}>
                <Form.Group className='mb-3'>
                  <Form.Label>Color</Form.Label>

                  <Form.Control
                    type='text'
                    placeholder='Eg. Black'
                    value={variant.color}
                    onChange={(e) =>
                      updateVariantField(index, 'color', e.target.value)
                    }
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className='mb-3'>
                  <Form.Label>Price</Form.Label>

                  <Form.Control
                    type='text'
                    placeholder='Enter Price'
                    value={variant.price}
                    onChange={(e) =>
                      updateVariantField(index, 'price', e.target.value)
                    }
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className='mb-3'>
                  <Form.Label>Stock</Form.Label>

                  <Form.Control
                    type='number'
                    placeholder='Enter Stock'
                    value={variant.countInStock}
                    onChange={(e) =>
                      updateVariantField(
                        index,
                        'countInStock',
                        Number(e.target.value),
                      )
                    }
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group>
              <Form.Label>Variant Images</Form.Label>

              <Form.Control
                type='file'
                multiple
                onChange={(e) => uploadVariantImagesHandler(e, index)}
              />
            </Form.Group>

            {variant.images?.length > 0 && (
              <div className='variant-image-preview'>
                {variant.images.map((img, i) => (
                  <div
                    key={i}
                    className='variant-preview-wrapper'
                    draggable
                    onDragStart={() => handleDragStart(index, i)}
                    onDragOver={handleDragOver}
                    onDrop={() => handleDrop(index, i)}
                  >
                    <img
                      src={getCloudinaryImage(
                        img,
                        'w_120,h_120,c_fill,f_auto,q_auto',
                      )}
                      alt='variant'
                      className='variant-preview-img'
                    />

                    <button
                      type='button'
                      className='remove-image-btn'
                      onClick={() => {
                        removeVariantImageHandler(index, img);
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </Card.Body>
        </Card>
      ))}
    </>
  );
};

export default AdminVariantManager;
