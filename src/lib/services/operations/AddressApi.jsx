import { homeEndPoints } from "@/lib/api";
import { apiConnector } from "../apiConnector";

// Assuming homeEndpoints are defined in your apis.js file
const {
  GET_ADDRESSES_API,
  ADD_ADDRESS_API,
  UPDATE_ADDRESS_API,
  DELETE_ADDRESS_API,
} = homeEndPoints;

/**
 * Fetches all addresses for the logged-in user.
 */
export const getAddressesApi = async (accessToken) => {
  try {
    const { data: apiResponse } = await apiConnector(
      "GET",
      GET_ADDRESSES_API,
      null,
      { Authorization: `Bearer ${accessToken}` }
    );
    if (!apiResponse?.success) {
      throw new Error(apiResponse?.message || "Failed to fetch addresses");
    }
    return apiResponse.data || [];
  } catch (error) {
    console.error("Error fetching addresses:", error);
    throw error;
  }
};

/**
 * Adds a new address for the logged-in user.
 */
export const addAddressApi = async (body, accessToken) => {
  try {
    const { data: apiResponse } = await apiConnector(
      "POST",
      ADD_ADDRESS_API,
      body,
      { Authorization: `Bearer ${accessToken}` }
    );
    if (!apiResponse?.success) {
      throw new Error(apiResponse?.message || "Failed to add address");
    }
    return apiResponse.data;
  } catch (error) {
    console.error("Error adding address:", error);
    throw error;
  }
};

/**
 * Updates an existing address using its ID.
 */
export const updateAddressApi = async (payload, accessToken) => {
  try {
    const { addressId } = payload;
    const { data: apiResponse } = await apiConnector(
      "PUT",
      `${UPDATE_ADDRESS_API}/${addressId}`,
      payload, // Send the updated data in the body
      { Authorization: `Bearer ${accessToken}` }
    );
    if (!apiResponse?.success) {
      throw new Error(apiResponse?.message || "Failed to update address");
    }
    return apiResponse.data;
  } catch (error) {
    console.error("Error updating address:", error);
    throw error;
  }
};

/**
 * Deletes an address by its ID.
 */
export const deleteAddressApi = async (addressId, accessToken) => {
  try {
    const { data: apiResponse } = await apiConnector(
      "DELETE", // Using POST as specified
      `${DELETE_ADDRESS_API}/${addressId}`,
      null,
      {
        Authorization: `Bearer ${accessToken}`,
      }
    );

    if (!apiResponse?.success) {
      throw new Error(apiResponse?.message || "Failed to delete address");
    }

    console.log("Delete address API response:", apiResponse);

    // This API should return the updated user object with the address removed
    return apiResponse.data;
  } catch (error) {
    console.error("Error deleting address:", error);
    // Re-throw the error so the component can catch it and show a toast
    throw error;
  }
};
