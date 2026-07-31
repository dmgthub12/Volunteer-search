"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

function getSessionId() {
  const key = "bergenVolunteerSessionId";
  const existing = window.sessionStorage.getItem(key);

  if (existing) return existing;

  const sessionId = crypto.randomUUID();
  window.sessionStorage.setItem(key, sessionId);
  return sessionId;
}

function textForElement(element: Element) {
  return element.textContent?.replace(/\s+/g, " ").trim().slice(0, 120) || null;
}

function trackingPayload(eventType: string, element?: Element) {
  const link = element?.closest("a") as HTMLAnchorElement | null;
  const button = element?.closest("button") as HTMLButtonElement | null;
  const target = link ?? button;

  return {
    event_type: eventType,
    path: window.location.pathname,
    label: target ? textForElement(target) : document.title,
    href: link?.href ?? null,
    session_id: getSessionId(),
    metadata: {
      referrer: document.referrer || null,
      viewport: `${window.innerWidth}x${window.innerHeight}`
    }
  };
}

function sendEvent(eventType: string, element?: Element) {
  if (!supabaseUrl || !supabaseKey) return;

  const endpoint = `${supabaseUrl}/rest/v1/site_events`;
  const body = JSON.stringify(trackingPayload(eventType, element));
  const usesLegacyJwt = supabaseKey.split(".").length === 3;
  const headers: Record<string, string> = {
    apikey: supabaseKey,
    "Content-Type": "application/json",
    Prefer: "return=minimal"
  };

  if (usesLegacyJwt) {
    headers.Authorization = `Bearer ${supabaseKey}`;
  }

  fetch(endpoint, {
    body,
    headers,
    keepalive: true,
    method: "POST"
  }).catch(() => {});
}

export function AnalyticsTracker() {
  const pathname = usePathname();
  const lastPath = useRef<string | null>(null);

  useEffect(() => {
    if (!supabaseUrl || !supabaseKey) return;

    const handleClick = (event: MouseEvent) => {
      const target = event.target as Element | null;
      const trackedElement = target?.closest("a, button");

      if (trackedElement) {
        sendEvent("click", trackedElement);
      }
    };

    document.addEventListener("click", handleClick);

    return () => {
      document.removeEventListener("click", handleClick);
    };
  }, []);

  useEffect(() => {
    if (!supabaseUrl || !supabaseKey || lastPath.current === pathname) return;

    lastPath.current = pathname;
    sendEvent("page_view");
  }, [pathname]);

  return null;
}
