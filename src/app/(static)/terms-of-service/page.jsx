import { getTermsOfService } from '@/lib/services/operations/PolicyApi';
import React from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';

async function page() {
    const policy = await getTermsOfService();

    if (!policy || !policy.content) {
        return (
            <div className="max-w-[1200px] mx-auto px-6 py-24 text-left">
                <h1 className="text-3xl font-bold text-slate-800 tracking-tighter">Terms of Service Temporarily Unavailable</h1>
                <p className="mt-2 text-slate-500 text-sm font-medium">Please check back in a few moments.</p>
            </div>
        );
    }

    return (
        <div className="max-w-[1200px] mx-auto px-6 py-16">
            
            {/* Title */}
            <h1 className="text-[44px] font-bold text-slate-900 tracking-tighter mb-12">
                {policy.heading || "Terms of Service"}
            </h1>

            {/* Flat Content Section */}
            <div className="max-w-none">
                <article className="prose max-w-none">
                    <ReactMarkdown 
                        rehypePlugins={[rehypeRaw]}
                        components={{
                            p: ({node, ...props}) => (
                                <p className="mb-6 text-[19px] text-slate-600 leading-relaxed font-medium" {...props} />
                            ),
                            h1: ({node, ...props}) => (
                                <h2 className="text-2xl font-bold text-slate-850 tracking-tighter mt-10 mb-4" {...props} />
                            ),
                            h2: ({node, ...props}) => (
                                <h2 className="text-2xl font-bold text-slate-850 tracking-tighter mt-10 mb-4" {...props} />
                            ),
                            h3: ({node, ...props}) => (
                                <h3 className="text-xl font-bold text-slate-850 tracking-tighter mt-8 mb-3" {...props} />
                            ),
                            ul: ({node, ...props}) => (
                                <ul className="list-disc pl-6 mb-6 space-y-2.5 text-[19px] text-slate-600 leading-relaxed font-medium" {...props} />
                            ),
                            ol: ({node, ...props}) => (
                                <ol className="list-decimal pl-6 mb-6 space-y-2.5 text-[19px] text-slate-600 leading-relaxed font-medium" {...props} />
                            ),
                            li: ({node, ...props}) => (
                                <li className="text-[19px] text-slate-600 font-medium" {...props} />
                            ),
                            strong: ({node, ...props}) => (
                                <strong className="font-bold text-slate-850" {...props} />
                            ),
                            a: ({node, ...props}) => (
                                <a className="text-primary font-bold hover:underline" {...props} />
                            )
                        }}
                    >
                        {policy.content}
                    </ReactMarkdown>
                </article>
            </div>
        </div>
    );
}

export default page;
