import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  ExternalLink,
  Info,
  Link as LinkIcon,
  ListChecks,
  UserRound
} from "lucide-react";
import { notFound } from "next/navigation";
import { getOpportunity } from "../../../lib/data";
import { opportunities } from "../../../lib/opportunities";

export function generateStaticParams() {
  return opportunities.map((opportunity) => ({ id: opportunity.id }));
}

function DetailSection({
  title,
  items,
  icon: Icon
}: {
  title: string;
  items: string[];
  icon: typeof Info;
}) {
  return (
    <section>
      <h2 className="flex items-center gap-2 text-lg font-bold text-primary">
        <Icon className="h-5 w-5 text-accent" />
        {title}
      </h2>
      {items.length === 0 ? (
        <p className="mt-2 text-slate-700">Contact organization</p>
      ) : (
        <ul className="mt-3 space-y-2 text-slate-700">
          {items.map((item) => (
            <li className="rounded-2xl bg-lightBackground px-4 py-3" key={item}>
              {item}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function actionLabel(
  opportunity: NonNullable<Awaited<ReturnType<typeof getOpportunity>>>
) {
  if (opportunity.applicationUrl?.toLowerCase().endsWith(".pdf")) {
    return "Download Application";
  }
  if (opportunity.applicationUrl) return "Apply Now";
  if (opportunity.volunteerUrl) return "View Volunteer Page";
  return "Contact Organization";
}

export default async function OpportunityDetailsPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const opportunity = await getOpportunity(id);

  if (!opportunity) {
    notFound();
  }

  const actionUrl = opportunity.applicationUrl ?? opportunity.volunteerUrl;

  return (
    <main className="mx-auto max-w-5xl px-5 py-10 sm:px-6 lg:px-8">
      <Link
        className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 font-semibold text-primary shadow-sm transition hover:-translate-y-0.5 hover:bg-mint"
        href="/opportunities"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to opportunities
      </Link>

      <article className="soft-card mt-6 overflow-hidden">
        <div className="flex flex-col gap-5 border-b border-slate-200 bg-gradient-to-br from-white via-mint to-white p-6 sm:flex-row sm:items-start sm:justify-between sm:p-10">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-sm font-bold text-primary shadow-sm">
              <CalendarDays className="h-4 w-4 text-accent" />
              {opportunity.town} &bull; {opportunity.category}
            </p>
            <h1 className="mt-3 text-3xl font-bold text-primary sm:text-5xl">
              {opportunity.organization}
            </h1>
            <p className="mt-5 max-w-3xl leading-8 text-slate-700">
              {opportunity.description}
            </p>
          </div>
          {actionUrl ? (
            <a className="btn-primary shrink-0" href={actionUrl}>
              {actionLabel(opportunity)}
              <ExternalLink className="h-4 w-4" />
            </a>
          ) : (
            <span className="btn-disabled shrink-0">{actionLabel(opportunity)}</span>
          )}
        </div>

        <div className="grid gap-6 p-6 md:grid-cols-2 sm:p-10">
          <section className="rounded-2xl bg-mint p-5">
            <h2 className="flex items-center gap-2 text-lg font-bold text-primary">
              <UserRound className="h-5 w-5 text-accent" />
              Age requirement
            </h2>
            <p className="mt-2 text-slate-700">{opportunity.ageDisplay}</p>
          </section>
          <section className="rounded-2xl bg-lightBackground p-5">
            <h2 className="flex items-center gap-2 text-lg font-bold text-primary">
              <Clock3 className="h-5 w-5 text-accent" />
              Commitment
            </h2>
            <p className="mt-2 text-slate-700">{opportunity.duration}</p>
          </section>
          <DetailSection
            icon={ListChecks}
            items={opportunity.requirements}
            title="Requirements"
          />
          <DetailSection
            icon={CalendarDays}
            items={opportunity.schedule}
            title="Schedule or time commitment"
          />
          <DetailSection icon={Info} items={opportunity.notes} title="Notes" />
          <section>
            <h2 className="flex items-center gap-2 text-lg font-bold text-primary">
              <LinkIcon className="h-5 w-5 text-accent" />
              Links
            </h2>
            <div className="mt-3 space-y-2 text-slate-700">
              {opportunity.volunteerUrl ? (
                <p>Volunteer link: {opportunity.volunteerUrl}</p>
              ) : null}
              {opportunity.applicationUrl ? (
                <p>Application link: {opportunity.applicationUrl}</p>
              ) : null}
              {!opportunity.volunteerUrl && !opportunity.applicationUrl ? (
                <p>Contact organization</p>
              ) : null}
            </div>
          </section>
        </div>
      </article>
    </main>
  );
}
