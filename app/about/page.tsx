import { CheckCircle2, HeartHandshake, Search, ShieldCheck } from "lucide-react";

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-4xl px-5 py-12 sm:px-6 lg:px-8">
      <section className="soft-card overflow-hidden">
        <div className="bg-gradient-to-br from-white via-mint to-white p-6 sm:p-10">
          <p className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-sm font-bold text-primary shadow-sm">
            <HeartHandshake className="h-4 w-4 text-accent" />
            About Bergen Volunteer Connect
          </p>
          <h1 className="mt-5 text-3xl font-bold text-primary sm:text-4xl">
            Helping students and adults find useful places to help.
          </h1>
          <div className="mt-6 space-y-5 text-base leading-8 text-slate-700">
            <p>
              Bergen Volunteer Connect helps students and adults find volunteer
              opportunities in northern Bergen County. The directory is
              organized so visitors can search by organization, town, category,
              age requirement, and schedule.
            </p>
            <p>
              Volunteer details can change. Users should confirm age rules,
              application steps, schedules, requirements, and availability with
              each organization before planning or applying.
            </p>
          </div>
        </div>

        <div className="grid gap-4 p-6 sm:grid-cols-3 sm:p-10">
          {[
            {
              title: "Search Quickly",
              text: "Find roles by town, category, schedule, and age.",
              icon: Search
            },
            {
              title: "Student Focused",
              text: "Spot teen-friendly options and service-hour ideas.",
              icon: CheckCircle2
            },
            {
              title: "Verify Details",
              text: "Confirm final requirements with each organization.",
              icon: ShieldCheck
            }
          ].map((item) => {
            const Icon = item.icon;

            return (
              <div className="rounded-2xl bg-lightBackground p-5" key={item.title}>
                <div className="mb-4 inline-flex rounded-2xl bg-mint p-3 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <h2 className="font-bold text-primary">{item.title}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {item.text}
                </p>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}
