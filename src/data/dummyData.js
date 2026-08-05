export const cartItems = [
  {
    _id: "665900001234567890abc001",
    userId: "665800001234567890abc111", // hypothetical user ID
    items: [
      {
        productId: "665800001234567890abc001", // Nova Z5 Smartphone
        variantId: "6657205e409a9e5b65b91c2e", // 256GB Cosmic Gray
        quantity: 2,
        price: 799,
        name: "Smartphone Nova Z5 - 256GB, Cosmic Gray",
        image:
          "https://cdn.grofers.com/cdn-cgi/image/f=auto,fit=scale-down,q=70,metadata=none,w=360/da/cms-assets/cms/product/350ef0eb-1bf7-4756-a2d2-323cac44c62b.jpg?ts=1735922893",
      },
      {
        productId: "665800001234567890abc001", // Nova Z5 Smartphone
        variantId: "6657205e409a9e5b65b91c2f", // 128GB Cosmic Gray
        quantity: 7,
        price: 699,
        name: "Smartphone Nova Z5 - 128GB, Cosmic Gray",
        image:
          "https://cdn.grofers.com/cdn-cgi/image/f=auto,fit=scale-down,q=70,metadata=none,w=360/da/cms-assets/cms/product/350ef0eb-1bf7-4756-a2d2-323cac44c62b.jpg?ts=1735922893",
      },
      {
        productId: "665800001234567890abc001", // Nova Z5 Smartphone
        variantId: "6657205e409a9e5b65b91c2f", // 128GB Cosmic Gray
        quantity: 1,
        price: 699,
        name: "Smartphone Nova Z5 - 128GB, Cosmic Gray",
        image:
          "https://cdn.grofers.com/cdn-cgi/image/f=auto,fit=scale-down,q=70,metadata=none,w=360/da/cms-assets/cms/product/350ef0eb-1bf7-4756-a2d2-323cac44c62b.jpg?ts=1735922893",
      },
      {
        productId: "665800001234567890abc001", // Nova Z5 Smartphone
        variantId: "6657205e409a9e5b65b91c2f", // 128GB Cosmic Gray
        quantity: 1,
        price: 699,
        name: "Smartphone Nova Z5 - 128GB, Cosmic Gray",
        image:
          "https://cdn.grofers.com/cdn-cgi/image/f=auto,fit=scale-down,q=70,metadata=none,w=360/da/cms-assets/cms/product/350ef0eb-1bf7-4756-a2d2-323cac44c62b.jpg?ts=1735922893",
      },
    ],
    totalItems: 9,
    totalPrice: 6291, // (799*2) + 699
    createdAt: new Date("2023-06-01T10:00:00Z"),
    updatedAt: new Date("2023-06-01T10:30:00Z"),
  },
  {
    _id: "665900001234567890abc002",
    userId: "665800001234567890abc112", // another user
    items: [
      {
        productId: "665800001234567890abc001", // Nova Z5 Smartphone
        variantId: "6657205e409a9e5b65b91c2f", // 128GB Cosmic Gray
        quantity: 1,
        price: 699,
        name: "Smartphone Nova Z5 - 128GB, Cosmic Gray",
        image:
          "https://cdn.grofers.com/cdn-cgi/image/f=auto,fit=scale-down,q=70,metadata=none,w=360/da/cms-assets/cms/product/350ef0eb-1bf7-4756-a2d2-323cac44c62b.jpg?ts=1735922893",
      },
    ],
    totalItems: 1,
    totalPrice: 699,
    createdAt: new Date("2023-06-02T11:00:00Z"),
    updatedAt: new Date("2023-06-02T11:00:00Z"),
  },
];

