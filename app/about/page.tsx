export default function AboutPage() {
  return (
    <main className="mx-auto max-w-4xl px-5 py-12 sm:px-6 lg:px-8">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft sm:p-10">
        <p className="text-sm font-semibold uppercase text-primary">
          About Bergen Volunteer Connect
        </p>
        <h1 className="mt-3 text-3xl font-bold text-primary sm:text-4xl">
          Helping neighbors find useful places to help.
        </h1>
        <div className="mt-6 space-y-5 text-base leading-8 text-slate-700">
          <p>
            Bergen Volunteer Connect helps students and adults find volunteer
            opportunities in northern Bergen County. The directory is organized
            so visitors can search by organization, town, category, age
            requirement, and schedule.
          </p>
          <p>
            Volunteer details can change. Users should confirm age rules,
            application steps, schedules, requirements, and availability with
            each organization before planning or applying.
          </p>
        </div>
      </section>
    </main>
  );
}
