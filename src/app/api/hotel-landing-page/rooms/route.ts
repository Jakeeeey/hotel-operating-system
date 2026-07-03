import { NextResponse } from 'next/server';
import { getRoomsService } from '@/modules/hotel-operating-system/hotel-landing-page/pages/home/services/room.service';
/**
 * GET handler for fetching rooms
 * Proxies request to Directus via the Service layer
 */
export async function GET() {
  try {
    const rooms = await getRoomsService();

    return NextResponse.json(rooms, { 
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30'
      }
    });
  } catch (error) {
    console.error("[API_ROOMS_ERROR]:", error);

    return NextResponse.json(
      { error: "Failed to load rooms from the server" }, 
      { status: 500 }
    );
  }
}