export const stockData = [
  {
    _id: "6657205e409a9e5b65b91c2e",
    variantName: "256GB Cosmic Gray",
    purchasePrice: 550,
    quantity: "25",
    productId: "665800001234567890abc001",
    createdAt: new Date("2023-05-15T10:00:00Z"),
    updatedAt: new Date("2023-05-15T10:00:00Z"),
  },
  {
    _id: "6657205e409a9e5b65b91c2f",
    variantName: "128GB Cosmic Gray",
    purchasePrice: 500,
    quantity: "18",
    productId: "665800001234567890abc001",
    createdAt: new Date("2023-05-15T10:00:00Z"),
    updatedAt: new Date("2023-05-20T09:30:00Z"),
  },
];

export const productSingle = [
  {
    _id: "665800001234567890abc001",
    name: "Smartphone Nova Z5",
    brand: "Nova",
    productImage: [
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT31y7OlfN7OpPHPLzl_2MDPNAw9V6fjLUeIg&s",
      "https://ivenus.in/wp-content/uploads/2024/09/iPhone_16_Pro_Natural_Titanium_PDP_Image_Position_1__en-IN-scaled.jpg",
      "https://inventstore.in/wp-content/uploads/2024/07/63.webp",
    ],
    fullName: "Nova Z5 Smartphone",
    slug: "nova-z5-smartphone",
    description:
      'The Nova Z5 combines cutting-edge technology with elegant design, featuring a 6.7" AMOLED display, 108MP triple camera system, and 2-day battery life. Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.Clita vero ut nonumy sit nonumy rebum voluptua sed sed. Voluptua lorem dolor duo nonumy et nonumy. Stet lorem sanctus. ',
    highlights: [
      '6.7" 120Hz AMOLED Display',
      "108MP Professional Camera System",
      "5000mAh All-Day Battery",
      "Snapdragon 8 Gen 2 Processor",
      "5G Connectivity",
    ],
    specifications: {
      display: '6.7" AMOLED, 2400×1080, 120Hz',
      processor: "Snapdragon 8 Gen 2",
      memory: "8GB RAM",
      storage: "128GB/256GB",
      cameras: "108MP main + 12MP ultra-wide + 8MP telephoto",
      battery: "5000mAh with 65W fast charging",
      os: "Android 13 with Nova UI",
    },
    active: true,
    newArrival: true,
    liked: true,
    bestSeller: true,
    recommended: true,
    rating: 4.8,
    reviewCount: 124,
    sellingPrice: [
      { variant: "128GB", price: 699 },
      { variant: "256GB", price: 799 },
    ],
    originalPrice: 899,
    discount: 15,
    category: "66571db128e6d9e8e7f5d6b1",
    categorySlug: "electronics",
    stock: ["6657205e409a9e5b65b91c2e", "6657205e409a9e5b65b91c2f"],
    variants: [
      {
        id: "6657205e409a9e5b65b91c2e",
        name: "256GB Cosmic Gray",
        price: 799,
      },
      {
        id: "6657205e409a9e5b65b91c2f",
        name: "128GB Cosmic Gray",
        price: 699,
      },
    ],
    orders: [],
    shippingInfo: {
      weight: "0.2kg",
      dimensions: "16.3 x 7.5 x 0.8 cm",
      freeShipping: true,
      deliveryTime: "2-3 business days",
    },
    warranty: "2 years manufacturer warranty",
    createdAt: new Date("2023-05-10T09:00:00Z"),
    updatedAt: new Date("2023-05-28T14:30:00Z"),
  },
];

