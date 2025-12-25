
"use client";

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Game, SeatChange } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import PlayerSelect from './player-select';

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

  const refinedSchema = formSchema.refine(data => {
    // A player can't join if they are already in the current set of active players.
    return !activePlayers.map(p => p.toLowerCase()).includes(data.playerIn.trim().toLowerCase());
  }, {
    message: "This player is already an active player in the game.",
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
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6 py-4">
        <FormField
          control={form.control}
          name="playerOut"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Player to Leave</FormLabel>
              <FormControl>
                <PlayerSelect
                    players={activePlayers}
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
