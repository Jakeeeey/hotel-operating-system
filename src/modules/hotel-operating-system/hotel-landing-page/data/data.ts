import { ReviewData, PromoOfferData, OverviewStatData, PartnerLogoData } from "../types/types";
import { RoomData } from "../pages/home/types/room.types";

// ==========================================
// 1. PROMO OFFERS DATA (<PromoOffers />)
// ==========================================
export const promoOffers: PromoOfferData[] = [
  {
    id: 1,
    discountPercentage: 50,
    title: "Get promo for a cheaper price",
    subtitle: "Exclusive Flash Sale for Next.js Developers. Limited availability.",
    backgroundImage: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=600",
    badgeText: "Flash Sale",
    ctaText: "Claim 50% Off",
  },
  {
    id: 2,
    discountPercentage: 75,
    title: "Exclusive Premium Packages",
    subtitle: "Unlock complete private villa experiences for extended stays.",
    backgroundImage: "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=600",
    badgeText: "Loyalty Only",
    ctaText: "Claim 75% Off",
  },
];

// ==========================================
// 2. OVERVIEW METRICS (<HotelOverview />)
// ==========================================
export const overviewStats: OverviewStatData[] = [
  { id: 1, label: "Curated Rooms", value: "48+", iconName: "Bed", description: "Luxury rooms tailored for deep comfort" },
  { id: 2, label: "Destinations", value: "3", iconName: "MapPin", description: "Breathtaking beachfront environments" },
  { id: 3, label: "Guest Rating", value: "4.9★", iconName: "Star", description: "Based on verified community feedback" },
  { id: 4, label: "Support Counter", value: "24/7", iconName: "ShieldCheck", description: "Dedicated on-site support lines available" },
];

// ==========================================
// 3. ROOM CATALOG DATA (<BrowseRooms />)
// ==========================================
export const rooms: RoomData[] = [
  {
    id: 1,
    type: "deluxe",
    name: "Deluxe Ocean Room",
    badge: "Deluxe",
    image: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600",
    bed: "King Bed",
    sqm: "38 m²",
    rating: 4.8,
    reviews: 312,
    amenities: ["Ocean View", "AC", "WiFi", "Minibar"],
    price: 320,
    originalPrice: 410,
    availability: "available",
    availabilityText: "Available",
  },
  {
    id: 2,
    type: "suite",
    name: "Premium Suite",
    badge: "Suite",
    image: "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=600",
    bed: "King Bed",
    sqm: "55 m²",
    rating: 4.9,
    reviews: 187,
    amenities: ["Ocean View", "Terrace", "Bathtub", "Butler"],
    price: 580,
    originalPrice: 720,
    availability: "low",
    availabilityText: "3 rooms left",
  },
  {
    id: 3,
    type: "villa",
    name: "Garden Villa",
    badge: "Villa",
    image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600",
    bed: "Twin Beds",
    sqm: "42 m²",
    rating: 4.7,
    reviews: 241,
    amenities: ["Garden View", "Private Pool", "AC", "Spa"],
    price: 450,
    originalPrice: 560,
    availability: "available",
    availabilityText: "Available",
  },
  {
    id: 4,
    type: "overwater",
    name: "Overwater Bungalow",
    badge: "Overwater",
    image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=600",
    bed: "King Bed",
    sqm: "72 m²",
    rating: 5.0,
    reviews: 98,
    amenities: ["Overwater", "Glass Floor", "Butler", "Shower"],
    price: 1200,
    originalPrice: 1500,
    availability: "critical",
    availabilityText: "1 room left",
  },
  {
    id: 5,
    type: "deluxe",
    name: "Deluxe Lagoon Room",
    badge: "Deluxe",
    image: "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=600",
    bed: "Queen Bed",
    sqm: "35 m²",
    rating: 4.6,
    reviews: 309,
    amenities: ["Lagoon View", "AC", "WiFi", "Balcony"],
    price: 290,
    originalPrice: 380,
    availability: "available",
    availabilityText: "Available",
  },
  {
    id: 6,
    type: "suite",
    name: "Family Suite",
    badge: "Suite",
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600",
    bed: "2 King Beds",
    sqm: "80 m²",
    rating: 4.8,
    reviews: 156,
    amenities: ["Ocean View", "Kids Area", "Pool", "2 Baths"],
    price: 750,
    originalPrice: 900,
    availability: "low",
    availabilityText: "2 rooms left",
  },
  {
    id: 7,
    type: "villa",
    name: "Beach Pool Villa",
    badge: "Villa",
    image: "https://images.unsplash.com/photo-1455587734955-081b22074882?w=600",
    bed: "King Bed",
    sqm: "95 m²",
    rating: 4.9,
    reviews: 72,
    amenities: ["Beachfront", "Private Pool", "Dining", "Butler"],
    price: 1800,
    originalPrice: null,
    availability: "available",
    availabilityText: "Available",
  },
  {
    id: 8,
    type: "suite",
    name: "Honeymoon Suite",
    badge: "Suite",
    image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=600",
    bed: "King Bed",
    sqm: "65 m²",
    rating: 5.0,
    reviews: 44,
    amenities: ["Ocean View", "Jacuzzi", "Rose Setup", "Champagne"],
    price: 950,
    originalPrice: 1100,
    availability: "critical",
    availabilityText: "1 room left",
  },
];

