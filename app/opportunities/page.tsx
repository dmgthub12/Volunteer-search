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
        <p className="text-sm font-semibold text-accent">
          Volunteer directory
        </p>
        <h1 className="mt-3 text-3xl font-bold text-primary sm:text-5xl">
          Find a volunteer role that fits your schedule.
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
          Filter by town, category, age, and commitment type to quickly narrow
          down opportunities for school service hours or community involvement.
        </p>
      </section>
      <OpportunityBrowser
        categories={categories}
        opportunities={opportunities}
        towns={towns}
      />
    </main>
  );
}
