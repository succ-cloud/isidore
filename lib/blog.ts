export type Post = {
  slug: string;
  title: string;
  description: string;
  date: string;
  author: string;
  body: string[];
};

export const posts: Post[] = [
  {
    slug: "size-a-home-backup-without-overselling-the-battery",
    title: "Size a home backup without overselling the battery",
    description:
      "How to list essential loads, estimate evening use, and choose a first battery before you add more storage.",
    date: "2026-09-12",
    author: "Isdore Solar",
    body: [
      "A backup system fails in conversation long before it fails on the wall. The usual cause is a battery quoted for the whole house when the family only needed lights, the fridge, the router, and a television after sunset.",
      "Start with the circuits that must stay on. Write the appliance, its wattage, and how many hours it runs after dark. A fridge that cycles, a fibre router, and a handful of LED lights are a very different load from a kettle, a stove, and a geyser.",
      "Multiply watts by hours to get watt-hours, then add a margin for inverter losses and cloudy days. A 5kWh wall battery is often enough for that essential board. It is rarely enough for cooking and water heating, and it should not be sold as if it is.",
      "Once the essential board is stable, extra batteries are an easy second visit. That sequence keeps the first invoice honest and leaves trunking, DC cable, and protection sized for the later modules.",
    ],
  },
  {
    slug: "what-to-check-before-ordering-solar-cable",
    title: "What to check before ordering solar cable",
    description:
      "Run length, current, colour coding, and UV exposure are the four checks that stop a cable order coming back.",
    date: "2026-08-03",
    author: "Isdore Solar",
    body: [
      "Solar cable is not a thicker version of house wire. It lives outdoors, it carries DC, and the run from roof to inverter is often longer than the sketch on the quotation.",
      "Measure the actual route, including drops down the wall and loops at the isolator, then choose a cross-section for that current and length. A 6mm drum is a common starting point for a small residential string. It is not a rule.",
      "Order positive and negative colours on purpose, and keep the DC isolator on the same ticket so the string can be made safe on the day. UV resistance matters on a roof; a bargain coil that chalks in a season is not a saving.",
      "If the array is still being designed, buy one drum and confirm the second after the string layout is fixed. Cable left on a drum is easier to return than a custom cut that was guessed.",
    ],
  },
  {
    slug: "how-trade-accounts-change-a-site-order",
    title: "How trade accounts change a site order",
    description:
      "A trade account is a way to separate counter collections, delivery, and monthly paperwork for repeat electrical work.",
    date: "2026-07-18",
    author: "Isdore Solar",
    body: [
      "Cash at the counter is fine for a single reel of tape. It gets clumsy when a site needs a board, cable, and a return visit for the breakers that were missed.",
      "A trade account puts the company name on the invoice, keeps branch collections on one statement, and lets a foreman collect against an order number instead of a personal card.",
      "Ask for the account before the project starts. Approvals that arrive on delivery day hold the truck. Have the registration details, a delivery address, and the people allowed to collect ready in the application.",
      "The account does not change the product. It changes who can fetch it, how it is billed, and how a shortage is fixed the next morning.",
    ],
  },
];

export function postBySlug(slug: string) {
  return posts.find((post) => post.slug === slug);
}
