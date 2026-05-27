import { NextResponse } from 'next/server';
import { getRoomsService } from '@/components/hotel-landing-page/pages/home/services/room.service';
/**
 * GET handler for fetching rooms
 * Proxies request to Directus via the Service layer
 */
export async function GET() {
  try {
    // Call the service that talks to Directus and handles mapping
    const rooms = await getRoomsService();

    // Return the successfully mapped data
    return NextResponse.json(rooms, { 
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30'
      }
    });
  } catch (error) {
    // Log the actual error internally for debugging
    console.error("[API_ROOMS_ERROR]:", error);

    // Return a clean error message to the client
    return NextResponse.json(
      { error: "Failed to load rooms from the server" }, 
      { status: 500 }
    );
  }
}