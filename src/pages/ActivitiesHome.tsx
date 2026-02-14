import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { getActivities } from '@/services/activities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ActivitiesHome() {
  const { data = [] } = useQuery({ queryKey: ['activities'], queryFn: getActivities });

  return (
    <div className="space-y-4 p-4 pb-24">
      <h1 className="text-2xl font-bold">Activities</h1>
      {data.map((activity) => (
        <Link key={activity.id} to={`/activities/${activity.id}`}>
          <Card className="mb-3 hover:bg-accent">
            <CardHeader><CardTitle>{activity.title || activity.name || `Activity #${activity.id}`}</CardTitle></CardHeader>
            <CardContent><p className="text-sm text-muted-foreground line-clamp-2">{activity.description || 'No description'}</p></CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
