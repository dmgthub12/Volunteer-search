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
import { useCallback, useEffect, useMemo, useState } from "react";
import type { VolunteerOpportunity } from "../../lib/opportunities";
import type { Map as LeafletMap } from "leaflet";

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

const opportunitiesPerPage = 45;

const townCoordinates: Record<string, { lat: number; lng: number }> = {
  Alpine: { lat: 40.9559, lng: -73.9312 },
  Bergenfield: { lat: 40.9276, lng: -73.9974 },
  Closter: { lat: 40.9732, lng: -73.9615 },
  Cresskill: { lat: 40.9415, lng: -73.9593 },
  Demarest: { lat: 40.9573, lng: -73.9637 },
  Dumont: { lat: 40.9407, lng: -73.9968 },
  Englewood: { lat: 40.8929, lng: -73.9726 },
  "Englewood Cliffs": { lat: 40.8854, lng: -73.9524 },
  Hackensack: { lat: 40.8859, lng: -74.0435 },
  "Harrington Park": { lat: 40.9837, lng: -73.9799 },
  Haworth: { lat: 40.9609, lng: -73.9901 },
  Northvale: { lat: 41.0065, lng: -73.949 },
  Norwood: { lat: 40.9982, lng: -73.9618 },
  "Old Tappan": { lat: 41.0107, lng: -73.9918 },
  Rockleigh: { lat: 41.0004, lng: -73.9304 },
  Teaneck: { lat: 40.8932, lng: -74.0117 },
  Tenafly: { lat: 40.9254, lng: -73.9629 },
  Westwood: { lat: 40.9912, lng: -74.0326 }
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

function BergenCountyMap({
  onTownSelect,
  towns
}: {
  onTownSelect: (town: string) => void;
  towns: Array<[string, number]>;
}) {
  const mapElementId = "bergen-opportunity-map";

  useEffect(() => {
    let map: LeafletMap | null = null;

    async function createMap() {
      const L = await import("leaflet");
      const mapElement = document.getElementById(mapElementId);

      if (!mapElement) return;

      mapElement.innerHTML = "";
      map = L.map(mapElement, {
        attributionControl: false,
        scrollWheelZoom: false
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 18,
        attribution: "&copy; OpenStreetMap contributors"
      }).addTo(map);

      const bounds: Array<[number, number]> = [];

      towns.forEach(([town, count]) => {
        const point = townCoordinates[town];

        if (!point || !map) return;

        const marker = L.marker([point.lat, point.lng], {
          icon: L.divIcon({
            className: "",
            html: `<span class="leaflet-count-pin">${count}</span>`,
            iconAnchor: [12, 12],
            iconSize: [24, 24]
          })
        }).addTo(map);

        marker.bindPopup(
          `<strong>${town}</strong><br>${count} opportunities<br><span>Click pin to filter</span>`
        );
        marker.on("click", () => onTownSelect(town));
        bounds.push([point.lat, point.lng]);
      });

      if (bounds.length > 0) {
        map.fitBounds(bounds, { maxZoom: 11, padding: [28, 28] });
      } else {
        map.setView([40.96, -74.0], 10);
      }
    }

    createMap();

    return () => {
      map?.remove();
    };
  }, [onTownSelect, towns]);

  return (
    <div
      className="relative mt-3 aspect-[16/9] overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 xl:aspect-[4/5]"
      id={mapElementId}
    />
  );
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
  const totalPages =
    filteredOpportunities.length > opportunitiesPerPage ? 2 : 1;
  const visibleOpportunities = filteredOpportunities.slice(
    (page - 1) * opportunitiesPerPage,
    page * opportunitiesPerPage
  );
  const mappedTowns = Array.from(
    filteredOpportunities.reduce((townMap, opportunity) => {
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

  const selectTownFromMap = useCallback((town: string) => {
    setFilters((current) => ({
      ...current,
      town: current.town === town ? "" : town
    }));
  }, []);

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

        <aside className="soft-card order-first h-fit p-4 xl:order-none xl:sticky xl:top-24">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-primary">Map</h2>
              <p className="mt-1 text-xs text-slate-500">
                Bergen County town pins
              </p>
            </div>
            <MapPin className="h-5 w-5 text-accent" />
          </div>

          <BergenCountyMap
            towns={mappedTowns}
            onTownSelect={selectTownFromMap}
          />

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
