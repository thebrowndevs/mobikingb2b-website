'use client';

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Loader2, Minus, Plus, RefreshCw } from "lucide-react";
import { placePartialReturnRequest } from "@/lib/services/operations/OrderApi";
import { toast } from "sonner";

const PARTIAL_RETURN_REASONS = [
  "Defective / Damaged Item",
  "Received Wrong Variant or Model",
  "Item No Longer Needed",
  "Quality Not as Expected",
  "Other"
];

export default function PartialReturnModal({ open, onOpenChange, order, refreshOrder, accessToken, closeSheet }) {
  const [selectedItems, setSelectedItems] = useState({});
  const [quantities, setQuantities] = useState({});
  const [reason, setReason] = useState("");
  const [otherReason, setOtherReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open && order?.items) {
      const initialItems = {};
      const initialQty = {};

      order?.items?.forEach((it, index, arr) => {
        const key = index || it._id || it.sku || it.productId?._id;
        initialItems[key] = false;
        initialQty[key] = 1;
        arr[index] = { ...arr[index], index }
      });
      // console.log("arr", order?.items)

      setSelectedItems(initialItems);
      setQuantities(initialQty);
      setReason("");
      setOtherReason("");
    }
  }, [open, order]);

  if (!open || !order) return null;

  const toggleItemSelect = (key) => {
    setSelectedItems(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleQtyChange = (key, maxQty, delta) => {
    setQuantities(prev => {
      const current = prev[key] || 1;
      const next = Math.max(1, Math.min(maxQty, current + delta));
      return { ...prev, [key]: next };
    });
  };

  const selectedKeys = Object.keys(selectedItems).filter(k => selectedItems[k]);
  const finalReason = reason === "Other" ? otherReason.trim() : reason;

  const canSubmit = selectedKeys.length > 0 && finalReason && (reason !== "Other" || otherReason.trim().length >= 3) && !submitting;

  const handleSubmit = async () => {
    if (!canSubmit) return;

    try {
      setSubmitting(true);

      const itemsToReturn = order.items
        .filter((it, index) => {
          const key = index || it._id || it.sku || it.productId?._id;
          return selectedItems[key];
        })
      // .map(it => {
      //   const key = it._id || it.sku || it.productId?._id;
      //   return {
      //     _id: it._id,
      //     productId: it.productId?._id || it.productId,
      //     sku: it.sku,
      //     fullName: it.fullName || it.productId?.fullName,
      //     variantName: it.variantName,
      //     quantity: quantities[key] || 1,
      //     price: it.price
      //   };
      // });

      const payload = {
        orderId: order._id,
        reason: finalReason,
        items: itemsToReturn
      };

      // console.log("payload", payload);
      // return;
      const res = await placePartialReturnRequest(accessToken, payload);

      if (res?.success) {
        toast.success("Partial return request raised successfully!");
        if (res.data?.order) refreshOrder(res.data.order);
        onOpenChange(false);
        if (closeSheet) closeSheet();
      } else {
        toast.error(res?.error || "Could not raise partial return request");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to place partial return request");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] flex flex-col p-6 overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-bold">
            <RefreshCw className="w-5 h-5 text-primary" /> Select Items for Return
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Order ID: <span className="font-mono font-semibold text-foreground">{order.orderId}</span>. Select items and quantities you wish to return.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4 my-2 pr-1">
          {/* Items Checklist */}
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase text-muted-foreground tracking-wide">Order Items</label>
            {order.items.map((it) => {
              const key = it.index || it._id || it.sku || it.productId?._id;
              const isAlreadyReturned = it.isReturned || (it.returnStatus && it.returnStatus !== "Rejected")
              // it.returnStatus === "Returned" || it.returnStatus === "Pending" || it.returnStatus === "Accepted" || it.partialReturnRequest;
              const isChecked = Boolean(selectedItems[key]);
              const currentQty = quantities[key] || 1;

              return (
                <div
                  key={key}
                  className={`flex items-start gap-3 p-3 rounded-lg border text-sm transition-colors ${isAlreadyReturned
                    ? "bg-gray-50 opacity-60 cursor-not-allowed"
                    : isChecked
                      ? "border-primary bg-primary/5"
                      : "bg-white border-gray-200 hover:border-gray-300"
                    }`}
                >
                  <input
                    type="checkbox"
                    id={`item-${key}`}
                    checked={isChecked}
                    disabled={isAlreadyReturned}
                    onChange={() => toggleItemSelect(key)}
                    className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary mt-1 accent-primary cursor-pointer disabled:cursor-not-allowed"
                  />

                  <div className="flex-1 min-w-0">
                    <label htmlFor={`item-${key}`} className="font-medium text-foreground cursor-pointer block truncate">
                      {it.fullName || it.productId?.fullName}
                    </label>

                    <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-muted-foreground">
                      {it.variantName && <span>Variant: <span className="capitalize text-foreground font-medium">{it.variantName}</span></span>}
                      <span>Ordered Qty: <span className="text-foreground font-medium">{it.quantity}</span></span>
                      <span>Price: <span className="text-foreground font-medium">₹{it.price}</span></span>
                    </div>

                    {isAlreadyReturned && (
                      <Badge variant="outline" className="mt-2 text-[10px] bg-amber-50 text-amber-700 border-amber-200">
                        {it.returnStatus || "Already Requested"}
                      </Badge>
                    )}
                  </div>

                  {/* Quantity Input for selected items */}
                  {isChecked && !isAlreadyReturned && (
                    <div className="flex items-center shrink-0">
                      <Input
                        type="number"
                        min={1}
                        max={it.quantity}
                        value={currentQty}
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 1;
                          const nextVal = Math.max(1, Math.min(it.quantity, val));
                          setQuantities(prev => ({ ...prev, [key]: nextVal }));
                        }}
                        className="w-16 h-7 text-center font-bold border-gray-200 focus:border-primary rounded-md text-xs p-1 bg-white"
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Reason Selection */}
          <div className="space-y-3 border-t pt-3">
            <label className="text-xs font-bold uppercase text-muted-foreground tracking-wide">Reason for Return</label>
            <RadioGroup value={reason} onValueChange={setReason} className="space-y-2.5">
              {PARTIAL_RETURN_REASONS.map((r) => (
                <div key={r} className="flex items-center gap-2.5">
                  <RadioGroupItem value={r} id={`reason-${r}`} />
                  <label htmlFor={`reason-${r}`} className="text-sm cursor-pointer font-medium text-foreground">
                    {r}
                  </label>
                </div>
              ))}
            </RadioGroup>

            {reason === "Other" && (
              <Input
                placeholder="Specify your return reason..."
                value={otherReason}
                onChange={(e) => setOtherReason(e.target.value)}
                className="mt-2 text-sm"
              />
            )}
          </div>
        </div>

        <Button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="w-full mt-2"
        >
          {submitting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
          Submit Return Request
        </Button>
      </DialogContent>
    </Dialog>
  );
}
