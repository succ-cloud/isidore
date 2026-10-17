"use client";

import { useLocation } from "@/context/LocationContext";

export function SelectBranch({ id, city }: { id: string; city: string }) {
  const { branchId, setBranchId } = useLocation();
  const selected = branchId === id;
  return (
    <button className={selected ? "btn-navy" : "btn-green"} type="button" onClick={() => setBranchId(id)}>
      {selected ? `Shopping from ${city}` : `Shop from ${city}`}
    </button>
  );
}
