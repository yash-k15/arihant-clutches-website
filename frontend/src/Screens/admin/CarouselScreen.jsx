import { useState } from 'react';
import { Button, Modal, Form } from 'react-bootstrap';
import { FaTrash, FaGripVertical } from 'react-icons/fa';
import { toast } from 'sonner';
import Loader from '../../Components/Loader';
import Message from '../../Components/Message';
import {
  useGetCarouselQuery,
  useAddCarouselItemMutation,
  useRemoveCarouselItemMutation,
  useUpdateCarouselMutation,
} from '../../slices/carouselApiSlice.js';
import { useGetProductsQuery } from '../../slices/productsApiSlice';

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';

import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';

import { CSS } from '@dnd-kit/utilities';

import '../../assets/styles/components/CarouselScreen.css';

const SortableCarouselItem = ({ item, variant, onRemove, loadingRemove }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: `${item.product._id}-${item.variantId}`,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className='admin-carousel-item'>
      <div
        className='admin-carousel-drag-handle'
        {...attributes}
        {...listeners}
      >
        <FaGripVertical />
      </div>

      <div className='admin-carousel-item-image-wrapper'>
        <img
          src={variant?.images?.[0]}
          alt={item.product.name}
          className='admin-carousel-item-image'
        />
      </div>

      <div className='admin-carousel-item-info'>
        <h3>{item.product.name}</h3>

        <span>Variant: {variant?.color || 'Unknown'}</span>
      </div>

      <Button
        className='admin-carousel-delete-btn'
        onClick={() => onRemove(item)}
        disabled={loadingRemove}
        aria-label={`Remove ${item.product.name}`}
        title='Remove from carousel'
      >
        <FaTrash />
      </Button>
    </div>
  );
};