// ==========================================
// 4. REVIEWS DATA (<GuestReviews />)
// ==========================================
export const reviews: ReviewData[] = [
  {
    id: 1,
    name: "Sarah M.",
    rating: 5.0,
    gradient: "from-zinc-900 to-zinc-700",
    initials: "SM",
    date: "Dec 2024",
    room: "Overwater Bungalow",
    review:
      "Absolutely breathtaking. The overwater bungalow exceeded every expectation. Waking up to the lagoon below the glass floor is surreal.",
    helpful: 24,
  },
  {
    id: 2,
    name: "James K.",
    rating: 4.8,
    gradient: "from-zinc-800 to-zinc-600",
    initials: "JK",
    date: "Nov 2024",
    room: "Premium Suite",
    review:
      "The staff anticipates your every need before you even realize it. The spa treatments and beach service were world-class.",
    helpful: 18,
  },
  {
    id: 3,
    name: "Priya L.",
    rating: 5.0,
    gradient: "from-zinc-950 to-zinc-800",
    initials: "PL",
    date: "Oct 2024",
    room: "Honeymoon Suite",
    review:
      "We stayed for our honeymoon and they surprised us with rose petals and champagne every evening. Truly magical and unforgettable.",
    helpful: 31,
  },
  {
    id: 4,
    name: "David R.",
    rating: 4.9,
    gradient: "from-zinc-700 to-zinc-500",
    initials: "DR",
    date: "Sep 2024",
    room: "Beach Pool Villa",
    review:
      "Best resort in the Maldives, no contest. The food at the overwater restaurant alone is worth the trip. Will return next year.",
    helpful: 12,
  },
];

// ==========================================
// 5. PARTNER TRUST LOGOS (<PartnerLogos />)
// ==========================================
export const partnerLogos: PartnerLogoData[] = [
  { id: 1, brandName: "HelloSign", logoUrl: "/logos/hellosign.svg" },
  { id: 2, brandName: "DoorDash", logoUrl: "/logos/doordash.svg" },
  { id: 3, brandName: "Coinbase", logoUrl: "/logos/coinbase.svg" },
  { id: 4, brandName: "Airtable", logoUrl: "/logos/airtable.svg" },
  { id: 5, brandName: "PandaDoc", logoUrl: "/logos/pandadoc.svg" },
  { id: 6, brandName: "Freshworks", logoUrl: "/logos/freshworks.svg" },
];