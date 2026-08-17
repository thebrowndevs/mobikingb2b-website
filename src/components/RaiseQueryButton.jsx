"use client";

import React, { useState } from "react";
import Link from "next/link";
import { MessageCircle } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { raiseQuery } from "@/lib/services/operations/QueryApi";
import { useAuth } from "@/context/AuthContext";

const RaiseQueryButton = ({ refreshOrder, closeSheet, isOpen, setIsOpen, orderId, className = "w-full" }) => {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    const { accessToken, setLoginOpen } = useAuth();

    const resetForm = () => {
        setTitle("");
        setDescription("");
        setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title.trim() || !description.trim()) {
            setError("Both title and description are required");
            return;
        }

        try {
            setSubmitting(true);
            const res = await raiseQuery(accessToken, { title, description, orderId });
            if (res) {
                refreshOrder(res);
                resetForm();
                setIsOpen(false);
                closeSheet();
            }
        } catch (err) {
            setError(err?.message || "Failed to raise query");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <>
            <Button
                variant="destructive"
                className={className}
                onClick={() => {
                    if (!accessToken) setLoginOpen(true);
                    else setIsOpen(true);
                }}
            >
                Raise Query
            </Button>


            {/* Modal */}
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="w-full max-w-sm sm:max-w-md rounded-xl">
                    <DialogHeader className="space-y-2">
                        <div className="flex justify-between items-center">
                            <DialogTitle className="text-base sm:text-lg">
                                Raise a Query
                            </DialogTitle>
                            <Button variant="outline" size="sm"
                                onClick={() => setIsOpen(false)}
                            >
                                <Link href="/account?tab=queries">
                                    My Queries
                                </Link>
                            </Button>
                        </div>

                        <DialogDescription className="text-center text-muted-foreground">
                            Please provide a brief title and a description of your issue.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Title *</label>
                            <Input
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Short summary"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Description *
                            </label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={4}
                                className="w-full border rounded-md px-3 py-2 text-sm bg-background"
                                placeholder="Describe your issue"
                                required
                            />
                        </div>

                        {error && <p className="text-sm text-red-600">{error}</p>}

                        <Button
                            type="submit"
                            disabled={submitting}
                            className="w-full disabled:opacity-60"
                        >
                            {submitting ? "Submitting..." : "Raise Query"}
                        </Button>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default RaiseQueryButton;
