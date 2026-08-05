import { Button } from '@/components/ui/button';
import React, { useState } from 'react'
import ReactMarkdown from 'react-markdown';
import styles from './post.module.css';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm'; // Import the plugin

function ProductInfoBlock({ description }) {
    const [showMore, setShowMore] = useState(false);

    return (
        <div>
            {/* <h1 className="text-xl font-bold text-gray-800 lg:text-2xl">
                {fullName}
            </h1> */}
            {description && (
                <div className="">
                    {/* <h3 className="text-sm font-semibold text-gray-800">Description</h3> */}
                    {/* <div className="prose prose-sm mt-2 max-w-none text-gray-600">
                        {description.length > 200 && !showMore
                            ? `${description.slice(0, 100)}...`
                            : description}
                    </div> */}

                    <div className="prose max-w-none text-gray-700 leading-relaxed">
                        <div className={`${styles.postStyle}`}>
                            <ReactMarkdown
                                rehypePlugins={[rehypeRaw]}
                                remarkPlugins={[remarkGfm]}
                            >
                                {description}
                            </ReactMarkdown>
                        </div>
                    </div>

                    {/* {description.length > 200 && (
                        <Button
                            variant="link"
                            className="px-0"
                            onClick={() => setShowMore(!showMore)}
                        >
                            {showMore ? "Show Less" : "Show More"}
                        </Button>
                    )} */}
                </div>
            )}
        </div>
    );
}

export default ProductInfoBlock