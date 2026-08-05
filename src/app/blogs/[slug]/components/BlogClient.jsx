"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import ProductCard1 from "@/components/ProductCard1";
import styles from "@/components/post.module.css";
import { Calendar } from "lucide-react";

export default function BlogClient({ blog }) {
  const formattedDate = blog.createdAt
    ? new Date(blog.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  return (
    <div className="w-full bg-gray-50 min-h-screen py-8">
      <div className="max-w-[1350px] mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
          
          {/* Left Side: Blog Content (Spans 8 cols on desktop) */}
          <article className="lg:col-span-8 bg-white border border-gray-100 rounded-xl p-6 md:p-8 shadow-sm">
            {/* Header Image */}
            {blog.image && (
              <div className="relative aspect-video w-full rounded-lg overflow-hidden mb-6 bg-gray-100 border border-gray-50">
                <img
                  src={blog.image}
                  alt={blog.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Date */}
            {formattedDate && (
              <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-3 font-medium">
                <Calendar size={13} />
                <span>{formattedDate}</span>
              </div>
            )}

            {/* Title */}
            <h1 className="text-2xl md:text-4xl font-extrabold text-gray-900 leading-tight mb-6">
              {blog.title}
            </h1>

            {/* Rich Text Markdown Rendered Body */}
            {blog.content ? (
              <div className="prose max-w-none text-gray-700 leading-relaxed">
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
              <p className="text-gray-500 italic">No content available for this post.</p>
            )}

            {/* FAQs Accordion Section */}
            {blog.faqs && blog.faqs.length > 0 && (
              <div className="mt-12 pt-8 border-t border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h3>
                <div className="space-y-4">
                  {blog.faqs.map((faq, idx) => (
                    <div key={idx} className="bg-gray-50/50 rounded-lg p-4 border border-gray-100">
                      <h4 className="font-semibold text-gray-950 text-base">{faq.question}</h4>
                      <p className="mt-2 text-gray-600 text-sm leading-relaxed">{faq.answer}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </article>

          {/* Right Side: Promoted Products Sidebar (Spans 4 cols on desktop) */}
          <aside 
            className="lg:col-span-4 lg:sticky space-y-4 max-h-[calc(100vh-100px)] overflow-y-auto pr-1"
            style={{
              position: "sticky",
              top: "90px",
            }}
          >
            <h2 className="text-lg font-bold text-gray-900 pb-2 border-b border-gray-200">
              Featured Products
            </h2>

            {blog.promotedProducts && blog.promotedProducts.length > 0 ? (
              <div className="grid grid-cols-2 gap-4">
                {blog.promotedProducts.map((product) => {
                  const badgeData = { color: "bg-red-500" };
                  return (
                    <ProductCard1
                      key={product._id}
                      product={product}
                      badge={badgeData}
                      discount={null}
                    />
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-400 text-sm py-4 text-center">
                No products linked to this post.
              </p>
            )}
          </aside>

        </div>
      </div>
    </div>
  );
}
