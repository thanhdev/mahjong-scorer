export type Round = {
  id: string;
  winner: string; // player name
  points: number;
  feeder?: string; // player name, undefined for self-draw
};

export type Game = {
  id: string;
  name: string;
  playerNames: [string, string, string, string];
  basePoints: number;
  rounds: Round[];
  createdAt: string; // ISO date string
};
