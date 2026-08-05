import { MapPin } from "lucide-react";
import React from "react";

export default function MapButton() {
  return (
    <div className="flex items-center gap-1 text-sm text-muted-foreground cursor-pointer hover:text-black transition">
      <MapPin size={16} className="text-primary" />
      <span>New Delhi, India</span>
    </div>
  );
}
