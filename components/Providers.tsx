"use client";

import { Suspense } from "react";
import { ConsentBanner } from "@/components/ConsentBanner";
import { VisitorTracker } from "@/components/VisitorTracker";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { CatalogProvider } from "@/context/CatalogContext";
import { ConsentProvider } from "@/context/ConsentContext";
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ConsentProvider>
      <CatalogProvider>
        <AuthProvider>
          <CartProvider>
            <Suspense fallback={null}>
              <VisitorTracker />
            </Suspense>
            {children}
            <ConsentBanner />
          </CartProvider>
        </AuthProvider>
      </CatalogProvider>
    </ConsentProvider>
  );
}
