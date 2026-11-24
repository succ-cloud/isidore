export type Category = {
  slug: string;
  name: string;
  summary: string;
  layout: "solo" | "split" | "trio" | "grid" | "stack" | "reel" | "panel";
};

export type Subcategory = {
  slug: string;
  name: string;
  categorySlug: string;
  summary: string;
};

export type Product = {
  slug: string;
  name: string;
  categorySlug: string;
  subcategorySlug: string;
  brand: string;
  price: number;
  compareAt?: number;
  sku: string;
  inStock: boolean;
  featured?: boolean;
  promo?: boolean;
  summary: string;
  description: string;
  specs: { label: string; value: string }[];
};

export const categories: Category[] = [
  {
    slug: "air-management",
    name: "Air Management & HVAC",
    summary: "Cooling, ventilation, and climate equipment for homes and light commercial sites.",
    layout: "stack",
  },
  {
    slug: "cable-wire",
    name: "Cable & Wire",
    summary: "Building wire, solar cable, and armoured cable sold by the drum and the metre.",
    layout: "reel",
  },
  {
    slug: "lighting",
    name: "Lighting",
    summary: "Indoor, outdoor, and highbay lighting for trade and retail projects.",
    layout: "stack",
  },
  {
    slug: "meters",
    name: "Meters & Testers",
    summary: "Multimeters, clamp meters, and testers for checking a circuit before you energise it.",
    layout: "grid",
  },
  {
    slug: "security",
    name: "Security & Smart Home",
    summary: "Cameras, door stations, and the low-voltage gear around a small security install.",
    layout: "reel",
  },
  {
    slug: "solar-backup",
    name: "Solar & Backup Power",
    summary: "Panels, hybrid inverters, batteries, and isolation for backup power.",
    layout: "stack",
  },
  {
    slug: "switches",
    name: "Switches & Sockets",
    summary: "Wall switches, socket outlets, and the plates that finish a room.",
    layout: "grid",
  },
];

export const subcategories: Subcategory[] = [
  { slug: "solar-inverters", name: "Solar inverters", categorySlug: "solar-backup", summary: "Hybrid and backup inverters." },
  { slug: "solar-battery", name: "Solar battery", categorySlug: "solar-backup", summary: "Batteries for evening and backup loads." },
  { slug: "solar-panels", name: "Solar panels", categorySlug: "solar-backup", summary: "Modules for roof arrays." },
  { slug: "solar-isolation", name: "Solar isolation", categorySlug: "solar-backup", summary: "Isolators for PV strings." },
  { slug: "building-wire", name: "Building wire", categorySlug: "cable-wire", summary: "Twin and earth for circuits inside the building." },
  { slug: "solar-cable", name: "Solar cable", categorySlug: "cable-wire", summary: "UV-resistant cable for array runs." },
  { slug: "armoured-cable", name: "Armoured cable", categorySlug: "cable-wire", summary: "Steel-wire armoured cable for submains." },
  { slug: "highbay-lighting", name: "Highbay lighting", categorySlug: "lighting", summary: "Highbay fittings for tall indoor spaces." },
  { slug: "air-conditioners", name: "Air conditioners", categorySlug: "air-management", summary: "Split systems for rooms and offices." },
  { slug: "ventilation", name: "Ventilation", categorySlug: "air-management", summary: "Extractors for bathrooms and sculleries." },
  { slug: "testers", name: "Testers", categorySlug: "meters", summary: "Meters for checking a circuit." },
  { slug: "cameras", name: "Cameras", categorySlug: "security", summary: "Cameras for entrances and yards." },
  { slug: "sockets", name: "Sockets", categorySlug: "switches", summary: "Socket outlets and plates." },
];

export const brands = ["Helioform", "Copperline", "Cleararc", "Northbeam", "Yardline", "Braketec"];

