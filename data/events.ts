export type Event = {
  id: string;
  slug: string;
  nome: string;
  data: string;
  local: string;
  uploadsEnabled: boolean;
  uploadClosesAt: string;
};

export const events: Event[] = [
  {
    id: "aws-summit-sp-2026",
    slug: "aws-summit-sp-2026",
    nome: "AWS Summit São Paulo 2026",
    data: "03/09/2026",
    local: "São Paulo - SP",
    uploadsEnabled: true,
    uploadClosesAt: "2026-09-10T00:00:00-03:00",
  },
];

export function getEventBySlug(slug: string) {
  return events.find((event) => event.slug === slug);
}
