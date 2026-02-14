import { xanoFetch } from './xano';

export interface Creator {
  id: number;
  name: string;
  username?: string;
  avatar?: string;
  bio?: string;
}

export const searchCreators = (query: string) => xanoFetch<Creator[]>(`/creator_search?q=${encodeURIComponent(query)}`);
