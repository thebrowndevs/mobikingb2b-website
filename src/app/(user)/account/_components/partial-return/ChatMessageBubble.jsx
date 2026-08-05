'use client';

import React from "react";

export default function ChatMessageBubble({ reply }) {
  const isAdmin = reply.messagedBy?.role === "admin" || reply.messagedBy?.role === "employee";
  const senderName = isAdmin ? "Customer Support" : (reply.messagedBy?.name || "You");
  const formattedTime = reply.messagedAt
    ? `${new Date(reply.messagedAt).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
      })}, ${new Date(reply.messagedAt).toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })}`
    : "";

  return (
    <div className={`flex flex-col ${!isAdmin ? "items-end" : "items-start"} w-full`}>
      <span className="text-[10px] text-muted-foreground mb-0.5">
        {senderName} • {formattedTime}
      </span>
      <div
        className={`p-2.5 rounded-lg text-xs max-w-[85%] font-medium leading-relaxed ${
          !isAdmin
            ? "bg-primary text-white rounded-br-none"
            : "bg-gray-100 text-foreground border rounded-bl-none"
        }`}
      >
        {reply.message}
      </div>
    </div>
  );
}
