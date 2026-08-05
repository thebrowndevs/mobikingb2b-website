// src/app/blogs/[slug]/page.jsx
import React from "react";
import { getBlogBySlug } from "@/lib/services/operations/BlogApi";
import BlogClient from "./components/BlogClient";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  try {
    const blog = await getBlogBySlug(slug);
    if (!blog) {
      return {
        title: "Blog Post Not Found | Mobiking Wholesale",
      };
    }

    // Extract configurations from blog's SEO schema
    const seo = blog.seo || {};
    const title = seo.metaTitle || `${blog.title} | Mobiking Wholesale Blog`;
    const description = seo.metaDescription || blog.excerpt || blog.title;
    const keywords = Array.isArray(seo.metaKeywords) ? seo.metaKeywords : [];
    const canonicalUrl = `https://mobikingwholesale.com/blogs/${slug}`;
    const imageUrl = blog.image || "/logo.png";

    return {
      title,
      description,
      keywords: keywords.length > 0 ? keywords : undefined,
      alternates: { canonical: canonicalUrl },
      openGraph: {
        title,
        description,
        url: canonicalUrl,
        type: "article",
        images: [{ url: imageUrl, alt: blog.title }],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [imageUrl],
      },
    };
  } catch (error) {
    return {
      title: "Blog Details | Mobiking Wholesale",
    };
  }
}

export default async function SingleBlogPage({ params }) {
  const { slug } = await params;
  const blog = await getBlogBySlug(slug);

  if (!blog) {
    return (
      <div className="text-center py-20 bg-gray-50 min-h-[60vh]">
        <h1 className="text-2xl font-bold text-gray-800">Blog Post Not Found</h1>
        <p className="text-gray-500 mt-2">The article you are looking for does not exist or has been removed.</p>
      </div>
    );
  }

  // --- STRUCTURED DATA (JSON-LD) GENERATION ---
  
  // 1. BlogPosting Schema
  const blogSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": blog.title,
    "image": blog.image ? [blog.image] : [],
    "datePublished": blog.createdAt || new Date().toISOString(),
    "dateModified": blog.updatedAt || new Date().toISOString(),
    "author": {
      "@type": "Person",
      "name": blog.author || "Admin"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Mobiking Wholesale",
      "logo": {
        "@type": "ImageObject",
        "url": "https://mobikingwholesale.com/logo.png"
      }
    },
    "description": blog.excerpt || blog.title
  };

  // 2. FAQ Schema (if FAQs are added to the blog)
  const hasFaqs = blog.faqs && blog.faqs.length > 0;
  const faqSchema = hasFaqs ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": blog.faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  } : null;

  // 3. Product Schema for promoted products
  const hasProducts = blog.promotedProducts && blog.promotedProducts.length > 0;
  const productSchemas = hasProducts ? blog.promotedProducts.map(product => {
    const displayPrice = product.sellingPrice?.[product.sellingPrice?.length - 1]?.price || 0;
    return {
      "@context": "https://schema.org",
      "@type": "Product",
      "name": product.fullName || product.name,
      "image": product.images || [],
      "description": product.description || "",
      "sku": product.sku || "",
      "offers": {
        "@type": "Offer",
        "url": `https://mobikingwholesale.com/ps/${product.slug}`,
        "priceCurrency": "INR",
        "price": displayPrice,
        "availability": product.totalStock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
      }
    };
  }) : [];

  return (
    <>
      {/* Inject Structured Data Scripts */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogSchema) }}
      />
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}
      {productSchemas.map((pSchema, idx) => (
        <script
          key={idx}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(pSchema) }}
        />
      ))}
      
      <BlogClient blog={blog} />
    </>
  );
}
