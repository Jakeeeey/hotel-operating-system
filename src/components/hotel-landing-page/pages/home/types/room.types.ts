export type RoomType = 'deluxe' | 'suite' | 'villa' | 'overwater'; 

export interface RoomData {
  id: number;
  name: string;
  description: string;
  type: RoomType;
  image: string;
  bed: string;
  sqm: string;
  maxAdults: number;
  maxChildren: number;
  rating: number;
  reviews: number;
  amenities: string[];
  price: number;
  originalPrice: number;
  badge: string;            
  availability: string; 
}