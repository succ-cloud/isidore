export const legalPages: Record<string, { title: string; description: string; paragraphs: string[] }> = {
  terms: {
    title: "Terms and Conditions",
    description: "Starter terms for shopping with Isdore Solar. Replace this page with counsel-reviewed terms before launch.",
    paragraphs: [
      "These starter terms explain how orders, pricing, and collections work on this website. They are a working draft for the build, not a final legal document.",
      "Prices are shown in South African rand and can change when supplier costs change. A price is confirmed when we accept the order, not when an item is first added to the cart.",
      "Delivery windows depend on branch stock and the address you give us. Risk in the goods passes when they are handed to you or to the person who signs for the delivery.",
      "Have these terms reviewed for your company, your payment provider, and the Consumer Protection Act before the site takes real orders.",
    ],
  },
  disclaimer: {
    title: "Disclaimer",
    description: "Product information on this site is a buying guide, not an installation instruction.",
    paragraphs: [
      "Catalogue descriptions help you compare products. They are not a design for a specific roof, board, or supply.",
      "Electrical and solar work must follow the applicable wiring code and, where required, be signed off by a registered person. Matching a wattage on this site does not replace that design.",
      "Photographs and illustrations show the type of product. The item delivered may differ in colour or minor detail.",
    ],
  },
  returns: {
    title: "Return Policy",
    description: "How unused stock can be returned within 30 days.",
    paragraphs: [
      "Unused items in a resaleable condition can be returned within 30 days of collection or delivery, with the invoice.",
      "Cable that has been cut, opened consumables, and special-order items are not returnable unless they arrived damaged or incorrect.",
      "Tell us before you send a parcel back. We will confirm the branch that should receive it and whether a collection fee applies.",
    ],
  },
  "b-bbee": {
    title: "B-BBEE",
    description: "Placeholder for the Isdore Solar B-BBEE affidavit or certificate.",
    paragraphs: [
      "A B-BBEE affidavit or certificate will be published here once the company details are final.",
      "Until that document is loaded, email the trade desk and ask for the current affidavit rather than relying on this page.",
    ],
  },
  paia: {
    title: "PAIA Manual",
    description: "Placeholder for the Promotion of Access to Information Act manual.",
    paragraphs: [
      "The PAIA manual will list the company information officer and the records a requester may ask for.",
      "This starter page is not that manual. Publish the completed manual, in the form required at the time, before you invite public requests.",
    ],
  },
  "internal-processing": {
    title: "Internal Processing Notice",
    description: "How staff and applicant information is handled.",
    paragraphs: [
      "Job applications sent through this site are used to consider you for the role you applied for and are kept only as long as that process, and any legal duty, requires.",
      "Access is limited to the people hiring for that role. Do not send identity documents until you are asked for them.",
    ],
  },
  "external-processing": {
    title: "External Processing Notice",
    description: "How customer and mailing-list information is handled.",
    paragraphs: [
      "If you create an account, request a quote, check out, or join the mailing list, we store the details you submit so we can answer you and fulfil the order.",
      "We do not sell that list. Mail is only sent for the purpose you signed up for, and you can ask to be removed by emailing the address in the footer.",
      "When email delivery is switched on, messages are sent through the mail host named in the site configuration. Card numbers are not collected on this website.",
      "Browsing activity is collected only after you allow it. The privacy notice explains the cookie, what is stored, how long it is kept, and how to delete it.",
    ],
  },
  privacy: {
    title: "Privacy notice",
    description: "What the store records about visits, carts, and checkouts, and how to delete it.",
    paragraphs: [
      "If you allow analytics, this site stores a first-party cookie that identifies the browser. It is not a device fingerprint. The cookie lets us connect page views, searches, cart changes, checkout steps, and a completed order to the same visit.",
      "Each record can include the event type, the time, the page address, a product or category reference, a short search phrase, the page you came from, and campaign parameters such as utm_source when they are present. After you register or log in, later activity and the earlier activity from that same browser can be linked to your account.",
      "We do not record passwords, card numbers, authentication tokens, or the street address typed into checkout. Checkout progress stays in this browser so you can resume an order. Cart value shown to staff is calculated from current catalogue prices.",
      "An open cart or checkout is treated as abandoned only after it has been idle for the period configured on the server, normally 60 minutes. Placing the order marks that checkout complete so it is no longer an open abandonment.",
      "Visitor events and checkout records are deleted after the retention period configured on the server, normally 180 days. You can decline analytics, or delete the activity already stored for this browser, from this page. Signed-in customers can also delete it from their account. Orders you placed are kept because they are business records, not browsing activity. We do not send recovery emails from this tracking.",
    ],
  },
};
