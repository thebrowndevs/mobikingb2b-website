import { policyEndPoints } from "@/lib/api";
import { apiConnector } from "../apiConnector";

const {
    PRIVACY_POLICY,
    CANCELLATION_POLICY,
    REFUND_POLICY,
    RETURN_POLICY,
    TERMS_OF_SERVICE
} = policyEndPoints;

export const getPrivacyPolicy = async () => {
    try {
        const { data: apiResponse } = await apiConnector(
            "GET",
            PRIVACY_POLICY
        );

        if (!apiResponse?.success) {
            console.warn("API request was not successful");
            return [];
        }
        console.log(apiResponse.data)

        return apiResponse.data;
    } catch (error) {
        console.error("Error fetching categories:", error);
        return [];
    }
}

export const getRefundPolicy = async () => {
    try {
        const { data: apiResponse } = await apiConnector(
            "GET",
            REFUND_POLICY
        );

        if (!apiResponse?.success) {
            console.warn("API request was not successful");
            return [];
        }

        console.log("Unexpected data format:", apiResponse);
        return apiResponse.data;

    } catch (error) {
        console.error("Error fetching categories:", error);
        return [];
    }
}

export const getReturnPolicy = async () => {
    try {
        const { data: apiResponse } = await apiConnector(
            "GET",
            RETURN_POLICY
        );

        if (!apiResponse?.success) {
            console.warn("API request was not successful");
            return [];
        }

        console.log("Unexpected data format:", apiResponse.data);
        return apiResponse.data;

    } catch (error) {
        console.error("Error fetching categories:", error);
        return [];
    }
}

export const getCancellationPolicy = async () => {
    try {
        const { data: apiResponse } = await apiConnector(
            "GET",
            CANCELLATION_POLICY
        );

        if (!apiResponse?.success) {
            console.warn("API request was not successful");
            return [];
        }

        console.log("Unexpected data format:", apiResponse);

        return apiResponse.data;

    } catch (error) {
        console.error("Error fetching categories:", error);
        return [];
    }
}

export const getTermsOfService = async () => {
    try {
        const { data: apiResponse } = await apiConnector(
            "GET",
            TERMS_OF_SERVICE
        );

        if (!apiResponse?.success) {
            console.warn("API request was not successful");
            return [];
        }

        console.log("data:", apiResponse);
        return apiResponse.data;

    } catch (error) {
        console.error("Error fetching categories:", error);
        return [];
    }
}