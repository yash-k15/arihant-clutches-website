import { apiSlice } from './apiSlice';
import { ORDERS_URL } from '../constants.js';

export const ordersApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createOrder: builder.mutation({
      query: (order) => ({
        url: ORDERS_URL,
        method: 'POST',
        body: { ...order },
      }),
    }),
    getOrderDetails: builder.query({
      query: (orderId) => ({
        url: `${ORDERS_URL}/${orderId}`,
        method: 'GET',
      }),
      keepUnusedDataFor: 5,
    }),
    getMyOrders: builder.query({
      query: () => ({
        url: `${ORDERS_URL}/mine`,
      }),
      keepUnusedDataFor: 5,
    }),
    getOrders: builder.query({
      query: ({
        keyword,
        pageNumber,
        paymentStatus,
        paymentMethod,
        deliveryStatus,
        dateFrom,
        dateTo,
        sort,
      } = {}) => {
        const params = new URLSearchParams();

        if (keyword) {
          params.set('keyword', keyword);
        }

        if (pageNumber) {
          params.set('pageNumber', pageNumber);
        }

        if (paymentStatus) {
          params.set('paymentStatus', paymentStatus);
        }

        if (paymentMethod) {
          params.set('paymentMethod', paymentMethod);
        }

        if (deliveryStatus) {
          params.set('deliveryStatus', deliveryStatus);
        }

        if (dateFrom) {
          params.set('dateFrom', dateFrom);
        }

        if (dateTo) {
          params.set('dateTo', dateTo);
        }

        if (sort) {
          params.set('sort', sort);
        }

        return {
          url: ORDERS_URL,
          params,
        };
      },
      keepUnusedDataFor: 5,
    }),
    payOrder: builder.mutation({
      query: (orderId) => ({
        url: `${ORDERS_URL}/${orderId}/pay`,
        method: 'PUT',
      }),
    }),
    deliverOrder: builder.mutation({
      query: (orderId) => ({
        url: `${ORDERS_URL}/${orderId}/deliver`,
        method: 'PUT',
      }),
      keepUnusedDataFor: 5,
    }),
    checkStock: builder.mutation({
      query: (data) => ({
        url: '/api/orders/checkStock',
        method: 'POST',
        body: data,
      }),
    }),
  }),
});

export const {
  useCreateOrderMutation,
  useGetOrderDetailsQuery,
  useGetMyOrdersQuery,
  useGetOrdersQuery,
  usePayOrderMutation,
  useDeliverOrderMutation,
  useCheckStockMutation,
} = ordersApiSlice;
