import { toast } from "sonner";
import { apiConnector } from "../apiConnector";
import { homeEndPoints, profileEndpoints } from "@/lib/api";

const { SEND_OTP_API, GET_LOGIN_API, GET_SIGNUP_API, REFRESH_TOKEN_API, RESET_PASSWORD_API } = homeEndPoints;
const {
  GET_PROFILE_API,
  UPDATE_PROFILE_API,
  DELETE_PROFILE_API
} = profileEndpoints

export const sendOtp = async (data) => {
  try {
    const response = await apiConnector("POST", SEND_OTP_API, data);

    if (!response?.data?.success) {
      throw new Error(response?.data?.message);
    }

    const { newOtp: otp } = response?.data?.data;
    toast.success("OTP sent successfully");
    // console.log("SEND_OTP_API_RESPONSE...", response?.data);
    return {
      otp
    };
  } catch (error) {
    toast.error("Failed to send OTP");
    console.error("SEND_OTP_API_ERROR...", error);
    return null;
  }
};

export const loginUser = async (data) => {
  try {
    const response = await apiConnector("POST", GET_LOGIN_API, data);

    if (response?.data?.success) {
      const { user, accessToken, refreshToken } = response.data.data;
      return {
        data: {
          user,
          accessToken,
          refreshToken
        },
        message: response?.data?.message
      };
    } else {
      console.warn("Login failed:", response.data?.message);
      return {
        message: response?.data?.message
      };
    }
  } catch (error) {
    console.error("Error during user login:", error);
    return {
      message: error?.response?.data?.message || error?.message
    };
  }
};

export const registerUser = async (data) => {
  try {
    const response = await apiConnector("POST", GET_SIGNUP_API, data);

    if (response?.data?.success) {
      const { user, accessToken, refreshToken } = response.data.data;
      return {
        data: {
          user,
          accessToken,
          refreshToken
        },
        message: response?.data?.message
      };
    } else {
      console.warn("Registration failed:", response.data?.message);
      return {
        message: response?.data?.message
      };
    }
  } catch (error) {
    console.error("Error during user registration:", error);
    return {
      message: error?.response?.data?.message || error?.message
    };
  }
};

export const refreshTokenApi = async (refreshToken) => {
  try {
    const response = await apiConnector("POST", REFRESH_TOKEN_API, {
      refreshToken,
    });

    if (response?.data?.success) {
      const { accessToken, refreshToken, updatedUser } = response.data.data;
      return {
        accessToken,
        refreshToken,
        updatedUser
      };
    } else {
      console.warn("Refresh token failed:", response.data?.message);
      return null;
    }
  } catch (error) {
    console.error("Error during refresh token:", error);
    return null;
  }
};

export const updateProfile = async (data, accessToken) => {
  // console.log(data);
  try {
    const { data: apiResponse } = await apiConnector(
      "POST",
      UPDATE_PROFILE_API,
      data, // Send the updated data in the body
      { Authorization: `Bearer ${accessToken}` }
    );
    if (!apiResponse?.success) {
      throw new Error(apiResponse?.message || "Failed to update profile");
    }
    console.log("PROFILE_UPDATE_API_RESPONSE...", apiResponse);
    return apiResponse.data;
  } catch (error) {
    console.log("PROFILE_UPDATE_API_ERROR...", error);
    throw error;
  }
}

// Service helper: deleteProfile
export const deleteProfile = async (accessToken) => {
  try {
    // Call the DELETE profile endpoint. No body is required per your backend.
    const response = await apiConnector(
      "DELETE",
      profileEndpoints.DELETE_PROFILE_API,
      null,
      { Authorization: `Bearer ${accessToken}` }
    );

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Failed to delete profile");
    }

    return true;
  } catch (error) {
    console.error("DELETE_PROFILE_API_ERROR...", error);
    throw error;
  }
};

export const resetPassword = async (token, newPassword) => {
  const toastId = toast.loading("Resetting password...");
  try {
    const response = await apiConnector("POST", `${RESET_PASSWORD_API}/${token}`, {
      newPassword,
    });

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Failed to reset password");
    }

    toast.success("Password reset successfully");
    return true;
  } catch (error) {
    console.error("RESET_PASSWORD_API_ERROR...", error);
    toast.error(error?.response?.data?.message || error?.message || "Something went wrong");
    return false;
  } finally {
    toast.dismiss(toastId);
  }
};

export const fetchProfileApi = async (accessToken) => {
  try {
    const { data: apiResponse } = await apiConnector(
      "GET",
      GET_PROFILE_API,
      null,
      { Authorization: `Bearer ${accessToken}` }
    );
    if (!apiResponse?.success) {
      throw new Error(apiResponse?.message || "Failed to fetch profile");
    }
    return apiResponse.data;
  } catch (error) {
    console.error("Error in fetchProfileApi:", error);
    throw error;
  }
};