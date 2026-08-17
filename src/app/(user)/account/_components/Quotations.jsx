"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { getMyQuotationsApi } from "@/lib/services/operations/QuotationApi";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Loader2, CalendarDays, ChevronRight, FileText } from "lucide-react";
import { toast } from "sonner";

const getStatusBadge = (status) => {
  switch (status) {
    case "Booked":
      return <Badge className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">Booked</Badge>;
    case "Cancelled":
      return <Badge className="bg-rose-500/10 text-rose-500 border border-rose-500/20">Cancelled</Badge>;
    case "Hold":
      return <Badge className="bg-amber-500/10 text-amber-500 border border-amber-500/20">On Hold</Badge>;
    case "New":
    default:
      return <Badge className="bg-blue-500/10 text-blue-500 border border-blue-500/20">Pending Review</Badge>;
  }
};

export default function Quotations() {
  const { accessToken, isLoading: isAuthLoading } = useAuth();
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuote, setSelectedQuote] = useState(null);

  const fetchQuotations = useCallback(async () => {
    if (!accessToken) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await getMyQuotationsApi(accessToken);
      if (Array.isArray(data)) {
        setQuotations(data);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load quotations.");
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    if (!isAuthLoading && accessToken) {
      fetchQuotations();
    } else if (!isAuthLoading && !accessToken) {
      setLoading(false);
    }
  }, [isAuthLoading, accessToken, fetchQuotations]);

  if (loading || isAuthLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="animate-spin text-[#ED1C24]" size={24} />
      </div>
    );
  }

  if (quotations.length === 0) {
    return (
      <Card className="bg-white border-slate-200 text-slate-500">
        <CardContent className="flex flex-col items-center justify-center p-12 space-y-4">
          <FileText size={48} className="text-slate-350" />
          <p className="text-sm font-semibold">No order requests raised yet.</p>
          <p className="text-xs text-slate-400 text-center max-w-sm">
            Add wholesale items to your cart and submit a request to get verified order requests from Mobiking.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold text-slate-800 tracking-wide">Order Requests</h2>
        <span className="text-xs text-slate-500 font-medium">Total: {quotations.length}</span>
      </div>

      <div className="grid gap-4">
        {quotations.map((quote) => (
          <Card key={quote._id} className="bg-white border-slate-200 text-slate-650 hover:border-slate-300 transition-colors">
            <CardHeader className="p-4 pb-2">
              <div className="flex flex-wrap justify-between items-center gap-2">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-base text-slate-800 tracking-wide">{quote.quotationId}</span>
                  {getStatusBadge(quote.status)}
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <CalendarDays size={14} />
                  <span>{new Date(quote.createdAt).toLocaleDateString("en-IN", { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-2">
              <div className="flex flex-col md:flex-row gap-6">
                
                {/* Left Side: Order details */}
                <div className="flex-1 space-y-4">
                  <div className="text-sm text-slate-500 space-y-1.5">
                    <div className="flex justify-between">
                      <span>Warehouse Destination:</span>
                      <span className="text-slate-800 font-semibold">{quote.city}, {quote.state} - {quote.pincode}</span>
                    </div>
                    {quote.comments && (
                      <div className="flex flex-col gap-1 mt-2 bg-slate-50 p-2.5 rounded border border-slate-100">
                        <span className="text-slate-400 text-xs uppercase font-bold tracking-wider">Comment/Requirement:</span>
                        <span className="text-slate-700 text-sm italic">"{quote.comments}"</span>
                      </div>
                    )}
                  </div>

                  <Separator className="bg-slate-100" />

                  <div className="flex justify-between items-center pt-1">
                    <div>
                      <span className="text-xs text-slate-400 uppercase tracking-wider block">Estimated Total</span>
                      <span className="text-lg font-bold text-slate-900">₹{quote.orderAmount}</span>
                    </div>
                    <span className="text-xs text-slate-400 italic text-right max-w-[180px]">Admin will verify final pricing & shipping charges</span>
                  </div>
                </div>

                {/* Vertical Divider on Desktop, horizontal on mobile */}
                <div className="hidden md:block w-px bg-slate-100 self-stretch shrink-0" />
                <Separator className="md:hidden bg-slate-100" />

                {/* Right Side: Products list */}
                <div className="flex-1 space-y-3">
                  {quote.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center gap-4 text-sm">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded bg-slate-50 border border-slate-150 flex items-center justify-center overflow-hidden shrink-0">
                          {item.productId?.images?.[0] ? (
                            <img src={item.productId.images[0]} alt={item.productId?.fullName || item.productId?.name || item.fullName} className="object-cover w-full h-full" />
                          ) : (
                            <FileText size={18} className="text-slate-400" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-slate-800 font-semibold leading-snug">{item.productId?.fullName || item.productId?.name || item.fullName}</p>
                          <p className="text-xs text-slate-400 mt-0.5">Variant: {item.variantName}</p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-slate-700 font-medium">₹{item.price} × {item.quantity}</p>
                        <p className="text-xs text-slate-400">Total: ₹{(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
