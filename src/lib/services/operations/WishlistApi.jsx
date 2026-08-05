import { homeEndPoints } from "@/lib/api";
import { apiConnector } from "../apiConnector";

const { GET_WISHLIST_API, REMOVE_FROM_WISHLIST_API } = homeEndPoints;

export const getWishlistById = async (body, accessToken) => {
  try {
    const { data: apiResponse } = await apiConnector(
      "POST",
      GET_WISHLIST_API,
      body,
      {
        Authorization: `Bearer ${accessToken}`,
      }
    );

    if (!apiResponse?.success) {
      throw new Error(apiResponse?.message || "Failed to fetch wishlist");
    }

    console.log("Wishlist API response:", apiResponse);

    return apiResponse.data || null;
  } catch (error) {
    console.error("Error fetching wishlist:", error);
    return null;
  }
};

export const removeWishlistById = async (body, accessToken) => {
  try {
    const { data: apiResponse } = await apiConnector(
      "POST",
      REMOVE_FROM_WISHLIST_API,
      body,
      {
        Authorization: `Bearer ${accessToken}`,
      }
    );

    if (!apiResponse?.success) {
      throw new Error(apiResponse?.message || "Failed to remove from wishlist");
    }

    console.log("Wishlist API response:", apiResponse);

    return apiResponse.data || null;
  } catch (error) {
    console.error("Error removing from wishlist:", error);
    return null;
  }
};
