"use client";

import { useState } from "react";
import { SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, HelpCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function QuerySheetHeader({ query }) {
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const order = query.orderId; // Full populated order object

  /* ---------------- show‑more helper ---------------- */
    function DescriptionBlock({ description = "" }) {
        const [expanded, setExpanded] = useState(false);
        if (!description) return null;
        const needToggle = description.length > 120;
        const text = expanded ? description : description.slice(0, 120) + (needToggle ? "…" : "");
        return (
            <p className="text-sm text-muted-foreground">
            {text}
            {needToggle && (
                <button onClick={() => setExpanded(!expanded)} className="ml-2 text-primary underline">
                {expanded ? "Show less" : "Show more"}
                </button>
            )}
            </p>
        );
    }

  const StatusPill = ({ resolved }) => (
    <Badge
      variant={resolved ? "success" : "secondary"}
      className={resolved ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"}
    >
      {resolved ? "Resolved" : "Pending"}
    </Badge>
  );

  return (
    <>
      {/* Top Header */}
      <SheetHeader className="p-6 border-b flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <SheetTitle className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5" />
            {query.title}
        </SheetTitle>

        <DescriptionBlock description={query.description} />

        <StatusPill resolved={query.isResolved} />

          {order && (
            <p className="text-sm text-muted-foreground mt-1">
              Order ID:{" "}
              <span className="font-mono font-semibold text-foreground">
                {order.orderId}
              </span>
            </p>
          )}
        </div>

        {order && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowOrderDetails((prev) => !prev)}
            className="w-fit"
          >
            {showOrderDetails ? "Hide Order" : "View Order"}
            {showOrderDetails ? (
              <ChevronUp className="w-4 h-4 ml-2" />
            ) : (
              <ChevronDown className="w-4 h-4 ml-2" />
            )}
          </Button>
        )}
      </SheetHeader>

      {/* Order Info Section */}
      {showOrderDetails && order && (
        <div className="p-6 border-b bg-muted/50 space-y-4">
          <h4 className="text-base font-semibold">Order Details</h4>
          <div className="text-sm space-y-1 leading-6">
            <p>
              <strong>Customer:</strong> {order.name} ({order.phoneNo})
            </p>
            <p>
              <strong>Amount Paid:</strong> ₹{order.orderAmount?.toLocaleString()}
            </p>
            <p>
              <strong>Status:</strong>{" "}
              <span className="font-medium">{order.status}</span>
            </p>
            <p>
              <strong>Address:</strong> {order.address}
            </p>
            <p>
              <strong>Items:</strong>
              <div className="space-y-2">
                {order.items?.map((item, idx) => (
                    <p key={idx}>
                        {idx + 1}. {item.productId?.fullName} - {item?.variantName} x {item.quantity}pcs
                        {idx < order.items.length - 1 && ", "}
                    </p>
                ))}
              </div>
            </p>
          </div>
        </div>
      )}
    </>
  );
}
