import { homeEndPoints } from "@/lib/api";
import { apiConnector } from "../apiConnector";

const {
  GET_BLOGS_PAGED_API,
  GET_BLOG_BY_SLUG_API,
} = homeEndPoints;

export const getBlogsPaged = async (params = {}) => {
  try {
    const cleanParams = {};
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null && params[key] !== "") {
        cleanParams[key] = params[key];
      }
    });

    // Make sure we request all active published blogs by default
    if (!cleanParams.status) cleanParams.status = "published";
    if (cleanParams.active === undefined) cleanParams.active = "true";

    const { data: apiResponse } = await apiConnector(
      "GET",
      GET_BLOGS_PAGED_API,
      null,
      null,
      cleanParams
    );

    if (!apiResponse?.success) {
      console.warn("API request was not successful");
      return { blogs: [], pagination: { page: 1, limit: 30, totalCount: 0, hasMore: false } };
    }

    return apiResponse.data || { blogs: [], pagination: { page: 1, limit: 30, totalCount: 0, hasMore: false } };
  } catch (error) {
    console.error("Error fetching blogs:", error);
    return { blogs: [], pagination: { page: 1, limit: 30, totalCount: 0, hasMore: false } };
  }
};

export const getBlogBySlug = async (slug) => {
  try {
    const { data: apiResponse } = await apiConnector(
      "GET",
      `${GET_BLOG_BY_SLUG_API}/${slug}`
    );

    if (!apiResponse?.success) {
      console.warn("API request was not successful");
      return null;
    }

    return apiResponse.data;
  } catch (error) {
    console.error(`Error fetching blog by slug ${slug}:`, error);
    return null;
  }
};
