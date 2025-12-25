
"use client";

import { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Game, GameEvent, PenaltyRound, Round, SeatChange } from '@/lib/types';
import { calculateScores, getWindsForRound, calculateRoundScoreDelta, getAllPlayerNames, getActivePlayersForRound } from '@/lib/mahjong';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { PlusCircle, Trash2, ArrowLeft, ShieldAlert, Replace, Download } from 'lucide-react';
import AddRoundForm from './add-round-form';
import AddPenaltyForm from './add-penalty-form';
import ChangeSeatForm from './change-seat-form';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import html2canvas from 'html2canvas';

const LOCAL_STORAGE_KEY = 'mahjong-scorer-games';

export default function GameView({ gameId }: { gameId: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAddRoundOpen, setAddRoundOpen] = useState(false);
  const [isAddPenaltyOpen, setAddPenaltyOpen] = useState(false);
  const [isChangeSeatOpen, setChangeSeatOpen] = useState(false);
  const [selectedWinner, setSelectedWinner] = useState<string | undefined>(undefined);
  const scoreTableRef = useRef<HTMLTableElement>(null);

  useEffect(() => {
    try {
      const storedGames = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedGames) {
        const games: Game[] = JSON.parse(storedGames);
        const currentGame = games.find(g => g.id === gameId);
        if (currentGame) {
          // Migration for old data structure
          if (currentGame.rounds && !currentGame.events) {
            currentGame.events = currentGame.rounds;
            delete currentGame.rounds;
          }
          if (!currentGame.initialPlayerNames && (currentGame as any).playerNames) {
            currentGame.initialPlayerNames = (currentGame as any).playerNames;
          }

          const migratedGame = {
              ...currentGame,
              rotateWinds: currentGame.rotateWinds ?? true,
              events: currentGame.events?.map(e => ({...e, type: (e as any).type || 'win'})) ?? []
          }
          setGame(migratedGame);
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

  const allPlayerNames = useMemo(() => game ? getAllPlayerNames(game) : [], [game]);
  const scores = useMemo(() => calculateScores(game), [game]);

  const { winds: currentWinds, activePlayers } = useMemo(() => {
    if (!game) return { winds: {}, activePlayers: [] };
    return getWindsForRound(game, game.events.length);
  }, [game]);

  const inactivePlayers = useMemo(() => {
    return allPlayerNames.filter(p => !activePlayers.includes(p));
  }, [allPlayerNames, activePlayers]);
  
  const scoreHistory = useMemo(() => {
    if (!game) return [];
    return game.events
        .filter(e => e.type === 'win' || e.type === 'penalty')
        .map((event, index) => {
            const roundNumber = game.events.indexOf(event);
            const activePlayersForRound = getActivePlayersForRound(game, roundNumber);
            return calculateRoundScoreDelta(event, activePlayersForRound, game.basePoints)
        });
  }, [game]);

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

  const handleAddEvent = (newEvent: GameEvent) => {
    if (!game) return;
    const updatedGame = { ...game, events: [...game.events, newEvent] };
    updateGameInStorage(updatedGame);
  };
  
  const handleAddRound = (newRoundData: Omit<Round, 'id' | 'type'>) => {
    const newRound: Round = { ...newRoundData, id: crypto.randomUUID(), type: 'win' };
    handleAddEvent(newRound);
    setAddRoundOpen(false);
    setSelectedWinner(undefined);
  };
  
  const handleAddPenalty = (newPenaltyData: Omit<PenaltyRound, 'id' | 'type'>) => {
    const newPenalty: PenaltyRound = { ...newPenaltyData, id: crypto.randomUUID(), type: 'penalty' };
    handleAddEvent(newPenalty);
    setAddPenaltyOpen(false);
  }

  const handleChangeSeat = (seatChangeData: Omit<SeatChange, 'id' | 'type'>) => {
    const newSeatChange: SeatChange = { ...seatChangeData, id: crypto.randomUUID(), type: 'seatChange' };
    handleAddEvent(newSeatChange);
    setChangeSeatOpen(false);
  }

  const handleDeleteEvent = (eventId: string) => {
    if (!game) return;
    const updatedGame = { ...game, events: game.events.filter(e => e.id !== eventId) };
    updateGameInStorage(updatedGame);
  };

  const handlePlayerCardClick = (playerName: string) => {
    if(activePlayers.includes(playerName)) {
        setSelectedWinner(playerName);
        setAddRoundOpen(true);
    } else {
        toast({ title: "Inactive Player", description: "This player is not currently in the game.", variant: "destructive" });
    }
  }

  const handleDialogClose = (setter: React.Dispatch<React.SetStateAction<boolean>>, open: boolean) => {
    setter(open);
    if(!open && isAddRoundOpen) {
        setSelectedWinner(undefined);
    }
  }

  const handleExport = () => {
    if (scoreTableRef.current) {
        toast({ title: 'Exporting...', description: 'Please wait while the image is being generated.' });
        html2canvas(scoreTableRef.current, {
            useCORS: true,
            backgroundColor: '#ffffff', // Use white background
        }).then(canvas => {
            const link = document.createElement('a');
            link.download = `mahjong-scores-${game?.name.replace(/ /g, '_') ?? gameId}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
            toast({ title: 'Export Successful!', description: 'Your score history image has been downloaded.' });
        }).catch(err => {
            console.error('oops, something went wrong!', err);
            toast({ variant: 'destructive', title: 'Export Failed', description: 'Could not generate the image.' });
        });
    }
  };
  
  if (loading || !game) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-10 w-1/4" />
        <Card><CardHeader><Skeleton className="h-8 w-1/2" /></CardHeader><CardContent><Skeleton className="h-40 w-full" /></CardContent></Card>
        <Card><CardHeader><Skeleton className="h-8 w-1/2" /></CardHeader><CardContent><Skeleton className="h-60 w-full" /></CardContent></Card>
      </div>
    );
  }

  const playerPositions: { [key: number]: string } = {
    0: 'md:col-start-3 md:row-start-2', // East seat
    1: 'md:col-start-2 md:row-start-3', // South seat
    2: 'md:col-start-1 md:row-start-2', // West seat
    3: 'md:col-start-2 md:row-start-1', // North seat
  };

  return (
    <div className="space-y-8 animate-in fade-in-50">
      <div>
        <Button variant="ghost" asChild className="mb-4 -ml-4">
          <Link href="/"><ArrowLeft className="mr-2 h-4 w-4" />Back to Games</Link>
        </Button>
        <div className="flex flex-col md:flex-row justify-between md:items-start gap-4">
            <div className="flex-1">
                <h1 className="text-3xl font-bold font-headline">{game.name}</h1>
                <p className="text-muted-foreground text-sm">Base: {game.basePoints} / Keep East on Win: {game.rotateWinds ? 'On' : 'Off'}</p>
            </div>
            <div className='flex gap-2 flex-wrap'>
                <Dialog open={isChangeSeatOpen} onOpenChange={(open) => handleDialogClose(setChangeSeatOpen, open)}>
                    <DialogTrigger asChild><Button variant="outline" size="sm"><Replace className="mr-2 h-4 w-4" />Change</Button></DialogTrigger>
                    <DialogContent>
                        <DialogHeader><DialogTitle>Change Player</DialogTitle><DialogDescription>Select player to leave and enter new player's name.</DialogDescription></DialogHeader>
                        <ChangeSeatForm game={game} activePlayers={activePlayers} inactivePlayers={inactivePlayers} onSubmit={handleChangeSeat} onCancel={() => setChangeSeatOpen(false)} />
                    </DialogContent>
                </Dialog>
                 <Dialog open={isAddPenaltyOpen} onOpenChange={(open) => handleDialogClose(setAddPenaltyOpen, open)}>
                    <DialogTrigger asChild><Button variant="outline" size="sm"><ShieldAlert className="mr-2 h-4 w-4" />Penalty</Button></DialogTrigger>
                    <DialogContent>
                        <DialogHeader><DialogTitle>Record Penalty</DialogTitle><DialogDescription>Select the player to be penalized.</DialogDescription></DialogHeader>
                        <AddPenaltyForm game={{...game, playerNames: activePlayers}} onSubmit={handleAddPenalty} onCancel={() => setAddPenaltyOpen(false)} />
                    </DialogContent>
                </Dialog>
                <Dialog open={isAddRoundOpen} onOpenChange={(open) => handleDialogClose(setAddRoundOpen, open)}>
                    <DialogTrigger asChild><Button size="sm"><PlusCircle className="mr-2 h-4 w-4" />Round</Button></DialogTrigger>
                    <DialogContent className="sm:max-w-[425px] grid-rows-[auto_minmax(0,1fr)_auto] p-0 max-h-[90dvh]">
                         <DialogHeader className="p-6 pb-0"><DialogTitle>Record New Round</DialogTitle><DialogDescription>Enter the details of the winning hand.</DialogDescription></DialogHeader>
                        <div className="overflow-y-auto px-6"><AddRoundForm game={{...game, playerNames: activePlayers}} onSubmit={handleAddRound} onCancel={() => handleDialogClose(setAddRoundOpen, false)} initialWinner={selectedWinner} /></div>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
      </div>

        <Card>
            <CardHeader><CardTitle>Player Scores</CardTitle></CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 md:grid-rows-3 gap-4 md:aspect-square max-w-lg mx-auto">
                    {activePlayers.map((name, index) => {
                       const originalSeatIndex = game.initialPlayerNames.indexOf(name);
                       const playerAtSeatIndex = (seatIndex: number): string => {
                           let player = game.initialPlayerNames[seatIndex];
                           game.events.forEach(event => {
                               if (event.type === 'seatChange' && event.seatIndex === seatIndex) {
                                   player = event.playerIn;
                               }
                           });
                           return player;
                       }

                       const playerName = activePlayers[index];
                       const score = scores[playerName] ?? 0;
                       const wind = currentWinds[playerName];

                       let seatIndex = -1;
                        if (game.initialPlayerNames.includes(playerName)) {
                            seatIndex = game.initialPlayerNames.indexOf(playerName);
                        } else {
                            const lastSeatChange = [...game.events].reverse().find(e => e.type === 'seatChange' && e.playerIn === playerName) as SeatChange | undefined;
                            if (lastSeatChange) {
                                seatIndex = lastSeatChange.seatIndex;
                            }
                        }

                        // Fallback for players who joined, left, and another player took their spot
                        if (seatIndex === -1 || activePlayers.indexOf(playerAtSeatIndex(seatIndex)) !== index) {
                            for(let i=0; i<4; i++){
                                let isOccupied = false;
                                for(const p of activePlayers){
                                    const pSeatIndex = game.initialPlayerNames.indexOf(p);
                                    if(pSeatIndex === i) {
                                        isOccupied = true;
                                        break;
                                    }
                                }
                                if(!isOccupied) seatIndex = i;
                            }
                        }

                        const finalSeatIndex = game.initialPlayerNames.findIndex((initialName, i) => {
                           let currentPlayerInSeat = initialName;
                           for (const event of game.events) {
                             if (event.type === 'seatChange' && event.seatIndex === i) {
                               currentPlayerInSeat = event.playerIn;
                             }
                           }
                           return currentPlayerInSeat === playerName;
                        });

                        const gridPosition = playerPositions[finalSeatIndex];

                        return (
                            <div key={name} className={cn('flex items-center justify-center', gridPosition)}>
                                <Card
                                    className="w-full h-28 flex flex-col justify-between p-3 text-center cursor-pointer hover:border-primary transition"
                                    onClick={() => handlePlayerCardClick(name)}
                                >
                                    <div className='font-semibold text-muted-foreground text-sm'>{wind}</div>
                                    <div className="font-bold text-lg truncate">{name}</div>
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


      <Tabs defaultValue="history">
        <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="history">Round History</TabsTrigger>
            <TabsTrigger value="scores">Score History</TabsTrigger>
        </TabsList>
        <TabsContent value="history">
            <Card>
            <CardContent className="pt-6">
              {game.events.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader><TableRow><TableHead>#</TableHead><TableHead>Type</TableHead><TableHead>Details</TableHead><TableHead>Points</TableHead><TableHead className="text-right">Action</TableHead></TableRow></TableHeader>
                    <TableBody>
                      {[...game.events].reverse().map((event, index) => (
                        <TableRow key={event.id}>
                            <TableCell>{game.events.length - index}</TableCell>
                            {event.type === 'win' && (
                                <>
                                    <TableCell><Badge variant="secondary">Win</Badge></TableCell>
                                    <TableCell><b>{event.winner}</b> won from {event.feeder || 'Self-draw'}</TableCell>
                                    <TableCell>{event.points}</TableCell>
                                </>
                            )}
                             {event.type === 'penalty' && (
                                <>
                                    <TableCell><Badge variant="destructive">Penalty</Badge></TableCell>
                                    <TableCell><b>{event.penalizedPlayer}</b> was penalized</TableCell>
                                    <TableCell>{event.points}</TableCell>
                                </>
                            )}
                            {event.type === 'seatChange' && (
                                <>
                                    <TableCell><Badge>Seat Change</Badge></TableCell>
                                    <TableCell colSpan={2}><b>{event.playerIn}</b> replaced <b>{event.playerOut}</b></TableCell>
                                </>
                            )}
                          <TableCell className="text-right">
                            <AlertDialog>
                              <AlertDialogTrigger asChild><Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-destructive" /></Button></AlertDialogTrigger>
                              <AlertDialogContent>
                                  <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This will delete the event and recalculate all scores. This action cannot be undone.</AlertDialogDescription></AlertDialogHeader>
                                  <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleDeleteEvent(event.id)}>Delete</AlertDialogAction></AlertDialogFooter>
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
        </TabsContent>
        <TabsContent value="scores">
            <Card>
                <CardHeader className="flex-row items-center justify-between">
                    <CardTitle>Score Progression</CardTitle>
                    <Button variant="outline" size="sm" onClick={handleExport} disabled={scoreHistory.length === 0}>
                        <Download className="mr-2 h-4 w-4" />
                        Export
                    </Button>
                </CardHeader>
                <CardContent className="pt-0">
                    {game.events.filter(e => e.type === 'win' || e.type === 'penalty').length > 0 ? (
                    <div className="overflow-x-auto">
                    <Table ref={scoreTableRef}>
                        <TableHeader>
                            <TableRow>
                                <TableHead>#</TableHead>
                                {allPlayerNames.map(name => <TableHead key={name} className="text-center">{name}</TableHead>)}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {scoreHistory.map((delta, index) => (
                                <TableRow key={game.events.filter(e => e.type === 'win' || e.type === 'penalty')[index].id}>
                                    <TableCell>{index + 1}</TableCell>
                                    {allPlayerNames.map(name => (
                                        <TableCell key={name} className={cn("text-center font-mono", delta[name] > 0 ? 'text-primary' : delta[name] < 0 ? 'text-destructive' : 'text-muted-foreground')}>
                                            {delta[name] ? (delta[name] > 0 ? `+${delta[name]}` : delta[name]) : '0'}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))}
                            <TableRow className="bg-muted/50 font-bold">
                                <TableCell>Total</TableCell>
                                {allPlayerNames.map(name => (
                                    <TableCell key={name} className={cn("text-center", (scores[name] ?? 0) > 0 ? 'text-primary' : (scores[name] ?? 0) < 0 ? 'text-destructive' : 'text-muted-foreground')}>
                                        {scores[name] ?? 0}
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableBody>
                    </Table>
                    </div>
                    ) : (
                        <p className="text-muted-foreground text-center py-4">No rounds to show scores for.</p>
                    )}
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
