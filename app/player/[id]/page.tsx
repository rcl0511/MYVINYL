import { notFound } from "next/navigation";
import { getLPById } from "@/lib/mock-data";
import PlayerClient from "./PlayerClient";

export default async function PlayerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const lp = getLPById(id);
  if (!lp) notFound();
  return <PlayerClient lp={lp} />;
}
