import { PRODUCTS_URL, UPLOAD_URL } from '../constants.js';
import { apiSlice } from './apiSlice.js';

export const productsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getProducts: builder.query({
      query: ({
        admin,
        home,
        keyword,
        adminSearch,
        adminStock,
        adminPriceGte,
        adminPriceLte,
        adminCategories,
        adminVisibility,
        pageNumber,
        category,
        isFeatured,
        isNewArrival,
        isBestSeller,
        sort,
        availability,
        priceGte,
        priceLte,
        productTypes,
      }) => {
        const params = new URLSearchParams();

        if (admin) {
          params.set('admin', 'true');
        }

        if (home) {
          params.set('home', 'true');
        }

        if (keyword) {
          params.set('keyword', keyword);
        }

        if (adminSearch) {
          params.set('adminSearch', adminSearch);
        }

        if (adminStock) {
          params.set('adminStock', adminStock);
        }

        if (adminPriceGte) {
          params.set('adminPriceGte', adminPriceGte);
        }

        if (adminPriceLte) {
          params.set('adminPriceLte', adminPriceLte);
        }

        adminCategories?.forEach((category) => {
          params.append('adminCategory', category);
        });

        adminVisibility?.forEach((visibility) => {
          params.append('adminVisibility', visibility);
        });

        if (pageNumber) {
          params.set('pageNumber', pageNumber);
        }

        if (category) {
          params.set('category', category);
        }

        if (isFeatured) {
          params.set('isFeatured', isFeatured);
        }

        if (isNewArrival) {
          params.set('isNewArrival', isNewArrival);
        }

        if (isBestSeller) {
          params.set('isBestSeller', isBestSeller);
        }

        if (sort) {
          params.set('sort', sort);
        }

        if (availability) {
          params.set('filter.v.availability', availability);
        }

        if (priceGte) {
          params.set('filter.v.price.gte', priceGte);
        }

        if (priceLte) {
          params.set('filter.v.price.lte', priceLte);
        }

        productTypes?.forEach((productType) => {
          params.append('filter.p.product_type', productType);
        });

        return {
          url: PRODUCTS_URL,
          params,
        };
      },
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
    uploadProductVideo: builder.mutation({
      query: (data) => ({
        url: `${UPLOAD_URL}/video`,
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
    deleteProductVideo: builder.mutation({
      query: (publicId) => ({
        url: `${UPLOAD_URL}/video`,
        method: 'DELETE',
        body: { publicId },
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
    getCategoryCounts: builder.query({
      query: ({
        keyword,
        category,
        isFeatured,
        isNewArrival,
        isBestSeller,
        availability,
        priceGte,
        priceLte,
      }) => ({
        url: `${PRODUCTS_URL}/category-counts`,
        params: {
          keyword,
          category,
          isFeatured,
          isNewArrival,
          isBestSeller,
          availability,
          priceGte,
          priceLte,
        },
      }),
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
  useUploadProductVideoMutation,
  useDeleteProductImageMutation,
  useDeleteProductVideoMutation,
  useDeleteProductMutation,
  useCreateReviewMutation,
  useGetTopProductsQuery,
  useGetCategoriesQuery,
  useGetCategoryCountsQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} = productsApiSlice;
