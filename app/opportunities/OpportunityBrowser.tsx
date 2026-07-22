"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { VolunteerOpportunity } from "../../lib/opportunities";

type Filters = {
  town: string;
  category: string;
  minimumAge: string;
  teenFriendly: boolean;
  weekend: boolean;
  duration: string;
};

const emptyFilters: Filters = {
  town: "",
  category: "",
  minimumAge: "",
  teenFriendly: false,
  weekend: false,
  duration: ""
};

function includesText(value: string, query: string) {
  return value.toLowerCase().includes(query.toLowerCase());
}

function getActiveFilterLabels(filters: Filters) {
  const labels: Array<{ key: keyof Filters; label: string }> = [];

  if (filters.town) labels.push({ key: "town", label: filters.town });
  if (filters.category) labels.push({ key: "category", label: filters.category });
  if (filters.minimumAge) {
    labels.push({ key: "minimumAge", label: `Age ${filters.minimumAge}+` });
  }
  if (filters.teenFriendly) labels.push({ key: "teenFriendly", label: "Teen friendly" });
  if (filters.weekend) labels.push({ key: "weekend", label: "Weekend" });
  if (filters.duration) labels.push({ key: "duration", label: filters.duration });

  return labels;
}

export function OpportunityBrowser({
  opportunities,
  towns,
  categories
}: {
  opportunities: VolunteerOpportunity[];
  towns: string[];
  categories: string[];
}) {
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<Filters>(emptyFilters);

  const filteredOpportunities = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const selectedMinimumAge = filters.minimumAge
      ? Number(filters.minimumAge)
      : null;

    return opportunities.filter((opportunity) => {
      const matchesSearch =
        !normalizedQuery ||
        [
          opportunity.organization,
          opportunity.town,
          opportunity.category,
          opportunity.description
        ].some((value) => includesText(value, normalizedQuery));

      const matchesTown = !filters.town || opportunity.town === filters.town;
      const matchesCategory =
        !filters.category || opportunity.category === filters.category;
      const matchesMinimumAge =
        selectedMinimumAge === null ||
        opportunity.minimumAge === null ||
        opportunity.minimumAge <= selectedMinimumAge;
      const matchesTeen = !filters.teenFriendly || opportunity.teenFriendly;
      const matchesWeekend = !filters.weekend || opportunity.weekend;
      const matchesDuration =
        !filters.duration || opportunity.duration === filters.duration;

      return (
        matchesSearch &&
        matchesTown &&
        matchesCategory &&
        matchesMinimumAge &&
        matchesTeen &&
        matchesWeekend &&
        matchesDuration
      );
    });
  }, [filters, opportunities, query]);

  const activeFilters = getActiveFilterLabels(filters);
  const hasFilters = activeFilters.length > 0 || query.trim().length > 0;

  function updateFilter<K extends keyof Filters>(key: K, value: Filters[K]) {
    setFilters((current) => ({ ...current, [key]: value }));
  }

  function removeFilter(key: keyof Filters) {
    setFilters((current) => ({ ...current, [key]: emptyFilters[key] }));
  }

  function clearFilters() {
    setQuery("");
    setFilters(emptyFilters);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
      <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
        <div className="space-y-4">
          <label className="field-label">
            Town
            <select
              className="field-control"
              value={filters.town}
              onChange={(event) => updateFilter("town", event.target.value)}
            >
              <option value="">All towns</option>
              {towns.map((town) => (
                <option key={town} value={town}>
                  {town}
                </option>
              ))}
            </select>
          </label>

          <label className="field-label">
            Category
            <select
              className="field-control"
              value={filters.category}
              onChange={(event) => updateFilter("category", event.target.value)}
            >
              <option value="">All categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>

          <label className="field-label">
            Minimum age
            <select
              className="field-control"
              value={filters.minimumAge}
              onChange={(event) => updateFilter("minimumAge", event.target.value)}
            >
              <option value="">Any age</option>
              {[12, 13, 14, 15, 16, 17, 18].map((age) => (
                <option key={age} value={age}>
                  Age {age}+
                </option>
              ))}
            </select>
          </label>

          <label className="toggle-row">
            <input
              checked={filters.teenFriendly}
              type="checkbox"
              onChange={(event) =>
                updateFilter("teenFriendly", event.target.checked)
              }
            />
            Teen friendly
          </label>

          <label className="toggle-row">
            <input
              checked={filters.weekend}
              type="checkbox"
              onChange={(event) => updateFilter("weekend", event.target.checked)}
            />
            Weekend
          </label>

          <label className="field-label">
            One-time or ongoing
            <select
              className="field-control"
              value={filters.duration}
              onChange={(event) => updateFilter("duration", event.target.value)}
            >
              <option value="">Any commitment</option>
              <option value="One-time">One-time</option>
              <option value="Ongoing">Ongoing</option>
              <option value="One-time and ongoing">One-time and ongoing</option>
              <option value="Contact organization">Contact organization</option>
            </select>
          </label>
        </div>
      </aside>

      <section>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-soft sm:p-5">
          <label className="sr-only" htmlFor="opportunity-search">
            Search volunteer opportunities, towns, or categories
          </label>
          <input
            className="w-full rounded-xl border border-slate-200 bg-lightBackground px-5 py-4 text-base text-slate-900 outline-none ring-primary/20 placeholder:text-slate-400 focus:border-primary focus:ring-4"
            id="opportunity-search"
            placeholder="Search volunteer opportunities, towns, or categories"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>

        {hasFilters ? (
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {query.trim() ? (
              <button className="filter-chip" type="button" onClick={() => setQuery("")}>
                Search: {query} <span aria-hidden="true">x</span>
              </button>
            ) : null}
            {activeFilters.map((filter) => (
              <button
                className="filter-chip"
                key={filter.key}
                type="button"
                onClick={() => removeFilter(filter.key)}
              >
                {filter.label} <span aria-hidden="true">x</span>
              </button>
            ))}
            <button className="clear-button" type="button" onClick={clearFilters}>
              Clear filters
            </button>
          </div>
        ) : null}

        <div className="mt-6 space-y-4">
          {filteredOpportunities.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-600">
              No opportunities found. Add the volunteer file information to{" "}
              <code className="rounded bg-lightBackground px-2 py-1">
                lib/opportunities.ts
              </code>
              .
            </div>
          ) : (
            filteredOpportunities.map((opportunity) => (
              <Link
                className="group block rounded-2xl border border-slate-200 bg-white p-5 shadow-soft transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg"
                href={`/opportunities/${opportunity.id}`}
                key={opportunity.id}
              >
                <article className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-center">
                  <div>
                    <h2 className="text-xl font-bold text-primary">
                      {opportunity.organization}
                    </h2>
                    <p className="mt-1 text-sm font-semibold text-slate-500">
                      {opportunity.town} &bull; {opportunity.category}
                    </p>
                    <p className="mt-3 leading-7 text-slate-700">
                      {opportunity.description}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <span className="meta-pill">{opportunity.ageDisplay}</span>
                      {opportunity.tags.slice(0, 4).map((tag) => (
                        <span className="meta-pill" key={tag}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <span className="inline-flex font-bold text-primary group-hover:underline">
                    View Details &rarr;
                  </span>
                </article>
              </Link>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
