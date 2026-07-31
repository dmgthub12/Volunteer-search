"use client";

import {
  ArrowRight,
  CalendarDays,
  Clock3,
  MapPin,
  Search,
  Tag,
  UserRound,
  X
} from "lucide-react";
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

  function usefulTags(opportunity: VolunteerOpportunity) {
    const tags = [
      opportunity.teenFriendly ? "Teen Friendly" : null,
      opportunity.weekend ? "Weekend" : null,
      opportunity.duration.includes("One-time") ? "One-Time" : null,
      opportunity.duration.includes("Ongoing") ? "Ongoing" : null,
      opportunity.needsVerification ? "Needs Verification" : null
    ].filter(Boolean) as string[];

    return Array.from(new Set([...tags, ...opportunity.tags])).slice(0, 3);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
      <aside className="soft-card h-fit p-5 lg:sticky lg:top-28">
        <div className="mb-5">
          <p className="text-lg font-bold text-primary">Filters</p>
          <p className="mt-1 text-sm text-slate-500">
            Refine the list without losing your place.
          </p>
        </div>

        <div className="space-y-4">
          <label className="field-label">
            <span className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-accent" />
              Town
            </span>
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
            <span className="flex items-center gap-2">
              <Tag className="h-4 w-4 text-accent" />
              Category
            </span>
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
            <span className="flex items-center gap-2">
              <UserRound className="h-4 w-4 text-accent" />
              Minimum Age
            </span>
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
            <UserRound className="h-4 w-4 text-accent" />
            Teen friendly
          </label>

          <label className="toggle-row">
            <input
              checked={filters.weekend}
              type="checkbox"
              onChange={(event) => updateFilter("weekend", event.target.checked)}
            />
            <CalendarDays className="h-4 w-4 text-accent" />
            Weekend
          </label>

          <label className="field-label">
            <span className="flex items-center gap-2">
              <Clock3 className="h-4 w-4 text-accent" />
              Commitment
            </span>
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
        <div className="soft-card p-4 sm:p-5">
          <label className="sr-only" htmlFor="opportunity-search">
            Search volunteer opportunities, towns, or categories
          </label>
          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 shadow-sm ring-accent/20 transition focus-within:border-accent focus-within:ring-4">
            <Search className="h-5 w-5 shrink-0 text-slate-400" />
            <input
              className="min-h-14 w-full bg-transparent text-base text-slate-900 outline-none placeholder:text-slate-400"
              id="opportunity-search"
              placeholder="Search volunteer opportunities, towns, or categories"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
        </div>

        {hasFilters ? (
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {query.trim() ? (
              <button className="filter-chip" type="button" onClick={() => setQuery("")}>
                Search: {query} <X className="h-3.5 w-3.5" />
              </button>
            ) : null}
            {activeFilters.map((filter) => (
              <button
                className="filter-chip"
                key={filter.key}
                type="button"
                onClick={() => removeFilter(filter.key)}
              >
                {filter.label} <X className="h-3.5 w-3.5" />
              </button>
            ))}
            <button className="clear-button" type="button" onClick={clearFilters}>
              Clear filters
            </button>
          </div>
        ) : null}

        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filteredOpportunities.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-600 sm:col-span-2 xl:col-span-3">
              No opportunities found. Add the volunteer file information to{" "}
              <code className="rounded bg-lightBackground px-2 py-1">
                lib/opportunities.ts
              </code>
              .
            </div>
          ) : (
            filteredOpportunities.map((opportunity) => (
              <Link
                className="group block h-full rounded-2xl border border-slate-200/80 bg-white p-4 shadow-soft transition duration-200 hover:-translate-y-1 hover:border-accent/60 hover:shadow-lift"
                href={`/opportunities/${opportunity.id}`}
                key={opportunity.id}
              >
                <article className="flex min-h-[255px] flex-col">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h2 className="text-lg font-bold leading-snug text-primary">
                        {opportunity.organization}
                      </h2>
                      {opportunity.needsVerification ? (
                        <span className="shrink-0 rounded-full bg-amber-50 px-2 py-1 text-[11px] font-bold text-amber-700">
                          Verify
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-2 flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-normal text-slate-500">
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" />
                        {opportunity.town}
                      </span>
                      <span>&bull;</span>
                      <span>{opportunity.category}</span>
                    </p>
                    <p className="opportunity-description mt-3 text-sm leading-6 text-slate-700">
                      {opportunity.description}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <span className="meta-pill">{opportunity.ageDisplay}</span>
                      {usefulTags(opportunity).map((tag) => (
                        <span className="meta-pill" key={tag}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <span className="mt-auto inline-flex items-center gap-2 pt-5 text-sm font-bold text-primary">
                    View Details
                    <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
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
