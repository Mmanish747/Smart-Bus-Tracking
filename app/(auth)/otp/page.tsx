"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, Mail } from "lucide-react";
import AuthLeftPanel from "@/component/auth/AuthLeftPanel";

export default function OTPPage() {
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);
  const [countdown, setCountdown] = useState(45);
  const [resending, setResending] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Countdown timer
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    // Auto-focus next
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const newOtp = pasted.split("").concat(Array(6 - pasted.length).fill(""));
    setOtp(newOtp);
    inputRefs.current[Math.min(pasted.length, 5)]?.focus();
  };

  const handleVerify = async () => {
    const code = otp.join("");
    if (code.length !== 6) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1500));
    setVerified(true);
    setLoading(false);
  };

  const handleResend = async () => {
    setResending(true);
    await new Promise((r) => setTimeout(r, 1000));
    setCountdown(45);
    setResending(false);
    setOtp(["", "", "", "", "", ""]);
  };

  const allFilled = otp.every((d) => d !== "");

  return (
    <div className="flex w-full max-w-[1280px] gap-6 lg:gap-10">
      {/* Left Panel */}
      <div className="hidden w-[45%] lg:block">
        <AuthLeftPanel
          heading={
            <>
              Almost There!
              <br />
              <span className="text-primary">Let&apos;s verify it&apos;s you</span>
            </>
          }
          description="We've sent a 6-digit verification code to example@gmail.com"
          features={[
            { icon: <ShieldCheck size={18} />, title: "Secure", description: "Encrypted verification" },
            { icon: <Mail size={18} />, title: "Email Sent", description: "Check your inbox" },
            { icon: <ShieldCheck size={18} />, title: "Quick", description: "Takes less than a minute" },
          ]}
        />
      </div>

      {/* Right Panel */}
      <div className="flex w-full items-center justify-center lg:w-[55%]">
        <div className="w-full max-w-[520px]">
          {/* Mobile Logo */}
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-xl">
              🚌
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">SmartBus</h1>
              <p className="text-xs text-gray-500">Tracking System</p>
            </div>
          </div>

          <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-xl shadow-gray-100/50 sm:p-10">
            {!verified ? (
              <>
                {/* Email Icon */}
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-green-50">
                  <Mail className="h-8 w-8 text-primary" />
                </div>

                <div className="mb-8">
                  <h2 className="text-2xl font-extrabold text-gray-900">Enter OTP</h2>
                  <p className="mt-2 text-sm leading-relaxed text-gray-500">
                    Enter the 6-digit code we sent to your email or phone number.
                  </p>
                </div>

                {/* OTP Input */}
                <div className="mb-6 flex justify-center gap-3">
                  {otp.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => { inputRefs.current[idx] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleChange(idx, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(idx, e)}
                      onPaste={handlePaste}
                      className="h-14 w-12 rounded-xl border-2 border-gray-200 bg-gray-50 text-center text-xl font-bold text-gray-900 outline-none transition focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/10 sm:h-16 sm:w-14"
                    />
                  ))}
                </div>

                {/* Resend */}
                <div className="mb-6 text-center">
                  {countdown > 0 ? (
                    <p className="text-sm text-gray-500">
                      Didn&apos;t receive the code?{" "}
                      <span className="font-semibold text-primary">
                        Resend OTP ({String(Math.floor(countdown / 60)).padStart(2, "0")}:{String(countdown % 60).padStart(2, "0")})
                      </span>
                    </p>
                  ) : (
                    <button
                      onClick={handleResend}
                      disabled={resending}
                      className="text-sm font-semibold text-primary transition hover:text-green-700"
                    >
                      {resending ? "Sending..." : "Resend OTP"}
                    </button>
                  )}
                </div>

                {/* Verify */}
                <button
                  onClick={handleVerify}
                  disabled={!allFilled || loading}
                  className="w-full rounded-xl bg-primary py-3.5 text-sm font-bold text-white shadow-lg shadow-green-200 transition hover:bg-green-700 hover:shadow-green-300 disabled:opacity-50"
                >
                  {loading ? "Verifying..." : "Verify OTP"}
                </button>

                {/* Divider */}
                <div className="my-7 flex items-center gap-4">
                  <div className="h-px flex-1 bg-gray-200" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">OR</span>
                  <div className="h-px flex-1 bg-gray-200" />
                </div>

                <Link
                  href="/forgot-password"
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                >
                  <ArrowLeft size={16} />
                  Back to Reset Password
                </Link>

                {/* Security */}
                <div className="mt-7 flex items-start gap-2.5 rounded-xl bg-gray-50 p-4">
                  <ShieldCheck size={16} className="mt-0.5 shrink-0 text-gray-400" />
                  <p className="text-xs leading-relaxed text-gray-500">
                    For your security, this code will expire in 10 minutes.
                  </p>
                </div>
              </>
            ) : (
              /* Success State */
              <>
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-green-50">
                  <svg className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>

                <div className="mb-8">
                  <h2 className="text-2xl font-extrabold text-gray-900">Verified!</h2>
                  <p className="mt-2 text-sm leading-relaxed text-gray-500">
                    Your identity has been verified. You can now reset your password.
                  </p>
                </div>

                <Link
                  href="/login"
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-bold text-white shadow-lg shadow-green-200 transition hover:bg-green-700"
                >
                  Continue to Sign In
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
