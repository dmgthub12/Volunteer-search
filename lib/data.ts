import {
  getOpportunity as getLocalOpportunity,
  opportunities as localOpportunities,
  type VolunteerOpportunity
} from "./opportunities";

type SupabaseOpportunityRow = {
  data: VolunteerOpportunity;
};

function hasSupabaseConfig() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

export async function getOpportunities() {
  if (!hasSupabaseConfig()) {
    return localOpportunities;
  }

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/volunteer_opportunities?select=data&order=id.asc`,
      {
        headers: {
          apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}`
        },
        next: { revalidate: 3600 }
      }
    );

    if (!response.ok) {
      return localOpportunities;
    }

    const rows = (await response.json()) as SupabaseOpportunityRow[];
    return rows.map((row) => row.data);
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
