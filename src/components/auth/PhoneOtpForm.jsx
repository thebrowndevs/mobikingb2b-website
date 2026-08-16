import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { loginUser, registerUser, sendOtp } from "@/lib/services/operations/LoginApi";
import { ArrowLeft, Loader2, MessageSquare, Phone } from "lucide-react";
import { toast } from "sonner";
import OtpInput from "./OtpInput";
import { motion, AnimatePresence } from "framer-motion";

export default function PhoneOtpForm({ type = "login" }) {
  const router = useRouter();
  const { login, refreshOnboardingStatus } = useAuth();

  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  useEffect(() => {
    let interval;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handlePhoneChange = (e) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, 10);
    setPhone(val);
  };

  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    if (phone.length !== 10) {
      toast.error("Please enter a valid 10-digit mobile number");
      return;
    }

    setIsLoading(true);
    try {
      const data = {
        phoneNo: phone,
        mobile: phone,
        role: "user",
      };

      const res = await sendOtp(data);
      console.log(res);
      if (res) {
        setOtpSent(true);
        setResendTimer(30);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    if (e) e.preventDefault();
    if (otp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }

    setIsLoading(true);
    try {
      const data = {
        phoneNo: phone,
        mobile: phone,
        otp,
        role: "user",
      };

      const authApi = type === "login" ? loginUser : registerUser;
      const res = await authApi(data);

      if (res?.data) {
        await login(res.data);

        // Refresh and check onboarding status step
        const step = await refreshOnboardingStatus();

        if (step === 0) {
          router.push("/onboarding/business");
        } else if (step === 1) {
          router.push("/onboarding/warehouse");
        } else {
          router.push("/");
        }
      } else {
        toast.error(res?.message || "OTP verification failed");
      }
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || err?.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 md:p-8 bg-white border border-slate-150 rounded-2xl">
      <AnimatePresence mode="wait">
        {!otpSent ? (
          <motion.div
            key="phone-step"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ duration: 0.2 }}
          >
            <div className="mb-6">
              <div className="w-12 h-12 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-primary mb-4">
                <Phone size={22} />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 tracking-tighter">
                {type === "login" ? "Welcome Back" : "Create Account"}
              </h2>
              <p className="text-sm font-medium text-slate-500 mt-1">
                Enter your mobile number to receive a secure OTP code.
              </p>
            </div>

            <form onSubmit={handleSendOtp} className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Mobile Number
                </label>
                <div className="flex items-center border border-slate-200 bg-slate-50/60 hover:bg-white hover:border-slate-300 focus-within:bg-white focus-within:border-slate-400 focus-within:ring-2 focus-within:ring-slate-100 rounded-xl overflow-hidden transition-all duration-150">
                  <span className="pl-4 pr-2 py-3 text-slate-500 font-bold border-r border-slate-200 select-none">
                    +91
                  </span>
                  <input
                    type="tel"
                    value={phone}
                    onChange={handlePhoneChange}
                    maxLength={10}
                    inputMode="numeric"
                    required
                    placeholder="Enter 10-digit number"
                    className="w-full bg-transparent px-3 py-3 outline-none text-slate-800 text-sm font-medium placeholder:text-slate-400 border-0 focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={phone.length !== 10 || isLoading}
                className="w-full flex items-center justify-center gap-2 rounded-full bg-primary hover:bg-primary/90 active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 text-white font-bold py-3.5 text-xs uppercase tracking-wider transition-all duration-150 cursor-pointer border-0 mt-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Sending Code...</span>
                  </>
                ) : (
                  <span>Send OTP Code</span>
                )}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-slate-100 text-center">
              <p className="text-xs font-semibold text-slate-500">
                {type === "login" ? (
                  <>
                    New to Mobiking B2B?{" "}
                    <button
                      onClick={() => router.push("/register")}
                      className="text-primary font-bold hover:underline cursor-pointer border-0 bg-transparent p-0"
                    >
                      Register Free
                    </button>
                  </>
                ) : (
                  <>
                    Already registered?{" "}
                    <button
                      onClick={() => router.push("/login")}
                      className="text-primary font-bold hover:underline cursor-pointer border-0 bg-transparent p-0"
                    >
                      Log In
                    </button>
                  </>
                )}
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="otp-step"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
          >
            <div className="mb-6">
              <button
                onClick={() => setOtpSent(false)}
                className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-primary transition-colors cursor-pointer border-0 bg-transparent p-0 mb-4"
              >
                <ArrowLeft size={14} />
                <span>Change Number</span>
              </button>
              <div className="w-12 h-12 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-primary mb-4">
                <MessageSquare size={22} />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 tracking-tighter">
                Verify Mobile
              </h2>
              <p className="text-sm font-medium text-slate-500 mt-1">
                Enter the 6-digit OTP code sent to{" "}
                <span className="font-bold text-slate-700">+91 {phone}</span>.
              </p>
            </div>

            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div className="flex flex-col gap-3">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider text-center">
                  Verification Code
                </label>
                <OtpInput
                  value={otp}
                  onChange={setOtp}
                  length={6}
                  disabled={isLoading}
                />
              </div>

              <div className="text-center">
                {resendTimer > 0 ? (
                  <p className="text-xs font-semibold text-slate-400">
                    Resend code in <span className="font-bold text-slate-600">{resendTimer}s</span>
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    className="text-xs font-bold text-primary hover:underline cursor-pointer border-0 bg-transparent p-0"
                  >
                    Resend OTP Code
                  </button>
                )}
              </div>

              <button
                type="submit"
                disabled={otp.length !== 6 || isLoading}
                className="w-full flex items-center justify-center gap-2 rounded-full bg-primary hover:bg-primary/90 active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 text-white font-bold py-3.5 text-xs uppercase tracking-wider transition-all duration-150 cursor-pointer border-0"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Verifying Code...</span>
                  </>
                ) : (
                  <span>Verify & Continue</span>
                )}
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
