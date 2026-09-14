const WISHLIST_STORAGE_KEY = 'wishlist';

export const getGuestWishlist = () => {
  try {
    const wishlist = localStorage.getItem(WISHLIST_STORAGE_KEY);

    return wishlist ? JSON.parse(wishlist) : [];
  } catch (error) {
    console.error('Failed to read guest wishlist:', error);
    return [];
  }
};

export const saveGuestWishlist = (wishlist) => {
  localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlist));
};

export const clearGuestWishlist = () => {
  localStorage.removeItem(WISHLIST_STORAGE_KEY);
};

export const addGuestWishlistItem = (productId, variantId) => {
  const wishlist = getGuestWishlist();

  const exists = wishlist.some(
    (item) => item.productId === productId && item.variantId === variantId,
  );

  if (!exists) {
    wishlist.push({
      productId,
      variantId,
    });

    saveGuestWishlist(wishlist);
  }

  return wishlist;
};

export const removeGuestWishlistItem = (productId, variantId) => {
  const wishlist = getGuestWishlist();

  const updatedWishlist = wishlist.filter(
    (item) => !(item.productId === productId && item.variantId === variantId),
  );

  saveGuestWishlist(updatedWishlist);

  return updatedWishlist;
};

export const isGuestWishlistItem = (productId, variantId) => {
  const wishlist = getGuestWishlist();

  return wishlist.some(
    (item) => item.productId === productId && item.variantId === variantId,
  );
};