export const products = [
  {
    _id: "665800001234567890abc001",
    name: "Smartphone Nova Z5",
    productImage: [
      "https://cdn.grofers.com/cdn-cgi/image/f=auto,fit=scale-down,q=70,metadata=none,w=360/da/cms-assets/cms/product/350ef0eb-1bf7-4756-a2d2-323cac44c62b.jpg?ts=1735922893",
    ],
    fullName: "Smartphone Nova Z5 - 256GB, Cosmic Gray",
    slug: "nova-z5-smartphone",
    description:
      'The Nova Z5 combines cutting-edge technology with elegant design, featuring a 6.7" AMOLED display, 108MP triple camera system, and 2-day battery life.',
    active: true,
    newArrival: false,
    liked: true,
    bestSeller: false,
    recommended: false,
    sellingPrice: [{ price: 799 }, { price: 699 }],
    category: "66571db128e6d9e8e7f5d6b1", // electronics
    categorySlug: "electronics",
    stock: ["6657205e409a9e5b65b91c2e", "6657205e409a9e5b65b91c2f"],
    orders: [],
    groups: ["665800001234567890abcddb", "665800001234567890abcddc"],
  },
  {
    _id: "665800001234567890abc002",
    name: "Smartwatch S2",
    productImage: [
      "https://cdn.grofers.com/cdn-cgi/image/f=auto,fit=scale-down,q=70,metadata=none,w=360/da/cms-assets/cms/product/51b50903-3056-4467-b99c-1050d545f05c.jpg?ts=1734682127",
    ],
    fullName: "Smartwatch S2 - Fitness Edition",
    slug: "smartwatch-s2-fitness-edition",
    description: "Fitness-focused smartwatch with GPS and heart-rate tracking.",
    active: true,
    newArrival: false,
    liked: true,
    bestSeller: false,
    recommended: true,
    sellingPrice: [{ price: 149.99 }],
    category: "66571db128e6d9e8e7f5d6b1",
    categorySlug: "electronics",
    stock: ["6657207f409a9e5b65b91c30"],
    orders: ["665720a3409a9e5b65b91c32"],
    groups: ["665800001234567890abcddb"],
  },
  {
    _id: "665800001234567890abc003",
    name: "Gaming Laptop GX15",
    productImage: ["https://picsum.photos/seed/laptop/200/300"],
    fullName: "Gaming Laptop GX15 - RTX 4060, 16GB RAM",
    slug: "gaming-laptop-gx15-rtx4060-16gb",
    description: "High-performance gaming laptop for smooth 144Hz gameplay.",
    active: true,
    newArrival: false,
    liked: false,
    bestSeller: true,
    recommended: true,
    sellingPrice: [{ price: 1299 }, { price: 1149 }],
    category: "66571db128e6d9e8e7f5d6b1",
    categorySlug: "electronics",
    stock: ["6657207f409a9e5b65b91c30"],
    orders: ["665720a3409a9e5b65b91c32"],
    groups: ["665800001234567890abcddb"],
  },
  {
    _id: "665800001234567890abc004",
    name: "Wireless Earbuds AirGo",
    productImage: ["https://picsum.photos/seed/earbuds/200/300"],
    fullName: "Wireless Earbuds AirGo - Noise Canceling",
    slug: "wireless-earbuds-airgo-noise-canceling",
    description: "Compact earbuds with powerful bass and ANC.",
    active: true,
    newArrival: true,
    liked: true,
    bestSeller: false,
    recommended: false,
    sellingPrice: [{ price: 89.99 }],
    category: "66571db128e6d9e8e7f5d6b1",
    categorySlug: "electronics",
    stock: ["6657207f409a9e5b65b91c30"],
    orders: [],
    groups: ["665800001234567890abcddb"],
  },
  {
    _id: "665800001234567890abc005",
    name: "Leather Wallet Classic",
    productImage: ["https://picsum.photos/seed/wallet/200/300"],
    fullName: "Men's Genuine Leather Wallet - Classic Brown",
    slug: "mens-genuine-leather-wallet-classic-brown",
    description: "Stylish leather wallet with RFID protection.",
    active: true,
    newArrival: false,
    liked: false,
    bestSeller: false,
    recommended: false,
    sellingPrice: [{ price: 49.99 }],
    category: "66571db128e6d9e8e7f5d6b2",
    categorySlug: "fashion-accessories",
    stock: ["6657207f409a9e5b65b91c30"],
    orders: [],
    groups: ["665800001234567890abcddf"],
  },
  {
    _id: "665800001234567890abc006",
    name: "Women's Handbag Luxa",
    productImage: ["https://picsum.photos/seed/handbag/200/300"],
    fullName: "Women's Luxa Leather Handbag - Black",
    slug: "womens-luxa-leather-handbag-black",
    description: "Elegant and spacious handbag made from premium leather.",
    active: true,
    newArrival: true,
    liked: true,
    bestSeller: false,
    recommended: true,
    sellingPrice: [{ price: 189.99 }],
    category: "66571db128e6d9e8e7f5d6b2",
    categorySlug: "fashion-accessories",
    stock: ["6657207f409a9e5b65b91c30"],
    orders: [],
    groups: ["665800001234567890abcddf"],
  },
  {
    _id: "665800001234567890abc007",
    name: "Casual Sneakers NeoWalk",
    productImage: ["https://picsum.photos/seed/sneakers/200/300"],
    fullName: "NeoWalk Sneakers - White/Blue",
    slug: "neowalk-sneakers-white-blue",
    description: "Comfortable sneakers for everyday walking and light running.",
    active: true,
    newArrival: true,
    liked: true,
    bestSeller: true,
    recommended: false,
    sellingPrice: [{ price: 79.5 }],
    category: "66571db128e6d9e8e7f5d6b2",
    categorySlug: "fashion-accessories",
    stock: ["6657207f409a9e5b65b91c30"],
    orders: [],
    groups: [],
  },
  {
    _id: "665800001234567890abc008",
    name: "4K Smart TV UltraView",
    productImage: ["https://picsum.photos/seed/tv/200/300"],
    fullName: 'UltraView 55" 4K Smart TV - HDR10, Dolby Vision',
    slug: "ultraview-55inch-4k-smart-tv",
    description:
      "Cinematic entertainment experience with smart streaming features.",
    active: true,
    newArrival: false,
    liked: false,
    bestSeller: true,
    recommended: true,
    sellingPrice: [{ price: 499.99 }],
    category: "66571db128e6d9e8e7f5d6b1",
    categorySlug: "electronics",
    stock: ["6657205e409a9e5b65b91c2e"],
    orders: [],
    groups: ["665800001234567890abcddb", "665800001234567890abcddc"],
  },
];

