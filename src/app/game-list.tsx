
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Game } from '@/lib/types';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';
import { getAllPlayerNames } from '@/lib/mahjong';

const LOCAL_STORAGE_KEY = 'mahjong-scorer-games';

export default function GameList() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

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

  const handleDeleteGame = (gameId: string) => {
    try {
        const updatedGames = games.filter(g => g.id !== gameId);
        setGames(updatedGames);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedGames));
        toast({ title: "Game Deleted", description: "The game has been removed."});
    } catch (error) {
        console.error("Failed to delete game", error);
        toast({ variant: "destructive", title: "Error", description: "Failed to delete the game." });
    }
  }

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
        <Card key={game.id} className="flex flex-col justify-between hover:shadow-lg hover:border-primary/50 transition-all duration-300">
            <Link href={`/game/${game.id}`} className="block h-full">
                <CardHeader>
                <CardTitle className="font-headline">{game.name}</CardTitle>
                <CardDescription>Created on {format(new Date(game.createdAt), 'PPP')}</CardDescription>
                </CardHeader>
                <CardContent>
                <div>
                    <p className="font-semibold text-sm mb-2 text-primary/90">Players:</p>
                    <p className="text-muted-foreground text-sm">{getAllPlayerNames(game).join(', ')}</p>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-4">
                    <div>
                        <p className="font-semibold text-sm mb-2 text-primary/90">Base Points:</p>
                        <p className="text-muted-foreground text-sm">{game.basePoints}</p>
                    </div>
                    <div>
                        <p className="font-semibold text-sm mb-2 text-primary/90">Rotate Winds:</p>
                        <p className="text-muted-foreground text-sm">{game.rotateWinds ? 'On' : 'Off'}</p>
                    </div>
                </div>
                </CardContent>
            </Link>
             <div className="p-4 pt-0 text-right">
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive/80">
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Delete Game?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Are you sure you want to delete the game "{game.name}"? This action cannot be undone.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteGame(game.id)}>Delete</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </Card>
      ))}
    </div>
  );
}
