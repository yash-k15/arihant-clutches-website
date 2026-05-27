import { Card, Row, Col, Form, Button } from 'react-bootstrap';

const AdminVariantManager = ({
  variants,
  setVariants,
  uploadProductImage,
  toast,
  productName,
}) => {
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

    updatedVariants[index][field] = value;

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

      updatedVariants[index].images = res.images;

      setVariants(updatedVariants);

      toast.success('Variant images uploaded');
    } catch (err) {
      toast.error(err?.data?.message || err.error);
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
                  <img
                    key={i}
                    src={img}
                    alt='variant'
                    className='variant-preview-img'
                  />
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
