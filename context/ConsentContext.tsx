"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Choice = "granted" | "denied" | null;

type ConsentValue = {
  choice: Choice;
  ready: boolean;
  grant: () => void;
  deny: () => void;
};

const ConsentContext = createContext<ConsentValue | null>(null);
const KEY = "isdore-consent";

function writeCookie(value: "granted" | "denied") {
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `isdore_consent=${value}; Path=/; Max-Age=31536000; SameSite=Lax${secure}`;
}

export function ConsentProvider({ children }: { children: React.ReactNode }) {
  const [choice, setChoice] = useState<Choice>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(KEY);
    if (saved === "granted" || saved === "denied") {
      setChoice(saved);
      writeCookie(saved);
    }
    setReady(true);
  }, []);

  function persist(value: "granted" | "denied") {
    localStorage.setItem(KEY, value);
    writeCookie(value);
    setChoice(value);
    if (value === "denied") {
      void fetch("/api/analytics/forget", { method: "POST", credentials: "same-origin" }).catch(() => undefined);
    }
  }

  return (
    <ConsentContext.Provider value={{ choice, ready, grant: () => persist("granted"), deny: () => persist("denied") }}>
      {children}
    </ConsentContext.Provider>
  );
}

export function useConsent() {
  const value = useContext(ConsentContext);
  if (!value) throw new Error("useConsent must be used within ConsentProvider");
  return value;
}
