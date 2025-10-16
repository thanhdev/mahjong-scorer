
"use client";

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import { Game } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useEffect } from 'react';
import { format } from 'date-fns';
import { Switch } from '@/components/ui/switch';

const formSchema = z.object({
  name: z.string().min(1, 'Game name is required'),
  player1: z.string().min(1, 'Player 1 name is required'),
  player2: z.string().min(1, 'Player 2 name is required'),
  player3: z.string().min(1, 'Player 3 name is required'),
  player4: z.string().min(1, 'Player 4 name is required'),
  basePoints: z.coerce.number().int().min(1, 'Base points must be at least 1'),
  rotateWinds: z.boolean(),
}).refine(data => {
    const players = [data.player1, data.player2, data.player3, data.player4];
    const uniquePlayers = new Set(players.map(p => p.trim().toLowerCase()));
    return uniquePlayers.size === players.length;
}, {
    message: "Player names must be unique.",
    path: ["player1"], // Shows error under player1 field, but applies to all
});

const LOCAL_STORAGE_KEY = 'mahjong-scorer-games';

export default function NewGameForm() {
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: format(new Date(), 'yyyy-MM-dd HH:mm'),
      player1: '',
      player2: '',
      player3: '',
      player4: '',
      basePoints: 8,
      rotateWinds: true,
    },
  });

  useEffect(() => {
    try {
        const storedGames = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (storedGames) {
            const games: Game[] = JSON.parse(storedGames);
            if (games.length > 0) {
                const lastGame = games.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
                form.setValue('player1', lastGame.initialPlayerNames[0]);
                form.setValue('player2', lastGame.initialPlayerNames[1]);
                form.setValue('player3', lastGame.initialPlayerNames[2]);
                form.setValue('player4', lastGame.initialPlayerNames[3]);
                form.setValue('rotateWinds', lastGame.rotateWinds);
            }
        }
    } catch (error) {
        console.error("Failed to load last game's players", error);
    }
  }, [form]);

  const { errors } = form.formState;

  useEffect(() => {
    if (errors.player1 && errors.player1.message === "Player names must be unique.") {
        toast({
            title: "Invalid Player Names",
            description: "Each player must have a unique name.",
            variant: "destructive",
        })
    }
  }, [errors.player1, toast]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    try {
        const newGame: Game = {
            id: crypto.randomUUID(),
            name: values.name.trim(),
            initialPlayerNames: [values.player1.trim(), values.player2.trim(), values.player3.trim(), values.player4.trim()],
            basePoints: values.basePoints,
            rotateWinds: values.rotateWinds,
            events: [],
            createdAt: new Date().toISOString(),
        };

        const storedGames = localStorage.getItem(LOCAL_STORAGE_KEY);
        const games: Game[] = storedGames ? JSON.parse(storedGames) : [];
        games.push(newGame);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(games));

        router.push(`/game/${newGame.id}`);
    } catch (error) {
        console.error("Failed to create game", error);
        toast({
            title: "Error",
            description: "Could not create the game. Please try again.",
            variant: "destructive"
        })
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Game Name</FormLabel>
              <FormControl>
                <Input placeholder="Friday Night Mahjong" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="player1" render={({ field }) => (<FormItem><FormLabel>Player 1 (East)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="player2" render={({ field }) => (<FormItem><FormLabel>Player 2 (South)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="player3" render={({ field }) => (<FormItem><FormLabel>Player 3 (West)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="player4" render={({ field }) => (<FormItem><FormLabel>Player 4 (North)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
        </div>
        <div className="flex justify-between items-center gap-8">
            <FormField
            control={form.control}
            name="basePoints"
            render={({ field }) => (
                <FormItem className="flex-1">
                <FormLabel>Base Points</FormLabel>
                <FormControl>
                    <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="rotateWinds"
            render={({ field }) => (
                <FormItem className="flex flex-col items-start gap-2 pt-6">
                    <FormLabel>Rotate Winds Automatically</FormLabel>
                    <FormControl>
                        <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        />
                    </FormControl>
                </FormItem>
            )}
            />
        </div>
        <Button type="submit" className="w-full">Create Game</Button>
      </form>
    </Form>
  );
}
