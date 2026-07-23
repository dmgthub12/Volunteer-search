import { getOpportunities } from "../../lib/data";
import { OpportunityBrowser } from "./OpportunityBrowser";

export default async function OpportunitiesPage() {
  const opportunities = await getOpportunities();
  const towns = Array.from(
    new Set(opportunities.map((opportunity) => opportunity.town))
  ).sort();
  const categories = Array.from(
    new Set(opportunities.map((opportunity) => opportunity.category))
  ).sort();

  return (
    <main className="mx-auto max-w-6xl px-5 py-10 sm:px-6 lg:px-8">
      <section className="mb-8">
        <p className="text-sm font-semibold uppercase text-primary">
          Volunteer directory
        </p>
        <h1 className="mt-3 text-3xl font-bold text-primary sm:text-5xl">
          Find a place to make a difference.
        </h1>
      </section>
      <OpportunityBrowser
        categories={categories}
        opportunities={opportunities}
        towns={towns}
      />
    </main>
  );
}
