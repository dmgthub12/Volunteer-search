import {
  ArrowRight,
  CalendarDays,
  HeartHandshake,
  MapPin,
  Sparkles,
  UsersRound
} from "lucide-react";
import Link from "next/link";
import { getOpportunities } from "../lib/data";

export default async function Home() {
  const opportunities = await getOpportunities();
  const towns = new Set(opportunities.map((opportunity) => opportunity.town));
  const teenFriendlyCount = opportunities.filter(
    (opportunity) => opportunity.teenFriendly
  ).length;
  const weekendCount = opportunities.filter(
    (opportunity) => opportunity.weekend
  ).length;

  const stats = [
    {
      label: "Opportunities",
      value: opportunities.length,
      icon: HeartHandshake
    },
    {
      label: "Towns",
      value: towns.size,
      icon: MapPin
    },
    {
      label: "Teen Friendly",
      value: teenFriendlyCount,
      icon: UsersRound
    },
    {
      label: "Weekend Openings",
      value: weekendCount,
      icon: CalendarDays
    }
  ];

  return (
    <main>
      <section className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-[28px] border border-white bg-gradient-to-br from-white via-mint to-[#dff6e8] shadow-soft">
          <div className="grid items-center gap-8 px-6 py-10 sm:px-10 lg:grid-cols-[1fr_0.9fr] lg:px-12 lg:py-14">
            <div>
              <p className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-sm font-bold text-primary shadow-sm">
                <Sparkles className="h-4 w-4 text-accent" />
                Student-friendly volunteer directory
              </p>
              <h1 className="max-w-2xl text-4xl font-bold tracking-normal text-primary sm:text-5xl lg:text-6xl">
                Find Your Next Volunteer Opportunity
              </h1>
              <p className="mt-5 max-w-xl text-lg leading-8 text-slate-700">
                Explore local ways to help, earn service hours, and support
                organizations across northern Bergen County.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link className="btn-primary" href="/opportunities">
                  Search Opportunities
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link className="btn-secondary" href="/about">
                  About the Project
                </Link>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-x-8 bottom-2 h-16 rounded-full bg-accent/20 blur-2xl" />
              <img
                alt="Students volunteering by planting a tree and carrying donations"
                className="relative mx-auto w-full max-w-md rounded-2xl bg-white/70 p-3 shadow-soft"
                src="/volunteer-illustration.png"
              />
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                className="soft-card group p-5 transition duration-200 hover:-translate-y-0.5 hover:shadow-lift"
                key={stat.label}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-bold text-slate-500">
                      {stat.label}
                    </p>
                    <p className="mt-2 text-4xl font-bold text-primary">
                      {stat.value}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-mint p-3 text-primary transition group-hover:bg-accent/30">
                    <Icon className="h-6 w-6" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}
