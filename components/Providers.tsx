"use client";

import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { LocationProvider } from "@/context/LocationContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <LocationProvider>
        <CartProvider>{children}</CartProvider>
      </LocationProvider>
    </AuthProvider>
  );
}
