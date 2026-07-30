export type AnalyticsEventName =
  | "page_view"
  | "scroll"
  | "article_view"
  | "article_finished"
  | "cta_click"
  | "newsletter"
  | "signup"
  | "login"
  | "measurement_created"
  | "measurement_updated"
  | "measurement_deleted"
  | "subscription_created"
  | "payment_success";

export type AnalyticsEventParams = Record<string, string | number | boolean | undefined>;

export function trackEvent(name: AnalyticsEventName, params: AnalyticsEventParams = {}) {
  if (typeof window === "undefined" || !window.gtag) return;
  window.gtag("event", name, params);
}

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (command: string, ...args: unknown[]) => void;
  }
}

