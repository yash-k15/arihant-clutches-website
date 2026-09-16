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
      query: () => ({
        url: USERS_URL,
      }),
      providesTags: ['Users'],
      keepUnusedDataFor: 5,
    }),
    deleteUser: builder.mutation({
      query: (userId) => ({
        url: `${USERS_URL}/${userId}`,
        method: 'DELETE',
      }),
    }),
    getUserDetails: builder.query({
      query: (userId) => ({
        url: `${USERS_URL}/${userId}`,
      }),
      keepUnusedDataFor: 5,
    }),
    updateUser: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}/${data.userId}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Users'],
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

    sendPasswordChangeOtp: builder.mutation({
      query: () => ({
        url: `${USERS_URL}/send-password-change-otp`,
        method: 'POST',
      }),
    }),

    verifyPasswordChangeOtp: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}/verify-password-change-otp`,
        method: 'POST',
        body: data,
      }),
    }),

    changePassword: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}/change-password`,
        method: 'PUT',
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

    verifyPhoneChangeOtp: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}/verify-phone-change-otp`,
        method: 'POST',
        body: data,
      }),
    }),

    registerPhone: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}/register-phone`,
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
  useSendPasswordChangeOtpMutation,
  useVerifyPasswordChangeOtpMutation,
  useChangePasswordMutation,
  useVerifyOtpMutation,
  useVerifyPhoneChangeOtpMutation,
  useRegisterPhoneMutation,
  useGetUserAddressesQuery,
  useAddUserAddressMutation,
  useUpdateUserAddressMutation,
  useDeleteUserAddressMutation,
  useSetDefaultUserAddressMutation,
} = usersApiSlice;
