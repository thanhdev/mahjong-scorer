"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Game } from '@/lib/types';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

const LOCAL_STORAGE_KEY = 'mahjong-scorer-games';

export default function GameList() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const storedGames = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedGames) {
        setGames(JSON.parse(storedGames));
      }
    } catch (error) {
      console.error("Failed to load games from local storage", error);
    } finally {
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-2/3" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (games.length === 0) {
    return (
      <div className="text-center py-10 border-2 border-dashed rounded-lg bg-card mt-8">
        <h2 className="text-xl font-semibold font-headline">No Games Found</h2>
        <p className="text-muted-foreground mt-2">Get started by creating a new game.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {games.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map(game => (
        <Link href={`/game/${game.id}`} key={game.id} className="block">
          <Card className="hover:shadow-lg hover:border-primary/50 transition-all duration-300 h-full">
            <CardHeader>
              <CardTitle className="font-headline">{game.name}</CardTitle>
              <CardDescription>Created on {format(new Date(game.createdAt), 'PPP')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div>
                <p className="font-semibold text-sm mb-2 text-primary/90">Players:</p>
                <p className="text-muted-foreground text-sm">{game.playerNames.join(', ')}</p>
              </div>
              <div className="mt-4">
                <p className="font-semibold text-sm mb-2 text-primary/90">Base Points:</p>
                <p className="text-muted-foreground text-sm">{game.basePoints}</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
