import { useState } from 'react';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { CreatorSearchSelect } from '@/components/memberspass/CreatorSearchSelect';
import type { Creator } from '@/services/creatorSearch';
import { inviteToActivity } from '@/services/activities';

export function InviteExperienceSheet({ open, onOpenChange, activityId }: { open: boolean; onOpenChange: (open: boolean) => void; activityId: number }) {
  const [selected, setSelected] = useState<Creator | null>(null);
  const [loading, setLoading] = useState(false);

  const onInvite = async () => {
    if (!selected) return;
    setLoading(true);
    try {
      await inviteToActivity({ activity_id: activityId, creator_id: selected.id });
      onOpenChange(false);
      setSelected(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <div className="space-y-4">
          <SheetTitle>Invite Creator</SheetTitle>
          <CreatorSearchSelect onSelect={setSelected} />
          <Button className="w-full" disabled={!selected || loading} onClick={onInvite}>
            {loading ? 'Inviting...' : selected ? `Invite ${selected.name}` : 'Select creator'}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
