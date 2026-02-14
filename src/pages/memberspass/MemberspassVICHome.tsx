import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { CreatorCard } from '@/components/memberspass/CreatorCard';
import { CreatorProfileSheet } from '@/components/memberspass/CreatorProfileSheet';
import { getNewInTown } from '@/services/newInTown';
import { useState } from 'react';
import type { Creator } from '@/services/creatorSearch';

export default function MemberspassVICHome() {
  const { data = [] } = useQuery({ queryKey: ['new-in-town'], queryFn: getNewInTown });
  const [selected, setSelected] = useState<Creator | null>(null);

  return (
    <div className="space-y-4 p-4 pb-24">
      <Helmet><title>VIC Home</title></Helmet>
      <h1 className="text-2xl font-bold">Very Important Creator</h1>
      <p className="text-sm text-muted-foreground">Discover creators and invite them to experiences.</p>
      <div className="space-y-3">
        {data.map((creator, idx) => (
          <motion.div key={creator.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.04 }}>
            <CreatorCard creator={creator} onClick={() => setSelected(creator)} />
          </motion.div>
        ))}
      </div>
      <CreatorProfileSheet creator={selected} open={!!selected} onOpenChange={(o) => !o && setSelected(null)} />
    </div>
  );
}
