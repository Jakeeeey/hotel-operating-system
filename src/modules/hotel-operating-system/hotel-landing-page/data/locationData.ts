import { LocationGuideItem, TransitRoute } from "../types/types";

export const localGuides: LocationGuideItem[] = [
  {
    id: "old-town-citadel",
    title: "The Heritage Citadel",
    distance: "12 mins away",
    type: "landmark",
    description: "A beautifully preserved 16th-century architectural marvel. Wander through hand-paved cobblestone alleyways, artisan boutiques, and historical stone fortifications that frame our local coast.",
    image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1200"
  },
  {
    id: "clifftop-cove",
    title: "Black Sand Sanctuary",
    distance: "8 mins away",
    type: "nature",
    description: "An exclusive volcanic beach enclave bounded by dramatic, vertical obsidian cliffs. Highly recommended for early morning coastal introspection or secluded tidal explorations.",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200"
  },
  {
    id: "epicurean-quarter",
    title: "The Coastal Pier Market",
    distance: "15 mins away",
    type: "culinary",
    description: "The epicurean heart of the region. Features award-winning open-air culinary installations showcasing morning-catch marine profiles paired exclusively with local micro-vintages.",
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=1200"
  }
];

export const transitRoutes: TransitRoute[] = [
  {
    method: "International Airport (LHR / Terminal 5)",
    duration: "45 mins via Private Chauffeur",
    instructions: "Complimentary direct resort fleet transfers can be scheduled 24 hours prior to inbound arrival vectors."
  },
  {
    method: "Central Rail Terminal Interchange",
    duration: "20 mins via Coastline Express",
    instructions: "Direct high-speed connections route directly through the base of the sanctuary cliffside hourly."
  },
  {
    method: "Helipad Flight Deck Alpha",
    duration: "On-Site Arrival",
    instructions: "Private coordinates are dispatched immediately upon luxury penthouse or premium villa checkout validation."
  }
];