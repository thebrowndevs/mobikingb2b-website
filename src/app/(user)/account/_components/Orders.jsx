"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import {
  getCodOrder,
  rateOrder,
  placeCancelRequest,
  placeReturnRequest,
  placeWarrantyRequest,
} from "@/lib/services/operations/OrderApi";
import { toast } from "sonner";

// UI Components
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";

import {
  Loader2,
  CalendarDays,
  ChevronRight,
  Star,
  Home,
} from "lucide-react";
import { CANCEL_REASONS, RETURN_REASONS, WARRANTY_REASONS } from "@/data/reasonData";
import RaiseQueryButton from "@/components/RaiseQueryButton";
import PartialReturnModal from "./PartialReturnModal";
import PartialReturnHistoryDrawer from "./partial-return/PartialReturnHistoryDrawer";
import ViewQueryDetails from "./ViewQueryDetails";

const INITIAL_VISIBLE_ORDERS = 3;
const STATUS_PROGRESS = [
  "Picked Up",
  "PICKED UP",
  "IN TRANSIT",
  "Shipped",
  "Delivered",
  "Returned",
  "Rejected",
  "CANCELLED",
  "Cancelled",
];

const getStatusBadgeVariant = (status) => {
  switch (status) {
    case "Delivered":
      return "success";
    case "Shipped":
      return "default";
    case "Cancelled":
    case "Rejected":
      return "destructive";
    case "New":
    case "Accepted":
    case "Hold":
      return "secondary";
    default:
      return "outline";
  }
};

const REASONS = {
  Cancel: CANCEL_REASONS,
  Return: RETURN_REASONS,
  Warranty: WARRANTY_REASONS,
};

