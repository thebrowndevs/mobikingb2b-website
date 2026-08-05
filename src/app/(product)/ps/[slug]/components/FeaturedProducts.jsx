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
        <section className="py-10">
            <h2 className="text-xl lg:text-2xl font-bold mb-5 px-2 sm:px-4 lg:px-8 max-[500px]:text-center max-[500px]:border max-[500px]:py-3 max-[500px]:mx-4 max-[500px]:bg-white max-[500px]:border-black max-[500px]:rounded-sm">Explore {title}</h2>
            <div className="overflow-x-auto px-4 sm:px-0">
                <div className="grid grid-flow-col grid-rows-2 max-w-[95vw] mx-auto sm:grid-rows-1 gap-2 lg:grid-cols-7 lg:grid-flow-row">
                    {products.map((product) => {
                        const badge = getBadgeType(product);
                        const discount = calculateDiscount(product);

                        return (
                            <div key={product._id} className=" h-full">
                                <ProductCard1
                                    product={product}
                                    badge={badge}
                                    discount={discount}
                                />
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
