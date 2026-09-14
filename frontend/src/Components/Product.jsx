import { useState } from 'react';
import { Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { BsHeart, BsHeartFill } from 'react-icons/bs';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import Rating from './Rating';
import { getCloudinaryImage } from '../utils/cloudinary';
import {
  useGetWishlistQuery,
  useAddToWishlistMutation,
  useRemoveFromWishlistMutation,
} from '../slices/wishlistApiSlice.js';
import {
  addGuestWishlistItem,
  removeGuestWishlistItem,
  isGuestWishlistItem,
} from '../utils/wishlistUtils.js';
import { useAuthModal } from './AuthModalContext.jsx';
import '../assets/styles/components/Product.css';

const Product = ({ product }) => {
  const [selectedVariant, setSelectedVariant] = useState(product.variants[0]);

  const { userInfo } = useSelector((state) => state.auth);

  const { data: wishlist } = useGetWishlistQuery(undefined, {
    skip: !userInfo || userInfo.isAdmin,
  });

  const [addToWishlist, { isLoading: isAddingToWishlist }] =
    useAddToWishlistMutation();

  const [removeFromWishlist, { isLoading: isRemovingFromWishlist }] =
    useRemoveFromWishlistMutation();

  const { openAuth } = useAuthModal();

  const [guestWishlistVersion, setGuestWishlistVersion] = useState(0);

  const selectVariantHandler = (variant) => {
    setSelectedVariant(variant);
  };

  const isWishlisted = selectedVariant?._id
    ? userInfo?.isAdmin
      ? false
      : userInfo
        ? wishlist?.items?.some(
            (item) =>
              String(item.product) === String(product._id) &&
              String(item.variant) === String(selectedVariant._id),
          )
        : isGuestWishlistItem(product._id, selectedVariant._id)
    : false;

  const wishlistLoading = isAddingToWishlist || isRemovingFromWishlist;

  const wishlistHandler = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!selectedVariant?._id) {
      return;
    }

    // Admins do not have wishlist functionality
    if (userInfo?.isAdmin) {
      return;
    }

    const productId = product._id;
    const variantId = selectedVariant._id;

    // Guest wishlist
    if (!userInfo) {
      if (isGuestWishlistItem(productId, variantId)) {
        removeGuestWishlistItem(productId, variantId);
        toast.success('Removed from wishlist');
      } else {
        addGuestWishlistItem(productId, variantId);
        toast.success('Added to wishlist');
      }

      setGuestWishlistVersion((version) => version + 1);
      return;
    }

    // Customer wishlist
    try {
      if (isWishlisted) {
        await removeFromWishlist({
          productId,
          variantId,
        }).unwrap();

        toast.success('Removed from wishlist');
      } else {
        await addToWishlist({
          productId,
          variantId,
        }).unwrap();

        toast.success('Added to wishlist');
      }
    } catch (error) {
      toast.error(error?.data?.message || 'Unable to update wishlist');
    }
  };

  return (
    <Card className='product-card h-100'>
      {/* Product Image */}
      <div className='product-image-wrapper'>
        <button
          type='button'
          className={`product-wishlist-button ${isWishlisted ? 'active' : ''}`}
          onClick={wishlistHandler}
          disabled={wishlistLoading}
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          {isWishlisted ? <BsHeartFill /> : <BsHeart />}
        </button>
        <Link
          to={`/products/${product.slug}`}
          state={{ variantId: selectedVariant?._id }}
          className='product-image-link'
        >
          <Card.Img
            src={getCloudinaryImage(
              selectedVariant?.images?.[0],
              'w_600,h_750,c_fill,f_auto,q_auto',
            )}
            alt={product.name}
            className='product-image'
          />
        </Link>

        {/* Product Badges */}
        {(product.isNewArrival || product.isBestSeller) && (
          <div className='product-badges'>
            {product.isNewArrival && <span className='badge-new'>New</span>}

            {product.isBestSeller && (
              <span className='badge-best'>Bestseller</span>
            )}
          </div>
        )}
      </div>

      <Card.Body className='product-card-body'>
        {/* Variant Thumbnails */}
        {product.variants?.length > 0 && (
          <div className='product-variants'>
            {product.variants.map((variant) => (
              <button
                key={variant._id}
                type='button'
                className={`product-variant ${
                  selectedVariant?._id === variant._id ? 'active' : ''
                }`}
                onClick={() => selectVariantHandler(variant)}
                aria-label={`Select ${variant.color} variant`}
                title={variant.color}
              >
                {variant.images?.[0] ? (
                  <img
                    src={getCloudinaryImage(
                      variant.images[0],
                      'w_100,h_125,c_fill,f_auto,q_auto',
                    )}
                    alt={variant.color}
                  />
                ) : (
                  <span>{variant.color}</span>
                )}
              </button>
            ))}
          </div>
        )}

        {/* Product Information */}
        <Link
          to={`/products/${product.slug}`}
          state={{ variantId: selectedVariant?._id }}
          className='product-info-link'
        >
          <Card.Title as='h2' className='product-title'>
            {product.name}
          </Card.Title>
        </Link>

        <div className='product-price'>
          ₹{Number(selectedVariant?.price || 0).toLocaleString('en-IN')}
        </div>

        <div className='product-rating'>
          <Rating value={product.rating} />
        </div>

        <div className='product-reviews'>
          {product.numReviews} review
          {product.numReviews !== 1 ? 's' : ''}
        </div>
      </Card.Body>
    </Card>
  );
};

export default Product;
