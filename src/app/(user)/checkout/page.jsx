"use client";

import CheckoutPageV1 from "./CheckoutPageV1";
import CheckoutPageV2 from "./CheckoutPageV2";

export default function Page() {
  // To toggle between V1 (Original Razorpay Overlay) and V2 (Unified gateway routing),
  // comment / uncomment the lines below:

  // return <CheckoutPageV1 />;
  return <CheckoutPageV2 />;
}
