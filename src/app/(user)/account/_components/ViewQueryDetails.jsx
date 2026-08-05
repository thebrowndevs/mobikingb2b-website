"use client";

import React, { useState } from "react";
import {
    Sheet,
    SheetContent,
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
import {
    Loader2,
    Send,
    Star,
    StarOff,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { addReplyToQuery, addRatingToQuery } from "@/lib/services/operations/QueryApi";
import { useBreakpoint } from "@/hooks/use-breakpoint";
import QuerySheetHeader from "./QuerySheetHeader";

export default function ViewQueryDetails({ query, open, setIsOpen }) {
    const { accessToken, user } = useAuth();
    const { isTab } = useBreakpoint();

    const [selectedQuery, setSelectedQuery] = useState(query);
    const [replyText, setReplyText] = useState("");
    const [sendingReply, setSendingReply] = useState(false);
    const [ratingOpen, setRatingOpen] = useState(false);
    const [ratingValue, setRatingValue] = useState(5);
    const [reviewText, setReviewText] = useState("");
    const [submittingRating, setSubmittingRating] = useState(false);

    const refreshInState = (upd) => {
        setSelectedQuery(upd);
    };

    const Stars = ({ rating }) => (
        <span className="flex items-center gap-0.5">
            {Array.from({ length: 5 }, (_, i) =>
                i < Math.round(rating / 2)
                    ? <Star key={i} className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                    : <StarOff key={i} className="w-4 h-4 text-gray-400" />
            )}
        </span>
    );

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
        } catch {
            toast.error("Failed to send reply");
        } finally {
            setSendingReply(false);
        }
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
        } catch {
            toast.error("Failed to submit rating");
        } finally {
            setSubmittingRating(false);
        }
    };

    return (
        <>

            <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                    setIsOpen(true);
                }}
            >
                View Query Details
            </Button>

            <Sheet open={open} onOpenChange={setIsOpen}>
                <SheetContent
                    side={isTab ? "right" : "bottom"}
                    className="flex flex-col w-full sm:max-w-md p-0 sm:h-full h-[75vh] max-sm:rounded-t-2xl"
                >
                    {selectedQuery && (
                        <>
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
                            ) : (
                                <div className="p-4 border-t bg-white flex gap-2">
                                    <Input value={replyText} onChange={(e) => setReplyText(e.target.value)} placeholder="Type your message…" />
                                    <Button onClick={sendReply} disabled={sendingReply || !replyText.trim()} size="icon">
                                        {sendingReply ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                    </Button>
                                </div>
                            )}
                        </>
                    )}
                </SheetContent>
            </Sheet>

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
