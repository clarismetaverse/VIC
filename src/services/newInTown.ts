import { xanoFetch } from './xano';
import type { Creator } from './creatorSearch';

export const getNewInTown = () => xanoFetch<Creator[]>('/new_in_town');
