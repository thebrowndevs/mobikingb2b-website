import { queriesendpoints } from "@/lib/api";
import { apiConnector } from "../apiConnector";
import { toast } from "sonner";

const {
    RAISE_QUERY_API,
    ADD_REPLY_TO_QUERY_API,
    ADD_RATING_TO_QUERY_API,
    GET_MY_QUERIES_API
} = queriesendpoints

export const raiseQuery = async (accessToken, data) => {
    try {
        const { data: apiResponse } = await apiConnector(
            "POST",
            RAISE_QUERY_API,
            data,
            {
                Authorization: `Bearer ${accessToken}`
            }
        );
        if (!apiResponse?.success) {
            throw new Error(apiResponse?.message || "Failed to Raise Query");
        }

        console.log("RAISE_QUERY_API_RESPONSE....", apiResponse);
        // toast.success(apiResponse?.message);
        return apiResponse?.data?.updatedOrder;
    } catch (error) {
        console.error("RAISE_QUERY_API_ERROR....", error);
        toast.error(error.response?.data?.message || error.message);
        return null;
        // throw error;
    }
}

export const addReplyToQuery = async (data, accessToken) => {
    try {
        const { data: apiResponse } = await apiConnector(
            "POST",
            ADD_REPLY_TO_QUERY_API,
            data,
            {
                Authorization: `Bearer ${accessToken}`
            }
        );
        if (!apiResponse?.success) {
            throw new Error(apiResponse?.message || "Failed to Reply");
        }

        console.log("REPLY_TO_QUERY_API_RESPONSE....", apiResponse);
        // toast.success(apiResponse?.message);
        return apiResponse?.data;
    } catch (error) {
        console.error("REPLY_TO_QUERY_API_ERROR....", error);
        toast.error(error.response?.data?.message || error.message);
        throw error;
    }
}

export const addRatingToQuery = async (data, accessToken) => {
    try {
        const { data: apiResponse } = await apiConnector(
            "POST",
            ADD_RATING_TO_QUERY_API,
            data,
            {
                Authorization: `Bearer ${accessToken}`
            }
        );
        if (!apiResponse?.success) {
            throw new Error(apiResponse?.message || "Query rated successfully");
        }

        console.log("RATE_QUERY_API_RESPONSE....", apiResponse);
        // toast.success(apiResponse?.message);
        return apiResponse?.data;
    } catch (error) {
        console.error("RATE_QUERY_API_ERROR....", error);
        toast.error(error.response?.data?.message || error.message);
        throw error;
    }
}

export const getMyQueries = async (accessToken) => {
    try {
        const { data: apiResponse } = await apiConnector(
            "GET",
            GET_MY_QUERIES_API,
            null,
            {
                Authorization: `Bearer ${accessToken}`
            }
        );
        if (!apiResponse?.success) {
            throw new Error(apiResponse?.message || "Failed to fetch Queries");
        }

        console.log("GET_MY_QUERIES_API_RESPONSE....", apiResponse);
        // toast.success(apiResponse?.message);
        return apiResponse?.data;
    } catch (error) {
        console.error("GET_MY_QUERIES_API_ERROR....", error);
        toast.error(error.response?.data?.message || error.message);
        throw error;
    }
}