import { notFound } from "next/navigation";
import { getLPById } from "@/lib/mock-data";
import LPDetailClient from "./LPDetailClient";

export default async function LPDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const lp = getLPById(id);
  if (!lp) notFound();
  return <LPDetailClient lp={lp} />;
}
