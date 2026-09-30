import { USERS_URL, USER_ADDRESSES_URL } from '../constants.js';
import { apiSlice } from './apiSlice.js';

export const usersApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}/login`,
        method: 'POST',
        body: data,
      }),
    }),
    register: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}`,
        method: 'POST',
        body: data,
      }),
    }),
    logout: builder.mutation({
      query: () => ({
        url: `${USERS_URL}/logout`,
        method: 'POST',
      }),
    }),
    profile: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}/profile`,
        method: 'PUT',
        body: data,
      }),
    }),
    getUsers: builder.query({
      query: ({ keyword, pageNumber, role, sort } = {}) => {
        const params = new URLSearchParams();

        if (keyword) params.set('keyword', keyword);
        if (pageNumber) params.set('pageNumber', pageNumber);
        if (role) params.set('role', role);
        if (sort) params.set('sort', sort);

        return {
          url: USERS_URL,
          params,
        };
      },
      providesTags: ['User'],
      keepUnusedDataFor: 5,
    }),
    deleteUser: builder.mutation({
      query: (userId) => ({
        url: `${USERS_URL}/${userId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['User'],
    }),
    getUserDetails: builder.query({
      query: (userId) => ({
        url: `${USERS_URL}/${userId}`,
      }),
      providesTags: ['User'],
      keepUnusedDataFor: 5,
    }),
    updateUser: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}/${data.userId}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['User'],
    }),
    forgotPassword: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}/forgotpassword`,
        method: 'POST',
        body: data,
      }),
    }),
    resetPassword: builder.mutation({
      query: ({ token, password }) => ({
        url: `${USERS_URL}/resetpassword/${token}`,
        method: 'PUT',
        body: { password },
      }),
    }),
    sendOtp: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}/send-otp`,
        method: 'POST',
        body: data,
      }),
    }),

    verifyOtp: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}/verify-otp`,
        method: 'POST',
        body: data,
      }),
    }),

    getUserAddresses: builder.query({
      query: () => ({
        url: USER_ADDRESSES_URL,
      }),
      providesTags: ['User'],
    }),

    addUserAddress: builder.mutation({
      query: (address) => ({
        url: USER_ADDRESSES_URL,
        method: 'POST',
        body: address,
      }),
      invalidatesTags: ['User'],
    }),

    updateUserAddress: builder.mutation({
      query: ({ addressId, ...address }) => ({
        url: `${USER_ADDRESSES_URL}/${addressId}`,
        method: 'PUT',
        body: address,
      }),
      invalidatesTags: ['User'],
    }),

    deleteUserAddress: builder.mutation({
      query: (addressId) => ({
        url: `${USER_ADDRESSES_URL}/${addressId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['User'],
    }),

    setDefaultUserAddress: builder.mutation({
      query: (addressId) => ({
        url: `${USER_ADDRESSES_URL}/${addressId}/default`,
        method: 'PUT',
      }),
      invalidatesTags: ['User'],
    }),
  }),
});

export const {
  useLoginMutation,
  useLogoutMutation,
  useRegisterMutation,
  useProfileMutation,
  useGetUsersQuery,
  useDeleteUserMutation,
  useGetUserDetailsQuery,
  useUpdateUserMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useSendOtpMutation,
  useVerifyOtpMutation,
  useGetUserAddressesQuery,
  useAddUserAddressMutation,
  useUpdateUserAddressMutation,
  useDeleteUserAddressMutation,
  useSetDefaultUserAddressMutation,
} = usersApiSlice;
