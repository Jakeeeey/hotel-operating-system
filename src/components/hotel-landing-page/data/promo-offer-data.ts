import { OfferCampaignData } from "../types/types";

export const offers: OfferCampaignData[] = [
  {
    id: "escape-50",
    code: "ESCAPE50",
    title: "Get Extra Discount at Azure Oasis Hotel",
    subtitle: "Experience uncompromised luxury with a curated premium rate reduction.",
    badge: "Limited Campaign",
    discountValue: 50,
    discountType: "percentage",
    discountSubtext: "OFF SELECTIONS",
    description: "Designed precisely for guests prioritizing absolute serenity. Secure immediate entry allocations into our premium suites, overwater spaces, and beachfront villas with full spatial privileges at half the standard seasonal commitment rate.",
    validFrom: "2026-01-14",
    validUntil: "2026-01-20",
    expirationDate: "2026-06-30",
    inclusions: [
      "Complimentary ultra-high-speed fiber connection link",
      "Tailored room climate mapping control presets",
      "Welcome local artisanal culinary spread upon arrival",
      "Flexible checkout prioritization arrangements"
    ],
    terms: [
      "Applicable exclusively for room inventories booked during active operational windows.",
      "Requires a verified occupancy parameter mapping between 1 to 4 occupants maximum.",
      "Cannot be stacked concurrently with alternative corporate tier discount tokens.",
      "Cancellation protocols must be dispatched 48 hours prior to the arrival window."
    ],
    bannerImage: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1600"
  },
  {
    id: "exclusive-75",
    code: "EXCLUSIVE75",
    title: "Exclusive Deals Just For You",
    subtitle: "Our most aggressive seasonal reduction tailored for premium loyalty club tiers.",
    badge: "Flash Promotion",
    discountValue: 75,
    discountType: "percentage",
    discountSubtext: "OFF VIP SUITES",
    description: "An uncompromised invitation to experience our ultimate architectural suites. This high-tier campaign provides unprecedented entry access to elite penthouse layouts and private infinity lagoon setups.",
    validFrom: "2026-01-16",
    validUntil: "2026-01-28",
    expirationDate: "2026-08-15",
    inclusions: [
      "24/7 Dedicated butler allocation link",
      "All-inclusive private airfield transfer logistics",
      "Premium spa facility allocations unlocked fully",
      "Complementary vintage reserves menu tier access"
    ],
    terms: [
      "Valid strictly for consecutive stays surpassing a 2-night minimum threshold.",
      "Non-refundable allocation mapping parameters apply instantly upon checkout processing.",
      "Exclusive to loyalty framework token account holders."
    ],
    bannerImage: "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=1600"
  },
  {
    id: "culinary-escape",
    code: "GASTRO20",
    title: "Epicurean Heritage Tasting Journey",
    subtitle: "Intertwine your architectural room stay with high-end Michelin standard kitchen pathways.",
    badge: "Gourmet Package",
    discountValue: 20,
    discountType: "percentage",
    discountSubtext: "OFF + DINING LINK",
    description: "Immerse your spatial stay inside curated local culinary profiles. This integrated package matches premium beachside master villa stays with tailored night course privileges custom crafted by our resident executive chefs.",
    validFrom: "2026-02-10",
    validUntil: "2026-02-25",
    expirationDate: "2026-09-30",
    inclusions: [
      "Daily full-course complimentary morning breakfast spreads",
      "One structured 7-course culinary pairing menu session voucher",
      "Priority reservations pool across all contextual in-house bars"
    ],
    terms: [
      "Dining voucher configuration requires notification minimum 24 hours prior.",
      "Drinks and specialized vintage reserves are processed under separate billing tokens.",
      "Applicable strictly for master tier room selections."
    ],
    bannerImage: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1600"
  }
];