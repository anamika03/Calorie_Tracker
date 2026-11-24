import { PageHeader } from "@/components/PageHeader";
import { aiMode } from "@/lib/ai";
import { LogMeal } from "./LogMeal";

export const dynamic = "force-dynamic";

function defaultSlot() {
  const h = new Date().getHours();
  if (h < 11) return "breakfast";
  if (h < 15) return "lunch";
  if (h < 21) return "dinner";
  return "snack";
}

export default function LogPage() {
  return (
    <div>
      <PageHeader title="Log meal" icon="logMeal" />
      <LogMeal aiEnabled={aiMode() !== "off"} defaultSlot={defaultSlot()} />
    </div>
  );
}
