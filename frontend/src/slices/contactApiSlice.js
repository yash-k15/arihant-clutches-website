import { apiSlice } from './apiSlice.js';

export const contactApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    sendContactMessage: builder.mutation({
      query: (data) => ({
        url: '/api/contact',
        method: 'POST',
        body: data,
      }),
    }),
  }),
});

export const { useSendContactMessageMutation } = contactApiSlice;
