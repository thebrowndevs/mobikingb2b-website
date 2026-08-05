'use client';

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default function ReturnOrderDetails({ returnOrder, reason }) {
  if (!returnOrder) return null;

  // Calculate totals
  const subtotal = returnOrder.subtotal || returnOrder.subTotal || 0;
  const discount = returnOrder.discount || 0;
  const deliveryCharge = returnOrder.deliveryCharge || 0;
  const totalAmount = returnOrder.orderAmount || returnOrder.totalAmount || 0;

  // Address
  const address = returnOrder.addressId || returnOrder.address || {};
  const addressString = [
    address.street1,
    address.street2,
    address.city,
    address.state,
    address.pinCode || address.pincode,
  ]
    .filter(Boolean)
    .join(", ");

  // Tracking scans
  const scans = returnOrder.scans || returnOrder.returnScans || [];

  return (
    <div className="space-y-6 text-sm">
      {/* Reason */}
      {reason && (
        <div>
          <span className="text-xs font-bold text-red-600 uppercase tracking-wider underline">
            Reason:
          </span>
          <span className="ml-1 text-sm font-semibold text-gray-900 uppercase">
            {reason}
          </span>
        </div>
      )}

      {/* Amount Summary */}
      <div className="space-y-2">
        <h3 className="font-bold text-base text-foreground border-b pb-1">
          Amount Summary
        </h3>
        {returnOrder.coupon && (
          <div className="mb-2">
            <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-emerald-200">
              Coupon Applied: {returnOrder.coupon?.code || returnOrder.coupon}
            </Badge>
          </div>
        )}
        <div className="space-y-1.5 text-xs">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-medium">₹{subtotal.toLocaleString()}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-emerald-600">
              <span>Discount</span>
              <span className="font-medium">- ₹{discount.toLocaleString()}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-muted-foreground">Delivery</span>
            <span className="font-medium">₹{deliveryCharge.toLocaleString()}</span>
          </div>
          <Separator className="my-1.5" />
          <div className="flex justify-between text-sm font-bold">
            <span>Total Paid</span>
            <span>₹{totalAmount.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Shipping Details */}
      <div className="space-y-2">
        <h3 className="font-bold text-base text-foreground border-b pb-1">
          Shipping Details
        </h3>
        <div className="space-y-1 text-xs">
          <p>
            <span className="font-bold">Name:</span> {returnOrder.name || "—"}
          </p>
          <p>
            <span className="font-bold">Address:</span> {addressString || "—"}
          </p>
          <p>
            <span className="font-bold">Phone:</span> {returnOrder.phoneNo || "—"}
          </p>
          <p>
            <span className="font-bold">Shipping Status:</span>{" "}
            <span className="uppercase font-bold text-primary">
              {returnOrder.shippingStatus || returnOrder.status || "—"}
            </span>
          </p>
          <p>
            <span className="font-bold">Courier:</span> {returnOrder.courierName || "—"}
          </p>
          <p>
            <span className="font-bold">AWB Code:</span> {returnOrder.awbCode || "—"}
          </p>
          {returnOrder.expectedDelivery && (
            <p>
              <span className="font-bold">Expected Delivery:</span>{" "}
              {new Date(returnOrder.expectedDelivery).toLocaleString("en-IN")}
            </p>
          )}
        </div>
      </div>

      {/* Tracking Details / Timeline Logs */}
      {returnOrder.awbCode && (
        <div className="space-y-3">
          <h3 className="font-bold text-base text-foreground border-b pb-1">
            Tracking Details
          </h3>
          <div className="space-y-1 text-xs text-muted-foreground mb-4">
            <p>Order ID: <span className="font-bold text-foreground">{returnOrder.orderId}</span></p>
            <p>Shipping Status: <Badge className="bg-primary/10 text-primary uppercase ml-1">{returnOrder.shippingStatus || returnOrder.status}</Badge></p>
            <p>AWB Code: <span className="font-mono text-foreground font-semibold">{returnOrder.awbCode}</span></p>
            <p>Courier: <span className="text-foreground font-semibold">{returnOrder.courierName}</span></p>
          </div>

          <div className="relative pl-6 border-l border-dashed border-gray-300 space-y-5">
            {scans.length === 0 ? (
              <div className="text-xs text-muted-foreground italic py-1 pl-1">
                No tracking timeline logs available yet.
              </div>
            ) : (
              scans.map((scan, sIdx) => {
                const dateStr = scan.date || scan.timestamp || "";
                const formattedDate = dateStr
                  ? `${new Date(dateStr).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "numeric",
                      year: "numeric",
                    })}, ${new Date(dateStr).toLocaleTimeString("en-IN", {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    })}`
                  : "";

                return (
                  <div key={sIdx} className="relative">
                    {/* Circle Node */}
                    <div className="absolute -left-[31px] top-0.5 bg-primary w-2.5 h-2.5 rounded-full border-2 border-white ring-4 ring-primary/20" />
                    <div>
                      <span className="text-[10px] text-muted-foreground font-medium block">
                        {formattedDate}
                      </span>
                      <h4 className="text-xs font-bold text-foreground uppercase mt-0.5">
                        {scan.status || scan.activity || "Shipment Update"}
                      </h4>
                      {(scan.location || scan.location_name) && (
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          📍 {scan.location || scan.location_name}
                        </p>
                      )}
                      {(scan.status_details || scan.activity_details) && (
                        <p className="text-[10px] text-primary/80 font-medium mt-0.5">
                          Status: {scan.status_details || scan.activity_details}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Items */}
      <div className="space-y-3">
        <h3 className="font-bold text-base text-foreground border-b pb-1">
          Items
        </h3>
        <div className="space-y-3">
          {returnOrder.items?.map((it, idx) => (
            <div key={idx} className="flex gap-4 items-start bg-gray-50/50 p-3 rounded-lg border">
              <img
                src={it.productId?.images?.[0] || "/placeholder.png"}
                alt={it.name || it.fullName}
                className="w-12 h-12 object-contain bg-white rounded border shrink-0"
              />
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-xs text-foreground truncate">
                  {it.name || it.fullName}
                </h4>
                {it.variantName && (
                  <p className="text-[10px] text-muted-foreground capitalize mt-0.5">
                    Variant: {it.variantName}
                  </p>
                )}
                <div className="flex justify-between items-center mt-1 text-xs">
                  <span className="text-muted-foreground">Qty: {it.quantity}</span>
                  <span className="font-bold text-foreground">₹{it.price?.toLocaleString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
