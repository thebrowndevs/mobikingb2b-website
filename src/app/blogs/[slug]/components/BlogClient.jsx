"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
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
    <div className="w-full min-h-screen py-12">
      <div className="max-w-[1000px] mx-auto px-4 md:px-6">
        <article className="bg-white border border-slate-150 rounded-2xl p-6 md:p-10 shadow-none">
          {/* Header Image */}
          {blog.image && (
            <div className="relative aspect-video w-full rounded-xl overflow-hidden mb-8 bg-slate-50 border border-slate-100">
              <img
                src={blog.image}
                alt={blog.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Date */}
          {formattedDate && (
            <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-4 font-semibold">
              <Calendar size={13} />
              <span>{formattedDate}</span>
            </div>
          )}

          {/* Title */}
          <h1 className="text-2xl md:text-4xl font-bold text-slate-800 leading-tight mb-8 tracking-tighter">
            {blog.title}
          </h1>

          {/* Rich Text Markdown Rendered Body */}
          {blog.content ? (
            <div className="prose max-w-none text-slate-650 leading-relaxed font-normal">
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
            <p className="text-slate-400 italic">No content available for this post.</p>
          )}

          {/* FAQs Accordion Section */}
          {blog.faqs && blog.faqs.length > 0 && (
            <div className="mt-16 pt-8 border-t border-slate-100">
              <h3 className="text-xl font-bold text-slate-800 tracking-tight mb-6">Frequently Asked Questions</h3>
              <div className="space-y-4">
                {blog.faqs.map((faq, idx) => (
                  <div key={idx} className="bg-slate-50/50 rounded-xl p-5 border border-slate-150 shadow-none">
                    <h4 className="font-bold text-slate-800 text-base">{faq.question}</h4>
                    <p className="mt-2 text-slate-500 text-xs font-semibold leading-relaxed">{faq.answer}</p>
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
