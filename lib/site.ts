/**
 * Placeholder business details. Swap these when the real name, logo,
 * address, phone, and email are ready. The logo itself lives in components/Logo.tsx.
 */
export const site = {
  name: "Isdore Solar",
  shortName: "Isdore",
  tagline: "solar & electrical supply",
  description:
    "Isdore Solar supplies solar backup, cable, distribution gear, lighting, and general electrical products for contractors and DIY projects across South Africa.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  email: "hello@isdoresolar.example",
  phone: "010 020 0300",
  phoneHref: "tel:+27100200300",
  address: {
    street: "1 Market Road",
    locality: "Johannesburg",
    postal: "2001",
    region: "Gauteng",
    country: "South Africa",
    countryCode: "ZA",
  },
  freeDelivery: 600,
  deliveryFee: 85,
  social: [
    { label: "Facebook", href: "https://www.facebook.com" },
    { label: "Instagram", href: "https://www.instagram.com" },
    { label: "X", href: "https://x.com" },
    { label: "YouTube", href: "https://www.youtube.com" },
  ],
};

export const paymentMethods = [
  "Mastercard",
  "Visa",
  "PayFast",
  "Instant EFT",
  "Apple Pay",
] as const;

export function formatRand(amount: number) {
  const negative = amount < 0;
  const [whole, cents] = Math.abs(amount).toFixed(2).split(".");
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return `${negative ? "-" : ""}R${grouped}.${cents}`;
}
