import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import type { Creator } from '@/services/creatorSearch';

export function CreatorCard({ creator, onClick }: { creator: Creator; onClick?: () => void }) {
  return (
    <Card className="cursor-pointer hover:bg-accent" onClick={onClick}>
      <CardContent className="flex items-center gap-3 p-4">
        <Avatar>
          <AvatarImage src={creator.avatar} />
          <AvatarFallback>{creator.name.slice(0, 1)}</AvatarFallback>
        </Avatar>
        <div>
          <p className="font-semibold">{creator.name}</p>
          {creator.username && <p className="text-sm text-muted-foreground">@{creator.username}</p>}
        </div>
      </CardContent>
    </Card>
  );
}
