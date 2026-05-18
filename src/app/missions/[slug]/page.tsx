import { notFound } from "next/navigation";
import { getMission, MISSIONS } from "@/lib/missions";
import { MissionView } from "./MissionView";

export function generateStaticParams() {
  return MISSIONS.filter((m) => m.available).map((m) => ({ slug: m.slug }));
}

export default function MissionPage({ params }: { params: { slug: string } }) {
  const mission = getMission(params.slug);
  if (!mission || !mission.available) notFound();
  return <MissionView mission={mission} />;
}
