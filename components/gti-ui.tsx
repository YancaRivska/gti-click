import Image from "next/image";
import Link from "next/link";
import type { ReactNode, SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

function IconBase({ children, ...props }: IconProps & { children: ReactNode }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      {children}
    </svg>
  );
}

export function CameraIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M4 8.5A2.5 2.5 0 0 1 6.5 6h1.2l1.1-1.5h6.4L16.3 6h1.2A2.5 2.5 0 0 1 20 8.5v8a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 16.5v-8Z" />
      <circle cx="12" cy="12.5" r="3.5" />
      <path d="M17.5 9.5h.01" />
    </IconBase>
  );
}

export function ApertureIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="m9.2 3.5 5 8.5M20.7 8H11m7.1 10-5-8.5M9.8 20.5 15 12M3.3 16H13M5.9 6l5 8.5" />
    </IconBase>
  );
}

export function ArrowRightIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M5 12h14M14 7l5 5-5 5" />
    </IconBase>
  );
}

export function ArrowLeftIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M19 12H5m5 5-5-5 5-5" />
    </IconBase>
  );
}

export function UploadIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M12 16V4m-4 4 4-4 4 4" />
      <path d="M5 14v4a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-4" />
    </IconBase>
  );
}

export function ImageIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <circle cx="8.5" cy="9" r="1.5" />
      <path d="m5 17 4.5-4.5 3 3 2-2 4.5 3.5" />
    </IconBase>
  );
}

export function CalendarIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M16 3v4M8 3v4M3 10h18" />
    </IconBase>
  );
}

export function MapPinIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
      <circle cx="12" cy="10" r="2.5" />
    </IconBase>
  );
}

export function ShieldIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M12 3 5 6v5c0 4.6 2.9 8.1 7 10 4.1-1.9 7-5.4 7-10V6l-7-3Z" />
      <path d="m9 12 2 2 4-4" />
    </IconBase>
  );
}

export function SparklesIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="m12 3 1.2 3.3L16.5 7.5l-3.3 1.2L12 12l-1.2-3.3-3.3-1.2 3.3-1.2L12 3Z" />
      <path d="m18 14 .8 2.2L21 17l-2.2.8L18 20l-.8-2.2L15 17l2.2-.8L18 14Z" />
      <path d="m5 13 .6 1.4L7 15l-1.4.6L5 17l-.6-1.4L3 15l1.4-.6L5 13Z" />
    </IconBase>
  );
}

export function CheckIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="m5 12 4 4L19 6" />
    </IconBase>
  );
}

export function DownloadIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M12 4v11m-4-4 4 4 4-4M5 20h14" />
    </IconBase>
  );
}

export function ShareIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <circle cx="18" cy="5" r="2.5" />
      <circle cx="6" cy="12" r="2.5" />
      <circle cx="18" cy="19" r="2.5" />
      <path d="m8.2 10.8 7.6-4.5m-7.6 6.9 7.6 4.5" />
    </IconBase>
  );
}

export function FlagIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M5 21V4m0 1h11l-2 4 2 4H5" />
    </IconBase>
  );
}

export function TrashIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M4 7h16M9 7V4h6v3m3 0-1 14H7L6 7m4 4v6m4-6v6" />
    </IconBase>
  );
}

export function InstagramIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <path d="M17.5 6.5h.01" />
    </IconBase>
  );
}

export function GlobeIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.4 2.5 3.6 5.5 3.6 9S14.4 18.5 12 21M12 3c-2.4 2.5-3.6 5.5-3.6 9s1.2 6.5 3.6 9" />
    </IconBase>
  );
}

export function MessageIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M20 11.5a7.5 7.5 0 0 1-8 7.5 8.8 8.8 0 0 1-3.3-.7L4 20l1.5-4.2A7.5 7.5 0 1 1 20 11.5Z" />
      <path d="M8.5 9.2c.6 2.6 2 4 4.6 4.7M8.3 8.6l1.3-.5.8 1.6-.8.7m4 3.6.7-.8 1.6.8-.5 1.3" />
    </IconBase>
  );
}

export function LockIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <rect x="5" y="10" width="14" height="11" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </IconBase>
  );
}

