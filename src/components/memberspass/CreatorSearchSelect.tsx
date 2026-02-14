import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { searchCreators, type Creator } from '@/services/creatorSearch';

export function CreatorSearchSelect({ onSelect }: { onSelect: (creator: Creator) => void }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Creator[]>([]);

  useEffect(() => {
    const t = setTimeout(async () => {
      if (!query) return setResults([]);
      try {
        setResults(await searchCreators(query));
      } catch {
        setResults([]);
      }
    }, 350);
    return () => clearTimeout(t);
  }, [query]);

  return (
    <div className="space-y-3">
      <Input placeholder="Search creator" value={query} onChange={(e) => setQuery(e.target.value)} />
      <div className="space-y-2">
        {results.map((creator) => (
          <button key={creator.id} className="w-full rounded-md border p-2 text-left hover:bg-accent" onClick={() => onSelect(creator)}>
            {creator.name}
          </button>
        ))}
      </div>
    </div>
  );
}
