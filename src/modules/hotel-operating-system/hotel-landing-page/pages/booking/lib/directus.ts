import { createDirectus, rest, staticToken } from "@directus/sdk";

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL!;
const token = process.env.DIRECTUS_STATIC_TOKEN;

const client = createDirectus(baseUrl).with(rest());

export const directus = token 
  ? client.with(staticToken(token)) 
  : client;