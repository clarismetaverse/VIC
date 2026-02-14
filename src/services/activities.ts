import { xanoFetch } from './xano';

export interface Activity {
  id: number;
  title?: string;
  name?: string;
  description?: string;
  image?: string;
  date?: string;
  [key: string]: unknown;
}

export const getActivities = () => xanoFetch<Activity[]>('/activities');
export const getActivityDetail = (id: string | number) => xanoFetch<Activity>(`/activities/${id}`);
export const inviteToActivity = (payload: { activity_id: number; creator_id: number }) =>
  xanoFetch('/activities/invite', { method: 'POST', body: JSON.stringify(payload) });
