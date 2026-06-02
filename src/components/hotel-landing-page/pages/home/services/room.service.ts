import { readItems } from "@directus/sdk";
import { RoomData, RoomType } from "../types/room.types";
import { directus } from "../../booking/lib/directus";

export const getRoomsService = async (): Promise<RoomData[]> => {
  try {
    const data = await directus.request(readItems("room_types_hos"));

    return data.map((r: any): RoomData => ({
      id: r.id,
      name: r.name,
      description: r.description || "",
      type: (r.type?.toLowerCase() ?? "deluxe") as RoomType,
      image: r.main_image_url
        ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/assets/${r.main_image_url}`
        : "",
      bed: r.bed || "N/A",
      sqm: r.sqm || "N/A",
      maxAdults: r.max_adults || 2,
      maxChildren: r.max_children || 0,
      rating: parseFloat(r.rating ?? "0") || 5.0,
      reviews: r.review_count || 0,
      amenities: r.amenities || [],
      price: parseFloat(r.price),
      originalPrice: parseFloat(r.original_price),
      badge: r.badge || "N/A",
      availability: r.availability || "N/A",
    }));
  } catch (error) {
    console.error("Service Fetch Error:", error);
    return [];
  }
};

export async function getRoomByIdService(id: number): Promise<RoomData | null> {
  const rooms = await getRoomsService();
  return rooms.find((r) => r.id === id) || null;
}