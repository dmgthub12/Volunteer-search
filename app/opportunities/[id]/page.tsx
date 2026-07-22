import Link from "next/link";
import { notFound } from "next/navigation";
import { getOpportunity, opportunities } from "../../../lib/opportunities";

export function generateStaticParams() {
  return opportunities.map((opportunity) => ({ id: opportunity.id }));
}

function DetailSection({ title, items }: { title: string; items: string[] }) {
  return (
    <section>
      <h2 className="text-lg font-bold text-primary">{title}</h2>
      {items.length === 0 ? (
        <p className="mt-2 text-slate-700">Contact organization</p>
      ) : (
        <ul className="mt-3 space-y-2 text-slate-700">
          {items.map((item) => (
            <li className="rounded-xl bg-lightBackground px-4 py-3" key={item}>
              {item}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function actionLabel(opportunity: NonNullable<ReturnType<typeof getOpportunity>>) {
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
  const opportunity = getOpportunity(id);

  if (!opportunity) {
    notFound();
  }

  const actionUrl = opportunity.applicationUrl ?? opportunity.volunteerUrl;

  return (
    <main className="mx-auto max-w-5xl px-5 py-10 sm:px-6 lg:px-8">
      <Link className="font-semibold text-primary hover:underline" href="/opportunities">
        &larr; Back to opportunities
      </Link>

      <article className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-soft sm:p-10">
        <div className="flex flex-col gap-5 border-b border-slate-200 pb-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase text-slate-500">
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
            </a>
          ) : (
            <span className="btn-disabled shrink-0">{actionLabel(opportunity)}</span>
          )}
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <section className="rounded-2xl bg-accent/25 p-5">
            <h2 className="text-lg font-bold text-primary">Age requirement</h2>
            <p className="mt-2 text-slate-700">{opportunity.ageDisplay}</p>
          </section>
          <section className="rounded-2xl bg-lightBackground p-5">
            <h2 className="text-lg font-bold text-primary">Commitment</h2>
            <p className="mt-2 text-slate-700">{opportunity.duration}</p>
          </section>
          <DetailSection items={opportunity.requirements} title="Requirements" />
          <DetailSection items={opportunity.schedule} title="Schedule or time commitment" />
          <DetailSection items={opportunity.notes} title="Notes" />
          <section>
            <h2 className="text-lg font-bold text-primary">Links</h2>
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
