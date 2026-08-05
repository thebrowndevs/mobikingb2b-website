"use client";

// Queries component – shows list, sticky filters, drawer & rating modal
// -----------------------------------------------------------------------------
// • NEW filter bar (dropdowns):
//     1. Status   – All · Pending · Resolved
//     2. Assignment – All · Assigned · Un‑assigned   (hidden when Resolved)
// • Everything else (cards, drawer, rating, replies) is unchanged.
// -----------------------------------------------------------------------------

import React, { useEffect, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  HelpCircle,
  CheckCircle2,
  UserCircle,
  Send,
  Star,
  StarOff,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import {
  getMyQueries,
  addReplyToQuery,
  addRatingToQuery,
} from "@/lib/services/operations/QueryApi";
import { useBreakpoint } from "@/hooks/use-breakpoint";
import QuerySheetHeader from "./QuerySheetHeader";

export default function Queries() {
  /* ---------------------------------------------------------------- state */
  const { accessToken, user } = useAuth();
  const { isDesktop, isTab } = useBreakpoint();

  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(true);

  /* filters */
  const [statusFilter, setStatusFilter] = useState("all");   // all | pending | resolved
  const [assignFilter, setAssignFilter] = useState("all");   // all | assigned | unassigned

  /* drawer / reply / rating */
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedQuery, setSelectedQuery] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [sendingReply, setSendingReply] = useState(false);
  const [ratingOpen, setRatingOpen] = useState(false);
  const [ratingValue, setRatingValue] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [submittingRating, setSubmittingRating] = useState(false);

  /* ------------------------------------------------ fetch queries once */
  useEffect(() => {
    (async () => {
      try {
        const data = await getMyQueries(accessToken);
        setQueries(data || []);
      } catch {
        toast.error("Failed to load queries");
      } finally {
        setLoading(false);
      }
    })();
  }, [accessToken]);

  /* ------------------------------------------------ filter queries */
  const filteredQueries = queries.filter((q) => {
    if (statusFilter === "pending" && q.isResolved) return false;
    if (statusFilter === "resolved" && !q.isResolved) return false;

    if (statusFilter === "pending") {
      if (assignFilter === "assigned" && !q.assignedTo) return false;
      if (assignFilter === "unassigned" && q.assignedTo) return false;
    }
    return true;
  });

  /* ------------------------------------------------ helpers */
  const openDrawer = (q) => { setSelectedQuery(q); setDrawerOpen(true); };
  const refreshInState = (upd) => {
    setQueries(prev => prev.map((q) => (q._id === upd._id ? upd : q)));
    setSelectedQuery(upd);
  };

  const StatusPill = ({ resolved }) => (
    <Badge
      variant={resolved ? "success" : "secondary"}
      className={resolved ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"}
    >
      {resolved ? "Resolved" : "Pending"}
    </Badge>
  );

  const Stars = ({ rating }) => (
    <span className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) =>
        i < Math.round(rating / 2)
          ? <Star key={i} className="w-4 h-4 fill-yellow-500 text-yellow-500" />
          : <StarOff key={i} className="w-4 h-4 text-gray-400" />
      )}
    </span>
  );

  /* ------------------------------------------------ list card */
  const QueryCard = ({ query }) => (
    <button
      onClick={() => openDrawer(query)}
      className="group cursor-pointer w-full text-left p-4 rounded-lg border bg-white hover:shadow-md transition flex flex-col gap-2"
    >
      <h3 className="font-semibold line-clamp-">Order: {query?.orderId?.orderId}</h3>
      <div className="flex items-center justify-between">
        <h3 className="font-semibold line-clamp-1">{query.title}</h3>
        {query.isResolved
          ? <CheckCircle2 className="w-4 h-4 text-green-600" />
          : <HelpCircle className="w-4 h-4 text-orange-600" />}
      </div>

      <p className="text-xs text-muted-foreground line-clamp-2">{query.description}</p>

      {/* <div className="text-xs text-muted-foreground flex items-center gap-1">
        <UserCircle className="w-4 h-4" />
        {query.assignedTo?.name || "Not Assigned"}
      </div> */}

      {query.rating ? (
        <Stars rating={query.rating} />
      ) : query.isResolved && (
        <Button
          size="xs"
          variant="outline"
          className="mt-1 w-max text-xs px-2 py-1"
          onClick={(e) => { e.stopPropagation(); setSelectedQuery(query); setRatingOpen(true); }}
        >
          Rate now
        </Button>
      )}

      <div className="flex items-center justify-between text-xs mt-2 pt-2 border-t">
        <StatusPill resolved={query.isResolved} />
        <span>{new Date(query.raisedAt).toLocaleDateString()}</span>
      </div>
    </button>
  );

  /* ------------------------------------------------ chat bubble */
  const ReplyBubble = ({ reply }) => {
    const mine = reply.messagedBy._id === user?._id;
    return (
      <div className={`max-w-[85%] p-3 rounded-lg text-sm flex flex-col ${mine ? "ml-auto bg-primary text-white" : "mr-auto bg-gray-100"}`}>
        <span className="font-medium text-xs mb-1">
          {reply.messagedBy.name} ({reply.messagedBy.role})
        </span>
        <span>{reply.message}</span>
        <span className="text-[10px] opacity-60 text-right">
          {new Date(reply.messagedAt).toLocaleString()}
        </span>
      </div>
    );
  };

  /* ------------------------------------------------ send / rating handlers */
  const sendReply = async () => {
    if (!replyText.trim() || sendingReply) return;
    try {
      setSendingReply(true);
      const upd = await addReplyToQuery(
        { queryId: selectedQuery._id, message: replyText },
        accessToken
      );
      refreshInState(upd);
      setReplyText("");
    } catch { toast.error("Failed to send reply"); }
    finally { setSendingReply(false); }
  };

  const submitRating = async () => {
    if (submittingRating) return;
    try {
      setSubmittingRating(true);
      const upd = await addRatingToQuery(
        { queryId: selectedQuery._id, rating: ratingValue, review: reviewText },
        accessToken
      );
      refreshInState(upd);
      toast.success("Thank you for your feedback!");
      setRatingOpen(false);
    } catch { toast.error("Failed to submit rating"); }
    finally { setSubmittingRating(false); }
  };

  /* ------------------------------------------------ counts for dropdown labels (optional) */
  const countStatus = (t) =>
    queries.filter((q) =>
      t === "all" ? true : t === "resolved" ? q.isResolved : !q.isResolved
    ).length;

  const countAssign = (t) =>
    queries.filter((q) => {
      if (q.isResolved) return false;
      return t === "all" ? true : t === "assigned" ? !!q.assignedTo : !q.assignedTo;
    }).length;

  /* ------------------------------------------------ render */
  return (
    <>
      {/* Sticky filter bar */}
      <div className="sticky top-0 z-10 backdrop-blur-md border-b py-3 px-4 flex flex-wrap items-center gap-4">
        {/* status dropdown */}
        <label className="flex items-center gap-2 text-sm">
          <span className="font-medium">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border rounded-md px-2 py-1 text-sm bg-white cursor-pointer"
          >
            <option value="all">All ({countStatus("all")})</option>
            <option value="pending">Pending ({countStatus("pending")})</option>
            <option value="resolved">Resolved ({countStatus("resolved")})</option>
          </select>
        </label>

        {/* assignment dropdown (only when pending) */}
        {/* {statusFilter === "pending" && (
          <label className="flex items-center gap-2 text-sm">
            <span className="font-medium">Assignment:</span>
            <select
              value={assignFilter}
              onChange={(e) => setAssignFilter(e.target.value)}
              className="border rounded-md px-2 py-1 text-sm bg-white cursor-pointer"
            >
              <option value="all">All ({countAssign("all")})</option>
              <option value="assigned">Assigned ({countAssign("assigned")})</option>
              <option value="unassigned">Un‑assigned ({countAssign("unassigned")})</option>
            </select>
          </label>
        )} */}
      </div>

      {/* list / loader / empty */}
      {loading ? (
        <div className="flex justify-center p-8">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      ) : filteredQueries.length === 0 ? (
        <div className="flex flex-col items-center gap-2 p-8 text-muted-foreground">
          <HelpCircle className="w-10 h-10" />
          <p>No queries found.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredQueries.map((q) => <QueryCard key={q._id} query={q} />)}
        </div>
      )}

      {/* Drawer (chat / details) */}
      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent
          side={isTab ? "right" : "bottom"}
          className="flex flex-col w-full sm:max-w-md p-0 sm:h-full h-[75vh] max-sm:rounded-t-2xl"
        >
          {selectedQuery && (
            <>
              {/* <SheetHeader className="p-6 border-b space-y-1">
                <h3 className="font-semibold line-clamp-">Order: {selectedQuery?.orderId?.orderId}</h3>
                <SheetTitle className="flex items-center gap-2">
                  <HelpCircle className="w-5 h-5" />
                  {selectedQuery.title}
                </SheetTitle>

                <DescriptionBlock description={selectedQuery.description} />

                <StatusPill resolved={selectedQuery.isResolved} />
              </SheetHeader> */}
              <QuerySheetHeader query={selectedQuery} />
              <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 bg-gray-50">
                {selectedQuery.replies.length
                  ? selectedQuery.replies.map((r, idx) => <ReplyBubble key={idx} reply={r} />)
                  : <p className="text-sm text-muted-foreground">No replies yet.</p>}

                {selectedQuery.rating && (
                  <div className="px-3 py-2 rounded-md bg-yellow-50 text-sm">
                    <div className="flex items-center gap-2 mb-1">
                      <Stars rating={selectedQuery.rating} />
                      <span className="text-xs">({selectedQuery.rating}/10)</span>
                    </div>
                    <p className="text-muted-foreground text-xs whitespace-pre-wrap">
                      {selectedQuery.review || "No review message."}
                    </p>
                  </div>
                )}
              </div>

              {selectedQuery.isResolved ? (
                !selectedQuery.rating && (
                  <div className="p-4 border-t bg-white flex justify-center">
                    <Button variant="outline" size="sm" className="gap-2" onClick={() => setRatingOpen(true)}>
                      <Star className="w-4 h-4" />Rate Support
                    </Button>
                  </div>
                )
              ) : 
              // selectedQuery.assignedTo ? (
                <div className="p-4 border-t bg-white flex gap-2">
                  <Input value={replyText} onChange={(e) => setReplyText(e.target.value)} placeholder="Type your message…" />
                  <Button onClick={sendReply} disabled={sendingReply || !replyText.trim()} size="icon">
                    {sendingReply ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </Button>
                </div>
              // ) : (
                // <div className="p-4 border-t bg-white text-sm text-muted-foreground text-center">
                //   This query is not yet assigned.
                // </div>
              // )
              }
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* rating modal */}
      <Dialog open={ratingOpen} onOpenChange={setRatingOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Rate our support</DialogTitle>
            <DialogDescription>Please rate your resolution experience.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <label className="block text-sm font-medium">Rating: {ratingValue}/10</label>
            <input type="range" min={1} max={10} value={ratingValue} onChange={(e) => setRatingValue(+e.target.value)} className="w-full accent-yellow-500" />
            <Textarea rows={3} placeholder="Optional review…" value={reviewText} onChange={(e) => setReviewText(e.target.value)} />
            <Button onClick={submitRating} disabled={submittingRating} className="w-full">
              {submittingRating && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Submit
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
