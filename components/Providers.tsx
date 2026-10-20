"use client";

import { Suspense } from "react";
import { ConsentBanner } from "@/components/ConsentBanner";
import { VisitorTracker } from "@/components/VisitorTracker";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { CatalogProvider } from "@/context/CatalogContext";
import { ConsentProvider } from "@/context/ConsentContext";
import { LocationProvider } from "@/context/LocationContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ConsentProvider>
      <CatalogProvider>
        <AuthProvider>
          <LocationProvider>
            <CartProvider>
              <Suspense fallback={null}>
                <VisitorTracker />
              </Suspense>
              {children}
              <ConsentBanner />
            </CartProvider>
          </LocationProvider>
        </AuthProvider>
      </CatalogProvider>
    </ConsentProvider>
  );
}
