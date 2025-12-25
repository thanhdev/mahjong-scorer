
"use client";

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Game, PenaltyRound } from '@/lib/types';
import PlayerSelect from './player-select';
import Numpad from './numpad';

type GameWithPlayerNames = Omit<Game, 'initialPlayerNames'> & { playerNames: string[] };

const formSchema = z.object({
  penalizedPlayer: z.string().min(1, 'A player must be selected.'),
  points: z.coerce.number().int().min(1, 'Penalty points must be at least 1.'),
});

interface AddPenaltyFormProps {
  game: GameWithPlayerNames;
  onSubmit: (penalty: Omit<PenaltyRound, 'id' | 'type'>) => void;
  onCancel: () => void;
}

export default function AddPenaltyForm({ game, onSubmit, onCancel }: AddPenaltyFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      penalizedPlayer: '',
      points: 1,
    },
  });

  function handleFormSubmit(values: z.infer<typeof formSchema>) {
    onSubmit({
      penalizedPlayer: values.penalizedPlayer,
      points: values.points,
    });
    form.reset();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6 py-4">
        <FormField
          control={form.control}
          name="penalizedPlayer"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Player to Penalize</FormLabel>
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
          name="points"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Penalty Points</FormLabel>
              <FormControl>
                 <Numpad value={field.value} onChange={field.onChange} />
              </FormControl>
               <FormMessage />
            </FormItem>
          )}
        />
        <p className="text-sm text-muted-foreground -mt-4">
            The penalized player will pay these points to each other player.
        </p>
        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
          <Button type="submit" variant="destructive">Apply Penalty</Button>
        </div>
      </form>
    </Form>
  );
}
