'use client';

import React, { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MessageSquare, Send, Loader2 } from "lucide-react";
import { apiConnector } from "@/lib/services/apiConnector";
import { orderEndpoints } from "@/lib/api";
import { toast } from "sonner";
import ChatMessageBubble from "./ChatMessageBubble";

export default function RequestChatSection({ requestId, replies, accessToken, onRefreshRequest }) {
  const [replyMessage, setReplyMessage] = useState("");
  const [sending, setSending] = useState(false);
  const chatEndRef = useRef(null);

  // Auto-scroll to bottom of chat when replies change
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [replies]);

  // Set up 5s polling interval for new replies
  useEffect(() => {
    if (!requestId) return;

    const interval = setInterval(() => {
      onRefreshRequest(requestId, false); // poll silently without loading spinner
    }, 5000);

    return () => clearInterval(interval);
  }, [requestId, onRefreshRequest]);

  const handleSendReply = async () => {
    if (!replyMessage.trim() || !requestId) return;

    try {
      setSending(true);
      const { data } = await apiConnector(
        "POST",
        orderEndpoints.PLACE_PARTIAL_RETURN_REPLY_API,
        { requestId, message: replyMessage.trim() },
        {
          Authorization: `Bearer ${accessToken}`,
        }
      );

      if (data?.success) {
        setReplyMessage("");
        // Instantly invoke refetch to update the message list
        await onRefreshRequest(requestId, false);
      } else {
        toast.error(data?.message || "Failed to send message");
      }
    } catch (err) {
      console.error(err);
      toast.error("Could not send reply");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col border rounded-xl overflow-hidden bg-white shadow-sm flex-1 max-h-[480px]">
      {/* Header */}
      <div className="bg-gray-100 px-4 py-3 border-b flex items-center gap-2">
        <MessageSquare className="w-4 h-4 text-primary" />
        <span className="text-xs font-bold text-foreground">Support Chat Thread</span>
      </div>

      {/* Messages area */}
      <div className="p-4 overflow-y-auto flex-1 space-y-3 bg-gray-50/30 min-h-[220px]">
        {replies.length === 0 ? (
          <p className="text-center text-xs text-muted-foreground italic py-8">
            No messages in support thread yet. Start the conversation below.
          </p>
        ) : (
          replies.map((reply, index) => (
            <ChatMessageBubble key={reply._id || index} reply={reply} />
          ))
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-3 border-t flex gap-2 items-center bg-white">
        <Input
          placeholder="Type reply to customer support..."
          value={replyMessage}
          onChange={(e) => setReplyMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSendReply();
            }
          }}
          className="text-xs h-9 border-muted"
          disabled={sending}
        />
        <Button
          size="sm"
          onClick={handleSendReply}
          disabled={sending || !replyMessage.trim()}
          className="h-9 px-4 shrink-0"
        >
          {sending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </Button>
      </div>
    </div>
  );
}
