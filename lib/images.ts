const categoryPhotos: Record<string, string[]> = {
  "air-management": ["/images/hvac-1.jpg", "/images/hvac-2.jpg", "/images/hvac-3.jpg", "/images/hvac-4.jpg"],
  "cable-wire": ["/images/cable-1.jpg", "/images/cable-2.jpg", "/images/cable-3.jpg", "/images/cable-4.jpg"],
  distribution: ["/images/board-1.jpg", "/images/board-2.jpg", "/images/board-3.jpg", "/images/board-4.jpg"],
  general: ["/images/general-1.jpg", "/images/general-2.jpg", "/images/general-3.jpg", "/images/general-4.jpg"],
  lighting: ["/images/light-1.jpg", "/images/light-2.jpg", "/images/light-3.jpg", "/images/light-4.jpg"],
  meters: ["/images/meter-1.jpg?v=2", "/images/meter-2.jpg?v=2", "/images/meter-3.jpg?v=2", "/images/meter-4.jpg?v=2"],
  security: ["/images/security-1.jpg", "/images/security-2.jpg", "/images/security-3.jpg", "/images/security-4.jpg"],
  "solar-backup": ["/images/solar-1.jpg", "/images/solar-2.jpg", "/images/solar-3.jpg", "/images/solar-4.jpg"],
  switches: ["/images/switch-1.jpg", "/images/switch-2.jpg", "/images/switch-3.jpg", "/images/switch-4.jpg"],
  switchgear: ["/images/gear-1.jpg", "/images/gear-2.jpg", "/images/gear-3.jpg", "/images/gear-4.jpg"],
  transmission: ["/images/line-1.jpg", "/images/line-2.jpg", "/images/line-3.jpg", "/images/line-4.jpg"],
  pumps: ["/images/pump-1.jpg", "/images/pump-2.jpg", "/images/pump-3.jpg", "/images/pump-4.jpg"],
};

export const heroPhotos = {
  summer: "/images/hero-summer.jpg",
  solar: "/images/hero-solar.jpg",
  trade: "/images/hero-trade.jpg",
};

export function categoryImages(value: unknown) {
  if (!Array.isArray(value)) return [];
  const images: string[] = [];
  for (const item of value) {
    const src = String(item ?? "").trim().slice(0, 240);
    if (!/^\/(uploads|images)\/[A-Za-z0-9._?=-]+$/.test(src) || images.includes(src)) continue;
    images.push(src);
    if (images.length === 4) break;
  }
  return images;
}

export function layoutForImageCount(count: number) {
  if (count <= 1) return "solo" as const;
  if (count === 2) return "split" as const;
  if (count === 3) return "trio" as const;
  return "grid" as const;
}

export function categoryPhotoSet(slug: string) {
  return categoryPhotos[slug] ?? categoryPhotos.general;
}

export function photoFor(category: string, seed = "") {
  const photos = categoryPhotoSet(category);
  const index = [...seed].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return photos[index % photos.length];
}
