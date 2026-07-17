import { Metadata } from "next";
import TalentGraphContainer from "@/components/graph/TalentGraphContainer";

export const metadata: Metadata = {
  title: "TalentGraph | AI Marketing Platform",
  description: "Visualize and analyze the relationships in your marketing ecosystem.",
};

export default function TalentGraphPage() {
  return (
    <div className="flex h-[calc(100vh-4rem)] w-full flex-col p-4 bg-background">
      <div className="flex flex-col gap-2 mb-4">
        <h1 className="text-3xl font-bold tracking-tight">TalentGraph</h1>
        <p className="text-muted-foreground">
          Explore the interconnected network of your brands, campaigns, AI agents, and content.
        </p>
      </div>
      
      <div className="flex-1 rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden relative glassmorphism">
        <TalentGraphContainer />
      </div>
    </div>
  );
}
