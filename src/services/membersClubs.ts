import { xanoFetch } from "@/services/xanoClient";

export type ClubCity = "Bali" | "Dubai" | "Milan";

export type MembersClub = {
  id: string;
  name: string;
  city: ClubCity;
  points: number;
  description?: string;
};

const MOCK_MEMBERS_CLUBS: MembersClub[] = [
  { id: "bali-soho-house", name: "Soho House", city: "Bali", points: 80, description: "Creative members collective" },
  { id: "bali-arts-club", name: "Arts Club", city: "Bali", points: 70, description: "Art patrons and tastemakers" },
  { id: "bali-annabels", name: "Annabel's", city: "Bali", points: 90, description: "Legacy social club" },
  { id: "bali-bulgari-yacht", name: "Bulgari Yacht Club", city: "Bali", points: 60, description: "Seafront and yachting circle" },
  { id: "bali-mandala", name: "Mandala Society", city: "Bali", points: 40, description: "Community-focused private members club" },
  { id: "bali-savana-circle", name: "Savana Circle", city: "Bali", points: 55, description: "Hospitality and music insiders" },
  { id: "bali-temple-house", name: "Temple House Collective", city: "Bali", points: 50, description: "Culture-led founders network" },
  { id: "bali-azure-reserve", name: "Azure Reserve", city: "Bali", points: 65, description: "Luxury beach lifestyle members" },
  { id: "dubai-soho-house", name: "Soho House", city: "Dubai", points: 80, description: "Creative members collective" },
  { id: "dubai-arts-club", name: "Arts Club", city: "Dubai", points: 70, description: "Art patrons and tastemakers" },
  { id: "dubai-annabels", name: "Annabel's", city: "Dubai", points: 90, description: "Legacy social club" },
  { id: "dubai-bulgari-yacht", name: "Bulgari Yacht Club", city: "Dubai", points: 60, description: "Seafront and yachting circle" },
  { id: "dubai-mandala", name: "Mandala Society", city: "Dubai", points: 40, description: "Community-focused private members club" },
  { id: "dubai-desert-collective", name: "Desert Collective", city: "Dubai", points: 75, description: "Private business and lifestyle club" },
  { id: "dubai-mirage-room", name: "Mirage Room", city: "Dubai", points: 50, description: "Nightlife and entertainment members room" },
  { id: "dubai-opal-assembly", name: "Opal Assembly", city: "Dubai", points: 55, description: "Luxury networking hub" },
  { id: "milan-soho-house", name: "Soho House", city: "Milan", points: 80, description: "Creative members collective" },
  { id: "milan-arts-club", name: "Arts Club", city: "Milan", points: 70, description: "Art patrons and tastemakers" },
  { id: "milan-annabels", name: "Annabel's", city: "Milan", points: 90, description: "Legacy social club" },
  { id: "milan-bulgari-yacht", name: "Bulgari Yacht Club", city: "Milan", points: 60, description: "Seafront and yachting circle" },
  { id: "milan-mandala", name: "Mandala Society", city: "Milan", points: 40, description: "Community-focused private members club" },
  { id: "milan-brera-circle", name: "Brera Circle", city: "Milan", points: 65, description: "Design and fashion private circle" },
  { id: "milan-duomo-house", name: "Duomo House", city: "Milan", points: 50, description: "Heritage social destination" },
  { id: "milan-campari-club", name: "Campari Club", city: "Milan", points: 45, description: "Cocktail and dining members club" },
];

const REMOTE_MEMBERS_CLUBS_ENDPOINT = "";

export async function searchMembersClubs(params: { q: string; city: string }): Promise<MembersClub[]> {
  const city = params.city as ClubCity;
  const query = params.q.trim().toLowerCase();

  if (REMOTE_MEMBERS_CLUBS_ENDPOINT) {
    return xanoFetch<MembersClub[]>(REMOTE_MEMBERS_CLUBS_ENDPOINT, {
      method: "POST",
      body: {
        q: params.q,
        city: params.city,
      },
    });
  }

  return MOCK_MEMBERS_CLUBS.filter((club) => {
    const matchesCity = club.city === city;
    if (!matchesCity) {
      return false;
    }

    if (!query) {
      return true;
    }

    return `${club.name} ${club.description ?? ""}`.toLowerCase().includes(query);
  });
}
