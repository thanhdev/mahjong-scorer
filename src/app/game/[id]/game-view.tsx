"use client";

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Game, Round } from '@/lib/types';
import { calculateScores } from '@/lib/mahjong';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { PlusCircle, Trash2, ArrowLeft } from 'lucide-react';
import AddRoundForm from './add-round-form';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

const LOCAL_STORAGE_KEY = 'mahjong-scorer-games';

const WIND_LABELS = ['East', 'South', 'West', 'North'];

export default function GameView({ gameId }: { gameId: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAddRoundOpen, setAddRoundOpen] = useState(false);
  const [selectedWinner, setSelectedWinner] = useState<string | undefined>(undefined);

  useEffect(() => {
    try {
      const storedGames = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedGames) {
        const games: Game[] = JSON.parse(storedGames);
        const currentGame = games.find(g => g.id === gameId);
        if (currentGame) {
          setGame(currentGame);
        } else {
          router.replace('/'); 
        }
      } else {
        router.replace('/');
      }
    } catch (error) {
      console.error("Failed to load game", error);
      toast({ variant: "destructive", title: "Error", description: "Failed to load game data." });
      router.replace('/');
    } finally {
      setLoading(false);
    }
  }, [gameId, router, toast]);

  const scores = useMemo(() => calculateScores(game), [game]);

  const updateGameInStorage = (updatedGame: Game) => {
    try {
      setGame(updatedGame);
      const storedGames = localStorage.getItem(LOCAL_STORAGE_KEY);
      const games: Game[] = storedGames ? JSON.parse(storedGames) : [];
      const gameIndex = games.findIndex(g => g.id === updatedGame.id);
      if (gameIndex !== -1) {
        games[gameIndex] = updatedGame;
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(games));
      }
    } catch(error) {
       console.error("Failed to save game", error);
       toast({ variant: "destructive", title: "Error", description: "Failed to save game progress." });
    }
  };

  const handleAddRound = (newRound: Omit<Round, 'id'>) => {
    if (!game) return;
    const updatedGame = { ...game, rounds: [...game.rounds, { ...newRound, id: crypto.randomUUID() }] };
    updateGameInStorage(updatedGame);
    setAddRoundOpen(false);
    setSelectedWinner(undefined);
  };

  const handleDeleteRound = (roundId: string) => {
    if (!game) return;
    const updatedGame = { ...game, rounds: game.rounds.filter(r => r.id !== roundId) };
    updateGameInStorage(updatedGame);
  };

  const handlePlayerCardClick = (playerName: string) => {
    setSelectedWinner(playerName);
    setAddRoundOpen(true);
  }

  const handleDialogClose = () => {
    setAddRoundOpen(false);
    setSelectedWinner(undefined);
  }
  
  if (loading || !game) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-10 w-1/4" />
        <Card><CardHeader><Skeleton className="h-8 w-1/2" /></CardHeader><CardContent><Skeleton className="h-40 w-full" /></CardContent></Card>
        <Card><CardHeader><Skeleton className="h-8 w-1/2" /></CardHeader><CardContent><Skeleton className="h-60 w-full" /></CardContent></Card>
      </div>
    );
  }

  const [playerEast, playerSouth, playerWest, playerNorth] = game.playerNames;

  return (
    <div className="space-y-8 animate-in fade-in-50">
      <div>
        <Button variant="ghost" asChild className="mb-4 -ml-4">
          <Link href="/"><ArrowLeft className="mr-2 h-4 w-4" />Back to Games</Link>
        </Button>
        <div className="flex justify-between items-start">
            <div>
                <h1 className="text-3xl font-bold font-headline">{game.name}</h1>
                <p className="text-muted-foreground">Base Points: {game.basePoints}</p>
            </div>
             <Dialog open={isAddRoundOpen} onOpenChange={handleDialogClose}>
                <DialogTrigger asChild>
                    <Button><PlusCircle className="mr-2 h-4 w-4" />Record Round</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader><DialogTitle>Record New Round</DialogTitle><DialogDescription>Enter the details of the winning hand.</DialogDescription></DialogHeader>
                    <AddRoundForm game={game} onSubmit={handleAddRound} onCancel={handleDialogClose} initialWinner={selectedWinner} />
                </DialogContent>
            </Dialog>
        </div>
      </div>

        <Card>
            <CardHeader><CardTitle>Player Scores</CardTitle></CardHeader>
            <CardContent>
                <div className="grid grid-cols-3 grid-rows-3 gap-4 aspect-square max-w-lg mx-auto">
                    {[playerWest, playerNorth, playerEast, playerSouth].map((name, index) => {
                        const score = scores[name];
                        const wind = [WIND_LABELS[2], WIND_LABELS[3], WIND_LABELS[0], WIND_LABELS[1]][index];
                        const gridPosition = [
                            'col-start-1 row-start-2', // West
                            'col-start-2 row-start-3', // North (bottom)
                            'col-start-3 row-start-2', // East
                            'col-start-2 row-start-1', // South (top)
                        ][index];

                        return (
                            <div key={name} className={cn('flex items-center justify-center', gridPosition)}>
                                <Card
                                    className="w-40 h-28 flex flex-col justify-between p-3 text-center cursor-pointer hover:border-primary transition"
                                    onClick={() => handlePlayerCardClick(name)}
                                >
                                    <div className='font-semibold text-muted-foreground text-sm'>{wind}</div>
                                    <div className="font-bold text-lg">{name}</div>
                                    <div className={cn("text-2xl font-bold", score > 0 ? 'text-primary' : score < 0 ? 'text-destructive' : 'text-muted-foreground')}>
                                        {score}
                                    </div>
                                </Card>
                            </div>
                        )
                    })}
                </div>
            </CardContent>
        </Card>


      <Card>
        <CardHeader><CardTitle>Round History</CardTitle></CardHeader>
        <CardContent>
          {game.rounds.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader><TableRow><TableHead>#</TableHead><TableHead>Winner</TableHead><TableHead>Feeder</TableHead><TableHead>Points</TableHead><TableHead className="text-right">Action</TableHead></TableRow></TableHeader>
                <TableBody>
                  {[...game.rounds].reverse().map((round, index) => (
                    <TableRow key={round.id}>
                      <TableCell>{game.rounds.length - index}</TableCell>
                      <TableCell>{round.winner}</TableCell>
                      <TableCell>{round.feeder || 'Self-draw'}</TableCell>
                      <TableCell>{round.points}</TableCell>
                      <TableCell className="text-right">
                        <AlertDialog>
                          <AlertDialogTrigger asChild><Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-destructive" /></Button></AlertDialogTrigger>
                          <AlertDialogContent>
                              <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This will delete the round record and recalculate all scores. This action cannot be undone.</AlertDialogDescription></AlertDialogHeader>
                              <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleDeleteRound(round.id)}>Delete</AlertDialogAction></AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (<p className="text-muted-foreground text-center py-4">No rounds recorded yet.</p>)}
        </CardContent>
      </Card>
    </div>
  );
}