export function UsersIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <circle cx="9" cy="8" r="3" />
      <path d="M3.5 19v-1.5A4.5 4.5 0 0 1 8 13h2a4.5 4.5 0 0 1 4.5 4.5V19" />
      <path d="M15.5 5.5a3 3 0 0 1 0 5.5M17 13a4.5 4.5 0 0 1 3.5 4.4V19" />
    </IconBase>
  );
}

export function GtiLogo({
  href = "/",
  size = "default",
}: {
  href?: string;
  size?: "compact" | "default" | "hero";
}) {
  const sizeClass = `brand-wordmark-${size}`;
  const content = (
    <span className={`brand-wordmark ${sizeClass}`} aria-label="GTI CLICK">
      <span className="brand-wordmark-top">GTI<ApertureIcon /></span>
      <span className="brand-wordmark-bottom">CLICK</span>
    </span>
  );

  return href ? (
    <Link href={href} className="inline-flex items-center" aria-label="GTI CLICK — início">
      {content}
    </Link>
  ) : (
    <div className="inline-flex items-center gap-3">{content}</div>
  );
}

export function AppShell({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <main className={`app-shell relative min-h-svh overflow-hidden ${className}`}>
      <div className="app-glow app-glow-one" aria-hidden="true" />
      <div className="app-glow app-glow-two" aria-hidden="true" />
      <div className="relative z-10 min-h-svh">{children}</div>
    </main>
  );
}

export function BackLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="back-link">
      <ArrowLeftIcon className="size-4" />
      <span>{children}</span>
    </Link>
  );
}

export function EventArtwork({
  name,
  date,
  location,
  compact = false,
}: {
  name: string;
  date: string;
  location: string;
  compact?: boolean;
}) {
  return (
    <div className={`event-artwork ${compact ? "event-artwork-compact" : ""}`}>
      <Image
        src="/assets/gti-click/event-cover-reference.jpg"
        alt="Ponte Estaiada em São Paulo ao entardecer"
        fill
        priority
        sizes="(max-width: 768px) 100vw, 36rem"
        className="event-cover-image object-cover"
      />
      <div className="event-cover-shade" aria-hidden="true" />
      <div className="event-cover-copy">
        <span className="event-badge mb-3">AWS</span>
        <h1 className={`${compact ? "text-2xl" : "text-[1.9rem] sm:text-[2.35rem]"} max-w-[18rem] font-black leading-[0.92] tracking-[-0.045em] text-white uppercase`}>
          {name}
        </h1>
        <p className="event-date-badge">03 set <span>•</span> São Paulo</p>
        <p className="mt-3 text-[0.67rem] font-semibold text-white/55">{date} · {location}</p>
      </div>
    </div>
  );
}

export function EmptyState({
  icon,
  visual,
  title,
  description,
  children,
}: {
  icon: ReactNode;
  visual?: ReactNode;
  title: string;
  description: string;
  children?: ReactNode;
}) {
  return (
    <div className="empty-state">
      {visual ? (
        <div className="relative mx-auto h-32 w-32 overflow-hidden">{visual}</div>
      ) : (
        <span className="mx-auto grid size-14 place-items-center rounded-2xl border border-violet-300/20 bg-violet-400/10 text-violet-200">
          {icon}
        </span>
      )}
      <h2 className="mt-5 text-xl font-black tracking-tight text-white">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-slate-400">{description}</p>
      {children}
    </div>
  );
}

export function MobileEventNav({
  eventSlug,
  active,
}: {
  eventSlug: string;
  active: "gallery" | "upload" | "event";
}) {
  const items = [
    { key: "gallery", label: "Galeria", href: `/evento/${eventSlug}/galeria`, icon: <ImageIcon className="size-5" />, featured: false },
    { key: "upload", label: "Enviar", href: `/evento/${eventSlug}/enviar`, icon: <CameraIcon className="size-6" />, featured: true },
    { key: "event", label: "Evento", href: `/evento/${eventSlug}`, icon: <ApertureIcon className="size-5" />, featured: false },
  ] as const;

  return (
    <nav aria-label="Navegação do evento" className="mobile-event-nav lg:hidden">
      {items.map((item) => {
        const isActive = active === item.key;
        return (
          <Link key={item.key} href={item.href} aria-current={isActive ? "page" : undefined} className={`mobile-event-nav-item ${isActive ? "is-active" : ""} ${item.featured ? "is-featured" : ""}`}>
            <span className="mobile-event-nav-icon">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
