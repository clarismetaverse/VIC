import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { Creator } from '@/services/creatorSearch';

export function CreatorProfileSheet({ creator, open, onOpenChange }: { creator: Creator | null; open: boolean; onOpenChange: (open: boolean) => void }) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        {creator && (
          <div className="space-y-4">
            <SheetTitle>{creator.name}</SheetTitle>
            <Avatar className="h-16 w-16">
              <AvatarImage src={creator.avatar} />
              <AvatarFallback>{creator.name.slice(0, 1)}</AvatarFallback>
            </Avatar>
            <p className="text-sm text-muted-foreground">{creator.bio || 'No bio available.'}</p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
