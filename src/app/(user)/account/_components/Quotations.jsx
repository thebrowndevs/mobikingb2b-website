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
      <Card className="bg-[#0D0F12] border-slate-800 text-slate-400">
        <CardContent className="flex flex-col items-center justify-center p-12 space-y-4">
          <FileText size={48} className="text-slate-600" />
          <p className="text-sm font-semibold">No order requests raised yet.</p>
          <p className="text-xs text-slate-500 text-center max-w-sm">
            Add wholesale items to your cart and submit a request to get verified order requests from Mobiking.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold text-white tracking-wide">Order Requests</h2>
        <span className="text-xs text-slate-400 font-medium">Total: {quotations.length}</span>
      </div>

      <div className="grid gap-4">
        {quotations.map((quote) => (
          <Card key={quote._id} className="bg-[#0D0F12] border-slate-800 text-slate-300 hover:border-slate-700 transition-colors">
            <CardHeader className="p-4 pb-2">
              <div className="flex flex-wrap justify-between items-center gap-2">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-sm text-white tracking-wide">{quote.quotationId}</span>
                  {getStatusBadge(quote.status)}
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <CalendarDays size={14} />
                  <span>{new Date(quote.createdAt).toLocaleDateString("en-IN", { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-2 space-y-4">
              <div className="text-xs text-slate-400 space-y-1">
                <div className="flex justify-between">
                  <span>Warehouse Destination:</span>
                  <span className="text-slate-300 font-medium">{quote.city}, {quote.state} - {quote.pincode}</span>
                </div>
                {quote.comments && (
                  <div className="flex flex-col gap-0.5 mt-2 bg-slate-900/40 p-2 rounded border border-slate-800">
                    <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Comment/Requirement:</span>
                    <span className="text-slate-300 text-xs italic">"{quote.comments}"</span>
                  </div>
                )}
              </div>

              <Separator className="bg-slate-800" />

              <div className="space-y-3">
                {quote.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center gap-4 text-xs">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded bg-slate-900 border border-slate-800 flex items-center justify-center overflow-hidden shrink-0">
                        {item.productId?.images?.[0] ? (
                          <img src={item.productId.images[0]} alt={item.fullName} className="object-cover w-full h-full" />
                        ) : (
                          <FileText size={16} className="text-slate-600" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-slate-200 font-semibold truncate max-w-[200px] md:max-w-[400px]">{item.fullName}</p>
                        <p className="text-[10px] text-slate-500">Variant: {item.variantName}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-slate-300 font-medium">₹{item.price} × {item.quantity}</p>
                      <p className="text-[10px] text-slate-500">Total: ₹{item.price * item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>

              <Separator className="bg-slate-800" />

              <div className="flex justify-between items-center pt-1">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Estimated Total</span>
                  <span className="text-base font-bold text-white">₹{quote.orderAmount}</span>
                </div>
                <span className="text-[10px] text-slate-500 italic">Admin will verify final pricing & shipping charges</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