export default function Orders() {
  const { accessToken, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const [trackDrawerOpen, setTrackDrawerOpen] = useState(false);

  // Drawer state
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  //Request  Modal state
  const [modal, setModal] = useState({
    open: false,
    type: null,
    order: null,
  });

  // Rating Modal
  const [ratingModal, setRatingModal] = useState({
    open: false,
    order: null
  });

  // Partial Return Modal
  const [partialReturnModal, setPartialReturnModal] = useState({
    open: false,
    order: null
  });

  // Partial Return History Modal
  const [partialReturnHistoryModal, setPartialReturnHistoryModal] = useState({
    open: false,
    order: null
  });

  const fetchUserOrders = useCallback(async () => {
    if (!accessToken) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await getCodOrder(null, accessToken);
      if (res.success && Array.isArray(res.data.data)) {
        setOrders(
          res.data.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        );
      } else {
        toast.error(res.error || "Failed to fetch orders.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Unexpected error while fetching orders.");
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    if (!isAuthLoading && accessToken) fetchUserOrders();
    else if (!isAuthLoading && !accessToken) setLoading(false);
  }, [isAuthLoading, accessToken, fetchUserOrders]);

  if (loading || isAuthLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <p className="mt-4 text-lg text-muted-foreground">Loading your orders…</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center px-4">
        <h2 className="text-2xl font-semibold mb-2">No Orders Yet</h2>
        <p className="text-muted-foreground mb-4">
          You haven’t placed any orders. Let’s change that!
        </p>
        <Button onClick={() => router.push("/")}>Shop Now</Button>
      </div>
    );
  }

  const visible = showAll ? orders : orders.slice(0, INITIAL_VISIBLE_ORDERS);

  // Helper to refresh one order after placing a request
  const refreshOrderInList = (updated) => {
    setOrders((prev) => prev.map((o) => (o._id === updated._id ? updated : o)));
  };

  return (
    <>
      <div className="space-y-4">
        {visible.map((order) => {
          const orderDate = new Date(order.createdAt);
          const modeText = order.method === "Online" ? "Online Payment" : "Cash on Delivery";

          return (
            <Card key={order._id} className="p-0 overflow-hidden">
              <CardHeader className="bg-muted/50 p-4">
                <div className="flex flex-col gap-6">

                  {/* Order Id and payment status */}
                  <div className="flex justify-between items-start md:items-center gap-1">
                    <div className="flex max-md:flex-col items-center gap-3">
                      {/* Order Id */}
                      <div className="flex items-center gap-1">
                        <span className="text-sm text-muted-foreground">Order ID:</span>
                        <span className="font-mono text-sm font-semibold">{order.orderId}</span>
                      </div>

                      {/* Order Date */}
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CalendarDays className="h-4 w-4" />
                        <span>
                          {orderDate.toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                        <span>
                          {orderDate.toLocaleTimeString("en-US", {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true,
                          })}
                        </span>
                      </div>
                    </div>

                    {/* Order Status */}
                    <Badge
                      variant={getStatusBadgeVariant(order.status)}
                      className="px-3 py-1 text-sm"
                    >
                      {order.status}
                    </Badge>
                  </div>

                  {/* Order Status nd action buttons */}
                  <div className="flex flex-wrap justify-between items-center gap-4">
                    {/* Payment Method  */}
                    <Badge
                      variant={order.method === "Online" ? "default" : "secondary"}
                      className=""
                    >
                      {modeText}
                    </Badge>

                    {/* Shipping Status */}
                    <Badge
                      variant={getStatusBadgeVariant(order.shippingStatus)}
                      className="px-3 py-1 text-sm flex flex-wrap gap-1 justify-start"
                    >
                      <span>Shipping Status:</span> {order.shippingStatus}
                    </Badge>

                    {order.scans?.length > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-[130px]"
                        onClick={() => {
                          setSelectedOrder(order);
                          setTrackDrawerOpen(true); // New state
                        }}
                      >
                        Track Order
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    )}

                    <Button
                      variant="outline"
                      size="sm"
                      className="w-[130px]"
                      onClick={() => {
                        setSelectedOrder(order);
                        setSheetOpen(true);
                      }}
                    >
                      View Details
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>
          );
        })}
      </div>

      {!showAll && orders.length > INITIAL_VISIBLE_ORDERS && (
        <div className="mt-8 flex justify-center">
          <Button onClick={() => setShowAll(true)} size="lg" variant="secondary">
            Show All Orders ({orders.length})
          </Button>
        </div>
      )}

      {selectedOrder?.scans?.length > 0 && (
        <TrackDrawer
          open={trackDrawerOpen}
          onOpenChange={(o) => {
            setTrackDrawerOpen(o);
            if (!o) setSelectedOrder(null);
          }}
          order={selectedOrder}
        />
      )}


      <OrderDetailsSheet
        closeSheet={() => setSheetOpen(false)}
        refreshOrder={refreshOrderInList}
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        order={selectedOrder}
        open={sheetOpen}
        onOpenChange={(o) => {
          setSheetOpen(o);
          if (!o) setSelectedOrder(null);
        }}
        onOpenRequestModal={(type) =>
          setModal({ open: true, type, order: selectedOrder })
        }
        onOpenRatingModal={() =>
          setRatingModal({ open: true, order: selectedOrder })
        }
        onOpenPartialReturnModal={() =>
          setPartialReturnModal({ open: true, order: selectedOrder })
        }
        onOpenPartialReturnHistoryModal={() =>
          setPartialReturnHistoryModal({ open: true, order: selectedOrder })
        }
      />

      <RequestModal
        modal={modal}
        setModal={setModal}
        refreshOrder={refreshOrderInList}
        accessToken={accessToken}
        closeSheet={() => setSheetOpen(false)}
      />

      <RatingModal
        modal={ratingModal}
        setModal={setRatingModal}
        refreshOrder={refreshOrderInList}
        accessToken={accessToken}
        closeSheet={() => setSheetOpen(false)}
      />

      {
        partialReturnModal?.open &&
        <PartialReturnModal
          open={partialReturnModal.open}
          onOpenChange={(o) => setPartialReturnModal({ open: o, order: o ? selectedOrder : null })}
          order={partialReturnModal.order}
          refreshOrder={refreshOrderInList}
          accessToken={accessToken}
          closeSheet={() => setSheetOpen(false)}
        />
      }

      <PartialReturnHistoryDrawer
        open={partialReturnHistoryModal.open}
        onOpenChange={(o) => setPartialReturnHistoryModal({ open: o, order: o ? selectedOrder : null })}
        order={orders.find(o => o._id === partialReturnHistoryModal.order?._id) || partialReturnHistoryModal.order}
        refreshOrder={refreshOrderInList}
        accessToken={accessToken}
      />
    </>
  );
}

import { Clock, MapPin, PackageCheck, PackageX, Truck } from "lucide-react";
import { cn } from "@/lib/utils";

/* =============== OrderTrackDetails =============== */
function TrackDrawer({ open, onOpenChange, order }) {
  const forwardScans = order?.scans || [];
  const returnScans = order?.returnScans || [];
  const returnData = order?.returnData;

  const hasReturn = returnScans.length > 0 || returnData?.isReturnInitiated;

  const [activeTab, setActiveTab] = React.useState(
    hasReturn ? "return" : "forward"
  );

  const statusColors = {
    DELIVERED: "text-green-600",
    SHIPPED: "text-blue-600",
    "OUT FOR PICKUP": "text-yellow-600",
    "PICKUP EXCEPTION": "text-red-600",
    "OUT FOR DELIVERY": "text-orange-600",
    "IN TRANSIT": "text-blue-500",
  };

  const scans = activeTab === "forward" ? forwardScans : returnScans;

  const awb = activeTab === "forward"
    ? order?.awbCode
    : returnData?.awb_code;

  const courier = activeTab === "forward"
    ? order?.courierName
    : returnData?.courier_name;

  const shippingStatus = activeTab === "forward"
    ? order?.shippingStatus
    : returnData?.shippingStatus;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full max-w-md p-6 flex flex-col space-y-6 overflow-y-auto"
      >
        <SheetHeader>
          <SheetTitle className="text-xl font-bold">
            Tracking Details
          </SheetTitle>

          {/* Tabs */}
          {hasReturn && (
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => setActiveTab("forward")}
                className={`px-3 py-1 text-xs rounded-md ${activeTab === "forward"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200"
                  }`}
              >
                Forward
              </button>

              <button
                onClick={() => setActiveTab("return")}
                className={`px-3 py-1 text-xs rounded-md ${activeTab === "return"
                  ? "bg-red-600 text-white"
                  : "bg-gray-200"
                  }`}
              >
                Return
              </button>
            </div>
          )}

          {/* Shipment Info */}
          <div className="text-sm space-y-1 mt-3">
            <p>
              <span className="text-muted-foreground">Order ID:</span>{" "}
              <span className="font-mono font-medium">
                {activeTab === "forward"
                  ? order?.orderId
                  : returnData?.orderId}
              </span>
            </p>

            {shippingStatus && (
              <p>
                <span className="text-muted-foreground">Shipping Status:</span>{" "}
                <Badge variant="outline" className="text-xs">
                  {shippingStatus}
                </Badge>
              </p>
            )}

            {awb && (
              <p>
                <span className="text-muted-foreground">AWB Code:</span>{" "}
                <span className="font-mono">{awb}</span>
              </p>
            )}

            {courier && (
              <p>
                <span className="text-muted-foreground">Courier:</span>{" "}
                {courier}
              </p>
            )}
          </div>
        </SheetHeader>

        {/* Timeline */}
        <div className="relative pl-4 border-l-2 border-dashed border-gray-300 space-y-6">
          {scans
            .slice()
            .reverse()
            .map((scan, idx) => {
              const label = scan["sr-status-label"];

              const icon =
                label === "DELIVERED" ? (
                  <PackageCheck className="text-green-600 h-5 w-5" />
                ) : label === "PICKUP EXCEPTION" ? (
                  <PackageX className="text-red-600 h-5 w-5" />
                ) : (
                  <Truck className="text-blue-600 h-5 w-5" />
                );

              return (
                <div key={idx} className="relative flex items-start gap-4">
                  <div className="absolute -left-2 top-1">
                    <div className="h-4 w-4 rounded-full bg-primary ring-2 ring-white"></div>
                  </div>

                  <div className="pt-1">{icon}</div>

                  <div className="ml-2 space-y-1">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {new Date(scan.date).toLocaleString("en-IN")}
                      </span>
                    </div>

                    <p className="text-base font-medium">
                      {scan.activity}
                    </p>

                    {scan.location && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        {scan.location}
                      </div>
                    )}

                    {label !== "NA" && (
                      <div
                        className={cn(
                          "text-xs font-semibold mt-1",
                          statusColors[label] || "text-muted-foreground"
                        )}
                      >
                        Status: {label}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

          {scans.length === 0 && (
            <div className="text-sm text-center text-muted-foreground mt-4">
              No tracking updates available yet.
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

// function TrackDrawer({ open, onOpenChange, order }) {
//   const scans = order?.scans || [];
//   const statusColors = {
//     DELIVERED: "text-green-600",
//     SHIPPED: "text-blue-600",
//     "OUT FOR PICKUP": "text-yellow-600",
//     "PICKUP EXCEPTION": "text-red-600",
//   };

//   return (
//     <Sheet open={open} onOpenChange={onOpenChange}>
//       <SheetContent
//         side="right"
//         className="w-full max-w-md p-6 flex flex-col space-y-6 overflow-y-auto"
//       >
//         <SheetHeader>
//           <SheetTitle className="text-xl font-bold">Tracking Details</SheetTitle>
//           <div className="text-sm space-y-1 mt-2">
//             <p>
//               <span className="text-muted-foreground">Order ID:</span>{" "}
//               <span className="font-mono font-medium">{order?.orderId}</span>
//             </p>
//             {order?.shippingStatus && (
//               <p>
//                 <span className="text-muted-foreground">Shipping Status:</span>{" "}
//                 <Badge variant="outline" className="text-xs">
//                   {order.shippingStatus}
//                 </Badge>
//               </p>
//             )}
//             {order?.awbCode && (
//               <p>
//                 <span className="text-muted-foreground">AWB Code:</span>{" "}
//                 <span className="font-mono">{order.awbCode}</span>
//               </p>
//             )}
//             {order?.courierName && (
//               <p>
//                 <span className="text-muted-foreground">Courier:</span>{" "}
//                 {order.courierName}
//               </p>
//             )}
//             {order?.expectedDeliveryDate && (
//               <p>
//                 <span className="text-muted-foreground">Expected Delivery:</span>{" "}
//                 {order.expectedDeliveryDate}
//               </p>
//             )}
//           </div>
//         </SheetHeader>

//         <div className="relative pl-4 border-l-2 border-dashed border-gray-300 space-y-6">
//           {scans
//             .slice()
//             .reverse()
//             .map((scan, idx) => {
//               const icon =
//                 scan["sr-status-label"] === "DELIVERED" ? (
//                   <PackageCheck className="text-green-600 h-5 w-5" />
//                 ) : scan["sr-status-label"] === "PICKUP EXCEPTION" ? (
//                   <PackageX className="text-red-600 h-5 w-5" />
//                 ) : (
//                   <Truck className="text-blue-600 h-5 w-5" />
//                 );

//               return (
//                 <div key={idx} className="relative flex items-start gap-4">
//                   {/* Dot + Line */}
//                   <div className="absolute -left-2 top-1">
//                     <div className="h-4 w-4 rounded-full bg-primary ring-2 ring-white"></div>
//                   </div>

//                   {/* Icon */}
//                   <div className="pt-1">{icon}</div>

//                   {/* Info */}
//                   <div className="ml-2 space-y-1">
//                     <div className="flex items-center gap-2 text-sm font-medium">
//                       <Clock className="h-4 w-4 text-muted-foreground" />
//                       <span>{new Date(scan.date).toLocaleString("en-IN")}</span>
//                     </div>

//                     <p className="text-base text-foreground font-medium">{scan.activity}</p>

//                     {scan.location && (
//                       <div className="flex items-center gap-1 text-sm text-muted-foreground">
//                         <MapPin className="h-4 w-4" />
//                         {scan.location}
//                       </div>
//                     )}

//                     {scan["sr-status-label"] !== "NA" && (
//                       <div
//                         className={cn(
//                           "text-xs font-semibold mt-1",
//                           statusColors[scan["sr-status-label"]] || "text-muted-foreground"
//                         )}
//                       >
//                         Status: {scan["sr-status-label"]}
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               );
//             })}

//           {scans.length === 0 && (
//             <div className="text-sm text-center text-muted-foreground mt-4">
//               No tracking updates available yet.
//             </div>
//           )}
//         </div>
//       </SheetContent>
//     </Sheet>
//   );
// }

/* =============== OrderDetailsSheet =============== */
function OrderDetailsSheet({ closeSheet, refreshOrder, isOpen, setIsOpen, order, open, onOpenChange, onOpenRequestModal, onOpenRatingModal, onOpenPartialReturnModal, onOpenPartialReturnHistoryModal }) {
  if (!order) return null;

  const [isQOpen, setIsQOpen] = useState(false);

  function isWithin9Days(dateString) {
    const orderDate = new Date(dateString);
    const now = new Date();
    const diffInMs = now - orderDate;
    const diffInDays = diffInMs / (1000 * 60 * 60 * 24);
    return diffInDays <= 9;
  }


  const returnData = order?.returnData

  const formatDateTime = (dateStr) => {
    if (!dateStr) return "—"
    try {
      return format(new Date(dateStr), 'dd MMM yyyy, hh:mm a')
    } catch {
      return dateStr
    }
  }

  const raised = (t) => order.requests.some((r) => r.type === t && r.isRaised);
  const getRequest = (t) => order.requests.find((r) => r.type === t && r.isRaised);

  const notRejected = (t) =>
    order.requests.some((r) => r.type === t && r.isRaised && r.status !== "Rejected");

  const canCancel =
    !raised("Cancel") &&
    !notRejected("Return") &&
    !notRejected("Warranty") &&
    !STATUS_PROGRESS.includes(order.status) &&
    !STATUS_PROGRESS.includes(order.shippingStatus);

  const deliveredWithin3Days =
    order.deliveredAt &&
    new Date(order.deliveredAt) <= new Date() && // ensure it's not in the future
    (Date.now() - new Date(order.deliveredAt).getTime()) <= 3 * 24 * 60 * 60 * 1000;

  const deliveredWithin7Days =
    order.deliveredAt &&
    new Date(order.deliveredAt) <= new Date() && // ensure it's not in the future
    (Date.now() - new Date(order.deliveredAt).getTime()) <= 7 * 24 * 60 * 60 * 1000;

  const canReturn =
    order.status === "Delivered" &&
    !order?.returnData &&
    deliveredWithin3Days &&
    // deliveredWithin7Days &&
    !raised("Return") &&
    !notRejected("Cancel") &&
    !notRejected("Warranty");

  const allItemsReturnedOrPending = order?.items?.every(it =>
    it.isReturned ||
    ["Return Accepted", "Returned", "Pending"].includes(it.returnStatus)
  );

  const canPartialReturn =
    order.status === "Delivered" &&
    !order?.returnData &&
    // order?.items?.length > 1 &&
    !allItemsReturnedOrPending &&
    // deliveredWithin3Days &&
    !notRejected("Return") &&
    !notRejected("Cancel") &&
    !notRejected("Warranty");

  const canWarranty =
    order.status === "Delivered" &&
    !order.isReviewed &&
    !raised("Warranty") &&
    !notRejected("Cancel") &&
    !notRejected("Return");

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex flex-col w-full max-w-md p-0">
        <SheetHeader className="p-6 border-b">
          <SheetTitle className="flex flex-wrap items-center gap-2">
            Order ID: <span className="font-mono">{order.orderId}</span>
            <Badge variant={getStatusBadgeVariant(order.status)}>{order.status}</Badge>
          </SheetTitle>
        </SheetHeader>

        {/* Amount Summary */}
        <div className="flex-1 overflow-y-auto px-6 space-y-6">
          <section>
            {
              order?.reason &&
              <div className="flex gap-2 font-bold text-red-500 underline">
                <span>Reason: </span>
                <span>{order?.reason}</span>
              </div>
            }
            <h4 className="font-semibold mb-2">Amount Summary</h4>
            <div className="space-y-1 text-sm">
              {/* Coupon Badge */}
              {(order?.coupon?.code || order?.couponCode) && (
                <div className="mb-2">
                  <span className="inline-block bg-green-100 text-green-700 text-xs font-semibold px-2 py-1 rounded">
                    Coupon Applied: {order?.coupon?.code || order?.couponCode}
                    {/* {(order?.coupon?.type || order?.couponType) &&
                      ` (${order?.coupon?.type || order?.couponType})`} */}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{order?.subtotal.toLocaleString()}</span>
              </div>
              {/* {order?.discount > 0 && ( */}
              <div className="flex justify-between text-green-600">
                <p>Discount</p>
                <p>- ₹{order?.discount?.toLocaleString()}</p>
              </div>
              {/* )} */}
              <div className="flex justify-between">
                <span>Delivery</span>
                <span>₹{order?.deliveryCharge.toLocaleString()}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold">
                <span>Total Paid</span>
                <span>₹{order?.orderAmount.toLocaleString()}</span>
              </div>
            </div>
          </section>

          {/* Shipping */}
          <section>
            <h4 className="font-semibold mb-2">Shipping Details</h4>
            <p className="text-sm"><strong>Name:</strong> {order.name}</p>
            <p className="text-sm"><strong>Address:</strong> {order.address}</p>
            <p className="text-sm"><strong>Phone:</strong> {order.phoneNo}</p>
            <p className="text-sm"><strong>Shipping Status:</strong> {order.shippingStatus}</p>
            {order.courierName && <p className="text-sm"><strong>Courier:</strong> {order.courierName}</p>}
            {order.awbCode && <p className="text-sm"><strong>AWB Code:</strong> {order.awbCode}</p>}
            {order.expectedDeliveryDate && (
              <p className="text-sm"><strong>Expected Delivery:</strong> {order.expectedDeliveryDate}</p>
            )}
          </section>

          {/* Return Shipment Details */}
          {returnData?.isReturnInitiated && (
            <section className="mt-6 border-t pt-4">
              <h4 className="font-semibold mb-2 text-red-600">
                Return Shipment Details
              </h4>

              <p className="text-sm">
                <strong>Return Order ID:</strong> {returnData.orderId}
              </p>

              <p className="text-sm">
                <strong>Status:</strong> {returnData.shippingStatus || returnData.status}
              </p>

              <p className="text-sm">
                <strong>Courier:</strong> {returnData.courier_name}
              </p>

              <p className="text-sm">
                <strong>AWB Code:</strong> {returnData.awb_code}
              </p>

              <p className="text-sm">
                <strong>Shipment ID:</strong> {returnData.shipment_id}
              </p>

              <p className="text-sm">
                <strong>Pickup Scheduled:</strong>{" "}
                {returnData.pickupScheduled ? "Yes" : "No"}
              </p>

              <p className="text-sm">
                <strong>Pickup Date:</strong>{" "}
                {returnData.pickup_scheduled_date || "—"}
              </p>

              <p className="text-sm">
                <strong>Courier Assigned At:</strong>{" "}
                {formatDateTime(returnData?.assigned_date_time?.date)}
              </p>

              {returnData.expectedDeliveryDate && (
                <p className="text-sm">
                  <strong>Expected Delivery:</strong>{" "}
                  {formatDateTime(returnData.expectedDeliveryDate)}
                </p>
              )}
            </section>
          )}

          {/* Items */}
          <section>
            <h4 className="font-semibold mb-2">Items</h4>
            <ul className="space-y-4">
              {order.items.map((it, idx) => (
                <li key={idx} className="flex items-start gap-4">
                  <img
                    src={it.productId?.images?.[0] || "/placeholder.png"}
                    alt={it.productId?.fullName}
                    className="h-16 w-16 rounded-md border p-1 object-contain bg-white"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{it.productId?.fullName}</p>
                      {it.returnStatus && (
                        <Badge variant="outline" className="text-[10px] bg-amber-50 text-amber-700 border-amber-200">
                          {it.returnStatus}
                        </Badge>
                      )}
                    </div>
                    {it.variantName && (
                      <p className="text-xs text-muted-foreground">
                        Variant: <span className="capitalize">{it.variantName}</span>
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">Qty: {it.quantity}</p>
                    {it.returnQuantity > 0 && (
                      <p className="text-xs text-amber-600 font-semibold mt-0.5">
                        Returned Qty: {it.returnQuantity}
                      </p>
                    )}
                  </div>
                  <p className="font-medium">
                    ₹{(it.price * it.quantity).toLocaleString()}
                  </p>
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* FOOTER – action buttons & statuses */}
        <div className="border-t p-6 space-y-4">

          {/* — Rate Order */}
          {
            canWarranty && (
              <Button
                className="w-full bg-green-600 hover:bg-green-700 text-white"
                onClick={() => onOpenRatingModal()}
              >
                Rate Now
              </Button>
            )
          }

          {!order?.query && order?.createdAt && isWithin9Days(order.createdAt) && (
            <RaiseQueryButton
              isOpen={isOpen} setIsOpen={setIsOpen}
              orderId={order?._id}
              refreshOrder={refreshOrder}
              closeSheet={closeSheet}
            />
          )}

          {/* View Query */}
          {
            order?.query &&
            <ViewQueryDetails open={isQOpen} setIsOpen={setIsQOpen}
              query={{ ...order?.query, orderId: order }}
            />
          }

          {/* — Cancel Order */}
          {raised("Cancel") ? (
            (() => {
              const req = getRequest("Cancel");
              const bg =
                req.status === "Pending" ? "bg-yellow-50" :
                  req.status === "Accepted" ? "bg-green-50" :
                    "bg-red-50";
              return (
                <div className={`${bg} p-4 rounded-md flex items-start gap-3`}>
                  <Badge
                    variant={
                      req.status === "Pending"
                        ? "secondary"
                        : req.status === "Accepted"
                          ? "success"
                          : "destructive"
                    }
                    className="flex-shrink-0"
                  >
                    {req.status}
                  </Badge>
                  <div>
                    <p className="text-sm font-semibold">Cancel Request</p>
                    <p className="text-sm text-gray-800 mt-1">{req.reason}</p>
                  </div>
                </div>
              );
            })()
          ) : (
            canCancel && (
              <Button
                variant="destructive"
                className="w-full"
                onClick={() => onOpenRequestModal("Cancel")}
              >
                Cancel Order
              </Button>
            )
          )}

          {/* — Request Return */}
          {/* {raised("Return") ? (
            (() => {
              const req = getRequest("Return");
              const bg =
                req.status === "Pending" ? "bg-yellow-50" :
                  req.status === "Accepted" ? "bg-green-50" :
                    "bg-red-50";
              return (
                <div className={`${bg} p-4 rounded-md flex items-start gap-3`}>
                  <Badge
                    variant={
                      req.status === "Pending"
                        ? "secondary"
                        : req.status === "Accepted"
                          ? "success"
                          : "destructive"
                    }
                    className="flex-shrink-0"
                  >
                    {req.status}
                  </Badge>
                  <div>
                    <p className="text-sm font-semibold">Return Request</p>
                    <p className="text-sm text-gray-800 mt-1">{req.reason}</p>
                  </div>
                </div>
              );
            })()
          ) : (
            canReturn && (
              <Button
                className="w-full"
                onClick={() => onOpenRequestModal("Return")}
              >
                Request Return
              </Button>
            )
          )} */}

          {/* — View Partial Return Requests */}
          {order?.partialReturnRequests?.length > 0 && (
            <Button
              variant="outline"
              className="w-full border-blue-200 bg-blue-50/50 text-blue-800 hover:bg-blue-100/60"
              onClick={() => onOpenPartialReturnHistoryModal()}
            >
              View Return Requests
            </Button>
          )}

          {/* — Request Partial Return */}
          {canPartialReturn && (
            <Button
              variant="outline"
              className="w-full border-amber-200 bg-amber-50/50 text-amber-800 hover:bg-amber-100/60"
              onClick={() => onOpenPartialReturnModal()}
            >
              Request Return
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

/* =============== RequestModal =============== */
function RequestModal({ modal, setModal, refreshOrder, accessToken, closeSheet }) {
  const { open, type, order } = modal;
  const [selected, setSelected] = useState("");
  const [otherText, setOtherText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setSelected("");
      setOtherText("");
    }
  }, [open, type]);

  if (!open || !order) return null;

  const reasons = REASONS[type] || [];
  const finalReason = selected === "Other" ? otherText.trim() : selected;
  const disabled =
    !finalReason ||
    (selected === "Other" && otherText.trim().length < 3) ||
    submitting;

  const placeRequest = async () => {
    if (disabled) return;
    try {
      setSubmitting(true);
      let res;
      if (type === "Cancel")
        res = await placeCancelRequest(accessToken, { orderId: order._id, reason: finalReason });
      else if (type === "Return")
        res = await placeReturnRequest(accessToken, { orderId: order._id, reason: finalReason });
      else
        res = await placeWarrantyRequest(accessToken, { orderId: order._id, reason: finalReason });

      console.log("here", res)
      if (res?.success) {
        console.log("success", res)
        // toast.success(`${type} request placed.`);
        refreshOrder(res.data);
        close();
        closeSheet();
      } else throw new Error(res?.error || "Failed");
    } catch (err) {
      console.error(err);
      // toast.error(`Could not place ${type.toLowerCase()} request.`);
    } finally {
      setSubmitting(false);
    }
  };

  const close = () => setModal({ open: false, type: null, order: null });

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{type} Request</DialogTitle>
          <DialogDescription>
            Select a reason for your {type.toLowerCase()}.
          </DialogDescription>
        </DialogHeader>

        <RadioGroup value={selected} onValueChange={setSelected} className="space-y-3">
          {reasons.map((r) => (
            <div key={r} className="flex items-center gap-2">
              <RadioGroupItem value={r} id={`${type}-${r}`} />
              <label htmlFor={`${type}-${r}`} className="text-sm cursor-pointer">
                {r}
              </label>
            </div>
          ))}
        </RadioGroup>

        {selected === "Other" && (
          <Input
            placeholder="Enter custom reason…"
            value={otherText}
            onChange={(e) => setOtherText(e.target.value)}
          />
        )}

        <Button onClick={placeRequest} disabled={disabled} className="w-full mt-4">
          {submitting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
          Place Request
        </Button>
      </DialogContent>
    </Dialog>
  );
}

/* =============== Rating Modal =============== */
function RatingModal({ modal, setModal, refreshOrder, accessToken, closeSheet }) {
  const { open, order } = modal;
  const [rating, setRating] = useState(3);
  const [review, setReview] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
    }
  }, [open]);

  if (!open || !order) return null;

  const disabled =
    !review || !rating ||
    submitting;

  const reviewOrder = async () => {
    if (disabled) return;
    try {
      setSubmitting(true);
      let res = await rateOrder(
        accessToken,
        {
          orderId: order._id
        });

      if (res?.success) {
        console.log("success", res)
        // toast.success(`${type} request placed.`);
        refreshOrder(res?.data?.updatedOrder);
        close();
        closeSheet();
      } else throw new Error(res?.error || "Failed");
    } catch (err) {
      console.error(err);
      // toast.error(`Could not place ${type.toLowerCase()} request.`);
    } finally {
      setSubmitting(false);
    }
  };

  const close = () => setModal({ open: false, order: null });

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Rate Now</DialogTitle>
          <DialogDescription>Rate your experience</DialogDescription>
        </DialogHeader>

        {/* Star rating */}
        <div className="flex items-center gap-1 mt-2" role="radiogroup" aria-label="Star rating">
          {[1, 2, 3, 4, 5].map((i) => (
            <Button
              key={i}
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 p-0"
              onClick={() => setRating(i)}
              aria-pressed={i <= rating}
              aria-label={`${i} star${i > 1 ? "s" : ""}`}
            >
              <Star
                className={`h-5 w-5 ${i <= rating ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground fill-transparent"
                  }`}
              />
              <span className="sr-only">{i} star</span>
            </Button>
          ))}
          {/* optional: clear button */}
          {rating > 0 && (
            <Button
              type="button"
              variant="ghost"
              className="ml-1 h-8 px-2 text-xs"
              onClick={() => setRating(0)}
            >
              Clear
            </Button>
          )}
        </div>

        <Input
          placeholder="Tell us about your experience…"
          value={review}
          onChange={(e) => setReview(e.target.value)}
          className="mt-3"
        />

        <Button onClick={reviewOrder} disabled={disabled} className="w-full mt-4">
          {submitting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
          Submit
        </Button>
      </DialogContent>
    </Dialog>

    // <Dialog open={open} onOpenChange={close}>
    //   <DialogContent className="sm:max-w-sm">
    //     <DialogHeader>
    //       <DialogTitle>Rate Now</DialogTitle>
    //       <DialogDescription>
    //         Rate you experience
    //       </DialogDescription>
    //     </DialogHeader>

    //     {/* <RadioGroup value={selected} onValueChange={setSelected} className="space-y-3">
    //       {reasons.map((r) => (
    //         <div key={r} className="flex items-center gap-2">
    //           <RadioGroupItem value={r} id={`${type}-${r}`} />
    //           <label htmlFor={`${type}-${r}`} className="text-sm cursor-pointer">
    //             {r}
    //           </label>
    //         </div>
    //       ))}
    //     </RadioGroup> */}

    //     {/* {selected === "Other" && ( */}
    //     <Input
    //       placeholder="Tell us about your experience…"
    //       value={otherText}
    //       onChange={(e) => setReview(e.target.value)}
    //     />
    //     {/* )} */}

    //     <Button onClick={placeRequest} disabled={disabled} className="w-full mt-4">
    //       {submitting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
    //       Place Request
    //     </Button>
    //   </DialogContent>
    // </Dialog>
  );
}
