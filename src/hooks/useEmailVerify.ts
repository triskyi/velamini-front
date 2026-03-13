"use client";

import { useEffect, useRef, useState } from "react";

type VerifyState = "idle" | "checking" | "ok" | "error";

interface UseEmailVerifyResult {
  state: VerifyState;
  message: string;
  accept: boolean;
  check: (email: string, isOrg?: boolean) => Promise<boolean>;
  reset: () => void;
}

export function useEmailVerify(): UseEmailVerifyResult {
  const [state, setState] = useState<VerifyState>("idle");
  const [message, setMessage] = useState("");
  const [accept, setAccept] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const reset = () => {
    setState("idle");
    setMessage("");
    setAccept(false);
    if (debounceRef.current) clearTimeout(debounceRef.current);
  };

  const check = async (email: string, isOrg = false): Promise<boolean> => {
    if (!email.trim()) {
      setState("error");
      setMessage("Please enter your email address.");
      setAccept(false);
      return false;
    }

    setState("checking");
    setMessage("Checking email...");

    try {
      const res = await fetch("/api/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), isOrg }),
      });
      const data = await res.json();

      if (data.accept) {
        setState("ok");
        setMessage(typeof data.message === "string" ? data.message : "");
        setAccept(true);
        return true;
      }

      setState("error");
      setMessage(data.message || "Please enter a valid email address.");
      setAccept(false);
      return false;
    } catch {
      setState("ok");
      setMessage("");
      setAccept(true);
      return true;
    }
  };

  return { state, message, accept, check, reset };
}

export function useEmailVerifyDebounced(email: string, isOrg = false) {
  const [result, setResult] = useState<{
    email: string;
    state: Exclude<VerifyState, "checking">;
    message: string;
  }>({
    email: "",
    state: "idle",
    message: "",
  });
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const trimmedEmail = email.trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  const hasEmail = trimmedEmail.length > 0;
  const hasBasicError = hasEmail && !emailRegex.test(trimmedEmail);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!hasEmail || hasBasicError) {
      return;
    }

    setResult({
      email: trimmedEmail,
      state: "idle",
      message: "Checking email...",
    });

    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch("/api/verify-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: trimmedEmail.toLowerCase(), isOrg }),
        });
        const data = await res.json();

        if (data.accept) {
          setResult({
            email: trimmedEmail,
            state: "ok",
            message: typeof data.message === "string" ? data.message : "",
          });
        } else {
          setResult({
            email: trimmedEmail,
            state: "error",
            message: data.message || "Invalid email address.",
          });
        }
      } catch {
        setResult({
          email: trimmedEmail,
          state: "idle",
          message: "",
        });
      }
    }, 500);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [hasBasicError, hasEmail, isOrg, trimmedEmail]);

  if (!hasEmail) {
    return { state: "idle" as const, message: "" };
  }

  if (hasBasicError) {
    return { state: "error" as const, message: "Please enter a valid email address." };
  }

  if (result.email !== trimmedEmail) {
    return { state: "checking" as const, message: "Checking email..." };
  }

  return { state: result.state, message: result.message };
}
