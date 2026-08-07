"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, Calendar, ArrowRight, BookOpen } from "lucide-react";
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
      <div className="flex justify-center items-center min-h-[70vh] bg-white">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-slate-400 text-sm font-semibold">Loading latest articles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen py-16">
      <div className="max-w-[1350px] mx-auto px-4 md:px-6">

        {/* Header Hero Section */}
        <header className="mb-16 text-center max-w-2xl mx-auto">
          <span className="text-xs font-bold text-primary tracking-widest uppercase bg-slate-100 px-3 py-1 rounded-full">
            Insights & Updates
          </span>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tighter sm:text-5xl mt-4">
            Our Official Blog
          </h1>
          <p className="mt-3 text-base text-slate-500 font-medium">
            Stay updated with the latest in electronics, wholesale market trends, tips, and buying guides.
          </p>
        </header>

        {blogs.length === 0 ? (
          <section className="bg-slate-50/50 border border-slate-200 rounded-2xl p-12 text-center max-w-lg mx-auto shadow-none">
            <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-800">No blog posts found</h3>
            <p className="text-slate-500 text-xs mt-2 font-semibold">
              We are working on bringing fresh content to you soon. Please check back later!
            </p>
            <div className="mt-6">
              <Link
                href="/"
                className="inline-block rounded-full bg-primary px-6 py-2.5 text-white text-xs font-bold shadow-none hover:bg-primary/95 transition"
              >
                Back to Home
              </Link>
            </div>
          </section>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-8">
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
                  className="bg-white rounded-sm border border-slate-150 shadow-none hover:border-slate-300 transition-all duration-300 overflow-hidden flex flex-col group"
                >
                  {/* Blog Image */}
                  <div className="relative aspect-video w-full overflow-hidden bg-slate-100">
                    <img
                      src={blog.image || "/not-found-img.webp"}
                      alt={blog.title}
                      className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
                    />
                    {blog.featured && (
                      <span className="absolute top-3 right-3 bg-primary text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-none">
                        Featured
                      </span>
                    )}
                  </div>

                  {/* Blog Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      {/* Meta information */}
                      {formattedDate && (
                        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold mb-2.5">
                          <Calendar size={12} />
                          <span>{formattedDate}</span>
                        </div>
                      )}

                      {/* Title */}
                      <h2 className="text-[17px] font-bold text-slate-800 group-hover:text-primary transition-colors duration-200 line-clamp-2 leading-snug tracking-tight">
                        <Link href={`/blogs/${blog.slug}`}>
                          {blog.title}
                        </Link>
                      </h2>

                      {/* Excerpt */}
                      {blog.excerpt && (
                        <p className="mt-2 text-slate-500 text-xs font-semibold line-clamp-2 leading-relaxed">
                          {blog.excerpt}
                        </p>
                      )}
                    </div>

                    {/* Footer / Link */}
                    <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                      <Link
                        href={`/blogs/${blog.slug}`}
                        className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:text-primary/80 group/link"
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
