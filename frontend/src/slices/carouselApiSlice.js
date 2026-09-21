import { apiSlice } from './apiSlice.js';

const CAROUSEL_URL = '/api/carousel';

export const carouselApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getCarousel: builder.query({
      query: () => ({
        url: CAROUSEL_URL,
      }),
      providesTags: ['Carousel'],
      keepUnusedDataFor: 5,
    }),

    addCarouselItem: builder.mutation({
      query: (data) => ({
        url: `${CAROUSEL_URL}/items`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Carousel'],
    }),

    removeCarouselItem: builder.mutation({
      query: (data) => ({
        url: `${CAROUSEL_URL}/items`,
        method: 'DELETE',
        body: data,
      }),
      invalidatesTags: ['Carousel'],
    }),

    updateCarousel: builder.mutation({
      query: (data) => ({
        url: CAROUSEL_URL,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Carousel'],
    }),
  }),
});

export const {
  useGetCarouselQuery,
  useAddCarouselItemMutation,
  useRemoveCarouselItemMutation,
  useUpdateCarouselMutation,
} = carouselApiSlice;
