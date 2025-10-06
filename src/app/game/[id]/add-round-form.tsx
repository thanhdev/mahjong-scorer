"use client";

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Game, Round } from '@/lib/types';
import { useEffect } from 'react';

const formSchema = z.object({
  winner: z.string().min(1, 'Winner is required.'),
  feeder: z.string().min(1, "Feeder selection is required."),
  points: z.coerce.number().int().min(0, 'Points cannot be negative.'),
});

interface AddRoundFormProps {
  game: Game;
  onSubmit: (round: Omit<Round, 'id'>) => void;
  onCancel: () => void;
}

export default function AddRoundForm({ game, onSubmit, onCancel }: AddRoundFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      winner: '',
      feeder: '',
      points: 0,
    },
  });

  function handleFormSubmit(values: z.infer<typeof formSchema>) {
    onSubmit({
      winner: values.winner,
      feeder: values.feeder === 'self-draw' ? undefined : values.feeder,
      points: values.points,
    });
    form.reset();
  }
  
  const winner = form.watch('winner');
  const availableFeeders = winner ? game.playerNames.filter(p => p !== winner) : game.playerNames;

  useEffect(() => {
    form.setValue('feeder', '');
  }, [winner, form]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4 py-4">
        <FormField
          control={form.control}
          name="winner"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Winner</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger><SelectValue placeholder="Select a winner" /></SelectTrigger>
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
          name="feeder"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Feeder / Draw Type</FormLabel>
              <Select onValueChange={field.onChange} value={field.value} disabled={!winner}>
                <FormControl>
                  <SelectTrigger><SelectValue placeholder="Select a feeder or self-draw" /></SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="self-draw">Self-draw (Zimo)</SelectItem>
                  {availableFeeders.map(name => (
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
              <FormLabel>Winning Hand Points</FormLabel>
              <FormControl>
                <Input type="number" min="0" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
          <Button type="submit">Add Round</Button>
        </div>
      </form>
    </Form>
  );
}
