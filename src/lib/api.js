const baseUrl = process.env.NEXT_PUBLIC_API_URL;

export const homeEndPoints = {
  GET_ALL_CATEGORIES_API: `${baseUrl}/categories`,
  GET_ALL_SUBCATEGORIES_API: `${baseUrl}/categories/subCategories`,
  GET_SUBCATEGORY_BY_SLUG_API: `${baseUrl}/categories/subCategories/details`,
  GET_SUBCATEGORY_BY_SLUG_PAGINATED_API: `${baseUrl}/categories/subCategories/details/paginated`,
  GET_ALL_HOME_LAYOUT: `${baseUrl}/home`,
  GET_HOME_WEBSITE: `${baseUrl}/home/website`,
  GET_WEBSITE_BANNERS: `${baseUrl}/home/website/banners`,
  GET_WEBSITE_CATEGORIES: `${baseUrl}/home/website/categories`,
  GET_WEBSITE_GROUPS: `${baseUrl}/home/website/groups`,
  GET_ALL_PRODUCTS_API: `${baseUrl}/products`,
  GET_RELATED_PRODUCTS_BY_SLUG_API: `${baseUrl}/products/related`,
  GET_GROUP_PRODUCTS_BY_ID_API: `${baseUrl}/groups/products`,
  GET_ALL_BRANDS_API: `${baseUrl}/brands`,

  GET_APP_PRODUCTS_BY_SEARCH_API: `${baseUrl}/products/all/search`,
  GET_APP_PRODUCTS_BY_SEARCH_API_PAGINATED: `${baseUrl}/products/all/paginated/search`,

  GET_SEARCH_SUGGESTIONS_API: `${baseUrl}/products/suggestions/search`,
  SEND_OTP_API: `${baseUrl}/users/sendOtp`,
  GET_LOGIN_API: `${baseUrl}/users/login`,
  GET_SIGNUP_API: `${baseUrl}/users/signup`,
  GET_PRODUCTS_BY_SLUG: `${baseUrl}/products/details`,

  GET_PRODUCTS_SLUGS: `${baseUrl}/products/slugs`,
  GET_CATEGORIES_SLUGS: `${baseUrl}/categories/slugs`,
  GET_SUBCATEGORIES_SLUGS: `${baseUrl}/categories/subcategories/details`,

  GET_MY_CART_API: `${baseUrl}/users/cart`,
  ADD_TO_CART_API: `${baseUrl}/cart/add`,
  ADD_TO_CART_BULK_API: `${baseUrl}/cart/add-bulk`,
  REMOVE_FROM_CART_API: `${baseUrl}/cart/remove`,
  REFRESH_TOKEN_API: `${baseUrl}/users/refresh-token`,
  FORGOT_PASSWORD_LINK_API: `${baseUrl}/users/forgot-password-link`,
  RESET_PASSWORD_API: `${baseUrl}/users/reset-password`,
  GET_WISHLIST_API: `${baseUrl}/users/wishlist/add`,
  REMOVE_FROM_WISHLIST_API: `${baseUrl}/users/wishlist/remove`,
  GET_COUPON_BY_CODE_API: `${baseUrl}/coupon/code`,
  ADD_ADDRESS_API: `${baseUrl}/users/address/add`,
  GET_ADDRESSES_API: `${baseUrl}/users/address/view`,
  DELETE_ADDRESS_API: `${baseUrl}/users/address`,
  UPDATE_ADDRESS_API: `${baseUrl}/users/address`,
  POST_ORDER_API_COD: `${baseUrl}/orders/cod/new`,
  GET_ORDER_API_COD: `${baseUrl}/orders/user`,
  CREATE_RAZORPAY_ORDER_API: `${baseUrl}/orders/online/new`,
  VERIFY_RAZORPAY_PAYMENT_API: `${baseUrl}/orders/online/verify`,
  RESTORE_ORDER_STOCK_API: `${baseUrl}/orders/online/restore`,

  // Blogs APIs
  GET_BLOGS_PAGED_API: `${baseUrl}/blogs`,
  GET_BLOG_BY_SLUG_API: `${baseUrl}/blogs/slug`,
};

export const policyEndPoints = {
  PRIVACY_POLICY: `${baseUrl}/policy/privacy-policy`,
  REFUND_POLICY: `${baseUrl}/policy/refund-policy`,
  RETURN_POLICY: `${baseUrl}/policy/return-policy`,
  CANCELLATION_POLICY: `${baseUrl}/policy/cancellation-policy`,
  TERMS_OF_SERVICE: `${baseUrl}/policy/terms-of-service`,
}

export const queriesendpoints = {
  RAISE_QUERY_API: `${baseUrl}/queries/raiseQuery`,
  ADD_REPLY_TO_QUERY_API: `${baseUrl}/queries/reply`,
  ADD_RATING_TO_QUERY_API: `${baseUrl}/queries/rate`,
  GET_MY_QUERIES_API: `${baseUrl}/queries/my`,
}

export const orderEndpoints = {
  RATE_ORDER_API: `${baseUrl}/orders/review`,
  PLACE_CANCEL_REQUEST_API: `${baseUrl}/users/request/cancel`,
  PLACE_WARRANTY_REQUEST_API: `${baseUrl}/users/request/warranty`,
  PLACE_RETURN_REQUEST_API: `${baseUrl}/users/request/return`,
  PLACE_PARTIAL_RETURN_REQUEST_API: `${baseUrl}/orders/partial-return/raise`,
  PLACE_PARTIAL_RETURN_REPLY_API: `${baseUrl}/orders/partial-return/reply`,
  GET_PARTIAL_RETURN_REQUEST_API: `${baseUrl}/orders/partial-return/requests`,
  GET_PARTIAL_RETURN_REQUESTS_BY_ORDER_API: `${baseUrl}/orders/partial-return/requests/order`,
}

export const profileEndpoints = {
  GET_PROFILE_API: `${baseUrl}/users/profile`,
  UPDATE_PROFILE_API: `${baseUrl}/users/profile/update`,
  DELETE_PROFILE_API: `${baseUrl}/users/delete`,
}

export const onboardingEndpoints = {
  ONBOARDING_STATUS_API: `${baseUrl}/onboarding/status`,
  ONBOARDING_CHECK_DUPLICATE: `${baseUrl}/onboarding/check-duplicate`,
  ONBOARDING_GST_VERIFY: `${baseUrl}/onboarding/gst/verify`,
  ONBOARDING_SAVE_BUSINESS: `${baseUrl}/onboarding/business`,
  ONBOARDING_UPDATE_GST: `${baseUrl}/onboarding/gst/update`,
}

export const quotationEndpoints = {
  RAISE_QUOTATION_API: `${baseUrl}/quotations/new`,
  GET_MY_QUOTATIONS_API: `${baseUrl}/quotations/my`,
  GET_ALL_QUOTATIONS_API: `${baseUrl}/quotations/all`,
  UPDATE_QUOTATION_STATUS_API: `${baseUrl}/quotations/status`,
  BOOK_QUOTATION_API: `${baseUrl}/quotations/book`
}