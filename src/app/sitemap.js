// app/sitemap.js

import { getAllCategorySlugs, getAllProductSlugs } from "@/lib/services/operations/HomeApi";

export default async function sitemap() {

    const siteUrl = "https://mobikingwholesale.com";

    // Static Pages
    const staticRoutes = [
        "",
        "/about-us",
        "/privacy-policy",
        "/refund-policy",
        "/return-policy",
        "/terms-of-service",
        "/categories",   // category listing page
    ].map((route) => ({
        url: `${siteUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: route === "" ? 1.0 : 0.8,
    }));


    // Categories
    const categories = await getAllCategorySlugs();

    const categoryRoutes = categories?.map((category) => ({
        url: `${siteUrl}/categories/${category?.slug}`,
        // lastModified: new Date(category.updatedAt),
        changeFrequency: "weekly",
        priority: 0.9,
    }));


    // // Sub Categories
    // const subCategories = await getAllSubCategorySlugs();

    // const subCategoryRoutes = subCategories?.map((sub) => ({
    //     url: `${siteUrl}/cs/${sub?.slug}`,
    //     // lastModified: new Date(sub.updatedAt),
    //     changeFrequency: "weekly",
    //     priority: 0.8,
    // }));


    // Products
    const products = await getAllProductSlugs();

    const productRoutes = products?.map((product) => ({
        url: `${siteUrl}/ps/${product?.slug}`,
        // lastModified: new Date(product.updatedAt),
        changeFrequency: "weekly",
        priority: 0.7,
    }));


    return [
        ...staticRoutes,
        ...categoryRoutes,
        // ...subCategoryRoutes,
        ...productRoutes,
    ];
}