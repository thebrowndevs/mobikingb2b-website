export const metadata = {
    title: 'Privacy Policy - Mobiking Wholesale',
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
                        "logo": "/miniLogo.png",
                    }),
                }}
            />

            <main className="min-h-[60vh]">{children}</main>

        </div>
    );
}