export const groups = [
  {
    _id: "665800001234567890abcddb",
    name: "Electronics Deals",
    sequenceNo: 2,
    banner: "https://picsum.photos/seed/electronics/800/200",
    active: true,
    products: [
      "665800001234567890abc001",
      "665800001234567890abc002",
      "665800001234567890abc003",
      "665800001234567890abc004",
      "665800001234567890abc008",
    ],
  },
  {
    _id: "665800001234567890abcddc",
    name: "Top Rated Gadgets",
    sequenceNo: 1,
    banner: "https://picsum.photos/seed/gadgets/800/200",
    active: true,
    products: ["665800001234567890abc001", "665800001234567890abc008"],
  },
  {
    _id: "665800001234567890abcddf",
    name: "Style Picks",
    sequenceNo: 3,
    banner: "https://picsum.photos/seed/fashion/800/200",
    active: true,
    products: ["665800001234567890abc005", "665800001234567890abc006"],
  },
];

export const banners = [
  {
    _id: "665800001234567890abcddb",
    image:
      "https://img.freepik.com/free-vector/electronics-store-facebook-cover-template_23-2151168350.jpg?semt=ais_items_boosted&w=740",
    link: "#",
    sequenceNo: 1,
  },
];

export const banner1 = [
  {
    _id: "665800001234567890abcddb",
    image:
      "https://img.freepik.com/free-vector/electronics-store-template-design_23-2151143835.jpg?semt=ais_items_boosted&w=740",
    link: "#",
    sequenceNo: 1,
  },
  {
    _id: "665800001234567890abcddc",
    image:
      "https://img.freepik.com/free-vector/electronics-store-template-design_23-2151143835.jpg?semt=ais_items_boosted&w=740",
    link: "#",
    sequenceNo: 2,
  },
  {
    _id: "665800001234567890abcddc",
    image:
      "https://img.freepik.com/free-vector/electronics-store-template-design_23-2151143835.jpg?semt=ais_items_boosted&w=740",
    link: "#",
    sequenceNo: 3,
  },
];
