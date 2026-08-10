"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import styles from "@/components/post.module.css";
import { Calendar, User, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function BlogClient({ blog }) {
  const formattedDate = blog.createdAt
    ? new Date(blog.createdAt).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
    : null;

  return (
    <div className="w-full min-h-screen bg-slate-50/50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        {/* Back Link */}
        <div className="mb-8">
          <Link
            href="/blogs"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-indigo-650 tracking-wider uppercase transition-colors"
          >
            <ArrowLeft size={13} />
            Back to Articles
          </Link>
        </div>

        <article className="w-full">
          {/* Header Metadata Section */}
          <header className="text-center mb-8">
            <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 leading-tight tracking-tight mb-4 capitalize">
              {blog.title}
            </h1>

            <div className="flex items-center justify-center gap-4 text-xs font-semibold text-slate-400 mt-3 uppercase tracking-wide">
              {formattedDate && (
                <div className="flex items-center gap-1.5">
                  <Calendar size={13} className="opacity-80" />
                  <span>{formattedDate}</span>
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <User size={13} className="opacity-80" />
                <span>By {blog.author || "Admin"}</span>
              </div>
            </div>
          </header>

          {/* Main Feature Image */}
          {blog.image && (
            <div className="relative aspect-video w-full rounded-sm overflow-hidden mb-10 bg-slate-100 border border-slate-200">
              <img
                src={blog.image}
                alt={blog.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Editorial Content */}
          {blog.content ? (
            <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed text-sm sm:text-base">
              <div className={`${styles.postStyle}`}>
                <ReactMarkdown
                  rehypePlugins={[rehypeRaw]}
                  remarkPlugins={[remarkGfm]}
                >
                  {blog.content}
                </ReactMarkdown>
              </div>
            </div>
          ) : (
            <p className="text-slate-400 italic text-center py-10">No content available for this post.</p>
          )}

          {/* FAQs Section */}
          {blog.faqs && blog.faqs.length > 0 && (
            <div className="mt-14 pt-8 border-t border-slate-200">
              <h3 className="text-xl font-bold text-slate-900 tracking-tight mb-6 text-center uppercase">
                Frequently Asked Questions
              </h3>
              <div className="space-y-4">
                {blog.faqs.map((faq, idx) => (
                  <div
                    key={idx}
                    className="bg-white rounded-sm p-5 border border-slate-200"
                  >
                    <h4 className="font-bold text-slate-800 text-sm sm:text-base">
                      {faq.question}
                    </h4>
                    <p className="mt-2.5 text-slate-500 text-xs sm:text-sm font-medium leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </article>
      </div>
    </div>
  );
}
