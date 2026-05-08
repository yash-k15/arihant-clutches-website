import { apiSlice } from './apiSlice';
import { PAYMENT_URL } from '../constants';

export const paymentApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // CREATE RAZORPAY ORDER
    createRazorpayOrder: builder.mutation({
      query: (amount) => ({
        url: `${PAYMENT_URL}/create-order`,
        method: 'POST',

        body: {
          amount,
        },
      }),
    }),

    // VERIFY PAYMENT
    verifyPayment: builder.mutation({
      query: (data) => ({
        url: `${PAYMENT_URL}/verify-payment`,
        method: 'POST',
        body: data,
      }),
    }),
  }),
});

export const { useCreateRazorpayOrderMutation, useVerifyPaymentMutation } =
  paymentApiSlice;
