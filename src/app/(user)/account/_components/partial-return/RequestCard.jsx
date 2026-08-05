'use client';

import React from "react";
import { Badge } from "@/components/ui/badge";

export default function RequestCard({ request, onClick }) {
  const status = request.status || "Pending";
  const itemsCount = request.items?.length || 0;
  const formattedDate = request.createdAt
    ? new Date(request.createdAt).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";

  return (
    <div
      onClick={() => onClick(request._id)}
      className="border rounded-xl p-4 bg-white hover:border-primary/50 transition-all cursor-pointer shadow-sm hover:shadow-md flex flex-col gap-2.5"
    >
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground font-semibold">
          Raised on {formattedDate}
        </span>
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

      <div>
        <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
          Return Reason
        </span>
        <p className="text-xs font-semibold text-foreground truncate mt-0.5">
          {request.reason}
        </p>
      </div>

      <div className="flex justify-between items-center border-t pt-2 mt-1">
        <span className="text-[11px] text-muted-foreground font-medium">
          Items for Return: <span className="font-bold text-foreground">{itemsCount}</span>
        </span>
        <span className="text-[11px] text-primary font-bold hover:underline">
          View Details &rarr;
        </span>
      </div>
    </div>
  );
}
