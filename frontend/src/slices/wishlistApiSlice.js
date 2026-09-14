import { apiSlice } from './apiSlice.js';
import { WISHLIST_URL } from '../constants.js';

export const wishlistApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getWishlist: builder.query({
      query: () => ({
        url: WISHLIST_URL,
      }),
      providesTags: ['Wishlist'],
      keepUnusedDataFor: 5,
    }),

    addToWishlist: builder.mutation({
      query: ({ productId, variantId }) => ({
        url: WISHLIST_URL,
        method: 'POST',
        body: {
          productId,
          variantId,
        },
      }),
      invalidatesTags: ['Wishlist'],
    }),

    removeFromWishlist: builder.mutation({
      query: ({ productId, variantId }) => ({
        url: `${WISHLIST_URL}/${productId}/${variantId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Wishlist'],
    }),

    clearWishlist: builder.mutation({
      query: () => ({
        url: WISHLIST_URL,
        method: 'DELETE',
      }),
      invalidatesTags: ['Wishlist'],
    }),

    createWishlistShare: builder.mutation({
      query: () => ({
        url: `${WISHLIST_URL}/share`,
        method: 'POST',
      }),
    }),

    getSharedWishlist: builder.query({
      query: (shareToken) => ({
        url: `${WISHLIST_URL}/shared/${shareToken}`,
      }),
      providesTags: ['SharedWishlist'],
      keepUnusedDataFor: 5,
    }),

    addToSharedWishlist: builder.mutation({
      query: ({ shareToken, productId, variantId }) => ({
        url: `${WISHLIST_URL}/shared/${shareToken}`,
        method: 'POST',
        body: {
          productId,
          variantId,
        },
      }),
      invalidatesTags: ['SharedWishlist'],
    }),

    removeFromSharedWishlist: builder.mutation({
      query: ({ shareToken, productId, variantId }) => ({
        url: `${WISHLIST_URL}/shared/${shareToken}/${productId}/${variantId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['SharedWishlist'],
    }),

    clearSharedWishlist: builder.mutation({
      query: (shareToken) => ({
        url: `${WISHLIST_URL}/shared/${shareToken}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['SharedWishlist'],
    }),
  }),
});

export const {
  useGetWishlistQuery,
  useAddToWishlistMutation,
  useRemoveFromWishlistMutation,
  useClearWishlistMutation,
  useCreateWishlistShareMutation,
  useGetSharedWishlistQuery,
  useAddToSharedWishlistMutation,
  useRemoveFromSharedWishlistMutation,
  useClearSharedWishlistMutation,
} = wishlistApiSlice;
