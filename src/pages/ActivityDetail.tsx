import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { getActivityDetail } from '@/services/activities';
import { InviteExperienceSheet } from '@/components/vic/InviteExperienceSheet';

export default function ActivityDetail() {
  const { id = '' } = useParams();
  const [inviteOpen, setInviteOpen] = useState(false);
  const { data } = useQuery({ queryKey: ['activity', id], queryFn: () => getActivityDetail(id) });

  if (!data) return <div className="p-4">Loading...</div>;

  return (
    <div className="space-y-4 p-4 pb-24">
      <h1 className="text-2xl font-bold">{data.title || data.name}</h1>
      <p className="text-muted-foreground">{data.description}</p>
      <Button onClick={() => setInviteOpen(true)}>Invite creator</Button>
      <InviteExperienceSheet open={inviteOpen} onOpenChange={setInviteOpen} activityId={Number(id)} />
    </div>
  );
}
