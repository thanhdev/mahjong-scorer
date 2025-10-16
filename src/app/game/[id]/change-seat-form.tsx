
"use client";

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Game, SeatChange } from '@/lib/types';
import { getAllPlayerNames } from '@/lib/mahjong';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  playerOut: z.string().min(1, 'A player to replace must be selected.'),
  playerIn: z.string().min(1, 'New player name is required.'),
});

interface ChangeSeatFormProps {
  game: Game;
  activePlayers: string[];
  onSubmit: (seatChange: Omit<SeatChange, 'id' | 'type'>) => void;
  onCancel: () => void;
}

export default function ChangeSeatForm({ game, activePlayers, onSubmit, onCancel }: ChangeSeatFormProps) {
  const { toast } = useToast();
  const allPlayerNames = getAllPlayerNames(game);

  const refinedSchema = formSchema.refine(data => {
    return !allPlayerNames.map(p => p.toLowerCase()).includes(data.playerIn.trim().toLowerCase());
  }, {
    message: "This player name is already in use in this game's history.",
    path: ["playerIn"],
  });

  const form = useForm<z.infer<typeof refinedSchema>>({
    resolver: zodResolver(refinedSchema),
    defaultValues: {
      playerOut: '',
      playerIn: '',
    },
  });

  function handleFormSubmit(values: z.infer<typeof refinedSchema>) {
    const seatIndex = activePlayers.indexOf(values.playerOut);
    
    if (seatIndex === -1) {
        toast({ title: "Error", description: "Selected player is not currently in the game.", variant: "destructive" });
        return;
    }

    onSubmit({
      playerOut: values.playerOut,
      playerIn: values.playerIn.trim(),
      seatIndex,
    });
    form.reset();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4 py-4">
        <FormField
          control={form.control}
          name="playerOut"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Player to Leave</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger><SelectValue placeholder="Select a player" /></SelectTrigger>
                </FormControl>
                <SelectContent>
                  {activePlayers.map(name => (
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
          name="playerIn"
          render={({ field }) => (
            <FormItem>
              <FormLabel>New Player to Join</FormLabel>
              <FormControl>
                <Input placeholder="Enter new player's name" {...field} />
              </FormControl>
               <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
          <Button type="submit">Change Player</Button>
        </div>
      </form>
    </Form>
  );
}
