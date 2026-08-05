import { getCancellationPolicy } from '@/lib/services/operations/PolicyApi'
import React from 'react'
import ReactMarkdown from 'react-markdown';
import styles from '@/components/post.module.css';
import rehypeRaw from 'rehype-raw';

async function page() {
    const privacyPolicy = await getCancellationPolicy();
    return (
        <div>
            {privacyPolicy &&
                <div>
                    <div className="w-full bg-[#002244] py-12">
                        <div className="max-w-7xl mx-auto px-5 text-center">
                            <h1 className="text-4xl md:text-5xl font-bold text-white">Cancellation Policy</h1>
                            <div className="mt-4 text-blue-100">
                                Last updated: {new Date(privacyPolicy.lastUpdated).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Content section */}
                    <div className="max-w-7xl mx-auto px-5 py-6">
                        <div className="bg-white rounded-sm overflow-hidden border border-gray-100">
                            <div className={`${styles.postStyle} p-6 md:px-10`}>
                                <ReactMarkdown rehypePlugins={[rehypeRaw]}>
                                    {privacyPolicy.content}
                                </ReactMarkdown>
                            </div>
                        </div>
                    </div>
                </div>
            }
        </div>
    )
}

export default page
