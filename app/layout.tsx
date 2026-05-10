import type { Metadata } from "next";
import { Cormorant_Garamond, Montserrat } from "next/font/google";
import "./globals.css";
import { CartProvider } from "../context/CartContext";
import { AuthProvider } from "../context/AuthContext";
import SiteHeader from "../components/SiteHeader";
import CartOverlays from "../components/CartOverlays";
import SiteFooter from "../components/SiteFooter";

const cormorant = Cormorant_Garamond({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-cormorant",
  display: "swap",
});

const montserrat = Montserrat({
  weight: "300",
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
});

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
    <html lang="es" className={`${cormorant.variable} ${montserrat.variable}`}>
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
