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
  }),
});

export const { useGetDashboardQuery } = dashboardApiSlice;
