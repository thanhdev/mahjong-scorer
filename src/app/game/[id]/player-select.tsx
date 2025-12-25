
"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PlayerSelectProps {
  players: string[];
  selectedPlayer: string;
  onPlayerSelect: (name: string) => void;
  disabled?: boolean;
  labels?: Record<string, string>;
}

export default function PlayerSelect({
  players,
  selectedPlayer,
  onPlayerSelect,
  disabled = false,
  labels = {},
}: PlayerSelectProps) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {players.map(player => (
        <Button
          key={player}
          type="button"
          variant={selectedPlayer === player ? 'default' : 'outline'}
          onClick={() => onPlayerSelect(player)}
          disabled={disabled}
          className={cn("w-full justify-center", selectedPlayer === player && "ring-2 ring-primary ring-offset-2")}
        >
          {labels[player] || player}
        </Button>
      ))}
    </div>
  );
}
