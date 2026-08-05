"use client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import React from "react";

export default function NotFound() {
  const router = useRouter();

  const handleGoBack = () => {
    // Go back to previous page if possible, otherwise go to home
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  };

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center gap-6 px-4">
      <div className="text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
          404 - Page Not Found
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-md mx-auto">
          Oops! The page you're looking for doesn't exist or has been moved.
        </p>
      </div>

      <div className="flex gap-4">
        <Button variant={"default"} onClick={handleGoBack}>
          Go Back
        </Button>
        <Button
          onClick={() => router.push("/")}
          variant="outline"
          className="px-6 py-3 border-gray-300 hover:bg-gray-50"
        >
          Return Home
        </Button>
      </div>
    </div>
  );
}
