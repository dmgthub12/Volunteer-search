"use client";

import {
  ArrowRight,
  CalendarDays,
  Clock3,
  ExternalLink,
  MapPin,
  Search,
  Tag,
  UserRound,
  X
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
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

const townCoordinates: Record<string, { x: number; y: number }> = {
  Alpine: { x: 47, y: 14 },
  Bergenfield: { x: 43, y: 55 },
  Closter: { x: 47, y: 27 },
  Cresskill: { x: 46, y: 40 },
  Demarest: { x: 51, y: 31 },
  Dumont: { x: 46, y: 50 },
  Englewood: { x: 57, y: 61 },
  "Englewood Cliffs": { x: 63, y: 62 },
  Hackensack: { x: 35, y: 75 },
  "Harrington Park": { x: 41, y: 28 },
  Haworth: { x: 43, y: 43 },
  Northvale: { x: 43, y: 10 },
  Norwood: { x: 45, y: 19 },
  "Old Tappan": { x: 35, y: 12 },
  Rockleigh: { x: 50, y: 7 },
  Teaneck: { x: 50, y: 71 },
  Tenafly: { x: 55, y: 50 },
  Westwood: { x: 30, y: 42 }
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
  const [page, setPage] = useState(1);

  const filteredOpportunities = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const selectedMinimumAge = filters.minimumAge
      ? Number(filters.minimumAge)
      : null;

    return opportunities
      .filter((opportunity) => {
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
      })
      .sort(
        (first, second) =>
          first.organization.localeCompare(second.organization) ||
          first.town.localeCompare(second.town)
      );
  }, [filters, opportunities, query]);

  const activeFilters = getActiveFilterLabels(filters);
  const hasFilters = activeFilters.length > 0 || query.trim().length > 0;
  const pageSize = Math.ceil(filteredOpportunities.length / 2);
  const totalPages = filteredOpportunities.length > pageSize ? 2 : 1;
  const visibleOpportunities = filteredOpportunities.slice(
    (page - 1) * pageSize,
    page * pageSize
  );
  const visibleTowns = Array.from(
    visibleOpportunities.reduce((townMap, opportunity) => {
      const current = townMap.get(opportunity.town) ?? 0;
      townMap.set(opportunity.town, current + 1);
      return townMap;
    }, new Map<string, number>())
  ).sort(([firstTown], [secondTown]) => firstTown.localeCompare(secondTown));

  useEffect(() => {
    setPage(1);
  }, [filters, query]);

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
      opportunity.duration.includes("Ongoing") ? "Ongoing" : null
    ].filter(Boolean) as string[];

    return Array.from(new Set([...tags, ...opportunity.tags])).slice(0, 1);
  }

  return (
    <section>
      <div className="soft-card p-3 sm:p-4">
        <label className="sr-only" htmlFor="opportunity-search">
          Search volunteer opportunities, towns, or categories
        </label>
        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 shadow-sm ring-accent/20 transition focus-within:border-accent focus-within:ring-4">
          <Search className="h-5 w-5 shrink-0 text-slate-400" />
          <input
            className="min-h-12 w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
            id="opportunity-search"
            placeholder="Search volunteer opportunities, towns, or categories"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>

        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-6">
          <label className="compact-field lg:col-span-1">
            <span className="flex items-center gap-2">
              <MapPin className="h-3.5 w-3.5 text-accent" />
              Town
            </span>
            <select
              className="compact-control"
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

          <label className="compact-field lg:col-span-1">
            <span className="flex items-center gap-2">
              <Tag className="h-3.5 w-3.5 text-accent" />
              Category
            </span>
            <select
              className="compact-control"
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

          <label className="compact-field lg:col-span-1">
            <span className="flex items-center gap-2">
              <UserRound className="h-3.5 w-3.5 text-accent" />
              Age
            </span>
            <select
              className="compact-control"
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

          <label className="compact-field lg:col-span-1">
            <span className="flex items-center gap-2">
              <Clock3 className="h-3.5 w-3.5 text-accent" />
              Commitment
            </span>
            <select
              className="compact-control"
              value={filters.duration}
              onChange={(event) => updateFilter("duration", event.target.value)}
            >
              <option value="">Any</option>
              <option value="One-time">One-time</option>
              <option value="Ongoing">Ongoing</option>
              <option value="One-time and ongoing">Both</option>
              <option value="Contact organization">Contact</option>
            </select>
          </label>

          <div className="grid grid-cols-2 gap-2 sm:col-span-2 lg:col-span-2">
            <label className="compact-toggle">
            <input
              checked={filters.teenFriendly}
              type="checkbox"
              onChange={(event) =>
                updateFilter("teenFriendly", event.target.checked)
              }
            />
              <UserRound className="h-3.5 w-3.5 text-accent" />
              Teen
            </label>

            <label className="compact-toggle">
            <input
              checked={filters.weekend}
              type="checkbox"
              onChange={(event) => updateFilter("weekend", event.target.checked)}
            />
              <CalendarDays className="h-3.5 w-3.5 text-accent" />
              Weekend
            </label>
          </div>
        </div>

        {hasFilters ? (
          <div className="mt-3 flex flex-wrap items-center gap-2">
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
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px] 2xl:grid-cols-[minmax(0,1fr)_360px]">
        <div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-bold text-slate-500">
              Showing {visibleOpportunities.length} of{" "}
              {filteredOpportunities.length} opportunities
            </p>
            {totalPages > 1 ? (
              <div className="inline-flex w-fit rounded-2xl border border-slate-200 bg-white p-1 shadow-sm">
                {[1, 2].map((pageNumber) => (
                  <button
                    className={
                      page === pageNumber ? "page-tab page-tab-active" : "page-tab"
                    }
                    key={pageNumber}
                    type="button"
                    onClick={() => setPage(pageNumber)}
                  >
                    Page {pageNumber}
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <div className="mt-4 grid gap-2.5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-6">
            {filteredOpportunities.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-600 sm:col-span-2 md:col-span-3 lg:col-span-4 2xl:col-span-6">
                No opportunities found. Add the volunteer file information to{" "}
                <code className="rounded bg-lightBackground px-2 py-1">
                  lib/opportunities.ts
                </code>
                .
              </div>
            ) : (
              visibleOpportunities.map((opportunity) => (
                <Link
                  className="group block h-full rounded-2xl border border-slate-200/80 bg-white p-2.5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-accent/60 hover:shadow-soft"
                  href={`/opportunities/${opportunity.id}`}
                  key={opportunity.id}
                >
                  <article className="flex min-h-[138px] flex-col">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h2 className="line-clamp-2 text-[13px] font-bold leading-snug text-primary">
                          {opportunity.organization}
                        </h2>
                        {opportunity.needsVerification ? (
                          <span className="shrink-0 rounded-full bg-amber-50 px-1.5 py-0.5 text-[10px] font-bold text-amber-700">
                            Verify
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-2 flex flex-wrap items-center gap-1.5 text-[11px] font-semibold uppercase tracking-normal text-slate-500">
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {opportunity.town}
                        </span>
                        <span>&bull;</span>
                        <span>{opportunity.category}</span>
                      </p>
                      <p className="opportunity-description mt-2 text-[11px] leading-4 text-slate-600">
                        {opportunity.description}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        <span className="compact-pill">
                          {opportunity.ageDisplay}
                        </span>
                        {usefulTags(opportunity).map((tag) => (
                          <span className="compact-pill" key={tag}>
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <span className="mt-auto inline-flex items-center gap-1.5 pt-3 text-xs font-bold text-primary">
                      Details
                      <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-1" />
                    </span>
                  </article>
                </Link>
              ))
            )}
          </div>
        </div>

        <aside className="soft-card h-fit p-4 xl:sticky xl:top-24">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-primary">Map</h2>
              <p className="mt-1 text-xs text-slate-500">
                Town pins for this page
              </p>
            </div>
            <MapPin className="h-5 w-5 text-accent" />
          </div>

          <div className="relative mt-3 aspect-[4/5] overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-mint via-white to-[#dcecff]">
            <div className="absolute inset-x-[18%] top-[8%] h-[84%] rounded-[45%] border border-primary/15 bg-white/55 shadow-inner" />
            <div className="absolute left-[21%] top-[3%] h-[92%] w-[50%] rotate-6 rounded-[48%] border border-accent/40 bg-accent/10" />
            {visibleTowns.map(([town, count]) => {
              const point = townCoordinates[town];

              if (!point) return null;

              return (
                <a
                  aria-label={`${town}, ${count} opportunities`}
                  className="map-pin group/pin"
                  href={`https://www.google.com/maps/search/${encodeURIComponent(
                    `${town} NJ`
                  )}`}
                  key={town}
                  style={{ left: `${point.x}%`, top: `${point.y}%` }}
                  target="_blank"
                >
                  <span>{count}</span>
                  <span className="map-label">{town}</span>
                </a>
              );
            })}
          </div>

          <div className="mt-3 max-h-72 space-y-1.5 overflow-auto pr-1">
            {visibleOpportunities.slice(0, 18).map((opportunity) => (
              <a
                className="map-result"
                href={`https://www.google.com/maps/search/${encodeURIComponent(
                  `${opportunity.organization} ${opportunity.town} NJ`
                )}`}
                key={opportunity.id}
                target="_blank"
              >
                <span className="min-w-0">
                  <span className="block truncate font-bold text-primary">
                    {opportunity.organization}
                  </span>
                  <span className="block text-[11px] text-slate-500">
                    {opportunity.town}
                  </span>
                </span>
                <ExternalLink className="h-3.5 w-3.5 shrink-0 text-slate-400" />
              </a>
            ))}
          </div>
        </aside>
      </div>
    </section>
  );
}
