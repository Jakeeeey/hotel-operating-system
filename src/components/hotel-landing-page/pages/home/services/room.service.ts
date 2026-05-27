import { RoomData, RoomType } from "../types/room.types";

interface DirectusRoom {
  id: number;
  name: string;
  description?: string;
  type?: string;
  main_image_url?: string;
  bed?: string;
  sqm?: string;
  rating?: string;
  review_count?: number;
  amenities?: string[];
  price: string;
  original_price: string;
  badge?: string;
  availability?: string;
}

export const getRoomsService = async (): Promise<RoomData[]> => {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  if (!baseUrl) {
    console.error("NEXT_PUBLIC_API_BASE_URL is not defined in .env.local");
    return [];
  }

  const staticToken = process.env.DIRECTUS_STATIC_TOKEN;

  try {
    const res = await fetch(`${baseUrl}/items/room_types_hos`, {
      headers: {
        ...(staticToken ? { Authorization: `Bearer ${staticToken}` } : {}),
      },
    });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

    const { data } = (await res.json()) as { data: DirectusRoom[] };

    return data.map((r): RoomData => ({
      id: r.id,
      name: r.name,
      description: r.description || "",
      type: (r.type?.toLowerCase() ?? "deluxe") as RoomType,
      image: r.main_image_url
        ? `/api/hotel-landing-page/rooms/${r.main_image_url}/image`
        : "",
      bed: r.bed || "N/A",
      sqm: r.sqm || "N/A",
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