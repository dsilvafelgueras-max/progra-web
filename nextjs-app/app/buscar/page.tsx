import type { Metadata } from "next";
import { Suspense } from "react";
import SearchResultsClient from "../../components/SearchResultsClient";

export const metadata: Metadata = { title: "Buscar" };

export default function BuscarPage() {
  return (
    <Suspense>
      <SearchResultsClient />
    </Suspense>
  );
}
