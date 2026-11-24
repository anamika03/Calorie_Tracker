import Link from "next/link";
import { Icon } from "@/components/Icon";
import { PageHeader } from "@/components/PageHeader";
import { RecipeCard } from "@/components/RecipeCard";
import { aiMode } from "@/lib/ai";
import { listStock } from "@/lib/data";
import { suggestFromStock } from "@/lib/recipes";
import { AiRecipes } from "./AiRecipes";

export const dynamic = "force-dynamic";

export default function Recipes() {
  const stock = listStock();
  const recipes = suggestFromStock(stock);
  return (
    <div className="space-y-6">
      <PageHeader title="Recipes" icon="recipes" />
      {stock.length === 0 ? (
        <div className="card flex flex-col items-center gap-3 p-8 text-center">
          <Icon name="recipes" size={56} />
          <p className="text-muted">Add what&apos;s in your kitchen and we&apos;ll suggest recipes you can cook right now.</p>
          <Link href="/stock" className="btn">Add stock</Link>
        </div>
      ) : (
        <>
          <p className="text-sm text-muted">Recipes that use at least 70% ingredients you already have ({stock.length} items in stock).</p>
          {recipes.length === 0 ? (
            <div className="card p-6 text-center text-muted">No library recipe matches your stock yet. Add more items, or ask Claude below.</div>
          ) : (
            <div className="space-y-4">{recipes.map((r) => <RecipeCard key={r.name} recipe={r} />)}</div>
          )}
          <AiRecipes aiEnabled={aiMode() !== "off"} />
        </>
      )}
    </div>
  );
}
