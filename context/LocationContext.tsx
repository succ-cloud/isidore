"use client";

import { createContext, useContext, useEffect, useState } from "react";

type LocationContextValue = {
  branchId: string | null;
  ready: boolean;
  setBranchId: (id: string) => void;
};

const LocationContext = createContext<LocationContextValue | null>(null);
const STORAGE_KEY = "isdore-branch";

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [branchId, setBranchIdState] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setBranchIdState(localStorage.getItem(STORAGE_KEY));
    setReady(true);
  }, []);

  function setBranchId(id: string) {
    setBranchIdState(id);
    localStorage.setItem(STORAGE_KEY, id);
  }

  return (
    <LocationContext.Provider value={{ branchId, ready, setBranchId }}>{children}</LocationContext.Provider>
  );
}

export function useLocation() {
  const value = useContext(LocationContext);
  if (!value) throw new Error("useLocation must be used within LocationProvider");
  return value;
}
