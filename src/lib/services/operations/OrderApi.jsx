import { homeEndPoints, orderEndpoints } from "@/lib/api";
import { apiConnector } from "../apiConnector";
import { toast } from "sonner";

const {
  POST_ORDER_API_COD,
  GET_ORDER_API_COD,
  CREATE_RAZORPAY_ORDER_API,
  VERIFY_RAZORPAY_PAYMENT_API,
  RESTORE_ORDER_STOCK_API,
  GET_COUPON_BY_CODE_API
} = homeEndPoints;

const {
  RATE_ORDER_API,
  PLACE_CANCEL_REQUEST_API,
  PLACE_RETURN_REQUEST_API,
  PLACE_WARRANTY_REQUEST_API,
  PLACE_PARTIAL_RETURN_REQUEST_API
} = orderEndpoints;

export const createCodOrder = async (orderDetails, accessToken) => {
  try {
    const { data } = await apiConnector(
      "POST",
      POST_ORDER_API_COD,
      orderDetails,
      {
        Authorization: `Bearer ${accessToken}`,
      }
    );
    // console.log("API Success: createCodOrder response:", data);
    return { success: true, data };
  } catch (error) {
    console.error("API Error in createCodOrder:", error);
    return {
      success: false,
      error: error.response?.data?.message || error.message,
    };
  }
};

export const getCodOrder = async (params, accessToken) => {
  try {
    const { data } = await apiConnector(
      "GET",
      GET_ORDER_API_COD,
      null,
      {
        Authorization: `Bearer ${accessToken}`,
      },
      params
    );
    // console.log("API Success: getOrders response:", data);
    return { success: true, data };
  } catch (error) {
    console.error("API Error in getOrders:", error);
    return {
      success: false,
      error: error.response?.data?.message || error.message,
    };
  }
};

function loadScript(src) {
  return new Promise(resolve => {
    const script = document.createElement("script");
    script.src = src;

    script.onload = () => {
      resolve(true);
    }

    script.onerror = () => {
      resolve(false);
    }

    document.body.appendChild(script);
  })
}

export const createRazorpayOrder = async (body, accessToken, setUser, router) => {
  try {

    const res = loadScript("https://checkout.razorpay.com/v1/checkout.js");
    if (!res)
      toast.error("Razorpay SDK failed to load. Check your Internet Connection");

    const { data: apiResponse } = await apiConnector(
      "POST",
      CREATE_RAZORPAY_ORDER_API,
      body,
      {
        Authorization: `Bearer ${accessToken}`,
      }
    );

    if (!apiResponse?.success)
      throw new Error(apiResponse?.message);

    // console.log("PAYMENT RESPONSE FROM BACKEND............", apiResponse)
    setUser(apiResponse?.data?.user);
    localStorage.setItem("user", JSON.stringify(apiResponse?.data?.user));

    // let paymentCompleted = false;
    // let orderId = apiResponse?.data?.newOrderId;

    const options = {
      key: apiResponse?.data?.key, // from backend
      amount: apiResponse?.data?.amount,
      currency: apiResponse?.data?.currency,
      name: 'Mobiking',
      // description: 'Online Order Payment',
      order_id: apiResponse?.data?.razorpayOrderId, // from backend
      handler: async function (response) {
        // ✅ on payment success
        const finalResponse = await verifyRazorpayPayment(
          {
            razorpay_payment_id: response?.razorpay_payment_id,
            razorpay_order_id: response?.razorpay_order_id,
            razorpay_signature: response?.razorpay_signature,
            orderId: apiResponse?.data?.newOrderId,
          },
          accessToken
        );

        if (finalResponse?.success) {
          toast.success("Payment successful and order placed!");
          // paymentCompleted = true;
          setUser(finalResponse?.data?.data?.user);
          localStorage.setItem("user", JSON.stringify(finalResponse?.data?.data?.user));
          router.push("/account?tab=orders");
        } else {
          toast.error(finalResponse?.error || "Payment verification failed. Please contact support.");
        }
      },
      modal: {
        ondismiss: async function () {

          // if (!paymentCompleted) {

          // console.log("orderId: ",orderId);
          toast.error("Payment cancelled");

          // await restoreOrderStock(orderId, accessToken);
          // }
        }
      },
      prefill: {
        name: body?.name,
        email: body?.email,
        phoneNo: body?.phoneNo,
      },
      // theme: {
      //   color: '#3399cc',
      // },
    };

    const razorpay = new window.Razorpay(options);
    razorpay.open();

    // const handlePageClose = async () => {

    //   if (!paymentCompleted) {
    //     await restoreOrderStock(orderId, accessToken);
    //   }

    // };

    // window.addEventListener("beforeunload", handlePageClose);

    // window.addEventListener("pagehide", handlePageClose);

    // return { success: true };

    return { success: true, apiResponse };
  } catch (error) {
    console.error("API Error in createRazorpayOrder:", error);
    return {
      success: false,
      // Use error.message to get the "data is not defined" string
      error: error.response?.data?.message || error.message,
    };
  }
};

