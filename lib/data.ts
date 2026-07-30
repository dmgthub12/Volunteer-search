import {
  getOpportunity as getLocalOpportunity,
  opportunities as localOpportunities,
  type VolunteerOpportunity
} from "./opportunities";

type SupabaseOpportunityRow = {
  data: VolunteerOpportunity;
};

function mergeWithLocalOpportunities(remoteOpportunities: VolunteerOpportunity[]) {
  const opportunitiesById = new Map(
    localOpportunities.map((opportunity) => [opportunity.id, opportunity])
  );

  for (const opportunity of remoteOpportunities) {
    opportunitiesById.set(opportunity.id, opportunity);
  }

  return Array.from(opportunitiesById.values());
}

function getSupabaseKey() {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  );
}

function hasSupabaseConfig() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && getSupabaseKey());
}

export async function getOpportunities() {
  if (!hasSupabaseConfig()) {
    return localOpportunities;
  }

  try {
    const supabaseKey = getSupabaseKey()!;

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/volunteer_opportunities?select=data&order=id.asc`,
      {
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`
        },
        next: { revalidate: 3600 }
      }
    );

    if (!response.ok) {
      return localOpportunities;
    }

    const rows = (await response.json()) as SupabaseOpportunityRow[];
    return mergeWithLocalOpportunities(rows.map((row) => row.data));
  } catch {
    return localOpportunities;
  }
}

export async function getOpportunity(id: string) {
  if (!hasSupabaseConfig()) {
    return getLocalOpportunity(id);
  }

  const opportunities = await getOpportunities();
  return opportunities.find((opportunity) => opportunity.id === id);
}
