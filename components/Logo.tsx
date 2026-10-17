import { site } from "@/lib/site";

export function Logo({ variant = "dark" }: { variant?: "dark" | "light" }) {
  const word = variant === "light" ? "#ffffff" : "#0f024a";
  const tag = variant === "light" ? "rgba(255,255,255,0.82)" : "#6d7a32";

  return (
    <span className={`logo logo-${variant}`}>
      <svg className="logo-mark" viewBox="0 0 48 48" aria-hidden="true">
        <rect width="48" height="48" rx="12" fill="#99c02f" />
        <path
          d="M24 8c1.2 4.8 2.2 7.6 6.6 9.2C26.2 18.6 24.8 21 24 25.6 23.2 21 21.8 18.6 17.4 17.2 21.8 15.6 22.8 12.8 24 8Z"
          fill="#0f024a"
        />
        <path d="M24 20.5 20.2 28h3.1V36h1.4V28h3.1L24 20.5Z" fill="#ffffff" />
        <path d="M10 34.5c4.2 3.4 9.8 5.2 14 5.2s9.8-1.8 14-5.2" fill="none" stroke="#0f024a" strokeWidth="2.2" strokeLinecap="round" />
      </svg>
      <span className="logo-words">
        <span className="logo-name" style={{ color: word }}>
          {site.shortName.toLowerCase()}
          <sup>®</sup>
        </span>
        <span className="logo-tag" style={{ color: tag }}>
          {site.tagline}
        </span>
      </span>
    </span>
  );
}
