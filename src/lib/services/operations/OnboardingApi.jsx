import { onboardingEndpoints } from "@/lib/api";
import { apiConnector } from "../apiConnector";
import { toast } from "sonner";

const {
  ONBOARDING_STATUS_API,
  ONBOARDING_CHECK_DUPLICATE,
  ONBOARDING_GST_VERIFY,
  ONBOARDING_SAVE_BUSINESS,
  ONBOARDING_UPDATE_GST,
} = onboardingEndpoints;

export const getOnboardingStatusApi = async (accessToken) => {
  try {
    const { data: apiResponse } = await apiConnector(
      "GET",
      ONBOARDING_STATUS_API,
      null,
      { Authorization: `Bearer ${accessToken}` }
    );
    if (!apiResponse?.success) {
      throw new Error(apiResponse?.message || "Failed to fetch onboarding status");
    }
    return apiResponse.data;
  } catch (error) {
    console.error("Error in getOnboardingStatusApi:", error);
    throw error;
  }
};

export const checkDuplicateApi = async (params, accessToken) => {
  try {
    const { data: apiResponse } = await apiConnector(
      "GET",
      ONBOARDING_CHECK_DUPLICATE,
      null,
      { Authorization: `Bearer ${accessToken}` },
      params
    );
    return apiResponse?.data || { exists: false };
  } catch (error) {
    console.error("Error in checkDuplicateApi:", error);
    return { exists: false };
  }
};

export const verifyGstApi = async (gstin, accessToken) => {
  const toastId = toast.loading("Verifying GSTIN with government records...");
  try {
    const { data: apiResponse } = await apiConnector(
      "POST",
      ONBOARDING_GST_VERIFY,
      { gstin },
      { Authorization: `Bearer ${accessToken}` }
    );
    if (!apiResponse?.success) {
      throw new Error(apiResponse?.message || "Failed to verify GSTIN");
    }
    toast.success("GSTIN verified successfully!", { id: toastId });
    return apiResponse.data;
  } catch (error) {
    console.error("Error in verifyGstApi:", error);
    const errMsg = error?.response?.data?.message || error?.message || "GSTIN verification failed";
    toast.error(errMsg, { id: toastId });
    throw error;
  }
};

export const saveBusinessDetailsApi = async (body, accessToken) => {
  const toastId = toast.loading("Saving business details...");
  try {
    const { data: apiResponse } = await apiConnector(
      "POST",
      ONBOARDING_SAVE_BUSINESS,
      body,
      { Authorization: `Bearer ${accessToken}` }
    );
    if (!apiResponse?.success) {
      throw new Error(apiResponse?.message || "Failed to save business details");
    }
    toast.success("Business details saved!", { id: toastId });
    return apiResponse.data;
  } catch (error) {
    console.error("Error in saveBusinessDetailsApi:", error);
    const errMsg = error?.response?.data?.message || error?.message || "Failed to save details";
    toast.error(errMsg, { id: toastId });
    throw error;
  }
};

export const updateGstDetailsApi = async (body, accessToken) => {
  const toastId = toast.loading("Updating GSTIN details...");
  try {
    const { data: apiResponse } = await apiConnector(
      "PUT",
      ONBOARDING_UPDATE_GST,
      body,
      { Authorization: `Bearer ${accessToken}` }
    );
    if (!apiResponse?.success) {
      throw new Error(apiResponse?.message || "Failed to update GSTIN");
    }
    toast.success("GSTIN details updated successfully!", { id: toastId });
    return apiResponse.data;
  } catch (error) {
    console.error("Error in updateGstDetailsApi:", error);
    const errMsg = error?.response?.data?.message || error?.message || "Failed to update GSTIN";
    toast.error(errMsg, { id: toastId });
    throw error;
  }
};
