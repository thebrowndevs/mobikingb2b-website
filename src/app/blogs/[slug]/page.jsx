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
      <div className="text-center py-20 bg-white min-h-[60vh]">
        <h1 className="text-2xl font-bold text-slate-800 tracking-tighter">Blog Post Not Found</h1>
        <p className="text-slate-500 mt-2 text-sm font-medium">The article you are looking for does not exist or has been removed.</p>
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
      
      <BlogClient blog={blog} />
    </>
  );
}
