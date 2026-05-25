export type RoomType = "all" | "deluxe" | "suite" | "villa" | "overwater"

export interface RoomData {
  id: number
  type: RoomType
  name: string
  badge: string
  image: string
  bed: string
  sqm: string
  rating: number
  reviews: number
  amenities: string[]
  price: number
  originalPrice: number | null
  availability: "available" | "low" | "critical"
  availabilityText: string
}

export interface ReviewData {
  id: number
  name: string
  rating: number
  gradient: string
  initials: string
  date: string
  room: string
  review: string
  helpful: number
}

export interface PromoOfferData {
  id: number;
  discountPercentage: number;
  title: string;
  subtitle: string;
  backgroundImage: string;
  badgeText: string;
  ctaText: string;
}

export interface OverviewStatData {
  id: number;
  label: string;
  value: string;
  iconName: string;
  description: string;
}

export interface PartnerLogoData {
  id: number;
  brandName: string;
  logoUrl: string;
}