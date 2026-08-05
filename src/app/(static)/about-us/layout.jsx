export const metadata = {
    title: 'About Us - Mobiking Wholesale',
    description:
        'Mobiking Wholesale — India\'s trusted wholesale supplier of headphones, earbuds, speakers and electronic accessories. Best prices, bulk deals, fast shipping.',
};

export default function layout({ children }) {
    return (
        <div className="bg-gray-50 text-gray-900">
            {/* Organization JSON-LD for SEO */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "Organization",
                        "name": "Mobiking Wholesale",
                        "url": "https://www.mobikingwholesale.com",
                        "sameAs": [],
                        "logo": "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=60",
                    }),
                }}
            />

            <main className="min-h-[60vh]">{children}</main>

        </div>
    );
}