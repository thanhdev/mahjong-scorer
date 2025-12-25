
"use client";

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Game, Round } from '@/lib/types';
import { useEffect, useMemo } from 'react';
import PlayerSelect from './player-select';
import Numpad from './numpad';

type GameWithPlayerNames = Omit<Game, 'initialPlayerNames'> & { playerNames: string[] };

const formSchema = z.object({
  winner: z.string().min(1, 'Winner is required.'),
  feeder: z.string().min(1, "Feeder selection is required."),
  points: z.coerce.number().int().min(0, 'Points cannot be negative.'),
});

interface AddRoundFormProps {
  game: GameWithPlayerNames;
  onSubmit: (round: Omit<Round, 'id' | 'type'>) => void;
  onCancel: () => void;
  initialWinner?: string;
}

export default function AddRoundForm({ game, onSubmit, onCancel, initialWinner }: AddRoundFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      winner: initialWinner || '',
      feeder: 'self-draw',
      points: 0,
    },
  });
  
  const winner = form.watch('winner');

  useEffect(() => {
    if (initialWinner) {
        form.setValue('winner', initialWinner);
    }
  }, [initialWinner, form]);

  function handleFormSubmit(values: z.infer<typeof formSchema>) {
    onSubmit({
      winner: values.winner,
      feeder: values.feeder === 'self-draw' ? undefined : values.feeder,
      points: values.points,
    });
    form.reset({
        winner: '',
        feeder: 'self-draw',
        points: 0,
    });
  }
  
  const feederOptions = useMemo(() => {
    if (!winner) return [];
    return ['self-draw', ...game.playerNames.filter(p => p !== winner)];
  }, [winner, game.playerNames]);

  useEffect(() => {
    const currentFeeder = form.getValues('feeder');
    if (winner && !feederOptions.includes(currentFeeder)) {
        form.setValue('feeder', 'self-draw');
    }
  }, [winner, feederOptions, form]);


  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6 py-4">
        <FormField
          control={form.control}
          name="winner"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Winner</FormLabel>
              <FormControl>
                <PlayerSelect
                  players={game.playerNames}
                  selectedPlayer={field.value}
                  onPlayerSelect={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="feeder"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Feeder / Draw Type</FormLabel>
               <FormControl>
                <PlayerSelect
                    players={feederOptions}
                    selectedPlayer={field.value}
                    onPlayerSelect={field.onChange}
                    disabled={!winner}
                    labels={{'self-draw': 'Self-draw'}}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="points"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Winning Hand Points (Fan)</FormLabel>
              <FormControl>
                <Numpad value={field.value} onChange={field.onChange} onSubmit={form.handleSubmit(handleFormSubmit)} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-2 pt-4 sticky bottom-0 bg-background py-4 px-6 -mx-6">
          <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
          <Button type="submit">Add Round</Button>
        </div>
      </form>
    </Form>
  );
}
