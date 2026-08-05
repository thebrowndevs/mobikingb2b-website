"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, Calendar, User, ArrowRight } from "lucide-react";
import { getBlogsPaged } from "@/lib/services/operations/BlogApi";

export default function BlogsPage() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await getBlogsPaged({ status: "published", active: "true" });
        if (mounted) {
          setBlogs(res?.blogs || []);
        }
      } catch (err) {
        console.error("Failed to load website blogs:", err);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh] bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
          <p className="text-gray-500 text-sm font-medium">Loading our latest articles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-gray-50 min-h-screen py-12">
      <div className="max-w-[1350px] mx-auto px-4 md:px-6">
        
        {/* Header Hero Section */}
        <header className="mb-12 text-center max-w-2xl mx-auto">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl">
            Our Official Blog
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            Stay updated with the latest in electronics, wholesale market trends, tips, and buying guides.
          </p>
          <div className="mt-4 w-24 h-1 bg-indigo-600 mx-auto rounded-full"></div>
        </header>

        {blogs.length === 0 ? (
          <section className="bg-white border rounded-xl p-12 text-center shadow-sm max-w-lg mx-auto">
            <h3 className="text-xl font-semibold text-gray-800">No blog posts found</h3>
            <p className="text-gray-500 mt-2">
              We are working on bringing fresh content to you soon. Please check back later!
            </p>
            <div className="mt-6">
              <Link
                href="/"
                className="inline-block rounded-md bg-indigo-600 px-5 py-3 text-white font-medium shadow-md hover:bg-indigo-700 transition"
              >
                Back to Home
              </Link>
            </div>
          </section>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {blogs.map((blog) => {
              const formattedDate = blog.createdAt
                ? new Date(blog.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })
                : null;

              return (
                <article
                  key={blog._id}
                  className="bg-white rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col group text-sm"
                >
                  {/* Blog Image */}
                  <div className="relative aspect-video w-full overflow-hidden bg-gray-100">
                    <img
                      src={blog.image || "/not-found-img.webp"}
                      alt={blog.title}
                      className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                    />
                    {blog.featured && (
                      <span className="absolute top-2 right-2 bg-amber-500 text-white text-[10px] font-semibold px-2 py-0.5 rounded uppercase tracking-wider shadow-sm">
                        Featured
                      </span>
                    )}
                  </div>

                  {/* Blog Content */}
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      {/* Meta information */}
                      <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
                        {formattedDate && (
                          <span className="flex items-center gap-1">
                            <Calendar size={12} />
                            {formattedDate}
                          </span>
                        )}
                      </div>

                      {/* Title */}
                      <h2 className="text-base font-bold text-gray-900 group-hover:text-indigo-600 transition-colors duration-200 line-clamp-2 leading-snug">
                        <Link href={`/blogs/${blog.slug}`}>
                          {blog.title}
                        </Link>
                      </h2>

                      {/* Excerpt */}
                      {blog.excerpt && (
                        <p className="mt-2 text-gray-500 text-xs line-clamp-2 leading-relaxed">
                          {blog.excerpt}
                        </p>
                      )}
                    </div>

                    {/* Footer / Link */}
                    <div className="mt-4 pt-3 border-t border-gray-50">
                      <Link
                        href={`/blogs/${blog.slug}`}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 group/link"
                      >
                        Read Article
                        <ArrowRight size={13} className="group-hover/link:translate-x-0.5 transition-transform" />
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}
