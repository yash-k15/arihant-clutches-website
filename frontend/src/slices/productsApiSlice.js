import { PRODUCTS_URL, UPLOAD_URL } from '../constants.js';
import { apiSlice } from './apiSlice.js';

export const productsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getProducts: builder.query({
      query: ({
        keyword,
        pageNumber,
        category,
        isFeatured,
        isNewArrival,
        isBestSeller,
        sort,
      }) => ({
        url: PRODUCTS_URL,
        params: {
          keyword,
          pageNumber,
          category,
          isFeatured,
          isNewArrival,
          isBestSeller,
          sort,
        },
      }),
      providesTags: ['Products'],
      keepUnusedDataFor: 5,
    }),
    getProductDetails: builder.query({
      query: (slug) => ({
        url: `${PRODUCTS_URL}/${slug}`,
      }),
      keepUnusedDataFor: 5,
    }),
    createProduct: builder.mutation({
      query: (data) => ({
        url: PRODUCTS_URL,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Product'],
    }),
    updateProduct: builder.mutation({
      query: (data) => ({
        url: `${PRODUCTS_URL}/${data.productId}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Products'],
    }),
    uploadProductImage: builder.mutation({
      query: (data) => ({
        url: `${UPLOAD_URL}`,
        method: 'POST',
        body: data,
      }),
    }),
    deleteProductImage: builder.mutation({
      query: (imageUrl) => ({
        url: '/api/upload',
        method: 'DELETE',
        body: { imageUrl },
      }),
    }),
    deleteProduct: builder.mutation({
      query: (productSlug) => ({
        url: `${PRODUCTS_URL}/${productSlug}`,
        method: 'DELETE',
      }),
    }),
    createReview: builder.mutation({
      query: (data) => ({
        url: `${PRODUCTS_URL}/${data.productSlug}/reviews`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Product'],
    }),
    getTopProducts: builder.query({
      query: () => ({
        url: `${PRODUCTS_URL}/top`,
      }),
      keepUnusedDataFor: 5,
    }),
    getCategories: builder.query({
      query: () => ({
        url: `${PRODUCTS_URL}/categories`,
      }),
      providesTags: ['Categories'],
      keepUnusedDataFor: 5,
    }),

    createCategory: builder.mutation({
      query: (data) => ({
        url: `${PRODUCTS_URL}/categories`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Categories'],
    }),

    updateCategory: builder.mutation({
      query: (data) => ({
        url: `${PRODUCTS_URL}/categories/${data.categoryId}`,
        method: 'PUT',
        body: {
          name: data.name,
        },
      }),
      invalidatesTags: ['Categories', 'Products'],
    }),

    deleteCategory: builder.mutation({
      query: (categoryId) => ({
        url: `${PRODUCTS_URL}/categories/${categoryId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Categories', 'Products'],
    }),
  }),
});

export const {
  useGetProductsQuery,
  useGetProductDetailsQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useUploadProductImageMutation,
  useDeleteProductImageMutation,
  useDeleteProductMutation,
  useCreateReviewMutation,
  useGetTopProductsQuery,
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} = productsApiSlice;
