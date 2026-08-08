import { homeEndPoints } from "@/lib/api";
import { apiConnector } from "../apiConnector";
import { toast } from "sonner";

const { GET_MY_CART_API, ADD_TO_CART_API, ADD_TO_CART_BULK_API, REMOVE_FROM_CART_API } = homeEndPoints;

export const getMyCart = async (accessToken) => {
  try {
    const { data: apiResponse } = await apiConnector(
      "GET",
      GET_MY_CART_API,
      null,
      {
        Authorization: `Bearer ${accessToken}`,
      }
    );

    if (!apiResponse?.success) {
      throw new Error(
        apiResponse?.message || "Failed to fetch cart"
      );
    }

    // console.log("Fetch cart API response:", apiResponse);

    return apiResponse.data || null;
  } catch (error) {
    console.error("Error fetching cart:", error);
    return null;
  }
};

export const addCartById = async (body, accessToken) => {
  try {
    const { data: apiResponse } = await apiConnector(
      "POST",
      ADD_TO_CART_API,
      body,
      {
        Authorization: `Bearer ${accessToken}`,
      }
    );

    if (!apiResponse?.success) {
      throw new Error(apiResponse?.message || "Failed to add product to cart");
    }

    // console.log("Add to cart API response:", apiResponse);
    // toast.success(apiResponse?.message);

    return apiResponse.data || null;

  } catch (error) {
    toast.error(error.response?.data?.message || error.message);
    console.error("Error adding product to cart:", error);
    return null;
  }
};

export const removeFromCartById = async (body, accessToken) => {
  try {
    const { data: apiResponse } = await apiConnector(
      "DELETE",
      REMOVE_FROM_CART_API,
      body,
      {
        Authorization: `Bearer ${accessToken}`,
      }
    );

    if (!apiResponse?.success) {
      throw new Error(
        apiResponse?.message || "Failed to remove product to cart"
      );
    }

    // console.log("remove from cart API response:", apiResponse);

    return apiResponse.data || null;
  } catch (error) {
    console.error("Error adding product to cart:", error);
    return null;
  }
};

export const addCartBulk = async (body, accessToken) => {
  try {
    const { data: apiResponse } = await apiConnector(
      "POST",
      ADD_TO_CART_BULK_API,
      body,
      {
        Authorization: `Bearer ${accessToken}`,
      }
    );

    if (!apiResponse?.success) {
      throw new Error(
        apiResponse?.message || "Failed to add products to cart"
      );
    }

    return apiResponse.data || null;
  } catch (error) {
    toast.error(error.response?.data?.message || error.message);
    console.error("Error adding bulk products to cart:", error);
    return null;
  }
};

