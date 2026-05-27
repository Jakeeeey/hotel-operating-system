import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

type Params = Promise<{ id: string }>;

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const ROOMS_FOLDER_NAME = "rooms";

/**
 * GET: Fetch a room image from Directus.
 * Resolves the "rooms" folder, finds the file by UUID or filename, then serves it.
 */
export async function GET(_req: NextRequest, { params }: { params: Params }) {
  const { id: imageId } = await params;
  const DIRECTUS_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
  const DIRECTUS_TOKEN = process.env.DIRECTUS_STATIC_TOKEN;

  if (!DIRECTUS_URL || !DIRECTUS_TOKEN) {
    return NextResponse.json({ error: "Directus configuration is missing" }, { status: 500 });
  }

  const authHeaders = { Authorization: `Bearer ${DIRECTUS_TOKEN}` };

  try {
    console.log(`[IMAGE_ROUTE] Fetching image for ID: ${imageId}`);
    // 1. Resolve "rooms" folder ID
    const folderRes = await fetch(
      `${DIRECTUS_URL}/folders?filter[name][_eq]=${ROOMS_FOLDER_NAME}&fields=id`,
      { headers: authHeaders },
    );
    const folderData = (await folderRes.json()) as { data?: { id: string }[], errors?: any };
    console.log(`[IMAGE_ROUTE] Folder lookup response:`, folderData);
    const folderId = folderData.data?.[0]?.id;

    if (!folderId) {
      console.error(`[IMAGE_ROUTE] Folder "${ROOMS_FOLDER_NAME}" not found.`);
      return NextResponse.json({ error: `Folder "${ROOMS_FOLDER_NAME}" not found in Directus` }, { status: 404 });
    }

    // 2. Find the file — by UUID directly or by filename within the rooms folder
    let fileUUID: string | undefined;

    if (UUID_REGEX.test(imageId)) {
      fileUUID = imageId;
    } else {
      const fileSearchRes = await fetch(
        `${DIRECTUS_URL}/files?filter[folder][_eq]=${folderId}&filter[filename_download][_eq]=${encodeURIComponent(imageId)}&fields=id&limit=1`,
        { headers: authHeaders },
      );
      const fileSearchData = (await fileSearchRes.json()) as { data?: { id: string }[], errors?: any };
      console.log(`[IMAGE_ROUTE] File search response:`, fileSearchData);
      fileUUID = fileSearchData.data?.[0]?.id;
    }

    if (!fileUUID) {
      console.error(`[IMAGE_ROUTE] File UUID not found for ${imageId}`);
      return NextResponse.json({ error: `Image "${imageId}" not found in rooms folder` }, { status: 404 });
    }

    console.log(`[IMAGE_ROUTE] Resolved file UUID: ${fileUUID}`);
    
    // 3. Fetch the actual asset binary
    const assetUrl = `${DIRECTUS_URL}/assets/${fileUUID}?access_token=${DIRECTUS_TOKEN}`;
    console.log(`[IMAGE_ROUTE] Fetching asset from: ${assetUrl.replace(DIRECTUS_TOKEN, '***')}`);
    const assetRes = await fetch(assetUrl);

    if (!assetRes.ok) {
      console.error(`[IMAGE_ROUTE] Asset fetch failed with status: ${assetRes.status}`);
      const errText = await assetRes.text();
      console.error(`[IMAGE_ROUTE] Asset fetch error body:`, errText);
      return NextResponse.json(
        { error: `Failed to fetch asset: ${assetRes.status}`, details: errText },
        { status: assetRes.status },
      );
    }

    const contentType = assetRes.headers.get("content-type") || "image/jpeg";
    const buffer = Buffer.from(await assetRes.arrayBuffer());

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
      },
    });
  } catch (error) {
    console.error("[IMAGE_PROXY_ERROR]:", error);
    return NextResponse.json({ error: "Failed to proxy image" }, { status: 500 });
  }
}

/**
 * PATCH: Update a room's main_image_url in Directus
 */
export async function PATCH(req: NextRequest, { params }: { params: Params }) {
  const { id } = await params;
  const DIRECTUS_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
  const DIRECTUS_TOKEN = process.env.DIRECTUS_STATIC_TOKEN;

  const { main_image_url } = (await req.json()) as { main_image_url: string };

  const response = await fetch(`${DIRECTUS_URL}/items/room_types_hos/${id}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${DIRECTUS_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ main_image_url }),
  });

  const result: unknown = await response.json();
  return NextResponse.json(result, { status: response.status });
}