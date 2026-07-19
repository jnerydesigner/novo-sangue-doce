import { collectDefaultMetrics, Counter, Histogram, Registry } from "prom-client";

export const registry = new Registry();

collectDefaultMetrics({
  register: registry,
  prefix: "sangue_doce_",
});

export const httpRequestsTotal = new Counter({
  name: "sangue_doce_http_requests_total",
  help: "Quantidade total de requisições HTTP",
  labelNames: ["method", "route", "status_code"],
  registers: [registry],
});

export const httpRequestDuration = new Histogram({
  name: "sangue_doce_http_request_duration_seconds",
  help: "Duração das requisições HTTP em segundos",
  labelNames: ["method", "route", "status_code"],
  buckets: [0.05, 0.1, 0.25, 0.5, 1, 2, 5],
  registers: [registry],
});

export const pageVisitsTotal = new Counter({
  name: "sangue_doce_page_visits_total",
  help: "Quantidade total de visitas registradas por grupo de página",
  labelNames: ["page_group"],
  registers: [registry],
});
