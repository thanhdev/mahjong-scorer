"use client";

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Game, PenaltyRound } from '@/lib/types';

const formSchema = z.object({
  penalizedPlayer: z.string().min(1, 'A player must be selected.'),
  points: z.coerce.number().int().min(1, 'Penalty points must be at least 1.'),
});

interface AddPenaltyFormProps {
  game: Game;
  onSubmit: (penalty: Omit<PenaltyRound, 'id' | 'type'>) => void;
  onCancel: () => void;
}

export default function AddPenaltyForm({ game, onSubmit, onCancel }: AddPenaltyFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      penalizedPlayer: '',
      points: game.basePoints,
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
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4 py-4">
        <FormField
          control={form.control}
          name="penalizedPlayer"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Player to Penalize</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger><SelectValue placeholder="Select a player" /></SelectTrigger>
                </FormControl>
                <SelectContent>
                  {game.playerNames.map(name => (
                    <SelectItem key={name} value={name}>{name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="points"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Penalty Base Points (x3)</FormLabel>
              <FormControl>
                <Input type="number" min="1" {...field} />
              </FormControl>
               <FormMessage />
            </FormItem>
          )}
        />
        <p className="text-sm text-muted-foreground">
            The penalized player will pay 3 times these points to each other player.
        </p>
        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
          <Button type="submit" variant="destructive">Apply Penalty</Button>
        </div>
      </form>
    </Form>
  );
}
