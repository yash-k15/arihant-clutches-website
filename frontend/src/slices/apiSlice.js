import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { BASE_URL } from '../constants.js';

const baseQuery = fetchBaseQuery({
  baseUrl: BASE_URL,
  credentials: 'include',
  prepareHeaders: (headers) => {
    headers.set('Content-Type', 'application/json');
    return headers;
  },
});

export const apiSlice = createApi({
  baseQuery,
  tagTypes: [
    'Product',
    'Order',
    'User',
    'Categories',
    'Wishlist',
    'SharedWishlist',
    'Carousel',
    'Dashboard',
  ],
  endpoints: (builder) => ({}),
});
