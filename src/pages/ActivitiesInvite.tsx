import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { getActivities } from '@/services/activities';

export default function ActivitiesInvite() {
  const { data = [] } = useQuery({ queryKey: ['activities-invite'], queryFn: getActivities });

  return (
    <div className="space-y-4 p-4 pb-24">
      <h1 className="text-2xl font-bold">Invite to activity</h1>
      <div className="space-y-2">
        {data.map((activity) => (
          <Link key={activity.id} className="block rounded-md border p-3 hover:bg-accent" to={`/activities/${activity.id}`}>
            {activity.title || activity.name || `Activity #${activity.id}`}
          </Link>
        ))}
      </div>
    </div>
  );
}
