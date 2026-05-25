import type { Metadata } from "next";
import { Suspense } from "react";
import LoginForm from "../../components/LoginForm";

export const metadata: Metadata = { title: "Ingresar" };

// Suspense es requerido por Next.js 16 cuando el componente
// usa useSearchParams() — evita el error de build.
export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
