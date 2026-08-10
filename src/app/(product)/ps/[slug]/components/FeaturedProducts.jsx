import ProductCard1 from "@/components/ProductCard1";

export default function FeaturedProducts({ title = "Featured Products", products = [] }) {
    const getBadgeType = (product) => {
        if (product.newArrival) return { text: "NEW", color: "bg-blue-500" };
        if (product.bestSeller) return { text: "BESTSELLER", color: "bg-purple-500" };
        if (product.recommended) return { text: "RECOMMENDED", color: "bg-green-500" };
        return { text: "20% OFF", color: "bg-red-500" };
    };

    const calculateDiscount = (product) => {
        if (product.sellingPrice?.length > 1) {
            const original = product.sellingPrice[0].price;
            const discounted = product.sellingPrice[1].price;
            return Math.round(((original - discounted) / original) * 100);
        }
        return null;
    };

    return (
        <section className="py-10 border-t-1 border-gray-300 lg:max-w-[90%] lg:mx-auto px-4">
            <h2 className="text-2xl lg:text-3xl font-semibold mb-9 lg:mb-10 uppercase text-center">Explore {title}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 w-full">
                {products.map((product) => {
                    const badge = getBadgeType(product);
                    const discount = calculateDiscount(product);

                    return (
                        <div key={product._id} className="h-full">
                            <ProductCard1
                                product={product}
                                badge={badge}
                                discount={discount}
                            />
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
