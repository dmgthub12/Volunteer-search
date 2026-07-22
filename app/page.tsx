import Link from "next/link";
import { opportunities } from "../lib/opportunities";

export default function Home() {
  return (
    <main>
      <section className="mx-auto grid min-h-[calc(100vh-86px)] w-full max-w-6xl items-center gap-10 px-5 py-12 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
        <div className="max-w-3xl">
          <p className="mb-4 inline-flex rounded-full bg-accent/35 px-4 py-2 text-sm font-semibold text-primary">
            Bergen Volunteer Connect
          </p>
          <h1 className="text-4xl font-bold tracking-normal text-primary sm:text-5xl lg:text-6xl">
            Find a place to make a difference.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-700">
            Search volunteer opportunities across northern Bergen County by
            town, category, age requirement, schedule, and commitment type.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link className="btn-primary" href="/opportunities">
              Search Opportunities
            </Link>
            <Link className="btn-secondary" href="/about">
              About the Project
            </Link>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-lightBackground p-5 shadow-soft">
          <div className="rounded-xl bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold uppercase text-slate-500">
              Current directory
            </p>
            <p className="mt-3 text-5xl font-bold text-primary">
              {opportunities.length}
            </p>
            <p className="mt-2 text-slate-600">opportunities ready to browse</p>
          </div>
          <div className="mt-4 grid gap-3">
            {["Town filters", "Teen-friendly options", "Weekend openings"].map(
              (item) => (
                <div
                  className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700"
                  key={item}
                >
                  {item}
                </div>
              )
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
