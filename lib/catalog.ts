export type Category = {
  slug: string;
  name: string;
  summary: string;
  layout: "stack" | "reel" | "panel" | "grid";
};

export type Product = {
  slug: string;
  name: string;
  categorySlug: string;
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
    slug: "distribution",
    name: "Distribution & Protection",
    summary: "Boards, breakers, earth leakage, and surge protection for safe installations.",
    layout: "panel",
  },
  {
    slug: "general",
    name: "General Electrical",
    summary: "The everyday consumables and fittings that finish a job.",
    layout: "grid",
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
  {
    slug: "switchgear",
    name: "Switchgear & Motor Control",
    summary: "Contactors, overloads, and motor starters for panels and plant.",
    layout: "panel",
  },
  {
    slug: "transmission",
    name: "Transmission & Distribution",
    summary: "Line hardware and distribution equipment for feeds beyond the building.",
    layout: "reel",
  },
  {
    slug: "pumps",
    name: "Water Pumps",
    summary: "Borehole, booster, and drainage pumps with the control gear beside them.",
    layout: "stack",
  },
];

export const brands = ["Helioform", "Copperline", "Cleararc", "Northbeam", "Yardline", "Braketec"];

export const products: Product[] = [
  {
    slug: "helioform-5kw-hybrid-inverter",
    name: "Helioform 5kW Hybrid Inverter",
    categorySlug: "solar-backup",
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
    slug: "cleararc-12-way-distribution-board",
    name: "Cleararc 12-Way Distribution Board",
    categorySlug: "distribution",
    brand: "Cleararc",
    price: 980,
    sku: "IS-DB-12",
    inStock: true,
    featured: true,
    summary: "Surface distribution board for a small home or flat.",
    description:
      "A 12-way surface board for apartments and small houses. It gives room for lighting, plugs, a stove, and a spare way without crowding the enclosure.",
    specs: [
      { label: "Ways", value: "12" },
      { label: "Mounting", value: "Surface" },
    ],
  },
  {
    slug: "cleararc-63a-earth-leakage",
    name: "Cleararc 63A Earth Leakage",
    categorySlug: "distribution",
    brand: "Cleararc",
    price: 540,
    sku: "IS-ELU-63",
    inStock: true,
    summary: "63 amp earth leakage unit for the main incomer.",
    description:
      "A 63A earth leakage device for the incoming side of a domestic board. Match the sensitivity and breaking capacity to the supply before you fit it.",
    specs: [
      { label: "Current", value: "63A" },
      { label: "Role", value: "Earth leakage" },
    ],
  },
  {
    slug: "cleararc-surge-protection",
    name: "Cleararc Surge Protection Device",
    categorySlug: "distribution",
    brand: "Cleararc",
    price: 760,
    compareAt: 890,
    sku: "IS-SPD-T2",
    inStock: true,
    promo: true,
    summary: "Type 2 surge protection for distribution boards.",
    description:
      "Type 2 surge protection for boards that feed electronics, inverters, and gate motors. It sits beside the main protection and gives a visible status flag.",
    specs: [
      { label: "Type", value: "Type 2" },
      { label: "Mounting", value: "DIN rail" },
    ],
  },
  {
    slug: "yardline-cable-ties-100",
    name: "Yardline Cable Ties 100 Pack",
    categorySlug: "general",
    brand: "Yardline",
    price: 45,
    sku: "IS-TIE-100",
    inStock: true,
    summary: "UV-stable cable ties for trunking and tray work.",
    description:
      "A pack of 100 cable ties for dressing wire in trunking, on tray, and around temporary site leads.",
    specs: [
      { label: "Pack", value: "100" },
      { label: "Style", value: "UV-stable nylon" },
    ],
  },
  {
    slug: "yardline-insulation-tape-10",
    name: "Yardline Insulation Tape 10 Pack",
    categorySlug: "general",
    brand: "Yardline",
    price: 62,
    sku: "IS-TAPE-10",
    inStock: true,
    summary: "Ten rolls of PVC insulation tape.",
    description:
      "A ten-roll pack of PVC insulation tape for marking phases and finishing joints. It is a counter item, not a substitute for a proper connector.",
    specs: [
      { label: "Pack", value: "10 rolls" },
      { label: "Material", value: "PVC" },
    ],
  },
  {
    slug: "northbeam-150w-highbay",
    name: "Northbeam 150W LED Highbay",
    categorySlug: "lighting",
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
    slug: "yardline-conduit-20mm-3m",
    name: "Yardline 20mm Conduit 3m",
    categorySlug: "general",
    brand: "Yardline",
    price: 38,
    sku: "IS-CON-20",
    inStock: true,
    summary: "3 metre length of 20mm PVC conduit.",
    description:
      "A 3 metre length of 20mm PVC conduit for surface wiring. Couplers and saddles are listed separately in general electrical.",
    specs: [
      { label: "Diameter", value: "20mm" },
      { label: "Length", value: "3m" },
    ],
  },
  {
    slug: "cleararc-digital-multimeter",
    name: "Cleararc Digital Multimeter",
    categorySlug: "meters",
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
    brand: "Yardline",
    price: 78,
    sku: "IS-SKT-2",
    inStock: true,
    summary: "16A double switched socket outlet.",
    description: "A switched double socket for general wall outlets. Confirm the plate style before you order a full house quantity.",
    specs: [{ label: "Outlets", value: "2" }],
  },
  {
    slug: "cleararc-contactor-32a",
    name: "Cleararc 32A Contactor",
    categorySlug: "switchgear",
    brand: "Cleararc",
    price: 640,
    sku: "IS-CON-32",
    inStock: true,
    summary: "32 amp contactor for motor and load control.",
    description: "A 32A contactor for starter panels and controlled loads. Match the coil voltage to the control circuit before you fit it.",
    specs: [{ label: "Current", value: "32A" }],
  },
  {
    slug: "copperline-abc-bundle",
    name: "Copperline Aerial Bundle",
    categorySlug: "transmission",
    brand: "Copperline",
    price: 3200,
    sku: "IS-ABC-50",
    inStock: true,
    summary: "Aerial bundled conductor for a short distribution span.",
    description: "Aerial bundled conductor for a short overhead span. The length and tension still need to be designed for the poles on site.",
    specs: [{ label: "Supply", value: "50m coil" }],
  },
  {
    slug: "braketec-booster-pump",
    name: "Braketec Booster Pump",
    categorySlug: "pumps",
    brand: "Braketec",
    price: 2750,
    sku: "IS-PMP-01",
    inStock: true,
    summary: "Domestic booster pump for low municipal pressure.",
    description: "A compact booster pump for a house with weak incoming pressure. Installation, non-return valves, and protection are quoted with the unit.",
    specs: [{ label: "Use", value: "Domestic booster" }],
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

export type Branch = {
  id: string;
  name: string;
  city: string;
  address: string;
  phone: string;
  hours: string;
};

export const branches: Branch[] = [
  {
    id: "johannesburg",
    name: "Johannesburg Trade Counter",
    city: "Johannesburg",
    address: "1 Market Road, Johannesburg, 2001",
    phone: "010 020 0301",
    hours: "Mon–Fri 07:30–17:00, Sat 08:00–13:00",
  },
  {
    id: "pretoria",
    name: "Pretoria Trade Counter",
    city: "Pretoria",
    address: "18 Station Street, Pretoria, 0002",
    phone: "010 020 0302",
    hours: "Mon–Fri 07:30–17:00, Sat 08:00–12:30",
  },
  {
    id: "durban",
    name: "Durban Trade Counter",
    city: "Durban",
    address: "42 Harbour Lane, Durban, 4001",
    phone: "010 020 0303",
    hours: "Mon–Fri 07:30–16:30, Sat 08:00–12:00",
  },
  {
    id: "cape-town",
    name: "Cape Town Trade Counter",
    city: "Cape Town",
    address: "9 Dock Road, Cape Town, 8001",
    phone: "010 020 0304",
    hours: "Mon–Fri 08:00–17:00, Sat 08:30–12:30",
  },
  {
    id: "gqeberha",
    name: "Gqeberha Trade Counter",
    city: "Gqeberha",
    address: "6 Pier Street, Gqeberha, 6001",
    phone: "010 020 0305",
    hours: "Mon–Fri 07:30–16:30, Sat 08:00–12:00",
  },
];

export function branchById(id: string) {
  return branches.find((branch) => branch.id === id);
}