export const createPhonepeOrderV2Api = async (body, accessToken, setUser) => {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "";
    const baseUrlV2 = baseUrl.replace("/v1", "/v2");
    const CREATE_ONLINE_ORDER_V2 = `${baseUrlV2}/orders/online/new`;

    const payload = { ...body, gateway: "phonepe" };

    const { data: apiResponse } = await apiConnector(
      "POST",
      CREATE_ONLINE_ORDER_V2,
      payload,
      {
        Authorization: `Bearer ${accessToken}`,
      }
    );

    if (!apiResponse?.success) {
      throw new Error(apiResponse?.message || "Order creation failed");
    }

    setUser(apiResponse?.data?.user);
    localStorage.setItem("user", JSON.stringify(apiResponse?.data?.user));

    if (apiResponse?.data?.redirectUrl) {
      toast.success("Redirecting to PhonePe gateway...");
      window.location.href = apiResponse.data.redirectUrl;
      return { success: true, redirect: true };
    } else {
      throw new Error("PhonePe redirect URL not found");
    }
  } catch (error) {
    console.error("API Error in createPhonepeOrderV2Api:", error);
    return {
      success: false,
      error: error.response?.data?.message || error.message,
    };
  }
};

export const createRazorpayOrderV2Api = async (body, accessToken, setUser, router) => {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "";
    const baseUrlV2 = baseUrl.replace("/v1", "/v2");
    const CREATE_ONLINE_ORDER_V2 = `${baseUrlV2}/orders/online/new`;

    const res = loadScript("https://checkout.razorpay.com/v1/checkout.js");
    if (!res) {
      toast.error("Razorpay SDK failed to load. Check your Internet Connection");
    }

    const payload = { ...body, gateway: "razorpay" };

    const { data: apiResponse } = await apiConnector(
      "POST",
      CREATE_ONLINE_ORDER_V2,
      payload,
      {
        Authorization: `Bearer ${accessToken}`,
      }
    );

    if (!apiResponse?.success) {
      throw new Error(apiResponse?.message || "Order creation failed");
    }

    setUser(apiResponse?.data?.user);
    localStorage.setItem("user", JSON.stringify(apiResponse?.data?.user));

    // Razorpay modal integration
    const options = {
      key: apiResponse?.data?.key,
      amount: apiResponse?.data?.amount,
      currency: apiResponse?.data?.currency,
      name: 'Mobiking',
      order_id: apiResponse?.data?.razorpayOrderId,
      handler: async function (response) {
        const finalResponse = await verifyRazorpayPayment(
          {
            razorpay_payment_id: response?.razorpay_payment_id,
            razorpay_order_id: response?.razorpay_order_id,
            razorpay_signature: response?.razorpay_signature,
            orderId: apiResponse?.data?.newOrderId,
          },
          accessToken
        );

        if (finalResponse?.success) {
          toast.success("Payment successful and order placed!");
          setUser(finalResponse?.data?.data?.user);
          localStorage.setItem("user", JSON.stringify(finalResponse?.data?.data?.user));
          router.push("/account?tab=orders");
        } else {
          toast.error(finalResponse?.error || "Payment verification failed. Please contact support.");
        }
      },
      modal: {
        ondismiss: async function () {
          toast.error("Payment cancelled");
        }
      },
      prefill: {
        name: body?.name,
        email: body?.email,
        phoneNo: body?.phoneNo,
      },
    };

    const razorpay = new window.Razorpay(options);
    razorpay.open();

    return { success: true, apiResponse };
  } catch (error) {
    console.error("API Error in createRazorpayOrderV2Api:", error);
    return {
      success: false,
      error: error.response?.data?.message || error.message,
    };
  }
};

export const verifyRazorpayPayment = async (verificationData, accessToken) => {
  // ... this function remains the same ...
  try {
    const { data } = await apiConnector(
      "POST",
      VERIFY_RAZORPAY_PAYMENT_API,
      verificationData,
      {
        Authorization: `Bearer ${accessToken}`,
      }
    );
    // console.log("API Success: verifyRazorpayPayment response:", data);
    return { success: true, data };
  } catch (error) {
    console.error("API Error in verifyRazorpayPayment:", error);
    return {
      success: false,
      error: error.response?.data?.message || error.message,
    };
  }
};

