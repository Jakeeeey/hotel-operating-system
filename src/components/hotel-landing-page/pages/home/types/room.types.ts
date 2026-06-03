export type RoomType = 'deluxe' | 'suite' | 'villa' | 'overwater'; 

export interface RoomData {
  id: number;
  name: string;
  description?: string;
  type: RoomType;
  image: string;
  bed: string;
  sqm: string;
  maxAdults?: number;
  maxChildren?: number;
  rating: number;
  reviews: number;
  amenities: string[];
  price: number;
  originalPrice: number | null;
  badge: string;            
  availability: string; 
  availabilityText?: string; 
}