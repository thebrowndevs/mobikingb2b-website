import React, { useRef, useEffect } from "react";

export default function OtpInput({ value, onChange, length = 6, disabled = false }) {
  const inputsRef = useRef([]);

  useEffect(() => {
    // Focus first input on mount if not disabled
    if (!disabled && inputsRef.current[0]) {
      inputsRef.current[0].focus();
    }
  }, [disabled]);

  const getOtpArray = () => {
    const arr = value.split("");
    while (arr.length < length) {
      arr.push("");
    }
    return arr.slice(0, length);
  };

  const otpArray = getOtpArray();

  const handleInputChange = (e, index) => {
    const val = e.target.value.replace(/\D/g, "");
    if (!val) return;

    const newOtpArray = [...otpArray];
    // Keep only the last char if multiple entered
    newOtpArray[index] = val.slice(-1);
    const newOtp = newOtpArray.join("");
    onChange(newOtp);

    // Auto-focus next input
    if (index < length - 1 && inputsRef.current[index + 1]) {
      inputsRef.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace") {
      const newOtpArray = [...otpArray];
      if (otpArray[index]) {
        newOtpArray[index] = "";
        onChange(newOtpArray.join(""));
      } else if (index > 0 && inputsRef.current[index - 1]) {
        // If current box is empty, clear previous box and focus it
        newOtpArray[index - 1] = "";
        onChange(newOtpArray.join(""));
        inputsRef.current[index - 1].focus();
      }
    } else if (e.key === "ArrowLeft" && index > 0 && inputsRef.current[index - 1]) {
      inputsRef.current[index - 1].focus();
    } else if (e.key === "ArrowRight" && index < length - 1 && inputsRef.current[index + 1]) {
      inputsRef.current[index + 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    if (pastedData) {
      onChange(pastedData);
      const focusIndex = Math.min(pastedData.length, length - 1);
      if (inputsRef.current[focusIndex]) {
        inputsRef.current[focusIndex].focus();
      }
    }
  };

  return (
    <div className="flex gap-2 justify-center" onPaste={handlePaste}>
      {otpArray.map((char, index) => (
        <input
          key={index}
          ref={(el) => (inputsRef.current[index] = el)}
          type="tel"
          maxLength={1}
          value={char}
          disabled={disabled}
          onChange={(e) => handleInputChange(e, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          className="w-12 h-14 text-center text-xl font-bold border border-slate-200 focus:border-slate-400 focus:ring-2 focus:ring-slate-100 rounded-xl bg-slate-50/60 focus:bg-white outline-none transition-all duration-150"
        />
      ))}
    </div>
  );
}
