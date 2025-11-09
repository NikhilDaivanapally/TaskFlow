import type { User } from "@/types";
import { apiSlice } from "./apiSlice";

export const userApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get current user profile
    getProfile: builder.query({
      query: () => "/user/profile",
      transformResponse: (response: {
        statusCode: number;
        data: { user: User };
        message: string;
      }) => response.data,
    }),

    // Update profile info
    updateProfile: builder.mutation({
      query: (data) => ({
        url: "/user/profile",
        method: "PATCH",
        body: data,
      }),
      //   invalidatesTags: ["User"],
    }),

    // Update password
    updatePassword: builder.mutation({
      query: (data) => ({
        url: "/user/password",
        method: "PATCH",
        body: data,
      }),
    }),

    // Delete account (optional)
    deleteAccount: builder.mutation({
      query: () => ({
        url: "/user/delete",
        method: "DELETE",
      }),
      //   invalidatesTags: ["User"],
    }),
  }),

  overrideExisting: false,
});

export const {
  useGetProfileQuery,
  useUpdateProfileMutation,
  useUpdatePasswordMutation,
  useDeleteAccountMutation,
} = userApi;
