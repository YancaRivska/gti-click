export type Event = {
  id: string;
  slug: string;
  nome: string;
  data: string;
  local: string;
  codigo: string;
  uploadsEnabled: boolean;
};

export const events: Event[] = [
  {
    id: "aws-summit-sp-2026",
    slug: "aws-summit-sp-2026",
    nome: "AWS Summit São Paulo 2026",
    data: "03/09/2026",
    local: "São Paulo - SP",
    codigo: "AWS-SP-2026",
    uploadsEnabled: true,
  },
];

export function getEventByCode(code: string) {
  return events.find((event) => event.codigo === code);
}

export function getEventBySlug(slug: string) {
  return events.find((event) => event.slug === slug);
}
