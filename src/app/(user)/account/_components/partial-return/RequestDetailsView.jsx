'use client';

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, FileText, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import ReturnOrderDetails from "./ReturnOrderDetails";
import RequestChatSection from "./RequestChatSection";

export default function RequestDetailsView({ request, onBack, accessToken, onRefreshRequest }) {
  if (!request) return null;

  const status = request.status || "Pending";
  const items = request.items || [];
  const returnOrder = request.returnOrderRef;

  const formattedDate = request.createdAt
    ? new Date(request.createdAt).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
    : "—";

  return (
    <div className="space-y-6 pb-6">
      {/* Back Button */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="text-xs gap-1.5 h-8 px-2.5 -ml-1 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to list
        </Button>
      </div>

      {/* Main Request Status Info Header */}
      <div className="border bg-gray-50/50 p-4 rounded-xl space-y-2.5 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-semibold">
            <Calendar className="w-3.5 h-3.5" /> {formattedDate}
          </div>
          <Badge
            className={
              status === "Accepted"
                ? "bg-green-100 text-green-800 hover:bg-green-100 border-green-200"
                : status === "Rejected"
                  ? "bg-red-100 text-red-800 hover:bg-red-100 border-red-200"
                  : "bg-amber-100 text-amber-800 hover:bg-amber-100 border-amber-200"
            }
          >
            {status}
          </Badge>
        </div>

        <div className="text-xs">
          <span className="font-bold text-muted-foreground uppercase text-[10px] tracking-wide block mb-0.5">
            Return Reason
          </span>
          <p className="text-sm font-semibold text-foreground bg-white border p-2.5 rounded-lg">
            {request.reason}
          </p>
        </div>
      </div>

      {/* Conditionally render Return Order Details vs Request Selected Items */}
      {status === "Accepted" && returnOrder ? (
        <ReturnOrderDetails returnOrder={returnOrder} reason={request.reason} />
      ) : (
        <div className="space-y-3">
          <h3 className="font-bold text-base text-foreground border-b pb-1">
            Items Selected for Return
          </h3>
          <div className="space-y-3">
            {items.map((it, idx) => (
              <div key={idx} className="flex gap-4 items-start bg-white p-3 rounded-lg border shadow-sm">
                <img
                  src={it.productId?.images?.[0] || "/placeholder.png"}
                  alt={it.fullName}
                  className="w-12 h-12 object-contain bg-gray-50 rounded border shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-xs text-foreground truncate">
                    {it.fullName}
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
      )}

      {/* Support Chat Thread (for Pending requests) */}
      {(status === "Pending" || request.replies?.length > 0) && (
        <RequestChatSection
          requestId={request._id}
          replies={request.replies || []}
          accessToken={accessToken}
          onRefreshRequest={onRefreshRequest}
        />
      )}
    </div>
  );
}
