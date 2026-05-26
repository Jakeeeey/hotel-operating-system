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

export type DiscountType = "percentage" | "fixed_amount";

export interface OfferCampaignData {
  id: string;
  code: string;
  title: string;
  subtitle: string;
  badge: string;
  
  discountValue: number; 
  discountType: DiscountType;
  discountSubtext: string;
  
  description: string;
  
  validFrom: string;
  validUntil: string;
  expirationDate: string;
  
  inclusions: string[];
  terms: string[];
  bannerImage: string;
}

export type AmenityCategory = "wellness" | "culinary" | "leisure" | "services";

export interface AmenityData {
  id: string;
  title: string;
  subtitle: string;
  category: AmenityCategory;
  tagline: string;
  description: string;
  hoursOfOperation: string;
  locationDetails: string;
  thumbnailImage: string;
  heroImage: string;
  highlights: string[];
  guidelines: string[];
}

export interface LocationGuideItem {
  id: string;
  title: string;
  distance: string;
  type: "landmark" | "nature" | "transit" | "culinary";
  description: string;
  image: string;
}

export interface TransitRoute {
  method: string;
  duration: string;
  instructions: string;
}