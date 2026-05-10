import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "../context/CartContext";
import { AuthProvider } from "../context/AuthContext";
import SiteHeader from "../components/SiteHeader";
import CartOverlays from "../components/CartOverlays";
import SiteFooter from "../components/SiteFooter";

export const metadata: Metadata = {
  title: {
    template: "%s — SANGRIA",
    default: "SANGRIA — Joyería",
  },
  description: "Joyería artesanal. Piezas únicas en plata.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>
        <AuthProvider>
          <CartProvider>
            <SiteHeader />
            {children}
            <SiteFooter />
            <CartOverlays />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