export const products: Product[] = [
  {
    slug: "helioform-5kw-hybrid-inverter",
    name: "Helioform 5kW Hybrid Inverter",
    categorySlug: "solar-backup",
    subcategorySlug: "solar-inverters",
    brand: "Helioform",
    price: 14500,
    compareAt: 15900,
    sku: "IS-INV-5000",
    inStock: true,
    featured: true,
    promo: true,
    summary: "Single-phase hybrid inverter for home backup and daytime solar use.",
    description:
      "A 5kW hybrid inverter for homes that want solar production and battery backup on the same board. It is aimed at installers who need a compact wall unit with a clear display, PV input, and a backup output for essential circuits.",
    specs: [
      { label: "Rated output", value: "5kW" },
      { label: "Phase", value: "Single phase" },
      { label: "Use", value: "Home backup" },
    ],
  },
  {
    slug: "helioform-51kwh-wall-battery",
    name: "Helioform 5.1kWh Wall Battery",
    categorySlug: "solar-backup",
    subcategorySlug: "solar-battery",
    brand: "Helioform",
    price: 18900,
    sku: "IS-BAT-51",
    inStock: true,
    featured: true,
    summary: "Wall-mounted lithium battery matched to the Helioform hybrid range.",
    description:
      "A 5.1kWh wall battery for evening backup of lights, internet, and refrigeration. Pair it with the 5kW hybrid inverter. Extra modules can be quoted for larger essential loads.",
    specs: [
      { label: "Capacity", value: "5.1kWh" },
      { label: "Mounting", value: "Wall" },
      { label: "Chemistry", value: "Lithium iron phosphate" },
    ],
  },
  {
    slug: "northbeam-550w-solar-panel",
    name: "Northbeam 550W Solar Panel",
    categorySlug: "solar-backup",
    subcategorySlug: "solar-panels",
    brand: "Northbeam",
    price: 2150,
    compareAt: 2390,
    sku: "IS-PV-550",
    inStock: true,
    promo: true,
    summary: "High-output panel for residential roof arrays.",
    description:
      "A 550W panel for pitched-roof arrays. Panels are sold individually so you can size an array to the roof and the inverter rather than buying a fixed kit.",
    specs: [
      { label: "Wattage", value: "550W" },
      { label: "Cell type", value: "Monocrystalline" },
      { label: "Use", value: "Residential roofs" },
    ],
  },
  {
    slug: "cleararc-dc-isolator",
    name: "Cleararc DC Isolator",
    categorySlug: "solar-backup",
    subcategorySlug: "solar-isolation",
    brand: "Cleararc",
    price: 420,
    sku: "IS-ISO-DC",
    inStock: true,
    summary: "DC isolator for rooftop PV strings.",
    description:
      "A DC isolator used between the array and the inverter so a string can be shut down for service. Confirm voltage and current against the string design before ordering.",
    specs: [
      { label: "Circuit", value: "DC string" },
      { label: "Mounting", value: "Surface" },
    ],
  },
  {
    slug: "copperline-2-5mm-twin-earth-100m",
    name: "Copperline 2.5mm Twin & Earth 100m",
    categorySlug: "cable-wire",
    subcategorySlug: "building-wire",
    brand: "Copperline",
    price: 1890,
    sku: "IS-CAB-25-100",
    inStock: true,
    featured: true,
    summary: "100 metre drum of 2.5mm twin and earth for socket circuits.",
    description:
      "General-purpose 2.5mm twin and earth on a 100 metre drum. Suitable for typical socket circuits when the run length and protection are designed to the installation.",
    specs: [
      { label: "Size", value: "2.5mm²" },
      { label: "Length", value: "100m" },
      { label: "Type", value: "Twin and earth" },
    ],
  },
  {
    slug: "copperline-6mm-solar-cable-100m",
    name: "Copperline 6mm Solar Cable 100m",
    categorySlug: "cable-wire",
    subcategorySlug: "solar-cable",
    brand: "Copperline",
    price: 2450,
    sku: "IS-CAB-PV-100",
    inStock: true,
    promo: true,
    summary: "UV-resistant solar cable for array runs.",
    description:
      "Black 6mm solar cable supplied in 100 metre lengths for DC runs between the roof and the inverter. It is built for outdoor exposure on PV installations.",
    specs: [
      { label: "Size", value: "6mm²" },
      { label: "Length", value: "100m" },
      { label: "Colour", value: "Black" },
    ],
  },
  {
    slug: "copperline-16mm-armoured-50m",
    name: "Copperline 16mm Armoured Cable 50m",
    categorySlug: "cable-wire",
    subcategorySlug: "armoured-cable",
    brand: "Copperline",
    price: 6200,
    sku: "IS-CAB-SWA-50",
    inStock: false,
    summary: "50 metre coil of armoured cable for submains.",
    description:
      "Steel-wire armoured cable for submains and outdoor feeds where mechanical protection is required. This coil is currently awaiting the next inbound delivery.",
    specs: [
      { label: "Size", value: "16mm²" },
      { label: "Length", value: "50m" },
      { label: "Armour", value: "Steel wire" },
    ],
  },
  {
    slug: "northbeam-150w-highbay",
    name: "Northbeam 150W LED Highbay",
    categorySlug: "lighting",
    subcategorySlug: "highbay-lighting",
    brand: "Northbeam",
    price: 890,
    compareAt: 1040,
    sku: "IS-HB-150",
    inStock: true,
    promo: true,
    featured: true,
    summary: "Highbay fitting for workshops and warehouses.",
    description:
      "A 150W LED highbay for workshops, storage, and retail floors with higher ceilings. The housing is meant for indoor industrial spaces.",
    specs: [
      { label: "Wattage", value: "150W" },
      { label: "Source", value: "LED" },
      { label: "Use", value: "High ceiling indoor" },
    ],
  },
  {
    slug: "braketec-12000-btu-inverter-ac",
    name: "Braketec 12 000 BTU Inverter Air Conditioner",
    categorySlug: "air-management",
    subcategorySlug: "air-conditioners",
    brand: "Braketec",
    price: 7400,
    sku: "IS-AC-12",
    inStock: true,
    featured: true,
    summary: "Split inverter air conditioner for a bedroom or office.",
    description:
      "A 12 000 BTU inverter split for a single room. The outdoor unit needs a solid wall and a condensate route. Installation is quoted separately.",
    specs: [
      { label: "Capacity", value: "12 000 BTU" },
      { label: "Type", value: "Inverter split" },
    ],
  },
  {
    slug: "braketec-bathroom-extractor",
    name: "Braketec Bathroom Extractor",
    categorySlug: "air-management",
    subcategorySlug: "ventilation",
    brand: "Braketec",
    price: 310,
    sku: "IS-EX-100",
    inStock: true,
    summary: "Ceiling extractor for bathrooms and sculleries.",
    description:
      "A compact extractor for bathrooms and sculleries. Use it with a suitable duct run to the outside rather than into the roof void.",
    specs: [
      { label: "Mounting", value: "Ceiling" },
      { label: "Use", value: "Bathroom ventilation" },
    ],
  },
  {
    slug: "cleararc-digital-multimeter",
    name: "Cleararc Digital Multimeter",
    categorySlug: "meters",
    subcategorySlug: "testers",
    brand: "Cleararc",
    price: 890,
    sku: "IS-MM-01",
    inStock: true,
    summary: "Handheld meter for voltage, current, and continuity checks.",
    description: "A digital multimeter for installers checking a circuit before it is energised. It covers the everyday voltage and continuity tests on a domestic or light commercial board.",
    specs: [{ label: "Type", value: "Digital handheld" }],
  },
  {
    slug: "northbeam-bullet-camera",
    name: "Northbeam Bullet Camera",
    categorySlug: "security",
    subcategorySlug: "cameras",
    brand: "Northbeam",
    price: 1450,
    sku: "IS-CAM-01",
    inStock: true,
    summary: "Outdoor bullet camera for a small premises.",
    description: "A weather-resistant bullet camera for entrances and yards. Pair it with a recorder and the cable run when you quote the job.",
    specs: [{ label: "Use", value: "Outdoor" }],
  },
  {
    slug: "yardline-double-socket",
    name: "Yardline Double Socket",
    categorySlug: "switches",
    subcategorySlug: "sockets",
    brand: "Yardline",
    price: 78,
    sku: "IS-SKT-2",
    inStock: true,
    summary: "16A double switched socket outlet.",
    description: "A switched double socket for general wall outlets. Confirm the plate style before you order a full house quantity.",
    specs: [{ label: "Outlets", value: "2" }],
  },
];

export function categoryBySlug(slug: string) {
  return categories.find((category) => category.slug === slug);
}

export function productBySlug(slug: string) {
  return products.find((product) => product.slug === slug);
}

export function productsInCategory(slug: string) {
  return products.filter((product) => product.categorySlug === slug);
}

export function subcategoriesInCategory(slug: string) {
  return subcategories.filter((item) => item.categorySlug === slug);
}
