// services/room.repo.ts
const DIRECTUS_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function fetchRoomsFromDirectus() {
  // Directus automatically serves collections at /items/[collection_name]
  const response = await fetch(`${DIRECTUS_URL}/items/room_types_hos`, {
    next: { revalidate: 60 } // Cache for 60 seconds
  });
  
  if (!response.ok) throw new Error("Failed to fetch from Directus");
  
  const { data } = await response.json();
  return data;
}