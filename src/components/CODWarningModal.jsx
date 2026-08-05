"use client";

import React from "react";
import { AlertTriangle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function CODWarningModal({ modalKey, activeKey, onClose, title = "Warning", message }) {
    const open = modalKey === activeKey;

    return (
        <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-red-600">
                        <AlertTriangle className="h-5 w-5" />
                        {title}
                    </DialogTitle>
                    <DialogDescription className="pt-2 text-gray-700">
                        {message}
                    </DialogDescription>
                </DialogHeader>
                <div className="flex justify-end pt-4">
                    <Button variant="destructive" onClick={onClose}>
                        OK
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
