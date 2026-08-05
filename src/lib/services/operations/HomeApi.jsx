import { homeEndPoints } from "@/lib/api";
import { apiConnector } from "../apiConnector";

const {
  GET_ALL_CATEGORIES_API,
  GET_ALL_PRODUCTS_API,
  GET_ALL_BRANDS_API,
  GET_ALL_SUBCATEGORIES_API,
  GET_SUBCATEGORY_BY_SLUG_API,
  GET_SUBCATEGORY_BY_SLUG_PAGINATED_API,
  GET_APP_PRODUCTS_BY_SEARCH_API,
  GET_APP_PRODUCTS_BY_SEARCH_API_PAGINATED,
  GET_SEARCH_SUGGESTIONS_API,
  GET_ALL_HOME_LAYOUT,
  GET_PRODUCTS_BY_SLUG,
  GET_RELATED_PRODUCTS_BY_SLUG_API,

  GET_PRODUCTS_SLUGS,
  GET_CATEGORIES_SLUGS,
  GET_SUBCATEGORIES_SLUGS,
} = homeEndPoints;


export const getCategories = async () => {
  try {
    const { data: apiResponse } = await apiConnector(
      "GET",
      GET_ALL_CATEGORIES_API
    );

    if (!apiResponse?.success) {
      console.warn("API request was not successful");
      return [];
    }

    if (Array.isArray(apiResponse.data)) {
      return apiResponse.data;
    }

    console.warn("Unexpected data format:", apiResponse);
    return [];
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
};

export const getSubCategories = async () => {
  try {
    const { data: apiResponse } = await apiConnector(
      "GET",
      GET_ALL_SUBCATEGORIES_API
    );

    if (!apiResponse?.success) {
      console.warn("API request was not successful");
      return [];
    }

    if (Array.isArray(apiResponse.data)) {
      return apiResponse.data;
    }

    console.warn("Unexpected data format:", apiResponse);
    return [];
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
};

export const getSubCategoryBySlug = async (slug) => {
  try {
    const { data: apiResponse } = await apiConnector(
      "GET",
      `${GET_SUBCATEGORY_BY_SLUG_API}/${slug}`
    );

    if (!apiResponse?.success) {
      console.warn("API request was not successful");
      return [];
    }

    // if (Array.isArray(apiResponse.data)) {
    return apiResponse?.data;
    // }

    console.warn("Unexpected data format:", apiResponse);
    return [];
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
};

export const getSubCategoryProductsBySlugPaginated = async ({ slug, limit = 10, lastIndex = -1, orderBy = "" }) => {
  try {
    let url = `${GET_SUBCATEGORY_BY_SLUG_PAGINATED_API}/${slug}?limit=${limit}&lastIndex=${lastIndex}`;
    if (orderBy) {
      url += `&orderBy=${orderBy}`;
    }

    const { data: apiResponse } = await apiConnector("GET", url);

    if (!apiResponse?.success) {
      console.warn("API request was not successful");
      return { subCategory: null, products: [], pagination: { lastIndex, limit, returned: 0, total: 0, hasMore: false } };
    }

    return apiResponse?.data || { subCategory: null, products: [], pagination: { lastIndex, limit, returned: 0, total: 0, hasMore: false } };
  } catch (error) {
    console.error("Error fetching paginated subcategory products:", error);
    return { subCategory: null, products: [], pagination: { lastIndex, limit, returned: 0, total: 0, hasMore: false } };
  }
};

// Search APIS
export const getSearchSuggestions = async (query) => {
  try {
    // console.log("Params: ", params);
    const { data: apiResponse } = await apiConnector(
      "GET",
      `${GET_SEARCH_SUGGESTIONS_API}?q=${encodeURIComponent(query)}`,
      {}
    );

    if (!apiResponse?.success) {
      console.warn("API request was not successful");
      return [];
    }

    // if (Array.isArray(apiResponse.data?.data)) {
    return apiResponse?.data;
    // }

    console.warn("Unexpected data format:", apiResponse);
    return [];
  } catch (error) {
    console.error("Error fetching search results:", error);
    return [];
  }

};

export const getSearchResults = async (
  query,
  searchKey,
  priceFrom,
  priceTo,
  priceSort,
  selectedBrands = []
) => {
  try {
    console.log("query: ", query);
    console.log("search Key: ", searchKey);

    // build brand params like &brand=id1&brand=id2...
    const brandParams = selectedBrands
      .map((b) => `&brand=${encodeURIComponent(b._id)}`)
      .join("");

    const url = `${GET_APP_PRODUCTS_BY_SEARCH_API}?q=${encodeURIComponent(
      query ?? ""
    )}&searchKey=${encodeURIComponent(searchKey ?? "")}&priceFrom=${priceFrom || 0
      }&priceTo=${priceTo || priceFrom || 0}&orderBy=${priceSort}${brandParams}`;

    const { data: apiResponse } = await apiConnector("GET", url, {});

    if (!apiResponse?.success) {
      console.warn("API request was not successful");
      return [];
    }

    if (Array.isArray(apiResponse.data)) {
      return apiResponse.data;
    }

    console.warn("Unexpected data format:", apiResponse);
    return [];
  } catch (error) {
    console.error("Error fetching search results:", error);
    return [];
  }
};

export const getSearchResultsPaginated = async ({
  query = "",
  searchKey = "",
  limit = 12,
  lastIndex = null,
  priceFrom = 0,
  priceTo = 50000,
  priceSort = "",
  selectedBrands = [],
}) => {
  try {
    const brandParams = (selectedBrands || [])
      .map((b) => `&brand=${encodeURIComponent(b._id)}`)
      .join("");

    let url = `${GET_APP_PRODUCTS_BY_SEARCH_API_PAGINATED}?limit=${encodeURIComponent(
      limit
    )}&q=${encodeURIComponent(query ?? "")}&searchKey=${encodeURIComponent(searchKey ?? "")}&lastIndex=${encodeURIComponent(
      lastIndex ?? ""
    )}&priceFrom=${encodeURIComponent(priceFrom)}&priceTo=${encodeURIComponent(priceTo)}${brandParams}`;

    if (priceSort) {
      url += `&orderBy=${encodeURIComponent(priceSort)}`;
    }

    const { data: apiResponse } = await apiConnector("GET", url, {});
    if (!apiResponse?.success) return { data: [], lastIndex: null, hasMore: false };

    // Normalize response
    const responseData = Array.isArray(apiResponse?.data?.products) ? apiResponse.data?.products : [];
    // server should ideally return lastIndex/hasMore; fallback compute
    const last = apiResponse?.data?.pagination?.lastIndex ?? (responseData.length ? (lastIndex ?? 0) + responseData.length : null);
    const hasMore = typeof apiResponse?.data?.pagination?.hasMore === "boolean" ? apiResponse?.data?.pagination?.hasMore : (responseData.length === Number(limit));

    return { data: responseData, lastIndex: last, hasMore };
  } catch (error) {
    console.error("Error fetching paginated search results:", error);
    return { data: [], lastIndex: null, hasMore: false };
  }
};

export const getProducts = async () => {
  try {
    const response = await apiConnector("GET", GET_ALL_PRODUCTS_API);
    if (Array.isArray(response.data)) {
      return response.data;
    } else {
      console.warn("Unexpected data format:", response.data);
      return [];
    }
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  } finally {
    console.log("Products fetched successfully");
  }
};

export const getRelatedProductsBySlug = async (slug) => {
  try {
    const { data: apiResponse } = await apiConnector(
      "GET",
      `${GET_RELATED_PRODUCTS_BY_SLUG_API}/${slug}`
    );

    if (!apiResponse?.success) {
      console.warn("API request was not successful");
      return [];
    }

    // if (Array.isArray(apiResponse.data)) {
    return apiResponse?.data;
    // }

  } catch (error) {
    console.error("Error fetching Products:", error);
    return [];
  }
}

export const getBrands = async () => {
  try {
    const response = await apiConnector("GET", GET_ALL_BRANDS_API);
    if (Array.isArray(response.data.data)) {
      return response.data.data;
    } else {
      console.warn("Unexpected data format:", response.data.data);
      return [];
    }
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  } finally {
    console.log("Brands fetched successfully");
  }
}

export const getHomeLayoutBanners = async () => {
  try {
    const { data: apiResponse } = await apiConnector(
      "GET",
      GET_ALL_HOME_LAYOUT
    );

    if (!apiResponse?.success) {
      console.warn("API request was not successful");
      return [];
    }

    const banners = apiResponse?.data?.banners;
    if (Array.isArray(banners)) {
      return banners;
    }

    console.warn("Unexpected banner format:", apiResponse?.data);
    return [];
  } catch (error) {
    console.error("Error fetching home layout:", error);
    return [];
  }
};

export const getHomeLayoutGroups = async () => {
  try {
    const response = await apiConnector("GET", GET_ALL_HOME_LAYOUT);

    // Log the full response for debugging
    // console.log("Full API response:", response);

    // Check if 'data' is inside response
    const apiResponse = response?.data || response;


    // Log the apiResponse for clarity
    // console.log("apiResponse:", apiResponse);

    if (!apiResponse?.success) {
      console.warn("API request was not successful");
      return [];
    }

    // Try both plural and singular group keys (just in case)
    const groups = apiResponse?.data?.groups || apiResponse?.data?.group;

    // Log groups for debugging
    // console.log("Fetched groups:", groups);

    if (Array.isArray(groups)) {
      return groups;
    }

    console.warn("Unexpected group format:", apiResponse?.data);
    return [];
  } catch (error) {
    console.error("Error fetching home layout:", error);
    return [];
  }
};

export const getProductsBySlug = async (slug) => {
  try {
    const { data: apiResponse } = await apiConnector(
      "GET",
      `${GET_PRODUCTS_BY_SLUG}/${slug}`
    );

    if (!apiResponse?.success) {
      console.warn("API request was not successful");
      return null;
    }

    if (apiResponse.data) {
      return apiResponse.data;
    }

    console.warn("Unexpected data format:", apiResponse);
    return null;
  } catch (error) {
    console.error("Error fetching product by slug:", error);
    return null;
  }
};

export const getAllCategorySlugs = async () => {
  try {
    const { data: apiResponse } = await apiConnector(
      "GET",
      `${GET_CATEGORIES_SLUGS}`
    );

    if (!apiResponse?.success) {
      console.warn("API request was not successful");
      return null;
    }

    if (apiResponse.data) {
      return apiResponse.data;
    }

    console.warn("Unexpected data format:", apiResponse);
    return null;
  } catch (error) {
    console.error("Error fetching products slugs:", error);
    return null;
  }
};

export const getAllSubCategorySlugs = async () => {
  try {
    const { data: apiResponse } = await apiConnector(
      "GET",
      `${GET_SUBCATEGORIES_SLUGS}`
    );

    console.log(apiResponse)
    if (!apiResponse?.success) {
      console.warn("API request was not successful");
      return null;
    }

    if (apiResponse.data) {
      return apiResponse.data;
    }

    console.warn("Unexpected data format:", apiResponse);
    return null;
  } catch (error) {
    console.error("Error fetching sub categories slugs:", error);
    return null;
  }
};

export const getAllProductSlugs = async () => {
  try {
    const { data: apiResponse } = await apiConnector(
      "GET",
      `${GET_PRODUCTS_SLUGS}`
    );

    if (!apiResponse?.success) {
      console.warn("API request was not successful");
      return null;
    }

    if (apiResponse.data) {
      return apiResponse.data;
    }

    console.warn("Unexpected data format:", apiResponse);
    return null;
  } catch (error) {
    console.error("Error fetching sub categories slugs:", error);
    return null;
  }
};