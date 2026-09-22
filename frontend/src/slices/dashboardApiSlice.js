import { apiSlice } from './apiSlice.js';

const DASHBOARD_URL = '/api/admin/dashboard';

export const dashboardApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getDashboard: builder.query({
      query: () => ({
        url: DASHBOARD_URL,
      }),
      providesTags: ['Dashboard'],
      keepUnusedDataFor: 5,
    }),

    getDashboardSales: builder.query({
      query: ({ period = '7days', dateFrom, dateTo } = {}) => {
        const params = new URLSearchParams();

        params.set('period', period);

        if (period === 'custom') {
          params.set('dateFrom', dateFrom);
          params.set('dateTo', dateTo);
        }

        return {
          url: '/api/admin/dashboard/sales',
          params,
        };
      },
    }),
  }),
});

export const { useGetDashboardQuery, useGetDashboardSalesQuery } =
  dashboardApiSlice;