const CarouselScreen = () => {
  const { data: carousel, isLoading, error } = useGetCarouselQuery();

  const [addCarouselItem, { isLoading: loadingAdd }] =
    useAddCarouselItemMutation();

  const [removeCarouselItem, { isLoading: loadingRemove }] =
    useRemoveCarouselItemMutation();

  const [updateCarousel] = useUpdateCarouselMutation();

  const [showModal, setShowModal] = useState(false);

  const [productSearch, setProductSearch] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [selectedVariant, setSelectedVariant] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  );

  const { data: productsData, isLoading: productsLoading } =
    useGetProductsQuery({
      admin: true,
      adminSearch: productSearch,
      pageNumber: 1,
    });

  const openModal = () => {
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setProductSearch('');
    setSelectedProduct('');
    setSelectedVariant('');
  };

  const removeItemHandler = async (item) => {
    try {
      await removeCarouselItem({
        product: item.product._id,
        variantId: item.variantId,
      }).unwrap();

      toast.success('Carousel item removed');
    } catch (err) {
      toast.error(
        err?.data?.message || err.error || 'Unable to remove carousel item',
      );
    }
  };

  const addItemHandler = async (e) => {
    e.preventDefault();

    if (!selectedProduct || !selectedVariant) {
      toast.warning('Product and variant are required');
      return;
    }

    try {
      await addCarouselItem({
        product: selectedProduct,
        variantId: selectedVariant,
      }).unwrap();

      toast.success('Added to carousel');
      closeModal();
    } catch (err) {
      toast.error(
        err?.data?.message || err.error || 'Unable to add to carousel',
      );
    }
  };

  if (isLoading) {
    return <Loader />;
  }

  if (error) {
    return (
      <Message variant='danger'>
        {error?.data?.message || 'Unable to load carousel'}
      </Message>
    );
  }

  const handleDragEnd = async (event) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = carousel.items.findIndex(
      (item) => `${item.product._id}-${item.variantId}` === active.id,
    );

    const newIndex = carousel.items.findIndex(
      (item) => `${item.product._id}-${item.variantId}` === over.id,
    );

    if (oldIndex === -1 || newIndex === -1) {
      return;
    }

    const reorderedItems = arrayMove(carousel.items, oldIndex, newIndex);

    try {
      await updateCarousel({
        items: reorderedItems.map((item) => ({
          product: item.product._id,
          variantId: item.variantId,
        })),
      }).unwrap();

      toast.success('Carousel order updated');
    } catch (err) {
      toast.error(
        err?.data?.message || err.error || 'Unable to update carousel order',
      );
    }
  };

  return (
    <div className='admin-carousel-page'>
      <div className='admin-carousel-header'>
        <div>
          <p className='admin-carousel-subtitle'>ADMIN PANEL</p>

          <h1 className='admin-carousel-title'>Carousel</h1>

          <p className='admin-carousel-description'>
            Manage the products and variants displayed in the homepage carousel
          </p>
        </div>

        <Button className='admin-carousel-add-btn' onClick={openModal}>
          + Add to Carousel
        </Button>
      </div>

      <div className='admin-carousel-content'>
        {carousel?.items?.length === 0 ? (
          <div className='admin-carousel-empty'>
            <p>No products have been added to the carousel.</p>

            <Button className='admin-carousel-empty-btn' onClick={openModal}>
              + Add to Carousel
            </Button>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={carousel.items.map(
                (item) => `${item.product._id}-${item.variantId}`,
              )}
              strategy={verticalListSortingStrategy}
            >
              <div className='admin-carousel-list'>
                {carousel.items.map((item) => {
                  const variant = item.product?.variants?.find(
                    (variant) =>
                      variant._id.toString() === item.variantId.toString(),
                  );

                  return (
                    <SortableCarouselItem
                      key={`${item.product._id}-${item.variantId}`}
                      item={item}
                      variant={variant}
                      onRemove={removeItemHandler}
                      loadingRemove={loadingRemove}
                    />
                  );
                })}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>

      <Modal
        show={showModal}
        onHide={closeModal}
        centered
        className='admin-carousel-modal'
      >
        <Modal.Header closeButton>
          <Modal.Title>Add to Carousel</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form onSubmit={addItemHandler}>
            <Form.Group className='admin-carousel-form-group'>
              <Form.Label>Product</Form.Label>

              <Form.Control
                type='text'
                placeholder='Search products...'
                value={productSearch}
                onChange={(e) => {
                  setProductSearch(e.target.value);
                  setSelectedProduct('');
                  setSelectedVariant('');
                }}
              />

              {productSearch.trim() && !selectedProduct && (
                <div className='admin-carousel-product-results'>
                  {productsLoading ? (
                    <Loader />
                  ) : productsData?.products?.length ? (
                    productsData.products.map((product) => (
                      <button
                        type='button'
                        key={product._id}
                        className='admin-carousel-product-option'
                        onClick={() => {
                          setSelectedProduct(product._id);
                          setProductSearch(product.name);
                          setSelectedVariant('');
                        }}
                      >
                        {product.name}
                      </button>
                    ))
                  ) : (
                    <p className='admin-carousel-no-results'>
                      No products found.
                    </p>
                  )}
                </div>
              )}
            </Form.Group>

            <Form.Group className='admin-carousel-form-group'>
              <Form.Label>Variant</Form.Label>

              <Form.Select
                value={selectedVariant}
                onChange={(e) => setSelectedVariant(e.target.value)}
                disabled={!selectedProduct}
              >
                <option value=''>
                  {selectedProduct
                    ? 'Select variant'
                    : 'Select a product first'}
                </option>

                {productsData?.products
                  ?.find((product) => product._id === selectedProduct)
                  ?.variants?.map((variant) => (
                    <option key={variant._id} value={variant._id}>
                      {variant.color}
                    </option>
                  ))}
              </Form.Select>
            </Form.Group>

            <Button
              type='submit'
              className='admin-carousel-submit-btn'
              disabled={loadingAdd}
            >
              Add
            </Button>
          </Form>
        </Modal.Body>

        <Modal.Footer>
          <Button className='admin-carousel-close-btn' onClick={closeModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default CarouselScreen;