// export const restoreOrderStock = async (orderId, accessToken) => {
//   // ... this function remains the same ...
//   try {
//     const { data } = await apiConnector(
//       "POST",
//       RESTORE_ORDER_STOCK_API,
//       { orderId },
//       {
//         Authorization: `Bearer ${accessToken}`,
//       }
//     );
//     console.log("API Success: restoreOrderStock response:", data);
//     return { success: true, data };
//   } catch (error) {
//     console.error("API Error in restoreOrderStock:", error);
//     return {
//       success: false,
//       error: error.response?.data?.message || error.message,
//     };
//   }
// };

export const placeCancelRequest = async (accessToken, data) => {
  try {
    const { data: apiResponse } = await apiConnector(
      "POST",
      PLACE_CANCEL_REQUEST_API,
      data,
      {
        Authorization: `Bearer ${accessToken}`
      }
    );
    if (!apiResponse?.success) {
      throw new Error(apiResponse?.message || "Failed to place cancel request");
    }

    // console.log("PLACE_CANCEL_REQUEST_API_RESPONSE....", apiResponse);
    toast.success(apiResponse?.message);
    return apiResponse;
  } catch (error) {
    console.error("PLACE_CANCEL_REQUEST_ERROR....", error);
    toast.error(error.response?.data?.message || error.message);
    throw error;
  }
}

export const placeReturnRequest = async (accessToken, data) => {
  try {
    const { data: apiResponse } = await apiConnector(
      "POST",
      PLACE_RETURN_REQUEST_API,
      data,
      {
        Authorization: `Bearer ${accessToken}`
      }
    );
    if (!apiResponse?.success) {
      throw new Error(apiResponse?.message || "Failed to place return request");
    }

    // console.log("PLACE_RETURN_REQUEST_API_RESPONSE....", apiResponse);
    toast.success(apiResponse?.message);
    return apiResponse;
  } catch (error) {
    console.error("PLACE_RETURN_REQUEST_ERROR....", error);
    toast.error(error.response?.data?.message || error.message);
    throw error;
  }
}

export const placeWarrantyRequest = async (accessToken, data) => {
  try {
    const { data: apiResponse } = await apiConnector(
      "POST",
      PLACE_WARRANTY_REQUEST_API,
      data,
      {
        Authorization: `Bearer ${accessToken}`
      }
    );
    if (!apiResponse?.success) {
      throw new Error(apiResponse?.message || "Failed to place warranty request");
    }

    // console.log("PLACE_WARRANTY_REQUEST_API_RESPONSE....", apiResponse);
    toast.success(apiResponse?.message);
    return apiResponse;
  } catch (error) {
    console.error("PLACE_WARRANTY_REQUEST_ERROR....", error);
    toast.error(error.response?.data?.message || error.message);
    throw error;
  }
}

export const rateOrder = async (accessToken, data) => {
  try {
    const { data: apiResponse } = await apiConnector(
      "POST",
      RATE_ORDER_API,
      data,
      {
        Authorization: `Bearer ${accessToken}`
      }
    );
    if (!apiResponse?.success) {
      throw new Error(apiResponse?.message || "Failed to add review");
    }

    // console.log("RATE_ORDER_API_RESPONSE....", apiResponse);
    toast.success(apiResponse?.message);
    return apiResponse;
  } catch (error) {
    console.error("RATE_ORDER_ERROR....", error);
    toast.error(error.response?.data?.message || error.message);
    throw error;
  }
}

export const verifyCoupon = async (accessToken, couponCode, paymentMethod) => {
  try {
    const { data: apiResponse } = await apiConnector(
      "GET",
      `${GET_COUPON_BY_CODE_API}/validate/${couponCode}/${paymentMethod}`,
      null,
      {
        Authorization: `Bearer ${accessToken}`
      }
    );
    if (!apiResponse?.success) {
      throw new Error(apiResponse?.message || "Could not verify coupon");
    }

    // console.log("GET_COUPON_BY_CODE_API_RESPONSE....", apiResponse);
    // toast.success(apiResponse?.message);
    return apiResponse.data;
  } catch (error) {
    // console.error("GET_COUPON_BY_CODE_ERROR....", error);
    toast.error(error.response?.data?.message || error.message);
    return null;
    // throw error;
  }
};

export const placePartialReturnRequest = async (token, payload) => {
  try {
    const { data } = await apiConnector(
      "POST",
      PLACE_PARTIAL_RETURN_REQUEST_API,
      payload,
      {
        Authorization: `Bearer ${token}`,
      }
    );
    return { success: true, data: data?.data };
  } catch (error) {
    console.error("API Error in placePartialReturnRequest:", error);
    return {
      success: false,
      error: error.response?.data?.message || error.message,
    };
  }
};