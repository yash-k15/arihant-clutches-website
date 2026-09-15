import { apiSlice } from './apiSlice.js';
import {
  WISHLIST_URL,
  GUEST_WISHLIST_URL,
  GUEST_WISHLIST_SHARE_URL,
} from '../constants.js';

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

    createGuestWishlistShare: builder.mutation({
      query: (items) => ({
        url: GUEST_WISHLIST_SHARE_URL,
        method: 'POST',
        body: { items },
      }),
    }),

    mergeWishlist: builder.mutation({
      query: (items) => ({
        url: `${WISHLIST_URL}/merge`,
        method: 'POST',
        body: {
          items,
        },
      }),
      invalidatesTags: ['Wishlist'],
    }),

    getSharedWishlist: builder.query({
      query: (shareToken) => ({
        url: `${WISHLIST_URL}/shared/${shareToken}`,
      }),
      providesTags: ['SharedWishlist'],
      keepUnusedDataFor: 5,
    }),

    getGuestWishlistProducts: builder.mutation({
      query: (productIds) => ({
        url: GUEST_WISHLIST_URL,
        method: 'POST',
        body: { productIds },
      }),
    }),
  }),
});

export const {
  useGetWishlistQuery,
  useAddToWishlistMutation,
  useRemoveFromWishlistMutation,
  useClearWishlistMutation,
  useCreateWishlistShareMutation,
  useCreateGuestWishlistShareMutation,
  useMergeWishlistMutation,
  useGetSharedWishlistQuery,
  useGetGuestWishlistProductsMutation,
} = wishlistApiSlice;
