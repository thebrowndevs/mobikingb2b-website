import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function checkBusinessVerification(user) {
  const business = user?.business || {};
  const isGstVerified = !!(business.gstNumber);
  const isApproved = !!(business.isApproved && business.active);
  const isVerified = isGstVerified || isApproved;

  return {
    isGstVerified,
    isApproved,
    isVerified,
  };
}
