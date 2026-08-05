"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "./ui/input";
import Link from "next/link";
import Image from "next/image";
import { Button } from "./ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { loginUser, sendOtp } from "@/lib/services/operations/LoginApi";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

export default function LoginDialog({ open, onOpenChange }) {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userTokenData, setUserTokenData] = useState(null);
  const { login } = useAuth();

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, "");
    setPhone(value);
  };

  const handleOtpChange = (e) => {
    const value = e.target.value.replace(/\D/g, "");
    setOtp(value);
  };

  const handleSendOtp = async () => {
    if (phone.length !== 10) return;
    setIsLoading(true);

    try {
      const data = {
        phoneNo: phone,
        mobile: phone,
        role: "user",
      };

      // const res = await loginUser(data);
      const res = await sendOtp(data);
      // console.log("SEND API Response:", res); // Log the response
      // console.log("Login API Response:", res); // Log the response
      if (res) {
        //   setUserTokenData(res);
        setOtpSent(true);
      }
    } catch (err) {
      // console.error("Send OTP error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setIsLoading(true);

    try {
      const data = {
        phoneNo: phone,
        mobile: phone,
        otp,
        role: "user",
      };
      // console.log(data);
      const res = await loginUser(data);
      // console.log(res);
      // return;
      // if (userTokenData?.accessToken) {
      if (res?.data) {
        // const userTokens = {
        //   accessToken: res?.accessToken,
        //   refreshToken: res?.refreshToken,
        // }
        setUserTokenData(res?.data);
        login(res?.data);
        onOpenChange(false);
        setPhone("");
        setOtp("");
        setOtpSent(false);
        // toast.success(res?.message);
      } else {
        console.warn(res?.message);
        toast.error(res?.message);
      }
    } catch (err) {
      console.error("OTP verification error:", err);
      toast.error(err?.response?.data?.message || err?.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="lg:max-w-md w-full rounded-xl">
        <DialogHeader className="flex flex-col items-center justify-center">
          <Link href="/">
            <Image src="/logo.webp" alt="logo" width={200} height={200} />
          </Link>
          <DialogTitle className="text-lg font-bold text-center">
            {otpSent ? "Verify OTP" : "Login"}
          </DialogTitle>
          <DialogDescription className="text-sm text-center text-muted-foreground">
            {otpSent
              ? "Enter the OTP sent to your mobile"
              : "Enter your mobile number to continue"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          {!otpSent ? (
            <>
              <div className="flex items-center border-2 border-black/10 rounded-md overflow-hidden focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all">
                <span className="bg-gray-100 p-1.5 select-none"> +91</span>
                <Input
                  type="tel"
                  value={phone}
                  onChange={handlePhoneChange}
                  maxLength={10}
                  inputMode="numeric"
                  placeholder="Enter 10-digit mobile number"
                  className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                />
              </div>

              <Button
                onClick={handleSendOtp}
                disabled={phone.length !== 10 || isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Send OTP"
                )}
              </Button>
            </>
          ) : (
            <>
              <div className="text-center text-sm">
                OTP sent to +91{phone.slice(0, 3)}****{phone.slice(7)}
              </div>
              <Input
                type="tel"
                value={otp}
                onChange={handleOtpChange}
                maxLength={6}
                inputMode="numeric"
                placeholder="Enter 6-digit OTP"
                className="text-center text-lg"
              />
              <div className="flex flex-row gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setOtpSent(false);
                    setOtp("");
                  }}
                  className="w-1/2"
                  disabled={isLoading}
                >
                  <ArrowLeft size={16} />
                </Button>
                <Button
                  onClick={handleVerifyOtp}
                  disabled={otp.length !== 6 || isLoading}
                  className="w-1/2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    "Verify"
                  )}
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
