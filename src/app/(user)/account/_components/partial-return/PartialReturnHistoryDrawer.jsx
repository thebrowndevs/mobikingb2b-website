'use client';

import React, { useState, useEffect, useCallback } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Loader2, RefreshCw } from "lucide-react";
import { apiConnector } from "@/lib/services/apiConnector";
import { orderEndpoints } from "@/lib/api";
import RequestCard from "./RequestCard";
import RequestDetailsView from "./RequestDetailsView";

export default function PartialReturnHistoryDrawer({ open, onOpenChange, order, refreshOrder, accessToken }) {
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [requestsList, setRequestsList] = useState([]);
  const [loadingList, setLoadingList] = useState(false);

  const fetchRequestsList = useCallback(async () => {
    if (!order?._id || !accessToken) return;
    setLoadingList(true);
    try {
      const { data } = await apiConnector(
        "GET",
        `${orderEndpoints.GET_PARTIAL_RETURN_REQUESTS_BY_ORDER_API}/${order._id}`,
        null,
        {
          Authorization: `Bearer ${accessToken}`,
        }
      );
      if (data?.success) {
        setRequestsList(data.data?.requests || []);
      }
    } catch (err) {
      console.error("Error fetching requests list:", err);
    } finally {
      setLoadingList(false);
    }
  }, [accessToken, order?._id]);

  useEffect(() => {
    if (open) {
      fetchRequestsList();
    }
  }, [open, fetchRequestsList]);

  const fetchDetails = useCallback(async (requestId, showLoadingSpinner = true) => {
    if (!requestId || !accessToken) return;
    if (showLoadingSpinner) setLoadingDetails(true);

    try {
      const { data } = await apiConnector(
        "GET",
        `${orderEndpoints.GET_PARTIAL_RETURN_REQUEST_API}/${requestId}`,
        null,
        {
          Authorization: `Bearer ${accessToken}`,
        }
      );

      if (data?.success) {
        const detailedReq = data.data?.partialRequest || data.data;
        setSelectedRequest(detailedReq);

        // Update the requests list locally
        setRequestsList(prev => prev.map(r => r._id === requestId ? detailedReq : r));
      }
    } catch (err) {
      console.error("Error fetching partial return details:", err);
    } finally {
      if (showLoadingSpinner) setLoadingDetails(false);
    }
  }, [accessToken]);

  // When drawer is closed, reset internal state
  useEffect(() => {
    if (!open) {
      setSelectedRequestId(null);
      setSelectedRequest(null);
      setRequestsList([]);
    }
  }, [open]);

  // Trigger detailed request load when request card is selected
  useEffect(() => {
    if (selectedRequestId) {
      fetchDetails(selectedRequestId, true);
    }
  }, [selectedRequestId, fetchDetails]);

  const handleDetailsRefresh = useCallback(async (requestId, showLoadingSpinner = true) => {
    await fetchDetails(requestId, showLoadingSpinner);
    // Also fetch the list in the background to ensure list view stats are updated
    fetchRequestsList();
  }, [fetchDetails, fetchRequestsList]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        className="w-full sm:max-w-lg md:max-w-xl lg:max-w-2xl h-full flex flex-col p-6 overflow-hidden bg-white shadow-2xl"
        side="right"
      >
        <SheetHeader className="pb-4 border-b">
          <SheetTitle className="flex items-center gap-2 text-lg font-bold text-gray-900">
            <RefreshCw className="w-5 h-5 text-primary" />Return Requests
          </SheetTitle>
          <SheetDescription className="text-xs text-muted-foreground">
            Order ID: <span className="font-mono font-semibold text-foreground">{order?.orderId}</span>. View raised return requests, track logistics, or message customer support.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto pt-4 pr-1">
          {loadingList || loadingDetails ? (
            <div className="flex h-[50vh] items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : selectedRequestId && selectedRequest ? (
            <RequestDetailsView
              request={selectedRequest}
              onBack={() => {
                setSelectedRequestId(null);
                setSelectedRequest(null);
              }}
              accessToken={accessToken}
              onRefreshRequest={handleDetailsRefresh}
            />
          ) : (
            <div className="space-y-4">
              {requestsList.length === 0 ? (
                <div className="text-center py-16 text-sm text-muted-foreground italic">
                  No return requests found for this order.
                </div>
              ) : (
                requestsList.map((req) => (
                  <RequestCard
                    key={req?._id}
                    request={req}
                    onClick={(id) => setSelectedRequestId(id)}
                  />
                ))
              )}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
