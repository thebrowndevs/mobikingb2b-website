import { quotationEndpoints } from "@/lib/api";
import { apiConnector } from "../apiConnector";
import { toast } from "sonner";

const {
  RAISE_QUOTATION_API,
  GET_MY_QUOTATIONS_API,
  GET_ALL_QUOTATIONS_API,
  UPDATE_QUOTATION_STATUS_API,
  BOOK_QUOTATION_API
} = quotationEndpoints;

export const createQuotationApi = async (payload, accessToken) => {
  const toastId = toast.loading("Submitting B2B quotation request...");
  try {
    const { data: apiResponse } = await apiConnector(
      "POST",
      RAISE_QUOTATION_API,
      payload,
      {
        Authorization: `Bearer ${accessToken}`,
      }
    );
    if (!apiResponse?.success) {
      throw new Error(apiResponse?.message || "Failed to raise quotation");
    }
    toast.success("Quotation raised successfully!", { id: toastId });
    return { success: true, data: apiResponse.data };
  } catch (error) {
    console.error("Error in createQuotationApi:", error);
    const errMsg = error.response?.data?.message || error.message || "Failed to raise quotation";
    toast.error(errMsg, { id: toastId });
    return { success: false, error: errMsg };
  }
};

export const getMyQuotationsApi = async (accessToken) => {
  try {
    const { data: apiResponse } = await apiConnector(
      "GET",
      GET_MY_QUOTATIONS_API,
      null,
      {
        Authorization: `Bearer ${accessToken}`,
      }
    );
    if (!apiResponse?.success) {
      throw new Error(apiResponse?.message || "Failed to retrieve quotations");
    }
    return apiResponse.data;
  } catch (error) {
    console.error("Error in getMyQuotationsApi:", error);
    throw error;
  }
};
