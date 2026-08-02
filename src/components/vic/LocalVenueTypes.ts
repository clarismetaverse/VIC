export type VenueSuggestion = {
  id: string;
  name: string;
  address?: string;
  city?: string;
  coverUrl?: string;
  about?: string;
  isNew?: boolean;
};

export type TransportOption = "Yes" | "Uber" | "Private Ferry" | "Private Driver" | "Flight tickets";

export const TRANSPORT_OPTIONS: TransportOption[] = [
  "Yes",
  "Uber",
  "Private Ferry",
  "Private Driver",
  "Flight tickets",
];

export type CreateLocationInput = {
  name: string;
  address: string;
  city: string;
  about?: string;
  eventDateTime?: string; // ISO datetime-local value
  coverUrl?: string;
  coverFile?: File;
  activityName?: string;
  maxGirls?: number;
  transport?: TransportOption;
  invitedUserIds?: number[];
};
